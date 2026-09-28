// Night kitchen. Instrumental only: the fiddle carries the tune, nobody sings.
export const BPM = 100;
export const INTRO_BARS = 4;
export const OUTRO_BARS = 2;
export const DURATION = 150;
export const THEME = 'baker';
export const INTRO_CAPTION = '~ ovens humming ~';
export const TRANS = ['flour', 'steam', 'flour', 'door', 'sunburst', 'steam'];
export const OUTRO_WORDS = [
  { w: 'Ding!', beat: 0 },
  { w: 'Ding!', beat: 1 },
  { w: 'READY', beat: 2 },
];

const MINOR = [['Dm', 'Dm', 'C', 'C'], ['Dm', 'Dm', 'Am', 'Am'], ['F', 'F', 'C', 'C'], ['Gm', 'A', 'Dm', 'Dm']];
const LAND = [['F', 'F', 'C', 'C'], ['Bb', 'Bb', 'F', 'F'], ['Dm', 'Dm', 'C', 'C'], ['Bb', 'C', 'F', 'F']];
const MAJOR = [['D', 'D', 'A', 'A'], ['D', 'D', 'G', 'G'], ['Bm', 'Bm', 'A', 'A'], ['G', 'A', 'D', 'D']];

export const INTRO = {
  key: 'Dm',
  chords: [['Dm', 'Dm', 'C', 'C'], ['Dm', 'Dm', 'A', 'A']],
  tune: ['The ovens are warm and the street has gone still', 'A cat and a baker and flour on the sill'],
};

export const PARTS = [
  { name: 'Night Kitchen', key: 'Dm', style: 'verse', chords: MINOR, lines: [
    'Oh the baker came in when the street had gone blue',
    'A cat on the shelf stretched and knocked off a spoon',
    'He tied on his apron and opened the fire',
    'The oven woke up and the coals climbed higher',
  ] },
  { name: 'The Dough', key: 'Dm', style: 'chorus', chords: MINOR, lines: [
    'He folded the dough till it sighed in the bowl',
    'It stuck to his elbows and clung to his soul',
    'The cat batted flour across the dark floor',
    'A white little cloud rolled from window to door',
  ] },
  { name: 'The Rise', key: 'Dm', style: 'verse', chords: MINOR, lines: [
    'Then the loaf in the corner began a slow climb',
    'It rose past the shelf in a patient soft time',
    'The baker stepped back and the cat took a ride',
    'They both watched the bread as it bumped the lights high',
  ] },
  { name: 'The Cyclist', key: 'Dm', style: 'verse', chords: MINOR, lines: [
    'A bell in the alley cut through the warm room',
    'A lamp on the bars swept across the warm glass',
    'The baker held up one flour-dusted hand',
    'The cat pressed the glass and the bell rang again',
  ] },
  { name: 'The Bake', key: 'Dm', style: 'chorus', chords: MINOR, lines: [
    'He slid the fat loaves on the peel to the heat',
    'The door shut and hummed and the kitchen smelled sweet',
    'A drip from the tap kept the time with the song',
    'The cat fell asleep where the steam was strong',
  ] },
  { name: 'Golden', key: 'F', style: 'land', chords: LAND, lines: [
    'The door opened wide on a river of steam',
    'The loaves came out gold and they glowed in the gleam',
    'He stacked them in linen as high as his chest',
    'The cyclist came back and the basket was dressed',
  ] },
  { name: 'Dawn Delivery', key: 'D', style: 'finale', chords: MAJOR, lines: [
    'So out to the street with the sky turning grey',
    'The cat in the basket was carried away',
    'The baker stood waving the last of the night',
    'And the bread rose again in the first of the light',
  ] },
];
