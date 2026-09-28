---
name: coded-pattern-film
description: >-
  Make a short film entirely in code: a montage of science or nature patterns,
  flat vector scenes, one small character that links them, and a soundtrack
  synthesized in the page until the instruments sound acoustic. Use only when
  the user names this skill.
disable-model-invocation: true
---

# Coded pattern film

Make a short film in one HTML file. No framework, no editor timeline, no image or audio files. The theme and the linking character are inputs. Do not default to weather or a paper boat.

## Contract

- A montage. Each scene shows one pattern, with its own background color. Flat vector shapes, soft gradients, clean edges.
- One small character appears in every scene and is the only continuity.
- The user names the scenes. If they do not, pick five to seven patterns that belong to one theme, each with a visible rule (symmetry, branching, a spiral, overlapping waves).
- Write the score in the page with the Web Audio API. Name the instruments. If a first pass sounds like beeps, rework the voicing, envelopes, and articulation until a listen sounds like those instruments. Do not ship on an unlistened render.

## Checks

- Every promised scene plays, in order, with the linking character in each one.
- View source: no framework, no media URLs.
- You have listened. The named instruments read as those instruments.

## Reference

Small Weather, `builds/03-water-weather-code` in the variation set, is one instance: a paper boat through a snowflake, rain ripples, a rainbow in a raindrop, branching lightning, a hurricane spiral, and a meandering river, scored for piano and cello. That score was not reviewed by ear. Read the file for scene structure. Build the user's theme, and listen before you finish.
