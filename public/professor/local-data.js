/* Arquivos recebidos e avaliações permanecem no navegador do professor. */
window.JardimTeacher=(()=>{
 const KEY='jardimjs_professor_local_v1';
 function read(){const data=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(data))throw Error('Dados locais inválidos.');return data}
 function save(rows){try{localStorage.setItem(KEY,JSON.stringify(rows))}catch{throw Error('Não foi possível salvar. Exporte uma cópia e libere espaço no navegador.')}}
 function normalize(input){
  if(!input||typeof input!=='object')throw Error('Arquivo de entrega inválido.');
  let aluno=input.aluno,id=input.idEntrega,progress=input.progresso,attempts=input.tentativasRegistradas||[],created=input.criadoEm||input.inicioEm,finalized=input.finalizadoEm;
  if(input.formato==='JARDIMJS_ENTREGA_V2'){
   if(!Array.isArray(input.fases)||![24,28].includes(input.fases.length))throw Error('Relatório deve conter 24 fases ou 28 com os extras.');
   progress={bonusEnabled:input.fases.length===28,solved:[],code:{},perLevel:{},activeMs:Number(input.tempoAtivoTotalSegundos||0)*1000};
   for(const r of input.fases){const n=r.fase;if(!Number.isInteger(n)||n<1||n>input.fases.length||progress.perLevel[n])throw Error('Fases inválidas.');if(r.concluida)progress.solved.push(n);progress.code[n]=String(r.codigoEntregue||'');progress.perLevel[n]={attempts:r.tentativas,failedAttempts:r.erros,hintsUsed:r.dicasConsultadas,activeMs:Number(r.tempoAtivoSegundos||0)*1000,totalMoves:r.movimentosEmTodasTentativas,bestMoves:r.menorNumeroMovimentos,bestCode:r.melhorCodigo};}
  }else if(input.student&&input.progress){aluno=input.student;id=aluno.id;progress=input.progress;attempts=input.attempts||[];created=aluno.inicio;finalized=aluno.finalizado}
  else if(!['JARDIMJS_LOCAL_V1','JARDIMJS_SERVIDOR_V3'].includes(input.formato))throw Error('Formato não reconhecido. Use o JSON de entrega do JardimJS.');
  if(typeof id!=='string'||!id||!aluno||typeof aluno.nome!=='string'||typeof aluno.turma!=='string'||!progress||!Array.isArray(progress.solved)||!Array.isArray(attempts))throw Error('Entrega incompleta.');
  const solved=[...new Set(progress.solved)];if(solved.some(n=>!Number.isInteger(n)||n<1||n>28))throw Error('Fases inválidas.');
  progress={...progress,bonusEnabled:progress.bonusEnabled===true||solved.some(n=>n>24),solved,perLevel:progress.perLevel||{},code:progress.code||{}};
  const metrics=Object.values(progress.perLevel),sum=k=>metrics.reduce((n,r)=>n+Math.max(0,Number(r[k])||0),0);
  return {student:{id,nome:aluno.nome,turma:aluno.turma,numero:String(aluno.numero||''),inicio:created||'',atualizado:input.exportadoEm||new Date().toISOString(),finalizado:finalized||null,fases:solved.length,totalFases:progress.bonusEnabled?28:24,extras:solved.filter(n=>n>24).length,principaisConcluidas:Array.from({length:24},(_,i)=>i+1).every(id=>solved.includes(id)),tempoSeg:Math.round((Number(progress.activeMs)||0)/1000),tentativas:sum('attempts'),erros:sum('failedAttempts'),dicas:sum('hintsUsed'),movimentos:sum('totalMoves')},progress,attempts,assessment:input.assessment||null};
 }
 function importFiles(inputs){const rows=read();for(const input of inputs){const record=normalize(input);const index=rows.findIndex(x=>x.student.id===record.student.id);if(index>=0){record.assessment=rows[index].assessment||record.assessment;rows[index]=record}else rows.push(record)}save(rows);return rows.length}
 async function request(path,method='GET',body){
  const rows=read();if(path==='students')return {students:rows.map(r=>({...r.student,assessment:r.assessment}))};
  const match=path.match(/^student\/(.+?)(\/assessment)?$/);const row=match&&rows.find(r=>r.student.id===match[1]);if(!row)throw Error('Entrega não encontrada.');
  if(method==='DELETE'){save(rows.filter(r=>r!==row));return {ok:true}}
  if(match[2]&&method==='POST'){const grade=body.grade;if(grade!==null&&(!Number.isFinite(grade)||grade<0||grade>100||Math.abs(grade*10-Math.round(grade*10))>1e-8))throw Error('Nota deve ser entre 0 e 100, com até uma casa decimal.');if(typeof body.feedback!=='string'||body.feedback.length>2000)throw Error('Observações devem ter até 2.000 caracteres.');row.assessment={grade,feedback:body.feedback.trim(),assessedAt:new Date().toISOString()};save(rows);return {assessment:row.assessment}}
  return row;
 }
 function csv(){const rows=read();const cols=['turma','numero','nome','fases','totalFases','extras','tempoSeg','tentativas','erros','dicas','movimentos','nota','observacaoProfessor','finalizado','id'];const cell=value=>{let s=String(value??'');if(/^[=+@\-\t\r\n]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};return '\uFEFF'+[cols.join(';'),...rows.map(r=>{const s={...r.student,nota:r.assessment?.grade??'',observacaoProfessor:r.assessment?.feedback||''};return cols.map(k=>cell(s[k])).join(';')})].join('\r\n')}
 return {normalize,importFiles,request,csv,backup:read};
})();
