// STALLSHIFT — night market: asphalt, lanterns, stalls, delivery bicycles.
'use strict';

const V3 = THREE.Vector3;
const W = { t: 0, wave: { amp: 0.05, speed: 0.6 }, track: null };
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
  const a = W.wave.amp, s = W.wave.speed;
  return a * (0.62 * Math.sin(x * 0.07 + t * 1.3 * s)
            + 0.48 * Math.sin(z * 0.09 - t * 1.1 * s + 1.7)
            + 0.34 * Math.sin((x + z) * 0.045 + t * 0.8 * s));
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
  W.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.5, 5000);
  W.hemi = new THREE.HemisphereLight(0x6a78c8, 0x3a2018, 0.5);
  W.sun = new THREE.DirectionalLight(0xc9d6ff, 0.4);
  W.sun.position.set(180, 520, -80);
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
                y + (hash3(ky, kz, kx + seed) - 0.5) * amt * 0.6,
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
      const k = 0.92 + hash3(p[i] | 0, p[i + 1] | 0, p[i + 2] | 0) * 0.16;
      this.col.push(c.r * k, c.g * k, c.b * k);
    }
    g.dispose();
    if (geom !== g && !Object.values(A).includes(geom)) geom.dispose();
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeVertexNormals();
    return new THREE.Mesh(g, new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 8 }));
  }
}
function mtx(x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  _e.set(rx, ry, rz); _q.setFromEuler(_e); _sc.set(sx, sy, sz);
  return new THREE.Matrix4().compose(new V3(x, y, z), _q, _sc);
}

const A = {};
function buildSharedAssets() {
  A.crateTex = canvasTex(128, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#c23b4a'); gr.addColorStop(0.4, '#ffd23f'); gr.addColorStop(0.75, '#ff8a3c'); gr.addColorStop(1, '#7a2b3a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#fff6d8'; g.lineWidth = 10; g.strokeRect(6, 6, w - 12, h - 12);
    g.font = 'bold 90px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 8; g.strokeStyle = '#2a120c'; g.strokeText('?', w / 2, h / 2 + 4);
    g.fillStyle = '#fff'; g.fillText('?', w / 2, h / 2 + 4);
  });
  A.crateGeo = new THREE.BoxGeometry(2.6, 2.6, 2.6);
  A.crateMat = new THREE.MeshPhongMaterial({ map: A.crateTex, shininess: 30, specular: 0x442211 });
  A.rampTex = canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#8a5a32'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#6b4424';
    for (let y = 0; y < h; y += 28) g.fillRect(0, y, w, 6);
    g.fillStyle = '#ffd15a'; g.fillRect(0, h - 36, w, 18);
    g.fillStyle = '#2a120c'; g.fillRect(0, h - 28, w, 6);
  });
  A.bannerTex = canvasTex(512, 64, (g, w, h) => {
    for (let x = 0; x < w; x += 32) { g.fillStyle = (x / 32) % 2 ? '#c23b4a' : '#ffd56a'; g.fillRect(x, 0, 32, h); }
    g.fillStyle = '#2a120c'; g.fillRect(70, 8, w - 140, h - 16);
    g.font = 'bold 34px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffd56a'; g.fillText(THEME.banner, w / 2, h / 2 + 2);
  });
  A.poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 1, 5);
  A.poleGeo.translate(0, 0.5, 0);
  A.poleMat = new THREE.MeshPhongMaterial({ color: 0x3a2416, flatShading: true });
  A.bulbGeo = new THREE.SphereGeometry(0.46, 6, 5);
  A.bulbMat = new THREE.MeshBasicMaterial({ color: 0xffb020 });
  A.shadowGeo = new THREE.CircleGeometry(1.6, 12).rotateX(-Math.PI / 2);
  A.shadowMat = new THREE.MeshBasicMaterial({ color: 0x10080c, transparent: true, opacity: 0.4, depthWrite: false });
  A.tireGeo = new THREE.TorusGeometry(0.9, 0.13, 5, 12); A.tireGeo.rotateY(Math.PI / 2);
  A.spokeGeo = new THREE.BoxGeometry(0.05, 1.55, 0.05);
  A.redMat = new THREE.MeshPhongMaterial({ color: 0xff3030, emissive: 0x440000, flatShading: true });
}

function buildSky(sky) {
  const geo = new THREE.SphereGeometry(3000, 24, 12);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(sky.top) }, bottom: { value: new THREE.Color(sky.bottom) } },
    vertexShader: 'varying float vy; void main(){ vy = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying float vy; void main(){ float k = smoothstep(-0.02, 0.45, vy); gl_FragColor = vec4(mix(bottom, top, k), 1.0); }',
  });
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, mat));
  const moon = new THREE.Mesh(new THREE.CircleGeometry(90, 20), new THREE.MeshBasicMaterial({ color: sky.sun, fog: false }));
  moon.position.set(900, 1400, -600); moon.lookAt(0, 0, 0); g.add(moon);
  const rnd = mulberry32(7);
  const stars = [];
  for (let i = 0; i < 180; i++) {
    const a = rnd() * Math.PI * 2, b = 0.15 + rnd() * 1.15, d = 2200;
    stars.push(Math.cos(a) * Math.cos(b) * d, Math.sin(b) * d, Math.sin(a) * Math.cos(b) * d);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
  g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xfff4d0, size: 2.2, fog: false, sizeAttenuation: false })));
  const lanternMat = new THREE.MeshBasicMaterial({ color: 0xff7a3c, fog: false });
  for (let i = 0; i < 10; i++) {
    const a = rnd() * Math.PI * 2, d = 900 + rnd() * 500, y = 80 + rnd() * 160;
    const cl = new THREE.Group();
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(18 + rnd() * 16, 0), lanternMat);
      m.position.set(k * 28 - 28, rnd() * 10, 0); cl.add(m);
    }
    cl.position.set(Math.cos(a) * d, y, Math.sin(a) * d);
    g.add(cl);
  }
  return g;
}

function buildGround(cx, cz, size, colors, mode, ribbon) {
  const seg = 88;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg).rotateX(-Math.PI / 2);
  geo.translate(cx, 0, cz);
  const n = geo.attributes.position.count;
  geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
  const mat = new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 8, specular: 0x221408 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.deep = new THREE.Color(colors.deep);
  mesh.userData.crest = new THREE.Color(colors.crest);
  mesh.userData.mode = mode;
  mesh.userData.ribbon = ribbon;
  const far = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2),
    new THREE.MeshPhongMaterial({ color: colors.far, shininess: 2 }));
  far.position.set(cx, -0.35, cz);
  return { mesh, far };
}
function stampTrackDist(mesh, tr) {
  const pa = mesh.geometry.attributes.position.array;
  const dist = new Float32Array(pa.length / 3);
  const N = tr.N;
  for (let v = 0, i = 0; i < pa.length; i += 3, v++) {
    const x = pa[i], z = pa[i + 2];
    let md = 1e9;
    for (let k = 0; k < N; k += 5) {
      const d = (x - tr.px[k]) ** 2 + (z - tr.pz[k]) ** 2;
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
    const lit = Math.max(0, 1 - Math.max(0, dd - ribbon) / 22);
    let k = 0.12 + lit * 0.88;
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
  const size = Math.max(maxX - minX, maxZ - minZ) + 380;
  const ground = buildGround(tr.bounds.cx, tr.bounds.cz, size, def.ground, 'street', def.ribbon);
  tr.ground = ground.mesh; tr.group.add(ground.mesh, ground.far);
  stampTrackDist(tr.ground, tr);

  addEdgeMarkers(tr, def);
  addRacingLine(tr, def.line);

  tr.ramps = def.ramps.map((t, n) => {
    const i = straightNear(Math.floor(t * N) % N, 40);
    const lat = [0, -0.35, 0.35][n % 3] * tr.hw;
    const r = { i, len: 16, w: 12, h: 4.2, lat,
      x: tr.px[i] + tr.lx[i] * lat, z: tr.pz[i] + tr.lz[i] * lat, tx: tr.tx[i], tz: tr.tz[i], lx: tr.lx[i], lz: tr.lz[i], y: 0 };
    r.mesh = buildRampMesh(r); tr.group.add(r.mesh);
    return r;
  });

  tr.crates = [];
  def.crates.forEach(t => {
    let i = Math.floor(t * N) % N;
    for (const r of tr.ramps) { const dd = (i - r.i + N) % N; if (dd < 36 || dd > N - 36) i = (i + 48) % N; }
    [-0.62, -0.31, 0, 0.31, 0.62].forEach((f, k) => {
      const m = new THREE.Mesh(A.crateGeo, A.crateMat);
      const c = { i, x: tr.px[i] + tr.lx[i] * f * tr.hw, z: tr.pz[i] + tr.lz[i] * f * tr.hw, mesh: m, respawn: 0, phase: k * 0.7 + i };
      m.position.set(c.x, 1.4, c.z); tr.group.add(m); tr.crates.push(c);
    });
  });

  const mg = new Merger(), rnd = mulberry32(def.seed), glows = [];
  scatterDress(tr, mg, glows, rnd, def);
  addGate(tr, mg, glows);
  tr.decor = mg.build(); tr.group.add(tr.decor);
  addGlows(tr.group, glows);
  W.scene.add(tr.group);
  W.track = tr;
  return tr;
}

function addEdgeMarkers(tr, def) {
  const N = tr.N, step = Math.max(1, Math.round((def.markerEvery || 12) / tr.ds));
  const list = [];
  for (let i = 0; i < N; i += step) for (const side of [1, -1]) {
    list.push({ x: tr.px[i] + tr.lx[i] * (tr.hw + 1.6) * side, z: tr.pz[i] + tr.lz[i] * (tr.hw + 1.6) * side, side, k: (i / step) | 0 });
  }
  const poles = new THREE.InstancedMesh(A.poleGeo, A.poleMat, list.length);
  const bulbs = new THREE.InstancedMesh(A.bulbGeo, A.bulbMat, list.length);
  poles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bulbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const cA = new THREE.Color('#ff3b3c'), cB = new THREE.Color('#ffd15a');
  list.forEach((b, i) => bulbs.setColorAt(i, (b.k % 2 ? cA : cB)));
  tr.markers = { poles, bulbs, list, h: 4.3, bulb: 1 };
  tr.sway = def.sway || 0;
  tr.group.add(poles, bulbs);
}
function addRacingLine(tr, color) {
  const step = 10, count = Math.ceil(tr.N / step);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.4, 0.05, 1), new THREE.MeshBasicMaterial({ color }), count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new V3(), s = new V3();
  let n = 0;
  for (let i = 0; i < tr.N; i += step) {
    e.set(0, Math.atan2(tr.tx[i], tr.tz[i]), 0); q.setFromEuler(e);
    m.compose(p.set(tr.px[i], 0.08, tr.pz[i]), q, s.set(1, 1, Math.max(1, tr.ds * step * 0.45)));
    mesh.setMatrixAt(n++, m);
  }
  mesh.count = n; tr.group.add(mesh);
}
function addGlows(group, glows) {
  for (const p of glows) {
    const m = new THREE.Mesh(A.bulbGeo, new THREE.MeshBasicMaterial({ color: p.color }));
    m.position.set(p.x, p.y, p.z); group.add(m);
  }
}
function scatterDress(tr, mg, glows, rnd, def) {
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
  islands.forEach((is, n) => addStall(mg, glows, is, rnd, n));
}
function addStall(mg, glows, is, rnd, n) {
  const { x, z, r } = is, rot = rnd() * 6;
  const cloth = ['#c23b4a', '#e6b325', '#1f8a7a', '#d4537e', '#3a6adf'][n % 5];
  const wood = '#6b3e22';
  mg.add(new THREE.BoxGeometry(r * 1.5, 0.35, r * 0.95), mtx(x, 0.2, z, 0, rot, 0), wood);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const ox = sx * r * 0.55, oz = sz * r * 0.32;
    const wx = x + ox * Math.cos(rot) - oz * Math.sin(rot);
    const wz = z + ox * Math.sin(rot) + oz * Math.cos(rot);
    mg.add(new THREE.CylinderGeometry(0.1, 0.13, 3.1, 5), mtx(wx, 1.7, wz), '#3a2416');
  }
  mg.add(new THREE.BoxGeometry(r * 1.65, 0.16, r * 1.05), mtx(x, 3.25, z, 0, rot, 0.06), cloth);
  mg.add(new THREE.BoxGeometry(r * 1.65, 0.1, r * 0.16), mtx(x, 3.05, z, 0, rot, 0), '#f4e2b0');
  mg.add(new THREE.BoxGeometry(r * 0.9, 0.85, r * 0.32), mtx(x, 0.9, z, 0, rot, 0), '#c9844a');
  mg.add(new THREE.BoxGeometry(0.7, 0.7, 0.7), mtx(x + Math.cos(rot) * r * 0.2, 0.55, z + Math.sin(rot) * r * 0.2, 0, rot, 0), '#a86b3c');
  mg.add(new THREE.BoxGeometry(r * 0.7, 0.55, 0.08), mtx(x, 2.35, z, 0, rot, 0), cloth);
  glows.push({ x, y: 3.55, z, color: n % 2 ? '#ffb020' : '#ff5a3c' });
}
function addGate(tr, mg, glows) {
  const i = 0, px = tr.px[i], pz = tr.pz[i], lx = tr.lx[i], lz = tr.lz[i];
  const yaw = Math.atan2(tr.tx[i], tr.tz[i]);
  for (const s of [1, -1]) {
    const x = px + lx * (tr.hw + 2.2) * s, z = pz + lz * (tr.hw + 2.2) * s;
    mg.add(new THREE.CylinderGeometry(0.35, 0.5, 7.2, 6), mtx(x, 3.6, z), '#4a2e18');
    glows.push({ x, y: 7.3, z, color: '#ffd56a' });
  }
  const banner = new THREE.Mesh(new THREE.BoxGeometry((tr.hw + 2.2) * 2, 2.4, 0.35),
    [0, 0, 0, 0, 1, 1].map(k => k ? new THREE.MeshBasicMaterial({ map: A.bannerTex }) : new THREE.MeshPhongMaterial({ color: 0x2a120c })));
  banner.position.set(px, 6.6, pz); banner.rotation.y = yaw;
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
    -w, 0, 0, -w, h, L, -w, -0.4, L, -w, 0, 0, -w, -0.4, L, -w, -0.4, 0,
     w, 0, 0, w, -0.4, L, w, h, L, w, 0, 0, w, -0.4, 0, w, -0.4, L,
    -w, h, L, w, h, L, w, -0.4, L, -w, h, L, w, -0.4, L, -w, -0.4, L], 3));
  body.computeVertexNormals();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(top, new THREE.MeshPhongMaterial({ map: A.rampTex, shininess: 8, side: THREE.DoubleSide })));
  g.add(new THREE.Mesh(body, new THREE.MeshPhongMaterial({ color: 0x6b4426, flatShading: true, side: THREE.DoubleSide })));
  for (const s of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, L + 1), new THREE.MeshPhongMaterial({ color: 0x3a2416, flatShading: true }));
    rail.position.set(s * (w + 0.15), 0.3, L / 2); g.add(rail);
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
  if (tr.markers) {
    const { poles, bulbs, list, h, bulb } = tr.markers, sway = tr.sway || 0;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      _e.set(Math.sin(t * 1.3 + i) * sway, 0, Math.cos(t + i) * sway); _q.setFromEuler(_e);
      _m4.compose(_p.set(b.x, 0, b.z), _q, _sc.set(1, h, 1));
      poles.setMatrixAt(i, _m4);
      if (bulbs) {
        _bp.set(0, h, 0).applyQuaternion(_q);
        _m4.compose(_p.set(b.x + _bp.x, _bp.y, b.z + _bp.z), _q, _bs.set(bulb, bulb, bulb));
        bulbs.setMatrixAt(i, _m4);
      }
    }
    poles.instanceMatrix.needsUpdate = true;
    if (bulbs) bulbs.instanceMatrix.needsUpdate = true;
  }
  for (const r of tr.ramps) r.mesh.position.y = r.y;
  for (const c of tr.crates) {
    c.mesh.visible = c.respawn <= 0;
    c.mesh.position.y = 1.35 + Math.sin(t * 2.5 + c.phase) * 0.35;
    c.mesh.rotation.set(0.25, t * 1.4 + c.phase, 0.15);
  }
  updateGround(tr.ground, t);
}

function buildVehicle(ch) {
  const root = new THREE.Group(), tilt = new THREE.Group(); root.add(tilt);
  const phong = (c, extra) => new THREE.MeshPhongMaterial(Object.assign({ color: c, flatShading: true, shininess: 28 }, extra || {}));
  const metal = phong(0x2a2e36, { shininess: 70 });
  const col = ch.color, acc = ch.accent;
  const wheel = () => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(A.tireGeo, phong(0x1a1a1a)));
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 6).rotateZ(Math.PI / 2), metal));
    for (let i = 0; i < 5; i++) {
      const sp = new THREE.Mesh(A.spokeGeo, metal);
      sp.rotation.x = i * Math.PI / 5; g.add(sp);
    }
    return g;
  };
  const fw = wheel(); fw.position.set(0, 0.9, 1.85); tilt.add(fw);
  const bw = wheel(); bw.position.set(0, 0.9, -1.55); tilt.add(bw);
  const tube = (x, y, z, len, rx, color) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, len, 5), phong(color));
    m.position.set(x, y, z); m.rotation.x = rx; tilt.add(m);
  };
  tube(0, 1.25, 0.15, 2.5, 1.05, col);
  tube(0, 1.7, -0.35, 1.5, 0.45, col);
  tube(0, 1.85, 1.15, 1.15, 0.85, col);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.45, 5).rotateZ(Math.PI / 2), metal);
  bar.position.set(0, 2.15, 1.5); tilt.add(bar);
  const gripL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 5).rotateZ(Math.PI / 2), phong(acc));
  gripL.position.set(0.72, 2.15, 1.5); tilt.add(gripL);
  const gripR = gripL.clone(); gripR.position.x = -0.72; tilt.add(gripR);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.7), phong(0x221c18));
  seat.position.set(0, 1.82, -0.45); tilt.add(seat);
  const basket = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.48, 0.8), phong(acc, { transparent: true, opacity: 0.92 }));
  basket.position.set(0, 1.45, 2.15); tilt.add(basket);
  const cargo = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.48, 0.55), phong(0xc46a2f));
  cargo.position.set(0, 1.85, 2.15); tilt.add(cargo);
  const crank = new THREE.Group(); crank.position.set(0, 0.95, 0.05); tilt.add(crank);
  for (const s of [-1, 1]) {
    const ped = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.42), metal);
    ped.position.set(s * 0.28, 0, 0); crank.add(ped);
  }
  const rider = new THREE.Group(); rider.position.set(0, 1.45, -0.15); rider.rotation.x = 0.5;
  rider.scale.setScalar(0.8 + ch.stats.weight * 0.05);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 1.1), phong(0x2a2420)); legs.position.set(0, 0.15, 0.35); rider.add(legs);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, 0.5), phong(col)); torso.position.set(0, 0.75, 0.15); rider.add(torso);
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.55), phong(acc)); vest.position.set(0, 0.7, 0.12); rider.add(vest);
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.95), phong(col));
    arm.position.set(sx * 0.48, 0.95, 0.7); arm.rotation.x = 0.8; rider.add(arm);
  }
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 1), phong(ch.skin)); head.position.set(0, 1.4, 0.35); rider.add(head);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.38, 6), phong(acc)); cap.position.set(0, 1.72, 0.3); rider.add(cap);
  tilt.add(rider);
  const flame = new THREE.Group();
  for (let k = 0; k < 3; k++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.35 + k * 0.12, 6, 5), new THREE.MeshBasicMaterial({ color: 0xfff2dd, transparent: true, opacity: 0.55 }));
    p.position.set(0, 0.7, -2.3 - k * 0.45); flame.add(p);
  }
  flame.visible = false; tilt.add(flame);
  const bubble = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 1), new THREE.MeshPhongMaterial({ color: 0xffb020, transparent: true, opacity: 0.28, flatShading: true, depthWrite: false }));
  bubble.position.y = 1.5; bubble.visible = false; root.add(bubble);
  const cloud = new THREE.Group();
  for (let k = 0; k < 3; k++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), phong(0x8a5a32));
    m.position.set((k - 1) * 0.8, 2.6, -0.4); cloud.add(m);
  }
  cloud.visible = false; root.add(cloud);
  const shadow = new THREE.Mesh(A.shadowGeo, A.shadowMat); shadow.scale.set(1.1, 1, 2.2);
  return { root, tilt, flame, bubble, cloud, shadow, spinParts: [fw, bw, crank], yawParts: null };
}

function buildShotMesh() {
  const g = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.1, 5).rotateX(Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0xc9844a, flatShading: true }));
  g.add(stick);
  for (const z of [0.2, 0.9, 1.5]) {
    const food = new THREE.Mesh(new THREE.SphereGeometry(0.32, 6, 5), new THREE.MeshPhongMaterial({ color: z > 1 ? 0xff4d3a : 0xffd15a, flatShading: true }));
    food.position.z = z; g.add(food);
  }
  const blink = new THREE.Mesh(new THREE.SphereGeometry(0.12, 4, 3), A.redMat); blink.position.z = 1.7; g.add(blink);
  return g;
}
function buildMineMesh() {
  const g = new THREE.Group();
  const slick = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 0.12, 10), new THREE.MeshPhongMaterial({ color: 0x1a1612, shininess: 40, flatShading: true }));
  g.add(slick);
  const blink = new THREE.Mesh(new THREE.SphereGeometry(0.18, 5, 4), A.redMat); blink.position.y = 0.2; g.add(blink);
  return g;
}

function buildSpray() {
  const max = 700;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(max * 3), col = new Float32Array(max * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const tex = canvasTex(32, 32, (g) => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); });
  const mat = new THREE.PointsMaterial({ size: 0.85, map: tex, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true });
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
    if (p.life > 0) { p.life -= dt; p.vy -= 14 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.life <= 0) p.y = -999; }
    pa[i * 3] = p.x; pa[i * 3 + 1] = p.y; pa[i * 3 + 2] = p.z;
    const f = Math.min(1, p.life * 2) * 0.75; ca[i * 3] = p.r * f; ca[i * 3 + 1] = p.g * f; ca[i * 3 + 2] = p.b * f;
  }
  S.pts.geometry.attributes.position.needsUpdate = true;
  S.pts.geometry.attributes.color.needsUpdate = true;
}
