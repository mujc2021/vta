import http from 'node:http';
import {stat,readFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.woff2':'font/woff2','.ttf':'font/ttf','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  const p=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!p.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const st=await stat(p);if(!st.isFile())throw new Error('not a file');
  const headers={'Content-Type':mime[path.extname(p)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  const range=req.headers.range;
  if(range){const m=/^bytes=(\d+)-(\d*)$/.exec(range);if(!m){res.writeHead(416,{'Content-Range':`bytes */${st.size}`});res.end();return;}
   const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),st.size-1):st.size-1;
   if(start>end||start>=st.size){res.writeHead(416,{'Content-Range':`bytes */${st.size}`});res.end();return;}
   res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${st.size}`,'Content-Length':end-start+1});if(req.method==='HEAD')res.end();else createReadStream(p,{start,end}).pipe(res);
  }else{res.writeHead(200,{...headers,'Content-Length':st.size});if(req.method==='HEAD')res.end();else createReadStream(p).pipe(res);}
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`VTA project page: http://127.0.0.1:${port}`));
