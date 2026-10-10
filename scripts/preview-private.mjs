import http from 'node:http';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {localDB} from './local-db.mjs';
import {createWorker} from '../worker/router.js';
const salt=randomBytes(32),hash='100000.'+salt.toString('hex')+'.'+pbkdf2Sync('local-test-password!',salt,100000,32,'sha256').toString('hex');
const env={DB:localDB(),APP_ORIGIN:'http://127.0.0.1:4173',ADMIN_USERNAME:'arpa',ADMIN_PASSWORD_HASH:hash};
const assets=Object.create(null),types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.ttf':'font/ttf','.txt':'text/plain'};
async function walk(directory,prefix=''){for(const item of await readdir(directory,{withFileTypes:true})){const relative=prefix+item.name,filename=path.join(directory,item.name);if(item.isDirectory())await walk(filename,relative+'/');else{const bytes=await readFile(filename),extension=path.extname(item.name);assets['/'+relative]={type:types[extension]||'application/octet-stream',...(['.html','.css','.js','.txt'].includes(extension)?{text:bytes.toString('utf8')}:{base64:bytes.toString('base64')})};}}}
await walk(path.resolve('client'));const worker=createWorker(assets);
const server=http.createServer(async(req,res)=>{try{const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>2048){res.writeHead(413);res.end();return;}chunks.push(chunk);}const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);const request=new Request(env.APP_ORIGIN+req.url,{method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});const result=await worker.fetch(request,env);res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));}catch{res.writeHead(503);res.end('Preview unavailable');}});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/login'));
