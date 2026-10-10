const encoder=new TextEncoder();
const SESSION_SECONDS=8*60*60;
const RATE_SECONDS=15*60;
export function hex(bytes){return Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');}
export async function digest(text){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(text)));}
export function randomToken(){return hex(crypto.getRandomValues(new Uint8Array(32)));}
export function constantEqual(a,b){let different=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)different|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return different===0;}
export async function verifyPassword(password,stored){
  if(typeof stored!=='string'||!/^100000\.[a-f0-9]{64}\.[a-f0-9]{64}$/.test(stored))throw new Error('configuration');
  const [,salt,expected]=stored.split('.'),saltBytes=Uint8Array.from(salt.match(/../g),pair=>parseInt(pair,16));
  const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
  const actual=hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:saltBytes,iterations:100000,hash:'SHA-256'},key,256));return constantEqual(actual,expected);
}
export function localOrigin(env){try{const url=new URL(env.APP_ORIGIN);return url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname);}catch{return false;}}
export function cookieName(env){return localOrigin(env)?'arpa_local_session':'__Host-arpa_session';}
export function sessionCookie(token,env,clear=false){return `${cookieName(env)}=${clear?'':token}; Path=/; HttpOnly; SameSite=Strict; ${localOrigin(env)?'':'Secure; '}Max-Age=${clear?0:SESSION_SECONDS}`;}
export function cookieToken(request,env){const parts=(request.headers.get('Cookie')||'').split(';').map(part=>part.trim());const matches=parts.filter(part=>part.startsWith(cookieName(env)+'='));if(matches.length!==1)return null;const token=matches[0].slice(cookieName(env).length+1);return /^[a-f0-9]{64}$/.test(token)?token:null;}
export function sameOrigin(request,env){return request.headers.get('Origin')===env.APP_ORIGIN;}
export function configured(env){return !!env.DB&&typeof env.ADMIN_USERNAME==='string'&&!!env.ADMIN_PASSWORD_HASH&&!!env.APP_ORIGIN;}
export async function sessionFor(request,env,now=Math.floor(Date.now()/1000)){
  const token=cookieToken(request,env);if(!token)return null;const hash=await digest(token);
  const row=await env.DB.prepare('SELECT token_hash, csrf_token, expires_at, credential_version FROM auth_sessions WHERE token_hash = ? AND expires_at > ?').bind(hash,now).first();
  if(!row||!constantEqual(row.credential_version,await digest(env.ADMIN_USERNAME+'\n'+env.ADMIN_PASSWORD_HASH)))return null;
  return row;
}
export async function reserveLogin(request,env,now=Math.floor(Date.now()/1000)){
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';const keys=['ip:'+await digest(ip),'admin'];
  const query='INSERT INTO auth_attempts (attempt_key, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(attempt_key) DO UPDATE SET attempts = CASE WHEN auth_attempts.expires_at <= ? THEN 1 ELSE auth_attempts.attempts + 1 END, expires_at = CASE WHEN auth_attempts.expires_at <= ? THEN excluded.expires_at ELSE auth_attempts.expires_at END RETURNING attempts, expires_at';
  const results=await env.DB.batch(keys.map(key=>env.DB.prepare(query).bind(key,now+RATE_SECONDS,now,now)));
  const records=results.map(result=>result.results[0]);const limited=records.find((row,i)=>row.attempts>(i===0?10:50));
  return limited?Math.max(1,limited.expires_at-now):0;
}
export async function createSession(env,now=Math.floor(Date.now()/1000)){
  const token=randomToken(),csrf=randomToken(),hash=await digest(token),version=await digest(env.ADMIN_USERNAME+'\n'+env.ADMIN_PASSWORD_HASH);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM auth_sessions WHERE expires_at <= ?').bind(now),
    env.DB.prepare('DELETE FROM auth_attempts WHERE expires_at <= ?').bind(now),
    env.DB.prepare('INSERT INTO auth_sessions (token_hash, csrf_token, expires_at, credential_version) VALUES (?, ?, ?, ?)').bind(hash,csrf,now+SESSION_SECONDS,version)
  ]);return token;
}
export async function readSmallBody(request,limit=2048){
  if(Number(request.headers.get('Content-Length')||0)>limit)throw new Error('large');
  const reader=request.body?.getReader();if(!reader)return '';let size=0;const chunks=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new Error('large');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return new TextDecoder().decode(bytes);
}
