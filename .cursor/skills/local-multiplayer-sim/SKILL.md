---
name: local-multiplayer-sim
description: >-
  Build a first-person multiplayer simulator on localhost: shared world edits
  over a WebSocket, join-by-name links, a minimap, and chat. Use only when the
  user names this skill.
disable-model-invocation: true
---

# Local multiplayer sim

Build a first-person game where several players share one world on a machine you control. The activity, the vehicle or tool, and the place are inputs. Do not default to snowblowers or an alpine hotel.

## Contract

- First person. The player's hands hold the controls and one comic prop.
- Many players in one place, in front of a landmark that fits the theme.
- The work changes the ground (cut grass, cleared snow, dug dirt). That change is server state. Other clients see it in under a second. The world slowly undoes the work so the session does not end in a finished field.
- Minimap at bottom-right. Chat text on screen.
- A player joins from a link with `?name=`.
- Write a README with the install and start commands, and the two-window test.

## Stack

Node server (the reference uses Express and `ws`) plus a Three.js client. Bind to localhost unless the user names a host they control. Do not invent a public deploy.

Skip mouse-look if you need two windows tested side by side. Pointer lock steals focus from the other window. Say so in the README. If the user asks for mouse-look, add it and test with two machines or two focused sessions.

Match the look they asked for. Browser PBR is not photoreal. Do not describe a low-poly scene as photoreal.

## Checks

- Two browsers, two names. A ground change in one shows in the other in under a second.
- A third window can join from the link while the game is running.
- Chat typed in one window shows in the others.

## Reference

Snow Day, `builds/12-snow-day` in the variation set, is one instance: vintage snowblowers, an alpine hotel, cocoa, lanes that refill, port 3512, no mouse-look, low-poly PBR. Read `server/gameState.js` for what is synced. Build the user's activity.
