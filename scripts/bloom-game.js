/* Bloom & Build MVP: self-contained optional game UI. Existing tasks stay authoritative. */
(function(){
"use strict";
const items=[
{id:"fro",type:"hair",name:"Simple curly fro",cost:0,icon:"☁️"},
{id:"twists",type:"hair",name:"Everyday twists",cost:0,icon:"🪮"},
{id:"heart",type:"hair",name:"Heart afro bun",cost:30,icon:"💗"},
{id:"star",type:"hair",name:"Star afro bun",cost:35,icon:"⭐"},
{id:"cream",type:"outfit",name:"Plain cream tee",cost:0,icon:"🤍"},
{id:"moss",type:"outfit",name:"Moss lounge set",cost:0,icon:"🌿"},
{id:"pink",type:"outfit",name:"Cute pink casual",cost:20,icon:"🎀"},
{id:"dress",type:"outfit",name:"Garden party outfit",cost:35,icon:"🌸"},
{id:"pjs",type:"outfit",name:"Starry pajamas",cost:25,icon:"🌙"},
{id:"plant",type:"decor",name:"Little houseplant",cost:15,icon:"🪴"},
{id:"rug",type:"decor",name:"Flower rug",cost:20,icon:"🌼"},
{id:"lamp",type:"decor",name:"Mushroom lamp",cost:25,icon:"🍄"}
];
const rooms=[
{id:"living",icon:"🛋️",name:"Living Room",need:"Your starter space"},
{id:"garden",icon:"🌱",name:"Garden",need:"1 cleaning check-in"},
{id:"bedroom",icon:"🛏️",name:"Bedroom",need:"1 wellness check-in"},
{id:"closet",icon:"👗",name:"Dressing Room",need:"2 shop unlocks"},
{id:"cafe",icon:"☕",name:"Story Café",need:"3 BBB check-ins"}];
const stories={
living:["Welcome home, little dreamer.","This room is a place to begin, not a place to be perfect."],
garden:["The garden gate creaks open.","Every little reset makes room for something to grow."],
bedroom:["A cozy bed and warm lighting await.","Rest is part of your story, too."],
closet:["Someone left a little ribbon on the mirror.","New looks are waiting whenever you feel like dressing up."],
cafe:["The café has a sunny window seat just for you.","One application can be the start of an adventure."]
};
let page="home",group="home",chosen="",story="",scene=0;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const find=id=>items.find(x=>x.id===id);
function state(m){
let v=m&&typeof m==="object"?m:{};
return {coins:Math.max(0,Number(v.coins)||0),
owned:Array.from(new Set(["fro","twists","cream","moss",...(Array.isArray(v.owned)?v.owned:[])])),
hair:v.hair||"fro",outfit:v.outfit||"cream",
mood:v.mood||"calm",
checks:Array.isArray(v.checks)?v.checks.filter(x=>x&&x.id&&x.day).slice(-120):[]};
}
function count(v,kind){return v.checks.filter(x=>x.kind===kind).length;}
function unlocked(v,id){
if(id==="living")return true;
if(id==="garden")return count(v,"home")>0;
if(id==="bedroom")return count(v,"wellness")>0;
if(id==="closet")return v.owned.filter(id=>(find(id)?.cost||0)>0).length>=2;
return count(v,"bbb")>=3;
}
function kindOf(t){return t.area==="home"?"home":t.area==="wellness"?"wellness":"bbb";}
function imageFor(outfit){try{
const x=localStorage.getItem("kcc-bloom-look-"+outfit)||"";
return /^data:image\/(?:png|jpeg|webp);base64,[\w+/=]+$/.test(x)?x:"";
}catch(_){return "";}}
function doll(v){
let picture=imageFor(v.outfit);
return '<div class="bloom-avatar">'+(picture?
'<img src="'+picture+'" class="bloom-avatar-picture" alt="Your customized character">':
'<div class="bloom-avatar-fallback" aria-label="Temporary illustrated avatar placeholder"><span>✿</span><b>◡</b><i>♡</i></div>')+
'<p>'+esc(find(v.hair)?.name||"Curly fro")+' · '+esc(find(v.outfit)?.name||"Simple tee")+'</p></div>';}
function nav(){
return '<nav class="bloom-local-nav">'+[["home","🏡 Home"],["quests","✅ Quests"],["wardrobe","👗 Wardrobe"],["shop","🪙 Shop"],["stories","📖 Stories"]].map(([id,label])=>
'<button data-act="bloom-page" data-v="'+id+'" aria-pressed="'+(page===id)+'">'+label+'</button>').join("")+'</nav>';}
function roomView(v){
return '<div class="bloom-home-grid"><div><div class="bloom-scene"><span class="bloom-window">🌳 ☀️ 🌳</span><span class="bloom-books">📚 🌱</span><span class="bloom-table">💻</span><span class="bloom-sofa">🛋️</span><span class="bloom-plant">🌷 '+(v.owned.includes("plant")?"🪴":"")+'</span>'+(v.owned.includes("rug")?'<span class="bloom-rug">🌼</span>':"")+'</div>'+
'<p class="bloom-hint">Living room unlocked. Cleaning your space unlocks the garden!</p>'+
'<div class="bloom-rooms">'+rooms.map(r=>'<button data-act="bloom-room" data-v="'+r.id+'">'+r.icon+' <b>'+r.name+'</b><small>'+(unlocked(v,r.id)?"Unlocked ♡":"🔒 "+r.need)+'</small></button>').join("")+'</div></div>'+
'<div class="bloom-profile">'+doll(v)+'<p>Current mood: '+esc(v.mood)+'. You choose how she feels.</p>'+
'<button data-act="bloom-page" data-v="quests" class="btn primary">Choose a quest</button>'+
'<button data-act="bloom-page" data-v="wardrobe" class="btn">Change her look</button>'+
'<p class="bloom-note">Your real goals matter more than the coins. There are no broken streaks here. ♡</p></div></div>';}
function quests(v,api){
const available=api.tasks.filter(t=>t.status!=="done"&&t.owner==="me"&&kindOf(t)===group).slice(0,25);
const t=available.find(t=>t.id===chosen),today=api.todayKey();
const already=t&&v.checks.some(c=>c.id===t.id&&c.day===today);
return '<section class="bloom-panel"><h3>Real-life quests</h3><p>BBB, cleaning, and wellness all help your little world bloom.</p>'+
'<div class="bloom-filters">'+[["bbb","💼 BBB"],["home","🧺 Home"],["wellness","🌿 Wellness"]].map(([id,l])=>
'<button data-act="bloom-group" data-v="'+id+'" aria-pressed="'+(group===id)+'">'+l+'</button>').join("")+'</div>'+
(group==="home"?'<button class="btn small" data-act="bloom-new-home">+ Add a 10-minute Home Reset</button>':"")+
(group==="wellness"?'<button class="btn small" data-act="bloom-new-wellness">+ Add a gentle wellness break</button>':"")+
'<div class="bloom-task-list">'+(available.length?available.map(t=>
'<button data-act="bloom-pick" data-id="'+esc(t.id)+'" aria-pressed="'+(chosen===t.id)+'"><b>'+esc(t.title)+'</b><small>'+esc(t.firstStep||"Choose one first step")+'</small></button>').join(""):'<p class="bloom-note">No quests here yet. You can add one above, or choose tasks from your Board.</p>')+'</div>'+
(t?'<div class="bloom-checkin"><h4>'+esc(t.title)+'</h4><button class="btn small" data-act="bloom-focus" data-id="'+esc(t.id)+'">Start Focus Room</button>'+
'<p>How did your quest go?</p>'+(already?'<p>You already checked in today. ♡</p>':
v.checks.filter(c=>c.day===today).length>=3?'<p>Coin rewards are full today. No extra pressure.</p>':
'<div class="bloom-actions"><button class="btn small primary" data-act="bloom-check" data-v="done">I finished · +20</button>'+
'<button class="btn small" data-act="bloom-check" data-v="some">I did some · +10</button>'+
'<button class="btn small" data-act="bloom-check" data-v="skip">Not today</button></div>')+'</div>':"")+
'</section>';}
function wardrobe(v){
const moods=[["calm","😌"],["happy","😊"],["tired","😴"],["sad","😔"],["excited","🤩"],["proud","🥹"]];
const choices=type=>'<div class="bloom-items">'+items.filter(i=>i.type===type).map(i=>
'<button data-act="'+(v.owned.includes(i.id)?"bloom-wear":"bloom-page")+'" data-v="'+(v.owned.includes(i.id)?i.id:"shop")+'" aria-pressed="'+(v[type]===i.id)+'">'+i.icon+' <b>'+i.name+'</b><small>'+(v[type]===i.id?"Wearing ♡":v.owned.includes(i.id)?"Wear":"🔒 "+i.cost+" coins")+'</small></button>').join("")+'</div>';
return '<section class="bloom-panel"><h3>My wardrobe 🎀</h3><p>Basic starters, with cute colorful hairstyles and outfits to unlock.</p>'+
doll(v)+'<h4>Choose her mood</h4><div class="bloom-moods">'+moods.map(([id,face])=>
'<button data-act="bloom-mood" data-v="'+id+'" aria-pressed="'+(v.mood===id)+'">'+face+' '+id+'</button>').join("")+'</div>'+
'<h4>Hair</h4>'+choices("hair")+'<h4>Outfits</h4>'+choices("outfit")+
'<div class="bloom-upload"><label for="bloom-upload">Add a custom character PNG for the outfit you are wearing (saved only on this device)</label><input id="bloom-upload" type="file" accept="image/png,image/jpeg,image/webp" data-bloom-avatar></div></section>';}
function shop(v){
return '<section class="bloom-panel"><h3>Little reward shop 🛍️</h3><p>Spend coins earned through real quest check-ins. No real money.</p>'+
'<div class="bloom-items">'+items.filter(i=>i.cost>0).map(i=>
'<div class="bloom-product">'+i.icon+'<b>'+i.name+'</b><small>'+i.cost+' coins</small>'+
'<button class="btn small" data-act="bloom-buy" data-v="'+i.id+'" '+(v.owned.includes(i.id)||v.coins<i.cost?"disabled":"")+'>'+
(v.owned.includes(i.id)?"Owned":v.coins<i.cost?"Save up":"Unlock")+'</button></div>').join("")+'</div></section>';}
function storyList(v){
return '<section class="bloom-panel"><h3>My little storybook 📖</h3><p>Unlock new places through your own story.</p>'+
'<div class="bloom-rooms">'+rooms.map(r=>'<button data-act="bloom-room" data-v="'+r.id+'">'+r.icon+' <b>'+r.name+'</b><small>'+ (unlocked(v,r.id)?"Read a little scene":r.need)+'</small></button>').join("")+'</div></section>';}
function storyOverlay(){
if(!story)return "";
const r=rooms.find(x=>x.id===story),lines=stories[story]||[];
return '<div class="bloom-overlay" role="dialog" aria-label="Little story"><div class="bloom-dialog"><p>✧ A little adventure ✧</p>'+
'<span>'+r.icon+'</span><h3>'+r.name+'</h3><p>'+esc(lines[scene]||"")+'</p><button class="btn primary" data-act="bloom-next">'+(scene===0?"Continue":"Back home")+'</button></div></div>';}
function view(api){
const v=state(api.meta.bloom);
const panel=page==="quests"?quests(v,api):page==="wardrobe"?wardrobe(v):page==="shop"?shop(v):page==="stories"?storyList(v):roomView(v);
return '<div class="bloom-wrap"><header class="bloom-header"><div><span>cozy life sim for real goals</span><h2>Bloom &amp; Build 🌷</h2><p>Little quests. New looks. A home that grows with you.</p></div>'+
'<div class="bloom-coins">🪙 '+v.coins+' coins</div></header>'+nav()+panel+storyOverlay()+'</div>';}
function handle(button,api){
const action=button.dataset.act,key=button.dataset.v||"",v=state(api.meta.bloom);
if(action==="bloom-page"){page=key;api.render();return;}
if(action==="bloom-group"){group=key;chosen="";api.render();return;}
if(action==="bloom-pick"){chosen=button.dataset.id;api.render();return;}
if(action==="bloom-mood"){v.mood=key;api.putMeta({bloom:v});return;}
if(action==="bloom-wear"){const i=find(key);if(i&&v.owned.includes(key)&&["hair","outfit"].includes(i.type)){v[i.type]=key;api.putMeta({bloom:v});}return;}
if(action==="bloom-buy"){const i=find(key);if(!i||v.owned.includes(key)||v.coins<i.cost)return;v.coins-=i.cost;v.owned.push(key);if(["hair","outfit"].includes(i.type))v[i.type]=key;api.putMeta({bloom:v});api.toast("New unlock! "+i.name);return;}
if(action==="bloom-room"){if(!unlocked(v,key)){api.toast("Unlock by doing: "+rooms.find(r=>r.id===key)?.need);return;}story=key;scene=0;api.render();return;}
if(action==="bloom-next"){if(scene===0)scene=1;else{scene=0;story="";}api.render();return;}
if(action==="bloom-focus"){const t=api.tasks.find(t=>t.id===button.dataset.id);if(t)api.openFocus(t);return;}
if(action==="bloom-new-home"||action==="bloom-new-wellness"){
const home=action==="bloom-new-home";
const t=api.newTask({area:home?"home":"wellness",owner:"me",autoAssign:false,status:"someday",effort:"tiny",
title:home?"Reset one small area for 10 minutes":"Take a gentle wellbeing break",
firstStep:home?"Pick one small surface or sort one bag. Stop at 10 minutes.":"Choose one kind activity for yourself."});
api.putTask(t);group=home?"home":"wellness";chosen=t.id;api.toast("Added one tiny quest.");return;}
if(action==="bloom-check"){
const t=api.tasks.find(t=>t.id===chosen);
if(!t)return;
if(key==="skip"){api.toast("No penalty. Come back when you're ready.");return;}
if(!["done","some"].includes(key))return;
const day=api.todayKey();
if(v.checks.some(c=>c.id===t.id&&c.day===day)||v.checks.filter(c=>c.day===day).length>=3)return;
const before=rooms.filter(r=>unlocked(v,r.id)).map(r=>r.id);
v.coins+=key==="done"?20:10;
v.checks.push({id:t.id,day,kind:kindOf(t),result:key});
v.checks=v.checks.slice(-120);
api.putMeta({bloom:v});
if(key==="done"){const task=api.tasks.find(x=>x.id===t.id);if(task)api.moveTo(task,"done");}
const opened=rooms.find(r=>!before.includes(r.id)&&unlocked(v,r.id));
page="home";chosen="";
api.toast("+"+(key==="done"?20:10)+" coins! "+(opened?"New room unlocked: "+opened.name:"You showed up."));
if(opened){story=opened.id;scene=0;api.render();}
}}
function upload(input,api){
const file=input.files?.[0];if(!file)return;
if(file.size>8000000||!/^image\/(png|jpeg|webp)$/.test(file.type)){api.toast("Choose an image under 8 MB.");return;}
const reader=new FileReader();
reader.onload=()=>{const image=new Image();image.onload=()=>{
const can=document.createElement("canvas");can.width=320;can.height=400;const ctx=can.getContext("2d");
const scale=Math.min(320/image.width,400/image.height);
ctx.drawImage(image,(320-image.width*scale)/2,(400-image.height*scale)/2,image.width*scale,image.height*scale);
try{const id=state(api.meta.bloom).outfit;localStorage.setItem("kcc-bloom-look-"+id,can.toDataURL("image/png"));api.toast("Character saved to this browser.");api.render();}
catch(_){api.toast("Browser storage is full.");}};
image.onerror=()=>api.toast("Could not open picture.");image.src=String(reader.result||"");};
reader.readAsDataURL(file);
}
window.Bloom={view,handle,upload};
})();