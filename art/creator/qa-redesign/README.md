# Creator redesign verification

Male faces: Steady / Rugged / Keen. Male hair: Close crop / Short side part / Short spikes. Female faces/hair remain distinct, with subtle outfit shaping at chest, waist and hips. Original painted necks, upper shoulders and collars are restored. The Arcanist shoulder cape now retains its complete original top contour.

- All 54 selections passed through the actual creator UI: `creator-ui-checks.json`.
- All 57 looks passed the actual browser recolor shader, with zero out-of-region changes: `runtime-color-checks.txt`.
- All 324 sheets / 1,188 frames passed asset checks, including original shoulder-cape paint, connected necks, visible irises, face-region isolation, bounded tailoring, unchanged lower-body/equipment anchors and bow material: `asset-checks.txt`.
- `poses/` contains 18 full-page screenshots from the real game's pose route, with all seven rows and every animation frame. Each includes the original reference. Mixed pairs are additionally covered by the full asset/UI checks.
- `male-creator.jpg` shows all three male choices. `male-arcanist-class.jpg` and `female-arcanist-class.jpg` show the repaired shoulder and original short neck. `male-features.jpg` compares all 27 male looks to the originals.
- Live game: created a new version of the earlier test hero Rowan with Short spikes/Rugged, ran, jumped/double-jumped, used basic attack and A/S/D/F, climbed, reloaded and continued the saved appearance. War Cry is a buff and does not set an attack-pose flag. Screenshots: `male-gameplay.jpg`, `male-climb.jpg`.
- Continued Mira's existing female Twin buns/Angular save, with Mint hair and Blue eyes. Movement, basic attack, A/S/D/F and climbing ran through normal controls; Chain Lightning was tested with enemies in range. Mira reached level 2 through normal combat. Screenshots: `female-gameplay.jpg`, `female-combat.jpg`, `female-climb.jpg`.
- Continued Juniper's version-2 save through the new female body renderer. Piercing Arrow hit for 42 damage; the held bow and hand remained intact: `ranger-combat.jpg`.
- Raw live appearance/action observations: `real-game-checks.txt`. Final browser error logs are empty: `browser-errors.json`.

These are in-app browser captures. `offline-art-comparison.png` is a separate offline sprite comparison. Original compact PNGs and SIMULATION remain unchanged. Previous verification in `../qa-v3/` depicts the earlier designs. Current source/prompt: `../compact-options/heads-male-masculine-source.png` and `../compact-options/male-redesign-prompts.md` (built-in ImageGen).
