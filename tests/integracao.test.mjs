import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
const dir=mkdtempSync(join(tmpdir(),'jardimjs-test-'));
process.env.LOCAL_DATABASE_URL='file:'+join(dir,'banco.sqlite');
process.env.ADMIN_PASSWORD='SENHA-DO-PROFESSOR-EXEMPLO';
process.env.SESSION_SECRET='test-secret-with-many-random-characters-0123456789';
const {default:handler}=await import('../api/index.js');
async function api(method,path,body={},headers={}){
 let statusCode=200,output='',respHeaders={};
 const req={method,url:'/api'+path,body,headers:{host:'localhost',...headers},socket:{remoteAddress:'127.0.0.1'}};
 const res={setHeader(k,v){respHeaders[k.toLowerCase()]=v;},end(v){output=String(v??'')},get statusCode(){return statusCode},set statusCode(v){statusCode=v}};
 await handler(req,res);
 let json;try{json=JSON.parse(output)}catch{}
 return {statusCode,body:json??output,headers:respHeaders};
}
test('configuração e catálogo de 24 fases',async()=>{
 const js=readFileSync(new URL('../public/niveis.js',import.meta.url),'utf8');
 const levels=JSON.parse(js.slice(js.indexOf('['),js.lastIndexOf(']')+1));
 assert.equal(levels.length,24);assert.deepEqual(levels.map(x=>x.id),Array.from({length:24},(_,i)=>i+1));
 for(const l of levels){assert.ok(l.title&&l.mission&&l.subject);assert.ok(l.world>=1&&l.world<=4);assert.ok(l.start.length===2&&l.goal.length===2);}
});
test('api: aluno, progresso, tentativa, relatório, professor, entrega e exclusão',async()=>{
 const health=await api('GET','/health');assert.equal(health.statusCode,200);assert.equal(health.body.ok,true);
 const reg=await api('POST','/student/register',{nome:'  Carolina  Exemplo  ',turma:'1º Desenvolvimento',numero:'09'});
 assert.equal(reg.statusCode,201);const token=reg.body.token,id=reg.body.id;assert.equal(token.length,64);assert.equal(reg.body.aluno.nome,'Carolina Exemplo');
 const headers={authorization:'Bearer '+token};
 assert.equal((await api('GET','/student/progress',{},{})).statusCode,401);
 const progress={solved:[1],code:{1:'direita(); direita();'},last:1,activeMs:100000,perLevel:{1:{attempts:1,failedAttempts:0,hintsUsed:0,activeMs:100000,totalMoves:2,bestMoves:2,lastMoves:2,bestCode:'direita(); direita();'}}};
 assert.equal((await api('PUT','/student/progress',{progress},headers)).statusCode,200);
 assert.deepEqual((await api('GET','/student/progress',{},headers)).body.progress.solved,[1]);
 const eventId=randomUUID();const attempt={id:eventId,level:1,code:'direita(); direita();',moves:2,success:true,error:''};
 assert.equal((await api('POST','/student/attempt',attempt,headers)).statusCode,200);
 assert.equal((await api('POST','/student/attempt',attempt,headers)).statusCode,200);
 const receipt=await api('GET','/student/receipt',{},headers);assert.equal(receipt.body.tentativasRegistradas.length,1);
 assert.equal((await api('POST','/student/finalize',{progress},headers)).statusCode,400);
 assert.equal((await api('GET','/teacher/students')).statusCode,401);
 assert.equal((await api('POST','/teacher/login',{password:'errada'})).statusCode,401);
 const login=await api('POST','/teacher/login',{password:process.env.ADMIN_PASSWORD});assert.equal(login.statusCode,200);
 const cookie=login.headers['set-cookie'].split(';')[0];const adminHeaders={cookie};
 assert.equal((await api('GET','/teacher/students',{},adminHeaders)).body.students.length,1);
 const csv=await api('GET','/teacher/csv',{},adminHeaders);assert.equal(csv.statusCode,200);assert.match(csv.body,/Carolina Exemplo/);
 const detail=await api('GET','/teacher/student/'+id,{},adminHeaders);assert.equal(detail.statusCode,200);assert.equal(detail.body.attempts.length,1);
 const badGrade=await api('POST','/teacher/student/'+id+'/assessment',{grade:101,feedback:'Boa participação'},adminHeaders);assert.equal(badGrade.statusCode,400);
 const grade=await api('POST','/teacher/student/'+id+'/assessment',{grade:85.5,feedback:'Dominou comandos e pode avançar.'},adminHeaders);assert.equal(grade.statusCode,200);
 const reloaded=await api('GET','/teacher/student/'+id,{},adminHeaders);assert.equal(reloaded.body.assessment.grade,85.5);
 const csvAssessed=await api('GET','/teacher/csv',{},adminHeaders);assert.match(csvAssessed.body,/Dominou comandos/);
 const completed={...progress,solved:Array.from({length:24},(_,i)=>i+1)};
 const finished=await api('POST','/student/finalize',{progress:completed},headers);assert.equal(finished.statusCode,200);
 assert.equal((await api('PUT','/student/progress',{progress:completed},headers)).statusCode,409);
 assert.equal((await api('DELETE','/teacher/student/'+id,{},adminHeaders)).statusCode,200);
 assert.equal((await api('GET','/teacher/students',{},adminHeaders)).body.students.length,0);
 assert.equal((await api('GET','/student/progress',{},headers)).statusCode,401);
});
