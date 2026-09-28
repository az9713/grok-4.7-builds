// Roller derby. Instrumental only: stomps, whistle, fiddle. No sung vocal.
export const BPM = 100;
export const INTRO_BARS = 4;
export const OUTRO_BARS = 2;
export const DURATION = 150;
export const THEME = 'derby';
export const INTRO_CAPTION = '~ skates on the bank ~';
export const TRANS = ['door', 'flash', 'flour', 'flash', 'sunburst', 'door'];
export const OUTRO_WORDS = [
  { w: 'Stomp!', beat: 0 },
  { w: 'Stomp!', beat: 1 },
  { w: 'HEY!', beat: 2 },
];

const MINOR = [['Dm', 'Dm', 'C', 'C'], ['Dm', 'Dm', 'Am', 'Am'], ['F', 'F', 'C', 'C'], ['Gm', 'A', 'Dm', 'Dm']];
const MAJOR = [['D', 'D', 'A', 'A'], ['D', 'D', 'G', 'G'], ['Bm', 'Bm', 'A', 'A'], ['G', 'A', 'D', 'D']];

export const INTRO = {
  key: 'Dm',
  chords: [['Dm', 'Dm', 'C', 'C'], ['Dm', 'Dm', 'A', 'A']],
  tune: ['The bank is still empty, the lights burning hot', 'A whistle, a helmet, a star on the spot'],
};

export const PARTS = [
  { name: 'The Bank', key: 'Dm', style: 'verse', chords: MINOR, lines: [
    'The banked wooden track in the yellow white light',
    'The referee walked it and measured it right',
    'A whistle on a cord and a line on the floor',
    'The house lights came down and the stomps hit the boards',
  ] },
  { name: 'Jammer', key: 'Dm', style: 'chorus', chords: MINOR, lines: [
    'The jammer came in with a star on the lid',
    'She crouched at the line with her eyes on the pack',
    'One push and the wheels sang a click and a clack',
    'The star caught the light every time she looked back',
  ] },
  { name: 'The Pack', key: 'Dm', style: 'jam', chords: MINOR, lines: [
    'Four blockers in front and they covered the lane',
    'They bumped hip to hip in a thundering chain',
    'The jammer stayed low where the gap might appear',
    'The referee lifted one hand in the air',
  ] },
  { name: 'Whistle', key: 'Dm', style: 'jam', chords: MINOR, lines: [
    'The whistle cut clean and the pack leapt ahead',
    'The stomps on the bank matched the push of the tread',
    'She found a small seam and she drove herself through',
    'The referee pivoted, watching the move',
  ] },
  { name: 'The Hit', key: 'Dm', style: 'jam', chords: MINOR, lines: [
    'A shoulder came in and the helmet let go',
    'It popped off her head in a glittering throw',
    'She stayed on her skates with her hair in the wind',
    'The house made a roar but the whistle stayed in',
  ] },
  { name: 'Flying Helmet', key: 'D', style: 'chorus', chords: MAJOR, lines: [
    'The helmet flew up through the lights in an arc',
    'It turned and it tumbled and left a bright mark',
    'She skated on under the bare yellow beams',
    'The star on the helmet still flashed in the stream',
  ] },
  { name: 'The Point', key: 'D', style: 'finale', chords: MAJOR, lines: [
    'She crossed on the star and the point was her own',
    'The whistle blew twice and the jam was called done',
    'The helmet came down in the referee hands',
    'Then stomps, then the whistle, then roar from the stands',
  ] },
];
