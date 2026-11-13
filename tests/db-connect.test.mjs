import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Configuração de ambiente de teste
const testDir = mkdtempSync(join(tmpdir(), 'jardimjs-db-test-'));
process.env.LOCAL_DATABASE_URL = 'file:' + join(testDir, 'banco.sqlite');
process.env.ADMIN_PASSWORD = 'SENHA-TESTE-PROFESSOR-123456';
process.env.SESSION_SECRET = 'test-secret-with-many-random-characters-0123456789';

const { db, ready, getDbInfo, isVercel } = await import('../server/db.js');

test('db: getDbInfo detecta ambiente local corretamente', async () => {
  const info = getDbInfo();
  assert.equal(info.onVercel, false);
  assert.equal(info.usingRemote, false);
  assert.equal(info.hasToken, false);
});

test('db: conecta ao SQLite local e inicializa tabelas', async () => {
  await ready();
  const d = await db();
  const result = await d.execute('SELECT 1 AS ok');
  assert.equal(result.rows[0].ok, 1);
});

test('db: tabelas criadas corretamente', async () => {
  const d = await db();
  const tables = await d.execute(`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `);
  const names = tables.rows.map(r => r.name).sort();
  assert.deepEqual(names, ['admin_auth_attempts', 'assessments', 'attempts', 'students']);
});

test('db: health check funciona', async () => {
  const { default: handler } = await import('../api/index.js');

  async function api(method, path, body = {}, headers = {}) {
    let statusCode = 200, output = '';
    const req = { method, url: '/api' + path, body, headers: { host: 'localhost', ...headers }, socket: { remoteAddress: '127.0.0.1' } };
    const res = {
      setHeader() {},
      end(v) { output = String(v ?? '') },
      get statusCode() { return statusCode },
      set statusCode(v) { statusCode = v }
    };
    await handler(req, res);
    let json;
    try { json = JSON.parse(output) } catch {}
    return { statusCode, body: json ?? output };
  }

  const health = await api('GET', '/health');
  assert.equal(health.statusCode, 200);
  assert.equal(health.body.ok, true);
  assert.equal(health.body.service, 'JardimJS');
  assert.equal(health.body.storage, 'SQLite local');
  assert.equal(health.body.vercel, false);
  assert.equal(health.body.dbConfigured, false);
  assert.ok(health.body.timestamp);
});

test('db: isVercel detecta variaveis de ambiente Vercel', async () => {
  // Sem variaveis Vercel
  delete process.env.VERCEL;
  delete process.env.VERCEL_REGION;
  delete process.env.VERCEL_ENV;
  assert.equal(isVercel(), false);

  // Com VERCEL=1
  process.env.VERCEL = '1';
  assert.equal(isVercel(), true);

  // Com VERCEL_REGION
  delete process.env.VERCEL;
  process.env.VERCEL_REGION = 'iad1';
  assert.equal(isVercel(), true);

  // Com VERCEL_ENV
  delete process.env.VERCEL_REGION;
  process.env.VERCEL_ENV = 'production';
  assert.equal(isVercel(), true);

  delete process.env.VERCEL_ENV;
});