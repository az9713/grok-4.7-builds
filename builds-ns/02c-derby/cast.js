// Shared cast and sets. Scenes draw gags on top of these.
(function () {
  const K = window.Kit;
  const PAL = K.PAL;

  K.human = function (x, y, h, o = {}) {
    const f = o.facing || 1, walk = o.walk || 0;
    const shirt = o.shirt || '#3a3f58', pants = o.pants || '#2c241c', skin = o.skin || PAL.skin;
    const hair = o.hair || PAL.hair;
    push(); translate(x, y); if (o.rot) rotate(o.rot); scale(f, 1);
    const hip = -h * 0.48, sh = -h * 0.72, headY = -h * 0.86, hr = h * 0.09;
    for (const side of [-1, 1]) {
      const phase = walk + (side > 0 ? Math.PI : 0);
      const sw = walk ? Math.sin(phase) : 0;
      const fx = side * h * 0.055 + sw * h * 0.09;
      const lift = walk ? Math.max(0, -Math.cos(phase)) * h * 0.035 : 0;
      K.streak(side * h * 0.045, hip, fx, -h * 0.015 - lift, h * 0.055, pants);
      if (o.skates) {
        K.rect(fx - h * 0.07, -h * 0.02 - lift, h * 0.14, h * 0.022, '#1a1a1a', { weight: 2 });
        K.circle(fx - h * 0.045, h * 0.008 - lift, h * 0.016, '#9aa0a8', { weight: 1.5 });
        K.circle(fx + h * 0.04, h * 0.008 - lift, h * 0.016, '#9aa0a8', { weight: 1.5 });
      } else {
        K.ellipse(fx + h * 0.01, -h * 0.01 - lift, h * 0.045, h * 0.018, o.shoe || PAL.shoe, { weight: 2, segments: 12 });
      }
    }
    K.poly([[-h * 0.12, sh], [h * 0.12, sh], [h * 0.16, hip + h * 0.02], [-h * 0.16, hip + h * 0.02]], shirt);
    if (o.apron) K.poly([[-h * 0.09, sh + h * 0.08], [h * 0.1, sh + h * 0.08], [h * 0.12, hip], [-h * 0.11, hip]], o.apron, { weight: 2.5 });
    if (o.stripes) for (let i = 0; i < 3; i++) K.rect(-h * 0.125, sh + h * 0.1 + i * h * 0.09, h * 0.25, h * 0.028, '#111', { stroke: false });
    const arms = o.arms || [0.25, 0.25];
    [[-1, arms[0]], [1, arms[1]]].forEach(([side, a]) => {
      const ax = side * h * 0.12, ay = sh + h * 0.05, len = h * 0.26;
      const hx = ax + Math.sin(a) * len, hy = ay + Math.cos(a) * len;
      K.streak(ax, ay, hx, hy, h * 0.05, o.sleeve || shirt);
      K.circle(hx, hy, h * 0.022, skin, { weight: 2 });
    });
    K.circle(0, headY, hr, skin);
    if (o.hat === 'toque') {
      K.rect(-hr * 0.95, headY - hr * 0.35, hr * 1.9, hr * 0.45, '#f4f1ea', { weight: 2.5 });
      K.ellipse(0, headY - hr * 0.45, hr * 0.85, hr * 0.7, '#f7f4ee', { weight: 2.5 });
    } else if (o.hat === 'cap') {
      const hc = o.hatColor || '#1c2430';
      K.ellipse(0, headY - hr * 0.55, hr * 0.95, hr * 0.42, hc, { weight: 2.5 });
      K.rect(hr * 0.1, headY - hr * 0.62, hr * 1.15, hr * 0.16, hc, { weight: 2 });
    } else if (o.hat === 'helmet') {
      const hc = o.hatColor || '#f4f4f4';
      K.ellipse(0, headY - hr * 0.05, hr * 1.2, hr * 1.05, hc, { weight: 3 });
      K.rect(-hr * 1.15, headY + hr * 0.15, hr * 2.3, hr * 0.22, hc, { weight: 2.5 });
      if (o.star) K.circle(hr * 0.05, headY - hr * 0.05, hr * 0.32, '#ffd83d', { weight: 2 });
    } else if (o.hair !== false) {
      K.poly([[-hr * 1.02, headY - hr * 0.1], [-hr * 1.05, headY - hr * 0.95], [0, headY - hr * 1.15], [hr * 1.05, headY - hr * 0.9], [hr * 1.02, headY - hr * 0.1], [hr * 0.45, headY - hr * 0.35], [-hr * 0.45, headY - hr * 0.35]], hair, { weight: 2 });
    }
    const mood = o.mood || 'calm', ey = headY - hr * 0.02;
    if (o.blink) {
      K.line(-hr * 0.45, ey, -hr * 0.15, ey, { weight: 2.5 });
      K.line(hr * 0.15, ey, hr * 0.45, ey, { weight: 2.5 });
    } else if (mood === 'surprised') {
      K.circle(-hr * 0.32, ey, hr * 0.2, '#fff', { weight: 2 });
      K.circle(hr * 0.32, ey, hr * 0.2, '#fff', { weight: 2 });
      K.circle(-hr * 0.32, ey, hr * 0.07, PAL.ink, { stroke: false });
      K.circle(hr * 0.32, ey, hr * 0.07, PAL.ink, { stroke: false });
    } else {
      K.ellipse(-hr * 0.32, ey, hr * 0.09, hr * 0.13, PAL.ink, { stroke: false, segments: 10 });
      K.ellipse(hr * 0.32, ey, hr * 0.09, hr * 0.13, PAL.ink, { stroke: false, segments: 10 });
    }
    const my = headY + hr * 0.42;
    if (mood === 'surprised') K.ellipse(0, my, hr * 0.12, hr * 0.16, '#7a2e2e', { weight: 2, segments: 10 });
    else K.curve([[-hr * 0.28, my], [0, my + hr * 0.16], [hr * 0.28, my]], { weight: 2 });
    if (o.beard) K.ellipse(0, headY + hr * 0.45, hr * 0.55, hr * 0.4, o.beard, { weight: 2 });
    pop();
  };

  K.cat = function (x, y, s, o = {}) {
    const col = o.color || '#c4a574', dark = '#8d7048';
    const t = o.t === undefined ? K.t : o.t;
    const pose = o.pose || 'sit';
    push(); translate(x, y); if (o.rot) rotate(o.rot); scale(o.facing || 1, 1);
    const tail = Math.sin(t * 4) * 0.5;
    if (pose === 'stretch') {
      K.ellipse(-s * 0.05, -s * 0.16, s * 0.55, s * 0.16, col);
      K.circle(s * 0.42, -s * 0.28, s * 0.16, col);
      K.curve([[-s * 0.5, -s * 0.18], [-s * 0.85, -s * 0.45 + tail * s * 0.2], [-s * 0.55, -s * 0.55]], { weight: 7, color: col });
    } else if (pose === 'leap') {
      K.ellipse(0, -s * 0.22, s * 0.42, s * 0.16, col);
      K.circle(s * 0.32, -s * 0.38, s * 0.16, col);
      K.streak(-s * 0.2, -s * 0.1, -s * 0.45, s * 0.02, s * 0.06, col);
      K.streak(s * 0.05, -s * 0.12, s * 0.28, -s * 0.02, s * 0.05, col);
    } else {
      K.ellipse(0, -s * 0.2, s * 0.34, s * 0.22, col);
      K.circle(s * 0.22, -s * 0.42, s * 0.18, col);
      K.curve([[-s * 0.28, -s * 0.28], [-s * 0.55, -s * 0.62 - tail * s * 0.15], [-s * 0.2, -s * 0.72]], { weight: 6, color: col });
    }
    const hx = pose === 'stretch' ? s * 0.42 : s * 0.22;
    const hy = pose === 'stretch' ? -s * 0.28 : -s * 0.42;
    K.poly([[hx - s * 0.1, hy - s * 0.08], [hx - s * 0.04, hy - s * 0.28], [hx + s * 0.02, hy - s * 0.06]], col, { weight: 2 });
    K.poly([[hx + s * 0.02, hy - s * 0.08], [hx + s * 0.12, hy - s * 0.26], [hx + s * 0.14, hy - s * 0.04]], col, { weight: 2 });
    K.ellipse(hx - s * 0.04, hy + s * 0.02, s * 0.035, s * 0.05, PAL.ink, { stroke: false });
    K.ellipse(hx + s * 0.08, hy + s * 0.02, s * 0.035, s * 0.05, PAL.ink, { stroke: false });
    K.poly([[hx + s * 0.14, hy + s * 0.04], [hx + s * 0.24, hy + s * 0.06], [hx + s * 0.14, hy + s * 0.1]], '#e7b3b0', { weight: 1.5 });
    if (pose === 'sit') {
      K.ellipse(-s * 0.16, -s * 0.02, s * 0.06, s * 0.04, dark, { weight: 1.5 });
      K.ellipse(s * 0.08, -s * 0.02, s * 0.06, s * 0.04, dark, { weight: 1.5 });
    }
    pop();
  };

  K.bicycle = function (x, y, s, o = {}) {
    const spin = o.spin || 0, f = o.facing || 1;
    push(); translate(x, y); scale(f, 1);
    const wy = -s * 0.22, x0 = -s * 0.42, x1 = s * 0.42, r = s * 0.22;
    for (const wx of [x0, x1]) {
      K.circle(wx, wy, r, null, { weight: 3.5 });
      for (let i = 0; i < 4; i++) {
        const a = spin + i * Math.PI / 4;
        K.line(wx, wy, wx + Math.cos(a) * r * 0.85, wy + Math.sin(a) * r * 0.85, { weight: 1.5, color: '#444' });
      }
    }
    K.line(x0, wy, -s * 0.05, -s * 0.55, { weight: 3.5, color: '#243044' });
    K.line(x1, wy, s * 0.08, -s * 0.62, { weight: 3.5, color: '#243044' });
    K.line(-s * 0.05, -s * 0.55, s * 0.08, -s * 0.62, { weight: 3.5, color: '#243044' });
    K.line(-s * 0.02, -s * 0.5, s * 0.22, -s * 0.48, { weight: 3, color: '#243044' });
    K.line(x0, wy, s * 0.02, -s * 0.28, { weight: 3, color: '#243044' });
    K.circle(-s * 0.02, -s * 0.58, s * 0.035, '#c0392b', { weight: 2 });
    if (o.basket !== false) {
      K.rect(s * 0.18, -s * 0.78, s * 0.34, s * 0.24, '#8d5a32', { weight: 2.5, r: 4 });
      K.line(s * 0.22, -s * 0.7, s * 0.48, -s * 0.7, { weight: 1.5, color: '#5c3b22' });
    }
    if (o.lamp) {
      K.rect(s * 0.12, -s * 0.7, s * 0.1, s * 0.06, '#222', { weight: 2 });
      K.circle(s * 0.22, -s * 0.67, s * 0.05, '#fff4c4', { stroke: false, alpha: 200 });
      K.streak(s * 0.28, -s * 0.67, s * 0.7, -s * 0.55, s * 0.08, '#fff4c4', 80);
    }
    pop();
  };

  K.loaf = function (x, y, s, rise, o = {}) {
    const h = s * (0.28 + 0.85 * K.clamp(rise, 0, 1.6));
    const col = o.color || '#e2b56a';
    K.rect(x - s * 0.42, y - s * 0.12, s * 0.84, s * 0.14, '#c9d2d4', { weight: 2, r: 2 });
    K.ellipse(x, y - s * 0.1 - h * 0.45, s * 0.4, h * 0.55, col, { weight: 3 });
    K.curve([[x - s * 0.16, y - s * 0.1 - h * 0.2], [x, y - s * 0.1 - h * 0.55], [x + s * 0.16, y - s * 0.1 - h * 0.2]], { weight: 2, color: '#a6743a' });
    if (rise > 0.9) K.streak(x - 4, y - s * 0.15 - h, x + 6, y - s * 0.45 - h, 4, '#f7f7f7', 140);
  };

  K.submarine = function (x, y, s, o = {}) {
    push(); translate(x, y); if (o.rot) rotate(o.rot);
    K.ellipse(0, 0, s * 0.46, s * 0.16, o.color || '#3e4a55', { weight: 4 });
    K.rect(-s * 0.08, -s * 0.28, s * 0.16, s * 0.16, '#2e3842', { weight: 3, r: 3 });
    K.rect(-s * 0.02, -s * 0.34, s * 0.045, s * 0.1, '#222', { weight: 2 });
    for (let i = -2; i <= 2; i++) K.circle(i * s * 0.12, s * 0.02, s * 0.028, o.glow ? '#ffb25a' : '#9fd0e6', { weight: 2 });
    K.circle(s * 0.42, 0, s * 0.05, '#2a3036', { weight: 2 });
    K.line(s * 0.46, -s * 0.04, s * 0.52, -s * 0.08, { weight: 2 });
    K.line(s * 0.46, s * 0.04, s * 0.52, s * 0.08, { weight: 2 });
    pop();
  };

  K.gauge = function (x, y, r, needle, o = {}) {
    K.circle(x, y, r, '#1a1c1a', { weight: 4 });
    K.circle(x, y, r * 0.82, '#e7e2d4', { weight: 3 });
    K.poly([[x, y], [x + r * 0.55, y - r * 0.45], [x + r * 0.2, y - r * 0.7]], '#c0392b', { stroke: false, alpha: 180 });
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI * 0.15 + i * (Math.PI * 0.7) / 8;
      K.line(x - Math.cos(a) * r * 0.62, y - Math.sin(a) * r * 0.62, x - Math.cos(a) * r * 0.74, y - Math.sin(a) * r * 0.74, { weight: 2 });
    }
    const a = Math.PI * 0.15 + K.clamp(needle, 0, 1) * Math.PI * 0.7;
    K.line(x, y, x - Math.cos(a) * r * 0.58, y - Math.sin(a) * r * 0.58, { weight: 3.5, color: '#8e1e1e' });
    K.circle(x, y, r * 0.06, '#222', { stroke: false });
    const drip = o.drip || 0;
    if (drip > 0) {
      const dy = (drip % 1) * r * 2.2;
      K.circle(x + r * 0.15, y + r * 0.9 + dy, 4 + 2 * Math.sin(drip * 6), '#8ec8e8', { weight: 1.5 });
    }
    if (o.label) K.label(o.label, x, y + r + 28, { size: 18, font: 'bold' });
  };

  K.paperBoat = function (x, y, s, o = {}) {
    push(); translate(x, y); if (o.rot) rotate(o.rot);
    K.poly([[-s, 0], [0, -s * 0.55], [s, 0], [s * 0.55, s * 0.28], [-s * 0.55, s * 0.28]], '#f7f4ea', { weight: 3 });
    K.line(-s * 0.15, -s * 0.08, s * 0.15, -s * 0.08, { weight: 2, color: '#d9d3c4' });
    K.poly([[0, -s * 0.5], [s * 0.08, -s * 0.15], [-s * 0.08, -s * 0.15]], '#fff', { weight: 2 });
    pop();
  };

  K.helmet = function (x, y, s, rot, o = {}) {
    push(); translate(x, y); rotate(rot || 0);
    const c = o.color || '#f4f4f4';
    K.ellipse(0, 0, s * 0.46, s * 0.38, c, { weight: 3.5 });
    K.rect(-s * 0.5, s * 0.05, s, s * 0.16, c, { weight: 3 });
    if (o.star !== false) K.circle(s * 0.02, -s * 0.02, s * 0.12, '#ffd83d', { weight: 2 });
    pop();
  };

  K.kitchen = function (t, o = {}) {
    const dawn = o.dawn || 0;
    const wallTop = K.mix('#2a241c', '#6a84a4', dawn);
    const wallBot = K.mix('#4a4036', '#cbb89a', dawn);
    K.gradient(0, 0, 1280, 430, wallTop, wallBot, 8);
    const skyA = K.mix('#141a28', '#f0c9a0', dawn);
    const skyB = K.mix('#243044', '#f7e2c4', dawn);
    K.rect(860, 70, 380, 250, skyB, { weight: 5 });
    K.gradient(868, 78, 364, 234, skyA, skyB, 6);
    if (dawn < 0.7) K.circle(980, 150, 18, '#f4f1e4', { stroke: false, alpha: Math.round(180 * (1 - dawn)) });
    K.rect(40, 500, 760, 28, '#6d5844', { weight: 3 });
    K.rect(40, 528, 760, 112, '#3d342c', { weight: 3 });
    for (let i = 0; i < 4; i++) K.rect(70 + i * 180, 548, 150, 70, '#2a241e', { weight: 2, r: 3 });
    K.rect(0, 640, 1280, 80, '#5c4634', { weight: 3 });
    for (let x = 0; x < 1280; x += 80) K.line(x, 640, x, 720, { weight: 2, color: '#3d3126' });
    const glow = o.ovenGlow === undefined ? 0.7 : o.ovenGlow;
    K.rect(180, 330, 220, 170, '#2a2420', { weight: 4, r: 6 });
    K.rect(200, 350, 180, 110, K.mix('#1a120c', '#ff9a3c', glow), { weight: 3, r: 4 });
    if (glow > 0.2) K.rect(208, 358, 164, 94, '#ffb25a', { stroke: false, alpha: Math.round(80 * glow) });
    K.rect(250, 468, 80, 14, '#888', { weight: 2, r: 4 });
    K.circle(620, 120, 16, '#5a5348', { weight: 2 });
    K.line(620, 136, 620, 210, { weight: 2, color: '#5a5348' });
    K.ellipse(620, 230, 70, 16, '#f4e7b0', { weight: 2.5, alpha: 180 });
    if (o.door > 0) {
      K.rect(1120, 250, 140, 390, '#1a120c', { stroke: false });
      K.rect(1140, 280, 100, 300, skyB, { weight: 3 });
    }
    return { floor: 640, counter: 500 };
  };

  K.controlRoom = function (t, o = {}) {
    K.gradient(0, 0, 1280, 720, '#12161c', '#2a3038', 8);
    K.rect(0, 600, 1280, 120, '#1a1e24', { weight: 3 });
    for (let x = 40; x < 1240; x += 70) K.line(x, 600, x, 720, { weight: 2, color: '#0e1216' });
    for (let i = 0; i < 18; i++) {
      const x = 80 + (i % 9) * 130, y = 80 + Math.floor(i / 9) * 200;
      K.circle(x, y, 5, '#5a5148', { weight: 1.5 });
    }
    K.circle(1040, 250, 120, '#0c141c', { weight: 8 });
    K.circle(1040, 250, 100, '#163044', { stroke: false });
    const bob = Math.sin(t * 0.8) * 6;
    K.rect(960, 250 + bob, 160, 8, '#2a4458', { stroke: false, alpha: 90 });
    K.circle(180, 80, 10, '#c0392b', { stroke: false });
    K.streak(180, 80, 420, 520, 40, '#c0392b', 18);
    return { floor: 600, porthole: [1040, 250] };
  };

  K.derbyBank = function (t, o = {}) {
    K.gradient(0, 0, 1280, 420, '#1a1020', '#3a2418', 8);
    for (let i = 0; i < 6; i++) {
      const x = 120 + i * 200;
      K.rect(x, 20, 16, 40, '#222', { weight: 2 });
      K.circle(x + 8, 70, 22, '#fff1c2', { stroke: false, alpha: 210 });
      K.streak(x + 8, 90, x + 8, 360, 36, '#fff1c2', 28);
    }
    K.ellipse(640, 760, 760, 280, '#6a3a22', { weight: 4 });
    K.ellipse(640, 760, 620, 220, '#c47a3a', { weight: 3 });
    K.ellipse(640, 760, 470, 150, '#5a3218', { stroke: false });
    K.ellipse(640, 690, 560, 40, '#f2e2a8', { stroke: false, alpha: 160 });
    K.rect(0, 640, 1280, 80, '#4a2a16', { stroke: false });
    return { floor: 630 };
  };
})();
