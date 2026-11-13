/* JardimJS — lógica do jogo. Execução do código do aluno em Web Worker isolado. */
(() => {
  'use strict';
  const levels = window.JARDIM_NIVEIS;
  if (!levels || levels.length !== 28) { document.body.textContent = 'Erro ao carregar niveis.js'; return; }
  const $ = selector => document.querySelector(selector);
  const WORLD_NAMES = ['Primeiros passos','Variáveis e decisões','Laços de repetição','Funções e dados','Labirinto inteligente','Patrulha em camadas','Rota planejada','Mestre dos jardins'];
  const WORLD_EMOJI = ['🌱','💡','🔁','🚀','🧭','🧩','🗺️','🏆'];
  const commandExamples = ['direita();','esquerda();','cima();','baixo();','coletar();','ativar();','livre("direita")','bateriaAqui()','painelAqui()'];
  const ruleNames = {argumento:'um argumento numérico',const:'const',let:'let',if:'if',else:'else',and:'o operador &&',for:'um laço for',while:'um laço while',function:'uma função',parameter:'parâmetro na função',array:'um array',forof:'for...of',length:'.length',nestedfor:'for dentro de for',return:'return na função'};
  const patterns = {
    argumento:/\b(?:direita|esquerda|cima|baixo)\s*\(\s*(?:[1-9]\d*|[a-zA-Z_$][\w$]*)\s*\)/,
    const:/\bconst\s+\w+\s*=/, let:/\blet\s+\w+\s*=/,
    if:/\bif\s*\(/, else:/\belse\b/, and:/&&/,
    for:/\bfor\s*\(/, while:/\bwhile\s*\(/,
    function:/\bfunction\s+\w+\s*\(/,
    parameter:/\bfunction\s+\w+\s*\(\s*\w+\s*\)/,
    array:/\[\s*(?:["'\d]|true|false)[^\]]*\]/,
    forof:/\bfor\s*\(\s*(?:const|let|var)\s+\w+\s+of\s+\w+/,
    nestedfor:/\bfor\s*\([^)]*\)\s*\{[^{}]*\bfor\s*\(/,
    return:/\breturn\b/,
    length:/\.length\b/
  };
  let solved = new Set();
  let savedCode = {};
  let levelIndex = 0;
  let boardState = null;
  let inProgress = false;
  let runToken = 0;
  let hintStage = 0;
  const STORAGE = 'jardimjs_aluno_v3';
  const APP_VERSION = '5.1.0';
  let student = null;
  let startedAt = null;
  let activeMs = 0;
  let perLevel = {};
  let deliveryId = null;
  let lastActiveTick = null;
  let lastSaveMinute = -1;
  let completionWorld = 4;
  let bonusEnabled = false;
  const coreComplete=()=>levels.slice(0,24).every(l=>solved.has(l.id));
  const availableLevels=()=>levels.filter(l=>l.id<=24||bonusEnabled);
  const totalLevels=()=>bonusEnabled?28:24;
  let finalized = false;
  let finalizedAt = null;
  function lockFinalized(){const editor=$('#codeEditor');editor.readOnly=finalized;$('#runBtn').disabled=finalized;$('#resetCodeBtn').disabled=finalized;$('#hintBtn').disabled=finalized;if(finalized)$('#editorStatus').textContent='● entrega finalizada';}
  function newLevelMetrics(id) {
    if (!perLevel[id] || typeof perLevel[id] !== 'object') perLevel[id] = {};
    const row = perLevel[id];
    for (const [key,def] of Object.entries({attempts:0,failedAttempts:0,hintsUsed:0,activeMs:0,totalMoves:0,bestMoves:null,lastMoves:null,firstCompletedAt:null,lastCompletedAt:null,bestCode:'',lastResult:'Não iniciada',lastAttemptAt:null})) {
      if (row[key] === undefined) row[key] = def;
    }
    return row;
  }
  const htmlEscape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const friendlyTime = ms => {
    let secs=Math.floor(Math.max(0,ms||0)/1000);
    const h=Math.floor(secs/3600); secs%=3600;
    return (h?String(h).padStart(2,'0')+':':'')+String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0');
  };
  function accrueTime() {
    if (!student || finalized || lastActiveTick === null) return;
    const now=performance.now();
    const delta=Math.max(0,Math.min(now-lastActiveTick,5000));
    lastActiveTick=now;
    activeMs+=delta;
    newLevelMetrics(levels[levelIndex].id).activeMs+=delta;
  }
  function startActiveClock() {if(student && document.visibilityState === 'visible')lastActiveTick=performance.now();}
  function renderTimer() {
    $('#totalTimeLabel').textContent=friendlyTime(activeMs);
    $('#levelTimeLabel').textContent=friendlyTime(newLevelMetrics(levels[levelIndex].id).activeMs);
    $('#attemptsLabel').textContent=`${newLevelMetrics(levels[levelIndex].id).attempts} tentativa(s)`;
  }
  function updateStudentBadge(){
    $('#studentNameMini').textContent=student?student.nome:'Aluno não identificado';
    $('#studentClassMini').textContent=student?`Turma ${student.turma}${student.numero?' · Nº '+student.numero:''}`:'Informe seus dados';
  }
  function initStudentDialog() {
    const d=$('#introDialog');
    if(student){
      $('#studentName').value=student.nome;$('#studentClass').value=student.turma;$('#studentNumber').value=student.numero||'';
      ['studentName','studentClass','studentNumber'].forEach(x=>$('#'+x).readOnly=true);
      $('#introTitle').textContent='Retomar jornada';
      $('#startStudentBtn').textContent='▶ Continuar como '+student.nome.split(/\s+/)[0];
    }
    if(!student){['studentName','studentClass','studentNumber'].forEach(x=>{ $('#'+x).readOnly=false;$('#'+x).value='';});$('#introTitle').textContent='Sua jornada começa aqui';$('#startStudentBtn').textContent='▶ Começar atividade';}
    d.addEventListener('cancel',ev=>ev.preventDefault());
    d.showModal();
  }
  function recordAttempt(l,code,result,success,errorText) {
    const row=newLevelMetrics(l.id);
    row.lastMoves=(result && Number.isFinite(result.moves))?result.moves:0;
    row.totalMoves+=row.lastMoves;
    row.lastAttemptAt=new Date().toISOString();
    row.lastResult=success?'Concluída':String(errorText||'Não concluída').slice(0,220);
    if(success){
      const now=new Date().toISOString();
      if(!row.firstCompletedAt) row.firstCompletedAt=now;
      row.lastCompletedAt=now;
      if(row.bestMoves===null || row.lastMoves<row.bestMoves){row.bestMoves=row.lastMoves;row.bestCode=code;}
    }else{row.failedAttempts++;}
    window.JardimCloud?.attempt({level:l.id,code,success,moves:row.lastMoves,error:errorText||''});
    save();renderTimer();
  }
  function reportData() {
    accrueTime();save();
    const rows=availableLevels().map(l=>{
      const r=newLevelMetrics(l.id);
      return {fase:l.id,mundo:l.world,titulo:l.title,assunto:l.subject,concluida:solved.has(l.id),
        tempoAtivoSegundos:Math.round(r.activeMs/1000),tentativas:r.attempts,erros:r.failedAttempts,
        dicasConsultadas:r.hintsUsed,menorNumeroMovimentos:r.bestMoves,ultimoNumeroMovimentos:r.lastMoves,
        movimentosEmTodasTentativas:r.totalMoves,primeiraConclusaoEm:r.firstCompletedAt,ultimaConclusaoEm:r.lastCompletedAt,
        ultimoResultado:r.lastResult,codigoEntregue:savedCode[l.id]??'',melhorCodigo:r.bestCode};
    });
    return {formato:'JARDIMJS_ENTREGA_V2',versao:APP_VERSION,
      idEntrega:deliveryId,
      aluno:{...student},
      inicioEm:startedAt,
      exportadoEm:new Date().toISOString(),
      finalizadoEm:finalizedAt,
      tempoAtivoTotalSegundos:Math.round(activeMs/1000),
      tempoDecorridoRelogioSegundos:startedAt?Math.round((Date.now()-Date.parse(startedAt))/1000):0,
      totalFases:totalLevels(),fasesConcluidas:solved.size,concluido:coreComplete(),
      bonusEnabled,desafiosExtrasConcluidos:[...solved].filter(id=>id>24).length,jornadaCompleta:availableLevels().every(l=>solved.has(l.id)),
      totalTentativas:rows.reduce((a,r)=>a+r.tentativas,0),
      totalFalhas:rows.reduce((a,r)=>a+r.erros,0),
      totalDicasConsultadas:rows.reduce((a,r)=>a+r.dicasConsultadas,0),
      totalMovimentosNasTentativas:rows.reduce((a,r)=>a+r.movimentosEmTodasTentativas,0),
      xp:solved.size*50,fases:rows,
      observacao:'Relatório produzido localmente no navegador do estudante. Não possui verificação de autenticidade contra manipulação manual.'};
  }
  function download(name,body,type) {
    const url=URL.createObjectURL(new Blob([body],{type}));
    const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),8000);
  }
  function reportFileStem(data) {
    const safe=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,42);
    return `JardimJS_${safe(data.aluno.turma)}_${safe(data.aluno.numero||'SN')}_${safe(data.aluno.nome)}_${new Date().toISOString().slice(0,10)}`;
  }
  function buildReportHtml(data) {
    const summary=[['Fases completas',data.fasesConcluidas+' / '+data.totalFases],['Tempo ativo',friendlyTime(data.tempoAtivoTotalSegundos*1000)],['Tentativas',data.totalTentativas],['Erros',data.totalFalhas],['Dicas consultadas',data.totalDicasConsultadas],['Movimentos acumulados',data.totalMovimentosNasTentativas]];
    const rows=data.fases.map(f=>`<tr><td>${String(f.fase).padStart(2,'0')}</td><td>${htmlEscape(f.titulo)}</td><td>${f.concluida?'Concluída':'Pendente'}</td><td>${friendlyTime(f.tempoAtivoSegundos*1000)}</td><td>${f.tentativas}</td><td>${f.menorNumeroMovimentos??'—'}</td><td>${f.dicasConsultadas}</td><td>${f.erros}</td></tr>`).join('');
    const codes=data.fases.map(f=>`<section class="code-section"><h3>Fase ${String(f.fase).padStart(2,'0')} — ${htmlEscape(f.titulo)}</h3><div class="code-meta">${f.concluida?'Concluída':'Pendente'} · ${f.tentativas} tentativa(s) · ${f.menorNumeroMovimentos??'—'} melhor movimento(s) · ${f.dicasConsultadas} dicas</div><pre>${htmlEscape(f.melhorCodigo||f.codigoEntregue||'// Nenhum código informado')}</pre></section>`).join('');
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Entrega JardimJS — ${htmlEscape(data.aluno.nome)}</title><style>
    *{box-sizing:border-box}body{font:13px/1.55 system-ui,Arial,sans-serif;color:#23382c;max-width:1020px;margin:auto;padding:36px;background:#fff}header{border-bottom:4px solid #286646;padding-bottom:18px;margin-bottom:23px}h1{font-size:27px;margin:0}h2{font-size:18px;margin:25px 0 10px}p{margin:7px 0}.chip{display:inline-block;padding:5px 10px;background:#e8f3de;border-radius:8px;font-size:12px;font-weight:bold}.muted{color:#63736a}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stat{background:#ecf5e9;border:1px solid #dceadb;border-radius:8px;padding:12px}.stat b{font-size:19px;display:block;color:#256343}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #d8e4d8;padding:7px 8px;text-align:left}th{background:#eaf3e8}tr:nth-child(even){background:#f8fbf7}.code-section{break-inside:avoid;page-break-inside:avoid;margin:14px 0 20px}.code-section h3{font-size:13px;margin:0}.code-meta{font-size:10px;color:#677967;margin:4px 0 6px}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f4f6f2;border-left:3px solid #64966c;padding:10px;font:11px/1.4 Consolas,monospace;max-height:none}.controls{background:#f0f6ee;padding:12px;margin-bottom:18px}.controls button{padding:10px 15px;border:0;border-radius:7px;background:#286646;color:white;font-weight:700;cursor:pointer}.disclaimer{margin-top:22px;font-size:10px;color:#5b7062;border-top:1px solid #dce8dc;padding-top:12px}@media print{body{padding:0;max-width:none;font-size:11px}.controls{display:none}thead{display:table-header-group}table{font-size:9px}h2{break-after:avoid}.code-section{break-inside:avoid}pre{font-size:9px}}@page{size:A4;margin:14mm}</style></head><body>
    <div class="controls"><strong>Relatório pronto.</strong> Use o botão abaixo e selecione <b>Salvar como PDF</b>. <button onclick="window.print()">🖨 Imprimir / Salvar PDF</button></div>
    <header><span class="chip">JARDIM DO JAVASCRIPT · COMPROVANTE DE ATIVIDADE</span><h1>Relatório individual de aprendizagem</h1><p><strong>Aluno:</strong> ${htmlEscape(data.aluno.nome)} · <strong>Turma:</strong> ${htmlEscape(data.aluno.turma)} · <strong>Nº:</strong> ${htmlEscape(data.aluno.numero||'Não informado')}</p><p class="muted">Início: ${htmlEscape(new Date(data.inicioEm).toLocaleString('pt-BR'))} · Exportação: ${htmlEscape(new Date(data.exportadoEm).toLocaleString('pt-BR'))} · Identificador: ${htmlEscape(data.idEntrega)}</p><p><strong>Situação:</strong> ${data.concluido?(data.bonusEnabled?'24 FASES PRINCIPAIS CONCLUÍDAS · EXTRAS: '+data.desafiosExtrasConcluidos+'/4':'ATIVIDADE CONCLUÍDA'):'ATIVIDADE PARCIAL (ainda não foram concluídas todas as 24 fases)'}</p></header>
    <div class="grid">${summary.map(([k,v])=>`<div class="stat">${htmlEscape(k)}<b>${htmlEscape(v)}</b></div>`).join('')}</div>
    <h2>Desempenho por fase</h2><table><thead><tr><th>Fase</th><th>Desafio</th><th>Situação</th><th>Tempo ativo</th><th>Tent.</th><th>Melhor mov.</th><th>Dicas</th><th>Erros</th></tr></thead><tbody>${rows}</tbody></table>
    <h2>Códigos submetidos pelo aluno</h2>${codes}
    <div class="disclaimer">${htmlEscape(data.observacao)} · Tempo ativo é contabilizado enquanto a aba está visível; não é controle supervisionado de presença. Para conferir códigos e métricas, o professor pode importar o arquivo JSON no avaliador.</div></body></html>`;
  }
  function showReport() {
    if(!student)return;
    const data=reportData();
    $('#reportBrief').innerHTML=`<span><strong>${data.fasesConcluidas}/${data.totalFases}</strong>fases concluídas</span><span><strong>${friendlyTime(data.tempoAtivoTotalSegundos*1000)}</strong>tempo ativo</span><span><strong>${data.totalTentativas}</strong>tentativas</span><span><strong>${data.totalMovimentosNasTentativas}</strong>movimentos executados</span>`;
    updateBonusOffer();
    $('#reportDialog').showModal();
  }

  const editor = $('#codeEditor');
  const board = $('#board');
  const boardTiles = [];
  const workerSource = String.raw`
    self.onmessage = function (ev) {
      const { level, code } = ev.data;
      let x = level.start[0], y = level.start[1];
      const rocks = new Set(level.rocks.map(p => p.join(',')));
      const batteries = new Set(level.batteries.map(p => p.join(',')));
      const switches = new Set(level.switches.map(p => p.join(',')));
      const trace = [], logs = [];
      let moves = 0;
      let steps = 0;
      const key = (a,b) => a + ',' + b;
      function add(type) {
        if (++steps > 300) throw new Error('Muitos comandos! O limite desta missão é de 300 ações.');
        trace.push({type, x, y, batteries:[...batteries], switches:[...switches], moves});
      }
      function inspect(d) {
        const directions = {direita:[1,0], esquerda:[-1,0], cima:[0,-1], baixo:[0,1]};
        const delta = directions[d];
        if (!delta) throw new Error('Direção inválida. Use "direita", "esquerda", "cima" ou "baixo".');
        const nx = x + delta[0], ny = y + delta[1];
        return nx >= 0 && nx < 7 && ny >= 0 && ny < 5 && !rocks.has(key(nx,ny));
      }
      function move(dir, n=1) {
        if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('Use um número inteiro de 1 a 100 nos movimentos.');
        for (let i=0; i<n; i++) {
          if (!inspect(dir)) throw new Error('Opa! Há uma rocha ou a borda do jardim no caminho para ' + dir + '.');
          if (dir === 'direita') x++;
          if (dir === 'esquerda') x--;
          if (dir === 'cima') y--;
          if (dir === 'baixo') y++;
          moves++;
          add('move');
        }
      }
      const direita = n => move('direita',n);
      const esquerda = n => move('esquerda',n);
      const cima = n => move('cima',n);
      const baixo = n => move('baixo',n);
      const coletar = () => {
        if (!batteries.has(key(x,y))) throw new Error('Não há nenhuma bateria nesta casa para coletar.');
        batteries.delete(key(x,y)); add('collect');
      };
      const ativar = () => {
        if (!switches.has(key(x,y))) throw new Error('Não há painel nesta casa para ativar.');
        switches.delete(key(x,y)); add('switch');
      };
      const livre = dir => inspect(dir);
      const bateriaAqui = () => batteries.has(key(x,y));
      const painelAqui = () => switches.has(key(x,y));
      const safeConsole = { log: (...args) => { if(logs.length < 30) logs.push(args.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(' ')); } };
      try {
        const run = new Function('direita','esquerda','cima','baixo','coletar','ativar','livre','bateriaAqui','painelAqui','console', '"use strict";\n' + code);
        run(direita,esquerda,cima,baixo,coletar,ativar,livre,bateriaAqui,painelAqui,safeConsole);
        self.postMessage({trace,logs,moves,x,y,batteries:[...batteries],switches:[...switches],ok:true});
      } catch (err) {
        self.postMessage({trace,logs,moves,x,y,batteries:[...batteries],switches:[...switches],ok:false,error:(err && err.message) || String(err)});
      }
    };
  `;
  function readStored() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE) || '{}');
      if (Array.isArray(raw.solved)) solved = new Set(raw.solved.filter(i => Number.isInteger(i) && i>=1 && i<=levels.length));
      if (raw.code && typeof raw.code === 'object') savedCode=raw.code;
      if (Number.isInteger(raw.last) && raw.last>=1 && raw.last<=levels.length) levelIndex=raw.last-1;
      if (raw.student && typeof raw.student.nome==='string' && typeof raw.student.turma==='string') student=raw.student;
      if (typeof raw.startedAt==='string' && !Number.isNaN(Date.parse(raw.startedAt))) startedAt=raw.startedAt;
      if (Number.isFinite(raw.activeMs) && raw.activeMs>=0)activeMs=raw.activeMs;
      if (raw.perLevel && typeof raw.perLevel==='object')perLevel=raw.perLevel;
      if (typeof raw.deliveryId === 'string')deliveryId=raw.deliveryId;
      bonusEnabled=raw.bonusEnabled===true&&coreComplete();
    } catch (_) { /* armazenamento opcional */ }
  }
  function save() {
    const snapshot={solved:[...solved].sort((a,b)=>a-b),code:savedCode,last:levelIndex+1,student,startedAt,activeMs,perLevel,deliveryId,bonusEnabled};
    window.JardimCloud?.schedule(snapshot);
    try { localStorage.setItem(STORAGE, JSON.stringify(snapshot)); }
    catch (_) { /* modo privado pode impedir armazenamento */ }
  }
  function updateBonusOffer(){
    const show=coreComplete()&&!bonusEnabled&&!finalized;
    $('#bonusOffer').hidden=!show;$('#reportBonusOffer').hidden=!show;
  }
  function enableBonus(){
    if(!coreComplete()||bonusEnabled||finalized)return;
    bonusEnabled=true;save();
    if(window.JardimCloud.lastError){bonusEnabled=false;return;}
    $('#completionDialog').close();$('#reportDialog').close();updateBonusOffer();loadLevel(24);
  }
  $('#enableBonusBtn').addEventListener('click',enableBonus);
  $('#reportBonusBtn').addEventListener('click',enableBonus);
  function celebrateWorld(world) {
    const phases=levels.filter(l=>l.world===world);
    if(!phases.every(l=>solved.has(l.id)))return;
    completionWorld=world;
    const total=phases.reduce((sum,l)=>{
      const metrics=newLevelMetrics(l.id);
      sum.activeMs+=metrics.activeMs;sum.attempts+=metrics.attempts;return sum;
    },{activeMs:0,attempts:0});
    $('#finishTitle').textContent=`Parabéns! Mundo ${world} concluído! 🎉`;
    $('#finishText').textContent=world>4?`Você venceu ${WORLD_NAMES[world-1]}! ${world===8?'Os quatro desafios extras estão concluídos. Gere seu relatório atualizado.':'Continue para o próximo desafio extra.'}`:world===4
      ?'Você venceu as seis fases de Funções e dados e completou os quatro mundos! Gere seu relatório para entregar ao professor. Deseja habilitar mais quatro mundos, com um desafio avançado em cada um?'
      :`Você completou as seis fases de ${WORLD_NAMES[world-1]}. Cada tentativa ajudou você a chegar até aqui!`;
    $('#finishWorldTime').textContent=friendlyTime(total.activeMs);
    $('#finishWorldAttempts').textContent=String(total.attempts);
    $('#finishReportBtn').textContent=world===4||world===8?'📄 Preparar entrega':'Próximo mundo →';
    $('#finishStatsNote').textContent=`Soma ${phases.length===1?'do desafio':'das seis fases'} deste mundo, incluindo as tentativas que não deram certo.`;
    updateBonusOffer();
    $('#completionDialog').showModal();
  }
  function initialState(level) {
    return {x:level.start[0],y:level.start[1],batteries:level.batteries.map(p=>p.join(',')),switches:level.switches.map(p=>p.join(',')),moves:0};
  }
  function setupBoard() {
    board.replaceChildren(); boardTiles.length=0;
    for(let i=0;i<35;i++) {
      const cell=document.createElement('div');
      cell.className='tile'+(((Math.floor(i/7)+i%7)%2) ? ' dark' : '');
      boardTiles.push(cell);board.append(cell);
    }
  }
  function renderBoard() {
    const level=levels[levelIndex]; const s=boardState;
    const rocks=new Set(level.rocks.map(p=>p.join(',')));
    const batterySet=new Set(s.batteries); const switchSet=new Set(s.switches);
    for(let y=0;y<5;y++) for(let x=0;x<7;x++) {
      const idx=y*7+x, key=x+','+y, cell=boardTiles[idx];
      const rock=rocks.has(key), battery=batterySet.has(key), panel=switchSet.has(key), goal=level.goal[0]===x&&level.goal[1]===y, bot=s.x===x&&s.y===y;
      cell.className='tile'+(((x+y)%2)?' dark':'')+(rock?' rock':'')+(battery?' battery':'')+(panel?' switch':'')+(goal?' goal':'')+(bot?' robot-tile':'')+(bot&&goal?' arrived':'');
      cell.replaceChildren();
      const visual=document.createElement('span');
      visual.className='tile-object'+(bot?' robot-icon':'');
      const sprite=bot?'robot':rock?'rock':battery?'battery':panel?'switch':goal?'portal':null;
      if(sprite){const art=document.createElement('img');art.src='/assets/'+sprite+'.svg';art.alt='';art.draggable=false;visual.append(art)}
      else if((x*11+y*7)%13===0){const flower=document.createElement('img');flower.src='/assets/flower.svg';flower.alt='';flower.className='tile-flower';visual.append(flower)}
      cell.append(visual);
      const coord=document.createElement('small');coord.className='tile-coordinate';coord.textContent=`${x+1}·${y+1}`;coord.setAttribute('aria-hidden','true');cell.append(coord);
      cell.setAttribute('aria-label',`Coluna ${x+1}, linha ${y+1}: `+(bot?'robô':rock?'pedra':battery?'bateria':panel?'painel':goal?'portal':'vazio'));
    }
    $('#stepCount').textContent=s.moves+' movimento'+(s.moves===1?'':'s');
    board.setAttribute('aria-label',`Tabuleiro 7 por 5. Robô na coluna ${s.x+1}, linha ${s.y+1}; ${s.batteries.length} baterias e ${s.switches.length} painéis restantes`);
    renderGuide();
  }
  function renderGuide() {
    const l=levels[levelIndex],s=boardState;
    const place=p=>`coluna ${p[0]+1}, linha ${p[1]+1}`;
    $('#guideStart').textContent=`Início: ${l.start[0]+1} · ${l.start[1]+1}`;
    $('#guideBrief').textContent=l.brief;
    const list=$('#missionTargets');list.replaceChildren();
    function item(label,done){const row=document.createElement('li');row.className=done?'guide-done':'';const mark=document.createElement('span');mark.className='guide-check';mark.textContent=done?'✓':'○';mark.setAttribute('aria-hidden','true');const text=document.createElement('span');text.textContent=label+(done?' — feito':'');row.append(mark,text);list.append(row)}
    for(const p of l.batteries)item(`Vá à bateria na ${place(p)} e use coletar(); nessa casa.`,!s.batteries.includes(p.join(',')));
    for(const p of l.switches)item(`Vá ao painel na ${place(p)} e use ativar(); nessa casa.`,!s.switches.includes(p.join(',')));
    item(`Termine no portal: ${place(l.goal)}.`,s.x===l.goal[0]&&s.y===l.goal[1]&&!s.batteries.length&&!s.switches.length);
    if(l.requires.length){const row=document.createElement('li');row.className='guide-concept';row.textContent='No código: '+l.requires.map(k=>ruleNames[k]).join(' + ')+'.';list.append(row)}
  }
  function showFeedback(kind,title,details) {
    const b=$('#feedback'); b.className='feedback '+kind;
    $('#feedbackIcon').textContent={idle:'💡',success:'🏆',error:'🧩',running:'⚙️'}[kind]||'💡';
    $('#feedbackTitle').textContent=title;
    $('#feedbackText').textContent=details;
  }
  function renderProgress() {
    const percent=Math.round(solved.size/totalLevels()*100);
    $('#progressPct').textContent=percent+'%';
    $('#progressWords').textContent=`${solved.size} de ${totalLevels()} fases`;
    $('#progressFill').style.width=percent+'%';
    $('#progressTrack').setAttribute('aria-valuenow',solved.size);
    $('#progressTrack').setAttribute('aria-valuemax',totalLevels());
    $('#finalizeBtn').textContent=`✓ Finalizar entrega (${totalLevels()} fases)`;
    $('#xpText').textContent=(solved.size*50)+' XP';
  }
  function isUnlocked(id) { return (id<=24||bonusEnabled)&&(id===1 || Array.from({length:id-1},(_,i)=>i+1).every(n=>solved.has(n))); }
  function createMap() {
    const root=$('#levelMap'); root.replaceChildren();
    for(let w=1;w<=(bonusEnabled?8:4);w++) {
      const group=document.createElement('div');group.className='world-group';
      const head=document.createElement('div'); head.className='world-heading';
      const emoji=document.createElement('span');emoji.className='world-emoji';emoji.textContent=WORLD_EMOJI[w-1];
      const label=document.createElement('span');const strong=document.createElement('strong');strong.textContent=`Mundo 0${w}`;
      const small=document.createElement('small');small.textContent=WORLD_NAMES[w-1];label.append(strong,small);head.append(emoji,label);
      const grid=document.createElement('div');grid.className='level-grid';
      levels.filter(l=>l.world===w).forEach(l=>{
        const btn=document.createElement('button');btn.type='button';btn.className='level-button'+(levelIndex===l.id-1?' active':'')+(solved.has(l.id)?' completed':'');
        btn.disabled=!isUnlocked(l.id);
        btn.textContent=String(l.id).padStart(2,'0');btn.title=btn.disabled?'Conclua as fases anteriores para liberar':l.title;
        btn.setAttribute('aria-label',`Fase ${l.id}: ${l.title}${solved.has(l.id)?' — concluída':''}`);
        btn.setAttribute('aria-current',levelIndex===l.id-1?'step':'false');
        btn.addEventListener('click',()=>loadLevel(l.id-1)); grid.append(btn);
      });group.append(head,grid);root.append(group);
    }
  }
  function updateLines() {
    const lines=editor.value.split('\n').length;
    $('#lineNumbers').textContent=Array.from({length:lines},(_,i)=>i+1).join('\n');
  }
  function setCommandButtons() {
    $('#commandList').replaceChildren();
    commandExamples.forEach(c=>{
      const btn=document.createElement('button');btn.type='button';btn.className='command-button';btn.textContent=c;btn.title='Inserir no editor';
      btn.addEventListener('click',()=>{
        if(inProgress||finalized)return;
        const st=editor.selectionStart,end=editor.selectionEnd;
        editor.setRangeText(c,st,end,'end');
        editor.focus(); editor.dispatchEvent(new Event('input'));
      });$('#commandList').append(btn);
    });
  }
  function loadLevel(index) {
    if(index<0||index>=levels.length||!isUnlocked(index+1))return;
    runToken++;
    inProgress=false;$('#runBtn').disabled=false; $('#runBtn').textContent='▶ Executar código';
    accrueTime();levelIndex=index;hintStage=0;$('#hintContent').hidden=true;$('#hintContent').textContent='';$('#hintArrow').textContent='+';$('#hintBtn').firstChild.textContent='💡 Ver uma dica ';
    const l=levels[index];boardState=initialState(l);
    $('#worldChip').textContent='MUNDO 0'+l.world;
    $('#lessonChip').textContent=l.subject.toUpperCase();
    $('#levelLabel').textContent=`NÍVEL ${String(l.id).padStart(2,'0')} / ${totalLevels()}`;
    $('#levelTitle').textContent=l.title;$('#missionText').textContent=l.mission;
    editor.value=Object.prototype.hasOwnProperty.call(savedCode,l.id)?savedCode[l.id]:l.starter;
    if(location.search.includes('demo=1')&&l.id===1&&!savedCode[l.id]) editor.value='direita();\ndireita();';
    updateLines();renderBoard();createMap();renderProgress();
    showFeedback('idle','Nova missão!',`Você está praticando: ${l.subject}.`);
    $('#consoleOutput').textContent='> Aguardando seu código...';
    const canGo=solved.has(l.id);
    $('#nextBtn').disabled=!canGo||index===totalLevels()-1;
    $('#nextBtn').textContent=index===23?'Fim da jornada 🏅':'Próxima fase →';
    $('#prevBtn').disabled=index===0;
    $('#nextMessage').textContent=canGo?'Missão concluída · 50 XP':'Complete a fase para ganhar XP';
    save();renderTimer();lockFinalized();
  }
  function checkRequirements(code,required) {
    // Remove comentários para que instruções do enunciado não contem como resposta.
    const noComments=code.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|\s)\/\/[^\n]*/g,'$1');
    return required.filter(k=>!patterns[k]?.test(noComments));
  }
  async function executeWorker(level,code) {
    const blob=new Blob([workerSource],{type:'application/javascript'});
    const url=URL.createObjectURL(blob);
    const worker=new Worker(url);
    try {
      return await new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>{worker.terminate();reject(new Error('Tempo esgotado. Verifique se há um laço infinito (for ou while sem parada).'));},3500);
        worker.onmessage=event=>{clearTimeout(timeout);resolve(event.data);};
        worker.onerror=event=>{clearTimeout(timeout);reject(new Error(event.message||'Falha ao interpretar o JavaScript.'));};
        worker.postMessage({level,code});
      });
    } finally {worker.terminate();URL.revokeObjectURL(url);}
  }
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function runCode() {
    if(inProgress||finalized)return;
    const token=++runToken;
    inProgress=true;$('#runBtn').disabled=true;$('#runBtn').textContent='Executando...';
    const l=levels[levelIndex], code=editor.value;
    savedCode[l.id]=code;newLevelMetrics(l.id).attempts++;save();renderTimer();
    boardState=initialState(l);renderBoard();
    showFeedback('running','Executando...','O robô está lendo seus comandos.');
    let result;
    try {result=await executeWorker(l,code);}
    catch(e) {
      if(token!==runToken)return;
      recordAttempt(l,code,null,false,e.message);showFeedback('error','Não foi possível executar',e.message);$('#consoleOutput').textContent='> '+e.message;
      inProgress=false;$('#runBtn').disabled=false;$('#runBtn').textContent='▶ Executar código';return;
    }
    if(token!==runToken)return;
    let line='> '+(result.ok?'Código executado.':'O código foi interrompido.')+'\n';
    if(result.logs.length)line+=result.logs.map(s=>'console.log: '+s).join('\n')+'\n';
    if(!result.ok)line+='Erro: '+result.error+'\n';
    line+='Movimentos: '+result.moves+'\n';
    $('#consoleOutput').textContent=line;
    const speed=Number($('#animSpeed')?.value||1);
    const delay=(result.trace.length>45?60:result.trace.length>18?95:230)/speed;
    for(const action of result.trace) {
      if(token!==runToken)return;
      boardState={x:action.x,y:action.y,batteries:action.batteries,switches:action.switches,moves:action.moves};
      renderBoard();await pause(delay);
    }
    if(token!==runToken)return;
    if(!result.ok) {
      recordAttempt(l,code,result,false,result.error);showFeedback('error','Quase lá — revise o código',result.error);
    } else {
      const atGoal=result.x===l.goal[0]&&result.y===l.goal[1];
      const missing=checkRequirements(code,l.requires);
      if(!atGoal || result.batteries.length || result.switches.length) {
        const pending=[]; if(!atGoal)pending.push('chegar ao portal');
        if(result.batteries.length)pending.push('coletar '+result.batteries.length+' bateria(s)');
        if(result.switches.length)pending.push('ativar '+result.switches.length+' painel(is)');
        recordAttempt(l,code,result,false,pending.join(', '));showFeedback('error','Ainda falta um pedacinho!','Você precisa '+pending.join(', ')+'. Revise o caminho e tente de novo.');
      } else if(missing.length) {
        recordAttempt(l,code,result,false,'Conceito obrigatório ausente: '+missing.join(', '));showFeedback('error','Funcionou! Agora use o conceito da aula.','Para concluir esta fase, inclua '+missing.map(k=>ruleNames[k]).join(' e ')+'.');
      } else {
        const firstTime=!solved.has(l.id);
        accrueTime();
        solved.add(l.id);recordAttempt(l,code,result,true,'');save();renderProgress();createMap();
        showFeedback('success','Missão cumprida! 🎉',firstTime?'Você ganhou 50 XP! Seu código levou o robô ao portal.':'Muito bem! Você completou novamente esta missão.');
        $('#nextBtn').disabled=l.id===totalLevels();
        $('#nextMessage').textContent=l.id===28?'Você concluiu os quatro desafios extras!':l.id===24?'Você concluiu todas as 24 fases!':'Missão concluída · 50 XP';
        if(l.id===28)showFeedback('success','TODOS OS DESAFIOS CONCLUÍDOS! 🏆','Você venceu os quatro mundos extras. Gere seu relatório atualizado!');
        if(l.id===24)showFeedback('success','VOCÊ ZEROU O JARDIM! 🏆','24 fases, 4 mundos e uma grande evolução em JavaScript. Gere seu relatório para entrega!');
        if(firstTime)celebrateWorld(l.world);
      }
    }
    inProgress=false;$('#runBtn').disabled=false;$('#runBtn').textContent='▶ Executar código';
  }
  editor.addEventListener('input',()=>{savedCode[levels[levelIndex].id]=editor.value;save();updateLines();});
  editor.addEventListener('scroll',()=>{$('#lineNumbers').scrollTop=editor.scrollTop;});
  editor.addEventListener('keydown',event=>{
    if(event.key==='Tab'){event.preventDefault();const a=editor.selectionStart,b=editor.selectionEnd;editor.setRangeText('  ',a,b,'end');editor.dispatchEvent(new Event('input'));}
    if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();runCode();}
  });
  $('#runBtn').addEventListener('click',runCode);
  $('#prevBtn').addEventListener('click',()=>loadLevel(levelIndex-1));
  $('#nextBtn').addEventListener('click',()=>{if(solved.has(levelIndex+1))loadLevel(levelIndex+1);});
  $('#replayBtn').addEventListener('click',()=>{if(finalized)return;runToken++;inProgress=false;$('#runBtn').disabled=false;$('#runBtn').textContent='▶ Executar código';boardState=initialState(levels[levelIndex]);renderBoard();showFeedback('idle','Tabuleiro reiniciado','Seu código foi preservado. Execute novamente quando quiser.');});
  $('#resetCodeBtn').addEventListener('click',()=>{if(inProgress||finalized)return;editor.value=levels[levelIndex].starter;editor.dispatchEvent(new Event('input'));editor.focus();showFeedback('idle','Editor limpo','Você pode começar seu código de novo.');});
  $('#clearConsoleBtn').addEventListener('click',()=>{$('#consoleOutput').textContent='> Terminal limpo.';});
  $('#hintBtn').addEventListener('click',()=>{
    if(finalized)return;
    const l=levels[levelIndex];hintStage=(hintStage+1)%3;if(hintStage>0){const r=newLevelMetrics(l.id);r.hintsUsed++;save();}
    $('#hintContent').hidden=hintStage===0;
    $('#hintContent').textContent=hintStage===1?l.hint:hintStage===2?l.hint2:'';
    $('#hintBtn').firstChild.textContent=hintStage===0?'💡 Ver uma dica ':hintStage===1?'💡 Outra dica ':'💡 Ocultar dicas ';
    $('#hintArrow').textContent=hintStage===0?'+':'−';
  });
  $('#helpBtn').addEventListener('click',()=>$('#helpDialog').showModal());
  $('#resetProgress').addEventListener('click',()=>{
    if(!confirm('Reiniciar todas as fases e apagar todos os códigos salvos neste navegador?'))return;
    window.JardimCloud?.reset();finalized=false;finalizedAt=null;solved.clear();savedCode={};levelIndex=0;student=null;startedAt=null;activeMs=0;perLevel={};deliveryId=null;completionWorld=4;bonusEnabled=false;lastActiveTick=null;try{localStorage.removeItem(STORAGE)}catch(_){};updateBonusOffer();save();loadLevel(0);updateStudentBadge();renderTimer();initStudentDialog();
  });
  $('#exportProgress').addEventListener('click',showReport);
  $('#reportClose').addEventListener('click',()=>$('#reportDialog').close());
  $('#downloadJsonBtn').addEventListener('click',()=>{
    const data=reportData();download(reportFileStem(data)+'.json',JSON.stringify(data,null,2),'application/json;charset=utf-8');
  });
  $('#downloadHtmlBtn').addEventListener('click',()=>{
    const data=reportData();download(reportFileStem(data)+'.html',buildReportHtml(data),'text/html;charset=utf-8');
  });
  $('#openPdfBtn').addEventListener('click',()=>{
    const data=reportData();
    const html=buildReportHtml(data);const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
    const tab=window.open(url,'_blank');
    if(!tab){download(reportFileStem(data)+'.html',html,'text/html;charset=utf-8');alert('O navegador bloqueou a nova aba. Foi baixado o relatório HTML: abra-o e use Ctrl+P para salvar em PDF.');}
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  });
  $('#finishReportBtn').addEventListener('click',()=>{$('#completionDialog').close();if(completionWorld===4||completionWorld===8)showReport();else loadLevel(levels.findIndex(l=>l.world===completionWorld+1));});
  $('#finishCloseBtn').addEventListener('click',()=>$('#completionDialog').close());
  $('#studentForm').addEventListener('submit',async event=>{
    event.preventDefault();
    if(!student){
      const nome=$('#studentName').value.trim().replace(/\s+/g,' ');
      const turma=$('#studentClass').value.trim().replace(/\s+/g,' ');
      const numero=$('#studentNumber').value.trim();
      if(nome.length<3 || !turma){alert('Informe nome completo e turma para começar.');return;}
      try{const button=$('#startStudentBtn');button.disabled=true;button.textContent='Salvando...';const session=await window.JardimCloud.register({nome,turma,numero});deliveryId=session.id;button.disabled=false;}catch(e){alert('Não foi possível salvar a identificação: '+e.message);$('#startStudentBtn').disabled=false;$('#startStudentBtn').textContent='▶ Começar atividade';return;}
      student={nome,turma,numero};startedAt=new Date().toISOString();
      deliveryId=deliveryId || (typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2,10));
    }
    $('#introDialog').close();updateStudentBadge();startActiveClock();renderTimer();save();
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden'){accrueTime();lastActiveTick=null;save();}
    else{startActiveClock();}
  });
  window.addEventListener('pagehide',()=>{accrueTime();lastActiveTick=null;save();});
  setInterval(()=>{
    if(student && document.visibilityState==='visible')accrueTime();
    renderTimer();
    const minute=Math.floor(activeMs/5000);
    if(student && minute!==lastSaveMinute){lastSaveMinute=minute;save();}
  },1000);
  $('#downloadServerBtn').addEventListener('click',async()=>{
    try{const receipt=await window.JardimCloud.receipt();download('jardimjs_entrega_'+(student?.numero||'aluno')+'.json',JSON.stringify(receipt,null,2),'application/json;charset=utf-8');}
    catch(e){alert('Não foi possível gerar a entrega: '+e.message)}
  });
  $('#finalizeBtn').addEventListener('click',async()=>{
    if(!availableLevels().every(l=>solved.has(l.id))){alert(`Conclua as ${totalLevels()} fases habilitadas antes da entrega definitiva. Você pode baixar um relatório parcial agora.`);return}
    if(!confirm('Finalizar entrega? Depois disso, não será possível alterar os resultados desta sessão.'))return;
    try{accrueTime();const progress={solved:[...solved].sort((a,b)=>a-b),code:savedCode,last:levelIndex+1,startedAt,activeMs,perLevel,deliveryId,bonusEnabled};const result=await window.JardimCloud.finalize(progress);finalized=true;finalizedAt=result.finalizedAt;lockFinalized();updateBonusOffer();alert('Entrega finalizada neste navegador em '+new Date(result.finalizedAt).toLocaleString('pt-BR')+'. Baixe o arquivo e envie ao professor.');}
    catch(e){alert('Não foi possível finalizar: '+e.message)}
  });
  async function initialize(){
    readStored();
    const local=await window.JardimCloud.resume();
    if(local){
      const p=local.progress||{};
      if(Array.isArray(p.solved))solved=new Set(p.solved.filter(n=>Number.isInteger(n)&&n>=1&&n<=levels.length));
      if(p.code&&typeof p.code==='object')savedCode=p.code;
      if(p.perLevel&&typeof p.perLevel==='object')perLevel=p.perLevel;
      if(Number.isFinite(p.activeMs))activeMs=p.activeMs;
      if(p.startedAt)startedAt=p.startedAt;
      deliveryId=local.id;student=local.aluno;
      if(Number.isInteger(p.last)&&p.last>=1&&p.last<=levels.length)levelIndex=p.last-1;
      bonusEnabled=p.bonusEnabled===true&&coreComplete();
      finalized=!!local.finalizedAt;finalizedAt=local.finalizedAt;
    }
    if(!isUnlocked(levelIndex+1))levelIndex=Math.max(0,levels.findIndex(l=>!solved.has(l.id)));
    updateBonusOffer();
    setupBoard();setCommandButtons();loadLevel(levelIndex);updateStudentBadge();renderTimer();initStudentDialog();
    if(finalized)window.JardimCloud.setStatus('✓ Entrega finalizada neste navegador');
  }
  initialize().catch(e=>{window.JardimCloud.setStatus('Erro ao recuperar os dados: '+e.message,true)});
})();
