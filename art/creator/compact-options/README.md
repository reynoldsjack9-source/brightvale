# Compact character options

Three new faces (Bright, Bold, Gentle) and three new hairstyles (Curly crop, Side-swept bob, Tied back), available in all nine combinations for Vanguard, Arcanist and Ranger.

`heads-source.png` was generated and refined with the built-in ImageGen tool, using our original `art/vanguard-compact-idle.png` as a strict style reference. `head-*.png` are normalized source cutouts. The existing compact hero PNGs remain unchanged.

`<class>-<hair 1..3>-<face 1..3>-<pose>.png` are **complete finished animation sheets**, not runtime pieces. There are 162 sheets / 594 animation frames. The body, frame layout, weapons, pose timing, root and feet anchors come from the approved compact sheets. Each complete face/hair drawing is registered to its pose offline; foreground hands, arms and equipment retain their original depth. Rear drawings are used for climbing. No bones or detached limbs are animated.

Matching `-mask.png` files contain exact authored color regions for the new drawings: red channel 1 = skin, 2 = hair, 3 = iris, 255 = untouched ink/white. Transparent pixels leave the existing body color masks in charge. These ensure hair dye never paints a staff, bandana or glove and skin colors include hands.

## Rebuild and verify

Install the pinned dev dependencies with `npm ci`, then `npm run build:creator`. The game itself remains a static site and needs no npm runtime.

`node tools/build-creator-options.cjs --class=vanguard` rebuilds one class. `--sample` builds only the Curly crop / Bright sample for art iteration; do not publish a sample-only folder.

Run `npm run check:creator` and `npm run check:options`. The latter checks all 162 sheets and masks, all frame counts and protected opaque body pixels against the unchanged compact originals.

In-game verification routes:

- `/#featurecheck`: all nine combinations on all three classes beside each original.
- `?hair=2&face=3#posecheck`: every pose/frame for the selected combination, all three classes. Optional `class=warrior`, `class=mage`, or `class=archer` isolates a class.
- `/#creator`: the real creator, now opening on Features.
- `/#playcheck`: normal-input QA buttons, including movement, skills, rope seeking and climbing.

## Generation prompts

Built-in ImageGen, transparent output, reference: the unchanged original Vanguard idle sprite.

### Initial atlas

Create one production sprite atlas of NEW complete heads for this original game's compact heroes. The attached image is the strict style and head-proportion reference, not a body to redraw. Match its clean bold dark plum contour, simple smooth 2D cel shading, wedge-shaped 3/4 face facing RIGHT with both eyes visible, small confident anime-cartoon eyes, tiny mouth, warm peach skin, chestnut brown hair with one shadow and one highlight. Not round toddler heads, not realistic, not pixel art, not glossy. Each head is a single finished coherent drawing including face, ears, scalp and hair. NO neck, NO torso, NO headbands, hats, jewelry, effects, text, labels or borders. Genuine transparent background. Exact atlas layout: 3 equal columns x 4 equal rows on a 1536x2048 canvas; each cell 512x512. Every front-view head has identical face geometry, orientation, eye placement, head scale, and chin position, with chin at cell-local (272,410), face center at (272,315), ears around (170,320), head/hair fits between x100..420 and y115..410. Keep empty gutter around every drawing. Row 1: short chunky CURLY CROP hair, repeated with faces across columns: column1 'Bright' open almond eyes, friendly small closed smile; column2 'Bold' narrower confident eyes, raised outer brow, tiny toothy grin; column3 'Gentle' soft rounded almond eyes, gentle brows and small relaxed smile. Row 2: SIDE-SWEPT BOB hair (jaw-length chunky bob swept to the right, no ponytail), the same 3 faces respectively, same exact alignment and scale. Row 3: TIED-BACK hair (chunky swept fringe and short high ponytail swept left/back, secured with small plain brown tie), the same 3 faces respectively and same alignment. Row 4: rear views for climbing: column1 back of the curly crop head, column2 back of bob head, column3 back of tied-back ponytail head. Same head shape, scale and chin/base alignment; ears, hair cover back of head; absolutely no face visible on rear views. Draw each precisely with a hand-inked edge like the reference; keep hair compact so head silhouette and proportions fit the reference hero. All twelve cells must be separate isolated sprite cutouts. This atlas is for in-game sprite animation, not a concept poster.

### Curly crop refinement

Precise edit of the attached transparent 3-column by 4-row game head atlas. Preserve the exact atlas layout, all face shapes, expressions, facial features, alignment, proportions, shading style, brown hair color, and every drawing in rows 2 and 3 and the last two drawings in row 4. Change ONLY the hairstyle on all three heads of the TOP row and the FIRST rear-view head on the BOTTOM row: make this a short chunky CURLY CROP, with a rounded compact silhouette of several broad curled locks and visible clean scalloped curl clusters; not straight spikes, not messy windswept hair. Hair must still have a dark bold outline, chestnut base, simple cel shadow and small highlights like the existing drawings. Keep the three different faces unchanged. Curly hair should not become taller or wider than the original silhouette. Keep ears visible, NO neck, no body, no labels, no background, retain true transparency. The bob and tied-back styles must remain as supplied.
