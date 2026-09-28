---
name: browser-soulslike
description: >-
  Build a third-person soulslike that runs in the browser: serif title screen,
  area-name banners, health, stamina, flasks, currency, and rest points that
  heal the player and bring enemies back. Use only when the user names this skill.
disable-model-invocation: true
---

# Browser soulslike

Build a third-person action game in the browser in the manner of Dark Souls. The place, the player, and the enemies are inputs. Do not default to a snowbound monastery.

## Contract

- Near-photoreal materials for the chosen place. Third-person camera behind an armed player. Attack, dodge, and block.
- Title screen with a serif logo and New Game, Controls, Quit.
- On entering an area, show its name in large serif capitals, then dismiss it.
- HUD: health and stamina at top-left, flask count at bottom-left, a currency count at bottom-right.
- Rest points. Resting fills health and flasks, writes the checkpoint, and returns every defeated enemy in a visible burst.
- Death reloads the player at the last rest point. Enemies are back. Currency handling can be loss or recovery, but pick one and keep it.

Give the place at least three areas the player can walk between. Name them.

## Stack

One `index.html` is enough. Three.js with a bloom or grade pass matches the reference look. Serve it over HTTP.

## Checks

Play, do not only read the code:

- Kill an enemy, rest. That enemy is back.
- Die. You are at the last rest point.
- Walk into each area. Its name appears on arrival.

## Reference

Frostbound Monastery, `builds/05-frostbound-monastery` in the variation set, is one instance: cloisters, a bell tower, a rope bridge, lantern shrines, Three.js 0.160 and UnrealBloomPass. Its Tower, Bridge, and Summit banners were not confirmed with real input. Read it for HUD and shrine flow. Build the user's place, and walk every area before you finish.
