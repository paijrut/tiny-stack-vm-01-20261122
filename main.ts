import fs from'fs';
let n,sp,csp,o,inP,pc,t,op,c,imm,pops,pushes,next,a,b,u,v,b8,A=new Int32Array(576),O=new Uint8Array(65536),
OP=Buffer.from('ABFBBAYKCw///////////wkJCQkJCQkFCQkJBQkJCf8JCQn/////////////////ICQkIAD//////////////wUI//////////////////8EBAEE','base64'),
run=(p,inp,d)=>{
A.fill(0);
sp=csp=o=inP=pc=t=0,n=p.length;
let done=e=>(fs.writeFileSync(d+'stdout.bin',O.subarray(0,o)),fs.writeFileSync(d+'exit.txt',e+'\n'));
for(;;){
if(t===1e6)return done(10);
if(pc>>>0>=n)return done(9);
op=p[pc],c=OP[op]??255;
if(c===255)return done(5);
imm=c>>4,pops=(c>>2)&3,pushes=c&3,next=pc+1+imm;
if(pc+imm>=n)return done(9);
t++;
if(sp<pops)return done(2);
if(sp-pops+pushes>256)return done(3);
pc=next;
if(op>15&&op<35&&op!==23&&op!==27){
b=A[--sp],a=A[--sp],u=a>>>0,v=b>>>0;
if(op>18&&op<23&&!b)return done(4);
A[sp++]=op<18?(op===16?a+b:a-b):op===18?Math.imul(a,b):op<21?(op===19?a/b:a%b):op<23?(op===21?u/v:u%v):op<27?(op===24?a&b:op===25?a|b:a^b):op<31?(op===28?a<<b:op===29?a>>b:a>>>b):op===32?+(a===b):op===33?+(a<b):+(u<v);
continue;
}
if(!op||op===83)return done(op?A[--sp]&255:0);
if(op===1||op===2||op===82)A[sp++]=op===1?p.readInt8(next-1):op===2?p.readInt32LE(next-4):inP<inp.length?inp[inP++]:-1;
else if(op===3)sp--;
else if(op===4||op===6)A[sp]=A[sp-(op===4?1:2)],sp++;
else if(op===5)[A[sp-1],A[sp-2]]=[A[sp-2],A[sp-1]];
else if(op===7)[A[sp-3],A[sp-2],A[sp-1]]=[A[sp-2],A[sp-1],A[sp-3]];
else if(op===23||op===27)A[sp-1]=op===23?-A[sp-1]:~A[sp-1];
else if(op>47&&op<51&&(op===48||(op===49?!A[--sp]:A[--sp])))pc=next+p.readInt16LE(next-2);
else if(op===51){if(csp===64)return done(7);A[512+csp++]=next;pc=p.readUInt16LE(next-2);}
else if(op===52){if(!csp)return done(8);pc=A[512+--csp];}
else if(op>63&&op<66){a=A[--sp];if(a>>>8)return done(6);op===64?A[sp++]=A[256+a]:A[256+a]=A[--sp];}
else if(op===80||op===81){b8=op===80?Buffer.from(''+A[--sp]):[A[--sp]];if(o+b8.length>65536)return done(11);O.set(b8,o);o+=b8.length;}
}
},
{MAKEFUN_INPUT_DIR:I='/input',MAKEFUN_OUTPUT_DIR:Out='/output'}=process.env;
for(let id of fs.readdirSync(I).sort()){let d=Out+`/${id}/`;fs.mkdirSync(d,{recursive:true});run(fs.readFileSync(I+`/${id}/program.bin`),fs.readFileSync(I+`/${id}/input.bin`),d);}
