# Brightvale character creator handoff

## Current implementation (November 18, 2026)

The creator uses the approved compact heroes and now has three NEW faces and three NEW hairstyles. The default Features tab lets players mix:

- Faces: **Bright, Bold, Gentle**.
- Hairstyles: **Curly crop, Side-swept bob, Tied back**.
- All **nine combinations** are available on **Vanguard, Arcanist and Ranger**.
- **Use original face and hair** restores the original class head, hair and headgear. Selecting a new face starts with Curly crop; selecting new hair starts with Bright, after which both choices are independent.
- Look still offers Classic, Sunbeam, Moonlit, Briar, Rose and Storm color presets. Colors retains independent skin, hair, eye and outfit palettes. Choosing a palette keeps the chosen face and hairstyle.

The new art was generated with built-in ImageGen against our unchanged compact Vanguard. The source atlas, full prompts and reproduction notes are in `art/creator/compact-options/README.md`. Every combination is baked offline into complete animation sheets: **162 PNG sheets / 594 frames**, plus exact color masks. Runtime never attaches heads or animates detached limbs. The original `art/<class>-compact-*.png` files remain unchanged; older rejected modular body/head/hair assets remain unused.

All source pose timing, root/feet anchors, body proportions and gameplay rules remain intact. New drawings have matching rear views for climbing. Foreground hands and weapons are retained above the new drawings, with staff orbs protected explicitly. Color masks preserve ink, eye whites and the original equipment. New hair colors affect the authored hair region, rather than guessing at similarly colored leather/gloves.

## Saves and loading

The key remains `brightvale.save.v1`. Names, progress and save slots are unchanged. New looks still use `compactVersion: 2`, with `hairStyle` and `faceStyle` indices: 0/0 is the original hero, 1..3 selects the new options. Existing v2 saves with no new fields use 0/0 automatically. Older modular saves keep their fields and map skin/hair/eye colors to the palette system; those old modular face/hair shapes remain retired. Gender and separate accessory controls remain retired.

The creator warms the complete selected animation set and disables creation until its images and color masks are ready. Saved looks warm during page load. The preview, class cards, proofs and gameplay share `drawHeroSprite` and the same full sheets. A bounded color cache avoids per-frame pixel work.

## Build and validation

The game is still static HTML. npm is needed only to rebuild and validate art:

1. `npm ci`
2. `npm run build:creator` to rebuild all options. `node tools/build-creator-options.cjs --class=vanguard` rebuilds one class. `--sample` is for art iteration only; never publish sample-only assets.
3. `npm run check:creator`: parse inline JS and verify `index.html` is the synchronized doctype/head/body wrapper around `brightvale.html`.
4. `npm run check:options`: verify all complete sheets, frame counts, masks, protected opaque body pixels and unclipped new heads. `node tools/check-creator.cjs --baseline` also compares SIMULATION to HEAD before committing.

Keep SIMULATION unchanged. Do not add third-party licensed content, `craftpix/`, `vroid/`, or `node_modules/`. Keep the approved compact PNGs unchanged unless Jack explicitly requests it.

## Real-game checks before every push

Run `node tools/serve.cjs` and use `http://localhost:5180/` in the in-app browser.

- `/#creator`: real creator, opening on Features. Test all three faces and hairstyles on all three classes, color combinations, Original reset, and preview animations. Check desktop and narrow stacked layouts.
- `/#featurecheck`: all nine combinations on all three classes beside each original.
- `?class=warrior&hair=2&face=3#posecheck`: every frame of every pose for that combination. Class is optional; omit to show all three. Values are warrior/mage/archer and 1..3 for hair/face. Walk reuses the normal compact run sheet. Reload after changing the hash.
- `/#playcheck`: optional bounded QA buttons drive normal press/release inputs, with live position and movement state. Seek rope right approaches and climbs briefly; Jump supplies a direction when jumping from a rope. No simulation shortcuts are used.
- Create a character, run, jump/double jump, attack, use A/S/D/F and climb. Reload and continue to check name, progress, face and hair persistence.

Save `art/creator/check-creator.png`, `check-ingame.png`, `check-posecheck.png`; additional proofs are `check-features.png`, `check-climb.png`, `check-combat.png`. The pose proof is a collage of actual in-game proof screenshots: columns are Curly crop/Bright, Bob/Bold, Tied back/Gentle; rows are Vanguard, Arcanist, Ranger. Each includes the unmodified compact reference at the same world scale.

## Completed verification for the new options

- Exercised all nine combinations in the real creator on all three classes.
- Inspected all 27 standing looks beside the original compact heroes, and every animation frame for each of the three hairstyles/faces on each class using the game's renderer.
- Validated all 162 sheets / 594 frames and their semantic masks, including 270,666 protected opaque body pixels unchanged and no new head pixels clipped against the top frame boundary.
- Created Ranger Juniper with Side-swept bob and Bold face. Tested running, rope attachment/climbing, directional rope jump, double jump, attack and A/S/D/F in the real game. Reached level 2, changed class, reloaded and continued with the same name, progress, face and hairstyle.
- Checked recoloring on the new art, desktop and narrow layouts, and final console logs (no errors).
- Source JS parses, index wrapper synchronized, simulation block and approved compact source PNGs unchanged.

Commit clearly and push main. Claude can pull, review in the real game, and publish.
