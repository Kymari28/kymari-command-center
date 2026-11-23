# My World — Bloom & Build local design review (V2)

A working HTML/CSS/JS website preview, separate from the public Command Center. No deployment or GitHub merge was performed.

## Run locally in Chrome
1. Unzip `bloom-build-v2-local-preview.zip`.
2. Open Terminal in `bloom-build-v2-local` (on Mac, type `cd ` and drag the folder into Terminal).
3. Run `python3 -m http.server 8765` (or `py -m http.server 8765` on Windows).
4. Visit **http://localhost:8765/** in Chrome. Keep Terminal running. Ctrl+C stops it.

If you don't want a Terminal: download `bloom-build-v2-preview.html` and open it in Chrome. The single file embeds the character art and CSS/JS, but a real localhost provides more consistent browser storage.

## What's different in V2
- Original Command Center navigation preserved: Today, Board, Areas, Rhythms, Agents; only My World and Shop were added to the main navigation.
- Larger apartment scene with temporary warm, empty-room walls/floors and starter furnishings. Furniture isn't clickable.
- Mini pixel Alexia character (from your supplied asset) is touch/clickable; it opens a small dialogue with links to your wardrobe and Board. Idle walking frames play in place; full room movement is for a later version.
- PSD-derived medium-tone illustrated character with **separate** hairstyles and clothes: starter fro/twists and basic clothes, with heart/star bun, floral/dressier clothes and golden pajamas as shop unlocks.
- Mood display follows Low/Steady/Charged energy check-in, plus a short proud celebration after progress; it never gets sad simply because tasks remain undone. True facial-layer variants are still being polished.
- Game quests use the **Board**, not a second quest list. You can import a snapshot from your current Command Center backup in the Board tab.
- Garden unlocks after a partial or completed cleaning check-in; coin, shop, garden unlock, and levels all work in the private preview.
- No purple palette.

## Test with your actual Board tasks
1. In your current Command Center, use its **Download backup** function to save a JSON backup, if available.
2. In this preview, open **Board** and click **Import my Board backup**.
3. Choose the downloaded JSON. It accepts the current Command Center format with `tasks` and `meta` fields.
4. Your imported task titles and first steps display in the Board, and the game derives BBB/Home/Wellness categories. This is a **local copy only**: check-ins in this preview do not sync back to your live Board.
5. To return to sample data, use **Use sample tasks**, or **Reset demo** to reset all preview progress.

## Design/review limitations
- Areas, Rhythms, and Agents are **unchanged in the actual repository**. Their standalone local preview screens are placeholders because this is not yet running the complete original app.
- The actual GitHub game draft PR does not yet include these V2 review changes. We will integrate the approved design after you review it.
- The apartment art is a temporary CSS base; this isn't the final external CC0 room tileset. We found Vonk's Cozy Room Builder and Cozy Interiors Lite as possible free construction sources.
- The PSD-derived hairs/outfits are individually composable but still need artistic polish and additional face-expression details.
- The original PSD source files are not included. User-supplied editable assets and derived in-game art should not be distributed as standalone asset packs.
- This private build saves demo progress in the browser when storage is available. No external requests or account sign-in.

## Tests performed
- JavaScript syntax check with Node.
- In-browser tests using Chromium in an isolated about:blank document: World, character interaction, Wardrobe, Shop, and Board on desktop/mobile viewports.
- In-browser simulated import of a Command Center backup, partial Home check-in, garden unlock, hair/outfit independence, and automatic mood feedback.
- Browser navigation to localhost is restricted inside the assistant environment; the local server itself returned 200 OK. Please verify appearance in your own Chrome before any launch.