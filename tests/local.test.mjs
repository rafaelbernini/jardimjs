import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';

const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
class Element {
 constructor(){this.children=[];this.listeners={};this.style={};this.value='';this.textContent='';this.firstChild={textContent:''};this.classList={add(){},remove(){},toggle(){}};this.disabled=false;this.open=false;}
 setAttribute(){} append(...nodes){this.children.push(...nodes)} replaceChildren(...nodes){this.children=nodes}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
 async fire(name,event={}){for(const fn of this.listeners[name]||[])await fn({preventDefault(){},...event})}
 showModal(){this.open=true} close(){this.open=false} focus(){} scrollIntoView(){} remove(){} click(){return this.fire('click')}
 insertCell(){const cell=new Element();this.append(cell);return cell}
}
function browser(storage=new Map()){
 const nodes=new Map(),blobs=new Map(),downloads=[];let blocked=false;
 const document={body:new Element(),visibilityState:'visible',createElement:()=>new Element(),addEventListener(){},querySelector(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id)},getElementById(id){return this.querySelector('#'+id)}};
 const context=vm.createContext({document,console,crypto:{randomUUID},structuredClone,performance,Blob:class {constructor(parts){this.source=parts.join('')}},URL:{createObjectURL(blob){const id=randomUUID();blobs.set(id,blob);return id},revokeObjectURL(id){blobs.delete(id)}},setTimeout:(fn,ms)=>setTimeout(fn,ms===3500?ms:0),clearTimeout,setInterval(){},alert(){},confirm:()=>true,prompt:()=>'',location:{search:''},Option:class extends Element{constructor(label,value){super();this.textContent=label;this.value=value}},localStorage:{getItem:k=>storage.get(k)??null,setItem(k,v){if(blocked)throw Error('quota');storage.set(k,v)},removeItem:k=>storage.delete(k)},fetch(){throw Error('Network access is forbidden in local mode')}});
 context.window=context;context.addEventListener=()=>{};
 context.Worker=class {constructor(url){this.source=blobs.get(url).source}postMessage(data){const self={postMessage:result=>queueMicrotask(()=>this.onmessage({data:result}))};vm.runInNewContext(this.source,{self});self.onmessage({data})}terminate(){}};
 const create=context.URL.createObjectURL;context.URL.createObjectURL=blob=>{downloads.push(blob.source);return create(blob)};
 return {context,storage,nodes,downloads,el:id=>document.querySelector('#'+id),run:p=>vm.runInContext(source(p),context),block:()=>{blocked=true}};
}
const json=x=>JSON.parse(JSON.stringify(x));
const progress={solved:[1],code:{1:'direita(2);'},last:1,activeMs:1000,perLevel:{1:{attempts:1,totalMoves:2,bestCode:'direita(2);'}}};

test('local registration, persistence, attempts, completion and reload without network',async()=>{
 const b=browser();b.run('public/cloud.js');const api=b.context.JardimCloud;
 const reg=await api.register({nome:'Aluno Teste',turma:'A',numero:'1'});
 api.schedule(progress);api.attempt({level:1,success:true,code:'direita(2);',moves:2});
 const receipt=await api.receipt();assert.equal(receipt.idEntrega,reg.id);assert.equal(receipt.tentativasRegistradas.length,1);
 await assert.rejects(api.finalize(progress));
 const full={...progress,solved:Array.from({length:24},(_,i)=>i+1)};
 await api.finalize(full);api.schedule(progress);
 const reload=browser(b.storage);reload.run('public/cloud.js');
 const session=await reload.context.JardimCloud.resume();assert.ok(session.finalizedAt);assert.equal(session.progress.solved.length,24);
 reload.context.JardimCloud.reset();assert.equal(await reload.context.JardimCloud.resume(),null);
});

test('storage failures are reported and registration is not silently accepted',async()=>{
 const b=browser();b.run('public/cloud.js');b.block();await assert.rejects(b.context.JardimCloud.register({nome:'Aluno',turma:'A'}));assert.ok(b.context.JardimCloud.lastError);
});

test('legacy browser progress migrates to local session',async()=>{
 const b=browser(new Map([['jardimjs_aluno_v3',JSON.stringify({...progress,student:{nome:'Aluno',turma:'A'},deliveryId:'antigo'})]]));b.run('public/cloud.js');
 const session=await b.context.JardimCloud.resume();assert.equal(session.id,'antigo');assert.deepEqual(json(session.progress.solved),[1]);
});

test('teacher imports, evaluates, deduplicates, exports and restores backups',async()=>{
 const student=browser();student.run('public/cloud.js');await student.context.JardimCloud.register({nome:'=Aluno',turma:'A',numero:'1'});student.context.JardimCloud.schedule(progress);
 const receipt=json(await student.context.JardimCloud.receipt());
 const b=browser();b.run('public/professor/local-data.js');const api=b.context.JardimTeacher;
 api.importFiles([receipt]);const id=receipt.idEntrega;
 await api.request('student/'+id+'/assessment','POST',{grade:85.5,feedback:'Ótimo'});api.importFiles([receipt]);
 const rows=await api.request('students');assert.equal(rows.students.length,1);assert.equal(rows.students[0].assessment.grade,85.5);assert.match(api.csv(),/'=Aluno/);assert.match(api.csv(),/85.5/);
 const other=browser();other.run('public/professor/local-data.js');other.context.JardimTeacher.importFiles(json(api.backup()));assert.equal((await other.context.JardimTeacher.request('student/'+id)).assessment.feedback,'Ótimo');
 assert.throws(()=>api.importFiles([receipt,{formato:'invalido'}]));assert.equal(api.backup().length,1);
 await assert.rejects(api.request('student/'+id+'/assessment','POST',{grade:101,feedback:''}));
 b.run('public/professor/admin.js');await new Promise(r=>setImmediate(r));assert.equal(b.el('results').children.length,1);
 await api.request('student/'+id,'DELETE');assert.equal(api.backup().length,0);
});

test('teacher accepts the summary report with all 24 phase metrics',()=>{
 const b=browser();b.run('public/professor/local-data.js');const api=b.context.JardimTeacher;
 const record={formato:'JARDIMJS_ENTREGA_V2',idEntrega:'resumo',aluno:{nome:'Aluno',turma:'B'},tempoAtivoTotalSegundos:10,fases:Array.from({length:24},(_,i)=>({fase:i+1,concluida:i===0,tentativas:i===0?2:0,codigoEntregue:'direita();',tempoAtivoSegundos:0}))};
 api.importFiles([record]);assert.equal(api.backup()[0].student.fases,1);assert.equal(api.backup()[0].student.tentativas,2);assert.equal(api.backup()[0].progress.code[1],'direita();');
});

function solution(level){
 let pos=level.start;const code=[];const rocks=new Set(level.rocks.map(p=>p.join(',')));
 for(const [target,action]of [...level.batteries.map(p=>[p,'coletar();']),...level.switches.map(p=>[p,'ativar();']),[level.goal,'']]){
  const queue=[[pos,[]]],seen=new Set([pos.join(',')]);let found=false;
  while(queue.length){const [p,path]=queue.shift();if(p.join(',')===target.join(',')){code.push(...path,action);pos=target;found=true;break}
   for(const [dx,dy,cmd]of [[1,0,'direita'],[-1,0,'esquerda'],[0,1,'baixo'],[0,-1,'cima']]){const n=[p[0]+dx,p[1]+dy],key=n.join(',');if(n[0]<0||n[0]>6||n[1]<0||n[1]>4||rocks.has(key)||seen.has(key))continue;seen.add(key);queue.push([n,[...path,cmd+'(1);']])}
  }assert.ok(found,'reachable target in phase '+level.id);
 }
 if(level.id>24){
  const route=code.filter(Boolean).map(command=>command.split('(')[0]);
  return `const plano=${JSON.stringify(route)};
   function navegar(acoes){
    for(const acao of acoes){let restante=1;while(restante>0){
     if(acao==='coletar'&&bateriaAqui()){coletar();}
     else if(acao==='ativar'&&painelAqui()){ativar();}
     else if(acao==='direita'){direita();}else if(acao==='esquerda'){esquerda();}
     else if(acao==='cima'){cima();}else if(acao==='baixo'){baixo();}
     restante--;
    }}return acoes.length;
   }
   for(let grupo=0;grupo<1;grupo++){for(let vez=0;vez<1;vez++){navegar(plano);}}`;
 }
 return 'const arr=[1]; let value=1; if(value && arr.length){value=1;}else{value=0;} for(let i=0;i<0;i++){} while(false){} function exemplo(p){} for(const n of arr){}\n'+code.join('\n');
}

test('game validates all 24 challenges, unlocks sequentially and restores finalized state',async()=>{
 let b=browser();b.run('public/niveis.js');b.run('public/cloud.js');b.run('public/jogo.js');await new Promise(r=>setImmediate(r));
 const buttons=()=>b.el('levelMap').children.flatMap(w=>w.children[1].children);
 assert.equal(buttons()[0].disabled,false);assert.equal(buttons()[1].disabled,true);assert.equal(b.el('nextBtn').disabled,true);
 assert.match(b.el('guideBrief').textContent,/duas casas à direita/);
 assert.equal(b.el('missionTargets').children.length,1);
 assert.match(b.el('missionTargets').children[0].children[1].textContent,/coluna 4, linha 3/);
 b.el('studentName').value='Aluno Teste';b.el('studentClass').value='A';await b.el('studentForm').fire('submit');
 b.el('animSpeed').value='1000';
 b.el('codeEditor').value='direita();';await b.el('runBtn').fire('click');assert.equal(buttons()[1].disabled,true);assert.equal(b.el('nextBtn').disabled,true);
 for(let i=0;i<24;i++){
  const level=b.context.JARDIM_NIVEIS[i];
  assert.ok(level.brief.length>20&&level.brief.length<230,'short orientation in phase '+level.id);
  assert.equal(b.el('guideBrief').textContent,level.brief);
  assert.equal(b.el('missionTargets').children.length,level.batteries.length+level.switches.length+1+(level.requires.length?1:0));
  if(level.batteries.length)assert.match(b.el('missionTargets').children[0].children[1].textContent,/coletar\(\);/);
  if(level.switches.length)assert.match(b.el('missionTargets').children[level.batteries.length].children[1].textContent,/ativar\(\);/);
  b.el('codeEditor').value=solution(b.context.JARDIM_NIVEIS[i]);await b.el('codeEditor').fire('input');await b.el('runBtn').fire('click');
  assert.equal(b.el('progressWords').textContent,(i+1)+' de 24 fases','phase '+(i+1));
  for(const row of b.el('missionTargets').children){if(row.className!=='guide-concept'){assert.equal(row.className,'guide-done');assert.match(row.children[1].textContent,/feito$/)}}
  const worldEnd=(i+1)%6===0;
  assert.equal(b.el('completionDialog').open,worldEnd,'celebration only at the end of each world');
  if(worldEnd){
   const world=Math.floor(i/6)+1;
   assert.match(b.el('finishTitle').textContent,new RegExp('Mundo '+world+' concluído'));
   const receipt=await b.context.JardimCloud.receipt();
   const metrics=Array.from({length:6},(_,n)=>receipt.progresso.perLevel[(world-1)*6+n+1]);
   assert.equal(b.el('finishWorldAttempts').textContent,String(metrics.reduce((n,r)=>n+r.attempts,0)));
   const seconds=Math.floor(metrics.reduce((n,r)=>n+r.activeMs,0)/1000);
   assert.equal(b.el('finishWorldTime').textContent,String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0'));
   if(world===1){assert.equal(b.el('finishWorldAttempts').textContent,'7');await b.el('finishCloseBtn').fire('click');await b.el('runBtn').fire('click');assert.equal(b.el('completionDialog').open,false,'repeating a completed phase does not repeat the celebration')}
   if(world<4){await b.el('finishReportBtn').fire('click');assert.equal(b.el('levelTitle').textContent,b.context.JARDIM_NIVEIS[i+1].title)}
   else{assert.match(b.el('finishReportBtn').textContent,/Preparar entrega/);assert.equal(b.el('bonusOffer').hidden,false);assert.match(b.el('finishText').textContent,/Deseja habilitar/);await b.el('finishReportBtn').fire('click');assert.equal(b.el('reportDialog').open,true);assert.equal(b.el('reportBonusOffer').hidden,false);await b.el('reportClose').fire('click')}
  }else if(i<23){assert.equal(buttons()[i+1].disabled,false);if(i<22)assert.equal(buttons()[i+2].disabled,true);await b.el('nextBtn').fire('click')}
  if(i===0){const saved=b.storage;b=browser(saved);b.run('public/niveis.js');b.run('public/cloud.js');b.run('public/jogo.js');await new Promise(r=>setImmediate(r));assert.match(b.el('levelLabel').textContent,/02/);assert.equal(b.el('progressWords').textContent,'1 de 24 fases');assert.equal((await b.context.JardimCloud.receipt()).tentativasRegistradas.length,2);b.el('animSpeed').value='1000';}
 }
 await b.el('finalizeBtn').fire('click');assert.equal(b.el('codeEditor').readOnly,true);
 const reload=browser(b.storage);reload.run('public/niveis.js');reload.run('public/cloud.js');reload.run('public/jogo.js');await new Promise(r=>setImmediate(r));
 assert.equal(reload.el('progressWords').textContent,'24 de 24 fases');assert.equal(reload.el('runBtn').disabled,true);assert.equal(reload.el('codeEditor').readOnly,true);
 assert.equal(reload.el('completionDialog').open,false,'reload does not repeat celebrations');
 await reload.el('replayBtn').fire('click');assert.equal(reload.el('runBtn').disabled,true);
});

test('optional worlds require consent, persist and complete sequentially with reports and teacher import',async()=>{
 const b=browser();b.run('public/niveis.js');b.run('public/cloud.js');await b.context.JardimCloud.register({nome:'Aluno Avançado',turma:'B'});
 const core={...progress,solved:Array.from({length:24},(_,i)=>i+1),last:24,student:{nome:'Aluno Avançado',turma:'B'}};
 b.context.JardimCloud.schedule(core);b.run('public/jogo.js');await new Promise(r=>setImmediate(r));
 assert.equal(b.el('levelMap').children.length,4);assert.equal(b.el('reportBonusOffer').hidden,false);
 await b.el('reportBonusBtn').fire('click');assert.equal(b.el('levelMap').children.length,8);assert.equal(b.el('levelTitle').textContent,'Labirinto inteligente');
 assert.equal(b.el('progressWords').textContent,'24 de 28 fases');
 assert.equal((await b.context.JardimCloud.receipt()).progresso.bonusEnabled,true);
 const reload=browser(b.storage);reload.run('public/niveis.js');reload.run('public/cloud.js');reload.run('public/jogo.js');await new Promise(r=>setImmediate(r));
 assert.equal(reload.el('levelLabel').textContent,'NÍVEL 25 / 28');assert.equal(reload.el('levelMap').children.length,8);
 await reload.el('studentForm').fire('submit');reload.el('animSpeed').value='1000';
 await reload.el('finalizeBtn').fire('click');assert.equal(reload.el('codeEditor').readOnly,false,'unfinished extras prevent finalization');
 await assert.rejects(reload.context.JardimCloud.finalize({...core,bonusEnabled:true}));
 for(let index=24;index<28;index++){
  const buttons=reload.el('levelMap').children.flatMap(w=>w.children[1].children);
  assert.equal(buttons[index].disabled,false);if(index<27)assert.equal(buttons[index+1].disabled,true);
  const level=reload.context.JARDIM_NIVEIS[index];assert.ok(level.brief&&level.hint&&level.hint2);
  reload.el('codeEditor').value=solution(level);await reload.el('codeEditor').fire('input');await reload.el('runBtn').fire('click');
  assert.equal(reload.el('progressWords').textContent,(index+1)+' de 28 fases','bonus '+level.id);
  assert.equal(reload.el('completionDialog').open,true);assert.match(reload.el('finishTitle').textContent,new RegExp('Mundo '+level.world));
  assert.equal(reload.el('finishWorldAttempts').textContent,'1');
  await reload.el('finishReportBtn').fire('click');
 }
 assert.equal(reload.el('reportDialog').open,true);await reload.el('downloadJsonBtn').fire('click');
 const summary=JSON.parse(reload.downloads.at(-1));assert.equal(summary.totalFases,28);assert.equal(summary.fases.length,28);assert.equal(summary.desafiosExtrasConcluidos,4);assert.equal(summary.concluido,true);assert.equal(summary.jornadaCompleta,true);
 await reload.el('finalizeBtn').fire('click');assert.equal(reload.el('codeEditor').readOnly,true);
 const receipt=json(await reload.context.JardimCloud.receipt());assert.equal(receipt.progresso.solved.length,28);assert.ok(receipt.finalizadoEm);
 assert.equal(receipt.progresso.bonusEnabled,true);
 const finished=browser(reload.storage);finished.run('public/niveis.js');finished.run('public/cloud.js');finished.run('public/jogo.js');await new Promise(r=>setImmediate(r));
 assert.equal(finished.el('progressWords').textContent,'28 de 28 fases');assert.equal(finished.el('codeEditor').readOnly,true);assert.equal(finished.el('levelMap').children.length,8);
 const teacher=browser();teacher.run('public/professor/local-data.js');teacher.context.JardimTeacher.importFiles([summary]);teacher.context.JardimTeacher.importFiles([receipt]);
 const row=teacher.context.JardimTeacher.backup()[0];assert.equal(row.student.fases,28);assert.equal(row.student.totalFases,28);assert.equal(row.student.extras,4);assert.equal(row.student.principaisConcluidas,true);
 teacher.run('public/professor/admin.js');await new Promise(r=>setImmediate(r));assert.equal(teacher.el('results').children.length,1);
});

test('bonus worlds stay locked before finishing all main phases',async()=>{
 const b=browser();b.run('public/niveis.js');b.run('public/cloud.js');b.run('public/jogo.js');await new Promise(r=>setImmediate(r));
 await b.el('enableBonusBtn').fire('click');assert.equal(b.el('levelMap').children.length,4);assert.equal(b.el('bonusOffer').hidden,true);
});
