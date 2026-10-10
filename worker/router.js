import {configured,sessionFor,reserveLogin,readSmallBody,verifyPassword,constantEqual,createSession,sessionCookie,sameOrigin} from './auth.js';
import {recordInvitations,invitationDashboard,deleteInvitation} from './history.js';
const SECURITY={
  'Cache-Control':'private, no-store, max-age=0','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY',
  'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob:; worker-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'",
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()','Cross-Origin-Resource-Policy':'same-origin','X-Robots-Tag':'noindex, nofollow, noarchive'
};
function respond(body,status=200,headers={}){return new Response(body,{status,headers:{...SECURITY,...headers}});}
function json(body,status=200,headers={}){return respond(JSON.stringify(body),status,{'Content-Type':'application/json; charset=utf-8',...headers});}
function redirect(path,headers={}){return respond(null,303,{Location:path,...headers});}
function bytes(base64){const decoded=atob(base64),result=new Uint8Array(decoded.length);for(let i=0;i<decoded.length;i++)result[i]=decoded.charCodeAt(i);return result;}
export function createWorker(assets){return {async fetch(request,env){
  try{
    const url=new URL(request.url),path=url.pathname;
    if(path==='/login'&&['GET','HEAD'].includes(request.method)){
      if(configured(env)&&await sessionFor(request,env))return redirect('/');
      const message={invalid:'اسم المستخدم أو كلمة المرور غير صحيحة. / Incorrect username or password.',limited:'محاولات كثيرة. حاول مرة أخرى بعد 15 دقيقة. / Too many attempts. Try again in 15 minutes.',expired:'انتهت الجلسة. يرجى تسجيل الدخول مجدداً. / Your session expired. Sign in again.'}[url.searchParams.get('error')]||'';
      return respond(request.method==='HEAD'?null:assets['/login.html'].text.replace('<!--LOGIN_ERROR-->',message),200,{'Content-Type':'text/html; charset=utf-8'});
    }
    const loginAssets=['/login.css','/login.js','/assets/arpa-logo.png','/assets/arpa-cover.jpg'];
    if(loginAssets.includes(path)&&['GET','HEAD'].includes(request.method)){const asset=assets[path];return respond(request.method==='HEAD'?null:asset.text??bytes(asset.base64),200,{'Content-Type':asset.type});}
    if(!configured(env))return respond('Sign in is temporarily unavailable.',503,{'Content-Type':'text/plain; charset=utf-8'});
    if(path==='/api/login'){
      if(request.method!=='POST')return respond('Method not allowed',405,{Allow:'POST'});
      if(!sameOrigin(request,env))return respond('Forbidden',403);
      if(!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded'))return respond('Unsupported content type',415);
      let body;try{body=await readSmallBody(request);}catch{return respond('Request too large',413);}
      const fields=new URLSearchParams(body),username=fields.get('username')||'',password=fields.get('password')||'';
      if(fields.getAll('username').length!==1||fields.getAll('password').length!==1||username.length>64||password.length>128||!username||!password)return redirect('/login?error=invalid');
      const retry=await reserveLogin(request,env);if(retry)return respond('Too many sign-in attempts. Try again later.',429,{'Retry-After':String(retry),'Content-Type':'text/plain; charset=utf-8'});
      const valid=await verifyPassword(password,env.ADMIN_PASSWORD_HASH);
      if(!valid||!constantEqual(username,env.ADMIN_USERNAME))return redirect('/login?error=invalid');
      const old=await sessionFor(request,env);if(old)await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').bind(old.token_hash).run();
      const token=await createSession(env);return redirect('/',{'Set-Cookie':sessionCookie(token,env)});
    }
    const session=await sessionFor(request,env);
    if(!session){if(path==='/'||path==='/index.html'||path==='/dashboard')return redirect('/login',{'Set-Cookie':sessionCookie('',env,true)});return json({error:'Sign in required'},401);}
    if(path==='/api/invitations'){
      if(request.method==='GET'){const result=await invitationDashboard(url,env);return json(result.body,result.status);}
      if(!['POST','DELETE'].includes(request.method))return respond('Method not allowed',405,{Allow:'GET, POST, DELETE'});
      if(!sameOrigin(request,env)||!constantEqual(request.headers.get('X-CSRF-Token')||'',session.csrf_token))return respond('Forbidden',403);
      const result=await (request.method==='DELETE'?deleteInvitation:recordInvitations)(request,env);return json(result.body,result.status);
    }
    if(path==='/api/session'){
      if(request.method!=='GET')return respond('Method not allowed',405,{Allow:'GET'});
      return json({authenticated:true,expiresAt:session.expires_at*1000});
    }
    if(path==='/api/logout'){
      if(request.method!=='POST')return respond('Method not allowed',405,{Allow:'POST'});
      if(!sameOrigin(request,env)||!constantEqual(request.headers.get('X-CSRF-Token')||'',session.csrf_token))return respond('Forbidden',403);
      await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').bind(session.token_hash).run();return json({signedOut:true},200,{'Set-Cookie':sessionCookie('',env,true)});
    }
    if(!['GET','HEAD'].includes(request.method))return respond('Method not allowed',405,{Allow:'GET, HEAD'});
    const key=path==='/'?'/index.html':path==='/dashboard'?'/dashboard.html':path;
    if(!Object.hasOwn(assets,key)||['/login.html','/login.css'].includes(key))return respond('Not found',404);
    const asset=assets[key];let body=request.method==='HEAD'?null:asset.text??bytes(asset.base64);
    if(['/index.html','/dashboard.html'].includes(key)&&body)body=body.replace('<!--CSRF_META-->',`<meta name="csrf-token" content="${session.csrf_token}">`);
    return respond(body,200,{'Content-Type':asset.type,'Vary':'Cookie'});
  }catch{return respond('The service is temporarily unavailable. Please try again.',503,{'Content-Type':'text/plain; charset=utf-8'});}
}};}
