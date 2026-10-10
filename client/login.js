const button=document.getElementById('toggle-password'),password=document.getElementById('password');
button.addEventListener('click',()=>{
  const visible=password.type==='password';password.type=visible?'text':'password';
  button.setAttribute('aria-pressed',String(visible));
  button.setAttribute('aria-label',visible?'إخفاء كلمة المرور · Hide password':'إظهار كلمة المرور · Show password');
});
window.addEventListener('pagehide',()=>{password.type='password';password.value='';});
