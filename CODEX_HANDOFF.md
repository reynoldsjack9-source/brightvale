# Brightvale creator handoff (rebuilt November 18, 2026)

## Current implementation

Jack rejected the assembled v4 characters during the real-game comparison: their proportions and faces did not match the normal heroes. The creator now uses the handoff's alternative of complete compact characters with color customization.

- The complete `art/<class>-compact-*.png` animations are the source for both normal and created heroes. These PNGs are unchanged.
- `CREATOR` in `brightvale.html` provides six finished color looks per class (Classic, Sunbeam, Moonlit, Briar, Rose, Storm), plus independent skin, hair, eye and outfit palettes.
- Classic uses the original sprites without recoloring. Other looks recolor complete sheets; they never attach heads, move limbs, crop necks, or change geometry.
- The former gender, face, hairstyle and accessory selectors are retired. The three class designs retain their authored faces, hair, headgear and silhouettes. Distinct new designs need complete animation sets, rather than reintroducing the rejected head/body assembly.
- Preview animations, class cards, and gameplay use the same sprite geometry, scale, pose timing and original animations. Preview lets players inspect idle, run, attack, cast, jump and climb before creating.
- The old `art/creator/body-*`, head and hair parts remain in the repository for history; the game no longer loads them. `creator-preview.html` forwards to the real in-game creator.

## Saves and rendering

The localStorage key is still `brightvale.save.v1`. Names, progress and save slots are unchanged. New looks store `compactVersion: 2` and palette indices. Older looks retain their fields and map their existing skin/hair/eye color indices to the new palettes at render time. Old modular face/hair shape selections no longer affect appearance.

Color masks are cached once per original sheet. Recolored full sheets use a bounded cache. Ink, low-saturation steel, white areas, original alpha and coordinates are preserved. Skin includes exposed hands; eye color is restricted to the face and near eye whites so staff orbs stay gold. All poses use the original `drawHeroSprite` path, including double jumps.

Keep the SIMULATION block unchanged. Change client rendering/UI only. Original content only; do not add gitignored `craftpix/` or `vroid/` assets. Keep the compact source PNGs unchanged unless Jack specifically requests it.

## Required checks before pushing

1. Run `node tools/serve.cjs`; use `http://localhost:5180/` and New character. `/#creator` opens it directly.
2. `/#posecheck` shows every frame of idle/walk/run/attack/cast/jump/climb for all three classes, with the original beside a recolored character at identical world scale. Walk uses the original run sheet, matching normal gameplay. Reload after changing the hash. Optional `?class=warrior#posecheck`, `?class=mage#posecheck`, or `?class=archer#posecheck` isolates a class.
3. `/#lookcheck` shows every finished palette beside the unmodified original for all classes.
4. Try the three classes, six finished looks, all color controls and all preview animations. Check desktop and stacked narrow layouts.
5. Create a hero, run, jump/double jump, attack, use A/S/D/F, and climb a rope. Reload and continue to verify saved appearance and progress.
6. Optional `/#playcheck` exposes bounded QA buttons that drive the normal `press`/`release` input path and show live position/movement state. Seek rope right runs to the next rope and climbs briefly. It changes no simulation rules and is absent in ordinary play.
7. Run `node tools/check-creator.cjs` (parsing and index synchronization). `--baseline` also compares the simulation to HEAD before committing.
8. Save `art/creator/check-posecheck.png`, `check-creator.png`, `check-ingame.png`; `check-looks.png` and `check-climb.png` provide additional evidence. Regenerate index.html from brightvale.html in the same doctype/head/body shell.

## Verification for this rebuild

- Inspected all source animation frames for all three classes beside recolored complete sprites.
- Exercised all six finished looks, every color control, all preview animations and all three creator classes in the in-app browser.
- Created Vanguard Rowan with Storm colors, tested real running, attack and A/S/D/F (using an MP potion when needed), rope attachment, climbing and a directional rope jump; reloaded and continued with the saved appearance/progress.
- Checked desktop and narrow stacked creator layouts. No browser console errors in the final production game check.
- JavaScript parsing, index synchronization, unchanged simulation comparison and unchanged compact source assets verified before commit.

Commit clearly and push main. Claude can pull, review in the real game, and publish.
