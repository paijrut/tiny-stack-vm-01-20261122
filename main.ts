import fs from'fs';
let n,sp,csp,o,inP,pc,t,op,c,a,b,u,v,
A=new Int32Array(576),O=new Uint8Array(65536),
S='\x245e(*./3        -------)---)--- ---             DHHD\x24           ),              ((%(',
run=(p,inp,d)=>{
A.fill(sp=csp=o=inP=pc=t=0);n=p.length;
try{
for(;;){
if(t++===1e6)throw 10;
if(pc>>>0>=n)throw 9;
if(!((c=S.charCodeAt(op=p[pc])-36)>=0))throw 5;
if(pc+(c>>4)>=n)throw 9;
if(sp<(a=c>>2&3))throw 2;
if(sp-a+(c&3)>256)throw 3;
pc+=1+(c>>4);
if(c===9){
b=A[--sp],a=A[--sp],u=a>>>0,v=b>>>0;
if(op>18&&op<23&&!b)throw 4;
A[sp++]=[a+b,a-b,Math.imul(a,b),a/b,a%b,u/v,u%v,0,a&b,a|b,a^b,0,a<<b,a>>b,a>>>b,0,+(a==b),+(a<b),+(u<v)][op-16];
continue;
}
switch(op){
case 0:case 83:throw op?A[--sp]&255:0;
case 1:case 2:case 82:A[sp++]=op<2?p[pc-1]<<24>>24:op<3?p.readInt32LE(pc-4):inP<inp.length?inp[inP++]:-1;break;
case 3:sp--;break;
case 4:case 6:A[sp++]=A[sp-(op>>1)];break;
case 5:a=A[sp-1],A[sp-1]=A[sp-2],A[sp-2]=a;break;
case 7:a=A[sp-3],A[sp-3]=A[sp-2],A[sp-2]=A[sp-1],A[sp-1]=a;break;
case 23:case 27:A[sp-1]=op&4?-A[sp-1]:~A[sp-1];break;
case 48:case 49:case 50:if(op<49||(op&1?!A[--sp]:A[--sp]))pc+=p.readInt16LE(pc-2);break;
case 51:if(csp>63)throw 7;A[512+csp++]=pc,pc=p.readUInt16LE(pc-2);break;
case 52:if(!csp)throw 8;pc=A[512+--csp];break;
case 64:case 65:a=A[--sp];if(a>>>8)throw 6;op&1?A[256+a]=A[--sp]:A[sp++]=A[256+a];break;
case 80:case 81:b=op<81?Buffer.from(''+A[--sp]):[A[--sp]];if(o+b.length>65536)throw 11;O.set(b,o),o+=b.length;
}
}
}catch(e){
fs.writeFileSync(d+'stdout.bin',O.subarray(0,o));
fs.writeFileSync(d+'exit.txt',e+'\n');
}
},
{MAKEFUN_INPUT_DIR:I='/input',MAKEFUN_OUTPUT_DIR:W='/output'}=process.env;
for(let id of fs.readdirSync(I)){let d=W+'/'+id+'/',R=f=>fs.readFileSync(I+'/'+id+'/'+f);fs.mkdirSync(d,{recursive:!0});run(R('program.bin'),R('input.bin'),d);}
