import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SKETCH_DATA_URI } from './generated-sketch.js';
import {
  createSim, removeTread, fixedStep, setBucketMass, setFriction, DEFAULT_BUCKET_MASS,
} from './well.js';
import { DEFAULT_FRICTION, FIXED_DT } from './physics-config.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb7c9d4);
scene.fog = new THREE.Fog(0xb7c9d4, 18, 55);

const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
camera.position.set(4.6, 4.4, 5.4);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.3, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2;
controls.maxDistance = 24;
controls.update();

function resize() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

scene.add(new THREE.HemisphereLight(0xdcefff, 0x3e342c, 0.7));
const sun = new THREE.DirectionalLight(0xfff1d0, 2.1);
sun.position.set(-6, 12, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -8;
sun.shadow.camera.right = 8;
sun.shadow.camera.top = 8;
sun.shadow.camera.bottom = -8;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 30;
sun.shadow.bias = -0.002;
scene.add(sun);

const DESK_TOP_Y = 0;
const desk = new THREE.Mesh(
  new THREE.BoxGeometry(12, 0.7, 9),
  new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.75, metalness: 0.04 }),
);
desk.position.set(0, DESK_TOP_Y - 0.35, 0.4);
desk.receiveShadow = true;
scene.add(desk);

const wall = new THREE.Mesh(
  new THREE.CylinderGeometry(1.48, 1.55, 5.5, 28, 1, true, 0.35, Math.PI * 1.5),
  new THREE.MeshStandardMaterial({ color: 0x8c8476, roughness: 0.94, side: THREE.DoubleSide }),
);
wall.position.y = 2.75;
wall.castShadow = true;
wall.receiveShadow = true;
scene.add(wall);

const PAPER_W = 6.2;
const PAPER_D = 4.6;
const PAPER_CENTER = new THREE.Vector3(2.4, DESK_TOP_Y + 0.012, 2.3);
const paperTex = new THREE.TextureLoader().load(SKETCH_DATA_URI);
paperTex.colorSpace = THREE.SRGBColorSpace;
const paper = new THREE.Mesh(
  new THREE.PlaneGeometry(PAPER_W, PAPER_D),
  new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.95, metalness: 0 }),
);
paper.rotation.x = -Math.PI / 2;
paper.position.copy(PAPER_CENTER);
paper.receiveShadow = true;
scene.add(paper);

const pencil = new THREE.Group();
{
  const len = 1.5;
  const rad = 0.055;
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(rad, rad, len, 6),
    new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.5 }),
  );
  shaft.rotation.z = Math.PI / 2;
  shaft.castShadow = true;
  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(rad, 0.004, 0.22, 6),
    new THREE.MeshStandardMaterial({ color: 0xe8c39e }),
  );
  tip.rotation.z = Math.PI / 2;
  tip.position.x = len / 2 + 0.11;
  pencil.add(shaft, tip);
  pencil.rotation.y = -0.6;
  pencil.position.set(PAPER_CENTER.x + 1.8, DESK_TOP_Y + 0.06, PAPER_CENTER.z + 1.2);
  scene.add(pencil);
}

const DRAW_SCALE = 0.85;
function flattenToPaper(x, y, z) {
  return [
    PAPER_CENTER.x + x * DRAW_SCALE,
    PAPER_CENTER.y + 0.02,
    PAPER_CENTER.z - z * DRAW_SCALE + (y - 2.4) * 0.02,
  ];
}

const solidGroup = new THREE.Group();
scene.add(solidGroup);
const lineGeo = new THREE.BufferGeometry();
const sketchLines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x2b2b2b }));
sketchLines.visible = false;
scene.add(sketchLines);

let world = null;
let bodies = null;
let contactMaterial = null;
let rigs = [];
let flatPositions = new Float32Array(0);
let liftedPositions = new Float32Array(0);
let ropeLine = null;

const matCache = new Map();
function materialFor(color) {
  let m = matCache.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.02 });
    matCache.set(color, m);
  }
  return m;
}

function clearSolid() {
  while (solidGroup.children.length) {
    const child = solidGroup.children[0];
    solidGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
  }
  rigs = [];
  ropeLine = null;
  world = null;
  bodies = null;
  contactMaterial = null;
}

function buildSolid() {
  clearSolid();
  const sim = createSim({ friction: state.friction, bucketMass: state.mass });
  world = sim.world;
  bodies = sim.bodies;
  contactMaterial = sim.contactMaterial;
  setFriction(bodies, contactMaterial, state.friction);
  setBucketMass(bodies, state.mass);
  const flat = [];
  const lifted = [];
  for (const [a, b] of bodies.sketch) {
    const fa = flattenToPaper(a[0], a[1], a[2]);
    const fb = flattenToPaper(b[0], b[1], b[2]);
    flat.push(fa[0], fa[1], fa[2], fb[0], fb[1], fb[2]);
    lifted.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  }
  flatPositions = new Float32Array(flat);
  liftedPositions = new Float32Array(lifted);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(flatPositions.slice(), 3));
  for (const body of bodies.visuals) {
    const u = body.userData;
    const geo = u.shape === 'cyl'
      ? new THREE.CylinderGeometry(u.cyl.rTop, u.cyl.rBot, u.cyl.h, 14)
      : new THREE.BoxGeometry(u.half[0] * 2, u.half[1] * 2, u.half[2] * 2);
    const mesh = new THREE.Mesh(geo, materialFor(u.color));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    solidGroup.add(mesh);
    rigs.push({ mesh, body });
  }
  const ropeGeo = new THREE.BufferGeometry();
  ropeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  ropeLine = new THREE.Line(ropeGeo, new THREE.LineBasicMaterial({ color: 0x3a322c }));
  solidGroup.add(ropeLine);
  syncMeshes();
}

function setLiftT(t) {
  const pos = lineGeo.attributes.position;
  for (let i = 0; i < pos.array.length; i++) {
    pos.array[i] = flatPositions[i] * (1 - t) + liftedPositions[i] * t;
  }
  pos.needsUpdate = true;
}

function syncMeshes() {
  if (!bodies) return;
  for (const { mesh, body } of rigs) {
    mesh.visible = !body.userData.removed;
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  }
  if (ropeLine) {
    const a = bodies.anchor.position;
    const b = bodies.bucket.position;
    const arr = ropeLine.geometry.attributes.position.array;
    arr[0] = a.x; arr[1] = a.y; arr[2] = a.z;
    arr[3] = b.x; arr[4] = b.y + 0.14; arr[5] = b.z;
    ropeLine.geometry.attributes.position.needsUpdate = true;
  }
}

const state = {
  stage: 'paper',
  mass: DEFAULT_BUCKET_MASS,
  friction: DEFAULT_FRICTION,
  pendingRemove: false,
};

function setStage(name, t = 0) {
  state.stage = name;
  if (name === 'paper') {
    sketchLines.visible = false;
    solidGroup.visible = false;
    wall.visible = false;
  } else if (name === 'lifting') {
    sketchLines.visible = true;
    solidGroup.visible = false;
    wall.visible = false;
    setLiftT(t);
  } else {
    sketchLines.visible = false;
    solidGroup.visible = true;
    wall.visible = true;
  }
}

function $(id) { return document.getElementById(id); }
$('massSlider').addEventListener('input', (e) => {
  state.mass = Number(e.target.value);
  $('massVal').textContent = String(state.mass);
  if (bodies) setBucketMass(bodies, state.mass);
});
$('frictionSlider').addEventListener('input', (e) => {
  state.friction = Number(e.target.value);
  $('frictionVal').textContent = state.friction.toFixed(2);
  if (bodies) setFriction(bodies, contactMaterial, state.friction);
});
$('removeTreadBtn').addEventListener('click', () => {
  if (world && bodies) removeTread(world, bodies);
  else state.pendingRemove = true;
});
$('startBtn').addEventListener('click', () => runIntro());

let introToken = 0;
function runIntro() {
  const token = ++introToken;
  state.pendingRemove = false;
  buildSolid();
  setStage('paper');
  const liftStart = performance.now() + 900;
  const liftDur = 2400;
  function tick(now) {
    if (token !== introToken) return;
    if (now < liftStart) { requestAnimationFrame(tick); return; }
    const t = Math.min(1, (now - liftStart) / liftDur);
    setStage('lifting', t);
    if (t < 1) { requestAnimationFrame(tick); return; }
    setTimeout(() => {
      if (token !== introToken) return;
      setStage('solid');
      if (state.pendingRemove && world && bodies) {
        removeTread(world, bodies);
        state.pendingRemove = false;
      }
    }, 350);
  }
  requestAnimationFrame(tick);
}

let physicsAccumulator = 0;
let lastFrameTime = null;
function animate(now) {
  if (lastFrameTime == null) lastFrameTime = now;
  let dt = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;
  if (world && state.stage === 'solid') {
    physicsAccumulator += dt;
    let steps = 0;
    while (physicsAccumulator >= FIXED_DT && steps < 6) {
      fixedStep(world, bodies);
      physicsAccumulator -= FIXED_DT;
      steps++;
    }
    syncMeshes();
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
runIntro();
requestAnimationFrame(animate);
