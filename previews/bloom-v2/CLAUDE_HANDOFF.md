# CLAUDE HANDOFF — Kymari Command Center → Bloom & Build

**Date:** Nov 22, 2026 PT / Nov 23 UTC
**Status:** Work in progress, experimental. DO NOT MERGE OR DEPLOY without explicit user approval.
**Repo:** https://github.com/Kymari28/kymari-command-center
**Live baseline:** https://kymari28.github.io/kymari-command-center/#today

## Your last context vs. what's happened
You last knew the user was working on the **basic Command Center**. It is still the system of record. Since then, ChatGPT and the user designed a **Bloom & Build** optional mini life-sim layer to provide motivating rewards for BBB (career/work), cleaning/home, and wellness; this does not replace the task Board. The user wants an affordable and small MVP *within the week*, to test **locally and visually first**, and strictly requires no merge until they approve. There have been several iterations; **do not confuse the GitHub draft v1 with the newer standalone v2 local prototype**.

## Repository state / branches (verify again on arrival)
- `main`: live baseline; do not modify.
- **PR #6:** https://github.com/Kymari28/kymari-command-center/pull/6 — `codex/focus-room-pomodoro` → `main`, **draft, unmerged**. Pomodoro focus/break cycles (10/2, 25/5, 45/10), optional café/library leaving plan, keeps five-minute calm, work-time tracking. Early Low-mode note/CSS copy is also on branch; broader energy changes unfinished.
- **PR #7:** https://github.com/Kymari28/kymari-command-center/pull/7 — `codex/bloom-build-v1` → `codex/focus-room-pomodoro`, **draft, unmerged**. Vanilla-JS optional Bloom tab, game script and CSS; uses existing board tasks plus added Home and Wellness area, coin store, quest check-ins, room unlocks, wardrobe scaffold. It is a preliminary implementation, **not** latest approved UI.
- **NEW:** `codex/bloom-v2-local-handoff` from `codex/bloom-build-v1`. Directory `previews/bloom-v2/` contains **source-only** local V2 preview: `index.html`, `app.js`, `styles.css`, `test_v2.cjs`, `README.md`. This is an archival handoff, not an integration or a deployment. Some assets are intentionally omitted from GitHub (see below). Existing main/PRs should be unchanged. The handoff documentation is also in this branch.

## Latest runnable LOCAL V2 prototype (important)
Download supplied by ChatGPT: `bloom-build-v2-local-preview.zip` (contains full working assets) and standalone `bloom-build-v2-preview.html` (all assets in one HTML) from the current conversation. The ZIP is the easiest for Claude to use. After unzipping:

```bash
cd bloom-build-v2-local
python3 -m http.server 8765
# Chrome → http://localhost:8765
# run: node test_v2.cjs
```

Do not assume that `previews/bloom-v2/` in GitHub is fully visual: character artwork and original asset packs were **not** published. Without the ZIP's `assets/` folder, its HTML is incomplete. These are not deployment-ready files.

### What the V2 local review prototype can do
- Preserves menu labels Today, Board, Areas, Rhythms, Agents, plus **only two proposed new tabs:** My World and Shop. Existing Areas/Rhythms/Agents are *placeholders in standalone V2 only*, not permission to overwrite actual app.
- Bigger warm apartment scene (temporary CSS walls/floors/furniture), pixel Alexia in-world sprite, character click → chat, wardrobe, start Board task.
- Separate layered dress-up hair and outfits, shop, coins, level progression, room unlocks, and visual-novel snippets.
- Mood follows user energy check-ins (Low/Steady/Charged) and temporary proud moments after task completion; avoid shame on missed tasks.
- Quests derive from **Board**, not a second checklist. V2 can import a Command Center JSON backup as LOCAL copy. Its change events never sync back.
- Cleaning check-in unlocks Garden; wellness unlocks Bedroom; later Dressing Room and Story Café unlocks.
- Starter space plus four unlockable spaces; game currently includes more click targets than user ultimately wants (see design feedback).
- Local UI tested in isolated Chromium render and Node test; **not fully integrated with main app, nor production ready**.

## Latest user requirements and feedback (higher priority than older mockups)
**Purpose and emotional design**
- Both BBB goals and home cleaning must matter; career work has external accountability, cleaning does not. User likes motivating games + check-in afterward; stressful calendar appointments are ignored. Cozy rewards and optional positive pressure, no shame or punitive streaks.
- Energy modes Low, Steady/Middle, Charged. Low: reduced work and encouraging note ('I'm proud of you'). Middle: *pre-burnout* mix of overdoing, avoidance, exhaustion; prioritize real deadlines/income, basics, meaningful progress, and recovery. Pomodoro includes breaks. Café work sessions can motivate without scheduled human body doubles.
- Existing Board remains authoritative. No separate mission dataset once integrated. Prioritization considers paid work, home, health, and rest; user only wants two NEW main tabs: **My World** and **Shop**. Wardrobe is accessed through character interaction, not another main tab.

**Game visuals / interactions**
- User likes cozy storybook × pixel nook, leafy plants, cute collectables, bright **pink**, warm cream and green, **NO PURPLE**. Loves Smiski, Nyota-like style, Keroppi/Badtz-Maru/Hangyodon, Ghibli, Rilakkuma as *vibe references*; do not copy copyrighted franchise art into production.
- Room should dominate My World screen, character should be IN room, moving later. Replace 'Tap me' label with a **chat bubble**. Character is clickable for useful dialogue, wardrobe, task actions. **Do not make furniture arbitrarily clickable**: only interactions that assist work or navigate. User likes Vonk's CC0 room-builder with pets; look into importing CC0 walls/floors/furniture/pets and a more truly EMPTY apartment base that gets decorated over time. Pets are desirable, optional to maintain week-one scope.
- Original starter room living/desk nook; secret lush Garden unlocked by doing cleaning; Bedroom tied to wellness/exercise; Dressing Room tied to rewards; Café/Story Street tied to BBB. Room-by-room unlock/visual novel hub, 1 avatar, reward coins/shop, little story popups, post-quest check-ins.
- Dress-up should have **separate hairstyles and outfits**. Starter items very plain; beautiful colorful outfits/hairs earnable. **Only shoulder-length afro is free hairstyle. Medium box braids and two high rounded heart-puff buns are purchased/unlockable.** Braids must have proper scalp PARTS and real braid texture. Heart puffs based on user's photo reference: **two soft fluffy rounded high buns/puffs**, NOT a cartoon heart outline. Relaxed starters cream oversized tee or sage crewneck; dressy reward and very fluffy pink anime-inspired pajama set later. No purple.
- User has strongly rejected every procedurally drawn hair/outfit mockup: described them as scary/terrifying, poorly seated over shoulders, and inconsistent with cute earlier rich illustration. **DO NOT use or publish the rough hand-drawn overlays as final**. User explicitly directed: ***stop outfits/hair, go back to the original PSD and start by presenting MULTIPLE ACTUAL FACIAL EXPRESSIONS from it, for approval***. No site code changes for artwork until visual approval.
- User said **do not use image generation unless it can directly edit actual PSD**; work from real PSD layers. The earlier richer character concept sheet was merely a style reference; it was NOT a PSD-derived asset.

## Original character assets and licensing
- `Character Template.psd` (user uploaded, 1080×1300, 3 skin tones, 8 expressions + 6 extras, 5 arm poses) is chosen actual illustrated character base. User likes **middle skin tone, eyelashes and all expressions**. Creator license supplied by user: 'You may edit and modify; personal or commercial projects allowed; credits optional'. No explicit unrestricted redistribution of raw source PSD; keep original PSD/private layers OUT of public repo.
- Separate uploaded `Female Sprite 1.psd` (Fungii) was considered then REJECTED as main character: insufficient suitable skin shades/afro hair/outfits.
- User uploaded Alexia pixel sprite assets and source `.mdp` files plus PNG movement/portrait sprite sheets; can use in-world, subject to given Pop Shop Packs terms ('modify'; use in game; no repackaging as game asset). Do not publish raw sprite sheets as standalone downloads.
- The user provided a photograph `image(1).png` as hairstyle reference for two high puff buns (not the model identity). It is a styling reference only, not game art.
- Previous ChatGPT extracted character PSD layers into `/mnt/data/character_template_parts/` and `/mnt/data/face_psd_layers/`, produced rough layer previews `/mnt/data/bloom_approval_v2/`, and began a PSD expression extraction script `/mnt/data/build_face_expressions_psd.py`. That latest face-extraction attempt was NOT finished or approved; inspect before reuse.
- License of Vonk cozy room creator was described as CC0; verify the precise downloaded pack and attribution/redistribution terms before using. Cozy Interiors Lite may allow game use but prohibit raw redistribution. Do not mix inconsistent perspectives or commit third-party raws casually.

## Immediate next steps for Claude
1. **Pause game visual implementation**, focus on the *actual original PSD facial expressions* first. Open editable layer groups in `Character Template.psd`, identify expression switch layers, preserve exact middle skin-tone and eyelashes. Produce an **approval sheet with multiple distinct facial expressions from the original**, same head/proportions and no new hairstyle or clothing embellishments. Do NOT recreate facial expressions as generic SVG approximations. Show this to user, ask for approval.
2. Keep GitHub branches unmerged. If doing further work, create `codex/` branch and draft PR; do not deploy live. Avoid raw original PSD or character packs in the public repo.
3. Once approved, prioritize source-asset layering and actual good quality hair/outfit art; only then integrate into wardrobe. No falsely claiming mockups are 'finished'.
4. Integrate approved V2 UI with **original Command Center** (rather than replacing app with standalone demo) and original Supabase/auth/board/areas/rhythms/agents. Resolve PR #6 before/alongside PR #7 sequencing; test stored state and no double rewards.
5. Site must be viewable via **localhost live website** before launch; user specifically does not want only pictures. Keep original menu + My World and Shop, large room scene, chat bubble interaction, Board-sourced missions.
6. Refine accessible responsive UI, no purple, warm cream/greens and brighter pink unlocks, level meter, automatic (not manually chosen) character mood, reward logic and weekly cleaning check-in system.

## Known issues / cautions
- The V2 local prototype isn't the committed v1 script. GitHub source in `previews/bloom-v2/` is an archived reference, not a drop-in build. Copy all images from local ZIP `assets/` and review permission before releasing. The single-file preview includes embedded art and is private for local review.
- Some older code gives twists as a free hair: **obsolete**. Current decision is afro-only free, with braid/puff purchase. Some earlier outfits were awkward, old overlays rejected.
- Current v2 prototype uses 'Tap me' and has some furniture/exploration controls: **change to chat bubble and only useful interactions in the next approved UI iteration**.
- Real Board tasks can contain sensitive project content, so do not embed names, home circumstances, mental-health discussions, or personal family details in public source code or example dataset.
- Photos, PSD, and raw sourced assets are **not included in GitHub** for safety and licensing. Treat sample browser storage as local test state, not synced original user state.
- User wants to finish within the week: prioritize an MVP and visual quality, not walking systems, complex AI NPCs, multiplayer or 100 assets.

## Project status checkpoints
- GitHub PRs #6 and #7 were confirmed draft/unmerged when this handoff was prepared.
- `codex/bloom-v2-local-handoff` holds five source files from V2 (no assets) and this handoff. A preview ZIP and standalone HTML are provided in the ChatGPT conversation artifacts.
- No files merged into `main`, no deployment performed, user must approve after seeing real local preview.

**Instruction to Claude:** Resume from the basic Command Center, read repo README and branch diffs, respect user's latest PSD-first decision, don't assume past mockups were approved, and never merge without approval.