import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
const root=process.cwd(),output=path.resolve(root,'dist');
if(output!==path.join(root,'dist')||!output.startsWith(root+path.sep))throw new Error('Unsafe build output');
const resources=['index.html','styles.css','thmanyah.css','app.js','core.js','excel-worker.js','login.html','login.css','assets/template-ar.jpg','assets/template-en.jpg','assets/clean-ar.jpg','assets/clean-en.jpg','assets/aref-ruqaa-bold.ttf','assets/libre-baskerville.ttf','assets/xlsx.full.min.js','assets/jszip.min.js'];
resources.push('login.js','assets/arpa-logo.png','assets/arpa-cover.jpg');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.ttf':'font/ttf'};
const assets=Object.create(null);
for(const file of resources){const data=await readFile(path.join(root,'client',file)),extension=path.extname(file);assets['/'+file]={type:types[extension],...(['.html','.css','.js'].includes(extension)?{text:data.toString('utf8')}:{base64:data.toString('base64')})};}
const auth=await readFile('worker/auth.js','utf8'),router=(await readFile('worker/router.js','utf8')).replace(/^import[^\n]+\n/,'');
const source=`${auth}\n${router}\nconst ASSETS=${JSON.stringify(assets)};\nexport default createWorker(ASSETS);\n`;
const compressed=gzipSync(source).length;if(compressed>9.5*1024*1024)throw new Error('Worker exceeds deployment size budget');
await rm(output,{recursive:true,force:true});await mkdir(path.join(output,'server'),{recursive:true});await mkdir(path.join(output,'.openai'),{recursive:true});
await writeFile(path.join(output,'server/index.js'),source);await writeFile(path.join(output,'.openai/hosting.json'),await readFile('.openai/hosting.json'));
console.log(JSON.stringify({workerBytes:Buffer.byteLength(source),compressedBytes:compressed,protectedAssets:resources.length}));
