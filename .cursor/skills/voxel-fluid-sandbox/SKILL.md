---
name: voxel-fluid-sandbox
description: >-
  Build a browser voxel sandbox the player can mine and build in, with a hotbar,
  two fluids that flow and react, a timed world event, heavy shading, and a
  full day-night cycle. Use only when the user names this skill.
disable-model-invocation: true
---

# Voxel fluid sandbox

Build a voxel world in the browser. The biome, the two fluids, and their reaction are inputs. Do not default to a volcano, lava, or obsidian.

## Contract

- Walk, mine, and place. A hotbar of block types sits at bottom center.
- Two fluids flow cell by cell. When they touch, a named reaction replaces one of them (lava into water becomes obsidian, water into loose soil becomes mud, and so on). The reaction is a block update, not a scripted animation.
- One timed world event changes the terrain (an eruption, a tide, a cave-in) and then the fluids keep flowing under the same rules.
- Heavy shading: reflective liquid, soft shadows, sun rays, bloom, and a glow from the hot or magical fluid.
- A full day-night cycle with sunset, moon, and stars. Emissive blocks stay bright at night.
- Dress the biome so it reads at a glance (beaches, trees, weather, sky color).

## Stack

One `index.html`. Three.js is enough. A seeded height field plus a block array matches the reference. Serve over HTTP.

## Checks

- Place one fluid against the other. The reaction block appears.
- Wait through a day. The sun sets, the night sky shows, and the emissive fluid still glows.
- The timed event fires, and fluid created by it still obeys the flow rules.

## Reference

The Volcano Test, `builds/06-volcano-test` in the variation set, is one instance: a volcanic island, water and lava, obsidian on contact, eruptions on a timer, Three.js 0.160. Read it for the block update and the day length. Build the user's biome and reaction.
