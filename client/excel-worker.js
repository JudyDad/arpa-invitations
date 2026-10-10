importScripts('/assets/xlsx.full.min.js');
function checkZIP(buffer){
  const view=new DataView(buffer);let end=-1;
  for(let i=buffer.byteLength-22;i>=Math.max(0,buffer.byteLength-65557);i--)if(view.getUint32(i,true)===0x06054b50){end=i;break;}
  if(end<0||view.getUint16(end+4,true)||view.getUint16(end+6,true))throw new Error('badFile');
  const count=view.getUint16(end+10,true),size=view.getUint32(end+12,true);let offset=view.getUint32(end+16,true),total=0;const directoryEnd=offset+size;
  if(!count||count>2000||view.getUint16(end+8,true)!==count||directoryEnd>end||end+22+view.getUint16(end+20,true)!==buffer.byteLength)throw new Error('badFile');
  for(let i=0;i<count;i++){
    if(offset+46>directoryEnd||view.getUint32(offset,true)!==0x02014b50||view.getUint16(offset+8,true)&1)throw new Error('badFile');
    const bytes=view.getUint32(offset+24,true);total+=bytes;if(bytes>20*1024*1024||total>40*1024*1024)throw new Error('tooLargeSheet');
    offset+=46+view.getUint16(offset+28,true)+view.getUint16(offset+30,true)+view.getUint16(offset+32,true);
  }
  if(offset!==directoryEnd)throw new Error('badFile');
}
self.onmessage=event=>{
  try{
    const {buffer,extension}=event.data,bytes=new Uint8Array(buffer);
    if(buffer.byteLength>10*1024*1024)throw new Error('fileSize');
    if(extension==='xlsx'){if(bytes[0]!==0x50||bytes[1]!==0x4b)throw new Error('badFile');checkZIP(buffer);}
    else if(extension==='xls'){const signature=[0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1];if(!signature.every((value,index)=>bytes[index]===value))throw new Error('badFile');}
    else throw new Error('badFile');
    const wb=XLSX.read(buffer,{type:'array',sheetRows:5002,cellFormula:false,cellHTML:false,cellStyles:false,bookVBA:false});
    if(wb.SheetNames.length>100)throw new Error('tooLargeSheet');
    const sheets=wb.SheetNames.map(name=>{const sheet=wb.Sheets[name],range=XLSX.utils.decode_range(sheet['!fullref']||sheet['!ref']||'A1');if(range.e.r-range.s.r>5000||range.e.c-range.s.c>100)return {name,error:'tooLargeSheet'};return {name,matrix:XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false,blankrows:true})};});
    self.postMessage({sheets});
  }catch(error){self.postMessage({error:['fileSize','tooLargeSheet'].includes(error.message)?error.message:'badFile'});}
};
