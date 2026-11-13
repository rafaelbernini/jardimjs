/* Integração com a API; o código do aluno executa apenas no Web Worker. */
window.JardimCloud=(()=>{
 let token=localStorage.getItem('jardimjs_token_v3')||'';
 let ready=false,pending=null,clock=null,queue=Promise.resolve(),lastError='';
 const info=document.createElement('div');info.id='cloudInfo';info.setAttribute('role','status');
 info.style.cssText='position:fixed;right:12px;bottom:10px;z-index:40;background:#143e2c;color:#fff;padding:8px 12px;border-radius:9px;font:12px system-ui;box-shadow:0 4px 18px #0003;max-width:280px';
 document.addEventListener('DOMContentLoaded',()=>{document.body.append(info);setStatus('Conectando ao banco...')});
 function setStatus(s,failed=false){lastError=failed?s:'';info.textContent=s;info.style.background=failed?'#963b25':'#143e2c'}
 async function request(path,method='GET',payload){
   const r=await fetch('/api'+path,{method,credentials:'same-origin',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(payload?{'Content-Type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined});
   const body=await r.json().catch(()=>({error:'Resposta inválida do servidor'}));if(!r.ok)throw new Error(body.error||'Falha HTTP '+r.status);return body;
 }
 async function register(student){
   const response=await request('/student/register','POST',student);token=response.token;localStorage.setItem('jardimjs_token_v3',token);ready=true;setStatus('● Progresso conectado ao SQLite');return response;
 }
 async function resume(){
   if(!token){ready=true;setStatus('Identifique-se para salvar online');return null}
   try{const response=await request('/student/progress');ready=true;setStatus('● Progresso recuperado do SQLite');return response}
   catch(e){ready=true;setStatus('⚠ '+e.message,true);return null}
 }
 function schedule(state){
   if(!ready||!token)return;
   pending=state;clearTimeout(clock);clock=setTimeout(()=>{flush().catch(()=>{})},1800);
 }
 async function flush(){
   clearTimeout(clock);if(!pending||!token)return;
   const current=pending;pending=null;
   queue=queue.catch(()=>{}).then(()=>request('/student/progress','PUT',{progress:current})).then(()=>{setStatus('✓ Progresso salvo no banco')}).catch(e=>{if(!pending)pending=current;setStatus('⚠ Não foi possível sincronizar: '+e.message,true);throw e});
   return queue;
 }
 function attempt(row){if(!token)return;queue=queue.catch(()=>{}).then(()=>request('/student/attempt','POST',{...row,id:crypto.randomUUID()})).catch(e=>{setStatus('⚠ Falha ao registrar tentativa: '+e.message,true)});}
 async function receipt(){await flush();await queue;return request('/student/receipt')}
 async function finalize(state){pending=state;await flush();const r=await request('/student/finalize','POST',{progress:state});setStatus('✓ Entrega finalizada no banco');return r}
 function reset(){token='';ready=true;pending=null;clearTimeout(clock);localStorage.removeItem('jardimjs_token_v3');setStatus('Novo aluno: faça sua identificação')}
 window.addEventListener('online',()=>{if(pending)flush().catch(()=>{})});
 return {register,resume,schedule,flush,attempt,receipt,finalize,reset,setStatus,get hasToken(){return !!token},get lastError(){return lastError}};
})();
