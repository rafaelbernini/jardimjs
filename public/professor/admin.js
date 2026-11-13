(() => {'use strict';
const $=id=>document.getElementById(id);
let all=[],selected=null;
const fmtTime=n=>{const s=Math.max(0,Math.trunc(n||0));return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor(s%3600/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`};
const node=(tag,content,cls)=>{const el=document.createElement(tag);el.textContent=String(content??'');if(cls)el.className=cls;return el};
const api=(...args)=>window.JardimTeacher.request(...args);
function showLogin(error=''){$('loginBox').classList.remove('hidden');$('dashboard').classList.add('hidden');$('loginError').textContent=error}
function fillClasses(){const chosen=$('classFilter').value;const cl=[...new Set(all.map(x=>x.turma))].sort((a,b)=>a.localeCompare(b,'pt-BR'));$('classFilter').replaceChildren(new Option('Todas',''),...cl.map(x=>new Option(x,x)));$('classFilter').value=cl.includes(chosen)?chosen:''}
async function load(){try{const data=await api('students');all=data.students||[];fillClasses();$('loginBox').classList.add('hidden');$('dashboard').classList.remove('hidden');render()}catch(e){showLogin(e.message)}}
function render(){const q=$('filter').value.trim().toLowerCase(),klass=$('classFilter').value;const rows=all.filter(x=>(x.nome+' '+x.turma+' '+x.numero).toLowerCase().includes(q)&&(!klass||x.turma===klass));
  $('resultCount').textContent=rows.length+' encontrado(s)';
  const stats=[['Alunos cadastrados',all.length],['Concluíram as 24 fases',all.filter(x=>x.principaisConcluidas||x.fases>=24).length],['Entregas finalizadas',all.filter(x=>x.finalizado).length],['Turmas registradas',new Set(all.map(x=>x.turma)).size]];
  $('stats').replaceChildren();for(const [label,value] of stats){const el=node('div','', 'stat');el.append(node('span',label),node('strong',value));$('stats').append(el)}
  $('worldStats').replaceChildren();for(let w=0;w<4;w++){const label=['🌱 Primeiros passos','💡 Variáveis e decisões','🔁 Laços de repetição','🚀 Funções e dados'][w];const total=all.length?Math.round(all.reduce((n,x)=>n+Math.max(0,Math.min(6,x.fases-w*6)),0)/(all.length*6)*100):0;const group=node('div','','world-group');const title=node('div','', 'world-row');title.append(node('span',label),node('span',total+'%'));const rail=node('div','', 'world-rail');const fill=node('span','');fill.style.width=total+'%';rail.append(fill);group.append(title,rail);$('worldStats').append(group)}
  const tbody=$('results');tbody.replaceChildren();$('emptyState').classList.toggle('hidden',rows.length!==0);
  for(const r of rows){const tr=document.createElement('tr');const student=tr.insertCell();student.append(node('strong',r.nome,'student-name'),node('span','Nº '+(r.numero||'—'),'small-muted'));tr.insertCell().textContent=r.turma;
   const progress=tr.insertCell();progress.className='progress-cell';progress.append(node('strong',r.fases+'/'+(r.totalFases||24)));const rail=node('div','','progress-line');const fill=node('span','');fill.style.width=(r.fases/(r.totalFases||24)*100)+'%';rail.append(fill);progress.append(rail);
   for(const value of [fmtTime(r.tempoSeg),r.tentativas,r.erros,r.dicas,r.movimentos])tr.insertCell().textContent=value;
   const status=tr.insertCell();status.append(node('span',r.finalizado?'Entregue':r.fases===(r.totalFases||24)?'Concluído':'Em andamento','status-badge '+(r.finalizado?'done':r.fases===(r.totalFases||24)?'complete':'')));
   tr.insertCell().textContent=r.assessment?.grade??'—';
   const cell=tr.insertCell(),btn=node('button','Ver fases','detail-button');btn.type='button';btn.addEventListener('click',()=>inspect(r.id));cell.append(btn);tbody.append(tr)}
}
async function inspect(id){try{const data=await api('student/'+id);selected=data;$('detail').classList.remove('hidden');$('detailTitle').textContent=data.student.nome;$('detailSummary').textContent=`Turma ${data.student.turma} · Chamada ${data.student.numero||'—'} · ${data.student.fases}/${data.student.totalFases||24} fases · ${fmtTime(data.student.tempoSeg)} de tempo ativo`;
  $('assessmentGrade').value=data.assessment?.grade??'';$('assessmentFeedback').value=data.assessment?.feedback||'';$('assessmentStatus').textContent=data.assessment?.assessedAt?'Última avaliação: '+new Date(data.assessment.assessedAt).toLocaleString('pt-BR'):'';
  const levels=$('levelDetails');levels.replaceChildren();for(let i=1;i<=(data.student.totalFases||24);i++){const r=data.progress.perLevel?.[i]||{};const item=document.createElement('details');const done=(data.progress.solved||[]).includes(i);item.append(node('summary',`${String(i).padStart(2,'0')}${i>24?' · Extra / Mundo '+(i-20):''} · ${done?'✓ Concluída':'○ Pendente'} · ${r.attempts||0} tentativa(s) · ${r.bestMoves??'—'} melhor percurso`),node('p',`Tempo: ${fmtTime(Math.round((r.activeMs||0)/1000))} · Falhas: ${r.failedAttempts||0} · Dicas: ${r.hintsUsed||0}`),node('pre',r.bestCode||data.progress.code?.[i]||'// Nenhum código registrado'));levels.append(item)}
  const attempts=$('attemptDetails');attempts.replaceChildren();for(const a of data.attempts||[]){const item=document.createElement('details');item.append(node('summary',`Fase ${a.level} · ${a.success?'✓ Acerto':'↻ Tentativa'} · ${a.moves} movimentos · ${new Date(a.created_at).toLocaleString('pt-BR')}`),node('p',a.error_text||'Sem erro informado'),node('pre',a.code));attempts.append(item)}
  $('detail').scrollIntoView({behavior:'smooth',block:'start'});
 }catch(e){alert(e.message)}}
$('assessmentForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!selected)return;
 const btn=$('saveAssessment');btn.disabled=true;$('assessmentStatus').textContent='Salvando...';
 try{
  const grade=$('assessmentGrade').value.trim();const feedback=$('assessmentFeedback').value;
  const result=await api('student/'+selected.student.id+'/assessment','POST',{grade:grade?Number(grade):null,feedback});
  selected.assessment=result.assessment;
  $('assessmentStatus').textContent='✓ Avaliação salva em '+new Date(result.assessment.assessedAt).toLocaleString('pt-BR');
  const updated=all.find(x=>x.id===selected.student.id);if(updated)updated.assessment=result.assessment;
  render();
 }catch(err){$('assessmentStatus').textContent='Erro: '+err.message}
 finally{btn.disabled=false}
});
$('refresh').addEventListener('click',load);$('filter').addEventListener('input',render);$('classFilter').addEventListener('change',render);
function download(name,data,type='application/json;charset=utf-8'){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
$('importFiles').addEventListener('change',async e=>{try{const inputs=[];for(const file of e.target.files){if(file.size>10000000)throw Error('Arquivo muito grande (limite 10 MB).');const data=JSON.parse(await file.text());inputs.push(...(Array.isArray(data)?data:[data]))}window.JardimTeacher.importFiles(inputs);await load();$('importStatus').textContent='✓ Arquivos importados neste navegador.'}catch(err){$('importStatus').textContent='Erro: '+err.message}finally{e.target.value=''}});
$('csvExport').addEventListener('click',()=>download('jardimjs_turma.csv',window.JardimTeacher.csv(),'text/csv;charset=utf-8'));
$('backupExport').addEventListener('click',()=>download('jardimjs_turma_backup.json',JSON.stringify(window.JardimTeacher.backup(),null,2)));
$('removeStudent').addEventListener('click',async()=>{if(!selected)return;const name=selected.student.nome;const typed=prompt('Para excluir definitivamente o registro importado e todas as tentativas deste navegador, digite EXCLUIR: '+name);if(typed!=='EXCLUIR')return;try{await api('student/'+selected.student.id,'DELETE');selected=null;$('detail').classList.add('hidden');await load()}catch(err){alert('Não foi possível excluir: '+err.message)}});
$('exportStudent').addEventListener('click',()=>{if(!selected)return;const url=URL.createObjectURL(new Blob([JSON.stringify(selected,null,2)],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='jardimjs_'+selected.student.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)});
load();
})();
