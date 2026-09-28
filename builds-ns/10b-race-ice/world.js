// FROSTKEEL — dawn ice: white lake, cracks, fishing holes, iceboats. No concrete barriers.
'use strict';

const V3 = THREE.Vector3;
const W = { t: 0, wave: { amp: 0.1, speed: 0.35 }, track: null };
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
  return a * (0.62 * Math.sin(x * 0.04 + t * 0.6 * s)
            + 0.48 * Math.sin(z * 0.035 - t * 0.45 * s + 1.7)
            + 0.3 * Math.sin((x + z) * 0.02 + t * 0.3 * s));
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
  W.hemi = new THREE.HemisphereLight(0xfff1e4, 0xb7c9d8, 0.95);
  W.sun = new THREE.DirectionalLight(0xffe0b0, 1.15);
  W.sun.position.set(700, 90, 180);
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
                y + (hash3(ky, kz, kx + seed) - 0.5) * amt * 0.4,
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
    return new THREE.Mesh(g, new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 40, specular: 0xddeeff }));
  }
}
function mtx(x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  _e.set(rx, ry, rz); _q.setFromEuler(_e); _sc.set(sx, sy, sz);
  return new THREE.Matrix4().compose(new V3(x, y, z), _q, _sc);
}

const A = {};
function buildSharedAssets() {
  A.crateTex = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#f4fbff'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#7eb6ff'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    g.font = 'bold 90px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 8; g.strokeStyle = '#1a3348'; g.strokeText('?', w / 2, h / 2 + 4);
    g.fillStyle = '#1a3348'; g.fillText('?', w / 2, h / 2 + 4);
  });
  A.crateGeo = new THREE.BoxGeometry(2.5, 2.2, 2.5);
  A.crateMat = new THREE.MeshPhongMaterial({ map: A.crateTex, shininess: 60, specular: 0xffffff });
  A.rampTex = canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#e7f4fb'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(80,120,150,0.45)'; g.lineWidth = 3;
    for (let y = 0; y < h; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 8); g.stroke(); }
    g.fillStyle = '#ffffff'; g.fillRect(0, h - 28, w, 16);
  });
  A.bannerTex = canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = '#f7fbff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1a3348'; g.fillRect(0, 0, w, 8); g.fillRect(0, h - 8, w, 8);
    g.font = 'bold 34px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#1a3348'; g.fillText(THEME.banner, w / 2, h / 2 + 1);
  });
  A.poleGeo = new THREE.CylinderGeometry(0.045, 0.06, 1, 4);
  A.poleGeo.translate(0, 0.5, 0);
  A.poleMat = new THREE.MeshPhongMaterial({ color: 0x3a5166, flatShading: true });
  A.bulbGeo = new THREE.ConeGeometry(0.28, 0.55, 4);
  A.bulbMat = new THREE.MeshBasicMaterial({ color: 0xd7eefe });
  A.shadowGeo = new THREE.CircleGeometry(2.2, 12).rotateX(-Math.PI / 2);
  A.shadowMat = new THREE.MeshBasicMaterial({ color: 0x1a3348, transparent: true, opacity: 0.22, depthWrite: false });
  A.redMat = new THREE.MeshPhongMaterial({ color: 0xff4040, emissive: 0x330000, flatShading: true });
}

function buildSky(sky) {
  const geo = new THREE.SphereGeometry(3200, 24, 12);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(sky.top) }, bottom: { value: new THREE.Color(sky.bottom) } },
    vertexShader: 'varying float vy; void main(){ vy = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying float vy; void main(){ float k = smoothstep(-0.05, 0.35, vy); gl_FragColor = vec4(mix(bottom, top, k), 1.0); }',
  });
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, mat));
  const sun = new THREE.Mesh(new THREE.CircleGeometry(160, 24), new THREE.MeshBasicMaterial({ color: sky.sun, fog: false }));
  sun.position.set(1800, 280, 900); sun.lookAt(0, 0, 0); g.add(sun);
  const rnd = mulberry32(4);
  const cm = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, transparent: true, opacity: 0.55 });
  for (let i = 0; i < 3; i++) {
    const a = rnd() * Math.PI * 2, d = 2000, y = 500 + rnd() * 200;
    const cl = new THREE.Group();
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(40 + rnd() * 20, 0), cm);
    m.scale.y = 0.35; cl.add(m);
    cl.position.set(Math.cos(a) * d, y, Math.sin(a) * d);
    g.add(cl);
  }
  return g;
}

function buildGround(cx, cz, size, colors, ribbon) {
  const seg = 90;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg).rotateX(-Math.PI / 2);
  geo.translate(cx, 0, cz);
  const n = geo.attributes.position.count;
  geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
  const mat = new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 90, specular: 0xeef7ff });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.deep = new THREE.Color(colors.deep);
  mesh.userData.crest = new THREE.Color(colors.crest);
  mesh.userData.ribbon = ribbon;
  const far = new THREE.Mesh(new THREE.PlaneGeometry(12000, 12000).rotateX(-Math.PI / 2),
    new THREE.MeshPhongMaterial({ color: colors.far, shininess: 20, specular: 0xd0e4f0 }));
  far.position.set(cx, -0.25, cz);
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
    let k = dd < ribbon ? 1 : Math.max(0, 1 - (dd - ribbon) / 26);
    if (k > 0.4 && hash3((pa[i] / 9) | 0, 3, (pa[i + 2] / 9) | 0) > 0.94) k *= 0.4;
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
  const size = Math.max(maxX - minX, maxZ - minZ) + 520;
  const ground = buildGround(tr.bounds.cx, tr.bounds.cz, size, def.ground, def.ribbon);
  tr.ground = ground.mesh; tr.group.add(ground.mesh, ground.far);
  stampTrackDist(tr.ground, tr);
  addEdgeMarkers(tr, def);
  addRacingLine(tr, def.line);

  tr.ramps = def.ramps.map((t, n) => {
    const i = straightNear(Math.floor(t * N) % N, 40);
    const lat = [0, -0.28, 0.28][n % 3] * tr.hw;
    const r = { i, len: 18, w: 14, h: 3.4, lat,
      x: tr.px[i] + tr.lx[i] * lat, z: tr.pz[i] + tr.lz[i] * lat, tx: tr.tx[i], tz: tr.tz[i], lx: tr.lx[i], lz: tr.lz[i], y: 0 };
    r.mesh = buildRampMesh(r); tr.group.add(r.mesh);
    return r;
  });
  tr.crates = [];
  def.crates.forEach(t => {
    let i = Math.floor(t * N) % N;
    for (const r of tr.ramps) { const dd = (i - r.i + N) % N; if (dd < 36 || dd > N - 36) i = (i + 48) % N; }
    [-0.55, -0.28, 0, 0.28, 0.55].forEach((f, k) => {
      const m = new THREE.Mesh(A.crateGeo, A.crateMat);
      const c = { i, x: tr.px[i] + tr.lx[i] * f * tr.hw, z: tr.pz[i] + tr.lz[i] * f * tr.hw, mesh: m, respawn: 0, phase: k * 0.7 + i };
      m.position.set(c.x, 1.3, c.z); tr.group.add(m); tr.crates.push(c);
    });
  });
  (def.holes || []).forEach((t, n) => {
    let i = Math.floor(t * N) % N;
    for (const r of tr.ramps) { const dd = (i - r.i + N) % N; if (dd < 42 || dd > N - 42) i = (i + 58) % N; }
    const lat = (n % 2 ? 0.4 : -0.46) * tr.hw;
    const h = { i, lat, rad: 3.2 + (n % 3) * 0.5, x: tr.px[i] + tr.lx[i] * lat, z: tr.pz[i] + tr.lz[i] * lat };
    tr.holes.push(h); tr.group.add(buildHole(h));
  });
  (def.cracks || []).forEach((t, n) => {
    const i = Math.floor(t * N) % N;
    const lat = (n % 2 ? 0.36 : -0.4) * tr.hw;
    const half = tr.hw * 0.34;
    const c = { i, lat, half, tx: tr.tx[i], tz: tr.tz[i], lx: tr.lx[i], lz: tr.lz[i], x: tr.px[i] + tr.lx[i] * lat, z: tr.pz[i] + tr.lz[i] * lat };
    tr.cracks.push(c);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.08, 2.4), new THREE.MeshPhongMaterial({ color: 0x102838, shininess: 18 }));
    mesh.position.set(c.x, 0.05, c.z);
    mesh.rotation.y = Math.atan2(tr.tx[i], tr.tz[i]);
    tr.group.add(mesh);
  });

  const mg = new Merger(), rnd = mulberry32(def.seed);
  scatterFloes(tr, mg, rnd, def);
  addGate(tr, mg);
  tr.decor = mg.build(); tr.group.add(tr.decor);
  W.scene.add(tr.group);
  W.track = tr;
  return tr;
}

function addEdgeMarkers(tr, def) {
  const N = tr.N, step = Math.max(1, Math.round((def.markerEvery || 40) / tr.ds));
  const list = [];
  for (let i = 0; i < N; i += step) for (const side of [1, -1]) {
    list.push({ x: tr.px[i] + tr.lx[i] * (tr.hw + 2.4) * side, z: tr.pz[i] + tr.lz[i] * (tr.hw + 2.4) * side, k: (i / step) | 0 });
  }
  const poles = new THREE.InstancedMesh(A.poleGeo, A.poleMat, list.length);
  const bulbs = new THREE.InstancedMesh(A.bulbGeo, A.bulbMat, list.length);
  poles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bulbs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const cA = new THREE.Color('#ff6a6a'), cB = new THREE.Color('#ffffff');
  list.forEach((b, i) => bulbs.setColorAt(i, b.k % 2 ? cA : cB));
  tr.markers = { poles, bulbs, list, h: 1.7, bulb: 1 };
  tr.sway = def.sway || 0;
  tr.group.add(poles, bulbs);
}
function addRacingLine(tr, color) {
  const step = 12, count = Math.ceil(tr.N / step);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.35, 0.04, 1), new THREE.MeshBasicMaterial({ color }), count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new V3(), s = new V3();
  let n = 0;
  for (let i = 0; i < tr.N; i += step) {
    e.set(0, Math.atan2(tr.tx[i], tr.tz[i]), 0); q.setFromEuler(e);
    m.compose(p.set(tr.px[i], 0.07, tr.pz[i]), q, s.set(1, 1, Math.max(1, tr.ds * step * 0.4)));
    mesh.setMatrixAt(n++, m);
  }
  mesh.count = n; tr.group.add(mesh);
}
function scatterFloes(tr, mg, rnd, def) {
  const { minX, maxX, minZ, maxZ } = tr.bounds, N = tr.N, sc = def.scatter;
  if (!sc || !sc.count) { tr.islands = []; return; }
  const distToTrack = (x, z) => { let md = 1e9; for (let i = 0; i < N; i += 6) { const d = Math.hypot(x - tr.px[i], z - tr.pz[i]); if (d < md) md = d; } return md; };
  const islands = [];
  for (let tries = 0; islands.length < sc.count && tries < 800; tries++) {
    const rad = sc.r0 + rnd() * (sc.r1 - sc.r0);
    const x = minX - sc.pad + rnd() * (maxX - minX + sc.pad * 2);
    const z = minZ - sc.pad + rnd() * (maxZ - minZ + sc.pad * 2);
    const d = distToTrack(x, z);
    if (d < tr.hw + sc.near || d > tr.hw + sc.far) continue;
    if (islands.some(o => Math.hypot(o.x - x, o.z - z) < o.r + rad + 8)) continue;
    islands.push({ x, z, r: rad });
  }
  tr.islands = islands;
  islands.forEach((is, n) => {
    mg.add(jitter(new THREE.CylinderGeometry(is.r, is.r * 1.05, 0.22, 7, 1), 0.4, n), mtx(is.x, 0.06, is.z, 0, rnd() * 3, 0), n % 2 ? '#f7fbff' : '#d5e6f2');
  });
}
function buildHole(h) {
  const g = new THREE.Group();
  const pit = new THREE.Mesh(new THREE.CylinderGeometry(h.rad, h.rad * 0.9, 0.55, 10), new THREE.MeshPhongMaterial({ color: 0x071820, shininess: 40 }));
  pit.position.y = -0.15;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(h.rad + 0.4, 0.22, 4, 12).rotateX(Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0xd7e8f4, flatShading: true }));
  ring.position.y = 0.05;
  g.add(pit, ring); g.position.set(h.x, 0.02, h.z);
  return g;
}
function addGate(tr, mg) {
  const i = 0, px = tr.px[i], pz = tr.pz[i], lx = tr.lx[i], lz = tr.lz[i];
  const yaw = Math.atan2(tr.tx[i], tr.tz[i]);
  for (const s of [1, -1]) {
    const x = px + lx * (tr.hw + 2) * s, z = pz + lz * (tr.hw + 2) * s;
    mg.add(new THREE.CylinderGeometry(0.08, 0.1, 4.2, 5), mtx(x, 2.1, z), '#1a3344');
    mg.add(new THREE.ConeGeometry(0.35, 0.7, 4), mtx(x, 4.3, z), s > 0 ? '#ff6a6a' : '#ffffff');
  }
  const banner = new THREE.Mesh(new THREE.BoxGeometry(Math.min(tr.hw * 1.6, 22), 1.8, 0.2),
    [0, 0, 0, 0, 1, 1].map(k => k ? new THREE.MeshBasicMaterial({ map: A.bannerTex }) : new THREE.MeshPhongMaterial({ color: 0xf7fbff })));
  banner.position.set(px, 3.6, pz); banner.rotation.y = yaw;
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
    -w, 0, 0, -w, h, L, -w, -0.2, L, -w, 0, 0, -w, -0.2, L, -w, -0.2, 0,
     w, 0, 0, w, -0.2, L, w, h, L, w, 0, 0, w, -0.2, 0, w, -0.2, L,
    -w, h, L, w, h, L, w, -0.2, L, -w, h, L, w, -0.2, L, -w, -0.2, L], 3));
  body.computeVertexNormals();
  const g = new THREE.Group();
  const ice = new THREE.MeshPhongMaterial({ color: 0xd7eefe, shininess: 90, specular: 0xffffff, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
  g.add(new THREE.Mesh(top, new THREE.MeshPhongMaterial({ map: A.rampTex, shininess: 40, side: THREE.DoubleSide })));
  g.add(new THREE.Mesh(body, ice));
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
    const { poles, bulbs, list, h } = tr.markers, sway = tr.sway || 0;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      _e.set(Math.sin(t + i) * sway, i * 0.2, 0); _q.setFromEuler(_e);
      _m4.compose(_p.set(b.x, 0, b.z), _q, _sc.set(1, h, 1));
      poles.setMatrixAt(i, _m4);
      _bp.set(0, h, 0).applyQuaternion(_q);
      _m4.compose(_p.set(b.x + _bp.x, _bp.y, b.z + _bp.z), _q, _bs.set(1, 1, 1));
      bulbs.setMatrixAt(i, _m4);
    }
    poles.instanceMatrix.needsUpdate = true;
    bulbs.instanceMatrix.needsUpdate = true;
  }
  for (const r of tr.ramps) r.mesh.position.y = r.y;
  for (const c of tr.crates) {
    c.mesh.visible = c.respawn <= 0;
    c.mesh.position.y = 1.2 + Math.sin(t * 2 + c.phase) * 0.2;
    c.mesh.rotation.y = t * 0.8 + c.phase;
  }
  updateGround(tr.ground, t);
}

function buildVehicle(ch) {
  const root = new THREE.Group(), tilt = new THREE.Group(); root.add(tilt);
  const phong = (c, extra) => new THREE.MeshPhongMaterial(Object.assign({ color: c, flatShading: true, shininess: 60, specular: 0xffffff }, extra || {}));
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.4, 4.6), phong(ch.color));
  hull.position.set(0, 0.55, -0.15); tilt.add(hull);
  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.45, 4).rotateX(Math.PI / 2), phong(ch.color));
  bow.position.set(0, 0.55, 2.45); tilt.add(bow);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 2.2), phong(0xf7fbff));
  deck.position.set(0, 0.78, -0.3); tilt.add(deck);
  for (const s of [-1, 1]) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 4.4), phong(0xd0d8e4, { shininess: 100 }));
    blade.position.set(s * 1.45, 0.16, -0.1); tilt.add(blade);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.08), phong(0xc5d0da));
    arm.position.set(s * 0.75, 0.42, 0.3); tilt.add(arm);
    const arm2 = arm.clone(); arm2.position.z = -0.8; tilt.add(arm2);
  }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.0, 5), phong(0xf3efe4));
  mast.position.set(0, 2.6, -0.15); tilt.add(mast);
  const sailGeo = new THREE.BufferGeometry();
  sailGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 3.3, 0, 2.15, 0.45, 0.15], 3));
  sailGeo.computeVertexNormals();
  const sail = new THREE.Mesh(sailGeo, phong(ch.accent, { side: THREE.DoubleSide }));
  sail.position.set(0.05, 1.15, -0.15); tilt.add(sail);
  const rider = new THREE.Group(); rider.position.set(0, 0.85, -0.55);
  rider.scale.setScalar(0.82 + ch.stats.weight * 0.04);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.28, 1.0), phong(0x243044)); legs.position.set(0, 0.15, 0.2); rider.add(legs);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.9, 0.55), phong(ch.color)); torso.position.set(0, 0.7, 0.05); torso.rotation.x = 0.25; rider.add(torso);
  const parka = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.4, 0.6), phong(ch.accent)); parka.position.set(0, 0.85, 0.02); rider.add(parka);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 1), phong(ch.skin)); head.position.set(0, 1.35, 0.15); rider.add(head);
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.55, 6), phong(ch.accent)); hat.position.set(0, 1.75, 0.1); rider.add(hat);
  tilt.add(rider);
  const flame = new THREE.Group();
  for (let k = 0; k < 3; k++) {
    const wisp = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 1.4), new THREE.MeshBasicMaterial({ color: 0xf4fbff, transparent: true, opacity: 0.65, side: THREE.DoubleSide }));
    wisp.position.set((k - 1) * 0.35, 1.1, -2.6); wisp.rotation.y = 0.4; flame.add(wisp);
  }
  flame.visible = false; tilt.add(flame);
  const bubble = new THREE.Mesh(new THREE.IcosahedronGeometry(3.1, 1), new THREE.MeshPhongMaterial({ color: 0xd7f1ff, transparent: true, opacity: 0.28, flatShading: true, depthWrite: false, shininess: 100 }));
  bubble.position.set(0, 1.3, 0); bubble.visible = false; root.add(bubble);
  const cloud = new THREE.Group();
  const shank = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), phong(0x1a3344)); shank.position.y = 2.2; cloud.add(shank);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.1, 4, 8), phong(0x1a3344)); ring.rotation.x = Math.PI / 2; ring.position.y = 1.5; cloud.add(ring);
  cloud.visible = false; root.add(cloud);
  const shadow = new THREE.Mesh(A.shadowGeo, A.shadowMat); shadow.scale.set(1.3, 1, 2.4);
  return { root, tilt, flame, bubble, cloud, shadow, spinParts: null, yawParts: null };
}

function buildShotMesh() {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 5).rotateX(Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0xc5d0d8, shininess: 80, flatShading: true }));
  g.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.7, 5).rotateX(Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0x1a3344, flatShading: true }));
  tip.position.z = 1.9; g.add(tip);
  const blink = new THREE.Mesh(new THREE.SphereGeometry(0.1, 4, 3), A.redMat); blink.position.z = -1.5; g.add(blink);
  return g;
}
function buildMineMesh() {
  const g = new THREE.Group();
  const chunk = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 0), new THREE.MeshPhongMaterial({ color: 0xe7f4fb, shininess: 80, flatShading: true, specular: 0xffffff }));
  g.add(chunk);
  const blink = new THREE.Mesh(new THREE.SphereGeometry(0.16, 4, 3), A.redMat); blink.position.y = 0.9; g.add(blink);
  return g;
}

function buildSpray() {
  const max = 600;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(max * 3), col = new Float32Array(max * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const tex = canvasTex(32, 32, (g) => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); });
  const mat = new THREE.PointsMaterial({ size: 0.7, map: tex, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true });
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
    if (p.life > 0) { p.life -= dt; p.vy -= 8 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.life <= 0) p.y = -999; }
    pa[i * 3] = p.x; pa[i * 3 + 1] = p.y; pa[i * 3 + 2] = p.z;
    const f = Math.min(1, p.life * 2) * 0.8; ca[i * 3] = p.r * f; ca[i * 3 + 1] = p.g * f; ca[i * 3 + 2] = p.b * f;
  }
  S.pts.geometry.attributes.position.needsUpdate = true;
  S.pts.geometry.attributes.color.needsUpdate = true;
}
