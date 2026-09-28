---
name: procedural-blender-scene
description: >-
  Build a Blender scene with procedural geometry and materials only, a gray-clay
  screenshot after each step, a build time-lapse, and a titled hero shot.
  Use only when the user names this skill.
disable-model-invocation: true
---

# Procedural Blender scene

Build one environment in Blender and render a short hero shot. The place, the time of day, and the title text are inputs. Do not default to a lighthouse or a storm.

## Rules

- Procedural geometry and materials only. Import no models, no image textures, and no linked libraries. The `.blend` should contain no external assets.
- Build in visible steps. After each step, save a viewport screenshot in gray clay shading. Put a small "Opus 5.5" badge at top center of those frames unless the user names a different badge.
- Join the clay frames into a time-lapse.
- End on a hero shot: the finished place, a motivated light event (lightning, fireworks, a beacon, a sunrise), and a serif title over the picture like a studio card.
- Render the final animation.

## Needs

Blender on the machine. The reference used Blender 5.2, `blender -b -P build_scene.py`, then a second background render. If Blender is missing, stop and say so. Do not fake the frames.

Ask for the title text only if the user cares what it says. Otherwise choose a short serif title that fits the place.

## Checks

- A clay time-lapse and a final render both exist.
- Open the blend (or inspect the script) and confirm nothing is linked or imported.
- The hero title is readable over the shot.

## Reference

Storm Lighthouse, `builds/07-storm-lighthouse` in the variation set, is one instance: a cliff lighthouse, a turning beam, waves, rain, lightning, a keeper's house, `build_scene.py`, and a 12.5 s MP4. The `.blend` and frame folder are not in the repo. The clay shots in `screenshots/` show the step order. Read the script for how steps are recorded. Build the user's place.
