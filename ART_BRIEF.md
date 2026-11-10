# Brightvale Art Brief

This is the art brief for **Brightvale**, an original bright 2D side-scrolling action RPG. If you're an AI image assistant reading this, follow the **Master style guide** for every image, and work through the sections in order.

## How to use this brief

Use one chat for the whole project so it remembers the style. Paste the master style guide first, then work through the sections in order: characters, monsters, map, skills.

1. Paste the master style guide. Ask the assistant to reply "Got it" and wait.
2. Do the character concept sheets first. Pick the version you like before asking for any poses. Every later image is matched to it.
3. For each new image, upload your approved concept sheet back into the chat with the prompt. This is the single biggest help for keeping characters consistent.
4. Ask for one character or one sheet per message. Big "do everything" requests drift in style.
5. Download each image as PNG and save it into `art/` using the names in the file checklist at the end.
6. Tell Claude when a batch is in the folder. Claude slices the sheets, lines up the frames and wires them into the game.

If an image comes back wrong, don't start over. Reply with one specific fix, such as "same image, but the sword is on his right side" or "keep everything, make the outline thicker."

## Master style guide (paste this first)

This sets the look for every image that follows.

```
You are the art director for Brightvale, an original 2D side-scrolling action RPG. Every image you make for this project must follow this style guide. Reply "Got it" and wait for my first request.

LOOK
- Bright, cheerful, sunny daytime fantasy. Saturated but soft colors, never dark or gritty.
- Clean 2D cartoon art with smooth cel shading: one flat base color, one soft shadow tone, one small highlight. No painterly texture, no realistic lighting.
- Bold dark outlines (deep plum, #3a2a33) about 3 px at final size, slightly thinner on inner details.
- Light comes from the upper left on every image.

CHARACTERS (small "game sprite" look, like a tidy toy figure, not an illustration)
- About 2.5 heads tall: the head is roughly HALF the character's total height. Small compact torso, short stubby arms and legs, small rounded hands and feet.
- Big face: large glossy oval eyes set low on the face, dark irises with one bold white highlight, a tiny nose (or none), a small simple mouth, light blush.
- Hair built from a few big chunky clumps with a clean silhouette, not lots of thin strands.
- Thinner outlines than the scenery: about 2 px dark outline at final size, crisp clean edges.
- Flat, simple shading: one base color, one shadow tone and a small highlight. No gradients, glows or painterly texture on characters.
- Simple outfits made of clear blocks of color; keep small details to a minimum so the character still reads clearly at about 70 px tall.
- Relaxed, slightly front-facing standing pose; poses read as cute and a bit stiff rather than dramatic or realistic.
- Always drawn in a THREE-QUARTER VIEW facing RIGHT unless I say otherwise: the character faces and moves to the right, but the body and face are turned about 45 degrees toward the viewer, so both eyes, the chest and the front of the outfit are visible. Never a flat side profile.
- Monsters stay in plain side view facing right.

PALETTE
- Sky blue #5fb8ff, grass green #5cc44a, warm dirt #d9a066, sunshine yellow #ffd23f, berry pink #ff6b8b, mana blue #4aa3ff, soft white #ffffff.

TECHNICAL
- Transparent background (PNG) for every character, monster, effect and icon. Only full backgrounds get a filled background.
- No text, logos, watermarks, borders or drop shadows on the ground unless I ask.
- Keep the subject centered with even padding around it.

RULES
- Everything must be an original design. Do not copy or reference characters, monsters, maps or art from any existing game, show or brand.
- When I upload an approved reference image, match it exactly: same colors, outline weight, proportions and details.
```

## Characters

There are three player classes, and each needs one concept sheet and then a set of pose sheets. The designs below match what's already in the game, so the new art drops in without changing gameplay.

| Class | Look | Weapon | Key colors |
| --- | --- | --- | --- |
| Vanguard | Spiky orange hair, red headband with flowing tails, light blue armor with a gold belt buckle, short red cape | Broad silver sword with a gold crossguard | Blue #7fb2ff, red #ff5d6c, orange hair #ff9a3c |
| Arcanist | Lavender hair, tall floppy purple wizard hat with a gold band and a pom tip, long purple robe with gold trim | Wooden staff topped with a glowing yellow orb | Purple #a77bff, gold #ffd23f, lavender #b48cff |
| Ranger | Brown ponytail, green bandana with a white feather, green tunic, brown leather quiver on the back | Curved wooden shortbow | Green #6fd46a, brown #8a6a44, cream #fff1b8 |

### Step 1: concept sheet (one per class)

```
Create a character concept sheet for the Brightvale [CLASS NAME]. [paste the Look, Weapon and Key colors from the table].
Show three views side by side on a transparent background: three-quarter view facing right (body and face turned about 45 degrees toward the viewer, both eyes visible), front view, and back view. Same size and proportions in all three. Chibi proportions per the style guide. No text.
```

Generate a few versions, pick one and save it as the reference. Every later prompt for that class starts with: "Here is the approved [CLASS NAME] reference. Match it exactly."

### Step 2: pose sheets

Ask for one row of poses at a time. Every frame must be the same size, with the feet on the same baseline.

```
Using the approved [CLASS NAME] reference, create a horizontal sprite strip of [NUMBER] frames showing [POSE], three-quarter view facing right (turned about 45 degrees toward the viewer, both eyes and the front of the outfit visible), transparent background. Each frame is the same size (256x256) with the character's feet touching the same bottom line and the body centered. Keep every detail identical between frames; only the pose changes.
```

Poses needed for each class (frame counts are in the animation section):

- Idle (breathing)
- Walk
- Jump (rising, peak, falling)
- Climb rope (back view)
- Basic attack
- Skill cast (one strip per skill: the Vanguard's slam and war cry, the Arcanist's staff thrust, the Ranger's bow draw)
- Hurt
- Knocked out (lying down)

## Monsters

There are three monsters on Clover Hill, from easy near camp to tough in the east. Each is cute rather than scary, with a clear shape you can read at a glance.

| Monster | Level | Look | How it moves |
| --- | --- | --- | --- |
| Clover Beetle | 2 | Round glossy green shell with white spots, a little three-leaf clover sprouting from its back, yellow face with one big friendly eye, one curly antenna with a pink bobble, six stubby legs | Waddles with a small hop |
| Puff Wisp | 4 | Floating white cloud puff with tiny feathery wings, two dot eyes and rosy cheeks, soft glow around it | Bobs in the air and puffs out small sparkle shots |
| Bristle Boar | 6 | Chunky tan boar, cream belly, a ridge of dark brown spikes along its back, pink snout, small white tusks, one perked ear | Trots, stamps, then charges |

### Concept sheet prompt

```
Create a monster concept sheet for the Brightvale [MONSTER NAME], a level [LEVEL] creature. [paste the Look from the table].
Side view facing right on a transparent background, plus a smaller front view beside it. Cute, round and friendly, matching the style guide. About the size of a small dog next to a chibi hero. No text.
```

### Pose strips prompt

```
Using the approved [MONSTER NAME] reference, create a horizontal sprite strip of [NUMBER] frames showing [POSE], side view facing right, transparent background. Every frame is 256x256 with the feet (or the bottom of the body, if it flies) on the same line and the body centered. Only the pose changes.
```

Poses needed for each monster:

- Idle
- Move (walk, float or trot)
- Hit (squashed, eyes shut)
- Defeated (pops into a puff of sparkles)
- Clover Beetle: just the four above
- Puff Wisp only: shoot (puffs up, then releases)
- Bristle Boar only: wind-up (pawing the ground) and charge (low, fast, dust behind)

## Map: Clover Hill

The map is a sunny meadow forest built in layers, so the background scrolls slower than the ground and feels deep. Backgrounds can be wide single images. Platforms and props must be separate transparent pieces so Claude can place them.

### Background layers (filled, not transparent)

Each layer is 3840x1080 and must tile left to right with no visible seam.

```
Create a seamless, horizontally tiling background layer for Brightvale's Clover Hill, 3840x1080, matching the style guide. [LAYER DESCRIPTION]. The left and right edges must line up perfectly so it can repeat. No characters, no text.
```

| Layer | Description to paste |
| --- | --- |
| Sky | Bright blue gradient sky, lighter at the bottom, a soft warm sun in the upper right, scattered fluffy white clouds |
| Far hills | Gentle pale green rolling hills along the bottom third, hazy and soft, transparent above the hills |
| Mid trees | A row of round, puffy cartoon trees in medium green along the bottom half, a few with pink blossoms, transparent above |

### Platforms and tiles (transparent)

```
Create a set of side-view platform pieces for Brightvale's Clover Hill on a transparent background: a floating grassy dirt ledge split into a left end cap, a middle piece that tiles seamlessly, and a right end cap. Bright green grass top with small tufts and tiny flowers, warm orange-brown dirt underneath with a few pebbles, short hanging vines. Bold outline per the style guide. Each piece 256x128.
```

Also ask for a ground strip in the same style: a 512x256 piece that tiles left to right, with grass on top and deep dirt below.

### Props (transparent, one sheet)

```
Create a prop sheet for Brightvale's Clover Hill camp on a transparent background, each item separated with space around it: a striped orange camping tent with a little yellow flag, a crackling campfire on stacked logs, a wooden signpost with a blank arrow sign, a climbing rope with knots and a wooden peg at the top, a big round cartoon tree, a glowing swirling portal ring in teal and lavender. Matching the style guide, side view.
```

The camp also has one friendly NPC, a cook in a white chef hat and yellow apron. Make that NPC with the character prompts, as one concept sheet plus an idle strip.

## Skills: icons and effects

Each of the 15 skills needs a hotbar icon, and most need an effect strip: the flash, burst or trail you see when the skill goes off. Do all icons for one class in a single sheet so they match.

| Class | Key | Skill | Effect to draw |
| --- | --- | --- | --- |
| Vanguard | X | Slash | White crescent swoosh |
| Vanguard | A | Cleave | Wide golden double swoosh |
| Vanguard | S | Earthsplitter | Ground shockwave ring with flying dirt chunks |
| Vanguard | D | War Cry | Red and gold rings bursting outward, warm aura |
| Vanguard | F | Charge | White speed streaks behind the hero |
| Arcanist | X | Spark | Small yellow-white star bolt with a short trail |
| Arcanist | A | Fire Orb | Round orange fireball, then a fiery burst on hit |
| Arcanist | S | Chain Lightning | Jagged pale-blue bolt with a bright white core |
| Arcanist | D | Frost Nova | Ice ring expanding outward with crystal shards |
| Arcanist | F | Blink | Lavender sparkle swirl where you vanish and appear |
| Ranger | X | Quick Shot | Wooden arrow with a pink fletch and a faint trail |
| Ranger | A | Twin Shot | Two arrows side by side |
| Ranger | S | Piercing Arrow | Long glowing pale-blue arrow with a streak |
| Ranger | D | Arrow Storm | Arrows falling from above onto a lit patch of ground |
| Ranger | F | Vault | Small dust puff at the take-off point |

### Icon sheet prompt (one per class)

```
Create a sheet of 5 skill icons for the Brightvale [CLASS NAME], arranged in one row, each 256x256 with a rounded-square colored background and a bold simple symbol in the middle, matching the style guide. Icons: [list the 5 skill names and effects from the table]. Readable when shrunk to 40x40. No text or letters.
```

### Effect strip prompt (one per skill)

```
Create a horizontal sprite strip of [NUMBER] frames for the Brightvale [SKILL NAME] effect: [effect from the table]. Transparent background, each frame 256x256 with the effect anchored at the same point. Show it starting small, peaking, then fading out. Bright, clean cartoon shapes with soft glow, matching the style guide. No characters in the image.
```

Also ask for these shared pieces once: the damage number digits 0 to 9 as chunky yellow-to-orange numbers with a thick plum outline, a separate red-to-orange set for critical hits, a gold coin, a red HP potion and a blue MP potion.

## Smooth animation

Smooth motion comes from enough frames, the same size and baseline in every frame, and the game playing them at the right speed. The image assistant only has to draw the poses. The game handles timing, blending and squash-and-stretch on top.

| Animation | Frames | Loops | Speed in game |
| --- | --- | --- | --- |
| Idle | 4 | Yes | Slow, about 6 per second |
| Walk | 6 to 8 | Yes | About 12 per second |
| Jump | 3 (rise, peak, fall) | No | Picked by vertical speed |
| Climb | 4 | Yes | Only while moving |
| Basic attack | 4 (wind-up, swing, follow-through, recover) | No | About 0.4 seconds total |
| Skill cast | 4 to 6 | No | Matches the skill's cast time |
| Hurt | 2 | No | About 0.3 seconds |
| Knocked out | 2 | No | Holds the last frame |
| Monster move | 4 to 6 | Yes | About 10 per second |
| Skill effect | 5 to 8 | No | About 0.3 to 0.6 seconds |

### Rules that keep it smooth

- Same frame size every time: 256x256 for characters, monsters and effects.
- Same baseline: feet touch the same bottom line in every frame, or the character will bob and jitter.
- Same center: the body's middle stays in the middle of the frame. Only arms, legs and weapon move outward.
- Hold the key poses: the wind-up and the hit frame of an attack matter most. If only two frames come out right, keep those.
- Exaggerate: a slightly bigger wind-up and follow-through reads as smooth and punchy at game speed.

### If frames don't line up

Image generators often shift or resize a character a little between frames. Don't fix that by regenerating. Claude can trim, resize and re-center each frame automatically when building the sprite sheet. What can't be fixed afterward is a changed design, such as a different hair shape or a missing belt. Reject those and ask again with the reference image attached.

## File checklist

Save everything as PNG in `art/`, named as below, all lowercase with dashes. A name tells Claude what the file is and where it goes.

| Group | File names |
| --- | --- |
| Concept sheets | `vanguard-concept.png`, `arcanist-concept.png`, `ranger-concept.png`, `npc-cook-concept.png`, `beetle-concept.png`, `wisp-concept.png`, `boar-concept.png` |
| Character poses | `[class]-[pose].png`, such as `vanguard-walk.png`, `arcanist-climb.png`, `ranger-attack.png` |
| Skill casts | `[class]-cast-[skill].png`, such as `vanguard-cast-earthsplitter.png` |
| Monster poses | `[monster]-[pose].png`, such as `boar-charge.png`, `wisp-shoot.png` |
| Backgrounds | `bg-sky.png`, `bg-hills.png`, `bg-trees.png` |
| Platforms | `tile-ledge-left.png`, `tile-ledge-mid.png`, `tile-ledge-right.png`, `tile-ground.png` |
| Props | `props-camp.png` |
| Skill icons | `icons-vanguard.png`, `icons-arcanist.png`, `icons-ranger.png` |
| Skill effects | `fx-[skill].png`, such as `fx-fire-orb.png`, `fx-frost-nova.png` |
| Shared | `numbers-normal.png`, `numbers-crit.png`, `items.png` (coin and potions) |

A good first batch is one class's concept sheet, idle, walk and attack strips, plus the Clover Beetle. That's enough to swap in real art and see how it looks in motion before making the rest.

- [ ] Vanguard concept, idle, walk, attack
- [ ] Clover Beetle concept, idle, move, hit
