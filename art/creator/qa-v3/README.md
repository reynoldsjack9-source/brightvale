# Revision 3 verification — distinct gender sets

Male: Bright / Bold / Gentle; Curly crop / Side-swept bob / Tied back.
Female: Freckled / Angular / Heart; Feathered pixie / Twin buns / Crown braid.

- `creator-ui-checks.json`: all 54 gender-specific combinations selected through the actual creator, zero selection failures.
- `runtime-color-checks.txt`: 57 original/custom standing looks passed the actual browser recolor shader. Irises visibly changed blue; no changes escaped the selected color region.
- `real-game-checks.txt`: Mira continued with the new female Twin buns/Angular look and saved Mint hair/Blue eyes. Normal controls recorded movement, basic attack, double jump, A/S/D/F and climbing. Juniper continued and used Piercing Arrow/climbed with the new female set through v2 save migration.
- `pose-captures.json` and `poses/`: 18 full-page captures from the game's `#posecheck` route. Both genders, all three classes and all three diagonal face/hair pairs; every pose row includes all frames and the original reference. Minimum saved image height: 987 pixels. Mixed face/hair pairs are also covered by the 54-combination UI pass and feature matrices.
- `climb-captures.json`: three actual Ranger climbing observations and corresponding burst captures; selected capture 2 is `captures/check-climb.jpg`.
- `captures/`: fresh real-game creator, male/female feature matrices (rows are Vanguard, Arcanist, Ranger; the first column is the original class hero), 390-pixel narrow layout, gameplay, combat and climbing screenshots. `../check-*.png` are refreshed copies converted from these JPEG captures.
- `browser-errors.json`: current creator/game console results after the complete build.
- `asset-checks.txt`: 324 sheets / 1,188 frames validated, including visible irises, separate female annotations, ear/brow/mouth/freckle isolation, collars/shoulders, opaque body paint, sword grip and 85,014 source bow-material pixels across front poses.

Screenshot capture initially timed out. It succeeded on the follow-up pass after the user confirmed the in-app browser was visible. The screenshots here are real in-app browser captures, not offline substitutes. The supplementary `../v3-proof-options.png` is an offline art comparison and is labeled separately.

SIMULATION and the approved original compact sprite files remain unchanged. Generation source and full built-in ImageGen prompts: `../compact-options/heads-female-distinct-source.png` and `../compact-options/female-distinct-prompts.md`.
