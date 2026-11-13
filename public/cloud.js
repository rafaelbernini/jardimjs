/* Persistência local: sem API ou credenciais. */
window.JardimCloud=(()=>{
 const KEY='jardimjs_sessao_local_v1';let session=null,lastError='';
 const info=document.createElement('div');info.id='cloudInfo';info.setAttribute('role','status');
 info.style.cssText='position:fixed;right:12px;bottom:10px;z-index:40;background:#143e2c;color:#fff;padding:8px 12px;border-radius:9px;font:12px system-ui;max-width:300px';
 function setStatus(message,failed=false){lastError=failed?message:'';info.textContent=message;info.style.background=failed?'#963b25':'#143e2c'}
 try{session=JSON.parse(localStorage.getItem(KEY)||'null');if(!session){const legacy=JSON.parse(localStorage.getItem('jardimjs_aluno_v3')||'null');if(legacy?.student){session={id:legacy.deliveryId||crypto.randomUUID(),aluno:legacy.student,createdAt:legacy.startedAt||new Date().toISOString(),progress:legacy,attempts:[],finalizedAt:null};localStorage.setItem(KEY,JSON.stringify(session))}}}catch{setStatus('Não foi possível ler o armazenamento local.',true)}
 document.addEventListener('DOMContentLoaded',()=>{document.body.append(info);if(!lastError)setStatus('Dados salvos somente neste navegador')});
 function persist(next){try{localStorage.setItem(KEY,JSON.stringify(next));session=next;setStatus('✓ Salvo neste navegador')}catch{const message='Não foi possível salvar neste navegador. Libere o armazenamento ou baixe seu relatório antes de sair.';setStatus(message,true);throw Error(message)}}
 async function register(aluno){const id=crypto.randomUUID();persist({id,aluno,createdAt:new Date().toISOString(),progress:{},attempts:[],finalizedAt:null});return {id,aluno}}
 async function resume(){return session}
 function schedule(progress){if(!session||session.finalizedAt)return;try{persist({...session,progress:structuredClone(progress)})}catch{}}
 async function flush(){if(lastError)throw Error(lastError)}
 function attempt(row){if(!session||session.finalizedAt)return;try{persist({...session,attempts:[...session.attempts,{...row,id:crypto.randomUUID(),created_at:new Date().toISOString(),error_text:row.error||''}]})}catch{}}
 async function receipt(){await flush();if(!session)throw Error('Identifique-se primeiro.');return {formato:'JARDIMJS_LOCAL_V1',idEntrega:session.id,aluno:session.aluno,criadoEm:session.createdAt,finalizadoEm:session.finalizedAt,progresso:session.progress,tentativasRegistradas:session.attempts}}
 async function finalize(progress){if(!session)throw Error('Identifique-se primeiro.');if(new Set(progress.solved).size!==24)throw Error('Conclua as 24 fases.');persist({...session,progress:structuredClone(progress),finalizedAt:session.finalizedAt||new Date().toISOString()});return {finalizedAt:session.finalizedAt}}
 function reset(){localStorage.removeItem(KEY);session=null;setStatus('Novo aluno: faça sua identificação')}
 return {register,resume,schedule,flush,attempt,receipt,finalize,reset,setStatus,get hasToken(){return !!session},get lastError(){return lastError}};
})();
