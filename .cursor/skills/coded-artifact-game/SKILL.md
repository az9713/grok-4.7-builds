---
name: coded-artifact-game
description: >-
  Make a cinematic one-file browser game about a historical artifact: a period
  figure, an objective and a timer, fact captions, a decode puzzle, and an
  ending, with every image and sound generated in code. Use only when the user
  names this skill.
disable-model-invocation: true
---

# Coded artifact game

Make a short cinematic game about one real artifact. The artifact is the input. Do not default to the Rosetta Stone.

## Contract

- One HTML file, on the order of 3 MB. After load, the game makes no network requests for art, audio, or scripts.
- Generate images and sound in code. Inlining a library is fine. A `script src`, an `img`, or a media URL is not.
- Cinematic 3D. The player is dressed for the place and year. Light, dust, and weather belong to that hour.
- Objective at top-left. Timer at top center.
- Each discovery shows a serif caption with one fact. Check the facts. Dates, counts, and names have to be right.
- After the discoveries, a short puzzle that uses how the artifact actually works (matching scripts, turning gears, fitting fragments).
- A quiet end scene, away from the puzzle, that shows the artifact at rest.

## Checks

- File size is near 3 MB, not tens of MB of embedded photos.
- Finish the puzzle from a cold load. Watch the network panel: no requests after load. Calls inside an inlined engine (Three.js `FileLoader`) do not count if the game never uses them.
- The captions survive a fact check.

## Reference

The Stone of Rashid, `builds/09-rosetta-stone` in the variation set, is one instance: a 1799 dig at Rashid, three scripts, a cartouche match, a night ship, about 806 KB with Three.js inlined and no `script src`. Read it for HUD, captions, and the puzzle handoff. Build the user's artifact, and verify its facts.
