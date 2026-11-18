# Codex handoff: fix the Brightvale character creator art

You (ChatGPT Codex) now own the character creator's look, art **and** creator code if you need to change it. This file has everything you need. Read it fully before starting.

## The goal (Jack's words, summarized)
Brightvale is a bright, smooth, side-scrolling MMO-style action game (genre like classic 2D MMOs; **all content must be original**: no names, art, characters or maps from any existing game).
Jack wants a **mix-and-match character creator** (gender, face, eyes, hair, colors, class) where every combination looks as good as the **compact heroes**, the only art he has consistently liked:
- `art/vanguard-compact-idle.png` (+ `-run`, `-attack`, `-cast`, `-jump`, `-climb`)
- `art/arcanist-compact-*.png`
- `art/ranger-compact-*.png`

Target look for creator characters:
- Same style as the compact heroes: thick dark outline, cel shading, bright saturated colors, smooth (not pixel art).
- Big-head chibi proportions: head with hair is about 55% of total height and about 1.8× as wide as the shoulders.
- **No neck:** the chin sits directly on the collar.
- Small body, with legs and boots in proportion.
- 3/4 view facing right, like the compact heroes.
- Vanguard holds the sword firmly. In idle and walk it points forward and slightly down, away from the body, and **never crosses the neck or face**.

## What Jack disliked (don't repeat)
- **Visible neck:** skin or a dark neck post between chin and collar.
- **Sword across the throat or face.**
- Stubby legs with huge boots.
- Thin, scraggly hair (v3.1+ chunky hair was better; v3.2 added detail).
- Separate tiny eye/brow/mouth parts that looked stiff (whole faces were better).
- Grayscale-tinted parts that looked flat (full-color parts were better).
- A bone-rig made by cutting one drawing into pieces ("looks awful").
- A 3D-rendered character (Blender/VRM) ("looks really bad").
- Pixel-art versions; he prefers the smooth compact art.

## Current state
- **Live game:** creator v37, using your v4 art.
- **Repo:** https://github.com/reynoldsjack9-source/brightvale (branch `main`).
- **Game file:** `brightvale.html`. `index.html` is the same file wrapped in a doctype shell. After editing `brightvale.html`, regenerate it:
  ```
  { echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'; cat brightvale.html; echo '</body></html>'; } > index.html
  ```
- The creator code is the `CREATOR` section near line ~1575 of `brightvale.html`. Key constants:
  - `HEAD_SCALE=1, BODY_SCALE=1, OVERALL=1, NECK_DROP=0`: parts are drawn **exactly as you draw them**, with no resizing or cropping.
  - `FACES=['1'..'6']` per gender.
  - `HAIR={male:['Spiky','Crop','Messy','Swept','Topknot'], female:['Long','Bob','Ponytail','Twin tails','Bun']}`. File slugs are lowercase with no spaces (`twintails`).
  - `SKIN`, `HAIRC`, `EYEC` color lists, and `EXTRA` (freckles, blush, bandage, glasses).
  - `SLUG={warrior:'vanguard', mage:'arcanist', archer:'ranger'}`.
  - `POSES=['idle','walk','run','attack','cast','jump','climb']`.
- `art/creator/style.json` = `{"style":"compact","parts":"color"}`:
  - `"compact"` lets the game use creator art in play.
  - `"color"` means skin and hair are drawn in **full color** (skin about `#f2b98e`, hair chestnut about `#8a5a3a`). The game recolors them by shifting hue and lightness, so shading and outlines are kept. Pixels darker than about 21% lightness are treated as outline and stay dark.
- Saves use localStorage key `brightvale.save.v1` and store the name and the look.

### How a creator character is assembled (current system)
All files are in `art/creator/`:
1. **Body:** `body-<class>-<pose>.png` is one horizontal row of 256×256 frames, headless. `body-<class>-<pose>.json` holds `{"neck":[[x,y],...]}`, one neck point per frame, plus an optional `"rot":[deg,...]` head tilt per frame.
2. **Head:** a 256×256 layer stack. Template point **(128,200)** is placed exactly on the body's neck point for that frame. Drawing order:
   - `hair-<style>-back.png`
   - `head-<gender>.png` (recolored to skin)
   - `face-<gender>-<n>.png` (+ `-iris` tinted to eye color, `-blink` for blinking)
   - `extra-*.png`
   - `hair-<style>-front.png` (recolored to hair color)
3. **Climbing:** uses `head-<gender>.png` + `hair-<style>-rear.png` (back of head).
4. **Feet:** found automatically per sheet. The in-game height is scaled to match the compact hero of that class.

You may change this system if a different approach gives a better result. One example is drawing **whole premade characters**, each a full compact-style sprite set like the heroes, and letting players pick a look plus recolor hair, skin and outfit. If you change the code, keep saves working and keep the game rules in the SIMULATION block untouched.

## How to check your work (required before every push)
1. `node tools/serve.cjs`, then open `http://localhost:5180/`.
2. `http://localhost:5180/#posecheck` draws every frame of every pose, for all three classes, with sample heads, using the game's own code. **Reload after changing the hash.**
3. On the main page, click **New character**. Try both genders, all 6 faces, every hairstyle, several hair, skin and eye colors, and all three classes.
4. Start a game with a created character and walk, run, jump, attack, use skills (A/S/D/F) and climb a rope.
5. Save screenshots as `art/creator/check-posecheck.png`, `art/creator/check-creator.png` and `art/creator/check-ingame.png`, next to the compact heroes at the same size.
6. Look honestly for: any neck, the sword touching the face or neck, odd proportions, hair not covering the scalp, parts misaligned in any frame, and colors that look flat after recoloring.

## Rules
- Original content only. Do not trace, copy or imitate a specific existing game's sprites.
- Keep the repo public-safe: no licensed third-party asset files. The `craftpix/` and `vroid/` folders are gitignored; never add them.
- Do not change `art/<class>-compact-*.png` (the heroes Jack likes) unless asked.
- Keep the exact file names and frame layouts above, or update the code to match anything you change.
- Commit with a clear message and push to `main`. Claude (the other assistant) will pull, check in the real game and publish.
