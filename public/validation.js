/* Verificação didática de conceitos. A execução e os objetivos são verificados pelo jogo. */
window.JardimSyntax=(()=>{
 function tokens(code){
  const out=[];let i=0;
  while(i<code.length){
   const c=code[i],next=code[i+1];
   if(/\s/.test(c)){i++;continue}
   if(c==='/'&&next==='/'){while(i<code.length&&code[i]!=='\n')i++;continue}
   if(c==='/'&&next==='*'){i+=2;while(i<code.length&&!(code[i]==='*'&&code[i+1]==='/'))i++;i+=2;continue}
   if(c==='"'||c==="'"||c==='`'){
    const quote=c;i++;
    while(i<code.length){if(code[i]==='\\'){i+=2;continue}if(code[i++]===quote)break}
    out.push('#literal');continue;
   }
   // Expressões regulares não devem contar como comandos ou comentários.
   if(c==='/'&&(!out.length||['=','(','[',',',':','return','!','&&','||','=>'].includes(out.at(-1)))){
    i++;let bracket=false;
    while(i<code.length){const ch=code[i++];if(ch==='\\'){i++;continue}if(ch==='[')bracket=true;if(ch===']')bracket=false;if(ch==='/'&&!bracket)break}
    while(i<code.length&&/[a-z]/i.test(code[i]))i++;
    out.push('#literal');continue;
   }
   if(/[\p{ID_Start}$_]/u.test(c)){
    const start=i++;while(i<code.length&&/[\p{ID_Continue}$]/u.test(code[i]))i++;
    out.push(code.slice(start,i));continue;
   }
   const operator=code.slice(i,i+2);
   if(['=>','&&','||'].includes(operator)){out.push(operator);i+=2;continue}
   out.push(c);i++;
  }
  return out;
 }
 function check(code,required){
  const t=tokens(code),has=(word,next)=>t.some((v,i)=>v===word&&t[i-1]!=='.'&&(!next||t[i+1]===next));
  function end(start,open='(',close=')'){
   let depth=0;for(let i=start;i<t.length;i++){if(t[i]===open)depth++;if(t[i]===close&&!--depth)return i}return -1;
  }
  const functions=[],loops=[];
  for(let i=0;i<t.length;i++){
   if(t[i]==='function'){
    let p=i+1;if(t[p]==='*')p++;if(t[p]!=='(')p++;
    if(t[p]==='(')functions.push([p,end(p)]);
   }
   if(t[i]==='for'&&t[i+1]==='('){const headerEnd=end(i+1);const block=headerEnd+1;loops.push({start:i,headerEnd,bodyEnd:t[block]==='{'?end(block,'{','}'):block});}
  }
  const arrow=t.includes('=>');
  const present={
   argumento:t.some((v,i)=>['direita','esquerda','cima','baixo'].includes(v)&&t[i+1]==='('&&t[i+2]!==')'),
   const:has('const'),let:has('let'),if:has('if','('),else:has('else'),and:t.includes('&&'),
   for:loops.length>0,while:has('while','('),function:functions.length>0||arrow,
   parameter:functions.some(([a,b])=>b>a+1)||t.some((v,i)=>v==='=>'&&(t[i-1]!==')'||t[i-2]!=='(')),
   array:t.some((v,i)=>v==='['&&['=', 'return','(', ',',':','['].includes(t[i-1])),
   forof:loops.some(l=>t.slice(l.start+2,l.headerEnd).includes('of')),
   nestedfor:loops.some(outer=>loops.some(inner=>inner.start>outer.headerEnd&&inner.start<outer.bodyEnd)),
   return:has('return'),length:t.some((v,i)=>v==='length'&&t[i-1]==='.')
  };
  return required.filter(key=>!present[key]);
 }
 return {check};
})();
