import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import handler from '../api/index.js';
import { fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('../public/',import.meta.url)));
const envFile=resolve(fileURLToPath(new URL('../.env',import.meta.url)));
try{const content=await readFile(envFile,'utf8');for(const line of content.split(/\r?\n/)){const m=line.match(/^([A-Z_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'')}}catch{}
if(!process.env.TURSO_DATABASE_URL)await mkdir('dados',{recursive:true});
const mime={'.js':'text/javascript; charset=utf-8','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{
  const uri=new URL(req.url,'http://localhost');
  if(uri.pathname.startsWith('/api/')){
    let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1200000){res.writeHead(413).end('Grande demais');return}}
    try{req.body=raw?JSON.parse(raw):{}}catch{res.writeHead(400).end('JSON inválido');return}
    return handler(req,res);
  }
  let path=decodeURIComponent(uri.pathname);if(path==='/')path='/index.html';if(path==='/professor')path='/professor/index.html';
  const absolute=resolve(root,'.'+path);if(!absolute.startsWith(root+sep)){res.writeHead(403).end('Proibido');return}
  const data=await readFile(absolute);res.writeHead(200,{'Content-Type':mime[extname(absolute)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);
 }catch(err){res.writeHead(404).end('Não encontrado')}
});
server.listen(Number(process.env.PORT||3000),()=>console.log('JardimJS: http://localhost:'+(process.env.PORT||3000)));
