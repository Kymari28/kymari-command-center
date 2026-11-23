import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../index.html",import.meta.url),"utf8");
function source(start,end){
  const a=page.indexOf(start),b=page.indexOf(end,a+start.length);
  assert.ok(a>=0 && b>a, start+" is present");
  return page.slice(a,b);
}
const timing=source("function cafeLeft(a){","// ---- focus minutes for Momentum Guardian");
const timingFn=new Function("Date",timing+"return {cafeLeft,cafeWorked,cafePhase,cafeTime};");
test("Café countdown supports another shorter session after a completed hour",()=>{
  let now=1000000;
  const clock={now:()=>now}, t=timingFn(clock);
  let current={active:{min:60,start:now-60*60000,pausedMs:0,pausedAt:null,ready:true}};
  assert.equal(t.cafePhase(current),"ready");
  current.active=null;
  current.active={min:45,start:now,pausedMs:0,pausedAt:null,ready:false};
  assert.equal(t.cafePhase(current),"active");
  now+=30*60000;
  assert.equal(t.cafeLeft(current.active),15*60000);
  assert.equal(t.cafeTime(t.cafeLeft(current.active)),"15:00");
});
test("Paused time does not reduce remaining focus minutes",()=>{
  let now=1000000;
  const t=timingFn({now:()=>now});
  const session={min:45,start:now,pausedMs:0,pausedAt:null};
  now+=10*60000;
  session.pausedAt=now;
  now+=20*60000;
  assert.equal(t.cafeLeft(session),35*60000);
});
test("Completion redraw releases the old animation-frame handle",()=>{
  assert.match(page,/cafeWalk\.raf=0; cafeWalk\.last=0; cafeSave\(c\);/);
  assert.match(page,/document\.addEventListener\("visibilitychange",\(\)=>\{/);
});
test("After reporting, next session can keep the unfinished task and choose a new duration",()=>{
  assert.match(page,/c\.lastTaskId=a\.taskId/);
  assert.match(page,/data-cafe="continue"/);
  assert.match(page,/data-cafe="tomorrow"/);
  assert.match(page,/a==="continue"/);
  assert.match(page,/data-cafe="start" data-v="45"/);
});
test("A completed Board task is not offered as an unfinished next focus session",()=>{
  const section=source("function cafePanel(c,ph){","function cafeNudges(c){");
  assert.match(section,/lastTask\.status!=="done"/);
});
