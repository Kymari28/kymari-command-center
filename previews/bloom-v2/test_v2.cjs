const fs=require('fs'),vm=require('vm');
const els={},handlers={};function el(id){if(!els[id])els[id]={id,innerHTML:'',textContent:'',hidden:false,value:'',classList:{add(){},remove(){},contains(){return false}},querySelector(){return {focus(){}}},addEventListener(){}};return els[id];}
const doc={getElementById:el,querySelectorAll(){return []},addEventListener(type,fn){(handlers[type]??=[]).push(fn)},removeEventListener(type,fn){handlers[type]=(handlers[type]||[]).filter(x=>x!==fn)}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
class FakeBlob{constructor(parts){this.text=parts.join('');}}
class Reader{readAsText(file){this.result=file.text;this.onload();}}
const ctx={document:doc,localStorage,window:{scrollTo(){}},console,structuredClone,Date,Math,JSON,Blob:FakeBlob,FileReader:Reader,setTimeout:(fn)=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},confirm:()=>true};
ctx.window.document=doc;ctx.window.localStorage=localStorage;vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),ctx);
function assert(cond,msg){if(!cond)throw Error(msg)}
const state=()=>ctx.window.__BloomPreview.state();
function view(t){ctx.window.__BloomPreview.view(t)}
function click(key,val,id,attrs=[]){const b={dataset:{[key]:val,...(id?{id}:{})},id:'',hasAttribute(n){return attrs.includes(n)},getAttribute(){return null}};const e={target:{closest(q){return q==='button'?b:null}},stopPropagation(){}};(handlers.click||[]).slice().forEach(f=>f(e));}
assert(els.app.innerHTML.includes('world-stage'),'world not initial');
assert(els.app.innerHTML.includes('pixel-you-button'),'clickable pixel character missing');
click('dummy','',null,['data-chat']);assert(!els.overlay.hidden&&els.overlay.innerHTML.includes('Dress me up'),'character conversation did not open');
click('dummy','',null,['data-open-closet']);assert(state().activeTab==='closet','wardrobe not reached');
assert(els.app.innerHTML.includes('Hairstyles')&&els.app.innerHTML.includes('Outfits'),'separate wardrobe sections missing');
click('equipPart','hair',null,[]); // ignore invalid
click('equipPart','hair');
const id='moss';
function customClick(data){const b={dataset:data,id:'',hasAttribute(){return false}};const e={target:{closest(q){return q==='button'?b:null}},stopPropagation(){}};(handlers.click||[]).slice().forEach(f=>f(e));}
customClick({equipPart:'outfit',equipValue:'moss'});assert(state().outfit==='moss','outfit did not equip');assert(state().hair==='fro','outfit changed hair unexpectedly');
view('board');assert(els.app.innerHTML.includes('Your <span class="accent">Board'),'Board view missing');
customClick({openTask:'t3'});customClick({checkinMenu:'t3'});assert(els.overlay.hidden===false,'check-in menu missing');
customClick({claim:'some',id:'t3'});assert(state().coins===10,'partial coin reward incorrect');assert(state().checkins.length===1,'missing check-in');
view('world');assert(els.app.innerHTML.includes('Unlocked · explore'),'garden did not unlock from cleaning');
view('shop');assert(els.app.innerHTML.includes('Heart-shaped afro bun'),'shop hair missing');
view('areas');assert(els.app.innerHTML.includes('unchanged'),'original tab placeholder missing');
// v2 import from original backup shape
const testBackup={version:1,tasks:[{id:'abc',title:'Apply to a graduate UX role',area:'job',status:'now',firstStep:'Open listing'},{id:'def',title:'Sort a laundry bag',area:'home',status:'someday',firstStep:'Choose essentials'}]};
ctx.window.__BloomPreview.importBoard(testBackup);
assert(state().tasks.length===2&&state().source==='import','import did not load');
assert(state().tasks[0].kind==='bbb'&&state().tasks[1].kind==='home','import categorization incorrect');
assert(els.app.innerHTML.includes('Apply to a graduate UX role'),'imported Board not rendered');
assert(els.app.innerHTML.includes('Sort a laundry bag'),'imported cleaning task not rendered');
view('today');assert(els.app.innerHTML.includes('How’s your energy?'),'existing Today unavailable');
console.log(JSON.stringify({pass:true,rooms:'garden',coins:state().coins,importedTasks:state().tasks.length,wardrobe:'separate',world:'full-width'}));