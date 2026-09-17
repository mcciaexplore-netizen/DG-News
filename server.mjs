import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderSearchHtml} from './seo.mjs';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'public');
const allowed=new Set(['index.html','app.mjs','core.mjs','seo.mjs','style.css','records.json','metadata.json','mccia-logo.png','media-illustration.png','verified-records.csv']);
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.csv':'text/csv; charset=utf-8'};
const port=Number(process.env.PORT||3005);
http.createServer(async(req,res)=>{
try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const url=new URL(req.url,'http://127.0.0.1');
 const file=decodeURIComponent(url.pathname).slice(1)||'index.html';
 const records=JSON.parse(await fs.readFile(path.join(root,'records.json'),'utf8'));
 const asset=/^clipping-[A-Za-z0-9-]+\.webp$/.test(file)&&records.some(r=>r.clippingUrl==='/'+file);
 if(!allowed.has(file)&&!asset){res.writeHead(404);res.end('Not found');return;}
 let data=await fs.readFile(path.join(root,file));
 if(file==='index.html')data=Buffer.from(renderSearchHtml(data.toString(),url.search,records));
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'});
 res.end(req.method==='HEAD'?undefined:data);
}catch{res.writeHead(500);res.end('Preview unavailable');}
}).listen(port,'127.0.0.1',()=>console.log('Director News: http://127.0.0.1:'+port));
