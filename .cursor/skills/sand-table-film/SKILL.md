---
name: sand-table-film
description: >-
  Make a two-minute sand-table film: dark sand silhouettes on a backlit sepia
  table, year labels, wind-blown scene changes, and a soundtrack composed in
  the page with no audio files. Use only when the user names this skill.
disable-model-invocation: true
---

# Sand-table film

Make a two-minute historical film that looks like sand on a light table. The span of history and the scenes are inputs. Do not default to the Silk Road.

## Contract

- Dark sand silhouettes on a warm, backlit sepia table. Fine grain over the whole frame.
- Each scene has a serif year and a short subtitle in the top-left. Years run in ascending order across the film.
- Between scenes, sand blows away sideways in streaks, then the next scene forms out of the sand.
- Cover the span the user asked for. If they name places or events, those are the scenes. Otherwise pick a handful of scenes that a viewer can tell apart as silhouettes.
- Soundtrack composed and rendered in code. No audio files. If you quote existing tunes, use public-domain ones and name them in a comment. Listen before you finish.

One HTML file. Canvas silhouettes plus the Web Audio API are enough.

## Checks

- The film runs 2:00. The years increase.
- The folder has no audio file, and music plays.
- You listened to the score.

Finish in one pass unless playback is broken. The reference was resumed once, which missed its own "one prompt, no edits" check. A broken clock or a silent score is a reason to fix. A taste note is not, unless the user asks.

## Reference

Silk Road in Sand, `builds/15-silk-road-sand` in the variation set, is one instance: 130 BCE to 1453 CE, scenes as canvas functions (`scene0` through `scene6`), Web Audio, no audio file. The music was not reviewed by ear. Read it for the sand clear, the blow transition, and the year label. Build the user's history, and listen.
