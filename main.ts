import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const S = 256, C = 64, L = 1e6, O = 65536;
const T: Record<number, number> = {
  0: 0, 1: 17, 2: 65, 3: 4, 4: 6, 5: 10, 6: 11, 7: 15,
  16: 9, 17: 9, 18: 9, 19: 9, 20: 9, 21: 9, 22: 9, 23: 5,
  24: 9, 25: 9, 26: 9, 27: 5, 28: 9, 29: 9, 30: 9, 32: 9,
  33: 9, 34: 9, 48: 32, 49: 36, 50: 36, 51: 32, 52: 0, 64: 5,
  65: 8, 80: 4, 81: 4, 82: 1, 83: 4
};
const enc = new TextEncoder();

export function run(p: Uint8Array, inp: Uint8Array): { stdout: Uint8Array; exit: number } {
  const n = p.length, D = new Int32Array(S), CS = new Int32Array(C), M = new Int32Array(S), out = new Uint8Array(O);
  let sp = 0, csp = 0, olen = 0, inPos = 0, pc = 0, steps = 0;
  const done = (exit: number) => ({ stdout: out.subarray(0, olen), exit });

  for (;;) {
    if (steps === L) return done(10);
    if (pc < 0 || pc >= n) return done(9);
    const op = p[pc], c = T[op];
    if (c === undefined) return done(5);
    const imm = c >> 4, pops = (c >> 2) & 3, pushes = c & 3;
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
        if (op === 48 || (op === 49 ? !D[--sp] : !!D[--sp])) pc = next + rel;
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
      case 64:
      case 65: {
        const addr = D[sp - 1];
        if (addr < 0 || addr >= S) return done(6);
        if (op === 64) D[sp - 1] = M[addr];
        else { M[addr] = D[sp - 2]; sp -= 2; }
        break;
      }
      case 80: {
        const b = enc.encode(String(D[--sp]));
        if (olen + b.length > O) return done(11);
        out.set(b, olen);
        olen += b.length;
        break;
      }
      case 81:
        if (olen >= O) return done(11);
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
