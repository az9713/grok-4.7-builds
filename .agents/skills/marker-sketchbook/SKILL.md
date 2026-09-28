---
name: marker-sketchbook
description: >-
  Turn a folder of photos into a flip-through sketchbook: each photo redrawn
  as flat acrylic-marker art, a corner print of the original, a handwritten
  caption, and a page curl. Use only when the user names this skill.
disable-model-invocation: true
---

# Marker sketchbook

Bind a set of photos into an open sketchbook. The photos are the input. Do not default to a Japan rail trip.

## Needs

A `photos/` folder of JPGs, about 10 to 20. The file name is the caption (`kyoto-station.jpg` becomes the caption). If the folder is missing, ask for it. Do not invent the trip.

## Contract

- Read every image. Redraw each one as a flat, bright acrylic-marker illustration: opaque fills and short visible strokes for grass, trees, and flowers. People in the photos are redrawn too, and they stay recognizable.
- Draw with canvas code. Do not call an image model. A filter on the photograph is not a drawing. Small figures have to survive the marks. If a person is a few pixels tall, simplify them into a readable marker figure instead of losing them in texture.
- One drawing fills a two-page spread. The original photo sits as a small print in the bottom-right corner.
- A small handwritten caption under the drawing, taken from the file name.
- Page curl on mouse drag and on the arrow keys.
- All JavaScript. A build step may embed the photos as data URIs so the page opens with no network. The drawings themselves are still canvas code.

## Checks

- Every photo has one spread and one corner print.
- Drag and the arrow keys both curl the page.
- You can still tell who is in the photo and where it was taken.

## Reference

A Japan Rail Sketchbook, `builds/14-japan-rail-sketchbook` in the variation set, is one instance: `template.html`, ten JPGs, `build.js` embedding them into `index.html`. A distant walker on the Arashiyama page disappears into the marker treatment. Read `template.html` for the curl and the spread. Draw the user's photos, and keep the small figures.
