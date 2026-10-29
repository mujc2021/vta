import {mkdir,cp,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'dist');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const file of ['index.html','styles.css','app.js','data.js','.nojekyll','assets'])await cp(path.join(root,file),path.join(output,file),{recursive:true,filter:source=>!source.endsWith('.json')&&path.basename(source)!=='.DS_Store'});
console.log(`Static site ready: ${output}`);
