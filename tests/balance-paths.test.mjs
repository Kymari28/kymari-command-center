import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const from=source.indexOf("  const PATH_TARGET=3;");
const until=source.indexOf("/* ============ router ============ */",from);
assert.ok(from>=0&&until>from,"Quest helper code must exist");
const helpers=source.slice(from,until);
const build = new Function("state","putMeta","bb","todayKey","toast", helpers +
  "return {questLog,questDays,questPath,addQuestCheckin};");

function setup(){
  const state={meta:{}},msgs=[],clock={day:"2026-11-23"};
  const ctx=build(state,patch=>Object.assign(state.meta,patch),
    ()=>({coins:state.meta.bloom?.coins||0}),
    ()=>clock.day,
    msg=>msgs.push(msg));
  return {state,msgs,clock,...ctx};
}

test("Garden and Bedroom start locked even if there are previously done Board cards",()=>{
 const c=setup(); assert.equal(c.questDays(c.questLog(),"home"),0);
 assert.equal(c.questDays(c.questLog(),"wellness"),0);
});

test("Cleaning requires three distinct check-in dates and grants no duplicate coins",()=>{
 const c=setup();const task={id:"clean",area:"home",owner:"me",status:"now"};
 assert.equal(c.addQuestCheckin(task,"some"),true);
 assert.equal(c.addQuestCheckin(task,"some"),false);
 assert.equal(c.questDays(c.questLog(),"home"),1);
 assert.equal(c.state.meta.bloom.coins,5);
 c.clock.day="2026-11-24";c.addQuestCheckin(task,"some");
 assert.equal(c.questDays(c.questLog(),"home"),2);
 c.clock.day="2026-11-26";c.addQuestCheckin(task,"some");
 assert.equal(c.questDays(c.questLog(),"home"),3);
 assert.match(c.msgs.at(-1),/Garden unlocked/);
});

test("Wellness advances Bedroom only; BBB advances Career only",()=>{
 const c=setup();
 const move={id:"swim",area:"wellness",owner:"me",status:"now"};
 const work={id:"apply",area:"job",owner:"me",status:"now"};
 c.addQuestCheckin(move,"some");
 assert.equal(c.questDays(c.questLog(),"home"),0);
 assert.equal(c.questDays(c.questLog(),"wellness"),1);
 c.addQuestCheckin(work,"done");
 assert.equal(c.questDays(c.questLog(),"bbb"),1);
 assert.equal(c.questDays(c.questLog(),"wellness"),1);
});

test("Finished tasks cannot claim partial-progress coins",()=>{
 const c=setup();
 assert.equal(c.addQuestCheckin({id:"done",area:"home",owner:"me",status:"done"},"some"),false);
 assert.equal(c.state.meta.bloom,undefined);
});

test("An unrelated agent task cannot unlock rooms",()=>{
 const c=setup();
 assert.equal(c.addQuestCheckin({id:"agent",area:"home",owner:"codex",status:"now"},"done"),false);
 assert.equal(c.questDays(c.questLog(),"home"),0);
});

test("Signed-out interface includes private data gate without rendering local Board",()=>{
 assert.match(source, /if\(state\.mode==="auth"\)\{\$\("#view"\)\.innerHTML=privacyGate\(\);return;\}/);
 assert.match(source, /state\.mode="auth"; state\.tasks\.clear\(\); state\.meta=\{\}/);
 assert.match(source, /localStorage\.removeItem\(LS_KEY\)/);
});