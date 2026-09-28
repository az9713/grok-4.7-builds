---
name: one-prompt-title-sequence
description: >-
  Make a 15-second film title sequence in one pass. Invent the graphic system.
  Do not take a shot list from the user or from the reference. Use only when
  the user names this skill.
disable-model-invocation: true
---

# One-prompt title sequence

Make a 15-second title sequence as a film title designer. The film title is the only input. If the user did not name a title, invent one and use it.

## Rules

- One pass. Do not art-direct yourself with a second round of notes unless the user asks for a change.
- Invent the graphic system: type, color, motion, and sound. Do not copy a palette, a viewfinder frame, or a shot list from the reference or from memory of a showreel.
- The sequence runs 15 seconds, then stops or loops cleanly. It has sound, generated in the page.
- One HTML file. It plays in a browser.

The original method was a single sentence to a model on max effort: "Make a 15-second title sequence like you're a film title designer and go all out." The look was the model's, not the prompt's. Match that freedom. Do not add the look to the task.

## Checks

- A timer or the animation ends at 15 seconds.
- The title is readable.
- Sound plays.
- You did not revise the piece except to fix a broken playback.

## Reference

Meridian, `builds/04-title-sequence` in the variation set, is one instance, and it missed the original method: it was not made at max effort, and it settled on a look. Do not reproduce that look. Use the file only to see a self-contained page that plays for 15 seconds.
