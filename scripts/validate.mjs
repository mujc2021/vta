import {readFile,access,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=await readFile(path.join(root,'index.html'),'utf8');
const js=await readFile(path.join(root,'data.js'),'utf8');
const context={window:{}};vm.runInNewContext(js,context);const data=context.window.VTA_DATA;
const urls=new Set([...html.matchAll(/(?:src|poster|href)="(assets\/[^"]+)"/g)].map(m=>m[1]));
for(const t of Object.values(data.showcases||{})){urls.add(`assets/videos/${t.video}.mp4`);urls.add(`assets/images/${t.video}.webp`);}
for(const t of data.tasks){urls.add(`assets/videos/${t.video}.mp4`);urls.add(`assets/images/${t.video}.webp`);}
for(const entry of Object.values(data.icl))for(const role of ['reference','execution']){urls.add(`assets/images/${entry[role]}.webp`);if(!(entry.image&&role==='reference'))urls.add(`assets/videos/${entry[role]}.mp4`);}
for(const m of html.matchAll(/data-watch="([^"]+)"/g)){urls.add(`assets/videos/${m[1]}.mp4`);urls.add(`assets/images/${m[1]}.webp`);}
for(const m of html.matchAll(/data-image="([^\"]+)"/g))urls.add(`assets/images/${m[1]}.webp`);
for(const m of html.matchAll(/data-plan="([^"]+)"/g))urls.add(`assets/videos/${m[1]}.mp4`);
const missing=[];for(const url of urls)try{await access(path.join(root,url));}catch{missing.push(url);}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);const duplicateIds=ids.filter((id,i)=>ids.indexOf(id)!==i);
const links=[...html.matchAll(/href="#([^\"]+)"/g)].map(m=>m[1]);const badAnchors=links.filter(link=>!ids.includes(link));
const numeric=[];
for(const [id,benchmark] of Object.entries(data.benchmarks))for(const row of benchmark.rows){if(row.scores.length!==benchmark.tasks.length)numeric.push(`${id}: ${row.name} task count`);if(row.scores.some(n=>n<0||n>100))numeric.push(`${id}: ${row.name} range`);if(id==='real'&&Math.abs(row.scores.reduce((a,b)=>a+b,0)/row.scores.length-row.average)>.001)numeric.push(`${id}: ${row.name} mean`);}
if(missing.length||duplicateIds.length||badAnchors.length||numeric.length){console.error({missing,duplicateIds,badAnchors,numeric});process.exitCode=1;}else console.log(`Validated ${urls.size} local media references, ${ids.length} unique IDs, navigation anchors, and benchmark data.`);
