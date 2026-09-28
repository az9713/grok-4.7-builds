// Sunken submarine dirge. Instrumental only: low fiddle, no sung vocal, no animals.
export const BPM = 100;
export const INTRO_BARS = 4;
export const OUTRO_BARS = 2;
export const DURATION = 150;
export const THEME = 'sub';
export const INTRO_CAPTION = '~ hull groaning ~';
export const TRANS = ['ink', 'ink', 'steam', 'ink', 'ink', 'ink'];
export const OUTRO_WORDS = [
  { w: 'Drip.', beat: 0 },
  { w: 'Drip.', beat: 1 },
  { w: 'HOLD', beat: 2 },
];

const DIRGE = [['Dm', 'Dm', 'C', 'C'], ['Dm', 'Dm', 'Am', 'Am'], ['F', 'F', 'C', 'C'], ['Gm', 'A', 'Dm', 'Dm']];

export const INTRO = {
  key: 'Dm',
  chords: [['Dm', 'Dm', 'C', 'C'], ['Dm', 'Dm', 'A', 'A']],
  tune: ['Down in the iron where the daylight is gone', 'A captain, a gauge, and a drip dragging on'],
};

export const PARTS = [
  { name: 'The Dive', key: 'Dm', style: 'dirge', chords: DIRGE, lines: [
    'Down went the iron and the light fell away',
    'No harbour remains, only pressure and grey',
    'The captain stood braced at the wheel in the red',
    'And counted the fathoms that gathered ahead',
  ] },
  { name: 'The Captain', key: 'Dm', style: 'dirge', chords: DIRGE, lines: [
    'His coat was still buttoned, his cap sitting straight',
    'He did not look up and he would not look late',
    'The lamps in the cabin burned small and burned thin',
    'He set one more mark on the chart with a pin',
  ] },
  { name: 'The Gauge', key: 'Dm', style: 'dirge', chords: DIRGE, lines: [
    'The gauge on the bulkhead was dripping and slow',
    'The needle climbed up and it would not let go',
    'A drop found the glass and it ran to the rim',
    'He watched it and waited and tightened his grip',
  ] },
  { name: 'The Seam', key: 'Dm', style: 'dirge', chords: DIRGE, lines: [
    'A seam in the plating began a thin weep',
    'The water traced down in a shivering streak',
    'He laid his bare palm where the iron was cold',
    'And stayed with his hand on the shivering hold',
  ] },
  { name: 'Paper Boat', key: 'Dm', style: 'dirge', chords: DIRGE, lines: [
    'Then out past the porthole a small paper boat',
    'It climbed through the black with no crew and no note',
    'The captain watched quiet and let the boat go',
    'It rose toward a glimmer he would not follow',
  ] },
  { name: 'The Dirge', key: 'Dm', style: 'dirge', chords: DIRGE, lines: [
    'So hold her steady, the gauges all lied',
    'The drip kept the tempo, the fiddle went low',
    'The paper boat faded to one speck of glow',
    'He took off his cap and he held it below',
  ] },
  { name: 'Stay Down', key: 'Dm', style: 'dirge', chords: DIRGE, lines: [
    'The boat found the silver and slipped out of view',
    'The iron stayed under, the captain stayed too',
    'No creature went past and no dawn broke the glass',
    'Just one drip, then silence, then iron, then last',
  ] },
];
