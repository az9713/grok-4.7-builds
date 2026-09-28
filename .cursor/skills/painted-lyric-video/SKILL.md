---
name: painted-lyric-video
description: >-
  Make a painted 2.5-minute lyric video: p5.js and p5.brush, one visual joke
  per lyric line, karaoke captions, parallel scene files, then headless Chrome
  frames encoded to MP4 with ffmpeg. Use only when the user names this skill.
disable-model-invocation: true
---

# Painted lyric video

Make a music video of about 2.5 minutes in flat painted cartoons. The song, the characters, and the story are inputs. Do not default to a sea shanty or to the Clawd character.

## Inputs

- Song: either an audio file plus lyrics, or a request to compose the track in code
- Characters, described once so every scene draws them the same way
- Story in one sentence

If the user wants singing, they must supply a vocal or a singing tool. A synthesized arrangement has no sung voice.

## Shape

```
studio.html          p5.js + p5.brush stage, 1280×720
lib.js               shared brushes, characters, karaoke bar
scenes/partN.js      one file per song section
STORYBOARD.md        one visual joke per lyric line
ANIMATION_GUIDE.md   how to draw each character, colors, camera
assets/timing.js     word times for the karaoke highlight
render.mjs           headless Chrome frames, then ffmpeg to MP4
```

Paint with p5.js and p5.brush. Soft paper texture, flat shapes, visible brush strokes. Comic sound words in big yellow letters when the lyric calls for a hit. Karaoke sits in a dark bar at the bottom. The current words turn yellow on the word times.

Write the storyboard and the animation guide before the scenes. Split the song into parts and write the part files so they can be built separately, then join them with transitions. The picture stays locked to the audio.

## Render

`render.mjs` grabs frames from `studio.html` in headless Chrome and encodes with ffmpeg. Needs Node, Chrome, and ffmpeg. Ship a watchable MP4. A full-quality master can be large. A 1280×720 viewing copy is fine if you say so.

## Checks

- The MP4 is about 2.5 minutes and the picture stays in time with the music.
- Karaoke words turn yellow on the sung or played words.
- Each lyric line has its own visual joke. Characters match the guide in every part.

## Reference

Clawd Goes to Sea, `builds/02-clawd-goes-to-sea` in the variation set, is one instance: seven part files, an orange block character plus a scientist, a code-composed shanty with no vocal, and a 24.7 MB 1280×720 MP4. The pipeline matches the painted-lyric renderer. Read those for the render loop and the brush stage. Use the user's song and characters.
