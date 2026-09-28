// ROLLCALL — office-chair race in a carpeted convention center. Original names only.
// Racers, classes, tracks, items. Item effects are applied in game.js via ITEM_FX.

const THEME = {
  kind: 'office',
  banner: 'ROLLCALL',
  dust: [0.95, 0.92, 0.86],
  ink: '#243044',
  map: '#f2c14e',
  mapEdge: '#243044',
  speedA: '#ffe14a',
  speedB: '#ff6b3d',
  showroom: '#d4cec2',
  disc: '#6e6256',
  hemiSky: '#f7f7ff',
  hemiGround: '#8a8175',
  sun: '#ffffff',
  who: 'COWORKER',
  introHigh: 16,
  introDrop: 6,
  music: { bpm: 104, engine: 'square', engineBase: 90, engineMul: 2.2, vol: 0.028 },
};

const CHARACTERS = [
  { id: 'pip', name: 'Pip Badge', tag: 'Intern. Twitchy casters. First out of the booth.',
    color: '#ffd23f', accent: '#243044', skin: '#ffd9b3', hair: '#ff8c1a', style: 'spiky',
    stats: { speed: 3, accel: 5, handling: 4, weight: 1 } },
  { id: 'mara', name: 'Mara Staple', tag: 'Threads the aisle gaps like a collated report.',
    color: '#ff6b9a', accent: '#ffffff', skin: '#f2c29b', hair: '#5a2a88', style: 'ponytail',
    stats: { speed: 3, accel: 4, handling: 5, weight: 2 } },
  { id: 'kiki', name: 'Kiki Inbox', tag: 'Lives in the fluorescent hum and likes it.',
    color: '#7d8cff', accent: '#1a2340', skin: '#c98b5e', hair: '#ffffff', style: 'bun',
    stats: { speed: 4, accel: 4, handling: 3, weight: 2 } },
  { id: 'dash', name: 'Dash Deadline', tag: 'Top speed down the hall. Brakes are a rumor.',
    color: '#ff5a1f', accent: '#1b1b1b', skin: '#e0ac7e', hair: '#222222', style: 'mohawk',
    stats: { speed: 5, accel: 3, handling: 2, weight: 3 } },
  { id: 'luma', name: 'Luma Keycard', tag: 'Knows which doors are props and which ones open.',
    color: '#b07cff', accent: '#7dffa8', skin: '#8d5a3b', hair: '#7dffa8', style: 'bob',
    stats: { speed: 4, accel: 3, handling: 4, weight: 3 } },
  { id: 'rex', name: 'Rex Docket', tag: 'Former facilities. Still takes the loading line.',
    color: '#3dce8a', accent: '#ffe600', skin: '#f0c090', hair: '#6a3a1a', style: 'flat',
    stats: { speed: 4, accel: 2, handling: 3, weight: 4 } },
  { id: 'bo', name: 'Bo Briefcase', tag: 'Heavy chair, heavy briefcase, heavy bumps.',
    color: '#3a6fe0', accent: '#ff5a5a', skin: '#b87850', hair: '#111111', style: 'bald',
    stats: { speed: 5, accel: 2, handling: 2, weight: 5 } },
  { id: 'norm', name: 'Norm Ledger', tag: 'Forty years of carpet. Still not tired.',
    color: '#e6e2da', accent: '#243044', skin: '#f1c6a0', hair: '#f5f5f5', style: 'beard',
    stats: { speed: 3, accel: 3, handling: 4, weight: 4 } },
];

const CLASSES = [
  { id: 'intern', name: 'INTERN', note: 'Easy — slower chairs, relaxed rivals', speedMul: 0.82, aiSkill: 0.86 },
  { id: 'staff', name: 'STAFF', note: 'Normal — the convention circuit', speedMul: 1.00, aiSkill: 0.95 },
  { id: 'director', name: 'DIRECTOR', note: 'Hard — top speed, sharp rivals', speedMul: 1.18, aiSkill: 1.02 },
];

const TRACKS = [
  {
    id: 'hall', name: 'EXHIBIT HALL LOOP', subtitle: 'Carpet aisles · booth walls · fluorescent noon',
    conditions: 'EXHIBIT HALL', halfWidth: 16, seed: 11, dress: 'booth',
    points: [[-200,0],[-210,150],[-140,260],[0,285],[120,230],[170,120],[110,20],[160,-60],
             [190,-180],[100,-270],[-60,-262],[-170,-160]],
    ramps: [0.24, 0.52, 0.80], crates: [0.10, 0.38, 0.66, 0.90],
    wave: { amp: 0.012, speed: 0.2 },
    sky: { top: '#e6e4de', bottom: '#d4cfc6', fog: '#cfc8bc', sun: '#f7f7ff', near: 80, far: 640, disc: false },
    ground: { deep: '#5c534a', crest: '#c4b49a', far: '#6a5f56' },
    ribbon: 22,
    lights: { hemi: '#f4f6fb', ground: '#8a8175', hemiI: 0.85, sun: '#ffffff', sunI: 0.45, sunPos: [0, 380, 40] },
    scatter: { count: 22, near: 5, far: 28, r0: 5, r1: 9, pad: 16 },
    markerEvery: 12, sway: 0, line: '#f0d36a',
  },
  {
    id: 'escalator', name: 'ESCALATOR SWITCHBACK', subtitle: 'Moving stairs · mezzanine turns · tight landings',
    conditions: 'ESCALATORS', halfWidth: 14, seed: 23, dress: 'escalator',
    points: [[-260,0],[-250,180],[-160,300],[-40,262],[-20,140],[80,120],[150,240],[270,220],
             [300,60],[230,-80],[110,-120],[90,-240],[70,-310],[-40,-300],[-180,-260]],
    ramps: [0.17, 0.47, 0.74], crates: [0.07, 0.31, 0.58, 0.87],
    wave: { amp: 0.012, speed: 0.2 },
    sky: { top: '#e0e4ea', bottom: '#c8ced6', fog: '#c5ccd4', sun: '#f7f7ff', near: 70, far: 600, disc: false },
    ground: { deep: '#4e5966', crest: '#c9c3b4', far: '#5c656f' },
    ribbon: 18,
    lights: { hemi: '#f7f8fc', ground: '#7e8792', hemiI: 0.9, sun: '#ffffff', sunI: 0.5, sunPos: [40, 400, 0] },
    scatter: { count: 16, near: 4, far: 22, r0: 4, r1: 8, pad: 10 },
    markerEvery: 10, sway: 0, line: '#ffe14a',
  },
  {
    id: 'dock', name: 'LOADING DOCK RUN', subtitle: 'Pallets · roll-up doors · a long indoor straight',
    conditions: 'LOADING DOCK', halfWidth: 18, seed: 37, dress: 'dock',
    points: [[-120,-300],[-160,-100],[-150,100],[-170,300],[-60,380],[40,330],[40,160],[90,60],
             [160,150],[190,330],[300,300],[310,80],[280,-150],[200,-330],[40,-380]],
    ramps: [0.12, 0.44, 0.70], crates: [0.05, 0.28, 0.56, 0.84],
    wave: { amp: 0.015, speed: 0.25 },
    sky: { top: '#d9d5cc', bottom: '#c2bbb0', fog: '#b7b1a6', sun: '#f4f1ea', near: 90, far: 700, disc: false },
    ground: { deep: '#6a6258', crest: '#d2c6ae', far: '#746c62' },
    ribbon: 24,
    lights: { hemi: '#f3f1ea', ground: '#8a8174', hemiI: 0.8, sun: '#fff8ee', sunI: 0.4, sunPos: [80, 360, -40] },
    scatter: { count: 20, near: 6, far: 32, r0: 4, r1: 8, pad: 18 },
    markerEvery: 14, sway: 0, line: '#e6b84a',
  },
];

const ITEMS = {
  coffee:   { name: 'COFFEE SPILL', color: '#6b3a22' },
  espresso: { name: 'TRIPLE SHOT',  color: '#3a2418' },
  plane:    { name: 'PAPER PLANE',  color: '#f4f1ea' },
  toner:    { name: 'TONER SLICK',  color: '#2a2e34' },
  badge:    { name: 'BADGE',        color: '#ffe14a' },
  lanyard:  { name: 'LANYARD STACK', color: '#ff5a1f' },
};

const ITEM_FX = {
  coffee: 'boost', espresso: 'boost3', plane: 'shot', toner: 'mine', badge: 'shield', lanyard: 'drag',
};

const ITEM_ODDS = [
  { coffee: 30, toner: 40, badge: 25, plane: 5 },
  { coffee: 30, toner: 25, badge: 20, plane: 25 },
  { coffee: 30, toner: 15, badge: 15, plane: 30, espresso: 10 },
  { coffee: 25, toner: 10, badge: 15, plane: 30, espresso: 20 },
  { coffee: 20, toner: 5,  badge: 10, plane: 30, espresso: 30, lanyard: 5 },
  { coffee: 15, badge: 10, plane: 25, espresso: 40, lanyard: 10 },
  { coffee: 10, badge: 5,  plane: 25, espresso: 45, lanyard: 15 },
  { coffee: 5,  plane: 25, espresso: 45, lanyard: 25 },
];
