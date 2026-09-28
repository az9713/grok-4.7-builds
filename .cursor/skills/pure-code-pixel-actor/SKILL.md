---
name: pure-code-pixel-actor
description: >-
  Draw a small pixel-art character in pure code, no sprite sheets, on a fixed
  palette, looping idle, charge, and action with particles and screen shake.
  Use only when the user names this skill.
disable-model-invocation: true
---

# Pure-code pixel actor

Animate one small character in large crisp pixels. The character, the action, and the setting are inputs. Do not default to a dragon or a castle wall.

## Contract

- No sprite sheets and no images. Draw every pixel in code.
- One fixed palette. The reference uses 24 colors. Stay at or under the count you declare, and count colors on a screenshot before you finish.
- `image-rendering: pixelated`. The character stays small in the frame.
- A three-state loop that looks like hand-drawn frames, not a tween:
  1. Idle: breathing, a blink, a secondary motion (tail, cape, staff).
  2. Charge: a wind-up and a glow on the body.
  3. Action: particles, light cast on the setting, and screen shake.
- One HTML file.

## Checks

- The page shows idle, then charge, then action, then repeats.
- A screenshot uses only the declared palette.

## Reference

Pixel Dragon, `builds/08-pixel-dragon` in the variation set, is one instance: a 24-color dragon on a night wall, idle, inhale, fire breath. Read it for the palette list and the frame timing. Draw the user's character.
