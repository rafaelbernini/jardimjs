/* SQLite local no Node 22; libSQL/Turso remoto na Vercel. */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
let database;
let initialized;
async function connect(){
  const remote=process.env.TURSO_DATABASE_URL?.trim();
  if(process.env.VERCEL&&!remote) throw new Error('TURSO_DATABASE_URL é obrigatório na Vercel.');
  if(remote){
    const {createClient}=await import('@libsql/client');
    return createClient({url:remote,authToken:process.env.TURSO_AUTH_TOKEN||undefined});
  }
  const local=process.env.LOCAL_DATABASE_URL||'file:./dados/jardimjs.db';
  if(!local.startsWith('file:')) throw new Error('LOCAL_DATABASE_URL deve começar com file:');
  const filename=resolve(local.slice(5));
  await mkdir(dirname(filename),{recursive:true});
  const {DatabaseSync}=await import('node:sqlite');
  const localDb=new DatabaseSync(filename);
  localDb.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');
  return {async execute(value){
    const sql=typeof value==='string'?value:value.sql;
    const args=typeof value==='string'?[]:(value.args||[]);
    const stmt=localDb.prepare(sql);
    if(/^\s*(SELECT|WITH|PRAGMA)/i.test(sql)) return {rows:stmt.all(...args)};
    const result=stmt.run(...args);
    return {rows:[],rowsAffected:result.changes,lastInsertRowid:result.lastInsertRowid};
  }};
}
export async function db(){if(!database)database=await connect();return database;}
export async function ready(){
  if(!initialized)initialized=(async()=>{
    const d=await db();
    await d.execute(`CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL, classroom TEXT NOT NULL, roll_number TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      progress_json TEXT NOT NULL DEFAULT '{}', finalized_at TEXT
    )`);
    await d.execute(`CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY, student_id TEXT NOT NULL, level INTEGER NOT NULL,
      success INTEGER NOT NULL, moves INTEGER NOT NULL,
      code TEXT NOT NULL, error_text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )`);
    await d.execute('CREATE INDEX IF NOT EXISTS idx_attempts_student ON attempts(student_id,created_at)');
    await d.execute('CREATE INDEX IF NOT EXISTS idx_students_class ON students(classroom,created_at)');
    await d.execute(`CREATE TABLE IF NOT EXISTS assessments (student_id TEXT PRIMARY KEY, grade REAL, feedback TEXT NOT NULL DEFAULT '', assessed_at TEXT NOT NULL, FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE)`);
    await d.execute(`CREATE TABLE IF NOT EXISTS admin_auth_attempts (
      ip_hash TEXT PRIMARY KEY, window_start INTEGER NOT NULL, failures INTEGER NOT NULL DEFAULT 0
    )`);
  })().catch(e=>{initialized=null;throw e});
  return initialized;
}
