# Brightvale: brief for a 2D character artist

Brightvale is a bright, cheerful 2D side-scrolling action RPG that runs in the browser. Players create their own hero (body, face, hair, colors) and pick one of three classes. We need a **layered character system** drawn by hand so every combination looks as good as a single finished illustration.

## Style

- Match the hero sprites in this folder: `art/vanguard-compact-idle.png`, `art/arcanist-compact-idle.png`, `art/ranger-compact-idle.png` (plus their `-run`, `-attack`, `-cast`, `-jump` and `-climb` strips).
- Chibi proportions: big head (about 60% of the height with hair), short stocky body.
- Three-quarter view facing right, bold dark outlines, flat cel shading with one shadow and one highlight.
- Original designs only.

## What we need

| Layer | Variants | Notes |
| --- | --- | --- |
| Head base | Male, female | Drawn in one skin tone; the game recolors skin |
| Faces | 6 male, 6 female | Eyes, brows, nose and mouth together; irises on their own layer; a blink version of each |
| Hairstyles | 5 male, 5 female | Front (over the face), back (behind the head) and rear (seen from behind, for climbing); drawn in one hair color; the game recolors hair |
| Extras | Freckles, blush, bandage, glasses | Small overlays |
| Bodies (headless) | 3 classes: Vanguard (sword), Arcanist (staff), Ranger (bow) | Poses below, with the neck point of every frame |

**Body poses and frame counts:** idle 4, walk 6, run 6, attack 4, cast 4, jump 3, climb 4 (seen from behind).

## Technical

- PNG with transparency. Body frames are 256×256 in one horizontal strip per pose, feet on the same bottom line.
- Head parts are 256×256 on one shared head template, with the neck point at (128, 200), the same scale as the bodies.
- For each body strip, a small JSON file listing the neck point for every frame, like `{"neck":[[128,120],[129,118]]}`.
- Layered source files (PSD, Aseprite or Krita) are welcome as an extra.

## Usage

- The art is used in our game, which may be released publicly and sold.
- We need full rights to use and modify the art in the game.

## How to quote

Please quote the full set above, plus a price for adding more hairstyles and faces later. A sample first (one head, one face, one hairstyle on the Vanguard idle body) is the ideal start.
