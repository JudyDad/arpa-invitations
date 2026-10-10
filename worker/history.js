import {validateName} from '../client/core.js';
import {digest,readSmallBody} from './auth.js';
export async function recordInvitations(request,env){
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return {status:415,body:{error:'Use JSON'}};
  let data;try{data=JSON.parse(await readSmallBody(request,8192));}catch{return {status:400,body:{error:'Invalid request'}};}
  if(!data||typeof data.operationId!=='string'||! /^[a-f0-9-]{36}$/i.test(data.operationId)||!['single','excel'].includes(data.source)||!Array.isArray(data.items)||data.items.length<1||data.items.length>5||(data.source==='single'&&data.items.length!==1))return {status:400,body:{error:'Invalid generation'}};
  const items=[];
  for(const item of data.items){if(!item||typeof item.name!=='string'||typeof item.language!=='string')return {status:400,body:{error:'Invalid recipient'}};const result=validateName(item.name,item.language);if(result.error||![[4000,5000],[3200,4000],[2560,3200]].some(([w,h])=>w===item.width&&h===item.height))return {status:400,body:{error:'Invalid recipient or image size'}};items.push({name:result.name,language:item.language,width:item.width,height:item.height});}
  const hash=await digest(JSON.stringify({source:data.source,items})),now=Date.now();
  const statements=[env.DB.prepare('INSERT OR IGNORE INTO invitation_operations (id,payload_hash,created_at) VALUES (?,?,?)').bind(data.operationId,hash,now)];
  items.forEach((item,index)=>statements.push(env.DB.prepare('INSERT OR IGNORE INTO invitation_history (id,operation_id,row_index,name,language,source,width,height,created_at) SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM invitation_operations WHERE id=? AND payload_hash=?)').bind(data.operationId+':'+index,data.operationId,index,item.name,item.language,data.source,item.width,item.height,now,data.operationId,hash)));
  await env.DB.batch(statements);
  const operation=await env.DB.prepare('SELECT payload_hash FROM invitation_operations WHERE id=?').bind(data.operationId).first();
  if(operation.payload_hash!==hash)return {status:409,body:{error:'Generation identifier already used'}};
  return {status:200,body:{recorded:items.length}};
}
function dateBound(value,end=false){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('date');const date=new Date(value+'T00:00:00+03:00');if(!Number.isFinite(date.getTime())||new Date(date.getTime()+3*3600000).toISOString().slice(0,10)!==value)throw new Error('date');return date.getTime()+(end?86400000:0);}
export async function invitationDashboard(url,env){
  const query=url.searchParams,q=(query.get('q')||'').normalize('NFC').trim(),language=query.get('language')||'',from=query.get('from')||'',to=query.get('to')||'',pageText=query.get('page')||'1';
  if(q.length>80||!['','ar','en'].includes(language)||!/^\d{1,6}$/.test(pageText)||Number(pageText)<1)return {status:400,body:{error:'Invalid filter'}};
  const conditions=[],values=[];if(q){conditions.push("name LIKE ? ESCAPE '\\'");values.push('%'+q.replace(/[\\%_]/g,char=>'\\'+char)+'%');}if(language){conditions.push('language=?');values.push(language);}
  try{const start=from?dateBound(from):null,end=to?dateBound(to,true):null;if(start!==null&&end!==null&&start>=end)throw new Error('date');if(start!==null){conditions.push('created_at>=?');values.push(start);}if(end!==null){conditions.push('created_at<?');values.push(end);}}catch{return {status:400,body:{error:'Invalid date range'}};}
  const where=conditions.length?' WHERE '+conditions.join(' AND '):'',aggregate="COUNT(*) AS total, COALESCE(SUM(language='ar'),0) AS arabic, COALESCE(SUM(language='en'),0) AS english, COUNT(DISTINCT language||':'||lower(name)) AS recipients";
  const totals=await env.DB.prepare('SELECT '+aggregate+' FROM invitation_history').first(),filtered=await env.DB.prepare('SELECT '+aggregate+' FROM invitation_history'+where).bind(...values).first();
  const pages=Math.max(1,Math.ceil(filtered.total/50)),page=Math.min(Number(pageText),pages);
  const records=await env.DB.prepare('SELECT id,name,language,source,width,height,created_at FROM invitation_history'+where+' ORDER BY created_at DESC,id DESC LIMIT 50 OFFSET ?').bind(...values,(page-1)*50).all();
  return {status:200,body:{totals,filtered,records:records.results,page,pages,pageSize:50}};
}
