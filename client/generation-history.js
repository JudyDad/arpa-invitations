const pending=new Map();
export async function recordGeneration(source,items,operationId){
  const key=JSON.stringify({source,items});operationId=pending.get(key)||operationId;pending.set(key,operationId);
  const body=JSON.stringify({operationId,source,items}),csrf=document.querySelector('meta[name=csrf-token]').content;
  for(let attempt=0;attempt<2;attempt++){
    let response;try{response=await fetch('/api/invitations',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body});}catch{if(attempt===0)continue;throw new Error('historyError');}
    if(response.status===401){location.replace('/login?error=expired');throw new Error('historyError');}
    if(response.ok){pending.delete(key);return;}
    if(response.status>=500&&attempt===0)continue;
    throw new Error('historyError');
  }
}
