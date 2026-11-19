# Compact creator art — distinct gender sets

The shipped creator reads complete sheets and masks from `v3/`. Each gender has **three independent faces and three independent hairstyles**:

| Gender | Faces | Hairstyles |
| --- | --- | --- |
| Male | Bright, Bold, Gentle | Curly crop, Side-swept bob, Tied back |
| Female | Freckled, Angular, Heart | Feathered pixie, Twin buns, Crown braid |

Every face/hair combination works on every class: 54 standing looks and **324 sheets / 1,188 animation frames**. The original `art/<class>-compact-*.png` files remain unchanged.

## Sources and production

`heads-source.png` is the male source atlas. `heads-female-distinct-source.png` is the separate female atlas, generated with built-in ImageGen against the male atlas as a style/alignment reference, then refined with unique facial identities. It has its own pixie, twin-bun and crown-braid silhouettes and corresponding rear views. Freckled has cheek freckles, Angular has a beauty mark and focused features, Heart has a cheerful open smile. These are not eyelash-only copies of the male presets. Full prompts are in `female-distinct-prompts.md`.

Both sources use three columns and four rows: nine front combinations and three rear styles. Generated transparency is retained. The baker normalizes cutouts into `v3/head-*.png`, anchors the actual jaw outline and bakes finished sprites offline. Runtime never attaches heads or limbs.

`tools/creator-regions.json` has separate male/female face, ear and iris annotations. Female iris bounds account for each identity; enclosed skin regions protect freckles and the beauty mark without absorbing the concave fringe. Mask red channel: 1 skin, 2 hair, 3 iris, 4 outfit, 255 preserved ink/paint. Runtime never guesses color regions. Pupils, whites, eyebrows, lips, freckles, marks and equipment stay outside the hair mask.

The baker separates the original body, collar/neck and foreground equipment. Bow, string, held hands, quiver, staff, blade and grip retain source depth. Original pose timing, root/feet anchors, body scale and simulation are unchanged.

## Reproduce and verify

- `npm ci`, then `npm run build:creator`.
- `--class=vanguard` rebuilds a class; `--pose=attack` limits an existing complete build to one pose.
- `--gender=female` refreshes the female set while retaining male coverage in the existing manifest.
- `--sample` and `--heads-only` are iteration modes; never ship an incomplete build.
- `--masks-only` refreshes annotations only. Use only when finished geometry and foregrounds are unchanged.
- `npm run check:creator` verifies syntax, the exact index wrapper, save migrations and three distinct choices per gender. `node tools/check-creator.cjs --baseline` also compares SIMULATION with HEAD.
- `npm run check:options` checks complete class/pose/variant coverage, every sheet, iris visibility, face-color isolation, body/shoulder/collar preservation, sword grip and bow material across front poses. Opaque body pixels remain exact; near-opaque foreground edges allow the necessary alpha blend against new hair.

Real-game routes: `/#creator`, `?gender=female#featurecheck`, `?gender=female&class=mage&hair=2&face=2#posecheck`, `/#colorcheck`, `/#playcheck`. Colorcheck tests 57 original/custom looks through the actual shader. Playcheck uses normal press/release input and prints saved appearance plus observed actions. See `../qa-v3/` for logs and fresh real-game screenshots, including all seven pose rows in 18 full-page captures.

Unversioned derived sheets remain historical and unused. The unversioned manifest supplies original pose landmarks to the offline baker.

## Generation prompts

Built-in ImageGen, transparent output, reference: the unchanged original Vanguard idle sprite.

### Initial atlas

Create one production sprite atlas of NEW complete heads for this original game's compact heroes. The attached image is the strict style and head-proportion reference, not a body to redraw. Match its clean bold dark plum contour, simple smooth 2D cel shading, wedge-shaped 3/4 face facing RIGHT with both eyes visible, small confident anime-cartoon eyes, tiny mouth, warm peach skin, chestnut brown hair with one shadow and one highlight. Not round toddler heads, not realistic, not pixel art, not glossy. Each head is a single finished coherent drawing including face, ears, scalp and hair. NO neck, NO torso, NO headbands, hats, jewelry, effects, text, labels or borders. Genuine transparent background. Exact atlas layout: 3 equal columns x 4 equal rows on a 1536x2048 canvas; each cell 512x512. Every front-view head has identical face geometry, orientation, eye placement, head scale, and chin position, with chin at cell-local (272,410), face center at (272,315), ears around (170,320), head/hair fits between x100..420 and y115..410. Keep empty gutter around every drawing. Row 1: short chunky CURLY CROP hair, repeated with faces across columns: column1 'Bright' open almond eyes, friendly small closed smile; column2 'Bold' narrower confident eyes, raised outer brow, tiny toothy grin; column3 'Gentle' soft rounded almond eyes, gentle brows and small relaxed smile. Row 2: SIDE-SWEPT BOB hair (jaw-length chunky bob swept to the right, no ponytail), the same 3 faces respectively, same exact alignment and scale. Row 3: TIED-BACK hair (chunky swept fringe and short high ponytail swept left/back, secured with small plain brown tie), the same 3 faces respectively and same alignment. Row 4: rear views for climbing: column1 back of the curly crop head, column2 back of bob head, column3 back of tied-back ponytail head. Same head shape, scale and chin/base alignment; ears, hair cover back of head; absolutely no face visible on rear views. Draw each precisely with a hand-inked edge like the reference; keep hair compact so head silhouette and proportions fit the reference hero. All twelve cells must be separate isolated sprite cutouts. This atlas is for in-game sprite animation, not a concept poster.

### Curly crop refinement

Precise edit of the attached transparent 3-column by 4-row game head atlas. Preserve the exact atlas layout, all face shapes, expressions, facial features, alignment, proportions, shading style, brown hair color, and every drawing in rows 2 and 3 and the last two drawings in row 4. Change ONLY the hairstyle on all three heads of the TOP row and the FIRST rear-view head on the BOTTOM row: make this a short chunky CURLY CROP, with a rounded compact silhouette of several broad curled locks and visible clean scalloped curl clusters; not straight spikes, not messy windswept hair. Hair must still have a dark bold outline, chestnut base, simple cel shadow and small highlights like the existing drawings. Keep the three different faces unchanged. Curly hair should not become taller or wider than the original silhouette. Keep ears visible, NO neck, no body, no labels, no background, retain true transparency. The bob and tied-back styles must remain as supplied.
