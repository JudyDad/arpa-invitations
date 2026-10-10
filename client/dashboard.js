const $=id=>document.getElementById(id);
let page=1,state=null,version=0,reporting=false,loading=false,deleting=false,selectedRecord=null,activeFilters=new URLSearchParams();
const dates=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Damascus',dateStyle:'medium',timeStyle:'short'});
function message(text,bad=false){$('dashboard-status').textContent=text;$('dashboard-status').classList.toggle('bad',bad);}
function expired(){ $('history').replaceChildren();$('delete-dialog').close();selectedRecord=null;location.replace('/login?error=expired'); }
async function fetchHistory(params){
  const response=await fetch('/api/invitations?'+params,{cache:'no-store'});
  if(response.status===401){expired();throw new Error('expired');}
  if(!response.ok)throw new Error('load');return response.json();
}
function filters(){return new URLSearchParams({q:$('search').value.trim(),language:$('language').value,from:$('from').value,to:$('to').value});}
function controls(){
  const busy=loading||reporting||deleting;
  $('previous').disabled=busy||!state||page<=1;$('next').disabled=busy||!state||page>=state.pages;
  $('report').disabled=busy||!state?.filtered.total;$('refresh').disabled=busy;
  $('filters').querySelectorAll('input,select,button').forEach(control=>control.disabled=busy);
  $('history').querySelectorAll('button').forEach(control=>control.disabled=busy);
  $('confirm-delete').disabled=deleting;$('cancel-delete').disabled=deleting;
}
function openDelete(record){
  if(loading||reporting||deleting)return;selectedRecord=record;
  $('delete-name').textContent=record.name;
  $('delete-details').textContent=`${record.language==='ar'?'العربية · Arabic':'English'} · ${dates.format(record.created_at)}`;
  $('delete-error').textContent='';$('delete-dialog').showModal();$('cancel-delete').focus();
}
function renderRecord(record){
  const tr=document.createElement('tr'),name=document.createElement('td');name.textContent=record.name;name.dir='auto';
  const language=document.createElement('td'),badge=document.createElement('span');badge.className='language-badge';badge.textContent=record.language==='ar'?'العربية · Arabic':'English';language.append(badge);
  const date=document.createElement('td'),time=document.createElement('time');time.dateTime=new Date(record.created_at).toISOString();time.textContent=dates.format(record.created_at);date.append(time);
  const source=document.createElement('td');source.textContent=record.source==='excel'?'Excel':'فردية · Single';
  const size=document.createElement('td');size.dir='ltr';size.textContent=`${record.width} × ${record.height}`;
  const action=document.createElement('td'),button=document.createElement('button');button.type='button';button.className='delete-row';button.textContent='حذف · Delete';button.setAttribute('aria-label',`حذف الدعوة · Delete invitation: ${record.name}`);button.addEventListener('click',()=>openDelete(record));action.append(button);
  tr.append(name,language,date,source,size,action);return tr;
}
async function load(){
  const current=++version;loading=true;controls();message('جارٍ تحميل السجل… · Loading history…');
  try{
    const params=new URLSearchParams(activeFilters);params.set('page',String(page));const result=await fetchHistory(params);if(current!==version)return false;
    state=result;page=result.page;
    for(const id of ['total','arabic','english','recipients'])$(id).textContent=result.totals[id].toLocaleString('en-GB');
    $('history').replaceChildren(...result.records.map(renderRecord));
    const total=result.filtered.total;$('matches').textContent=`${total.toLocaleString('en-GB')} دعوة مطابقة · Matching invitations`;
    $('empty').hidden=total!==0;$('empty').textContent=result.totals.total?'لا توجد نتائج لهذه الفلاتر. · No invitations match these filters.':'أنشئ أول دعوة لتظهر هنا. · Generate your first invitation to start the history.';
    $('page').textContent=`${page} / ${result.pages}`;message('');return true;
  }catch{
    if(current===version){state=null;$('history').replaceChildren();$('empty').hidden=true;message('تعذّر تحميل السجل. أعد المحاولة. · Unable to load history. Please retry.',true);}return false;
  }finally{if(current===version){loading=false;controls();}}
}
$('filters').addEventListener('submit',event=>{
  event.preventDefault();if(loading||reporting||deleting)return;
  if($('from').value&&$('to').value&&$('from').value>$('to').value){message('اختر نطاق تاريخ صحيحاً. · Choose a valid date range.',true);return;}
  activeFilters=filters();page=1;load();
});
$('reset').addEventListener('click',()=>{if(loading||reporting||deleting)return;HTMLFormElement.prototype.reset.call($('filters'));activeFilters=filters();page=1;load();});
$('refresh').addEventListener('click',load);$('previous').addEventListener('click',()=>{page--;load();});$('next').addEventListener('click',()=>{page++;load();});
$('cancel-delete').addEventListener('click',()=>{if(!deleting){$('delete-dialog').close();selectedRecord=null;}});
$('delete-dialog').addEventListener('cancel',event=>{if(deleting)event.preventDefault();else selectedRecord=null;});
$('confirm-delete').addEventListener('click',async()=>{
  if(!selectedRecord||deleting)return;deleting=true;controls();$('delete-error').textContent='جارٍ الحذف… · Deleting…';
  try{
    const response=await fetch('/api/invitations',{method:'DELETE',headers:{'Content-Type':'application/json','X-CSRF-Token':document.querySelector('meta[name=csrf-token]').content},body:JSON.stringify({id:selectedRecord.id})});
    if(response.status===401){expired();return;}
    if(!response.ok&&response.status!==404)throw new Error('delete');
    $('delete-dialog').close();selectedRecord=null;deleting=false;
    if(await load())message('تم حذف السجل وتحديث الإحصائيات. · Entry deleted and counts updated.');
    document.querySelector('.table-wrap').focus();
  }catch{$('delete-error').textContent='تعذّر الحذف. تحقق من الاتصال ثم أعد المحاولة. · Unable to delete. Check your connection and retry.';}
  finally{deleting=false;controls();}
});
$('report').addEventListener('click',async()=>{
  if(loading||reporting||deleting||!state)return;
  if(state.filtered.total>10000){message('قلّل النتائج إلى 10000 دعوة باستخدام الفلاتر. · Filter the report to 10,000 invitations or fewer.',true);return;}
  reporting=true;controls();message('جارٍ إعداد تقرير Excel… · Preparing Excel report…');
  try{
    const initial=state.filtered.total,params=new URLSearchParams(activeFilters),rows=[['Name','Language','Created (Damascus)','Created (UTC)','Source','Width','Height']];
    for(let index=1;index<=state.pages;index++){
      params.set('page',String(index));const result=await fetchHistory(params);if(result.filtered.total!==initial)throw new Error('changed');
      for(const record of result.records)rows.push([record.name,record.language,dates.format(record.created_at),new Date(record.created_at).toISOString(),record.source,record.width,record.height]);
    }
    if(rows.length-1!==initial)throw new Error('changed');
    const workbook=XLSX.utils.book_new(),sheet=XLSX.utils.aoa_to_sheet(rows);sheet['!cols']=[{wch:35},{wch:12},{wch:28},{wch:28},{wch:12},{wch:12},{wch:12}];XLSX.utils.book_append_sheet(workbook,sheet,'Invitations');XLSX.writeFile(workbook,'ARPA-invitation-report.xlsx');message('التقرير جاهز. · Report downloaded.');
  }catch(error){message(error.message==='changed'?'تغيّر السجل أثناء التصدير. حدّث الصفحة وأعد المحاولة. · History changed; refresh and retry.':'تعذّر تصدير التقرير. أعد المحاولة. · Unable to export the report. Please retry.',true);}
  finally{reporting=false;controls();}
});
$('logout').addEventListener('click',async()=>{
  try{const response=await fetch('/api/logout',{method:'POST',headers:{'X-CSRF-Token':document.querySelector('meta[name=csrf-token]').content}});if(response.ok||response.status===401){$('history').replaceChildren();$('delete-dialog').close();selectedRecord=null;location.replace('/login');}else throw new Error('logout');}
  catch{message('تعذّر تسجيل الخروج. أعد المحاولة. · Unable to sign out. Please retry.',true);}
});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});window.addEventListener('pagehide',()=>{$('history').replaceChildren();selectedRecord=null;});
async function checkSession(){if(document.visibilityState!=='visible')return;try{const response=await fetch('/api/session',{cache:'no-store'});if(response.status===401)expired();}catch{}}
setInterval(checkSession,60000);document.addEventListener('visibilitychange',checkSession);load();
