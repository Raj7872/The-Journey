const fs = require('node:fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const pages = await (await fetch('http://127.0.0.1:9229/json')).json();
  const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, {once:true}));
  let n=0; const pending=new Map(), errors=[];
  ws.addEventListener('message', ({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);} else if(m.method==='Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text+': '+(m.params.exceptionDetails.exception?.description||''));});
  const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++n;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await call('Runtime.enable'); await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  const shot=async name=>{const r=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('artifacts/'+name+'.png',Buffer.from(r.data,'base64'));};
  if(process.argv[2]==='initial') {
    await call('Page.navigate',{url:'http://127.0.0.1:8767'}); await sleep(7000);
    await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:220,y:320});await sleep(300);
    await shot('opening-v2');
    console.log(await evaluate(`JSON.stringify({buttons:[...document.querySelectorAll('button')].map(x=>[x.textContent.trim(),x.disabled]),cursor:[...document.querySelectorAll('div')].filter(x=>x.style.zIndex==='400').map(x=>({opacity:getComputedStyle(x).opacity,transform:x.style.transform,z:x.style.zIndex}))})`));
    await evaluate(`document.querySelector('button[aria-label="Enter the station"]').click()`);await sleep(4500);
    await shot('outside-v2');
  }
  const findContext=`(()=>{for(const el of document.querySelectorAll('[role="region"]')) {const k=Object.keys(el).find(k=>k.startsWith('__reactFiber$'));let f=el[k];while(f){const v=f.memoizedProps?.value;if(v?.snapTo){window.reviewScene=v.snapTo;return true;}f=f.return;}}return false;})()`;
  if(process.argv[2] !== 'initial' && !await evaluate(findContext)) throw Error('Scene context not found');
  if (process.argv[2] === 'train-test') {
    await evaluate("window.reviewScene('train-arrival')");
    for(const [wait,name] of [[6500,'arrival-early'],[18500,'arrival-mid'],[30000,'arrival-open']]) {
      await sleep(wait);await shot(name);
      console.log(name,await evaluate(`JSON.stringify({board:!!document.querySelector('[aria-label="Board the train"]'),nodes:document.getElementsByTagName('*').length})`));
    }
    const board = await evaluate(`(()=>{const e=document.querySelector('[aria-label="Board the train"]'),r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[aria-label="Board the train"]')===e}})()`);
    if(!board.hit) throw Error('Doorway hit testing failed');
    await call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,x:board.x,y:board.y});
    await call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,x:board.x,y:board.y});
    await sleep(4000);console.log('boarded',await evaluate(`!!document.querySelector('[aria-label="Inside the train"]')`));
    ws.close();return;
  }
  if(process.argv[2] === 'checks') {
    await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:350,y:240});await sleep(500);
    console.log('reduced motion cursor',await evaluate(`(()=>{const e=[...document.querySelectorAll('div')].find(e=>e.style.zIndex==='400');return {opacity:getComputedStyle(e).opacity,position:e.style.transform}})()`));
    await call('Emulation.setEmulatedMedia',{features:[]});
    for(const [scene,label] of [['entrance-hall','Walk to the main hall'],['platform-cafe','A coffee cup on the table'],['the-field','Walk toward the bench'],['the-bench','A small gift box, resting on the bench'],['the-gift',null]]) {
      await evaluate(`window.reviewScene(${JSON.stringify(scene)})`);await sleep(3000);
      console.log('hit',scene,await evaluate(`(()=>{const e=${label?`document.querySelector('[aria-label="${label}"]')`:`[...document.querySelectorAll('[role="button"]')].find(e=>e.getAttribute('aria-label')?.startsWith('A folded ticket'))`};if(!e)return 'missing';const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[role="button"]')===e})()`));
    }
    await evaluate("window.reviewScene('the-bench')");await sleep(2000);
    await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await sleep(1000);await shot('mobile-bench');
    console.log('mobile box',await evaluate(`(()=>{const e=document.querySelector('[aria-label="A small gift box, resting on the bench"]'),r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[role="button"]')===e}})()`));
    ws.close();return;
  }
  const scenes=process.argv.slice(2).filter(x=>x!=='initial');
  for(const scene of scenes){await evaluate(`window.reviewScene(${JSON.stringify(scene)})`);await sleep(3500);await shot(scene+'-v2');console.log(scene,await evaluate(`JSON.stringify({regions:[...document.querySelectorAll('[role="region"]')].map(e=>e.getAttribute('aria-label')),nodes:document.getElementsByTagName('*').length,heap:performance.memory?.usedJSHeapSize})`));}
  fs.writeFileSync('artifacts/browser-errors.json',JSON.stringify(errors,null,2));
  console.log('runtime errors',errors);ws.close();
})().catch(e=>{console.error(e);process.exit(1)});

