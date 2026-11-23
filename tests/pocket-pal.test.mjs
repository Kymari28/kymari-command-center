import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const start=page.indexOf("  const POCKET_LINES=");
const end=page.indexOf("/* ============ router ============ */",start);
assert.ok(start>=0 && end>start,"Pocket Pal implementation must exist");
const make=new Function("state","tasks","bbMood","bbPortrait","esc","toast","render","todayKey","currentView","moveTo","addQuestCheckin","setInterval","clearInterval","document",
  page.slice(start,end)+"return {pocketSession,pocketMarkup,pocketStart,pocketPause,pocketReturn,pocketFinish};");
function setup(){
 const state={tasks:new Map([["home",{id:"home",title:"Reset one zone",area:"home",owner:"me",status:"now"}]]),meta:{}};
 const checkins=[],finished=[];
 const pal=make(state,()=>[...state.tasks.values()],()=> "low",()=> "low",v=>v,()=>{},()=>{},()=> "2026-11-23",()=> "today",
   (t,v)=>{t.status=v;finished.push(t.id)},(t,k)=>checkins.push({id:t.id,kind:k}),()=>1,()=>{},
   {getElementById:id=>id==="pocket-zone"?{value:"Laundry"}:null});
 return {state,checkins,finished,...pal};
}
test("Pocket Pal uses existing portrait and offers substantial sessions",()=>{
 const p=setup(),html=p.pocketMarkup();
 assert.match(html,/bloom-portrait-low.webp/);
 for(const minutes of [20,45,60])assert.ok(html.includes('data-v="'+minutes+'"'));
 assert.ok(!html.includes('data-v="2"'));
 assert.match(html,/pocket-zone/);
});
test("A 20-minute session stores selected zone, can pause, and returns to check-in",()=>{
 const p=setup();p.pocketStart(20);
 assert.equal(p.pocketSession.remaining,1200);
 assert.equal(p.pocketSession.zone,"Laundry");
 p.pocketPause();assert.equal(p.pocketSession.phase,"paused");
 p.pocketReturn();assert.equal(p.pocketSession.phase,"ready");
 p.pocketFinish("some");
 assert.deepEqual(p.checkins,[{id:"home",kind:"some"}]);
 assert.equal(p.state.tasks.get("home").status,"now");
});
test("Taking a rest never grants coins or marks a task complete",()=>{
 const p=setup();p.pocketStart(45);p.pocketReturn();p.pocketFinish("rest");
 assert.equal(p.checkins.length,0);assert.equal(p.finished.length,0);
});
test("Finishing a 60-minute mission updates the Board via existing completion workflow",()=>{
 const p=setup();p.pocketStart(60);assert.equal(p.pocketSession.remaining,3600);
 p.pocketReturn();p.pocketFinish("done");
 assert.deepEqual(p.finished,["home"]);
});
test("Timer is not the reward and invalid durations are ignored",()=>{
 const p=setup();p.pocketStart(5);
 assert.equal(p.pocketSession.phase,"idle");
 assert.equal(p.checkins.length,0);
});
