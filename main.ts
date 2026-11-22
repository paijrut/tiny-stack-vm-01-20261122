import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const S = 256, C = 64, L = 1e6, O = 65536;
const OPS: Record<number, readonly [number, number, number]> = {
  0: [0, 0, 0], 1: [1, 0, 1], 2: [4, 0, 1], 3: [0, 1, 0], 4: [0, 1, 2], 5: [0, 2, 2], 6: [0, 2, 3], 7: [0, 3, 3],
  16: [0, 2, 1], 17: [0, 2, 1], 18: [0, 2, 1], 19: [0, 2, 1], 20: [0, 2, 1], 21: [0, 2, 1], 22: [0, 2, 1], 23: [0, 1, 1],
  24: [0, 2, 1], 25: [0, 2, 1], 26: [0, 2, 1], 27: [0, 1, 1], 28: [0, 2, 1], 29: [0, 2, 1], 30: [0, 2, 1], 32: [0, 2, 1],
  33: [0, 2, 1], 34: [0, 2, 1], 48: [2, 0, 0], 49: [2, 1, 0], 50: [2, 1, 0], 51: [2, 0, 0], 52: [0, 0, 0], 64: [0, 1, 1],
  65: [0, 2, 0], 80: [0, 1, 0], 81: [0, 1, 0], 82: [0, 0, 1], 83: [0, 1, 0]
};
const enc = new TextEncoder();

export function run(p: Uint8Array, inp: Uint8Array): { stdout: Uint8Array; exit: number } {
  const n = p.length, D = new Int32Array(S), CS = new Int32Array(C), M = new Int32Array(S), out = new Uint8Array(O);
  let sp = 0, csp = 0, olen = 0, inPos = 0, pc = 0, steps = 0;
  const done = (exit: number) => ({ stdout: out.subarray(0, olen), exit });

  for (;;) {
    if (steps === L) return done(10);
    if (pc < 0 || pc >= n) return done(9);
    const op = p[pc], spec = OPS[op];
    if (!spec) return done(5);
    const [imm, pops, pushes] = spec;
    if (pc + imm >= n) return done(9);
    steps++;
    const next = pc + 1 + imm;
    if (sp < pops) return done(2);
    if (sp - pops + pushes > S) return done(3);
    pc = next;

    if (op >= 16 && op <= 34 && op !== 23 && op !== 27) {
      const b = D[sp - 1], a = D[sp - 2];
      if (op >= 19 && op <= 22 && !b) return done(4);
      const r = op === 16 ? a + b :
        op === 17 ? a - b :
        op === 18 ? Math.imul(a, b) :
        op === 19 ? (a === -2147483648 && b === -1 ? a : (a / b) | 0) :
        op === 20 ? (b === -1 ? 0 : (a % b) | 0) :
        op === 21 ? Math.floor((a >>> 0) / (b >>> 0)) :
        op === 22 ? (a >>> 0) % (b >>> 0) :
        op === 24 ? a & b :
        op === 25 ? a | b :
        op === 26 ? a ^ b :
        op === 28 ? a << (b & 31) :
        op === 29 ? a >> (b & 31) :
        op === 30 ? a >>> (b & 31) :
        op === 32 ? (a === b ? 1 : 0) :
        op === 33 ? (a < b ? 1 : 0) :
        ((a >>> 0) < (b >>> 0) ? 1 : 0);
      sp -= 2;
      D[sp++] = r | 0;
      continue;
    }

    switch (op) {
      case 0: return done(0);
      case 1: D[sp++] = (p[next - 1] << 24) >> 24; break;
      case 2: D[sp++] = p[next - 4] | (p[next - 3] << 8) | (p[next - 2] << 16) | (p[next - 1] << 24); break;
      case 3: sp--; break;
      case 4: D[sp] = D[sp - 1]; sp++; break;
      case 5: { const t = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = t; break; }
      case 6: D[sp] = D[sp - 2]; sp++; break;
      case 7: { const a = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = a; break; }
      case 23: D[sp - 1] = -D[sp - 1] | 0; break;
      case 27: D[sp - 1] = ~D[sp - 1]; break;
      case 48:
      case 49:
      case 50: {
        const rel = ((p[next - 2] | (p[next - 1] << 8)) << 16) >> 16;
        let take = true;
        if (op !== 48) { const v = D[--sp]; take = op === 49 ? v === 0 : v !== 0; }
        if (take) pc = next + rel;
        break;
      }
      case 51:
        if (csp === C) return done(7);
        CS[csp++] = next;
        pc = p[next - 2] | (p[next - 1] << 8);
        break;
      case 52:
        if (!csp) return done(8);
        pc = CS[--csp];
        break;
      case 64: {
        const addr = D[sp - 1];
        if (addr < 0 || addr >= S) return done(6);
        D[sp - 1] = M[addr];
        break;
      }
      case 65: {
        const addr = D[sp - 1], v = D[sp - 2];
        if (addr < 0 || addr >= S) return done(6);
        sp -= 2;
        M[addr] = v;
        break;
      }
      case 80: {
        const bytes = enc.encode(String(D[sp - 1]));
        if (olen + bytes.length > O) return done(11);
        sp--;
        out.set(bytes, olen);
        olen += bytes.length;
        break;
      }
      case 81:
        if (olen + 1 > O) return done(11);
        out[olen++] = D[--sp] & 255;
        break;
      case 82:
        D[sp++] = inPos < inp.length ? inp[inPos++] : -1;
        break;
      case 83:
        return done(D[--sp] & 255);
    }
  }
}

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const Out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  const r = run(new Uint8Array(readFileSync(join(I, id, 'program.bin'))), new Uint8Array(readFileSync(join(I, id, 'input.bin'))));
  mkdirSync(join(Out, id), { recursive: true });
  writeFileSync(join(Out, id, 'stdout.bin'), r.stdout);
  writeFileSync(join(Out, id, 'exit.txt'), `${r.exit}\n`);
}
