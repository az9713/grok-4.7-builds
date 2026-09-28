---
name: interactive-focus-lab
description: >-
  Build a browser lab that shows how one optical instrument focuses: a cutaway
  on a bench, a dragging control that moves the optics, a glowing plane of
  sharp focus through a tabletop diorama, aperture steps, an exploded view,
  and short teaching text with named textbook values. Use only when the user
  names this skill.
disable-model-invocation: true
---

# Interactive focus lab

Build a single-page 3D lab that teaches focus for an instrument the user names. The instrument, the diorama, and the defects are inputs. Do not default to a human eye.

## Inputs

Use what the user already gave. Ask only if a choice would change the optics:

- Instrument (eye, camera lens, microscope, telescope, or another real system)
- Three subject distances, near to far, staged as a tabletop diorama
- Which defects or settings to include

## Contract

- Near-photoreal 3D, dark lab, instrument cut in half on an optical bench. Glass edges glow. Framed diagrams of that instrument hang on the back wall.
- One drag control moves the real focusing element (ciliary muscle, focus ring, drawtube). The element visibly changes, and a glowing plane of sharp focus slides through the diorama. Everything off the plane is blurred.
- Film-strip presets for the three distances.
- Three aperture or pupil sizes. The widest gives the thinnest sharp zone.
- Toggle between assembled and exploded views. Name every separated part.
- At least one defect that blurs a far or near subject, and a correction that restores it.
- Show a real optical consequence of the instrument (a camera inverts the image, an eye forms an upside-down retinal image, a microscope magnifies a slide).
- A small console lists keyboard shortcuts for the same controls.
- Short teaching copy. Every number is a standard textbook value, and the text names the source (for an eye, Gullstrand schematic eye No. 1 unless you cite another).

## Stack

One `index.html`. Three.js from a CDN import map is enough. No build step. Load it through a local server, not `file://`.

## Checks

- Dragging thickens or shifts the focusing element and moves the sharp plane nearer or farther, in the direction the textbook predicts.
- The widest aperture has a thinner sharp zone than the narrowest.
- The defect blurs the subject it should blur. The correction makes that subject sharp.
- Exploded view shows the named parts. Presets jump to the three distances.

## Reference

Eye Lab, `builds/01-eye-lab` in the variation set, is one instance: a half eye, ciliary drag, book / window / tree presets, pupils of 2 mm, 4 mm, and 8 mm, myopia, hyperopia, presbyopia, and an inverted retina. Read it for layout and the optics panel. Build the user's instrument.
