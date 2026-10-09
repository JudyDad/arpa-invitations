import { normalizeName, validateName, importRows, fileName } from './core.js';
const $ = id => document.getElementById(id);
const copy = {
  ar: { eyebrow:'دعوات الحفل', title:'دعوة باسم ضيفك', intro:'اكتب الاسم مع اللقب، وستكون الدعوة جاهزة للحفظ.', language:'لغة الدعوة', name:'اسم الضيف مع اللقب', placeholder:'السيّد جميل البيطار', hint:'أحرف عربية، مع اللقب إن رغبت.', download:'حفظ الدعوة', export:'PNG عالي الجودة · 2560 × 3200', batch:'استيراد أسماء من Excel', description:'عمود Name للأسماء، وعمود Language اختياري (ar أو en). عند ترك اللغة فارغة تُستخدم اللغة المحددة أعلاه.', file:'اختيار ملف Excel', sample:'تحميل نموذج', sheet:'ورقة العمل', review:'مراجعة الأسماء', help:'صحّح الصفوف غير الصالحة أو احذفها قبل الحفظ.', zip:'حتى 25 دعوة في كل ملف ZIP لتسهيل الحفظ على الهاتف.', privacy:'تُعالج الأسماء على جهازك فقط ولا يتم تخزينها.', preview:'معاينة الدعوة', caption:'تبقى تفاصيل الحفل والشعارات ثابتة.', footer:'بمراحم الرب أغنّي', loading:'جارٍ تجهيز الدعوة…', ready:'الدعوة جاهزة للحفظ.', preparing:'جارٍ تجهيز الصور…', cancelled:'تم إلغاء إنشاء الملف.', cancel:'إلغاء', save:'حفظ الصورة', saveHelp:'اضغط مطولاً على الصورة لحفظها، أو استخدم زر التنزيل.', saved:'الصورة جاهزة. إذا لم يبدأ التنزيل، استخدم الصورة المعروضة للحفظ.', remove:'حذف الصف', valid:'صالحة', invalid:'تحتاج تصحيحاً', generation:'إنشاء ZIP', downloadZip:'تنزيل ZIP', done:'الملف جاهز للتنزيل.', empty:'أدخل اسم الضيف قبل الحفظ.', length:'يجب ألا يزيد الاسم عن 80 حرفاً.', script:'استخدم أحرفاً عربية وتشكيلًا عربياً فقط في النسخة العربية.', characters:'استخدم الأحرف والمسافات والنقطة والفاصلة العليا والشرطة فقط؛ لا أرقام أو رموز.', letters:'يجب أن يحتوي الاسم على حرف واحد على الأقل.', fit:'الاسم طويل جداً لعرضه بوضوح. اختصر الاسم أو اللقب.', badLanguage:'اختر ar أو en لهذا الصف.', missingColumn:'لم يتم العثور على عمود Name. استخدم النموذج المتاح.', emptyWorkbook:'لا توجد أسماء في ورقة العمل.', tooManyRows:'استورد 500 اسم أو أقل في كل مرة.', fileSize:'حجم الملف الأقصى 10 ميغابايت.', badFile:'اختر ملف Excel بصيغة .xlsx أو .xls صالح وغير محمي بكلمة مرور.', loadError:'تعذّر تحميل الخطوط أو الدعوة. تحقق من الاتصال ثم أعد المحاولة.', exportError:'تعذّر تجهيز الصورة. أعد المحاولة.', zipError:'تعذّر إنشاء ZIP. جرّب عددًا أقل من الأسماء.', retry:'إعادة المحاولة', imported:'تم استيراد الأسماء. راجعها قبل الحفظ.', unavailable:'تعذّر تحميل أدوات Excel. أعد تحميل الصفحة.', tooLargeSheet:'ورقة العمل كبيرة جداً. استخدم ملفاً يحتوي على الأسماء فقط.' },
  en: { eyebrow:'CONCERT INVITATIONS', title:'An invitation, personally yours.', intro:'Enter your guest’s name and title. Your invitation is ready to save.', language:'Invitation language', name:'Guest name and title', placeholder:'Mr. John Doe', hint:'Use English letters, including the title if desired.', download:'Save invitation', export:'High-resolution PNG · 2560 × 3200', batch:'Import names from Excel', description:'Use a Name column and an optional Language column (ar or en). Blank languages use the selection above.', file:'Choose Excel file', sample:'Download template', sheet:'Worksheet', review:'Review names', help:'Correct invalid rows or remove them before saving.', zip:'Up to 25 invitations per ZIP for easier saving on mobile.', privacy:'Names stay on your device and are never stored.', preview:'INVITATION PREVIEW', caption:'Concert details and logos stay fixed.', footer:'Misericordias Domini Cantabo', loading:'Preparing your invitation…', ready:'Your invitation is ready to save.', preparing:'Preparing images…', cancelled:'ZIP generation cancelled.', cancel:'Cancel', save:'Save image', saveHelp:'Touch and hold the image to save it, or use the download button.', saved:'Your image is ready. If the download did not start, save the image shown here.', remove:'Remove row', valid:'valid', invalid:'need correction', generation:'Create ZIP', downloadZip:'Download ZIP', done:'Your ZIP is ready to download.', empty:'Enter a guest name before saving.', length:'Names must contain no more than 80 characters.', script:'Use Latin letters, including accented letters, in the English version.', characters:'Use letters, spaces, periods, apostrophes, and hyphens only; no numbers or symbols.', letters:'The name must contain at least one letter.', fit:'This name is too long to display clearly. Shorten the name or title.', badLanguage:'Choose ar or en for this row.', missingColumn:'No Name column was found. Please use the downloadable template.', emptyWorkbook:'No names were found in this worksheet.', tooManyRows:'Import no more than 500 names at a time.', fileSize:'The maximum file size is 10 MB.', badFile:'Choose a valid .xlsx or .xls file that is not password protected.', loadError:'Unable to load the fonts or invitation. Check your connection and try again.', exportError:'Unable to prepare the image. Please try again.', zipError:'Unable to create this ZIP. Try fewer names.', retry:'Try again', imported:'Names imported. Review them before saving.', unavailable:'Excel tools could not load. Please reload the page.', tooLargeSheet:'This worksheet is too large. Use a file containing only your guest list.' }
};
let language = 'ar', names = { ar:'', en:'' }, touched = { ar:false, en:false }, ready = false, loadFailed = false, busy = false, exporting = false, cancelled = false, rows = [], workbook = null, importFallback = 'ar', saveURL = null;
const urls = new Set();
const backgrounds = {};
const t = key => copy[language][key] || key;
const fonts = { ar:'Thmanyah Serif Display', en:'Thmanyah Serif Display' };
const bounds = { ar:{x:260,y:322,w:780,h:150}, en:{x:330,y:325,w:630,h:135} };
function canvas(width=1280,height=1600) { const c=document.createElement('canvas');c.width=width;c.height=height;return c; }
function loadImage(src) { return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;}); }
function clearStatus(id) { $(id).textContent='';$(id).classList.remove('bad'); }
function status(id,text,bad=false) { $(id).textContent=text;$(id).classList.toggle('bad',bad); }
function cleanedBackground(original,clean,lang) {
  const result=canvas(), ctx=result.getContext('2d');ctx.drawImage(original,0,0,1280,1600);
  const b=bounds[lang],patch=canvas(b.w,b.h),pc=patch.getContext('2d');
  pc.drawImage(clean,b.x/1280*clean.width,b.y/1600*clean.height,b.w/1280*clean.width,b.h/1600*clean.height,0,0,b.w,b.h);
  pc.globalCompositeOperation='destination-in';
  for(const [horizontal,size] of [[true,b.w],[false,b.h]]){
    const gradient=pc.createLinearGradient(0,0,horizontal?size:0,horizontal?0:size),edge=10/size;
    gradient.addColorStop(0,'transparent');gradient.addColorStop(edge,'black');gradient.addColorStop(1-edge,'black');gradient.addColorStop(1,'transparent');pc.fillStyle=gradient;pc.fillRect(0,0,b.w,b.h);
  }
  ctx.drawImage(patch,b.x,b.y);return result;
}
function fitText(ctx,name,lang) {
  ctx.direction=lang==='ar'?'rtl':'ltr';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  for(let size=lang==='ar'?88:78;size>=40;size-=1){
    ctx.font=`700 ${size}px "${fonts[lang]}"`;
    const m=ctx.measureText(name),asc=m.actualBoundingBoxAscent||size*.8,desc=m.actualBoundingBoxDescent||size*.2;
    if(Math.max(m.width,(m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight||0))<=1080 && asc+desc<=132) return {size,asc,desc};
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
  const ctx=target.getContext('2d');ctx.save();ctx.clearRect(0,0,target.width,target.height);ctx.scale(target.width/1280,target.height/1600);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(backgrounds[lang],0,0);
  if(name){const fit=fitText(ctx,name,lang);if(!fit){ctx.restore();throw new Error('fit');}ctx.fillStyle='#5a371e';const center=lang==='ar'?398:393;ctx.fillText(name,640,center+(fit.asc-fit.desc)/2);}
  ctx.restore();
}
function refresh() {
  const result=resultFor(names[language],language);
  const error=touched[language]?result.error:null;
  $('name-error').textContent=error?t(error):'';$('name').setAttribute('aria-invalid',String(!!error));
  $('counter').textContent=`${Array.from(normalizeName(names[language])).length} / 80`;
  $('download').disabled=!ready||!!result.error||busy||exporting;
  if(ready)draw($('poster'),result.error?'':result.name,language);
  return result;
}
function setLanguage(next) {
  language=next;document.documentElement.lang=next;document.documentElement.dir=next==='ar'?'rtl':'ltr';
  for(const [id,key] of Object.entries({'eyebrow':'eyebrow','page-title':'title','intro':'intro','language-label':'language','name-label':'name','name-hint':'hint','download-label':'download','export-note':'export','batch-toggle-label':'batch','batch-description':'description','file-label':'file','sample':'sample','sheet-label':'sheet','review-title':'review','review-help':'help','zip-note':'zip','privacy-note':'privacy','preview-label':'preview','preview-caption':'caption','footer-label':'footer','cancel':'cancel','save-title':'save','save-help':'saveHelp'}))$(id).textContent=t(key);
  $('name').value=names[next];$('name').dir=next==='ar'?'rtl':'ltr';$('name').placeholder=t('placeholder');$('poster').setAttribute('aria-label',t('preview'));$('poster-loading').textContent=t('loading');$('save-link').textContent=t('download');
  document.querySelector(`input[name=language][value=${next}]`).checked=true;
  clearStatus('status');if(loadFailed)showLoadError();refresh();if(rows.length)renderRows();
}
function showLoadError(){
  status('status',t('loadError'),true);$('poster-loading').replaceChildren(document.createTextNode(t('loadError')));const retry=document.createElement('button');retry.className='secondary';retry.textContent=t('retry');retry.addEventListener('click',initialize);$('poster-loading').append(retry);
}
async function initialize() {
  ready=false;loadFailed=false;refresh();$('poster-loading').hidden=false;$('poster-loading').textContent=t('loading');
  try{
    const loadedFonts=await document.fonts.load('700 88px "Thmanyah Serif Display"','السيّد جميل البيطار Mr. John Doe Élodie');
    if(!loadedFonts.length||!document.fonts.check('700 88px "Thmanyah Serif Display"','السيّد جميل البيطار Mr. John Doe'))throw new Error('fonts');
    await Promise.all(['ar','en'].map(async lang=>{const [original,clean]=await Promise.all([loadImage(`assets/original-${lang}.jpg`),loadImage(`assets/clean-${lang}.png`)]);backgrounds[lang]=cleanedBackground(original,clean,lang);}));
    ready=true;$('poster-loading').hidden=true;clearStatus('status');refresh();if(rows.length)renderRows();
  }catch{
    loadFailed=true;showLoadError();
  }
}
function blobFromCanvas(c) { return new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(new Error('exportError')),'image/png')); }
async function makePNG(name,lang) {
  if(!ready)throw new Error('loadError');const result=resultFor(name,lang);if(result.error)throw new Error(result.error);
  const c=canvas(2560,3200);draw(c,result.name,lang);const blob=await blobFromCanvas(c);c.width=1;c.height=1;return blob;
}
function objectURL(blob){const url=URL.createObjectURL(blob);urls.add(url);return url;}
function downloadBlob(blob,filename){const url=objectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();return url;}
async function exportSingle(){
  if(exporting||busy)throw new Error('preparing');touched[language]=true;const result=refresh();if(result.error)throw new Error(result.error);
  const selected=language;exporting=true;refresh();status('status',t('preparing'));
  try{
    const blob=await makePNG(result.name,selected),filename=fileName(result.name,selected);
    if(saveURL){URL.revokeObjectURL(saveURL);urls.delete(saveURL);}
    saveURL=downloadBlob(blob,filename);$('save-image').src=saveURL;$('save-link').href=saveURL;$('save-link').download=filename;
    if(matchMedia('(pointer: coarse)').matches)$('save-dialog').showModal();
    status('status',t('saved'));return {name:result.name,language:selected,filename,width:2560,height:3200,url:saveURL};
  }catch(error){status('status',t(error.message==='fit'?'fit':'exportError'),true);throw error;}
  finally{exporting=false;refresh();}
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
function resetImport(){rows=[];workbook=null;$('rows').replaceChildren();$('zip-results').replaceChildren();$('batch-review').hidden=true;$('sheet-control').hidden=true;for(const url of urls){if(url!==saveURL){URL.revokeObjectURL(url);urls.delete(url);}}}
$('excel-file').addEventListener('change',async()=>{
  const file=$('excel-file').files[0];if(!file)return;resetImport();clearStatus('import-status');
  try{
    if(!window.XLSX||!window.JSZip)throw new Error('unavailable');if(file.size>10*1024*1024)throw new Error('fileSize');if(!/\.(xlsx|xls)$/i.test(file.name))throw new Error('badFile');
    importFallback=language;
    workbook=XLSX.read(await file.arrayBuffer(),{type:'array',cellFormula:false,cellHTML:false,cellStyles:false});
    if(!workbook.SheetNames.length)throw new Error('emptyWorkbook');$('sheet').replaceChildren();
    for(const name of workbook.SheetNames){const option=document.createElement('option');option.value=name;option.textContent=name;$('sheet').append(option);}
    $('sheet-control').hidden=workbook.SheetNames.length<2;readSheet();
  }catch(error){status('import-status',t(copy[language][error.message]?error.message:'badFile'),true);}
  finally{$('excel-file').value='';}
});
function readSheet(){
  rows=[];$('batch-review').hidden=true;$('zip-results').replaceChildren();
  try{
    const sheet=workbook.Sheets[$('sheet').value],range=XLSX.utils.decode_range(sheet['!ref']||'A1');
    if(range.e.r-range.s.r>5000||range.e.c-range.s.c>100)throw new Error('tooLargeSheet');
    rows=importRows(XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false,blankrows:false}),importFallback);
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
    const input=document.createElement('input');input.type='text';input.value=row.name;input.dir=row.language==='ar'?'rtl':'ltr';input.setAttribute('aria-label',`${t('name')} ${row.id}`);
    const select=document.createElement('select');select.setAttribute('aria-label',`${t('language')} ${row.id}`);
    for(const [value,label] of [['','—'],['ar','AR'],['en','EN']]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}select.value=row.language||'';
    const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='×';remove.setAttribute('aria-label',`${t('remove')} ${row.id}`);
    const error=document.createElement('span');error.className='row-error';error.id=`row-error-${row.id}`;input.setAttribute('aria-describedby',error.id);select.setAttribute('aria-describedby',error.id);
    input.addEventListener('input',()=>{row.name=input.value;updateRowError(container,row);updateBatchButtons();});
    input.addEventListener('blur',()=>{row.name=normalizeName(row.name);input.value=row.name;updateRowError(container,row);updateBatchButtons();});
    select.addEventListener('change',()=>{row.language=select.value||null;input.dir=row.language==='ar'?'rtl':'ltr';updateRowError(container,row);updateBatchButtons();});
    remove.addEventListener('click',()=>{rows=rows.filter(item=>item!==row);renderRows();});
    container.append(index,input,select,remove,error);$('rows').append(container);updateRowError(container,row);
  });
  setBusyControls();updateBatchButtons();
}
function validRows(){return rows.filter(row=>!rowResult(row).error);}
function updateBatchButtons(){
  const valid=validRows(),invalid=rows.length-valid.length;$('review-count').textContent=`${valid.length} ${t('valid')} · ${invalid} ${t('invalid')}`;$('batch-buttons').replaceChildren();
  for(let start=0;start<valid.length;start+=25){const end=Math.min(start+25,valid.length);const button=document.createElement('button');button.type='button';button.className='primary';button.textContent=`${t('generation')} · ${start+1}–${end}`;button.disabled=!ready||busy||exporting;button.addEventListener('click',()=>exportBatch(start).catch(()=>{}));$('batch-buttons').append(button);}
}
function setBusyControls(){
  $('excel-file').disabled=busy;$('sheet').disabled=busy;$('sample').disabled=busy;
  $('name').disabled=busy;document.querySelectorAll('input[name=language]').forEach(input=>input.disabled=busy);
  $('rows').querySelectorAll('input,select,button').forEach(control=>control.disabled=busy);$('cancel').hidden=!busy;$('progress').hidden=!busy;
}
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
async function exportBatch(start){
  if(busy||exporting)throw new Error('preparing');if(!ready)throw new Error('loadError');
  const valid=validRows(),selected=valid.slice(start,start+25).map(row=>({...row}));if(!selected.length)throw new Error('emptyWorkbook');
  busy=true;cancelled=false;$('progress').value=0;setBusyControls();refresh();updateBatchButtons();status('import-status',t('preparing'));
  try{
    const zip=new JSZip();
    for(let i=0;i<selected.length;i++){
      if(cancelled)throw new Error('cancelled');const row=selected[i],blob=await makePNG(row.name,row.language);zip.file(fileName(row.name,row.language,start+i),blob);$('progress').value=Math.round((i+1)/selected.length*85);await pause();
    }
    if(cancelled)throw new Error('cancelled');const blob=await zip.generateAsync({type:'blob',compression:'STORE'},meta=>{$('progress').value=85+Math.round(meta.percent*.15);});if(cancelled)throw new Error('cancelled');
    const filename=`ARPA-invitations-${start+1}-${start+selected.length}.zip`,url=objectURL(blob),result=document.createElement('div');result.className='zip-result';const label=document.createElement('span');label.textContent=`${selected.length} PNG · ${Math.ceil(blob.size/1024/1024)} MB`;const link=document.createElement('a');link.href=url;link.download=filename;link.textContent=`${t('downloadZip')} ${start+1}–${start+selected.length}`;result.append(label,link);$('zip-results').append(result);status('import-status',t('done'));link.focus();
    return {count:selected.length,filename,url};
  }catch(error){status('import-status',t(error.message==='cancelled'?'cancelled':'zipError'),error.message!=='cancelled');throw error;}
  finally{busy=false;setBusyControls();refresh();updateBatchButtons();}
}
$('cancel').addEventListener('click',()=>{cancelled=true;});
function registerTools(){
  if(!document.modelContext?.registerTool)return;
  const lifecycle=new AbortController();
  const toolDefinitions=[{
    name:'set_invitation',title:'Set invitation name and language',description:'Set the visible invitation language and full recipient name. Validates the name and updates the preview without downloading.',inputSchema:{type:'object',properties:{language:{type:'string',enum:['ar','en']},name:{type:'string',maxLength:80}},required:['language','name'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
      if(!input||typeof input.name!=='string'||!['ar','en'].includes(input.language))throw new Error('Invalid name or language');if(busy||exporting)throw new Error('An export is in progress');const result=resultFor(input.name,input.language);if(result.error)throw new Error(copy[input.language][result.error]);names[input.language]=result.name;touched[input.language]=true;setLanguage(input.language);return {name:result.name,language:input.language,ready};
    }
  },{
    name:'export_invitation_png',title:'Download invitation PNG',description:'Generate and download the currently visible valid invitation as a 2560 × 3200 PNG.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:()=>exportSingle()
  }];
  for(const tool of toolDefinitions){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
window.addEventListener('pagehide',()=>{for(const url of urls)URL.revokeObjectURL(url);});
setLanguage('ar');initialize();registerTools();
