import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { db, ready, getDbInfo } from '../server/db.js';

const sha=s=>createHash('sha256').update(s).digest('hex');
const now=()=>new Date().toISOString();
function send(res,status,value){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(value));}
function text(value,max=100){return String(value??'').trim().replace(/\s+/g,' ').slice(0,max)}
function timingEqual(a,b){let x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length && timingSafeEqual(x,y)}
function authCookie(req){return (req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('jardim_admin='))?.slice('jardim_admin='.length)||''}
function adminAuthorized(req){
  const token=authCookie(req); const [stamp,sig]=token.split('.');
  if(!stamp||!sig||!process.env.SESSION_SECRET||!process.env.ADMIN_PASSWORD) return false;
  const expected=createHmac('sha256',process.env.SESSION_SECRET).update(stamp).digest('hex');
  if(!timingEqual(sig,expected))return false;
  const date=Number(stamp);return Number.isFinite(date)&&date>Date.now()-8*3600_000&&date<Date.now()+60_000;
}
function adminCookie(req,res,value){const secure=(req.headers['x-forwarded-proto']==='https'||req.socket?.encrypted)?'; Secure':'';res.setHeader('Set-Cookie',`jardim_admin=${value}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${value?28800:0}${secure}`)}
function adminToken(){const stamp=String(Date.now());return stamp+'.'+createHmac('sha256',process.env.SESSION_SECRET).update(stamp).digest('hex')}
function safeCsv(x){const s=String(x??'');const neutral=/^[=+@\-\t\r]/.test(s)?"'"+s:s;return '"'+neutral.replace(/"/g,'""')+'"'}
function validateProgress(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Progresso inválido');
  const solved=Array.isArray(input.solved)?[...new Set(input.solved.filter(x=>Number.isInteger(x)&&x>=1&&x<=24))]:[];
  const code={}; for(const [k,v] of Object.entries(input.code||{})){const n=Number(k);if(Number.isInteger(n)&&n>=1&&n<=24&&typeof v==='string')code[n]=v.slice(0,10000)}
  const perLevel={};for(let i=1;i<=24;i++){
    const r=input.perLevel?.[i];if(!r||typeof r!=='object')continue;
    const numeric={};for(const name of ['attempts','failedAttempts','hintsUsed','activeMs','totalMoves','bestMoves','lastMoves']){
      const v=r[name];numeric[name]=v===null&&['bestMoves','lastMoves'].includes(name)?null:Math.max(0,Math.min(10000000,Math.trunc(Number(v)||0)));
    }
    perLevel[i]={...numeric,bestCode:typeof r.bestCode==='string'?r.bestCode.slice(0,10000):'',lastResult:text(r.lastResult,220),firstCompletedAt:typeof r.firstCompletedAt==='string'?r.firstCompletedAt.slice(0,35):null,lastCompletedAt:typeof r.lastCompletedAt==='string'?r.lastCompletedAt.slice(0,35):null,lastAttemptAt:typeof r.lastAttemptAt==='string'?r.lastAttemptAt.slice(0,35):null};
  }
  return {solved,code,perLevel,last:Math.max(1,Math.min(24,Math.trunc(Number(input.last)||1))),activeMs:Math.max(0,Math.min(1e10,Math.trunc(Number(input.activeMs)||0))),startedAt:typeof input.startedAt==='string'?input.startedAt.slice(0,35):null,deliveryId:typeof input.deliveryId==='string'?input.deliveryId.slice(0,100):null};
}
async function studentSession(req){const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();if(!/^[0-9a-f]{64}$/.test(token))return null;const result=await (await db()).execute({sql:'SELECT * FROM students WHERE token_hash = ?',args:[sha(token)]});return result.rows[0]||null}
const progressOf=student=>{try{return JSON.parse(student.progress_json)}catch{return {}}};
async function assessmentMap(d){const r=await d.execute('SELECT student_id,grade,feedback,assessed_at FROM assessments');return new Map(r.rows.map(x=>[x.student_id,{grade:x.grade,feedback:x.feedback,assessedAt:x.assessed_at}]))}
function studentSummary(row){const p=progressOf(row);const values=Object.values(p.perLevel||{});return {id:row.id,nome:row.full_name,turma:row.classroom,numero:row.roll_number,inicio:row.created_at,atualizado:row.updated_at,finalizado:row.finalized_at,fases:p.solved?.length||0,tempoSeg:Math.round((p.activeMs||0)/1000),tentativas:values.reduce((s,r)=>s+(r.attempts||0),0),erros:values.reduce((s,r)=>s+(r.failedAttempts||0),0),dicas:values.reduce((s,r)=>s+(r.hintsUsed||0),0),movimentos:values.reduce((s,r)=>s+(r.totalMoves||0),0)}}
export default async function handler(req,res){
  try{
    const url=new URL(req.url,'http://localhost');const rewritten=req.query?.route??url.searchParams.get('route');const pathname=typeof rewritten==='string'&&rewritten.length?'/'+rewritten.replace(/^\/+/, ''):url.pathname.replace(/^\/api/,'');
    if(req.method==='GET'&&pathname==='/health'){
      await ready();
      await (await db()).execute('SELECT 1 AS online');
      const info=getDbInfo();
      return send(res,200,{ok:true,service:'JardimJS',storage:info.usingRemote?'SQLite remoto (libSQL/Turso)':'SQLite local',vercel:info.onVercel,dbConfigured:info.usingRemote,timestamp:now()});
    }
    if(req.method==='POST'&&!['/student/register','/teacher/login'].includes(pathname)){
      const origin=req.headers.origin;const hostOrigin=process.env.APP_ORIGIN || `${req.headers['x-forwarded-proto']||'http'}://${req.headers.host}`;
      if(origin&&origin!==hostOrigin)return send(res,403,{error:'Origem não autorizada'});
    }
    await ready();
    if(req.method==='POST'&&pathname==='/student/register'){
      const {nome,turma,numero}=req.body||{};
      const full=text(nome,100),classroom=text(turma,50),roll=text(numero,12);
      if(full.length<3||classroom.length<1)return send(res,400,{error:'Informe nome completo e turma.'});
      const token=randomBytes(32).toString('hex'),id=randomUUID(),date=now();
      await (await db()).execute({sql:'INSERT INTO students(id,token_hash,full_name,classroom,roll_number,created_at,updated_at) VALUES(?,?,?,?,?,?,?)',args:[id,sha(token),full,classroom,roll,date,date]});
      return send(res,201,{token,id,aluno:{nome:full,turma:classroom,numero:roll},createdAt:date});
    }
    if(pathname.startsWith('/student/')){
      const row=await studentSession(req);if(!row)return send(res,401,{error:'Sessão de aluno inválida. Identifique-se novamente.'});
      if(req.method==='GET'&&pathname==='/student/progress')return send(res,200,{id:row.id,aluno:{nome:row.full_name,turma:row.classroom,numero:row.roll_number},createdAt:row.created_at,progress:progressOf(row),finalizedAt:row.finalized_at});
      if(req.method==='PUT'&&pathname==='/student/progress'){
        if(row.finalized_at)return send(res,409,{error:'Entrega finalizada: somente leitura.'});
        const progress=validateProgress(req.body?.progress);const date=now();
        await (await db()).execute({sql:'UPDATE students SET progress_json=?,updated_at=? WHERE id=? AND finalized_at IS NULL',args:[JSON.stringify(progress),date,row.id]});
        return send(res,200,{ok:true,updatedAt:date});
      }
      if(req.method==='POST'&&pathname==='/student/attempt'){
        if(row.finalized_at)return send(res,409,{error:'Entrega finalizada.'});
        const body=req.body||{};const level=Number(body.level),moves=Number(body.moves),id=text(body.id,80);
        if(!/^[0-9a-f-]{36}$/i.test(id)||!Number.isInteger(level)||level<1||level>24||!Number.isInteger(moves)||moves<0||moves>300||typeof body.code!=='string'||body.code.length>10000)return send(res,400,{error:'Tentativa inválida'});
        await (await db()).execute({sql:'INSERT OR IGNORE INTO attempts(id,student_id,level,success,moves,code,error_text,created_at) VALUES(?,?,?,?,?,?,?,?)',args:[id,row.id,level,body.success?1:0,moves,body.code,text(body.error,220),now()]});
        return send(res,200,{ok:true});
      }
      if(req.method==='POST'&&pathname==='/student/finalize'){
        const progress=validateProgress(req.body?.progress||progressOf(row));if(progress.solved.length!==24)return send(res,400,{error:'Conclua as 24 fases antes de finalizar.'});
        const date=now();await (await db()).execute({sql:'UPDATE students SET progress_json=?,finalized_at=COALESCE(finalized_at,?),updated_at=? WHERE id=?',args:[JSON.stringify(progress),date,date,row.id]});return send(res,200,{ok:true,finalizedAt:row.finalized_at||date,id:row.id});
      }
      if(req.method==='GET'&&pathname==='/student/receipt'){
        const attempts=await (await db()).execute({sql:'SELECT id,level,success,moves,code,error_text,created_at FROM attempts WHERE student_id=? ORDER BY created_at',args:[row.id]});
        return send(res,200,{formato:'JARDIMJS_SERVIDOR_V3',idEntrega:row.id,emitidoEm:now(),aluno:{nome:row.full_name,turma:row.classroom,numero:row.roll_number},criadoEm:row.created_at,finalizadoEm:row.finalized_at,progresso:progressOf(row),tentativasRegistradas:attempts.rows});
      }
    }
    if(req.method==='POST'&&pathname==='/teacher/login'){
      if(!process.env.ADMIN_PASSWORD||!process.env.SESSION_SECRET||process.env.ADMIN_PASSWORD==='ALTERAR_ANTES_DE_PUBLICAR'||process.env.SESSION_SECRET==='ALTERAR_COM_SEGREDO_ALEATORIO')return send(res,503,{error:'Configure ADMIN_PASSWORD e SESSION_SECRET no ambiente.'});
      const clientIp=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'desconhecido').split(',')[0].trim().slice(0,160);
      const ipHash=sha((process.env.SESSION_SECRET||'')+clientIp);
      const minute=Math.floor(Date.now()/60000), windowBegin=minute-15;
      const d=await db();
      const existing=(await d.execute({sql:'SELECT window_start,failures FROM admin_auth_attempts WHERE ip_hash=?',args:[ipHash]})).rows[0];
      if(existing&&existing.window_start>windowBegin&&existing.failures>=8)return send(res,429,{error:'Muitas tentativas de acesso. Tente novamente em até 15 minutos.'});
      if(!timingEqual(req.body?.password||'',process.env.ADMIN_PASSWORD)){
        if(existing&&existing.window_start>windowBegin){await d.execute({sql:'UPDATE admin_auth_attempts SET failures=failures+1 WHERE ip_hash=?',args:[ipHash]});}
        else{await d.execute({sql:'INSERT INTO admin_auth_attempts(ip_hash,window_start,failures) VALUES(?,?,1) ON CONFLICT(ip_hash) DO UPDATE SET window_start=excluded.window_start,failures=1',args:[ipHash,minute]});}
        return send(res,401,{error:'Senha incorreta'});
      }
      await d.execute({sql:'DELETE FROM admin_auth_attempts WHERE ip_hash=?',args:[ipHash]});
      adminCookie(req,res,adminToken());return send(res,200,{ok:true});
    }
    if(req.method==='POST'&&pathname==='/teacher/logout'){adminCookie(req,res,'');return send(res,200,{ok:true})}
    if(pathname.startsWith('/teacher/')){
      if(!adminAuthorized(req))return send(res,401,{error:'Acesso restrito ao professor'});
      if(req.method==='GET'&&pathname==='/teacher/students'){
        const d=await db(),rows=await d.execute('SELECT * FROM students ORDER BY classroom,full_name,created_at'),grades=await assessmentMap(d);return send(res,200,{students:rows.rows.map(r=>({...studentSummary(r),assessment:grades.get(r.id)||null}))});
      }
      if(req.method==='GET'&&pathname==='/teacher/csv'){
        const d=await db(),rows=await d.execute('SELECT * FROM students ORDER BY classroom,full_name'),grades=await assessmentMap(d);const cols=['turma','numero','nome','fases','tempoSeg','tentativas','erros','dicas','movimentos','nota','observacaoProfessor','avaliadoEm','inicio','atualizado','finalizado','id'];const content='﻿'+cols.join(';')+'\r\n'+rows.rows.map(r=>{const a=grades.get(r.id)||{};const s={...studentSummary(r),nota:a.grade??'',observacaoProfessor:a.feedback||'',avaliadoEm:a.assessedAt||''};return cols.map(k=>safeCsv(s[k])).join(';')}).join('\r\n');
        res.statusCode=200;res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition','attachment; filename="jardimjs_resultados.csv"');return res.end(content);
      }
      const match=pathname.match(/^\/teacher\/student\/([a-f0-9-]{36})$/);
      const evalMatch=pathname.match(/^\/teacher\/student\/([a-f0-9-]{36})\/assessment$/);
      if(req.method==='POST'&&evalMatch){
        const input=req.body||{};
        const grade=(input.grade===null||input.grade===''||input.grade===undefined)?null:Number(input.grade);
        if(grade!==null&&(!Number.isFinite(grade)||grade<0||grade>100||Math.round(grade*10)!==grade*10))return send(res,400,{error:'A nota deve ser entre 0 e 100, com no máximo uma casa decimal.'});
        if(typeof input.feedback!=='string'||input.feedback.length>2000)return send(res,400,{error:'Observações devem ter até 2.000 caracteres.'});
        const d=await db();const exists=await d.execute({sql:'SELECT id FROM students WHERE id=?',args:[evalMatch[1]]});
        if(!exists.rows.length)return send(res,404,{error:'Aluno não encontrado'});
        const assessment={grade,feedback:input.feedback.trim(),assessedAt:now()};
        await d.execute({sql:'INSERT INTO assessments(student_id,grade,feedback,assessed_at) VALUES(?,?,?,?) ON CONFLICT(student_id) DO UPDATE SET grade=excluded.grade,feedback=excluded.feedback,assessed_at=excluded.assessed_at',args:[evalMatch[1],grade,assessment.feedback,assessment.assessedAt]});
        return send(res,200,{ok:true,assessment});
      }
      if(req.method==='DELETE'&&match){
        const d=await db();
        await d.execute({sql:'DELETE FROM assessments WHERE student_id=?',args:[match[1]]});
        await d.execute({sql:'DELETE FROM attempts WHERE student_id=?',args:[match[1]]});
        const changed=await d.execute({sql:'DELETE FROM students WHERE id=?',args:[match[1]]});
        return send(res,200,{ok:changed.rowsAffected>0});
      }
      if(req.method==='GET'&&match){const result=await (await db()).execute({sql:'SELECT * FROM students WHERE id=?',args:[match[1]]});const row=result.rows[0];if(!row)return send(res,404,{error:'Aluno não encontrado'});const d=await db(), attempts=await d.execute({sql:'SELECT id,level,success,moves,code,error_text,created_at FROM attempts WHERE student_id=? ORDER BY created_at DESC LIMIT 1000',args:[row.id]}), grades=await assessmentMap(d);return send(res,200,{student:studentSummary(row),progress:progressOf(row),attempts:attempts.rows,assessment:grades.get(row.id)||null});}
    }
    return send(res,404,{error:'Rota não encontrada'});
  } catch(e){
    console.error('JardimJS API',e);
    const msg=e?.message||String(e);
    if(msg.includes('TURSO_DATABASE_URL')||msg.includes('Turso')||msg.includes('libsql')) return send(res,500,{error:'Banco remoto não configurado. Defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN na Vercel.'});
    if(msg.includes('SESSION_SECRET')||msg.includes('ADMIN_PASSWORD')) return send(res,503,{error:'Configuração de autenticação incompleta. Defina ADMIN_PASSWORD e SESSION_SECRET.'});
    return send(res,500,{error:'Erro interno no servidor. Verifique logs da função.'});
  }
}