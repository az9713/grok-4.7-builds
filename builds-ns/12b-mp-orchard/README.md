# Orchard Cart — Dawn Frost (localhost multiplayer)

Heated carts in an apple orchard at dawn, in front of a cider barn. The
grass is coated in frost. The cart's belly melts a dark lane; frost creeps
back over about a minute and a half. A server keeps every window's view of
the orchard and the other carts in sync.

The driver's hands hold a tiller and a pruning lamp. There is no drink and
no steering-wheel thermos.

**Local only.** There is no public server and no deploy step. Everything
runs on `localhost` for testing with 2-3 browser windows on one PC.

## Requirements

- Node.js (already installed)
- Google Chrome or any modern browser

## Run it

From this folder (`builds-ns/12b-mp-orchard/`):

```
npm install
npm start
```

The server prints:

```
[orchard-cart] listening on http://localhost:3532
```

Open that URL in a browser. Each browser **window** (not each tab sharing
state) becomes its own player — the server hands out a fresh id per
WebSocket connection, so nothing is keyed on a cookie or `localStorage`
value that windows would otherwise share.

To join with a name straight from a link (skips the name-entry screen):

```
http://localhost:3532/?name=Ada
```

Without `?name=`, you get a small join screen with a name field and a
"Start the Route" button.

## Controls

- `W` / `Up` — throttle forward
- `S` / `Down` — reverse
- `A` / `D` or `Left` / `Right` — steer the tiller (only while moving)
- `Enter` — open chat, type, `Enter` again to send (`Escape` clears/closes)

The camera is a fixed seat view over the tiller and the pruning lamp.
There is no mouse-look, so two windows can sit side by side without pointer
lock stealing focus.

**Keyboard and pointer/focus only go to the window that has OS focus.**
Click into the window you want to drive before pressing keys. The other
windows keep receiving and rendering the game state the whole time.

## Test with 2 or 3 windows

1. Run `npm install` once, then `npm start`.
2. Open `http://localhost:3532/?name=Ada` in one browser window.
3. Open `http://localhost:3532/?name=Bo` in a second browser window.
   Arrange the two windows side by side so both are visible.
4. Click into Ada's window and drive with `W`/`A`/`S`/`D`. Within well
   under a second, Bo's window shows the melted lane, Ada's cart moving,
   and Ada's cart on Bo's minimap (bottom-right).
5. Press `Enter` in Ada's window, type a message, press `Enter` again.
   It appears in the middle of both windows' screens.
6. Optionally open a third window at `http://localhost:3532/?name=Cam`
   while the first two are still playing. Cam spawns into the same orchard
   and all three see each other immediately.
7. To stop the server, go back to the terminal running `npm start` and
   press `Ctrl+C`.

## How sync works (why background windows still update)

Browsers throttle `requestAnimationFrame` in a hidden tab, so a render loop
alone would freeze a window's view of the world while it's in the
background. This build never relies on rAF for state:

- The server ticks on a plain `setInterval` (12.5 Hz, `server/index.js`),
  independent of any browser, and broadcasts frost-grid diffs and player
  positions on that timer.
- Each client sends its own position (and melts frost under itself while
  moving) on a `setInterval` (~15 Hz, `public/js/network.js`), not inside
  the render loop.
- Every incoming WebSocket message updates the shared `world` state
  object immediately, in the message handler. `requestAnimationFrame`
  only reads that state to draw the current frame.

The grid is a float field: `1` is frost, `0` is a dark melted lane. Driving
writes zeros; each server tick nudges melted cells back toward frost.

## What's simplified

- The cart, barn, barrels, and apple trees are primitive three.js meshes
  with procedurally generated canvas textures (no external image or model
  assets). Materials are PBR (wood, heater glow, dawn light).
- It is a stylized dawn orchard, not a photograph.
- Vehicle physics are simple arcade acceleration and steering.

## Project layout

```
server/
  index.js       HTTP + WebSocket on /ws, authoritative 80ms tick, port 3532
  gameState.js   Frost grid, player registry, chat log
public/
  index.html     Join screen, HUD, offline three.js import map
  style.css      Dawn orchard UI
  js/
    main.js      Renderer, input, cart physics, render loop
    network.js   WebSocket client, world-state sync on a timer
    world.js     Shared state (players, frost bytes, chat)
    terrain.js   Grass + frost sheet driven by the grid
    snowblower.js  Heated cart, tiller, pruning lamp, remote driver
    hotel.js     Cider barn and apple rows
    snowfx.js    Frost motes + heater steam
    minimap.js   Bottom-right minimap
    chat.js      Center-screen chat
    textures.js  Procedural grass, frost, bark, wood, signs
```
