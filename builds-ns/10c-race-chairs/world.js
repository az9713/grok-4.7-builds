// ROLLCALL — indoor convention center: carpet, booths, escalators, office chairs. No outdoors.
'use strict';

const V3 = THREE.Vector3;
const W = { t: 0, wave: { amp: 0.012, speed: 0.2 }, track: null };
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
const _p = new V3(), _sc = new V3(), _bp = new V3(), _bs = new V3(1, 1, 1);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash3(x, y, z) {
  let h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
}
function waveHeight(x, z, t) {
  const a = W.wave.amp;
  return a * Math.sin(x * 0.01 + z * 0.01 + t * 0.2);
}
function waveSlope(x, z, t) {
  const e = 1.5;
  return { dx: (waveHeight(x + e, z, t) - waveHeight(x - e, z, t)) / (2 * e),
           dz: (waveHeight(x, z + e, t) - waveHeight(x, z - e, t)) / (2 * e) };
}

function initRenderer() {
  const canvas = document.getElementById('gl');
  W.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  W.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  W.renderer.setSize(window.innerWidth, window.innerHeight, false);
  W.scene = new THREE.Scene();
  W.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.5, 800);
  W.hemi = new THREE.HemisphereLight(0xf4f6fb, 0x8a8175, 0.85);
  W.sun = new THREE.DirectionalLight(0xffffff, 0.45);
  W.sun.position.set(0, 380, 40);
  W.scene.add(W.hemi, W.sun);
  window.addEventListener('resize', () => {
    W.renderer.setSize(window.innerWidth, window.innerHeight, false);
    W.camera.aspect = window.innerWidth / window.innerHeight;
    W.camera.updateProjectionMatrix();
  });
  buildSharedAssets();
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function jitter(geom, amt, seed) {
  const p = geom.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const kx = Math.round(x * 50), ky = Math.round(y * 50), kz = Math.round(z * 50);
    p.setXYZ(i, x + (hash3(kx, ky, kz + seed) - 0.5) * amt,
                y + (hash3(ky, kz, kx + seed) - 0.5) * amt * 0.3,
                z + (hash3(kz, kx, ky + seed) - 0.5) * amt);
  }
  return geom;
}
class Merger {
  constructor() { this.pos = []; this.col = []; }
  add(geom, matrix, color) {
    const g = geom.index ? geom.toNonIndexed() : geom.clone();
    g.applyMatrix4(matrix);
    const p = g.attributes.position.array, c = new THREE.Color(color);
    for (let i = 0; i < p.length; i += 3) {
      this.pos.push(p[i], p[i + 1], p[i + 2]);
      const k = 0.94 + hash3(p[i] | 0, p[i + 1] | 0, p[i + 2] | 0) * 0.1;
      this.col.push(c.r * k, c.g * k, c.b * k);
    }
    g.dispose();
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeVertexNormals();
    return new THREE.Mesh(g, new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 6 }));
  }
}
function mtx(x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  _e.set(rx, ry, rz); _q.setFromEuler(_e); _sc.set(sx, sy, sz);
  return new THREE.Matrix4().compose(new V3(x, y, z), _q, _sc);
}

const A = {};
function buildSharedAssets() {
  A.crateTex = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#d7c4a2'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#6b4a32'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.font = 'bold 86px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#243044'; g.fillText('?', w / 2, h / 2 + 4);
  });
  A.crateGeo = new THREE.BoxGeometry(2.4, 2.2, 2.4);
  A.crateMat = new THREE.MeshPhongMaterial({ map: A.crateTex, shininess: 8 });
  A.rampTex = canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#8d97a3'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#6a7380';
    for (let y = 0; y < h; y += 18) g.fillRect(0, y, w, 3);
    g.fillStyle = '#ffe14a'; g.fillRect(0, 0, 10, h); g.fillRect(w - 10, 0, 10, h);
  });
  A.bannerTex = canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = '#243044'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffe14a'; g.fillRect(0, 0, w, 8); g.fillRect(0, h - 8, w, 8);
    g.font = 'bold 34px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#fff'; g.fillText(THEME.banner, w / 2, h / 2 + 1);
  });
  A.poleGeo = new THREE.CylinderGeometry(0.09, 0.11, 1, 6);
  A.poleGeo.translate(0, 0.5, 0);
  A.poleMat = new THREE.MeshPhongMaterial({ color: 0xc5c9d1, shininess: 40, flatShading: true });
  A.bulbGeo = new THREE.SphereGeometry(0.28, 6, 5);
  A.bulbMat = new THREE.MeshPhongMaterial({ color: 0xffe14a, shininess: 30, flatShading: true });
  A.shadowGeo = new THREE.CircleGeometry(1.5, 12).rotateX(-Math.PI / 2);
  A.shadowMat = new THREE.MeshBasicMaterial({ color: 0x243044, transparent: true, opacity: 0.28, depthWrite: false });
  A.redMat = new THREE.MeshPhongMaterial({ color: 0xff4040, emissive: 0x330000, flatShading: true });
}

function buildSky(sky) {
  const g = new THREE.Group();
  const H = 40, Wd = 780;
  const wallMat = new THREE.MeshPhongMaterial({ color: sky.bottom });
  const wall = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, y, z); g.add(m);
  };
  wall(Wd * 2, H, 3, 0, H / 2, -Wd);
  wall(Wd * 2, H, 3, 0, H / 2, Wd);
  wall(3, H, Wd * 2, -Wd, H / 2, 0);
  wall(3, H, Wd * 2, Wd, H / 2, 0);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(Wd * 2, Wd * 2).rotateX(Math.PI / 2),
    new THREE.MeshPhongMaterial({ color: 0xe4e1da, side: THREE.DoubleSide }));
  ceil.position.y = H; g.add(ceil);
  const lit = new THREE.MeshBasicMaterial({ color: 0xf7f8ff });
  for (let x = -280; x <= 280; x += 80) {
    for (let z = -280; z <= 280; z += 80) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(26, 0.4, 6), lit);
      p.position.set(x, 36, z); g.add(p);
    }
  }
  return g;
}

function buildGround(cx, cz, size, colors, ribbon) {
  const seg = 80;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg).rotateX(-Math.PI / 2);
  geo.translate(cx, 0, cz);
  const n = geo.attributes.position.count;
  geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
  const mat = new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 4, specular: 0x222222 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.deep = new THREE.Color(colors.deep);
  mesh.userData.crest = new THREE.Color(colors.crest);
  mesh.userData.ribbon = ribbon;
  const far = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2),
    new THREE.MeshPhongMaterial({ color: colors.far, shininess: 2 }));
  far.position.set(cx, -0.2, cz);
  return { mesh, far };
}
function stampTrackDist(mesh, tr) {
  const pa = mesh.geometry.attributes.position.array;
  const dist = new Float32Array(pa.length / 3);
  const N = tr.N;
  for (let v = 0, i = 0; i < pa.length; i += 3, v++) {
    let md = 1e9;
    for (let k = 0; k < N; k += 5) {
      const d = (pa[i] - tr.px[k]) ** 2 + (pa[i + 2] - tr.pz[k]) ** 2;
      if (d < md) md = d;
    }
    dist[v] = Math.sqrt(md);
  }
  mesh.userData.dist = dist;
}
function updateGround(mesh, t) {
  const g = mesh.geometry, p = g.attributes.position, c = g.attributes.color;
  const pa = p.array, ca = c.array, deep = mesh.userData.deep, crest = mesh.userData.crest;
  const dist = mesh.userData.dist, ribbon = mesh.userData.ribbon;
  for (let i = 0, v = 0; i < pa.length; i += 3, v++) {
    pa[i + 1] = waveHeight(pa[i], pa[i + 2], t);
    const dd = dist ? dist[v] : 0;
    const aisle = dd < ribbon ? 1 : 0;
    const tile = ((Math.floor(pa[i] / 5) + Math.floor(pa[i + 2] / 5)) & 1) ? 0.07 : -0.04;
    let k = (aisle ? 0.84 : 0.2) + tile;
    k = k < 0 ? 0 : k > 1 ? 1 : k;
    ca[i] = deep.r + (crest.r - deep.r) * k;
    ca[i + 1] = deep.g + (crest.g - deep.g) * k;
    ca[i + 2] = deep.b + (crest.b - deep.b) * k;
  }
  p.needsUpdate = true; c.needsUpdate = true;
  g.computeBoundingSphere();
}

function buildTrack(def) {
  const tr = { def, group: new THREE.Group(), hw: def.halfWidth, holes: [], cracks: [] };
  W.wave = { amp: def.wave.amp, speed: def.wave.speed };
  const pts = def.points.map(([x, z]) => new V3(x, 0, z));
  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
  const N = 1000;
  const sp = curve.getSpacedPoints(N);
  tr.N = N;
  tr.px = new Float32Array(N); tr.pz = new Float32Array(N);
  tr.tx = new Float32Array(N); tr.tz = new Float32Array(N);
  tr.lx = new Float32Array(N); tr.lz = new Float32Array(N);
  for (let i = 0; i < N; i++) { tr.px[i] = sp[i].x; tr.pz[i] = sp[i].z; }
  let len = 0;
  for (let i = 0; i < N; i++) {
    const a = (i + N - 1) % N, b = (i + 1) % N;
    let dx = tr.px[b] - tr.px[a], dz = tr.pz[b] - tr.pz[a];
    const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    tr.tx[i] = dx; tr.tz[i] = dz; tr.lx[i] = dz; tr.lz[i] = -dx;
    len += Math.hypot(tr.px[b] - tr.px[i], tr.pz[b] - tr.pz[i]);
  }
  tr.length = len; tr.ds = len / N;
  let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
  for (let i = 0; i < N; i++) { minX = Math.min(minX, tr.px[i]); maxX = Math.max(maxX, tr.px[i]); minZ = Math.min(minZ, tr.pz[i]); maxZ = Math.max(maxZ, tr.pz[i]); }
  tr.bounds = { minX, maxX, minZ, maxZ, cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2 };
  const curv = i => { const a = (i + N - 8) % N, b = (i + 8) % N; return 1 - (tr.tx[a] * tr.tx[b] + tr.tz[a] * tr.tz[b]); };
  const straightNear = (i0, r) => { let best = i0, bv = 9; for (let k = -r; k <= r; k++) { const i = (i0 + k + N) % N, v = curv(i); if (v < bv) { bv = v; best = i; } } return best; };

  const L = def.lights;
  W.scene.background = new THREE.Color(def.sky.bottom);
  W.scene.fog = new THREE.Fog(def.sky.fog, def.sky.near, def.sky.far);
  W.hemi.color.set(L.hemi); W.hemi.groundColor.set(L.ground); W.hemi.intensity = L.hemiI;
  W.sun.color.set(L.sun); W.sun.intensity = L.sunI;
  if (L.sunPos) W.sun.position.set(L.sunPos[0], L.sunPos[1], L.sunPos[2]);
  tr.group.add(buildSky(def.sky));
  const size = Math.max(maxX - minX, maxZ - minZ) + 280;
  const ground = buildGround(tr.bounds.cx, tr.bounds.cz, size, def.ground, def.ribbon);
  tr.ground = ground.mesh; tr.group.add(ground.mesh, ground.far);
  stampTrackDist(tr.ground, tr);
  addEdgeMarkers(tr, def);
  addRacingLine(tr, def.line);

  tr.ramps = def.ramps.map((t, n) => {
    const i = straightNear(Math.floor(t * N) % N, 40);
    const lat = [0, -0.3, 0.3][n % 3] * tr.hw;
    const r = { i, len: 16, w: 11, h: 3.6, lat,
      x: tr.px[i] + tr.lx[i] * lat, z: tr.pz[i] + tr.lz[i] * lat, tx: tr.tx[i], tz: tr.tz[i], lx: tr.lx[i], lz: tr.lz[i], y: 0 };
    r.mesh = buildRampMesh(r); tr.group.add(r.mesh);
    return r;
  });
  tr.crates = [];
  def.crates.forEach(t => {
    let i = Math.floor(t * N) % N;
    for (const r of tr.ramps) { const dd = (i - r.i + N) % N; if (dd < 36 || dd > N - 36) i = (i + 48) % N; }
    [-0.58, -0.29, 0, 0.29, 0.58].forEach((f, k) => {
      const m = new THREE.Mesh(A.crateGeo, A.crateMat);
      const c = { i, x: tr.px[i] + tr.lx[i] * f * tr.hw, z: tr.pz[i] + tr.lz[i] * f * tr.hw, mesh: m, respawn: 0, phase: k * 0.7 + i };
      m.position.set(c.x, 1.25, c.z); tr.group.add(m); tr.crates.push(c);
    });
  });

  const mg = new Merger(), rnd = mulberry32(def.seed);
  scatterDress(tr, mg, rnd, def);
  addGate(tr, mg);
  tr.decor = mg.build(); tr.group.add(tr.decor);
  W.scene.add(tr.group);
  W.track = tr;
  return tr;
}

function addEdgeMarkers(tr, def) {
  const N = tr.N, step = Math.max(1, Math.round((def.markerEvery || 12) / tr.ds));
  const list = [];
  for (let i = 0; i < N; i += step) for (const side of [1, -1]) {
    list.push({ x: tr.px[i] + tr.lx[i] * (tr.hw + 1.5) * side, z: tr.pz[i] + tr.lz[i] * (tr.hw + 1.5) * side, k: (i / step) | 0 });
  }
  const poles = new THREE.InstancedMesh(A.poleGeo, A.poleMat, list.length);
  const bulbs = new THREE.InstancedMesh(A.bulbGeo, A.bulbMat, list.length);
  const cA = new THREE.Color('#243044'), cB = new THREE.Color('#ffe14a');
  list.forEach((b, i) => bulbs.setColorAt(i, b.k % 2 ? cA : cB));
  tr.markers = { poles, bulbs, list, h: 1.45 };
  tr.sway = 0;
  tr.group.add(poles, bulbs);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new V3(), s = new V3();
  list.forEach((b, i) => {
    m.compose(p.set(b.x, 0, b.z), q, s.set(1, 1.45, 1));
    poles.setMatrixAt(i, m);
    m.compose(p.set(b.x, 1.55, b.z), q, s.set(1, 1, 1));
    bulbs.setMatrixAt(i, m);
  });
}
function addRacingLine(tr, color) {
  const step = 10, count = Math.ceil(tr.N / step);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.55, 0.04, 1), new THREE.MeshBasicMaterial({ color }), count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new V3(), s = new V3();
  let n = 0;
  for (let i = 0; i < tr.N; i += step) {
    e.set(0, Math.atan2(tr.tx[i], tr.tz[i]), 0); q.setFromEuler(e);
    m.compose(p.set(tr.px[i], 0.06, tr.pz[i]), q, s.set(1, 1, Math.max(1, tr.ds * step * 0.5)));
    mesh.setMatrixAt(n++, m);
  }
  mesh.count = n; tr.group.add(mesh);
}
function scatterDress(tr, mg, rnd, def) {
  const { minX, maxX, minZ, maxZ } = tr.bounds, N = tr.N, sc = def.scatter;
  const distToTrack = (x, z) => { let md = 1e9; for (let i = 0; i < N; i += 4) { const d = Math.hypot(x - tr.px[i], z - tr.pz[i]); if (d < md) md = d; } return md; };
  const islands = [];
  for (let tries = 0; islands.length < sc.count && tries < 1400; tries++) {
    const rad = sc.r0 + rnd() * (sc.r1 - sc.r0);
    const x = minX - sc.pad + rnd() * (maxX - minX + sc.pad * 2);
    const z = minZ - sc.pad + rnd() * (maxZ - minZ + sc.pad * 2);
    const d = distToTrack(x, z);
    if (d < tr.hw + sc.near || d > tr.hw + sc.far) continue;
    if (islands.some(o => Math.hypot(o.x - x, o.z - z) < o.r + rad + 3)) continue;
    islands.push({ x, z, r: rad });
  }
  tr.islands = islands;
  islands.forEach((is, n) => addDress(mg, is, rnd, n, def.dress));
}
function addDress(mg, is, rnd, n, dress) {
  const { x, z, r } = is, rot = rnd() * 6;
  if (dress === 'escalator') {
    mg.add(new THREE.BoxGeometry(0.35, 2.4, r * 1.6), mtx(x, 1.2, z, 0, rot, 0), '#c5c9d1');
    mg.add(new THREE.BoxGeometry(0.5, 0.18, r * 1.7), mtx(x, 2.35, z, 0, rot, 0), '#2a313c');
    mg.add(new THREE.BoxGeometry(0.12, 1.3, r * 1.2), mtx(x, 1.3, z, 0, rot, 0), '#9ec4d4');
    return;
  }
  if (dress === 'dock') {
    mg.add(new THREE.BoxGeometry(r * 1.1, 0.22, r * 0.85), mtx(x, 0.12, z, 0, rot, 0), '#c4a46a');
    mg.add(new THREE.BoxGeometry(r * 0.55, r * 0.5, r * 0.5), mtx(x, 0.55, z, 0, rot, 0), '#d7c4a2');
    mg.add(new THREE.BoxGeometry(r * 0.35, r * 0.35, r * 0.35), mtx(x + 0.3, 0.85, z, 0, rot + 0.3, 0), '#b7c3a2');
    if (n % 3 === 0) {
      mg.add(new THREE.BoxGeometry(r * 1.3, 4.2, 0.28), mtx(x, 2.1, z, 0, rot, 0), '#8d97a3');
      mg.add(new THREE.BoxGeometry(r, 3.0, 0.16), mtx(x, 1.7, z, 0, rot, 0), '#3e4650');
    }
    return;
  }
  const col = ['#2f5d9f', '#8a3d4a', '#2f6b4f', '#6a4a8a', '#c47a2a'][n % 5];
  mg.add(new THREE.BoxGeometry(r * 1.7, 3.1, 0.22), mtx(x, 1.55, z, 0, rot, 0), col);
  mg.add(new THREE.BoxGeometry(r * 1.5, 0.55, 0.28), mtx(x, 3.15, z, 0, rot, 0), '#f2c14e');
  mg.add(new THREE.BoxGeometry(r * 0.9, 0.9, 0.55), mtx(x, 0.5, z, 0, rot, 0), '#e4dfd4');
  const px = x + Math.cos(rot) * r * 0.2, pz = z + Math.sin(rot) * r * 0.2;
  mg.add(new THREE.CylinderGeometry(0.18, 0.22, 0.35, 5), mtx(px, 0.2, pz), '#6b4a32');
  mg.add(new THREE.DodecahedronGeometry(0.42, 0), mtx(px, 0.7, pz), '#2f8f4e');
}
function addGate(tr, mg) {
  const i = 0, px = tr.px[i], pz = tr.pz[i], lx = tr.lx[i], lz = tr.lz[i];
  const yaw = Math.atan2(tr.tx[i], tr.tz[i]);
  for (const s of [1, -1]) {
    const x = px + lx * (tr.hw + 1.8) * s, z = pz + lz * (tr.hw + 1.8) * s;
    mg.add(new THREE.BoxGeometry(0.45, 5.5, 0.45), mtx(x, 2.7, z), '#8d97a3');
    mg.add(new THREE.BoxGeometry(0.7, 0.7, 0.7), mtx(x, 5.6, z), '#ffe14a');
  }
  const banner = new THREE.Mesh(new THREE.BoxGeometry((tr.hw + 1.8) * 2, 1.8, 0.25),
    [0, 0, 0, 0, 1, 1].map(k => k ? new THREE.MeshBasicMaterial({ map: A.bannerTex }) : new THREE.MeshPhongMaterial({ color: 0x243044 })));
  banner.position.set(px, 5.2, pz); banner.rotation.y = yaw;
  tr.group.add(banner);
}
function buildRampMesh(r) {
  const L = r.len, w = r.w / 2, h = r.h;
  const top = new THREE.BufferGeometry();
  top.setAttribute('position', new THREE.Float32BufferAttribute([-w, 0, 0, w, 0, 0, w, h, L, -w, 0, 0, w, h, L, -w, h, L], 3));
  top.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
  top.computeVertexNormals();
  const body = new THREE.BufferGeometry();
  body.setAttribute('position', new THREE.Float32BufferAttribute([
    -w, 0, 0, -w, h, L, -w, -0.3, L, -w, 0, 0, -w, -0.3, L, -w, -0.3, 0,
     w, 0, 0, w, -0.3, L, w, h, L, w, 0, 0, w, -0.3, 0, w, -0.3, L,
    -w, h, L, w, h, L, w, -0.3, L, -w, h, L, w, -0.3, L, -w, -0.3, L], 3));
  body.computeVertexNormals();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(top, new THREE.MeshPhongMaterial({ map: A.rampTex, shininess: 20, side: THREE.DoubleSide })));
  g.add(new THREE.Mesh(body, new THREE.MeshPhongMaterial({ color: 0x5c6570, flatShading: true, side: THREE.DoubleSide })));
  for (const s of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, L + 0.4), new THREE.MeshPhongMaterial({ color: 0x2a313c, flatShading: true }));
    rail.position.set(s * (w + 0.2), h * 0.45, L / 2); g.add(rail);
  }
  g.position.set(r.x, 0, r.z);
  g.rotation.y = Math.atan2(r.tx, r.tz);
  return g;
}
function disposeTrack() {
  const tr = W.track; if (!tr) return;
  W.scene.remove(tr.group);
  tr.group.traverse(o => { if (o.geometry && !Object.values(A).includes(o.geometry)) o.geometry.dispose(); });
  W.track = null;
}
function updateTrackFX(tr, t) {
  for (const r of tr.ramps) r.mesh.position.y = r.y;
  for (const c of tr.crates) {
    c.mesh.visible = c.respawn <= 0;
    c.mesh.position.y = 1.2 + Math.sin(t * 2.2 + c.phase) * 0.18;
    c.mesh.rotation.y = t * 1.1 + c.phase;
  }
  updateGround(tr.ground, t);
}

function buildVehicle(ch) {
  const root = new THREE.Group(), tilt = new THREE.Group(); root.add(tilt);
  const phong = (c, extra) => new THREE.MeshPhongMaterial(Object.assign({ color: c, flatShading: true, shininess: 18 }, extra || {}));
  const metal = phong(0xb7bdc6, { shininess: 50 });
  const base = new THREE.Group(); tilt.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.55, 6), metal);
  post.position.y = 0.55; base.add(post);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.12), metal);
    leg.position.set(Math.cos(a) * 0.42, 0.32, Math.sin(a) * 0.42);
    leg.rotation.y = -a; base.add(leg);
    const caster = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), phong(0x1a1e24));
    caster.position.set(Math.cos(a) * 0.82, 0.16, Math.sin(a) * 0.82); base.add(caster);
  }
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.2, 1.4), phong(0x2c3340));
  seat.position.y = 1.05; tilt.add(seat);
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 1.2), phong(ch.color));
  cushion.position.y = 1.18; tilt.add(cushion);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.35, 0.16), phong(ch.color));
  back.position.set(0, 1.85, -0.62); tilt.add(back);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.9), metal);
    arm.position.set(s * 0.72, 1.4, -0.05); tilt.add(arm);
  }
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.22, 6), phong(0xf4f1ea));
  cup.position.set(0.55, 1.42, 0.25); tilt.add(cup);
  const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 6), phong(0x6b3a22));
  coffee.position.set(0.55, 1.54, 0.25); tilt.add(coffee);
  const rider = new THREE.Group(); rider.position.set(0, 1.2, -0.05);
  rider.scale.setScalar(0.78 + ch.stats.weight * 0.045);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.7), phong(0x243044)); legs.position.set(0, 0.15, 0.25); rider.add(legs);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.45), phong(0xf4f1ea)); torso.position.set(0, 0.7, 0.05); rider.add(torso);
  const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.35, 0.48), phong(ch.accent)); shirt.position.set(0, 0.85, 0.04); rider.add(shirt);
  const lanyard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.04), phong(0xff5a1f)); lanyard.position.set(0.12, 0.55, 0.28); rider.add(lanyard);
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.04), phong(0xffe14a)); badge.position.set(0.12, 0.22, 0.3); rider.add(badge);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), phong(ch.skin)); head.position.set(0, 1.3, 0.08); rider.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.36, 6, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), phong(ch.hair));
  hair.position.set(0, 1.42, 0.02); rider.add(hair);
  tilt.add(rider);
  const flame = new THREE.Group();
  for (let k = 0; k < 3; k++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.22 + k * 0.08, 5, 4), new THREE.MeshBasicMaterial({ color: 0xfff6ea, transparent: true, opacity: 0.7 }));
    p.position.set(0, 0.8, -1.3 - k * 0.28); flame.add(p);
  }
  flame.visible = false; tilt.add(flame);
  const bubble = new THREE.Mesh(new THREE.IcosahedronGeometry(2.3, 1), new THREE.MeshPhongMaterial({ color: 0xffe14a, transparent: true, opacity: 0.3, flatShading: true, depthWrite: false }));
  bubble.position.y = 1.4; bubble.visible = false; root.add(bubble);
  const cloud = new THREE.Group();
  for (let k = 0; k < 4; k++) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.04), phong(k % 2 ? 0xff5a1f : 0x243044));
    strip.position.set((k - 1.5) * 0.28, 2.5, 0); cloud.add(strip);
  }
  cloud.visible = false; root.add(cloud);
  const shadow = new THREE.Mesh(A.shadowGeo, A.shadowMat);
  return { root, tilt, flame, bubble, cloud, shadow, spinParts: null, yawParts: [base] };
}

function buildShotMesh() {
  const g = new THREE.Group();
  const paper = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshPhongMaterial({ color: 0xf7f4ee, side: THREE.DoubleSide, flatShading: true }));
  paper.geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 1.3, 0.7, 0.05, -0.6, -0.15, 0.05, -0.2,
    0, 0, 1.3, -0.15, 0.05, -0.2, -0.7, -0.02, -0.5,
  ], 3));
  paper.geometry.computeVertexNormals();
  g.add(paper);
  const blink = new THREE.Mesh(new THREE.SphereGeometry(0.1, 4, 3), A.redMat); blink.position.z = 1.2; g.add(blink);
  return g;
}
function buildMineMesh() {
  const g = new THREE.Group();
  const puddle = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.08, 10), new THREE.MeshPhongMaterial({ color: 0x1c1e22, shininess: 30, flatShading: true }));
  g.add(puddle);
  const blink = new THREE.Mesh(new THREE.SphereGeometry(0.14, 4, 3), A.redMat); blink.position.y = 0.16; g.add(blink);
  return g;
}

function buildSpray() {
  const max = 500;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(max * 3), col = new Float32Array(max * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const tex = canvasTex(32, 32, (g) => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); });
  const mat = new THREE.PointsMaterial({ size: 0.55, map: tex, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  const S = { pts, max, n: 0, p: [] };
  for (let i = 0; i < max; i++) S.p.push({ x: 0, y: -999, z: 0, vx: 0, vy: 0, vz: 0, life: 0, r: 1, g: 1, b: 1 });
  W.scene.add(pts); W.spray = S; return S;
}
function emitSpray(x, y, z, vx, vy, vz, life, r = 1, g = 1, b = 1) {
  const S = W.spray; if (!S) return;
  const p = S.p[S.n]; S.n = (S.n + 1) % S.max;
  p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.life = life; p.r = r; p.g = g; p.b = b;
}
function updateSpray(dt) {
  const S = W.spray; if (!S) return;
  const pa = S.pts.geometry.attributes.position.array, ca = S.pts.geometry.attributes.color.array;
  for (let i = 0; i < S.max; i++) {
    const p = S.p[i];
    if (p.life > 0) { p.life -= dt; p.vy -= 10 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.life <= 0) p.y = -999; }
    pa[i * 3] = p.x; pa[i * 3 + 1] = p.y; pa[i * 3 + 2] = p.z;
    const f = Math.min(1, p.life * 2) * 0.7; ca[i * 3] = p.r * f; ca[i * 3 + 1] = p.g * f; ca[i * 3 + 2] = p.b * f;
  }
  S.pts.geometry.attributes.position.needsUpdate = true;
  S.pts.geometry.attributes.color.needsUpdate = true;
}
