import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('../public/',import.meta.url)));
const mime={'.js':'text/javascript; charset=utf-8','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{
  const uri=new URL(req.url,'http://localhost');
  let path=decodeURIComponent(uri.pathname);if(path==='/')path='/index.html';if(path==='/professor'||path==='/professor/')path='/professor/index.html';
  const absolute=resolve(root,'.'+path);if(!absolute.startsWith(root+sep)){res.writeHead(403).end('Proibido');return}
  const data=await readFile(absolute);res.writeHead(200,{'Content-Type':mime[extname(absolute)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);
 }catch(err){res.writeHead(404).end('Não encontrado')}
});
server.listen(Number(process.env.PORT||3000),()=>console.log('JardimJS: http://localhost:'+(process.env.PORT||3000)));
