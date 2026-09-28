---
name: glass-mosaic-film
description: >-
  Make an 80-second WebGL2 film of one scene built from glass mosaic tiles.
  Figures break into tiles, fly, and form again. One HTML file, no libraries,
  no images. Use only when the user names this skill.
disable-model-invocation: true
---

# Glass mosaic film

Make an 80-second film of one place, told in glass tiles. The place and the figures are inputs. Do not default to a meadow or the four seasons.

## Contract

- One square mosaic panel with a dark border of colored tiles, like a Roman floor.
- The place changes across the 80 seconds (day to night, spring to winter, calm to storm). Background tile colors change with that arc.
- The figures the user names are made of tiles. Each figure breaks into loose tiles, the tiles travel, and they form again in a new place.
- Each tile is a small 3D piece with its own shine and shadow. Instanced draws fit this.
- WebGL2 in one HTML file. No libraries, no images, no audio files, no `script src`.

## Checks

- The film runs 80 seconds and the place changes in the order you promised.
- At least one figure breaks apart and reforms.
- The file has no `script src`, no `img`, and no media URL.

## Reference

Four Seasons in Glass, `builds/13-four-seasons-glass` in the variation set, is one instance: a meadow from spring to winter, bees, maple leaves, a deer, and snowflakes, about 25 KB of WebGL2. Read it for the tile instance and the season clock. Build the user's place.
