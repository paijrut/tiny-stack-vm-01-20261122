import fs from'fs';
let n,sp,csp,o,inP,pc,t,op,c,imm,pops,pushes,next,a,b,u,v,b8,
A=new Int32Array(576),O=new Uint8Array(65536),
OP=Buffer.from('ABFBBAYKCw///////////wkJCQkJCQkFCQkJBQkJCf8JCQn/////////////////ICQkIAD//////////////wUI//////////////////8EBAEE','base64'),
run=(p,inp,d)=>{
A.fill(0);
sp=csp=o=inP=pc=t=0,n=p.length;
try{
for(;;){
if(t===1e6)throw 10;
if(pc>>>0>=n)throw 9;
op=p[pc],c=OP[op]??255;
if(c===255)throw 5;
imm=c>>4,pops=(c>>2)&3,pushes=c&3,next=pc+1+imm;
if(pc+imm>=n)throw 9;
t++;
if(sp<pops)throw 2;
if(sp-pops+pushes>256)throw 3;
pc=next;
if(op>15&&op<35&&op!==23&&op!==27){
b=A[--sp],a=A[--sp],u=a>>>0,v=b>>>0;
if(op>18&&op<23&&!b)throw 4;
A[sp++]=op<18?(op===16?a+b:a-b):op===18?Math.imul(a,b):op<21?(op===19?a/b:a%b):op<23?(op===21?u/v:u%v):op<27?(op===24?a&b:op===25?a|b:a^b):op<31?(op===28?a<<b:op===29?a>>b:a>>>b):op===32?+(a===b):op===33?+(a<b):+(u<v);
continue;
}
switch(op){
case 0:case 83:throw op?A[--sp]&255:0;
case 1:case 2:case 82:A[sp++]=op===1?p.readInt8(next-1):op===2?p.readInt32LE(next-4):inP<inp.length?inp[inP++]:-1;break;
case 3:sp--;break;
case 4:case 6:A[sp]=A[sp-(op===4?1:2)],sp++;break;
case 5:a=A[sp-1],A[sp-1]=A[sp-2],A[sp-2]=a;break;
case 7:a=A[sp-3],A[sp-3]=A[sp-2],A[sp-2]=A[sp-1],A[sp-1]=a;break;
case 23:case 27:A[sp-1]=op===23?-A[sp-1]:~A[sp-1];break;
case 48:case 49:case 50:if(op===48?!0:op===49?!A[--sp]:A[--sp])pc=next+p.readInt16LE(next-2);break;
case 51:if(csp===64)throw 7;A[512+csp++]=next;pc=p.readUInt16LE(next-2);break;
case 52:if(!csp)throw 8;pc=A[512+--csp];break;
case 64:case 65:a=A[--sp];if(a>>>8)throw 6;op===64?A[sp++]=A[256+a]:A[256+a]=A[--sp];break;
case 80:case 81:b8=op===80?Buffer.from(''+A[--sp]):[A[--sp]];if(o+b8.length>65536)throw 11;O.set(b8,o);o+=b8.length;
}
}
}catch(e){
fs.writeFileSync(d+'stdout.bin',O.subarray(0,o));
fs.writeFileSync(d+'exit.txt',e+'\n');
}
},
{MAKEFUN_INPUT_DIR:I='/input',MAKEFUN_OUTPUT_DIR:Out='/output'}=process.env;
for(let id of fs.readdirSync(I).sort()){let d=Out+'/'+id+'/',p=I+'/'+id+'/';fs.mkdirSync(d,{recursive:true});run(fs.readFileSync(p+'program.bin'),fs.readFileSync(p+'input.bin'),d);}
