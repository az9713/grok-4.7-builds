# Lobby Buffer — After the Party (localhost multiplayer)

Sit-down floor buffers in a hotel lobby the morning after a party. Confetti
keeps drifting back onto the tile. Drive a buffer and the pad clears a lane
of polished marble; over about a minute and a half the confetti sheet
returns. A server keeps every window's view of the floor and the other
buffers in sync.

**Local only.** There is no public server and no deploy step. Everything
runs on `localhost` for testing with 2-3 browser windows on one PC.

## Requirements

- Node.js (already installed)
- Google Chrome or any modern browser

## Run it

From this folder (`builds-ns/12a-mp-lobby/`):

```
npm install
npm start
```

The server prints:

```
[lobby-buffer] listening on http://localhost:3531
```

Open that URL in a browser. Each browser **window** (not each tab sharing
state) becomes its own player — the server hands out a fresh id per
WebSocket connection, so nothing is keyed on a cookie or `localStorage`
value that windows would otherwise share.

To join with a name straight from a link (skips the name-entry screen):

```
http://localhost:3531/?name=Ada
```

Without `?name=`, you get a small join screen with a name field and a
"Start Buffing" button.

## Controls

- `W` / `Up` — throttle forward
- `S` / `Down` — reverse
- `A` / `D` or `Left` / `Right` — steer (only takes effect while moving)
- `Enter` — open chat, type, `Enter` again to send (`Escape` clears/closes)

The camera is a fixed cockpit over the buffer wheel, gloves on the rim.
There is no mouse-look, so two windows can sit side by side without pointer
lock stealing focus.

**Keyboard and pointer/focus only go to the window that has OS focus.**
Click into the window you want to drive before pressing keys. The other
windows keep receiving and rendering the game state the whole time.

## Test with 2 or 3 windows

1. Run `npm install` once, then `npm start`.
2. Open `http://localhost:3531/?name=Ada` in one browser window.
3. Open `http://localhost:3531/?name=Bo` in a second browser window.
   Arrange the two windows side by side so both are visible.
4. Click into Ada's window and drive with `W`/`A`/`S`/`D`. Within well
   under a second, Bo's window shows the cleared tile, Ada's buffer
   moving, and Ada's machine on Bo's minimap (bottom-right).
5. Press `Enter` in Ada's window, type a message, press `Enter` again.
   It appears in the middle of both windows' screens.
6. Optionally open a third window at `http://localhost:3531/?name=Cam`
   while the first two are still playing. Cam spawns into the same live
   lobby and all three see each other immediately.
7. To stop the server, go back to the terminal running `npm start` and
   press `Ctrl+C`.

## How sync works (why background windows still update)

Browsers throttle `requestAnimationFrame` in a hidden tab, so a render loop
alone would freeze a window's view of the world while it's in the
background. This build never relies on rAF for state:

- The server ticks on a plain `setInterval` (12.5 Hz, `server/index.js`),
  independent of any browser, and broadcasts confetti-grid diffs and player
  positions on that timer.
- Each client sends its own position (and clears confetti under itself
  while moving) on a `setInterval` (~15 Hz, `public/js/network.js`),
  not inside the render loop.
- Every incoming WebSocket message updates the shared `world` state
  object immediately, in the message handler. `requestAnimationFrame`
  only reads that state to draw the current frame.

The grid is a float field: `1` is confetti, `0` is bare tile. Driving
writes zeros; each server tick nudges cleared cells back toward `1`.

## What's simplified

- The buffer, lobby, columns, and chandeliers are primitive three.js
  meshes with procedurally generated canvas textures (no external image
  or model assets). Materials are PBR (clearcoat marble, painted metal).
- It is a warm indoor lobby look, not a photograph of a real hotel.
- Vehicle physics are simple arcade acceleration and steering.

## Project layout

```
server/
  index.js       HTTP + WebSocket on /ws, authoritative 80ms tick, port 3531
  gameState.js   Confetti grid, player registry, chat log
public/
  index.html     Join screen, HUD, offline three.js import map
  style.css      Warm lobby UI
  js/
    main.js      Renderer, input, buffer physics, render loop
    network.js   WebSocket client, world-state sync on a timer
    world.js     Shared state (players, confetti bytes, chat)
    terrain.js   Marble tile + confetti sheet driven by the grid
    snowblower.js  Sit-down floor buffer + remote driver
    hotel.js     Reception wall, columns, chandeliers
    snowfx.js    Drifting confetti + pad plume
    minimap.js   Bottom-right minimap
    chat.js      Center-screen chat
    textures.js  Procedural marble, confetti, wood, signs
```
