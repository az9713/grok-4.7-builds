// Screens, input, HUD, portraits, audio, main loop. Theme comes from data.js THEME.
'use strict';

const $ = id => document.getElementById(id);
const screens = ['title', 'select', 'card', 'hud', 'results', 'pause'];
function show(...ids) { screens.forEach(s => $(s).classList.toggle('on', ids.includes(s))); }
const fmt = t => { if (!isFinite(t)) return '--:--.--'; const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); };
const ord = n => n + (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');

const SFX = {
  ctx: null, master: null, music: true, eng: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      this.ctx = new C(); this.master = this.ctx.createGain(); this.master.gain.value = 0.5; this.master.connect(this.ctx.destination);
      const o1 = this.ctx.createOscillator(), o2 = this.ctx.createOscillator(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      const eng = THEME.music.engine || 'sawtooth';
      o1.type = eng; o2.type = eng === 'sawtooth' ? 'square' : 'sine'; o2.detune.value = 12;
      f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(this.master); o1.start(); o2.start();
      this.eng = { o1, o2, f, g };
      this.noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.startMusic();
      $('mute').style.display = 'block';
    } catch (e) { this.ctx = null; }
  },
  tone(freq, dur, type = 'square', vol = 0.2, slide = 0, delay = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.3, freq = 1200, delay = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay, s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    s.buffer = this.noiseBuf; f.type = 'lowpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t); s.stop(t + dur + 0.02);
  },
  play(n) {
    if (!this.ctx) return;
    const T = this.tone.bind(this), Nz = this.noise.bind(this);
    switch (n) {
      case 'crate': [523, 659, 784].forEach((f, i) => T(f, 0.12, 'square', 0.12, 0, i * 0.05)); break;
      case 'tick': T(1200, 0.03, 'square', 0.05); break;
      case 'got': T(988, 0.1, 'square', 0.15); T(1319, 0.2, 'square', 0.15, 0, 0.08); break;
      case 'boost': Nz(0.6, 0.25, 3000); T(200, 0.6, 'sawtooth', 0.12, 600); break;
      case 'bump': case 'thud': T(90, 0.15, 'sine', 0.35, -40); Nz(0.1, 0.15, 600); break;
      case 'jump': T(300, 0.3, 'triangle', 0.2, 500); break;
      case 'splash': Nz(0.5, 0.35, 1800); break;
      case 'trick': T(600, 0.25, 'triangle', 0.15, 900); break;
      case 'fire': T(700, 0.3, 'sawtooth', 0.15, -500); Nz(0.2, 0.2, 2500); break;
      case 'drop': T(400, 0.2, 'square', 0.15, -250); break;
      case 'shield': [660, 880, 1100].forEach((f, i) => T(f, 0.15, 'sine', 0.15, 0, i * 0.06)); break;
      case 'pop': T(900, 0.12, 'sine', 0.2, -600); break;
      case 'thunder': Nz(1.4, 0.5, 400); T(60, 1.0, 'sawtooth', 0.2, -20); break;
      case 'boom': Nz(0.7, 0.5, 900); T(120, 0.5, 'sawtooth', 0.25, -80); break;
      case 'lap': T(880, 0.12, 'square', 0.15); T(1175, 0.2, 'square', 0.15, 0, 0.12); break;
      case 'final': [784, 988, 1175, 1568].forEach((f, i) => T(f, 0.14, 'square', 0.14, 0, i * 0.09)); break;
      case 'finish': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => T(f, 0.22, 'square', 0.16, 0, i * 0.13)); break;
      case 'beep': T(440, 0.25, 'square', 0.2); break;
      case 'go': T(880, 0.6, 'square', 0.22); break;
      case 'select': T(660, 0.06, 'square', 0.12); break;
      case 'ok': T(784, 0.08, 'square', 0.14); T(1047, 0.14, 'square', 0.14, 0, 0.07); break;
    }
  },
  engine(speed, on) {
    if (!this.eng) return;
    const m = THEME.music, t = this.ctx.currentTime, f = m.engineBase + speed * m.engineMul;
    this.eng.o1.frequency.setTargetAtTime(f, t, 0.05); this.eng.o2.frequency.setTargetAtTime(f * 0.5, t, 0.05);
    this.eng.f.frequency.setTargetAtTime(280 + speed * 14, t, 0.05);
    this.eng.g.gain.setTargetAtTime(on ? m.vol + Math.min(speed, 100) * 0.0005 : 0, t, 0.1);
  },
  startMusic() {
    const chords = [
      [48, 60, 64, 67], [45, 57, 60, 64], [41, 53, 57, 60], [43, 55, 59, 62],
    ];
    if (THEME.kind === 'market') {
      chords[0] = [45, 60, 63, 67]; chords[1] = [41, 56, 60, 63]; chords[2] = [43, 58, 62, 65]; chords[3] = [48, 60, 63, 67];
    } else if (THEME.kind === 'ice') {
      chords[0] = [48, 60, 67, 72]; chords[1] = [46, 58, 65, 70]; chords[2] = [43, 55, 62, 67]; chords[3] = [41, 53, 60, 65];
    }
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    let step = 0; const spb = 60 / THEME.music.bpm / 4;
    let next = this.ctx.currentTime + 0.1;
    const tick = () => {
      if (!this.ctx) return;
      while (next < this.ctx.currentTime + 0.2) {
        if (this.music) {
          const ch = chords[Math.floor(step / 16) % 4], s = step % 16;
          if (s % 4 === 0 || s === 10) this.musicNote(mtof(ch[0]), spb * 2.5, 'triangle', THEME.kind === 'ice' ? 0.1 : 0.16, next);
          if (s % 2 === 0) this.musicNote(mtof(ch[1 + (s / 2) % 3] + 12), spb * 1.4, 'square', 0.03, next);
          if (s === 4 || s === 12) this.musicNoise(next);
        }
        step++; next += spb;
      }
      setTimeout(tick, 60);
    };
    tick();
  },
  musicNote(f, d, type, v, t) {
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + d + 0.02);
  },
  musicNoise(t) {
    const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    s.buffer = this.noiseBuf; f.type = 'highpass'; f.frequency.value = 5000;
    g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t); s.stop(t + 0.1);
  },
};
window.SFX = SFX;

const keys = {};
let itemQueued = false, trickQueued = false;
const K = {
  up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
  item: ['Space', 'KeyX'], trick: ['KeyZ', 'ShiftLeft', 'ShiftRight'],
};
const held = a => K[a].some(k => keys[k]);
window.addEventListener('keydown', e => {
  SFX.init();
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (keys[e.code]) return;
  keys[e.code] = true;
  if (K.item.includes(e.code)) itemQueued = true;
  if (K.trick.includes(e.code)) trickQueued = true;
  onKey(e.code);
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
window.addEventListener('pointerdown', () => SFX.init());

let padPrev = {};
function pad() {
  const gp = navigator.getGamepads ? [...navigator.getGamepads()].find(p => p) : null;
  if (!gp) return null;
  const b = i => gp.buttons[i] && gp.buttons[i].pressed;
  const st = { steer: Math.abs(gp.axes[0]) > 0.15 ? gp.axes[0] : (b(14) ? -1 : b(15) ? 1 : 0), throttle: b(0) || b(7), brake: b(1) || b(6), item: b(2) || b(5), trick: b(3) || b(4) };
  if (st.item && !padPrev.item) itemQueued = true;
  if (st.trick && !padPrev.trick) trickQueued = true;
  padPrev = st; return st;
}

function playerControls() {
  const p = pad();
  const c = {
    throttle: held('up') || (p && p.throttle), brake: held('down') || (p && p.brake),
    steer: (held('left') ? 1 : 0) - (held('right') ? 1 : 0) + (p ? -p.steer : 0),
    item: itemQueued, trick: trickQueued || held('trick'),
  };
  c.steer = Math.max(-1, Math.min(1, c.steer));
  itemQueued = false; trickQueued = false;
  return c;
}

function onKey(code) {
  const s = G.state;
  if (code === 'KeyM') { SFX.music = !SFX.music; $('mute').textContent = 'MUSIC: ' + (SFX.music ? 'ON' : 'OFF') + ' (M)'; return; }
  if (s === 'title' && (code === 'Enter' || code === 'Space')) { SFX.play('ok'); toSelect(); }
  else if (s === 'select') {
    const c = G.charIdx;
    if (code === 'ArrowRight' || code === 'KeyD') pickChar((c + 1) % 8);
    else if (code === 'ArrowLeft' || code === 'KeyA') pickChar((c + 7) % 8);
    else if (code === 'ArrowDown' || code === 'KeyS') pickChar((c + 4) % 8);
    else if (code === 'ArrowUp' || code === 'KeyW') pickChar((c + 4) % 8);
    else if (code === 'Enter') startRace();
    else if (code === 'Escape') toTitle();
  } else if ((s === 'race' || s === 'countdown') && (code === 'KeyP' || code === 'Escape')) { G.prevState = s; G.state = 'paused'; show('hud', 'pause'); }
  else if (s === 'paused' && (code === 'KeyP' || code === 'Escape')) resume();
  else if (s === 'results' && code === 'Enter') startRace();
}

function drawPortrait(g, ch, S) {
  const L = S * 0.026, ink = THEME.ink;
  const bg = g.createRadialGradient(S * 0.5, S * 0.35, S * 0.1, S * 0.5, S * 0.5, S * 0.75);
  const edge = THEME.kind === 'ice' ? '#d5e6f2' : THEME.kind === 'office' ? '#d9d4c8' : '#1a0c14';
  bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.28, ch.color); bg.addColorStop(1, edge);
  g.fillStyle = bg; g.fillRect(0, 0, S, S);
  g.lineWidth = L; g.strokeStyle = ink; g.lineJoin = 'round';
  const path = (f, fill) => { g.beginPath(); f(); g.fillStyle = fill; g.fill(); g.stroke(); };
  const cx = S / 2, cy = S * 0.46, R = S * (0.2 + ch.stats.weight * 0.012);
  path(() => { g.moveTo(S * 0.12, S); g.quadraticCurveTo(S * 0.14, S * 0.72, cx, S * 0.7); g.quadraticCurveTo(S * 0.86, S * 0.72, S * 0.88, S); g.closePath(); }, ch.color);
  path(() => { g.rect(S * 0.36, S * 0.74, S * 0.28, S * 0.3); }, ch.accent);
  path(() => { g.rect(cx - S * 0.06, S * 0.6, S * 0.12, S * 0.12); }, ch.skin);
  if (ch.style === 'ponytail') path(() => { g.ellipse(cx + R * 1.05, cy + R * 0.3, R * 0.35, R * 0.8, 0.4, 0, 7); }, ch.hair);
  if (ch.style === 'bob') path(() => { g.ellipse(cx, cy + R * 0.1, R * 1.18, R * 1.12, 0, 0, 7); }, ch.hair);
  path(() => { g.arc(cx, cy, R, 0, Math.PI * 2); }, ch.skin);
  const H = ch.hair;
  if (ch.style === 'spiky') path(() => { g.moveTo(cx - R, cy - R * 0.2); for (let k = 0; k <= 6; k++) { const a = Math.PI + k * Math.PI / 6; g.lineTo(cx + Math.cos(a) * R * 1.45 * (k % 2 ? 1 : 0.8), cy + Math.sin(a) * R * 1.45 * (k % 2 ? 1 : 0.8)); } g.lineTo(cx + R, cy - R * 0.2); g.closePath(); }, H);
  if (ch.style === 'ponytail' || ch.style === 'bob' || ch.style === 'flat' || ch.style === 'beard') path(() => { g.arc(cx, cy - R * 0.05, R * 1.02, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); }, H);
  if (ch.style === 'bun') { path(() => { g.arc(cx, cy - R * 1.15, R * 0.42, 0, 7); }, H); path(() => { g.arc(cx, cy - R * 0.05, R * 1.02, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); }, H); }
  if (ch.style === 'mohawk') path(() => { g.moveTo(cx - R * 0.2, cy - R * 0.8); g.lineTo(cx - R * 0.3, cy - R * 1.6); g.lineTo(cx, cy - R * 1.3); g.lineTo(cx + R * 0.3, cy - R * 1.7); g.lineTo(cx + R * 0.25, cy - R * 0.8); g.closePath(); }, H);
  if (ch.style === 'bald') { g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(cx - R * 0.35, cy - R * 0.6, R * 0.25, R * 0.12, -0.5, 0, 7); g.fill(); }
  if (THEME.kind === 'market') {
    path(() => { g.moveTo(cx - R * 1.05, cy - R * 0.2); g.lineTo(cx - R * 1.2, cy - R * 0.42); g.lineTo(cx + R * 1.2, cy - R * 0.42); g.lineTo(cx + R * 1.05, cy - R * 0.2); g.closePath(); }, ch.accent);
    path(() => { g.moveTo(cx - R * 0.72, cy - R * 0.4); g.lineTo(cx, cy - R * 1.2); g.lineTo(cx + R * 0.72, cy - R * 0.4); g.closePath(); }, ch.color);
    path(() => { g.arc(cx + R * 0.85, cy - R * 0.55, R * 0.16, 0, 7); }, '#ffd56a');
  } else if (THEME.kind === 'ice') {
    path(() => { g.arc(cx, cy - R * 0.2, R * 1.05, Math.PI, 0); g.lineTo(cx + R * 0.15, cy - R * 1.45); g.lineTo(cx - R * 0.15, cy - R * 1.45); g.closePath(); }, ch.accent);
    path(() => { g.arc(cx, cy - R * 1.5, R * 0.22, 0, 7); }, ch.color);
  } else {
    path(() => { g.moveTo(cx - R * 0.15, cy + R * 0.55); g.lineTo(cx - R * 0.42, cy + R * 1.55); g.lineTo(cx + R * 0.05, cy + R * 1.55); g.lineTo(cx + R * 0.12, cy + R * 0.55); g.closePath(); }, '#ff5a1f');
    path(() => { g.rect(cx - R * 0.4, cy + R * 1.2, R * 0.5, R * 0.36); }, '#ffe14a');
  }
  for (const s of [-1, 1]) {
    path(() => { g.ellipse(cx + s * R * 0.38, cy + R * 0.02, R * 0.17, R * 0.22, 0, 0, 7); }, '#ffffff');
    g.fillStyle = ink; g.beginPath(); g.arc(cx + s * R * 0.38 + R * 0.04, cy + R * 0.06, R * 0.09, 0, 7); g.fill();
  }
  if (THEME.kind === 'office') {
    g.strokeStyle = ink; g.lineWidth = L * 0.7;
    g.strokeRect(cx - R * 0.7, cy - R * 0.08, R * 0.48, R * 0.32);
    g.strokeRect(cx + R * 0.22, cy - R * 0.08, R * 0.48, R * 0.32);
    g.beginPath(); g.moveTo(cx - R * 0.22, cy + R * 0.08); g.lineTo(cx + R * 0.22, cy + R * 0.08); g.stroke();
  }
  if (ch.style === 'beard') {
    path(() => { g.moveTo(cx - R * 0.9, cy + R * 0.2); g.quadraticCurveTo(cx, cy + R * 1.9, cx + R * 0.9, cy + R * 0.2); g.quadraticCurveTo(cx, cy + R * 0.75, cx - R * 0.9, cy + R * 0.2); }, H);
    path(() => { g.ellipse(cx, cy + R * 0.45, R * 0.35, R * 0.12, 0, 0, 7); }, H);
  } else {
    g.fillStyle = 'rgba(255,90,120,0.35)'; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * R * 0.62, cy + R * 0.38, R * 0.14, 0, 7); g.fill(); }
    const wide = ch.stats.weight >= 4 ? 0.5 : 0.36;
    path(() => { g.moveTo(cx - R * wide, cy + R * 0.42); g.quadraticCurveTo(cx, cy + R * 0.95, cx + R * wide, cy + R * 0.42); g.closePath(); }, '#7a1030');
  }
  if (THEME.kind === 'ice') path(() => { g.rect(cx - R * 0.95, cy + R * 0.7, R * 1.9, R * 0.28); }, ch.accent);
  const gl = g.createLinearGradient(0, 0, 0, S * 0.5); gl.addColorStop(0, 'rgba(255,255,255,0.35)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gl; g.fillRect(0, 0, S, S * 0.5);
}

function drawItemIcon(g, item, S, uses) {
  g.clearRect(0, 0, S, S);
  if (!item) return;
  const fx = ITEM_FX[item], kind = THEME.kind;
  g.save(); g.translate(S / 2, S / 2); g.lineJoin = 'round'; g.lineWidth = S * 0.035; g.strokeStyle = THEME.ink;
  const chev = (x, y, s, col) => { g.beginPath(); g.moveTo(x - s * 0.5, y - s * 0.6); g.lineTo(x + s * 0.3, y); g.lineTo(x - s * 0.5, y + s * 0.6); g.lineTo(x - s * 0.15, y + s * 0.6); g.lineTo(x + s * 0.65, y); g.lineTo(x - s * 0.15, y - s * 0.6); g.closePath(); g.fillStyle = col; g.fill(); g.stroke(); };
  if (fx === 'boost') {
    const col = kind === 'ice' ? '#d7f1ff' : kind === 'office' ? '#6b3a22' : '#ffb020';
    chev(-S * 0.1, 0, S * 0.42, col); chev(S * 0.16, 0, S * 0.42, col);
    if (kind === 'office') { g.fillStyle = '#f4f1ea'; g.beginPath(); g.ellipse(0, S * 0.05, S * 0.16, S * 0.1, 0, 0, 7); g.fill(); g.stroke(); }
  } else if (fx === 'boost3') {
    const col = kind === 'ice' ? '#7eb6ff' : kind === 'office' ? '#3a2418' : '#ff5a1f';
    for (const [x, y] of [[-S * 0.18, -S * 0.18], [S * 0.18, -S * 0.05], [-S * 0.05, S * 0.2]]) chev(x, y, S * 0.28, col);
  } else if (fx === 'shot') {
    if (kind === 'market') {
      g.rotate(-0.4); g.strokeStyle = THEME.ink; g.fillStyle = '#c9844a';
      g.fillRect(-S * 0.34, -S * 0.03, S * 0.7, S * 0.06); g.strokeRect(-S * 0.34, -S * 0.03, S * 0.7, S * 0.06);
      g.fillStyle = '#ff4d3a';
      for (const z of [-0.05, 0.16, 0.34]) { g.beginPath(); g.arc(S * z, 0, S * 0.09, 0, 7); g.fill(); g.stroke(); }
    } else if (kind === 'ice') {
      g.rotate(-0.5); g.fillStyle = '#c5d0d8'; g.fillRect(-S * 0.36, -S * 0.035, S * 0.62, S * 0.07); g.strokeRect(-S * 0.36, -S * 0.035, S * 0.62, S * 0.07);
      g.fillStyle = '#1a3344'; g.beginPath(); g.moveTo(S * 0.24, -S * 0.08); g.lineTo(S * 0.42, 0); g.lineTo(S * 0.24, S * 0.08); g.closePath(); g.fill(); g.stroke();
    } else {
      g.fillStyle = '#f7f4ee'; g.beginPath(); g.moveTo(-S * 0.2, 0); g.lineTo(S * 0.28, -S * 0.16); g.lineTo(S * 0.08, 0); g.lineTo(S * 0.28, S * 0.16); g.closePath(); g.fill(); g.stroke();
    }
  } else if (fx === 'mine') {
    if (kind === 'ice') {
      g.fillStyle = '#e7f3fb'; g.beginPath(); g.moveTo(0, -S * 0.32); g.lineTo(S * 0.28, S * 0.18); g.lineTo(-S * 0.22, S * 0.24); g.closePath(); g.fill(); g.stroke();
    } else {
      g.fillStyle = kind === 'office' ? '#2a2e34' : '#1a1612';
      g.beginPath(); g.ellipse(0, S * 0.06, S * 0.32, S * 0.16, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(-S * 0.08, 0, S * 0.05, 0, 7); g.fill();
    }
  } else if (fx === 'shield') {
    const b = g.createRadialGradient(-S * 0.1, -S * 0.12, S * 0.02, 0, 0, S * 0.36);
    b.addColorStop(0, '#ffffff'); b.addColorStop(1, kind === 'market' ? '#ffb020' : kind === 'ice' ? '#9fd0ff' : '#ffe14a');
    g.fillStyle = b; g.beginPath(); g.arc(0, 0, S * 0.32, 0, 7); g.fill(); g.stroke();
  } else if (fx === 'drag') {
    if (kind === 'market') {
      g.strokeStyle = '#c23b4a'; g.lineWidth = S * 0.04;
      for (let y = -3; y <= 3; y++) { g.beginPath(); g.moveTo(-S * 0.32, y * S * 0.08); g.lineTo(S * 0.32, y * S * 0.08); g.stroke(); }
      for (let x = -3; x <= 3; x++) { g.beginPath(); g.moveTo(x * S * 0.1, -S * 0.28); g.lineTo(x * S * 0.1, S * 0.28); g.stroke(); }
    } else if (kind === 'ice') {
      g.fillStyle = '#1a3344'; g.fillRect(-S * 0.06, -S * 0.34, S * 0.12, S * 0.4); g.strokeRect(-S * 0.06, -S * 0.34, S * 0.12, S * 0.4);
      g.beginPath(); g.arc(0, S * 0.16, S * 0.2, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(-S * 0.16, S * 0.28); g.lineTo(0, S * 0.08); g.lineTo(S * 0.16, S * 0.28); g.stroke();
    } else {
      g.strokeStyle = '#ff5a1f'; g.lineWidth = S * 0.05;
      for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(-S * 0.1, -S * 0.3); g.lineTo(k * S * 0.22, S * 0.32); g.stroke(); }
      g.fillStyle = '#ffe14a'; g.fillRect(-S * 0.28, S * 0.12, S * 0.22, S * 0.16); g.strokeRect(-S * 0.28, S * 0.12, S * 0.22, S * 0.16);
    }
  }
  g.restore();
  if (uses > 1) { g.font = `bold ${S * 0.22}px Arial Black, Arial`; g.textAlign = 'right'; g.lineWidth = S * 0.04; g.strokeStyle = THEME.ink; g.strokeText('x' + uses, S * 0.95, S * 0.95); g.fillStyle = '#fff'; g.fillText('x' + uses, S * 0.95, S * 0.95); }
}

function trackPolyline(def, n) {
  const c = new THREE.CatmullRomCurve3(def.points.map(([x, z]) => new V3(x, 0, z)), true, 'centripetal');
  return c.getSpacedPoints(n);
}
function fitMap(pts, S, pad) {
  let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
  for (const p of pts) { a = Math.min(a, p.x); b = Math.max(b, p.x); c = Math.min(c, p.z); d = Math.max(d, p.z); }
  const sc = (S - pad * 2) / Math.max(b - a, d - c), cx = (a + b) / 2, cz = (c + d) / 2;
  return (x, z) => [S / 2 - (x - cx) * sc, S / 2 - (z - cz) * sc];
}

const cardCanvases = [];
function buildSelect() {
  const grid = $('grid');
  CHARACTERS.forEach((ch, i) => {
    const d = document.createElement('div'); d.className = 'card';
    const cv = document.createElement('canvas'); cv.width = cv.height = 180;
    drawPortrait(cv.getContext('2d'), ch, 180);
    const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = ch.name;
    d.append(cv, nm); d.onclick = () => { SFX.init(); pickChar(i); };
    d.ondblclick = () => startRace();
    grid.append(d); cardCanvases.push(d);
  });
  document.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => {
    SFX.init(); SFX.play('select');
    const d = +b.dataset.d, o = b.dataset.opt;
    if (o === 'class') G.classIdx = (G.classIdx + d + CLASSES.length) % CLASSES.length;
    if (o === 'laps') G.selLaps = Math.max(1, Math.min(9, G.selLaps + d));
    if (o === 'track') G.trackIdx = (G.trackIdx + d + TRACKS.length) % TRACKS.length;
    refreshSelect();
  });
  $('raceBtn').onclick = () => { SFX.init(); startRace(); };
}
function pickChar(i) { G.charIdx = i; SFX.play('select'); refreshSelect(); }
function refreshSelect() {
  const ch = CHARACTERS[G.charIdx];
  cardCanvases.forEach((d, i) => d.classList.toggle('pick', i === G.charIdx));
  $('whoName').textContent = ch.name; $('whoName').style.color = ch.color;
  $('whoTag').textContent = ch.tag; $('previewName').textContent = ch.name;
  $('stats').innerHTML = ['speed', 'accel', 'handling', 'weight'].map(k =>
    `<div class="stat"><span>${k === 'accel' ? 'ACCEL' : k.toUpperCase()}</span><div class="bar">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= ch.stats[k] ? 'f' : ''}"></i>`).join('')}</div></div>`).join('');
  $('classVal').textContent = CLASSES[G.classIdx].name; $('classNote').textContent = CLASSES[G.classIdx].note;
  $('lapsVal').textContent = G.selLaps;
  const td = TRACKS[G.trackIdx]; $('trackVal').textContent = td.name;
  const cv = $('trackPreview'), g = cv.getContext('2d');
  g.clearRect(0, 0, cv.width, cv.height);
  const pts = trackPolyline(td, 200), m = fitMap(pts, cv.height, 16);
  g.save(); g.translate((cv.width - cv.height) / 2, 0);
  g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = THEME.ink; g.beginPath(); pts.forEach((p, i) => { const [x, y] = m(p.x, p.z); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
  g.lineWidth = 6; g.strokeStyle = THEME.map; g.stroke();
  const [sx, sy] = m(pts[0].x, pts[0].z); g.fillStyle = THEME.speedA; g.beginPath(); g.arc(sx, sy, 7, 0, 7); g.fill();
  g.restore();
  if (SR.model) SR.scene.remove(SR.model.root);
  SR.model = buildVehicle(ch); SR.scene.add(SR.model.root);
}

const SR = { scene: null, cam: null, model: null };
function buildShowroom() {
  SR.scene = new THREE.Scene(); SR.scene.background = new THREE.Color(THEME.showroom);
  SR.cam = new THREE.PerspectiveCamera(40, 2, 0.1, 100); SR.cam.position.set(6.5, 3.6, 7.5); SR.cam.lookAt(0, 1.2, 0);
  SR.scene.add(new THREE.HemisphereLight(THEME.hemiSky, THEME.hemiGround, 1.0));
  const d = new THREE.DirectionalLight(THEME.sun, 1.15); d.position.set(5, 8, 6); SR.scene.add(d);
  const shiny = THEME.kind === 'ice' ? 80 : THEME.kind === 'office' ? 6 : 16;
  const disc = new THREE.Mesh(jitter(new THREE.CylinderGeometry(7, 7.4, 0.35, 14, 1), 0.15, 3), new THREE.MeshPhongMaterial({ color: THEME.disc, flatShading: true, shininess: shiny }));
  disc.position.y = -0.2; SR.scene.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.18, 4, 20).rotateX(Math.PI / 2), new THREE.MeshPhongMaterial({ color: THEME.kind === 'ice' ? 0xd7e6f2 : 0xffffff, flatShading: true }));
  SR.scene.add(ring);
}
function renderShowroom(t) {
  const el = $('preview3d'), rc = el.getBoundingClientRect();
  if (rc.width < 10 || rc.height < 10 || !SR.model) return;
  const R = W.renderer, H = window.innerHeight;
  SR.model.root.rotation.y = t * 0.7;
  SR.model.root.position.y = Math.sin(t * 1.6) * 0.04;
  SR.model.tilt.rotation.z = Math.sin(t * 1.3) * 0.05;
  if (SR.model.spinParts) for (const w of SR.model.spinParts) w.rotation.x = t * 2;
  if (SR.model.yawParts) for (const w of SR.model.yawParts) w.rotation.y = t * 1.4;
  SR.cam.aspect = rc.width / rc.height; SR.cam.updateProjectionMatrix();
  R.setScissorTest(true);
  R.setScissor(rc.left, H - rc.bottom, rc.width, rc.height); R.setViewport(rc.left, H - rc.bottom, rc.width, rc.height);
  R.render(SR.scene, SR.cam);
  R.setScissorTest(false); R.setViewport(0, 0, window.innerWidth, H);
}

const HUD = { map: null, mapPts: null, itemCv: null, speedCv: null, lastPos: 0, rollIcon: 0, rollT: 0 };
function prepHUD() {
  const tr = W.track, S = 380;
  const pts = []; for (let i = 0; i < tr.N; i += 5) pts.push({ x: tr.px[i], z: tr.pz[i] });
  HUD.mapFn = fitMap(pts, S, 34); HUD.mapPts = pts.map(p => HUD.mapFn(p.x, p.z));
  $('lapList').innerHTML = '';
}
function drawMinimap() {
  const g = $('minimap').getContext('2d'), S = 380, tr = W.track, m = HUD.mapFn;
  g.clearRect(0, 0, S, S);
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); HUD.mapPts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
  g.lineWidth = 26; g.strokeStyle = THEME.mapEdge; g.stroke();
  g.lineWidth = 18; g.strokeStyle = THEME.map; g.stroke();
  g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.7)'; g.setLineDash([8, 8]); g.stroke(); g.setLineDash([]);
  const [sx, sy] = m(tr.px[0], tr.pz[0]); g.fillStyle = '#fff'; g.fillRect(sx - 12, sy - 3, 24, 6);
  for (const rp of tr.ramps) { const [x, y] = m(rp.x, rp.z); g.fillStyle = THEME.speedA; g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x + 7, y + 6); g.lineTo(x - 7, y + 6); g.closePath(); g.fill(); }
  if (tr.holes) for (const h of tr.holes) { const [x, y] = m(h.x, h.z); g.fillStyle = '#071820'; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
  for (const t of G.torps) { const [x, y] = m(t.x, t.z); g.fillStyle = '#ff3030'; g.fillRect(x - 3, y - 3, 6, 6); }
  const rs = G.racers.slice().sort((a, b) => (a.isPlayer ? 1 : 0) - (b.isPlayer ? 1 : 0));
  for (const r of rs) {
    const [x, y] = m(r.x, r.z), big = r.isPlayer;
    g.fillStyle = r.ch.color; g.strokeStyle = big ? '#fff' : THEME.ink; g.lineWidth = big ? 5 : 3;
    g.beginPath(); g.arc(x, y, big ? 13 : 9, 0, 7); g.fill(); g.stroke();
    if (big) { const a = r.heading; g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x - Math.sin(a) * 24, y - Math.cos(a) * 24); g.lineTo(x - Math.sin(a + 2.5) * 12, y - Math.cos(a + 2.5) * 12); g.lineTo(x - Math.sin(a - 2.5) * 12, y - Math.cos(a - 2.5) * 12); g.closePath(); g.fill(); }
  }
}
function drawSpeedo(spd, boost) {
  const g = $('speedo').getContext('2d'), S = 380, c = S / 2, R = S * 0.42;
  g.clearRect(0, 0, S, S);
  const MAX = 220, a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, ang = v => a0 + (a1 - a0) * Math.min(v, MAX) / MAX;
  g.beginPath(); g.arc(c, c, R, 0, 7); g.fillStyle = 'rgba(8,16,28,0.55)'; g.fill();
  g.lineWidth = 22; g.strokeStyle = 'rgba(255,255,255,0.15)'; g.beginPath(); g.arc(c, c, R - 20, a0, a1); g.stroke();
  const gr = g.createLinearGradient(0, S, S, 0); gr.addColorStop(0, THEME.speedA); gr.addColorStop(1, THEME.speedB);
  g.strokeStyle = boost ? THEME.speedB : gr; g.beginPath(); g.arc(c, c, R - 20, a0, ang(spd)); g.stroke();
  g.fillStyle = '#fff'; g.font = 'bold 22px Russo One, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let v = 0; v <= MAX; v += 20) {
    const a = ang(v), big = v % 40 === 0;
    g.strokeStyle = '#fff'; g.lineWidth = big ? 5 : 2; g.beginPath(); g.moveTo(c + Math.cos(a) * (R - 36), c + Math.sin(a) * (R - 36)); g.lineTo(c + Math.cos(a) * (R - (big ? 54 : 46)), c + Math.sin(a) * (R - (big ? 54 : 46))); g.stroke();
    if (big) g.fillText(v, c + Math.cos(a) * (R - 78), c + Math.sin(a) * (R - 78));
  }
  const a = ang(spd);
  g.strokeStyle = '#ff2d2d'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(c - Math.cos(a) * 18, c - Math.sin(a) * 18); g.lineTo(c + Math.cos(a) * (R - 30), c + Math.sin(a) * (R - 30)); g.stroke();
  g.fillStyle = THEME.ink; g.beginPath(); g.arc(c, c, 16, 0, 7); g.fill();
  g.fillStyle = boost ? THEME.speedB : THEME.speedA; g.font = 'bold 58px Lilita One, Arial Black'; g.fillText(Math.round(spd), c, c + R * 0.52);
  g.fillStyle = '#d7e6f2'; g.font = 'bold 20px Russo One, Arial'; g.fillText('KM/H', c, c + R * 0.8);
}
function updateHUD(dt) {
  const p = G.player; if (!p) return;
  const L = G.laps, lap = Math.max(1, Math.min(L, p.lapCount));
  $('lapNum').innerHTML = `LAP ${lap}<small>/${L}</small>`;
  $('raceTime').textContent = fmt(p.finished ? p.finishTime : G.raceTime);
  const best = p.lapTimes.length ? Math.min(...p.lapTimes) : 0;
  const lapHtml = p.lapTimes.map((t, i) => `LAP ${i + 1} &nbsp;${t === best ? '<b>' + fmt(t) + '</b>' : fmt(t)}`).join('<br>');
  if (lapHtml !== HUD.lapHtml) { $('lapList').innerHTML = lapHtml; HUD.lapHtml = lapHtml; }
  if (p.rank !== HUD.lastPos) {
    const n = p.rank, suf = ord(n).slice(String(n).length);
    $('posNum').innerHTML = `${n}<sup>${suf}</sup>`; $('posNum').style.color = n === 1 ? THEME.speedA : n <= 3 ? '#fff' : '#cfe6ff'; HUD.lastPos = n;
  }
  const ic = $('itemCanvas').getContext('2d'), names = Object.keys(ITEMS);
  if (p.rolling > 0) {
    HUD.rollT += dt; if (HUD.rollT > 0.08) { HUD.rollT = 0; HUD.rollIcon = (HUD.rollIcon + 1) % names.length; SFX.play('tick'); }
    drawItemIcon(ic, names[HUD.rollIcon], 192, 1); $('itemName').textContent = '. . .';
  } else if (p.item !== HUD.lastItem || p.uses !== HUD.lastUses) {
    drawItemIcon(ic, p.item, 192, p.uses); $('itemName').textContent = p.item ? ITEMS[p.item].name : '';
    HUD.lastItem = p.item; HUD.lastUses = p.uses;
  }
  if (p.rolling > 0) HUD.lastItem = '__';
  drawMinimap();
  drawSpeedo(Math.hypot(p.vx, p.vz) * 1.8, p.boost > 0);
  $('wrongWay').style.display = p.wrongT > 1 && G.state === 'race' ? 'block' : 'none';
}
let toastTimer = 0;
const UI = {
  playerControls,
  toast(t, ms = 1200) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), ms); },
  flash() { const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0.75;pointer-events:none;transition:opacity 0.5s;z-index:4'; document.body.append(d); requestAnimationFrame(() => { d.style.opacity = 0; }); setTimeout(() => d.remove(), 600); },
  showResults() {
    const tr = W.track;
    const rows = G.racers.map(r => {
      let t = r.finishTime, est = false;
      if (!r.finished) { const rem = (G.laps + 1) * tr.N - progress(r); t = G.raceTime + rem * tr.ds / Math.max(20, racerStats(r).max * 0.9); est = true; }
      return { r, t, est, best: r.lapTimes.length ? Math.min(...r.lapTimes) : NaN };
    }).sort((a, b) => a.t - b.t);
    const me = rows.findIndex(x => x.r.isPlayer) + 1;
    $('resTitle').textContent = me === 1 ? 'YOU WIN!' : `YOU FINISHED ${ord(me).toUpperCase()}`;
    $('resTable').innerHTML = `<tr><th>POS</th><th>${THEME.who}</th><th>TIME</th><th>BEST LAP</th></tr>` + rows.map((x, i) =>
      `<tr class="${x.r.isPlayer ? 'me' : ''}"><td>${ord(i + 1)}</td><td><span class="dot" style="background:${x.r.ch.color}"></span>${x.r.ch.name}</td><td>${fmt(x.t)}${x.est ? ' <small>(est.)</small>' : ''}</td><td>${fmt(x.best)}</td></tr>`).join('');
    show('results');
  },
};
window.UI = UI;

function toTitle() {
  G.state = 'title'; G.player = null;
  setupRace(0, { attract: true, allAI: true, laps: 99 });
  show('title'); $('countdown').style.display = 'none';
}
function toSelect() {
  if (G.state !== 'title' && G.state !== 'select') setupRace(G.trackIdx, { attract: true, allAI: true, laps: 99 });
  G.state = 'select'; show('select'); refreshSelect();
}
function startRace() {
  SFX.play('ok');
  setupRace(G.trackIdx, { laps: G.selLaps });
  prepHUD(); HUD.lastPos = 0; HUD.lastItem = '__'; HUD.lapHtml = null;
  G.state = 'intro'; G.introT = 0;
  const td = TRACKS[G.trackIdx];
  $('tcNum').textContent = `TRACK ${G.trackIdx + 1}  ·  ${CLASSES[G.classIdx].name} CLASS`;
  $('tcName').textContent = td.name;
  $('tcSub').textContent = `${td.subtitle} · ${(W.track.length / 1000).toFixed(2)} km · ${G.laps} laps · ${td.conditions}`;
  const tc = document.querySelector('.tc'); tc.replaceWith(tc.cloneNode(true));
  show('card');
}
function resume() { G.state = G.prevState || 'race'; show('hud'); }

function showCountdown(txt, go) {
  const el = $('countdown'); el.style.display = 'block'; el.textContent = txt;
  el.className = go ? 'go' : ''; void el.offsetWidth; el.className = (go ? 'go ' : '') + 'pop';
}

let last = performance.now(), cdShown = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
  const s = G.state;
  if (s !== 'paused' && W.track) {
    W.t += dt;
    if (s === 'title' || s === 'select') updateRace(dt, false);
    else if (s === 'intro') {
      G.introT += dt; updateRace(dt, true);
      if (G.introT > 4.4) { G.state = 'countdown'; G.countdown = 3.0; cdShown = 4; show('hud'); }
    } else if (s === 'countdown') {
      G.countdown -= dt; updateRace(dt, true);
      const n = Math.ceil(G.countdown);
      if (n < cdShown && n > 0) { cdShown = n; showCountdown(n); SFX.play('beep'); }
      if (G.countdown <= 0) { G.state = 'race'; showCountdown('GO!', true); SFX.play('go'); setTimeout(() => { $('countdown').style.display = 'none'; }, 900); }
    } else updateRace(dt, false);
    updateTrackFX(W.track, W.t);
    updateSpray(dt);
    syncVisuals(dt);
    updateCamera(dt);
    if (['countdown', 'race', 'post'].includes(G.state)) updateHUD(dt);
    const p = G.player;
    SFX.engine(p ? Math.hypot(p.vx, p.vz) : 0, !!p && ['countdown', 'race', 'post'].includes(G.state));
  }
  W.renderer.render(W.scene, W.camera);
  if (G.state === 'select') renderShowroom(now / 1000);
}

function boot() {
  G.selLaps = 3;
  initRenderer();
  buildShowroom();
  buildSelect();
  $('title').onclick = () => { if (G.state === 'title') { SFX.init(); SFX.play('ok'); toSelect(); } };
  $('btnRetry').onclick = () => startRace();
  $('btnNext').onclick = () => { G.trackIdx = (G.trackIdx + 1) % TRACKS.length; startRace(); };
  $('btnMenu').onclick = () => toSelect();
  $('btnResume').onclick = () => resume();
  $('btnQuit').onclick = () => toSelect();
  $('mute').onclick = () => onKey('KeyM');
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.has('test')) {
    const out = $('testout'); out.style.display = 'block';
    try { out.textContent = JSON.stringify(runSelfTest(), null, 2); document.title = 'TEST DONE'; }
    catch (e) { out.textContent = 'TEST ERROR: ' + e.stack; document.title = 'TEST ERROR'; }
    toTitle();
  } else if (h.has('race')) {
    G.trackIdx = +(h.get('track') || 0); G.charIdx = +(h.get('char') || 0); G.selLaps = +(h.get('laps') || 3);
    G.classIdx = +(h.get('class') || 1); G.auto = h.get('auto') === '1';
    toTitle(); startRace();
    if (h.get('skipintro') === '1') { G.introT = 99; }
  } else if (h.get('screen') === 'select') { toTitle(); toSelect(); }
  else toTitle();
  requestAnimationFrame(frame);
}
window.addEventListener('error', e => { window.__errors = (window.__errors || []).concat(String(e.message)); });
boot();
