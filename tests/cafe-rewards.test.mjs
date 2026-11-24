import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const begin=page.indexOf("  function cafeUnclaimed(c){");
const end=page.indexOf("function cafeLeft(a){",begin);
assert.ok(begin>=0&&end>begin,"Café reward helpers exist");
const rewards=page.slice(begin,end);
const load=new Function("cafe","bb","cafeSave","toast","setTimeout","currentView","bbUI","cafeBurst","matchMedia","confetti","esc",
  rewards+"return {cafeUnclaimed,cafeRewardHTML,cafeCollectReward};");
function setup(log,originalCoins=20,originalTickets=0){
  const state={
    cafe:{log:structuredClone(log),tickets:originalTickets},
    bloom:{coins:originalCoins}
  };
  const toasts=[];
  const actions=load(()=>structuredClone(state.cafe),()=>structuredClone(state.bloom),
    (next,extra)=>{state.cafe=structuredClone(next);if(extra?.bloom)state.bloom=structuredClone(extra.bloom);},
    message=>toasts.push(message),()=>{},()=> "world",{place:"cafe"},()=>{},
    ()=>({matches:true}),()=>{},s=>s);
  return {state,toasts,...actions};
}
const earned={id:"s1",min:45,worked:45,kind:"worked",coins:14,ticket:true,claimed:false};
test("An unclaimed session shows a floating keyboard-accessible reward",()=>{
  const c=setup([earned]);
  assert.match(c.cafeRewardHTML(c.state.cafe),/You did it/);
  assert.match(c.cafeRewardHTML(c.state.cafe),/Collect 14 coins and one arcade ticket/);
  assert.match(c.cafeRewardHTML(c.state.cafe),/data-cafe="collect"/);
  assert.equal(c.state.bloom.coins,20);
  assert.equal(c.state.cafe.tickets,0);
});
test("Collect saves coins and ticket exactly once",()=>{
  const c=setup([earned]);
  assert.equal(c.cafeCollectReward("s1"),true);
  assert.equal(c.state.bloom.coins,34);
  assert.equal(c.state.cafe.tickets,1);
  assert.equal(c.state.cafe.log[0].claimed,true);
  assert.equal(c.cafeCollectReward("s1"),false);
  assert.equal(c.state.bloom.coins,34);
  assert.equal(c.state.cafe.tickets,1);
  assert.equal(c.cafeRewardHTML(c.state.cafe),"");
});
test("Older credited sessions without claimed flag are never paid a second time",()=>{
  const c=setup([{id:"old",min:60,worked:60,coins:18,ticket:true}]);
  assert.equal(c.cafeRewardHTML(c.state.cafe),"");
  assert.equal(c.cafeCollectReward("old"),false);
  assert.equal(c.state.bloom.coins,20);
  assert.equal(c.state.cafe.tickets,0);
});
test("An unclaimed reward survives simulated refresh and another pending reward remains available",()=>{
  const c=setup([earned,{id:"s2",min:25,worked:25,coins:8,ticket:true,claimed:false}]);
  const persisted=structuredClone(c.state);
  const next=setup(persisted.cafe.log,persisted.bloom.coins,persisted.cafe.tickets);
  assert.match(next.cafeRewardHTML(next.state.cafe),/14 coins/);
  assert.equal(next.cafeCollectReward("s1"),true);
  assert.match(next.cafeRewardHTML(next.state.cafe),/8 coins/);
  assert.equal(next.cafeCollectReward("s2"),true);
  assert.equal(next.state.bloom.coins,42);
  assert.equal(next.state.cafe.tickets,2);
});
test("No reward pop-up or credits for drifted zero-coin sessions",()=>{
  const c=setup([{id:"drift",min:45,worked:45,coins:0,ticket:false,claimed:true}]);
  assert.equal(c.cafeRewardHTML(c.state.cafe),"");
  assert.equal(c.cafeCollectReward("drift"),false);
});
test("Reward markup is inserted into the cafe, without modifying the wardrobe",()=>{
  assert.match(page,/cafeRewardHTML\(c\)/);
  assert.match(page,/assets\/cafe-rewards\.css/);
  assert.match(page,/claimed:!\(coins>0\|\|ticket\)/);
});
