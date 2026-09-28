// FROSTKEEL — dawn iceboats on a frozen lake. Original names only.
// Racers, classes, tracks, items. Item effects are applied in game.js via ITEM_FX.

const THEME = {
  kind: 'ice',
  banner: 'FROSTKEEL',
  dust: [0.78, 0.9, 1],
  ink: '#1a3348',
  map: '#d7eefe',
  mapEdge: '#163044',
  speedA: '#b9dcff',
  speedB: '#fff4d2',
  showroom: '#d5e6f2',
  disc: '#f4fbff',
  hemiSky: '#fff6ea',
  hemiGround: '#9eb4c6',
  sun: '#ffe6c4',
  who: 'SKIPPER',
  introHigh: 34,
  introDrop: 16,
  music: { bpm: 78, engine: 'triangle', engineBase: 42, engineMul: 1.15, vol: 0.03 },
};

const CHARACTERS = [
  { id: 'pim', name: 'Pim Rime', tag: 'Light hull, quick off the floe.',
    color: '#d7f1ff', accent: '#7eb6ff', skin: '#ffd9b3', hair: '#f2d2a8', style: 'spiky',
    stats: { speed: 3, accel: 5, handling: 4, weight: 1 } },
  { id: 'sera', name: 'Sera Glint', tag: 'Cuts a turn so clean the ice forgets her.',
    color: '#ffd0e4', accent: '#ffffff', skin: '#f2c29b', hair: '#4a3a6a', style: 'ponytail',
    stats: { speed: 3, accel: 4, handling: 5, weight: 2 } },
  { id: 'kite', name: 'Kite Squall', tag: 'Lives for the first wind off the lake.',
    color: '#9fd0ff', accent: '#1a4a78', skin: '#c98b5e', hair: '#ffffff', style: 'bun',
    stats: { speed: 4, accel: 4, handling: 3, weight: 2 } },
  { id: 'dash', name: 'Dash Whiteout', tag: 'Top speed across the pale. Brakes are a rumor.',
    color: '#ff7a4a', accent: '#1b2430', skin: '#e0ac7e', hair: '#222222', style: 'mohawk',
    stats: { speed: 5, accel: 3, handling: 2, weight: 3 } },
  { id: 'luma', name: 'Luma Auroral', tag: 'Reads the dawn the way others read a chart.',
    color: '#c9b6ff', accent: '#7dffa8', skin: '#8d5a3b', hair: '#7dffa8', style: 'bob',
    stats: { speed: 4, accel: 3, handling: 4, weight: 3 } },
  { id: 'rex', name: 'Rex Crevasse', tag: 'Knows which crack is a rumor and which one bites.',
    color: '#3ecf8e', accent: '#ffe9a0', skin: '#f0c090', hair: '#6a3a1a', style: 'flat',
    stats: { speed: 4, accel: 2, handling: 3, weight: 4 } },
  { id: 'bo', name: 'Big Bo Berg', tag: 'Heavy keel, heavy heart, heavy bumps.',
    color: '#3a78e6', accent: '#ff5a5a', skin: '#b87850', hair: '#111111', style: 'bald',
    stats: { speed: 5, accel: 2, handling: 2, weight: 5 } },
  { id: 'nils', name: 'Nils Drift', tag: 'Forty winters on the runners. Still not tired.',
    color: '#eef3f7', accent: '#1a4a6a', skin: '#f1c6a0', hair: '#f5f5f5', style: 'beard',
    stats: { speed: 3, accel: 3, handling: 4, weight: 4 } },
];

const CLASSES = [
  { id: 'drift', name: 'DRIFT', note: 'Easy — slower boats, relaxed rivals', speedMul: 0.82, aiSkill: 0.86 },
  { id: 'gale', name: 'GALE', note: 'Normal — the dawn circuit', speedMul: 1.00, aiSkill: 0.95 },
  { id: 'whiteout', name: 'WHITEOUT', note: 'Hard — top speed, sharp rivals', speedMul: 1.18, aiSkill: 1.02 },
];

const TRACKS = [
  {
    id: 'pale', name: 'OPEN PALE', subtitle: 'Wide dawn ice · almost no shore · three pressure ridges',
    conditions: 'OPEN ICE', halfWidth: 26, seed: 11,
    points: [[0,-270],[202,-284],[351,-189],[385,0],[310,162],[162,230],[27,149],[-81,216],
             [-243,256],[-364,135],[-354,-81],[-216,-230]],
    ramps: [0.22, 0.5, 0.78], crates: [0.12, 0.4, 0.68, 0.9],
    cracks: [0.18, 0.46, 0.74],
    wave: { amp: 0.1, speed: 0.35 },
    sky: { top: '#f6c7a4', bottom: '#f4f8fb', fog: '#e7eef5', sun: '#ffe6c4', near: 220, far: 1700, disc: true },
    ground: { deep: '#d5e4ee', crest: '#f7fbff', far: '#e7f1f8' },
    ribbon: 480,
    lights: { hemi: '#fff1e4', ground: '#b7c9d8', hemiI: 0.95, sun: '#ffe0b0', sunI: 1.2, sunPos: [700, 90, 180] },
    scatter: { count: 6, near: 70, far: 200, r0: 16, r1: 34, pad: 40 },
    markerEvery: 48, sway: 0.02, line: '#7f9eb4',
  },
  {
    id: 'holes', name: 'FISHING HOLE FIELD', subtitle: 'Dark holes in the white ice · steer the pale lanes',
    conditions: 'FISHING HOLES', halfWidth: 20, seed: 29,
    points: [[0,-240],[160,-250],[280,-150],[250,-20],[120,10],[90,100],[210,170],[190,280],
             [40,300],[-90,220],[-150,90],[-260,70],[-300,-50],[-220,-170],[-80,-230]],
    ramps: [0.2, 0.48, 0.76], crates: [0.08, 0.3, 0.55, 0.82],
    holes: [0.07, 0.15, 0.24, 0.33, 0.42, 0.51, 0.6, 0.69, 0.78, 0.88],
    cracks: [0.2, 0.58],
    wave: { amp: 0.08, speed: 0.4 },
    sky: { top: '#f3cbb0', bottom: '#eef5f8', fog: '#e4eef4', sun: '#fff0d4', near: 180, far: 1500, disc: true },
    ground: { deep: '#c5d8e6', crest: '#f7fbff', far: '#dceaf3' },
    ribbon: 220,
    lights: { hemi: '#fff4ea', ground: '#a9c0d0', hemiI: 0.9, sun: '#ffe6c2', sunI: 1.05, sunPos: [520, 120, -200] },
    scatter: { count: 3, near: 80, far: 180, r0: 12, r1: 22, pad: 20 },
    markerEvery: 40, sway: 0.02, line: '#6e90a8',
  },
  {
    id: 'lead', name: 'BLACK LEAD', subtitle: 'A narrowing ribbon of ice between black water',
    conditions: 'BLACK WATER', halfWidth: 14, seed: 41,
    points: [[0,-340],[200,-320],[320,-180],[280,-20],[120,40],[20,120],[160,200],[240,320],
             [20,360],[-180,300],[-320,140],[-280,-40],[-140,-200]],
    ramps: [0.16, 0.42, 0.72], crates: [0.1, 0.34, 0.6, 0.86],
    cracks: [0.08, 0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.9],
    wave: { amp: 0.07, speed: 0.3 },
    sky: { top: '#e7b89a', bottom: '#d5e2ea', fog: '#c5d5e0', sun: '#ffd8b0', near: 140, far: 1200, disc: true },
    ground: { deep: '#07131c', crest: '#f4fbff', far: '#050d14' },
    ribbon: 16,
    lights: { hemi: '#f0d8c8', ground: '#1a3040', hemiI: 0.72, sun: '#ffd0a8', sunI: 0.85, sunPos: [400, 70, 300] },
    scatter: { count: 2, near: 60, far: 140, r0: 10, r1: 18, pad: 10 },
    markerEvery: 36, sway: 0.015, line: '#9ec0d4',
  },
];

const ITEMS = {
  gust:    { name: 'GUST',        color: '#d7f1ff' },
  gale:    { name: 'TRIPLE GUST', color: '#7eb6ff' },
  harpoon: { name: 'HARPOON',     color: '#8aa0b0' },
  floe:    { name: 'ICE CHUNK',   color: '#d5e8f4' },
  parka:   { name: 'PARKA',       color: '#e8f4ff' },
  anchor:  { name: 'DRAG ANCHOR', color: '#1a3344' },
};

const ITEM_FX = {
  gust: 'boost', gale: 'boost3', harpoon: 'shot', floe: 'mine', parka: 'shield', anchor: 'drag',
};

const ITEM_ODDS = [
  { gust: 30, floe: 40, parka: 25, harpoon: 5 },
  { gust: 30, floe: 25, parka: 20, harpoon: 25 },
  { gust: 30, floe: 15, parka: 15, harpoon: 30, gale: 10 },
  { gust: 25, floe: 10, parka: 15, harpoon: 30, gale: 20 },
  { gust: 20, floe: 5,  parka: 10, harpoon: 30, gale: 30, anchor: 5 },
  { gust: 15, parka: 10, harpoon: 25, gale: 40, anchor: 10 },
  { gust: 10, parka: 5,  harpoon: 25, gale: 45, anchor: 15 },
  { gust: 5,  harpoon: 25, gale: 45, anchor: 25 },
];
