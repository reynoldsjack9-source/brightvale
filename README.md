# Brightvale

An original, bright 2D side-scrolling action RPG that runs in the browser. Pick a class, fight monsters, level up and use skills on a map full of floating platforms and ropes.

## For AI assistants: start here

If you've been asked to help with Brightvale's art, read **[ART_BRIEF.md](ART_BRIEF.md)** first. It has the master style guide, every character, monster, map piece and skill to design, animation frame counts, and exact file names. Follow the style guide for every image.

Plain-text link to the brief (easiest to read):
https://raw.githubusercontent.com/reynoldsjack9-source/brightvale/main/ART_BRIEF.md

## What's in the game now

| | |
| --- | --- |
| Classes | Vanguard (sword), Arcanist (magic), Ranger (bow), 5 skills each |
| Map | Clover Hill: camp, floating platforms, ropes, minimap |
| Monsters | Clover Beetle (Lv 2), Puff Wisp (Lv 4), Bristle Boar (Lv 6) |
| Systems | EXP and levels, gold and potion drops, cooldowns, saves per class |

Brightvale loads the sprite sheets in `art/` and uses drawn fallbacks when an asset is unavailable. The licensed Vanguard pixel sheets can be loaded from a private `craftpix/` folder and are excluded from this repository.

## Play it

Open `index.html` in a browser. Controls: arrow keys to move and climb, Space to jump, X to attack, A/S/D/F for skills, Q/W for potions, Esc for the menu.

For local testing, run `node tools/serve.cjs` from the repository root and open `http://localhost:5180/`.

- **Compact sprites** on the title screen selects the smaller idle and six-frame run artwork for all three classes. **Default sprites** returns to the standard character art.
- **Wardrobe** lets you mix body outfits, boots, gloves, hats, and weapons. It saves the preview selections per class in your browser.
- **Skills** replays all 15 skills. The game and gallery share the effect renderer in `brightvale-vfx.js`.

## Files

| Path | What it is |
| --- | --- |
| `ART_BRIEF.md` | Art brief and prompts for image generation |
| `index.html` | Playable game page |
| `brightvale.html` | Game source (the same game, without the page wrapper) |
| `wardrobe.html`, `wardrobe.js` | Wardrobe inventory, equipment layers, and outfit preview |
| `skills.html`, `brightvale-vfx.js` | Skill gallery and shared effects |
| `art/` | Drop finished PNGs here, named per the brief |
| `tools/serve.cjs` | Tiny local web server for testing |

## How the code is organized

`brightvale.html` keeps the game rules (the simulation) separate from drawing and input. The simulation only takes actions in and sends events out, so it can move to a server later for multiplayer.
