# Brightvale character creator handoff

## Current implementation — revision 3

The creator uses complete compact animation sheets. Features has **Male / Female** with separate sets: male faces **Bright / Bold / Gentle** and hair **Curly crop / Side-swept bob / Tied back**; female faces **Freckled / Angular / Heart** and hair **Feathered pixie / Twin buns / Crown braid**. All nine face/hair combinations work for both genders on Vanguard, Arcanist and Ranger. Original reset restores the canonical class hero and gender; palettes remain independent of shape choices.

This revision addresses the reported defects:

- Original and customized heroes use offline skin, hair, iris and outfit masks. Runtime no longer guesses regions from similar colors. Eye color changes visible iris paint. Ears, lips, eyebrows, pupils, whites and ink stay outside the hair mask.
- Chin placement uses the actual outline. Original face/head pixels are retired separately from neck, collar, shoulders and equipment.
- Body paint and foreground equipment are tracked separately. The Ranger retains source bow, string, hand and quiver details, including raised bow tips. Vanguard blade and grip guards preserve the source sword silhouette. Arcanist collars, shoulders, hands and staff retain their source layers.
- The distinct female atlas, `heads-female-distinct-source.png`, was produced with built-in ImageGen using the male atlas for style/alignment, then refined with freckles, a beauty mark and distinct face identities. Generation notes and prompts are in `art/creator/compact-options/README.md`.

The shipped assets are `art/creator/compact-options/v3/`: **324 complete sheets / 1,188 frames**, their semantic masks, masks for the original compact sheets and a versioned manifest. The unversioned derived sheets are historical and unused. Its manifest still supplies original pose landmarks to the offline baker.

Original `art/<class>-compact-*.png` files, gameplay simulation, frame timing, root/feet anchors and body scale remain unchanged. Do not introduce the rejected modular body/limb rendering again.

## Saves and loading

Save key remains `brightvale.save.v1`. Names, progress and slots are unchanged. New appearances use `compactVersion: 3` and `gender`, `hairStyle`, `faceStyle`, plus the existing palette indices. Version 2 colors and feature choices are preserved. Old modular color indices migrate as before; a saved gender that differs from the canonical class uses a new complete face/hair pair so the visible gender matches the saved choice. Old modular shapes remain retired.

Images and masks for the selected complete animation set warm before creation. The runtime image-record cache and recolored-sheet cache are bounded. Preview, class cards, proofs and gameplay all use the same full-sheet renderer.

## Rebuild and checks

1. `npm ci`
2. `npm run build:creator` builds all assets. `--class=vanguard` builds one class. `--sample` and `--heads-only` are iteration modes; never publish incomplete assets. `--masks-only` is for annotation-only edits against otherwise unchanged finished sheets.
3. `npm run check:creator` parses inline scripts, verifies the exact index wrapper and exercises appearance migration. `node tools/check-creator.cjs --baseline` also compares SIMULATION with HEAD.
4. `npm run check:options` checks all sheets/masks, all 18 variants per class/pose, iris coverage, ear/brow/mouth isolation, protected body pixels, standing neck/shoulder and bow/grip areas, Vanguard grip paint and connected Ranger bow material across every front pose.

The bow test allows the necessary blend at nearly opaque source edges when a new head is behind the original foreground weapon. Fully opaque protected body pixels remain exact.

## Real-game checks

Run `node tools/serve.cjs`, then use `http://localhost:5180/` in the **in-app browser**. Do not inspect personal apps or email.

- `/#creator`: all faces, hairstyles, genders, classes, palette independence, Original reset, animations and desktop/narrow layouts.
- `/#featurecheck` or `?gender=female#featurecheck`: nine combinations on each class beside the original.
- `?gender=female&class=mage&hair=2&face=2#posecheck`: every frame of each pose. Class values are warrior/mage/archer. Walk reuses the compact run sheet. Reload after changing hash/query.
- `/#colorcheck`: tests the actual recolor renderer for 57 original/custom standing looks. Requires visible blue iris changes and no changes outside the selected hair/iris mask.
- `/#playcheck`: real press/release QA buttons, using game time so input is not lost when the browser is throttled. Prints saved appearance and observed attacks, skills, climbing and double jump. No simulation shortcuts.

Create a character, run, jump/double jump, attack, use A/S/D/F, climb and reload/continue. Save fresh real-game creator, gameplay and pose screenshots when capture is working.

## Verification from this revision

- All 54 creator feature combinations selected through the actual UI; zero selection failures. Male/Female and Original reset checked across class changes.
- Actual runtime colorcheck: all 57 looks passed, visible iris changes and zero color-region leaks.
- All 324 sheets / 1,188 frames validated. Neck/shoulder checks pass, 493,776 opaque body pixels and 4,968 standing bow/grip pixels remain unchanged. The front-pose bow guard checks 85,014 source material pixels.
- Inspected offline standing comparisons and moving-pose sheets for all three styles/classes, including female Twin buns/Angular and male Tied back/Gentle.
- Continued female Arcanist **Mira** with the new Twin buns/Angular preset, Mint hair and Blue eyes. Reload restored name, gender, face, hair and palette. Normal gameplay recorded climbing, basic attack, double jump and A/S/D/F. The Ranger save **Juniper** also continued through the new renderer.
- Narrow creator checked at 390 × 844: document width and scroll width both 390; gender choices remain available. Viewport override reset afterward.
- Final creator browser logs had no errors. Source JavaScript parses, wrapper synchronized, save migrations pass, SIMULATION and original compact PNGs unchanged.

### Fresh real-game captures

Screenshot capture is now working with the in-app browser visible. Fresh creator, male/female feature matrices, gameplay, Ranger bow combat and rear-view climbing captures are saved under `art/creator/qa-v3/`. The canonical `art/creator/check-*.png` files have been refreshed from those real browser captures. All 18 pose captures include every row, including jumping and climbing; their minimum image height is 987 pixels.

The creator UI passed all 54 gender-specific combinations; the real shader passed all 57 original/custom standing looks. All 324 sheets / 1,188 frames, including the distinct female set, pass asset checks. Current asset counts include 119,668 iris pixels. Saved Mira and Juniper appearances continued normally. The original browser tab was left untouched; a separate updated creator preview is open.

Offline comparison `art/creator/v3-proof-options.png` is supplementary art evidence, clearly separate from game screenshots. Generation prompts are in `art/creator/compact-options/female-distinct-prompts.md`.

Commit clearly and push main as Jack requested. Do not use personal apps or email for this work.
