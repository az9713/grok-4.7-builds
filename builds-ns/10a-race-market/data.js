// STALLSHIFT — night-market delivery bicycles. Original names only.
// Racers, classes, tracks, items. Item effects are applied in game.js via ITEM_FX.

const THEME = {
  kind: 'market',
  banner: 'STALLSHIFT',
  dust: [1, 0.7, 0.38],
  ink: '#2a120c',
  map: '#ffb020',
  mapEdge: '#2a120c',
  speedA: '#ffd56a',
  speedB: '#ff4d6a',
  showroom: '#140c12',
  disc: '#3a2418',
  hemiSky: '#ffc48a',
  hemiGround: '#2a140c',
  sun: '#ffcc88',
  who: 'RIDER',
  introHigh: 52,
  introDrop: 24,
  music: { bpm: 96, engine: 'sawtooth', engineBase: 78, engineMul: 3.1, vol: 0.04 },
};

const CHARACTERS = [
  { id: 'nori', name: 'Nori Bell', tag: 'Tiny bell, twitchy pedals, first out of the alley.',
    color: '#ffcc33', accent: '#ff7a00', skin: '#ffd9b3', hair: '#ff8c1a', style: 'spiky',
    stats: { speed: 3, accel: 5, handling: 4, weight: 1 } },
  { id: 'mei', name: 'Mei Skewer', tag: 'Threads the stall gaps like she is sewing.',
    color: '#ff4f8b', accent: '#ffe08a', skin: '#f2c29b', hair: '#7a2bff', style: 'ponytail',
    stats: { speed: 3, accel: 4, handling: 5, weight: 2 } },
  { id: 'kite', name: 'Kite Lantern', tag: 'Rides the steam and the string lights.',
    color: '#3ad6ff', accent: '#ff5a3c', skin: '#c98b5e', hair: '#ffffff', style: 'bun',
    stats: { speed: 4, accel: 4, handling: 3, weight: 2 } },
  { id: 'chili', name: 'Dash Chili', tag: 'Top gear down the noodle straight. Brakes are a rumor.',
    color: '#ff5a1f', accent: '#1b1b1b', skin: '#e0ac7e', hair: '#222222', style: 'mohawk',
    stats: { speed: 5, accel: 3, handling: 2, weight: 3 } },
  { id: 'bao', name: 'Luma Bao', tag: 'Night-shift steamer. Knows every shortcut behind the woks.',
    color: '#b07cff', accent: '#ffd56a', skin: '#8d5a3b', hair: '#ffd56a', style: 'bob',
    stats: { speed: 4, accel: 3, handling: 4, weight: 3 } },
  { id: 'wok', name: 'Rex Wok', tag: 'Former stall cook. Still takes the hot line.',
    color: '#3dce57', accent: '#ffe600', skin: '#f0c090', hair: '#c46a1b', style: 'flat',
    stats: { speed: 4, accel: 2, handling: 3, weight: 4 } },
  { id: 'crate', name: 'Big Bo Crate', tag: 'Heavy basket, heavy bumps, heavier heart.',
    color: '#2f6bff', accent: '#ff3b3b', skin: '#b87850', hair: '#111111', style: 'bald',
    stats: { speed: 5, accel: 2, handling: 2, weight: 5 } },
  { id: 'salt', name: 'Auntie Salt', tag: 'Forty years of night deliveries. Still not tired.',
    color: '#e8e8e8', accent: '#c23b4a', skin: '#f1c6a0', hair: '#f5f5f5', style: 'beard',
    stats: { speed: 3, accel: 3, handling: 4, weight: 4 } },
];

const CLASSES = [
  { id: 'stroll', name: 'STROLL', note: 'Easy — slower bikes, relaxed rivals', speedMul: 0.82, aiSkill: 0.86 },
  { id: 'rush', name: 'RUSH', note: 'Normal — the night-market circuit', speedMul: 1.00, aiSkill: 0.95 },
  { id: 'blitz', name: 'BLITZ', note: 'Hard — top speed, sharp rivals', speedMul: 1.18, aiSkill: 1.02 },
];

const TRACKS = [
  {
    id: 'lantern', name: 'LANTERN ALLEY LOOP', subtitle: 'Night stalls · string lights · three loading ramps',
    conditions: 'DENSE STALLS', halfWidth: 16, seed: 11,
    points: [[0,-200],[150,-210],[260,-140],[285,0],[230,120],[120,170],[20,110],[-60,160],
             [-180,190],[-270,100],[-262,-60],[-160,-170]],
    ramps: [0.24, 0.52, 0.80], crates: [0.10, 0.38, 0.66, 0.90],
    wave: { amp: 0.045, speed: 0.6 },
    sky: { top: '#070814', bottom: '#2a1848', fog: '#140c22', sun: '#f4f0d8', near: 70, far: 860, disc: true },
    ground: { deep: '#121018', crest: '#e8a05a', far: '#0a0810' },
    ribbon: 24,
    lights: { hemi: '#6a78c8', ground: '#3a2018', hemiI: 0.48, sun: '#c9d6ff', sunI: 0.38, sunPos: [180, 520, -80] },
    scatter: { count: 26, near: 5, far: 30, r0: 5, r1: 9, pad: 16 },
    markerEvery: 11, sway: 0.1, line: '#ffd15a',
  },
  {
    id: 'noodle', name: 'NOODLE CANYON RUN', subtitle: 'Steam alleys · stacked crates · tight esses',
    conditions: 'STEAM ALLEYS', halfWidth: 14, seed: 23,
    points: [[0,-260],[180,-250],[300,-160],[262,-40],[140,-20],[120,80],[240,150],[220,270],
             [60,300],[-80,230],[-120,110],[-240,90],[-310,-40],[-260,-180],[-130,-250]],
    ramps: [0.17, 0.47, 0.74], crates: [0.07, 0.31, 0.58, 0.87],
    wave: { amp: 0.05, speed: 0.8 },
    sky: { top: '#0a0618', bottom: '#3a1840', fog: '#1a0c18', sun: '#ffd8a8', near: 60, far: 780, disc: true },
    ground: { deep: '#140e16', crest: '#ffb060', far: '#0c0810' },
    ribbon: 20,
    lights: { hemi: '#7a6888', ground: '#4a2418', hemiI: 0.5, sun: '#d0dcff', sunI: 0.32, sunPos: [-200, 480, 120] },
    scatter: { count: 30, near: 4, far: 24, r0: 4.5, r1: 8, pad: 12 },
    markerEvery: 9, sway: 0.12, line: '#ffcf70',
  },
  {
    id: 'midnight', name: 'MIDNIGHT DOCK STRAIGHT', subtitle: 'Long dark straights · shuttered stalls · one hairpin',
    conditions: 'AFTER CLOSE', halfWidth: 18, seed: 37,
    points: [[-300,-120],[-100,-160],[100,-150],[300,-170],[380,-60],[330,40],[160,40],[60,90],
             [150,160],[330,190],[300,300],[80,310],[-150,280],[-330,200],[-380,40]],
    ramps: [0.12, 0.44, 0.70], crates: [0.05, 0.28, 0.56, 0.84],
    wave: { amp: 0.04, speed: 0.5 },
    sky: { top: '#05060e', bottom: '#1a1030', fog: '#100818', sun: '#efe6c8', near: 80, far: 900, disc: true },
    ground: { deep: '#101018', crest: '#c9844a', far: '#08060c' },
    ribbon: 26,
    lights: { hemi: '#4a5888', ground: '#2a1810', hemiI: 0.4, sun: '#b0c0ee', sunI: 0.28, sunPos: [300, 400, 200] },
    scatter: { count: 18, near: 6, far: 34, r0: 5, r1: 10, pad: 20 },
    markerEvery: 13, sway: 0.06, line: '#e8a050',
  },
];

const ITEMS = {
  steam:   { name: 'STEAM BOOST', color: '#ffb020' },
  banquet: { name: 'BANQUET',     color: '#ff5a1f' },
  skewer:  { name: 'SKEWER',      color: '#c9844a' },
  slick:   { name: 'OIL SLICK',   color: '#2a241c' },
  apron:   { name: 'APRON',       color: '#ffd56a' },
  net:     { name: 'CARGO NET',   color: '#c23b4a' },
};

// boost / boost3 raise speed. drag slows the rival directly ahead.
const ITEM_FX = {
  steam: 'boost', banquet: 'boost3', skewer: 'shot', slick: 'mine', apron: 'shield', net: 'drag',
};

const ITEM_ODDS = [
  { steam: 30, slick: 40, apron: 25, skewer: 5 },
  { steam: 30, slick: 25, apron: 20, skewer: 25 },
  { steam: 30, slick: 15, apron: 15, skewer: 30, banquet: 10 },
  { steam: 25, slick: 10, apron: 15, skewer: 30, banquet: 20 },
  { steam: 20, slick: 5,  apron: 10, skewer: 30, banquet: 30, net: 5 },
  { steam: 15, apron: 10, skewer: 25, banquet: 40, net: 10 },
  { steam: 10, apron: 5,  skewer: 25, banquet: 45, net: 15 },
  { steam: 5,  skewer: 25, banquet: 45, net: 25 },
];
