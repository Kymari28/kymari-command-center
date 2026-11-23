import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const start=page.indexOf("// ===================== The Café");
const end=page.indexOf('document.addEventListener("click",e=>{\n  const x=e.target.closest("[data-cafe]")',start);
assert.ok(start>0&&end>start,"café module must exist");
const src=page.slice(start,end);
function setup(){
  const state={meta:{bloom:{coins:0}},tasks:new Map([["t1",{id:"t1",title:"Write cover letter",status:"now",owner:"me"}]])};
  const toasts=[], moved=[];
  const env={state,todayKey:()=> "2026-11-23",putMeta:p=>Object.assign(state.meta,p),bb:()=>({coins:state.meta.bloom.coins}),
    toast:m=>toasts.push(m),moveTo:(t,s)=>{t.status=s;moved.push(t.id)},tasks:()=>[...state.tasks.values()],byStatus:s=>[...state.tasks.values()].filter(t=>t.status===s),
    $:sel=>sel==="#cafe-task"?{value:"t1"}:null,esc:v=>v,setTimeout:()=>0,matchMedia:()=>({matches:true}),document:{querySelector:()=>null,querySelectorAll:()=>[]},
    timeValue:v=>+v||0,bbFrameSrc:()=>"",confetti:()=>{},render:()=>{},bbUI:{}};
  const names=Object.keys(env);
  const api=new Function(...names,src+"return {cafe,cafeStart,cafeReport,cafeCheckinNow,cafePlay,cafeGuardCheck,cafeFocusAdd,PLUSHIES,CAFE_DAY_TICKETS};")(...names.map(k=>env[k]));
  return {...api,state,toasts,moved};
}
function session(p,min,kind,workedMin){
  const realNow=Date.now; p.cafeStart(min); const c=p.cafe(); c.active.start=realNow()-(workedMin??min)*60000; p.state.meta.cafe=c; p.cafeCheckinNow(); p.cafeReport(kind);
}
test("an honest 25-minute session pays coins and one ticket, once",()=>{
  const p=setup(); session(p,25,"worked");
  assert.equal(p.state.meta.bloom.coins,8); assert.equal(p.cafe().tickets,1);
  p.cafeReport("worked");   // repeated click after it's done
  assert.equal(p.state.meta.bloom.coins,8); assert.equal(p.cafe().tickets,1); assert.equal(p.cafe().log.length,1);
});
test("drifting is never punished and never paid",()=>{
  const p=setup(); session(p,45,"drifted");
  assert.equal(p.state.meta.bloom.coins,0); assert.equal(p.cafe().tickets,0); assert.equal(p.cafe().guard.min,0);
});
test("checking in early pays only for minutes actually worked, no ticket",()=>{
  const p=setup(); session(p,60,"worked",20);
  assert.equal(p.state.meta.bloom.coins,6); assert.equal(p.cafe().tickets,0);
});
test("daily ticket cap holds on long days",()=>{
  const p=setup(); for(let i=0;i<6;i++) session(p,25,"worked");
  assert.equal(p.cafe().tickets,p.CAFE_DAY_TICKETS);
});
test("finishing a task uses the Board's own completion",()=>{
  const p=setup(); session(p,25,"finished"); assert.deepEqual(p.moved,["t1"]);
});
test("Momentum Guardian fires each check-in once, from focus minutes",()=>{
  const p=setup(); let c=p.cafe(); p.cafeFocusAdd(95,c); assert.equal(p.cafeGuardCheck(c),"brk"); assert.equal(p.cafeGuardCheck(c),"");
  p.cafeFocusAdd(200,c); assert.equal(p.cafeGuardCheck(c),"energy"); p.cafeFocusAdd(100,c); assert.equal(p.cafeGuardCheck(c),"wrap");
});
test("blind boxes guarantee something new after two duplicates",()=>{
  const p=setup(); const c=p.cafe(); c.tickets=1; c.coll={frog:1,bear:1,bunny:1,cat:1,mushroom:1}; c.dupes=2; p.state.meta.cafe=c;
  p.cafePlay(); assert.equal(p.cafe().coll.star,1); assert.equal(p.cafe().tickets,0);
});
test("café use never touches Garden or Bedroom progress",()=>{
  const p=setup(); session(p,25,"worked"); assert.equal(p.state.meta.questPaths,undefined);
});
