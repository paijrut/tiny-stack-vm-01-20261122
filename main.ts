import fs from'fs';
const OP=Buffer.from('ABFBBAYKCw///////////wkJCQkJCQkFCQkJBQkJCf8JCQn/////////////////ICQkIAD//////////////wUI//////////////////8EBAEE','base64');
function run(p,inp,d){
let n=p.length,D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),out=new Uint8Array(65536),sp=0,csp=0,o=0,inP=0,pc=0,t=0;
const done=e=>(fs.mkdirSync(d,{recursive:true}),fs.writeFileSync(d+'stdout.bin',out.subarray(0,o)),fs.writeFileSync(d+'exit.txt',e+'\n'));
for(;;){
if(t===1e6)return done(10);
if(pc>>>0>=n)return done(9);
let op=p[pc],c=OP[op]??255;
if(c===255)return done(5);
let imm=c>>4,pops=(c>>2)&3,pushes=c&3,next=pc+1+imm;
if(pc+imm>=n)return done(9);
t++;
if(sp<pops)return done(2);
if(sp-pops+pushes>256)return done(3);
pc=next;
if(op>15&&op<35&&op!==23&&op!==27){
let b=D[--sp],a=D[--sp],u=a>>>0,v=b>>>0;
if(op>18&&op<23&&!b)return done(4);
D[sp++]=op<18?(op===16?a+b:a-b):op===18?Math.imul(a,b):op<21?(op===19?a/b:a%b):op<23?(op===21?u/v:u%v):op<27?(op===24?a&b:op===25?a|b:a^b):op<31?(op===28?a<<b:op===29?a>>b:a>>>b):op===32?+(a===b):op===33?+(a<b):+(u<v);
continue;
}
if(!op||op===83)return done(op?D[--sp]&255:0);
if(op===1||op===2||op===82)D[sp++]=op===1?p.readInt8(next-1):op===2?p.readInt32LE(next-4):inP<inp.length?inp[inP++]:-1;
else if(op===3)sp--;
else if(op===4||op===6)D[sp]=D[sp-(op===4?1:2)],sp++;
else if(op===5)[D[sp-1],D[sp-2]]=[D[sp-2],D[sp-1]];
else if(op===7)[D[sp-3],D[sp-2],D[sp-1]]=[D[sp-2],D[sp-1],D[sp-3]];
else if(op===23||op===27)D[sp-1]=op===23?-D[sp-1]:~D[sp-1];
else if(op>47&&op<51&&(op===48||(op===49?!D[--sp]:D[--sp])))pc=next+p.readInt16LE(next-2);
else if(op===51){if(csp===64)return done(7);C[csp++]=next;pc=p.readUInt16LE(next-2);}
else if(op===52){if(!csp)return done(8);pc=C[--csp];}
else if(op>63&&op<66){let a=D[--sp];if(a>>>8)return done(6);op===64?D[sp++]=M[a]:M[a]=D[--sp];}
else if(op===80||op===81){let b=op===80?Buffer.from(''+D[--sp]):[D[--sp]];if(o+b.length>65536)return done(11);out.set(b,o);o+=b.length;}
}
}
let{MAKEFUN_INPUT_DIR:I='/input',MAKEFUN_OUTPUT_DIR:O='/output'}=process.env;
for(let id of fs.readdirSync(I).sort())run(fs.readFileSync(I+`/${id}/program.bin`),fs.readFileSync(I+`/${id}/input.bin`),O+`/${id}/`);
