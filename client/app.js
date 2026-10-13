import { normalizeName, validateName, importRows, fileName } from './core.js';
import {recordGeneration} from './generation-history.js';
const $ = id => document.getElementById(id);
const copy = {
  ar: { eyebrow:'دعوات الحفل', title:'دعوة باسم ضيفك', intro:'اكتب الاسم مع اللقب، وستكون الدعوة جاهزة للحفظ.', language:'لغة الدعوة', name:'اسم الضيف مع اللقب', placeholder:'السيّد جميل البيطار', hint:'أحرف عربية أو إنجليزية أو مزيج منهما، مع اللقب إن رغبت.', download:'حفظ الدعوة', export:'PNG عالي الجودة · 4000 × 5000', batch:'استيراد أسماء من Excel', description:'عمود Name للأسماء، وعمود Language اختياري (ar أو en). عند ترك اللغة فارغة تُستخدم اللغة المحددة أعلاه.', file:'اختيار ملف Excel', sample:'تحميل نموذج', sheet:'ورقة العمل', review:'مراجعة الأسماء', help:'صحّح الصفوف غير الصالحة أو احذفها قبل الحفظ.', zip:'ملفات ZIP صغيرة للحفظ على الهاتف. نزّل الملف قبل إنشاء المجموعة التالية.', privacy:'تُعالج الأسماء على جهازك فقط ولا يتم تخزينها.', preview:'معاينة الدعوة', caption:'تبقى تفاصيل الحفل والشعارات ثابتة.', footer:'بمراحم الرب أغنّي', loading:'جارٍ تجهيز الدعوة…', ready:'الدعوة جاهزة للحفظ.', preparing:'جارٍ تجهيز الصور…', cancelled:'تم إلغاء إنشاء الملف.', cancel:'إلغاء', save:'حفظ الصورة', saveHelp:'اضغط مطولاً على الصورة لحفظها، أو استخدم زر التنزيل.', saved:'الصورة جاهزة. إذا لم يبدأ التنزيل، استخدم الصورة المعروضة للحفظ.', remove:'حذف الصف', valid:'صالحة', invalid:'تحتاج تصحيحاً', generation:'إنشاء ZIP', downloadZip:'تنزيل ZIP', done:'الملف جاهز للتنزيل.', empty:'أدخل اسم الضيف قبل الحفظ.', length:'يجب ألا يزيد الاسم عن 80 حرفاً.', script:'استخدم أحرفاً عربية أو إنجليزية وتشكيلًا مناسباً في النسخة العربية.', characters:'استخدم الأحرف والمسافات والنقطة والفاصلة العليا والشرطة فقط؛ لا أرقام أو رموز.', letters:'يجب أن يحتوي الاسم على حرف واحد على الأقل.', fit:'الاسم طويل جداً لعرضه بوضوح. اختصر الاسم أو اللقب.', badLanguage:'اختر ar أو en لهذا الصف.', missingColumn:'لم يتم العثور على عمود Name. استخدم النموذج المتاح.', emptyWorkbook:'لا توجد أسماء في ورقة العمل.', tooManyRows:'استورد 500 اسم أو أقل في كل مرة.', fileSize:'حجم الملف الأقصى 10 ميغابايت.', badFile:'اختر ملف Excel بصيغة .xlsx أو .xls صالح وغير محمي بكلمة مرور.', loadError:'تعذّر تحميل الخطوط أو الدعوة. تحقق من الاتصال ثم أعد المحاولة.', exportError:'تعذّر تجهيز الصورة. أعد المحاولة.', zipError:'تعذّر إنشاء ZIP. جرّب عددًا أقل من الأسماء.', retry:'إعادة المحاولة', imported:'تم استيراد الأسماء. راجعها قبل الحفظ.', unavailable:'تعذّر تحميل أدوات Excel. أعد تحميل الصفحة.', tooLargeSheet:'ورقة العمل كبيرة جداً. استخدم ملفاً يحتوي على الأسماء فقط.' },
  en: { eyebrow:'CONCERT INVITATIONS', title:'An invitation, personally yours.', intro:'Enter your guest’s name and title. Your invitation is ready to save.', language:'Invitation language', name:'Guest name and title', placeholder:'Mr. John Doe', hint:'Use English letters, including the title if desired.', download:'Save invitation', export:'High-resolution PNG · 4000 × 5000', batch:'Import names from Excel', description:'Use a Name column and an optional Language column (ar or en). Blank languages use the selection above.', file:'Choose Excel file', sample:'Download template', sheet:'Worksheet', review:'Review names', help:'Correct invalid rows or remove them before saving.', zip:'Small ZIP batches for easier saving on mobile. Download each ZIP before creating the next.', privacy:'Names stay on your device and are never stored.', preview:'INVITATION PREVIEW', caption:'Concert details and logos stay fixed.', footer:'Misericordias Domini Cantabo', loading:'Preparing your invitation…', ready:'Your invitation is ready to save.', preparing:'Preparing images…', cancelled:'ZIP generation cancelled.', cancel:'Cancel', save:'Save image', saveHelp:'Touch and hold the image to save it, or use the download button.', saved:'Your image is ready. If the download did not start, save the image shown here.', remove:'Remove row', valid:'valid', invalid:'need correction', generation:'Create ZIP', downloadZip:'Download ZIP', done:'Your ZIP is ready to download.', empty:'Enter a guest name before saving.', length:'Names must contain no more than 80 characters.', script:'Use Latin letters, including accented letters, in the English version.', characters:'Use letters, spaces, periods, apostrophes, and hyphens only; no numbers or symbols.', letters:'The name must contain at least one letter.', fit:'This name is too long to display clearly. Shorten the name or title.', badLanguage:'Choose ar or en for this row.', missingColumn:'No Name column was found. Please use the downloadable template.', emptyWorkbook:'No names were found in this worksheet.', tooManyRows:'Import no more than 500 names at a time.', fileSize:'The maximum file size is 10 MB.', badFile:'Choose a valid .xlsx or .xls file that is not password protected.', loadError:'Unable to load the fonts or invitation. Check your connection and try again.', exportError:'Unable to prepare the image. Please try again.', zipError:'Unable to create this ZIP. Try fewer names.', retry:'Try again', imported:'Names imported. Review them before saving.', unavailable:'Excel tools could not load. Please reload the page.', tooLargeSheet:'This worksheet is too large. Use a file containing only your guest list.' }
};
copy.ar.privacy='تُحفظ أسماء الدعوات المُنشأة وتاريخها في سجل خاص بلوحة المعلومات. لا تُرفع ملفات Excel أو الصور.';
copy.en.privacy='Generated recipient names and dates are saved in your private dashboard. Excel files and images are not uploaded.';
copy.ar.historyError='تعذّر تحديث سجل الدعوات. تحقق من الاتصال ثم أعد الحفظ.';
copy.en.historyError='Unable to update invitation history. Check your connection and try saving again.';
let language = 'ar', names = { ar:'', en:'' }, touched = { ar:false, en:false }, ready = false, loadFailed = false, busy = false, exporting = false, cancelled = false, rows = [], workbook = null, importFallback = 'ar', saveURL = null;
const urls = new Set();
const backgrounds = {};
const t = key => copy[language][key] || key;
const fonts = { ar:'Thmanyah Serif Display', en:'Thmanyah Serif Display' };
const BASE_WIDTH=4000,BASE_HEIGHT=5000;
const BATCH_SIZE=matchMedia('(pointer: coarse)').matches?2:5;
const bounds = { ar:{x:800,y:980,w:2400,h:510}, en:{x:1000,y:1020,w:2000,h:420} };
let initialization=0,importWorker=null,importing=false,parsedSheets=null,privateEpoch=0;
const zipURLs=new Set();
async function assertSession(){
  let response;try{response=await fetch('/api/session',{cache:'no-store'});}catch{throw new Error('loadError');}
  if(response.status===401){clearPrivateState();location.replace('/login?error=expired');throw new Error('loadError');}
  if(!response.ok)throw new Error('loadError');
}
function clearPrivateState(){privateEpoch++;cancelled=true;ready=false;importWorker?.terminate();names={ar:'',en:''};rows=[];workbook=null;parsedSheets=null;for(const url of urls)URL.revokeObjectURL(url);urls.clear();zipURLs.clear();$('save-image').removeAttribute('src');$('save-link').removeAttribute('href');$('save-dialog').close();$('name').value='';$('rows').replaceChildren();$('zip-results').replaceChildren();$('poster').getContext('2d').clearRect(0,0,$('poster').width,$('poster').height);}
function canvas(width=1280,height=1600) { const c=document.createElement('canvas');c.width=width;c.height=height;return c; }
function loadImage(src) { return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;}); }
function clearStatus(id) { $(id).textContent='';$(id).classList.remove('bad'); }
function status(id,text,bad=false) { $(id).textContent=text;$(id).classList.toggle('bad',bad); }
function cleanedBackground(original,clean,lang) {
  const b=bounds[lang],patch=canvas(b.w,b.h),pc=patch.getContext('2d');
  pc.drawImage(clean,b.x/BASE_WIDTH*clean.width,b.y/BASE_HEIGHT*clean.height,b.w/BASE_WIDTH*clean.width,b.h/BASE_HEIGHT*clean.height,0,0,b.w,b.h);
  pc.globalCompositeOperation='destination-in';
  for(const [horizontal,size] of [[true,b.w],[false,b.h]]){
    const gradient=pc.createLinearGradient(0,0,horizontal?size:0,horizontal?0:size),edge=24/size;
    gradient.addColorStop(0,'transparent');gradient.addColorStop(edge,'black');gradient.addColorStop(1-edge,'black');gradient.addColorStop(1,'transparent');pc.fillStyle=gradient;pc.fillRect(0,0,b.w,b.h);
  }
  return {original,patch};
}
function fitText(ctx,name,lang) {
  const firstLetter=Array.from(name).find(char=>/\p{L}/u.test(char));ctx.direction=firstLetter&&/\p{Script_Extensions=Arabic}/u.test(firstLetter)?'rtl':'ltr';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  for(let size=lang==='ar'?275:245;size>=125;size-=2){
    ctx.font=`700 ${size}px "${fonts[lang]}"`;
    const m=ctx.measureText(name),asc=m.actualBoundingBoxAscent||size*.8,desc=m.actualBoundingBoxDescent||size*.2;
    if(Math.max(m.width,(m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight||0))<=3400 && asc+desc<=400) return {size,asc,desc};
  }
  return null;
}
function resultFor(name,lang) {
  if(!['ar','en'].includes(lang)) return {name:normalizeName(name),error:'badLanguage'};
  const result=validateName(name,lang);
  if(!result.error && ready && !fitText($('poster').getContext('2d'),result.name,lang)) result.error='fit';
  return result;
}
function draw(target,name,lang) {
  const ctx=target.getContext('2d');ctx.save();ctx.clearRect(0,0,target.width,target.height);ctx.scale(target.width/BASE_WIDTH,target.height/BASE_HEIGHT);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(backgrounds[lang].original,0,0,BASE_WIDTH,BASE_HEIGHT);const b=bounds[lang];ctx.drawImage(backgrounds[lang].patch,b.x,b.y);
  if(name){const fit=fitText(ctx,name,lang);if(!fit){ctx.restore();throw new Error('fit');}ctx.fillStyle='#5a371e';const center=1240;ctx.fillText(name,BASE_WIDTH/2,center+(fit.asc-fit.desc)/2);}
  ctx.restore();
}
function refresh() {
  const result=resultFor(names[language],language);
  const error=touched[language]?result.error:null;
  $('name-error').textContent=error?t(error):'';$('name').setAttribute('aria-invalid',String(!!error));
  $('counter').textContent=`${Array.from(normalizeName(names[language])).length} / 80`;
  $('download').disabled=!ready||!!result.error||busy||exporting||importing;
  if(ready)draw($('poster'),result.error?'':result.name,language);
  return result;
}
function setLanguage(next) {
  language=next;document.documentElement.lang=next;document.documentElement.dir=next==='ar'?'rtl':'ltr';
  for(const [id,key] of Object.entries({'eyebrow':'eyebrow','page-title':'title','intro':'intro','language-label':'language','name-label':'name','name-hint':'hint','download-label':'download','export-note':'export','batch-toggle-label':'batch','batch-description':'description','file-label':'file','sample':'sample','sheet-label':'sheet','review-title':'review','review-help':'help','zip-note':'zip','privacy-note':'privacy','preview-label':'preview','preview-caption':'caption','footer-label':'footer','cancel':'cancel','save-title':'save','save-help':'saveHelp'}))$(id).textContent=t(key);
  $('name').value=names[next];$('name').dir='auto';$('name').placeholder=t('placeholder');$('poster').setAttribute('aria-label',t('preview'));$('poster-loading').textContent=t('loading');$('save-link').textContent=t('download');
  document.querySelector(`input[name=language][value=${next}]`).checked=true;
  clearStatus('status');if(loadFailed)showLoadError();refresh();if(rows.length)renderRows();
}
function showLoadError(){
  status('status',t('loadError'),true);$('poster-loading').replaceChildren(document.createTextNode(t('loadError')));const retry=document.createElement('button');retry.className='secondary';retry.textContent=t('retry');retry.addEventListener('click',initialize);$('poster-loading').append(retry);
}
async function initialize() {
  const generation=++initialization;ready=false;loadFailed=false;refresh();$('poster-loading').hidden=false;$('poster-loading').textContent=t('loading');
  try{
    const loadedFonts=await document.fonts.load('700 88px "Thmanyah Serif Display"','السيّد جميل البيطار Mr. John Doe Élodie');
    if(!loadedFonts.length||!document.fonts.check('700 88px "Thmanyah Serif Display"','السيّد جميل البيطار Mr. John Doe'))throw new Error('fonts');
    await Promise.all(['ar','en'].map(async lang=>{const [original,clean]=await Promise.all([loadImage(`assets/template-${lang}.jpg`),loadImage(`assets/clean-${lang}.jpg`)]);if(original.naturalWidth!==BASE_WIDTH||original.naturalHeight!==BASE_HEIGHT)throw new Error('dimensions');backgrounds[lang]=cleanedBackground(original,clean,lang);clean.src='';}));
    if(generation!==initialization)return;ready=true;$('poster-loading').hidden=true;clearStatus('status');refresh();if(rows.length)renderRows();
  }catch{
    if(generation!==initialization)return;loadFailed=true;showLoadError();
  }
}
function blobFromCanvas(c) { return new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(new Error('exportError')),'image/png')); }
async function makePNG(name,lang) {
  if(!ready)throw new Error('loadError');const result=resultFor(name,lang);if(result.error)throw new Error(result.error);
  for(const [width,height] of [[4000,5000],[3200,4000],[2560,3200]]){
    const c=canvas(width,height);try{draw(c,result.name,lang);return {blob:await blobFromCanvas(c),width,height};}catch(error){if(error.message==='fit')throw error;}finally{c.width=1;c.height=1;}
  }
  throw new Error('exportError');
}
function objectURL(blob){const url=URL.createObjectURL(blob);urls.add(url);return url;}
function downloadBlob(blob,filename){const url=objectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();return url;}
async function exportSingle(){
  if(exporting||busy)throw new Error('preparing');touched[language]=true;const result=refresh();if(result.error)throw new Error(result.error);
  const selected=language,epoch=privateEpoch;exporting=true;setBusyControls();refresh();status('status',t('preparing'));
  try{
    await assertSession();const {blob,width,height}=await makePNG(result.name,selected),filename=fileName(result.name,selected);
    if(epoch!==privateEpoch)throw new Error('cancelled');
    await recordGeneration('single',[{name:result.name,language:selected,width,height}],crypto.randomUUID());
    if(epoch!==privateEpoch)throw new Error('cancelled');
    if(saveURL){URL.revokeObjectURL(saveURL);urls.delete(saveURL);}
    saveURL=downloadBlob(blob,filename);$('save-image').src=saveURL;$('save-link').href=saveURL;$('save-link').download=filename;
    if(matchMedia('(pointer: coarse)').matches)$('save-dialog').showModal();
    status('status',`${t('saved')} · ${width} × ${height}`);return {name:result.name,language:selected,filename,width,height,url:saveURL};
  }catch(error){status('status',t(['fit','historyError'].includes(error.message)?error.message:'exportError'),true);throw error;}
  finally{exporting=false;setBusyControls();refresh();updateBatchButtons();}
}
$('name').addEventListener('input',()=>{names[language]=$('name').value;touched[language]=true;clearStatus('status');refresh();});
$('name').addEventListener('blur',()=>{names[language]=normalizeName(names[language]);$('name').value=names[language];touched[language]=true;refresh();});
document.querySelectorAll('input[name=language]').forEach(input=>input.addEventListener('change',()=>setLanguage(input.value)));
$('download').addEventListener('click',()=>exportSingle().catch(()=>{}));
$('close-dialog').addEventListener('click',()=>$('save-dialog').close());
$('batch-toggle').addEventListener('click',()=>{const open=$('batch-panel').hidden;$('batch-panel').hidden=!open;$('batch-toggle').setAttribute('aria-expanded',String(open));$('batch-toggle').querySelector('.plus').textContent=open?'−':'+';});
$('sample').addEventListener('click',()=>{
  if(!window.XLSX){status('import-status',t('unavailable'),true);return;}
  const sample=XLSX.utils.book_new();XLSX.utils.book_append_sheet(sample,XLSX.utils.aoa_to_sheet([['Name','Language'],['السيّد جميل البيطار','ar'],['Mr. John Doe','en']]),'Names');
  downloadBlob(new Blob([XLSX.write(sample,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'ARPA-names-template.xlsx');
});
function clearZIPs(){for(const url of zipURLs){URL.revokeObjectURL(url);urls.delete(url);}zipURLs.clear();$('zip-results').replaceChildren();}
function resetImport(){rows=[];workbook=null;parsedSheets=null;clearZIPs();$('rows').replaceChildren();$('batch-review').hidden=true;$('sheet-control').hidden=true;}
function parseExcel(buffer,extension){return new Promise((resolve,reject)=>{const parser=new Worker('/excel-worker.js');importWorker=parser;const timeout=setTimeout(()=>{parser.terminate();reject(new Error('badFile'));},20000);const finish=()=>{clearTimeout(timeout);parser.terminate();if(importWorker===parser)importWorker=null;};parser.onmessage=event=>{finish();event.data.error?reject(new Error(event.data.error)):resolve(event.data.sheets);};parser.onerror=()=>{finish();reject(new Error('badFile'));};parser.postMessage({buffer,extension},[buffer]);});}
$('excel-file').addEventListener('change',async()=>{
  const file=$('excel-file').files[0];if(!file||busy||exporting||importing)return;resetImport();clearStatus('import-status');importing=true;setBusyControls();refresh();
  try{
    if(!window.XLSX||!window.JSZip)throw new Error('unavailable');if(file.size>10*1024*1024)throw new Error('fileSize');if(!/\.(xlsx|xls)$/i.test(file.name))throw new Error('badFile');
    importFallback=language;
    await assertSession();parsedSheets=await parseExcel(await file.arrayBuffer(),file.name.split('.').pop().toLowerCase());
    if(!parsedSheets.length)throw new Error('emptyWorkbook');$('sheet').replaceChildren();
    parsedSheets.forEach((sheet,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=sheet.name;$('sheet').append(option);});
    $('sheet-control').hidden=parsedSheets.length<2;readSheet();
  }catch(error){status('import-status',t(copy[language][error.message]?error.message:'badFile'),true);}
  finally{importing=false;setBusyControls();refresh();updateBatchButtons();$('excel-file').value='';}
});
function readSheet(){
  rows=[];$('batch-review').hidden=true;clearZIPs();
  try{
    const sheet=parsedSheets[Number($('sheet').value)];if(sheet.error)throw new Error(sheet.error);
    rows=importRows(sheet.matrix,importFallback);
    $('batch-review').hidden=false;status('import-status',t('imported'));renderRows();
  }catch(error){status('import-status',t(copy[language][error.message]?error.message:'badFile'),true);}
}
$('sheet').addEventListener('change',readSheet);
function rowResult(row){return resultFor(row.name,row.language);}
function updateRowError(container,row){const result=rowResult(row);container.querySelector('input').setAttribute('aria-invalid',String(!!result.error));container.querySelector('.row-error').textContent=result.error?t(result.error):'';}
function renderRows(){
  $('rows').replaceChildren();
  rows.forEach(row=>{
    const container=document.createElement('div');container.className='row';
    const index=document.createElement('span');index.className='row-index';index.textContent=row.id;
    const input=document.createElement('input');input.type='text';input.value=row.name;input.dir='auto';input.setAttribute('aria-label',`${t('name')} ${row.id}`);
    const select=document.createElement('select');select.setAttribute('aria-label',`${t('language')} ${row.id}`);
    for(const [value,label] of [['','—'],['ar','AR'],['en','EN']]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}select.value=row.language||'';
    const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='×';remove.setAttribute('aria-label',`${t('remove')} ${row.id}`);
    const error=document.createElement('span');error.className='row-error';error.id=`row-error-${row.id}`;input.setAttribute('aria-describedby',error.id);select.setAttribute('aria-describedby',error.id);
    input.addEventListener('input',()=>{row.name=input.value;updateRowError(container,row);updateBatchButtons();});
    input.addEventListener('blur',()=>{row.name=normalizeName(row.name);input.value=row.name;updateRowError(container,row);updateBatchButtons();});
    select.addEventListener('change',()=>{row.language=select.value||null;input.dir='auto';updateRowError(container,row);updateBatchButtons();});
    remove.addEventListener('click',()=>{rows=rows.filter(item=>item!==row);renderRows();});
    container.append(index,input,select,remove,error);$('rows').append(container);updateRowError(container,row);
  });
  setBusyControls();updateBatchButtons();
}
function validRows(){return rows.filter(row=>!rowResult(row).error);}
function updateBatchButtons(){
  const valid=validRows(),invalid=rows.length-valid.length;$('review-count').textContent=`${valid.length} ${t('valid')} · ${invalid} ${t('invalid')}`;$('batch-buttons').replaceChildren();
  for(let start=0;start<valid.length;start+=BATCH_SIZE){const end=Math.min(start+BATCH_SIZE,valid.length);const button=document.createElement('button');button.type='button';button.className='primary';button.textContent=`${t('generation')} · ${start+1}–${end}`;button.disabled=!ready||busy||exporting||importing;button.addEventListener('click',()=>exportBatch(start).catch(()=>{}));$('batch-buttons').append(button);}
}
function setBusyControls(){
  const locked=busy||exporting||importing;$('excel-file').disabled=locked;$('sheet').disabled=locked;$('sample').disabled=locked;
  $('name').disabled=locked;document.querySelectorAll('input[name=language]').forEach(input=>input.disabled=locked);
  $('rows').querySelectorAll('input,select,button').forEach(control=>control.disabled=locked);$('cancel').hidden=!busy;$('progress').hidden=!busy;
}
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
async function exportBatch(start){
  if(busy||exporting)throw new Error('preparing');if(!ready)throw new Error('loadError');
  const valid=validRows(),selected=valid.slice(start,start+BATCH_SIZE).map(row=>({...row}));if(!selected.length)throw new Error('emptyWorkbook');
  busy=true;cancelled=false;$('progress').value=0;setBusyControls();refresh();updateBatchButtons();status('import-status',t('preparing'));
  try{
    await assertSession();clearZIPs();const zip=new JSZip(),generated=[];
    for(let i=0;i<selected.length;i++){
      if(cancelled)throw new Error('cancelled');const row=selected[i],{blob,width,height}=await makePNG(row.name,row.language);generated.push({name:normalizeName(row.name),language:row.language,width,height});zip.file(fileName(row.name,row.language,start+i),blob);$('progress').value=Math.round((i+1)/selected.length*85);await pause();
    }
    if(cancelled)throw new Error('cancelled');const blob=await zip.generateAsync({type:'blob',compression:'STORE'},meta=>{$('progress').value=85+Math.round(meta.percent*.15);});if(cancelled)throw new Error('cancelled');
    await recordGeneration('excel',generated,crypto.randomUUID());if(cancelled)throw new Error('cancelled');
    const filename=`ARPA-invitations-${start+1}-${start+selected.length}.zip`,url=objectURL(blob),result=document.createElement('div');zipURLs.add(url);result.className='zip-result';const label=document.createElement('span');label.textContent=`${selected.length} PNG · ${Math.ceil(blob.size/1024/1024)} MB`;const link=document.createElement('a');link.href=url;link.download=filename;link.textContent=`${t('downloadZip')} ${start+1}–${start+selected.length}`;result.append(label,link);$('zip-results').append(result);status('import-status',t('done'));link.focus();
    return {count:selected.length,filename,url};
  }catch(error){status('import-status',t(['cancelled','historyError'].includes(error.message)?error.message:'zipError'),error.message!=='cancelled');throw error;}
  finally{busy=false;setBusyControls();refresh();updateBatchButtons();}
}
$('cancel').addEventListener('click',()=>{cancelled=true;});
function registerTools(){
  if(!document.modelContext?.registerTool)return;
  const lifecycle=new AbortController();
  const toolDefinitions=[{
    name:'set_invitation',title:'Set invitation name and language',description:'Set the visible invitation language and full recipient name. Validates the name and updates the preview without downloading.',inputSchema:{type:'object',properties:{language:{type:'string',enum:['ar','en']},name:{type:'string',maxLength:80}},required:['language','name'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
      if(!input||typeof input.name!=='string'||!['ar','en'].includes(input.language))throw new Error('Invalid name or language');if(busy||exporting||importing)throw new Error('An operation is in progress');const result=resultFor(input.name,input.language);if(result.error)throw new Error(copy[input.language][result.error]);names[input.language]=result.name;touched[input.language]=true;setLanguage(input.language);return {name:result.name,language:input.language,ready};
    }
  },{
    name:'export_invitation_png',title:'Download invitation PNG',description:'Generate and download the currently visible valid invitation as a 4000 × 5000 PNG.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:()=>exportSingle()
  }];
  for(const tool of toolDefinitions){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
window.addEventListener('pagehide',()=>{cancelled=true;importWorker?.terminate();for(const url of urls)URL.revokeObjectURL(url);});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
$('logout').addEventListener('click',async()=>{try{const response=await fetch('/api/logout',{method:'POST',headers:{'X-CSRF-Token':document.querySelector('meta[name=csrf-token]').content}});if(response.ok||response.status===401){clearPrivateState();location.replace('/login');}else status('status',t('loadError'),true);}catch{status('status',t('loadError'),true);}});
setInterval(()=>{if(document.visibilityState==='visible')assertSession().catch(()=>{});},60000);
setLanguage('ar');initialize();registerTools();
