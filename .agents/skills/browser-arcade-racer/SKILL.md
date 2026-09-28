---
name: browser-arcade-racer
description: >-
  Build a complete cartoon 3D racing game in the browser: title, eight original
  racers, at least three tracks, item crates, AI, and a results screen with lap
  times. Use only when the user names this skill.
disable-model-invocation: true
---

# Browser arcade racer

Build a finished arcade racer, not a driving prototype. The vehicle and the setting are inputs. Do not default to jet skis.

## Contract

- Bright low-poly 3D and a glossy title logo.
- "Choose your racer": 8 original characters, stat bars, a class, a lap count, and a Race button. Invent the names. Do not use trademarked characters.
- At least three tracks. Each gets a title card. Tracks need the obstacles that fit the vehicle (buoys and ramps on water, barriers and jumps on land).
- Item pickups with at least two effects that change the race (a boost and one other).
- HUD: item slot at top center, minimap, speedometer, race position. Lap counter while driving. A results screen with lap times.
- AI opponents that finish races.

## Stack

A small split is fine: `index.html`, `data.js` for racers and tracks, `world.js`, `game.js`, `ui.js`, and a vendored Three.js build so the game runs without a CDN. The reference does this.

## Checks

- Start a race, finish it, and see lap times.
- An item changes speed, handling, or position. Confirm by racing once with the item and once without, or by reading a visible effect and the standings.
- No racer name is a trademarked character.

## Reference

Spraywave Rally, `builds/10-wave-racer` in the variation set, is one instance: jet skis, waves, buoys, ramps, floating crates, eight racers. Read `data.js` and `ui.js` for the menu and HUD. Build the user's vehicle and tracks.
