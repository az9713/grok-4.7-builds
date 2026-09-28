---
name: sketch-to-rigid-body
description: >-
  Turn a pencil sketch into a 3D rigid-body simulation: the drawing sits on a
  desk, lines lift off the paper, then become solid parts whose collapse comes
  from physics. Use only when the user names this skill.
disable-model-invocation: true
---

# Sketch to rigid body

Turn one pencil sketch into a working 3D model. The sketch is the input. Do not default to an arch bridge.

## Needs

A photo of the sketch, or a sketch the user asks you to draw first. Read the drawing before you model. Keep its proportions.

## Contract

- Show the sketch on paper on a wooden desk, in soft daylight, with a pencil and an eraser on the sheet.
- Lift the lines off the paper into a 3D line model, then turn those lines into solid parts with materials that match the drawing (stone, wood, metal).
- Every structural part is a rigid body. Joints, contacts, and gravity decide whether it stands.
- A driven prop uses the structure (a cart, a weight, a projectile). Draw its path.
- Sliders for the parameters that should change the outcome (mass, a key dimension, friction).
- One control that removes a part the structure needs. The fall is not keyframed. If the structure stays up, the constraints are wrong. Fix the contacts and masses and run it again.
- Orbit the camera.

## Stack

Three.js plus a rigid-body engine. The reference uses `cannon-es` and bundles with esbuild to `bundle.js`. A self-test that steps the solver without a browser is worth having for the collapse case.

## Checks

- Lines leave the paper, then become solid.
- At the default slider values, the driven prop completes its action and the structure holds.
- After the key part is removed, the structure falls from the solver. A partial drop that leaves the span standing is a failed check.

## Reference

Arch Bridge, `builds/11-arch-bridge` in the variation set, is one instance: `sketch/arch-bridge.jpg`, a cart, sliders for mass, rise, and friction, and a keystone button. Removing the keystone dropped only the crown. The haunches and deck stayed up. Read `src/arch.js` for the lift and the bodies. Do not copy that constraint bug. Build the user's sketch.
