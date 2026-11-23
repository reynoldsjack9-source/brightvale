# Brightvale character creator handoff

## Current creator

Whole compact animation sheets, with three independent faces and hairstyles per gender:

| Gender | Faces | Hairstyles |
| --- | --- | --- |
| Male | Steady, Rugged, Keen | Close crop, Short side part, Short spikes |
| Female | Freckled, Angular, Heart | Feathered pixie, Twin buns, Crown braid |

Male art now uses shorter tapered silhouettes, stronger straight brows, smaller eyes without lashes, and angular jaws, with the original compact heroes' contour and cel-shading style. Source: `art/creator/compact-options/heads-male-masculine-source.png`. Built-in ImageGen prompt: `male-redesign-prompts.md` beside it. `heads-source.png` remains a historical style reference. Female head art stays in `heads-female-distinct-source.png`.

Custom heads meet a short, curved neck painted to match the compact originals. Class-specific shoulder contours keep the armour, robe and Ranger collar connected. The baker composites the outfit once and uses depth labels to put foreground equipment over the head. The same baked artwork appears in class cards, preview and gameplay.

Each female outfit has its own chest, waist and hip profile. The baker deforms the cleaned body and its color and depth labels together, with a gradual transition into the anchored arms, cuffs and grips. The Ranger custom cast release retains the bow limbs and shows the string above and below the forearm.

## Assets and invariants

`art/creator/compact-options/v3/` contains 324 complete sheets / 1,188 frames and offline semantic masks. Red-channel labels: 1 skin, 2 hair, 3 iris, 4 outfit, 255 preserved. Runtime never guesses mask regions. Male/female annotations are separate in `tools/creator-regions.json`. Ear, lip, brow and freckle paint stays outside the hair mask. Iris bounds follow each face.

Original `art/<class>-compact-*.png` files, SIMULATION, animation timing, root/feet anchors and body scale are unchanged. Female torso clothing is deliberately shaped; do not assert that its torso pixels match the original. Protected equipment and pixels outside the deformation remain checked. Never reintroduce runtime modular head/limb attachments.

Save key remains `brightvale.save.v1`. Appearance uses `compactVersion:3` with gender, face/hair indices and independent palette indices. Names, progress, slots and migration behavior are unchanged; previous male indices now select the redesigned alternatives.

## Build and verify

- `npm ci`; `npm run build:creator` builds everything. Target flags: `--class=vanguard`, `--pose=attack`, `--gender=male`. Partial builds must retain complete coverage. `--heads-only` / `--sample` are iteration modes only.
- `--masks-only` is only for annotation changes against otherwise unchanged geometry.
- `npm run check:options` checks all 324 sheets / 1,188 frames, irises, safe face regions, connected necks and arms in the standing sprites, the female torso differences, and preserved weapon paint. It also checks that the Ranger release string is visible on both sides of the forearm.
- `node tools/check-creator.cjs --baseline` checks syntax, index wrapper, save migration, distinct choices and SIMULATION against HEAD.

Run `node tools/serve.cjs`, then test `http://localhost:5180/` in the **in-app browser only**. Do not inspect personal apps or email.

- `/#creator`: choose face/hair, switch to Class, inspect and select all classes, both genders. Check palettes, reset and narrow layout.
- `/#featurecheck` and `?gender=female#featurecheck`: all nine combinations per class alongside the original.
- `?gender=male&class=mage&hair=2&face=2#posecheck`: every frame of idle/walk/run/attack/cast/jump/climb. Classes: warrior/mage/archer. Reload after query/hash changes.
- `/#colorcheck`: actual shader for 57 original/custom looks; visible blue irises and no out-of-mask color changes.
- `/#playcheck`: normal press/release input checks with live state/actions. Run, double jump, basic attack, A/S/D/F, climb, reload/continue, and save fresh screenshots.

Current screenshots, enlarged sprite comparisons and check results are in `art/creator/qa-overhaul/`. The earlier passes are in `qa-redesign/` and `qa-v3/`.

Commit and push main as Jack requested.
