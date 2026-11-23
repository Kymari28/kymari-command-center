(()=>{
'use strict';
const STORE='bloom-build-local-preview-2026-v2';
const HAIRS=[
{id:'fro',name:'Curly fro',short:'Classic',cost:0,kind:'Starter'},
{id:'twists',name:'Braids / twists',short:'Everyday',cost:0,kind:'Starter'},
{id:'heart',name:'Heart-shaped afro bun',short:'Playful unlock',cost:28,kind:'Unlock'},
{id:'star',name:'Star-shaped afro bun',short:'Star reward',cost:34,kind:'Unlock'}];
const OUTFITS=[
{id:'cream',name:'Basic cream tee',short:'Easygoing basics',cost:0,kind:'Starter'},
{id:'moss',name:'Simple moss lounge set',short:'Comfy neutral',cost:0,kind:'Starter'},
{id:'pink',name:'Pink floral casual',short:'Cute color unlock',cost:25,kind:'Unlock'},
{id:'dress',name:'Forest-green dressy look',short:'Main character moment',cost:35,kind:'Unlock'},
{id:'pjs',name:'Golden star pajamas',short:'Soft nights',cost:30,kind:'Unlock'}];
const LOOKS=OUTFITS;
const DECOR=[{id:'fern',name:'Little fern',cost:15,icon:'🪴',note:'For your living room'},{id:'lamp',name:'Mushroom lamp',cost:20,icon:'🍄',note:'For cozy evenings'},{id:'rug',name:'Daisy flower rug',cost:20,icon:'🌸',note:'A little room upgrade'}];
const MOODS=[{id:'calm',icon:'😌',label:'Calm'},{id:'tired',icon:'😴',label:'Tired'},{id:'sad',icon:'🥺',label:'Sad'},{id:'happy',icon:'😊',label:'Happy'},{id:'excited',icon:'🤩',label:'Excited'},{id:'proud',icon:'🥹',label:'Proud'}];
const ROOMS=[
{id:'living',name:'Living room',icon:'🛋️',need:'Your starter room',tag:'START HERE'},
{id:'garden',name:'Secret garden',icon:'🌸',need:'Complete a home check-in',tag:'CLEANING'},
{id:'bedroom',name:'Dream bedroom',icon:'🛏️',need:'Complete a wellness check-in',tag:'WELLNESS'},
{id:'closet',name:'Dressing room',icon:'🎀',need:'Buy 2 rewards from the shop',tag:'FASHION'},
{id:'cafe',name:'Story café',icon:'☕',need:'Complete 3 BBB check-ins',tag:'CAREER'}
];
const STORIES={
living:['The little apartment is quiet this morning. A cup of tea waits by your laptop.','You have plans, dreams, and unfinished lists. But your story can begin with one small choice.'],
garden:['A door opens onto a patch of sunlight and green leaves.','That small bit of cleaning gave your world room to grow. A new plant has taken root.'],
bedroom:['Soft sheets, warm lamplight, and a quiet corner just for you.','You remember that resting is something you need, not a prize for getting everything done.'],
closet:['Behind the wardrobe door is a ribbon tied around a little gift box.','Style is a kind of play. Today you can decide what version of yourself to celebrate.'],
cafe:['The barista points to your favorite table near the window.','Your next chapter starts with a small brave career step. There is no need to know the whole ending.']
};
const INITIAL_TASKS=[
{id:'t1',kind:'bbb',title:'Work on a promising paid opportunity',step:'Open one opportunity and write down the next action.',minutes:25,done:false},
{id:'t2',kind:'bbb',title:'Give my portfolio 25 minutes',step:'Choose one screen or project to improve.',minutes:25,done:false},
{id:'t3',kind:'home',title:'Clear one comfortable corner',step:'Pick only the bedside, desk, or another small surface.',minutes:10,done:false},
{id:'t4',kind:'home',title:'Sort one small batch of laundry',step:'Start with the clothes you need this week.',minutes:10,done:false},
{id:'t5',kind:'wellness',title:'Get outside for fresh air',step:'Step outside or go somewhere that feels easier to focus.',minutes:10,done:false},
{id:'t6',kind:'wellness',title:'Make space for food and rest',step:'Eat something and allow a break without earning it.',minutes:10,done:false}
];
const fresh=()=>({coins:0,mode:'steady',hair:'fro',outfit:'cream',owned:['fro','twists','cream','moss'],activeTab:'world',category:'all',room:'living',source:'demo',tasks:INITIAL_TASKS.map(x=>({...x,status:'now'})),checkins:[],celebrateAt:0,sceneSeen:[],note:0});
let data;try{data={...fresh(),...JSON.parse(localStorage.getItem(STORE)||'{}')};}catch(_){data=fresh();}
if(!Array.isArray(data.tasks))data.tasks=INITIAL_TASKS.map(t=>({...t}));
if(!Array.isArray(data.checkins))data.checkins=[];
if(!Array.isArray(data.owned))data.owned=['fro','twists','cream','moss'];
if(!Array.isArray(data.sceneSeen))data.sceneSeen=[];
if(!OUTFITS.some(l=>l.id===data.outfit))data.outfit='cream';if(!HAIRS.some(l=>l.id===data.hair))data.hair='fro';
let selectedTask='t3',overlay=null,timer=null,activeStoryListener=null,activeTimerListener=null;
const $=id=>document.getElementById(id);
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(data));}catch(_){notify('Browser storage unavailable: this session may not be saved.');}};
const selectedLook=()=>OUTFITS.find(l=>l.id===data.outfit)||OUTFITS[0];
const lookImg=l=>`assets/outfit-${l.id}.webp`;
function faceMood(){
 if(data.celebrateAt && Date.now()-data.celebrateAt<45*60000)return MOODS.find(m=>m.id==='proud');
 return MOODS.find(m=>m.id===(data.mode==='low'?'tired':data.mode==='charged'?'excited':'calm'));
}
function avatarLayers(extra=''){
 const hair=['fro','twists','heart','star'].includes(data.hair)?data.hair:'fro';
 const outfit=OUTFITS.some(x=>x.id===data.outfit)?data.outfit:'cream';
 const mood=faceMood();
 return `<div class="character-portrait mood-${mood.id} ${extra}" role="img" aria-label="Your illustrated character in ${escapeHtml(outfit)} with ${escapeHtml(hair)} hair">
 <img src="assets/hair-back-${hair}.webp" alt=""><img src="assets/avatar-base.webp" alt="">
 <img src="assets/outfit-${outfit}.webp" alt=""><img src="assets/hair-front-${hair}.webp" alt="">
 <span class="character-portrait-emotion">${mood.icon} ${mood.label}</span></div>`;
}
const count=kind=>data.checkins.filter(x=>x.kind===kind&&x.result!=='skip').length;
const spent=()=>data.owned.filter(x=>[...HAIRS,...OUTFITS,...DECOR].some(l=>l.id===x&&l.cost)).length;
const roomUnlocked=room=>room==='living'||(room==='garden'&&count('home')>=1)||(room==='bedroom'&&count('wellness')>=1)||(room==='closet'&&spent()>=2)||(room==='cafe'&&count('bbb')>=3);
const mood=()=>faceMood();
const getTask=id=>data.tasks.find(t=>t.id===id);
const alreadyToday=id=>data.checkins.some(c=>c.id===id&&c.day===today()&&c.result!=='skip');
const completedToday=()=>data.checkins.filter(x=>x.day===today()&&x.result!=='skip').length;
const checkCard=kind=>({bbb:['Career','💼','#bbd5aa'],home:['Home','🧺','#d3b69c'],wellness:['Wellness','🌿','#f0caaa']})[kind]||['BBB','💼','#bbd5aa'];
const notes=['I’m proud of you for showing up. One little thing is enough.','You deserve care on the days your energy is low, too.','You can work toward your dreams without exhausting yourself.','Progress can be slow. The little things still count.'];
let toastTimer;
function notify(message){const el=$('toast');el.textContent=message;el.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('on'),3600);}
function saveRender(){save();render();}
function setTab(tab){data.activeTab=tab;saveRender();window.scrollTo({top:0,behavior:'instant'});}
function pageHead(title,subtitle,section){return `<section class="page-head"><div><p class="eyebrow">${escapeHtml(section||'YOUR LITTLE WORLD')}</p><h1>${title}</h1><p class="page-sub">${escapeHtml(subtitle)}</p></div></section>`;}
function badge(kind){let m=checkCard(kind);return `<span class="tag ${kind==='home'?'home':kind==='wellness'?'health':''}">${m[1]} ${m[0]}</span>`;}
function energyButtons(){return `<div class="mode-switch">${[['low','🌱 Low'],['steady','🌿 Steady'],['charged','🌸 Charged']].map(([id,name])=>`<button data-energy="${id}" class="${data.mode===id?'active':''}" aria-pressed="${data.mode===id}">${name}</button>`).join('')}</div>`;}
function daySuggestions(){const open=data.tasks.filter(x=>!x.done);const preferred=['bbb','home','wellness'];const result=[];for(const kind of preferred){const task=open.find(x=>x.kind===kind);if(task)result.push(task);}return data.mode==='low'?result.slice(0,1):data.mode==='steady'?result.slice(0,2):result.slice(0,3);}
function todayView(){
const title=data.mode==='low'?"A gentler kind of day":data.mode==='steady'?"A day for steady growth":"A little extra sunshine today";
const msg=data.mode==='low'?notes[data.note%notes.length]:data.mode==='steady'?"You have some momentum. We can protect it instead of spending all of it.":"Let's make progress, then leave a little energy for tomorrow.";
const d=daySuggestions();
return `${pageHead('Your little <span class="accent">today</span> ✿','A place for BBB goals, home resets, and looking after yourself.','MONDAY–SUNDAY · YOUR PACE')}
<div class="welcome-grid"><section class="care-card"><span class="smallcaps">A NOTE JUST FOR YOU ♡</span><h2>${escapeHtml(msg)}</h2><p>${data.mode==='low'?'You do not need to prove anything today. Rest is allowed.':data.mode==='steady'?'Try one main thing, one smaller thing, then a real break.': 'More energy does not mean you have to use all of it.'}</p><button class="button rose tiny" data-next-note>Another note ♡</button></section>
<section class="energy-card"><p class="smallcaps">TODAY’S CHECK-IN</p><h3>How’s your energy?</h3><p>Your mood can change. Your worth doesn't.</p>${energyButtons()}</section></div>
<section class="board-grid"><div class="card priority-card"><div class="section-head" style="margin-top:0"><h2>${data.mode==='low'?'One thing is plenty':data.mode==='steady'?'A gentle two-part plan':'Your suggested priorities'}</h2><button class="button tiny ghost" data-tab="board">See quests</button></div><div class="check-list">${d.length?d.map((task,index)=>`<div class="priority-item"><span class="priority-number">0${index+1}</span><div><h4>${escapeHtml(task.title)}</h4><p>${escapeHtml(task.step)}</p>${badge(task.kind)}</div><button class="button tiny" data-open-task="${task.id}">Start</button></div>`).join(''):'<p>No unfinished demo tasks. You can add more in Quests.</p>'}</div></div>
<div class="card guard-card"><p class="smallcaps">PROTECT YOUR ENERGY 🌿</p><h3>Help me decide</h3><p>${data.mode==='low'?'Choose basic care, a tiny win, or a little rest. You never have to complete every category.':data.mode==='steady'?'Pick one meaningful priority. Add a 10-minute home reset if you have room for it. Stop before you run empty.':'Choose one important block, one optional block, and a stopping point. Your break is part of the plan.'}</p><div class="line"></div><div class="dayplan"><div><i>🍽️</i> Food and basic care first</div><div><i>💼</i> Real deadlines, income, and BBB</div><div><i>🏡</i> Home comfort without a marathon</div><div><i>🌼</i> Enjoyment and recovery belong here</div></div><div style="margin-top:16px"><button class="button primary" data-tab="board">Find my next quest</button></div></div></section>
<div class="section-head"><h2>A little world that's growing with you</h2><p>Unlocked rooms: ${ROOMS.filter(r=>roomUnlocked(r.id)).length} / 5</p></div>${roomTiles()}`;
}
function roomTiles(){return `<div class="room-unlocks">${ROOMS.map(r=>`<button class="unlock-room ${roomUnlocked(r.id)?'current':'locked'}" data-room="${r.id}"><span class="room-icon">${r.icon}</span>${!roomUnlocked(r.id)?'<span class="lock-icon">🔒</span>':''}<div><strong>${r.name}</strong><small>${roomUnlocked(r.id)?(r.id==='living'?'Your cozy home base':'Unlocked · explore'):r.need}</small></div></button>`).join('')}</div>`;}
function worldView(){
const which=ROOMS.find(r=>r.id===data.room)||ROOMS[0];
if(!roomUnlocked(which.id))data.room='living';
const current=ROOMS.find(r=>r.id===data.room)||ROOMS[0];
const isLiving=current.id==='living';
return `${pageHead('My <span class="accent">world</span> ♡','Your little apartment is the star. Tap computer-you to interact, or visit your Board to make progress.','BLOOM & BUILD · YOUR LIFE SIM')}
<div class="world-headline"><div><strong>${escapeHtml(current.name)}</strong><small>${roomUnlocked(current.id)?'A cozy chapter of your story':'Not unlocked yet'}</small></div><div class="world-level"><span>✦ Level ${1+Math.floor(data.checkins.length/3)}</span><span>🌱 ${ROOMS.filter(r=>roomUnlocked(r.id)).length}/5 rooms</span></div></div>
<div class="world-stage">
  <div class="apartment-shell ${isLiving?'starter-apartment':'other-apartment'}">
    <div class="apartment-wallpaper"></div><div class="apartment-window"><div class="sky">☁️</div><div class="view-trees">🌲 🌿 🌳</div></div>
    <div class="apartment-arch"><span>${current.icon}</span></div><div class="apartment-floor"></div>
    ${isLiving?`<div class="starting-sofa">🛋️</div><div class="starting-desk">💻</div><div class="starting-shelf">📚</div>`:`<div class="room-unlock-decoration">${current.icon}</div>`}
    ${data.owned.includes('fern')?'<div class="reward-fern">🪴</div>':''}
    ${data.owned.includes('lamp')?'<div class="reward-lamp">🍄</div>':''}
    ${data.owned.includes('rug')?'<div class="reward-rug">🌼 🌼</div>':''}
    <button class="pixel-you-button" data-chat aria-label="Talk to your character"><img id="pixelYou" src="assets/pixel-walk-0.webp" alt=""><span>Tap me ♡</span></button>
  </div>
</div>
<div class="world-action-bar"><p>Her mood follows your energy check-in and recent wins—not unfinished tasks. <strong>${mood().icon} ${mood().label}</strong></p><button class="button primary" data-tab="board">Start a Board task</button><button class="button rose" data-open-closet>Dress her up</button></div>
<div class="section-head"><h2>Rooms to grow into</h2><p>Garden unlocks with a cleaning check-in</p></div>${roomTiles()}
<div class="world-note">The apartment is a temporary empty-room shell for testing layout. We'll choose the final CC0 walls and flooring before publishing artwork.</div>`;
}
function questRow(t){return `<button class="quest-tile ${selectedTask===t.id?'active':''}" data-open-task="${t.id}"><span class="quest-icon">${checkCard(t.kind)[1]}</span><div><strong>${escapeHtml(t.title)} ${t.done?'✓':''}</strong><small>${t.done?'Finished':alreadyToday(t.id)?'Checked in today':escapeHtml(t.step)}</small></div><span class="arrow">›</span></button>`;}
function taskDetail(t){if(!t)return `<p>Choose a quest on the left to begin.</p>`;let completed=alreadyToday(t.id);const full=completedToday()>=3;
return `<article class="card quest-detail"><p class="eyebrow">YOUR NEXT BOARD TASK</p><h3>${escapeHtml(t.title)}</h3>${badge(t.kind)}<div class="quote"><b>The very first step:</b><br>${escapeHtml(t.step)}</div><p>You can use a timer, or start whenever you're ready. We'll check in afterward—not judge how perfect it was.</p><div class="actions"><button class="button primary" data-timer="${t.id}">◷ Focus ${t.minutes} min</button><button class="button" data-checkin-menu="${t.id}">Check in now ♡</button></div>${completed?'<p class="quest-feedback">✓ You already checked in for this task today. Thank you for showing up.</p>':full?'<p class="quest-feedback">You earned the coin rewards for today. You can still do any quest without extra pressure.</p>':''}</article>`;}
function boardView(){
const statuses=[['now','Now'],['someday','Parking lot'],['review','Waiting on me'],['agent','With agent'],['others','Waiting on others'],['done','Done']];
const tasks=data.tasks.filter(t=>data.category==='all'||data.category===t.kind);
const chosenTask=getTask(selectedTask)||tasks.find(t=>!t.done)||tasks[0];
return `${pageHead('Your <span class="accent">Board</span>','The game uses the tasks already on your Board. No second quest checklist.','SAME TASKS · OPTIONAL GAME REWARDS')}
<div class="board-import card"><div><h3>Try this with your actual Command Center Board</h3><p>${data.source==='import'?'Showing your locally imported Board snapshot. Changes in this preview do not update your live tracker.':'Using sample tasks for now. Import a Command Center JSON backup to preview your actual tasks, privately in this browser.'}</p></div>
<label for="boardImport" class="button rose">Import my Board backup</label><input id="boardImport" type="file" accept="application/json,.json" hidden><button class="button tiny" data-demo-board>Use sample tasks</button></div>
<div class="quest-filter">${[['all','✿ All'],['bbb','💼 BBB'],['home','🧺 Cleaning'],['wellness','🌿 Wellness']].map(([id,label])=>`<button class="${data.category===id?'active':''}" data-category="${id}">${label}</button>`).join('')}</div>
<div class="board-columns">${statuses.map(([id,label])=>`<section class="board-column"><h3>${label}</h3>${tasks.filter(t=>(t.status||'now')===id||(!t.status&&id==='now')).slice(0,35).map(t=>`<button class="board-task ${selectedTask===t.id?'selected':''}" data-open-task="${escapeHtml(t.id)}"><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.step||'Choose one small first step')}</small><span>${checkCard(t.kind)[1]} ${checkCard(t.kind)[0]}</span></button>`).join('')||'<p class="empty-col">Nothing here</p>'}</section>`).join('')}</div>
<div class="board-task-detail">${taskDetail(chosenTask)}</div>
<p class="soft-note">The original Board, Areas, Rhythms, and Agents designs will stay unchanged in the actual Command Center. This local page shows the Board-to-game connection only.</p>`;
}
function originalTabPreview(which){return `${pageHead(which,'This is an unchanged Command Center section.','ORIGINAL COMMAND CENTER')}
<div class="card card-pad"><h2>${which} stays exactly as it is.</h2><p>This standalone local design test does not replace or rebuild your existing ${which} tab. The real app preserves it when My World and Shop are added.</p><button class="button primary" data-tab="world">Back to My World</button></div>`;}
function closetView(){
const part=(group,values)=>`<div class="wardrobe-items">${values.map(x=>`<button class="wardrobe-item ${data[group]===x.id?'selected':''}" data-equip-part="${group}" data-equip-value="${x.id}"><span class="wardrobe-swatch">${group==='hair'?(x.id==='fro'?'☁️':x.id==='twists'?'🪮':x.id==='star'?'⭐':'💗'):x.id==='cream'?'🤍':x.id==='moss'?'🌿':x.id==='pink'?'🎀':x.id==='dress'?'🌺':'🌙'}</span><strong>${escapeHtml(x.name)}</strong><small>${data[group]===x.id?'✓ Wearing':data.owned.includes(x.id)?'Owned · wear it':'🔒 '+x.cost+' coins'}</small></button>`).join('')}</div>`;
return `${pageHead('Your little <span class="accent">wardrobe</span>','Mix hairstyles and outfits independently. Special colors and playful looks are rewards.','A CUTE COMPUTER YOU')}
<div class="closet-grid"><div class="full-avatar">${avatarLayers('wardrobe-pose')}</div><div class="card closet-picker"><p class="smallcaps">DRESS-UP TIME ♡</p><h3>Make her cute</h3><p class="page-sub">Her facial mood follows your energy check-in, and shifts to proud after a quest check-in.</p><div class="section-head"><h2>Hairstyles</h2></div>${part('hair',HAIRS)}<div class="section-head"><h2>Outfits</h2></div>${part('outfit',OUTFITS)}<div class="soft-note">This prototype uses independent layers made from your selected character template. The art will receive one more polish pass before launch.</div><div class="mini-nav"><button class="button" data-tab="world">Back to my world</button><button class="button rose" data-tab="shop">Visit the shop</button></div></div></div>`;
}
function shopView(){
const catalog=[...HAIRS.map(x=>({...x,group:'hair'})),...OUTFITS.map(x=>({...x,group:'outfit'})),...DECOR.map(x=>({...x,group:'decor'}))].filter(x=>x.cost>0);
return `${pageHead('The <span class="accent">reward shop</span>','Spend coins from BBB, cleaning and wellness check-ins—never real money.','HAIR · OUTFITS · CUTE DECOR')}
<div class="shop-header"><div><span class="smallcaps">NEW LITTLE TREASURES</span><h2>Something lovely to work toward ♡</h2><p>Wear what you unlock, and gradually decorate your apartment.</p></div><div class="shop-sparkle">🎀 ✦</div></div>
<div class="shop-grid">${catalog.map(x=>`<article class="card shop-item"><div class="shop-preview">${x.group==='hair'?(x.id==='heart'?'💗':'⭐'):x.group==='outfit'?({pink:'🎀',dress:'👗',pjs:'🌙'}[x.id]||'👚'):x.icon}</div><strong>${escapeHtml(x.name)}</strong><p>${escapeHtml(x.short||x.note||'A new little reward')}</p><div class="buyline"><span class="price">✦ ${x.cost} coins</span><button class="button tiny ${data.owned.includes(x.id)?'ghost':'rose'}" data-buy="${x.id}" ${data.owned.includes(x.id)||data.coins<x.cost?'disabled':''}>${data.owned.includes(x.id)?'Owned ♡':'Unlock'}</button></div></article>`).join('')}</div><p class="soft-note">Only purchased decor appears in the apartment. Furniture itself isn't clickable. Your character, navigation and Board are the interactive pieces.</p>`;
}
function storyView(){return `${pageHead('My little <span class="accent">story</span>','Little visual-novel scenes for each stage of your world.','THE NEXT CHAPTER')}
<div class="story-grid">${ROOMS.map(r=>`<button class="story-card" data-room="${r.id}"><span class="story-icon">${r.icon}</span><span><strong>${r.name}</strong><small>${roomUnlocked(r.id)?'Chapter available · Read':'Locked · '+escapeHtml(r.need)}</small></span><span class="story-right">${roomUnlocked(r.id)?'↗':'🔒'}</span></button>`).join('')}</div><p class="soft-note" style="margin-top:17px">Story unlocks celebrate beginnings, not perfection. The garden opens from your first cleaning check-in—even if you only completed part of a task.</p>`;}
function sidebar(){document.querySelectorAll('[data-tab]').forEach(btn=>{if(btn.closest('.nav')){btn.classList.toggle('active',btn.dataset.tab===data.activeTab);btn.setAttribute('aria-current',btn.dataset.tab===data.activeTab?'page':'false');}});
const groups=[['bbb','Career'],['home','Home'],['wellness','Wellness']];$('sideSkills').innerHTML=groups.map(([id,label])=>{const countThis=count(id);return `<div class="skill-row"><span>${label}</span><b>Lv ${Math.floor(countThis/3)+1}</b><div class="progress-track"><i class="progress-fill" style="width:${((countThis%3)/3)*100}%"></i></div></div>`;}).join('');}
function render(){
const pages={today:todayView,board:boardView,areas:()=>originalTabPreview('Areas'),rhythms:()=>originalTabPreview('Rhythms'),agents:()=>originalTabPreview('Agents'),world:worldView,shop:shopView,closet:closetView,story:storyView};
$('app').innerHTML=(pages[data.activeTab]||worldView)();$('coins').textContent=data.coins;const srcEl=$('sourceStatus');if(srcEl)srcEl.textContent=data.source==='import'?'local Board snapshot loaded':'demo tasks only';
$('crumb').textContent=({today:'TODAY',board:'BOARD',areas:'AREAS',rhythms:'RHYTHMS',agents:'AGENTS',world:'MY WORLD',shop:'SHOP',closet:'WARDROBE',story:'MY STORY'})[data.activeTab];
sidebar();
}
function showDialog(html,focusFirst=true){overlay=html;$('overlay').hidden=false;$('overlay').innerHTML=`<div class="dialogue" role="dialog" aria-modal="true" aria-label="${escapeHtml(html.title)}"><button class="text-button" style="float:right" data-close>✕ Close</button>${html.body}</div>`;if(focusFirst){const b=$('overlay').querySelector('button');b?.focus();}}
function closeDialog(){if(activeStoryListener){document.removeEventListener('click',activeStoryListener,true);activeStoryListener=null;}if(activeTimerListener){document.removeEventListener('click',activeTimerListener,true);activeTimerListener=null;}if(timer){clearInterval(timer.interval);timer=null;}$('overlay').hidden=true;$('overlay').innerHTML='';overlay=null;}
function roomScene(id){const r=ROOMS.find(r=>r.id===id);if(!r)return;if(!roomUnlocked(id)){notify('🔒 '+r.need+' — the room stays locked until your real-life quest check-in.');return;}let step=0;
const renderScene=()=>showDialog({title:r.name,body:`<p class="dialogue-meta">❀ A LITTLE STORY ❀</p><div class="art">${r.icon}</div><h2>${escapeHtml(r.name)}</h2><p>${escapeHtml(STORIES[id][step])}</p><button class="button primary round" id="storyContinue">${step===0?'Continue the story ♡':'Back to my world'}</button>`});
renderScene();function onStory(e){if(e.target.id!=='storyContinue')return;e.stopPropagation();if(step===0){step=1;renderScene();}else{closeDialog();document.removeEventListener('click',onStory,true);}}activeStoryListener=onStory;document.addEventListener('click',onStory,true);
}
function checkinMenu(task){if(!task)return;if(task.done){notify('That task is already marked done on your Board. ♡');return;}if(alreadyToday(task.id)){notify('You checked in on this quest today already ♡');return;}if(completedToday()>=3){notify('Today’s coin budget is full, but you can still do your task.');return;}
showDialog({title:'Quest check-in',body:`<p class="dialogue-meta">WELCOME BACK ♡</p><div class="art">🌸</div><h2>How did it go?</h2><p>${escapeHtml(task.title)}</p><div class="timer-buttons"><button class="button primary" data-claim="done" data-id="${task.id}">I did it! · +20</button><button class="button rose" data-claim="some" data-id="${task.id}">I did some · +10</button><button class="button" data-claim="skip" data-id="${task.id}">Not today · 0</button></div><p style="font-size:11px;margin-top:16px">No lost coins. No broken streaks. You're welcome back anytime.</p>`});
}
function claim(id,result){let t=getTask(id);if(!t||t.done||alreadyToday(id)){closeDialog();return;}if(result==='skip'){closeDialog();notify('No penalty. You can try another day ♡');return;}if(completedToday()>=3){closeDialog();notify('You have reached your gentle coin cap for today.');return;}const before=ROOMS.filter(r=>roomUnlocked(r.id)).map(x=>x.id);
const awarded=result==='done'?20:10;data.coins+=awarded;data.checkins.push({id,kind:t.kind,day:today(),result});data.celebrateAt=Date.now();if(result==='done'){t.done=true;t.status='done';}const after=ROOMS.filter(r=>roomUnlocked(r.id)).find(x=>!before.includes(x.id));saveRender();closeDialog();notify(`✦ +${awarded} coins! ${after?'You unlocked '+after.name+'!':'You showed up. That counts.'}`);if(after)setTimeout(()=>roomScene(after.id),450);
}
function addTask(){const input=$('newQuest');if(!input||!input.value.trim())return;let text=input.value.trim().slice(0,110);const kind=data.category==='all'?'home':data.category;const newtask={id:'local'+Date.now().toString(36),title:text,kind,step:'Start with the smallest reasonable step.',minutes:kind==='bbb'?25:10,done:false};data.tasks.unshift(newtask);selectedTask=newtask.id;saveRender();notify('New quest added to the local preview.');}
function buy(id){const item=[...HAIRS,...OUTFITS,...DECOR].find(x=>x.id===id);if(!item||data.owned.includes(id)||data.coins<item.cost)return;data.coins-=item.cost;data.owned.push(id);if(HAIRS.some(l=>l.id===id))data.hair=id;if(OUTFITS.some(l=>l.id===id))data.outfit=id;saveRender();notify(`Unlocked ${item.name}! 🌷`);}
function startTimer(task){if(!task)return;let total=(task.kind==='bbb'?25:10)*60;let focus=total,breakSec=task.kind==='bbb'?5*60:2*60,phase='focus',left=total,playing=false,finishAt=0;
function html(){let label=phase==='focus'?'FOCUS TIME':'TIME FOR A REAL BREAK';return {title:'Focus Room',body:`<p class="dialogue-meta">${label}</p><h2>${escapeHtml(task.title)}</h2><div class="timer-display" id="clock">${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}</div><p class="timer-label" id="timerPhase">${phase==='focus'?'One small step. The break is already part of the plan.':'Rest is not a prize you need to earn.'}</p><div class="timer-progress"><i id="clockBar" style="width:${(1-left/(phase==='focus'?total:breakSec))*100}%"></i></div><div class="timer-buttons"><button class="button primary" id="clockStart">${playing?'Pause':'Start / resume'}</button><button class="button" id="clockBreak">${phase==='focus'?'Take a break':'Return to focus'}</button><button class="button rose" id="clockDone">Check in now ♡</button></div>`};}
function renderClock(){showDialog(html());}
renderClock();function tick(){if(!playing)return;left=Math.max(0,Math.ceil((finishAt-Date.now())/1000));let display=$('clock');if(display)display.textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;let bar=$('clockBar');if(bar)bar.style.width=`${Math.min(100,100*(1-left/(phase==='focus'?total:breakSec)))}%`;if(left<=0){phase=phase==='focus'?'break':'focus';left=phase==='focus'?total:breakSec;playing=false;clearInterval(timer.interval);timer.interval=null;renderClock();notify(phase==='break'?'Focus complete! Your break starts now.':'Break complete! Return when you are ready.');}}
timer={interval:setInterval(tick,250)};function onTimer(e){const id=e.target?.id;if(!['clockStart','clockBreak','clockDone'].includes(id)||!timer)return;e.stopPropagation();if(id==='clockStart'){playing=!playing;if(playing)finishAt=Date.now()+left*1000;renderClock();}if(id==='clockBreak'){phase=phase==='focus'?'break':'focus';left=phase==='focus'?total:breakSec;playing=false;renderClock();}if(id==='clockDone'){document.removeEventListener('click',onTimer,true);closeDialog();checkinMenu(task);}}
activeTimerListener=onTimer;document.addEventListener('click',onTimer,true);
}
function characterTalk(){
const characterMood=mood();
const lead=data.mode==='low'?'Hey. We can keep things soft today.':data.mode==='charged'?'Look at this energy! Want an adventure?':'Hi! We can make progress without going too hard.';
showDialog({title:'A little chat with computer-you',body:`<p class="dialogue-meta">${characterMood.icon} ${escapeHtml(characterMood.label.toUpperCase())}</p><div class="art">♡</div><h2>Hey, it's me!</h2><p>${escapeHtml(lead)}</p><div class="timer-buttons"><button class="button rose" data-open-closet>Dress me up 🎀</button><button class="button primary" data-tab="board">Let's do a Board task</button><button class="button" data-close>Just saying hi ♡</button></div>`});
}
function importBoard(file){if(!file)return;
const reader=new FileReader();reader.onload=()=>{try{
const obj=JSON.parse(String(reader.result||'{}'));
if(!obj||!Array.isArray(obj.tasks)||obj.tasks.length>3000)throw new Error('Not a valid Command Center task export');
const mapped=obj.tasks.filter(t=>t&&typeof t.title==='string').slice(0,1000).map((t,i)=>{
const area=String(t.area||'').toLowerCase();const name=t.title.toLowerCase();
const kind=area==='home'||/laundry|declutter|clean(?:ing)?|dishes|tidy|room reset/.test(name)?'home':area==='wellness'||/swim|exercise|walk|rest|stretch|meditat|health/.test(name)?'wellness':'bbb';
return {id:String(t.id||'import'+i),title:t.title.slice(0,180),kind,step:String(t.firstStep||'Choose the first practical step.').slice(0,240),minutes:kind==='bbb'?25:10,done:t.status==='done',status:t.status||'someday'};
});
if(!mapped.length)throw new Error('The file contains no tasks');
data.tasks=mapped;data.source='import';data.checkins=[];data.coins=0;data.owned=['fro','twists','cream','moss'];selectedTask=mapped.find(t=>!t.done)?.id||mapped[0].id;data.activeTab='board';saveRender();notify('Imported '+mapped.length+' Board tasks locally. Your live Board was not changed.');
}catch(err){notify('Could not import: '+(err.message||'invalid file'));}};
reader.onerror=()=>notify('Could not read the file.');reader.readAsText(file);
}
function clickHandler(e){let b=e.target.closest('button');if(!b)return;
if(b.hasAttribute('data-close')){closeDialog();return;}
if(b.dataset.tab){setTab(b.dataset.tab);return;}
if(b.dataset.energy){data.mode=b.dataset.energy;saveRender();return;}
if(b.hasAttribute('data-next-note')){data.note=(data.note+1)%notes.length;saveRender();return;}
if(b.dataset.category){data.category=b.dataset.category;saveRender();return;}
if(b.hasAttribute('data-add-task')){addTask();return;}
if(b.dataset.openTask){selectedTask=b.dataset.openTask;setTab('board');return;}
if(b.dataset.checkinMenu){checkinMenu(getTask(b.dataset.checkinMenu));return;}
if(b.dataset.claim){claim(b.dataset.id,b.dataset.claim);return;}
if(b.dataset.timer){startTimer(getTask(b.dataset.timer));return;}
if(b.dataset.room){if(roomUnlocked(b.dataset.room)){data.room=b.dataset.room;saveRender();roomScene(b.dataset.room);}else notify('🔒 '+(ROOMS.find(r=>r.id===b.dataset.room)?.need||'Locked'));return;}


if(b.dataset.equipPart){const val=b.dataset.equipValue;const list=b.dataset.equipPart==='hair'?HAIRS:OUTFITS;if(!list.some(x=>x.id===val))return;if(!data.owned.includes(val)){setTab('shop');notify('That look is waiting in the reward shop ♡');return;}data[b.dataset.equipPart]=val;saveRender();return;}
if(b.dataset.buy){buy(b.dataset.buy);return;}
if(b.hasAttribute('data-chat')){characterTalk();return;}
if(b.hasAttribute('data-open-closet')){closeDialog();setTab('closet');return;}
if(b.hasAttribute('data-demo-board')){data.tasks=INITIAL_TASKS.map(x=>({...x,status:'now'}));data.source='demo';data.checkins=[];data.coins=0;selectedTask='t3';saveRender();notify('Using sample Board tasks again.');return;}
if(b.id==='resetDemo'){if(confirm('Reset the LOCAL preview? This only clears the local sample/imported copy, coins and unlocks.')){data=fresh();selectedTask='t3';closeDialog();saveRender();notify('Demo reset. Your live Command Center was not changed.');}return;}
}
document.addEventListener('click',clickHandler);
document.addEventListener('change',e=>{if(e.target?.id==='boardImport')importBoard(e.target.files?.[0]);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay)closeDialog();if(e.key==='Enter'&&e.target.id==='newQuest')addTask();});
$('overlay').addEventListener('click',e=>{if(e.target===$('overlay'))closeDialog();});
render();
let walkingFrame=0;setInterval(()=>{const sprite=document.getElementById('pixelYou');if(!sprite)return;walkingFrame=(walkingFrame+1)%8;sprite.src='assets/pixel-walk-'+walkingFrame+'.webp';},280);
window.__BloomPreview={state:()=>structuredClone(data),reset:()=>{data=fresh();saveRender();},view:tab=>setTab(tab),importBoard:obj=>{const f=new Blob([JSON.stringify(obj)],{type:'application/json'});importBoard(f);}};
})();