import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SKETCH_DATA_URI } from './generated-sketch.js';
import {
  createSim, removePin, fixedStep, setCrateMass, setFriction, DEFAULT_CRATE_MASS,
} from './crane.js';
import { DEFAULT_FRICTION, FIXED_DT } from './physics-config.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd9e8);
scene.fog = new THREE.Fog(0xbfd9e8, 28, 80);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
camera.position.set(-8, 5.5, 11);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(1.2, 3.2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 3;
controls.maxDistance = 40;
controls.update();

function resize() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

scene.add(new THREE.HemisphereLight(0xdcefff, 0x4a3a2a, 0.7));
const sun = new THREE.DirectionalLight(0xfff3d6, 2.2);
sun.position.set(-10, 16, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -16;
sun.shadow.camera.right = 16;
sun.shadow.camera.top = 16;
sun.shadow.camera.bottom = -16;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 50;
sun.shadow.bias = -0.0015;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xcfe3ff, 0.35);
fill.position.set(12, 8, -10);
scene.add(fill);

const DESK_TOP_Y = 0;
const desk = new THREE.Mesh(
  new THREE.BoxGeometry(16, 0.8, 11),
  new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.75, metalness: 0.05 }),
);
desk.position.set(0, DESK_TOP_Y - 0.4, 0);
desk.receiveShadow = true;
scene.add(desk);
{
  const seamMat = new THREE.MeshStandardMaterial({ color: 0x5c3d22, roughness: 0.9 });
  for (let i = -2; i <= 2; i++) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(16, 0.02, 0.03), seamMat);
    seam.position.set(0, DESK_TOP_Y + 0.001, i * 2.1);
    scene.add(seam);
  }
}

const PAPER_W = 8.4;
const PAPER_D = 5.8;
const PAPER_CENTER = new THREE.Vector3(-0.2, DESK_TOP_Y + 0.012, 1.6);
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
const paperBack = new THREE.Mesh(
  new THREE.BoxGeometry(PAPER_W, 0.01, PAPER_D),
  new THREE.MeshStandardMaterial({ color: 0xf3f0e6, roughness: 1 }),
);
paperBack.position.copy(PAPER_CENTER).setY(DESK_TOP_Y + 0.004);
scene.add(paperBack);

const pencilGroup = new THREE.Group();
{
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.5 });
  const tipMat = new THREE.MeshStandardMaterial({ color: 0xe8c39e, roughness: 0.6 });
  const leadMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.4 });
  const len = 2.6;
  const rad = 0.09;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, len, 6), bodyMat);
  shaft.rotation.z = Math.PI / 2;
  shaft.castShadow = true;
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(rad, 0.005, 0.4, 6), tipMat);
  tip.rotation.z = Math.PI / 2;
  tip.position.x = len / 2 + 0.2;
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.1, 6), leadMat);
  lead.rotation.z = Math.PI / 2;
  lead.position.x = len / 2 + 0.42;
  pencilGroup.add(shaft, tip, lead);
  pencilGroup.rotation.y = -0.4;
  pencilGroup.position.set(PAPER_CENTER.x + 2.4, DESK_TOP_Y + 0.08, PAPER_CENTER.z + 1.5);
  scene.add(pencilGroup);
}

const DRAW_SCALE = 0.72;
function flattenToPaper(x, y) {
  return [
    PAPER_CENTER.x + (x - 1.2) * DRAW_SCALE,
    PAPER_CENTER.y + 0.02,
    PAPER_CENTER.z + 1.5 - y * DRAW_SCALE,
  ];
}

const solidGroup = new THREE.Group();
scene.add(solidGroup);
const lineGeo = new THREE.BufferGeometry();
const lineMat = new THREE.LineBasicMaterial({ color: 0x2b2b2b });
const sketchLines = new THREE.LineSegments(lineGeo, lineMat);
sketchLines.visible = false;
scene.add(sketchLines);

let world = null;
let bodies = null;
let contactMaterial = null;
let rigs = [];
let flatPositions = new Float32Array(0);
let liftedPositions = new Float32Array(0);
let cableLine = null;

const matCache = new Map();
function materialFor(color) {
  let m = matCache.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.08 });
    matCache.set(color, m);
  }
  return m;
}

function meshFor(body) {
  const u = body.userData;
  let geo;
  if (u.shape === 'cyl') {
    geo = new THREE.CylinderGeometry(u.cyl.rTop, u.cyl.rBot, u.cyl.h, 12);
  } else {
    geo = new THREE.BoxGeometry(u.half[0] * 2, u.half[1] * 2, u.half[2] * 2);
  }
  const mesh = new THREE.Mesh(geo, materialFor(u.color));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function captureSketch() {
  const flat = [];
  const lifted = [];
  for (const [a, b] of bodies.sketch) {
    const fa = flattenToPaper(a[0], a[1]);
    const fb = flattenToPaper(b[0], b[1]);
    flat.push(fa[0], fa[1], fa[2], fb[0], fb[1], fb[2]);
    lifted.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  }
  flatPositions = new Float32Array(flat);
  liftedPositions = new Float32Array(lifted);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(flatPositions.slice(), 3));
}

function setLiftT(t) {
  const pos = lineGeo.attributes.position;
  for (let i = 0; i < pos.array.length; i++) {
    pos.array[i] = flatPositions[i] * (1 - t) + liftedPositions[i] * t;
  }
  pos.needsUpdate = true;
}

function clearSolid() {
  while (solidGroup.children.length) {
    const child = solidGroup.children[0];
    solidGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
  }
  rigs = [];
  cableLine = null;
  world = null;
  bodies = null;
  contactMaterial = null;
}

function buildSolid() {
  clearSolid();
  const sim = createSim({ friction: state.friction, crateMass: state.mass });
  world = sim.world;
  bodies = sim.bodies;
  contactMaterial = sim.contactMaterial;
  setFriction(bodies, contactMaterial, state.friction);
  setCrateMass(bodies, state.mass);
  captureSketch();
  for (const body of bodies.visuals) {
    const mesh = meshFor(body);
    solidGroup.add(mesh);
    rigs.push({ mesh, body });
  }
  const cableGeo = new THREE.BufferGeometry();
  cableGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  cableLine = new THREE.Line(cableGeo, new THREE.LineBasicMaterial({ color: 0x222222 }));
  solidGroup.add(cableLine);
  syncMeshes();
}

function syncMeshes() {
  if (!bodies) return;
  for (const { mesh, body } of rigs) {
    mesh.visible = !body.userData.removed;
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  }
  if (cableLine) {
    const a = bodies.trolley.position;
    const b = bodies.crate.position;
    const arr = cableLine.geometry.attributes.position.array;
    arr[0] = a.x; arr[1] = a.y - 0.08; arr[2] = a.z;
    arr[3] = b.x; arr[4] = b.y + bodies.crate.userData.half[1]; arr[5] = b.z;
    cableLine.geometry.attributes.position.needsUpdate = true;
  }
}

const state = {
  stage: 'paper',
  mass: DEFAULT_CRATE_MASS,
  friction: DEFAULT_FRICTION,
  pendingRemove: false,
};

function setStage(name, t = 0) {
  state.stage = name;
  if (name === 'paper') {
    sketchLines.visible = false;
    solidGroup.visible = false;
  } else if (name === 'lifting') {
    sketchLines.visible = true;
    solidGroup.visible = false;
    setLiftT(t);
  } else if (name === 'solid') {
    sketchLines.visible = false;
    solidGroup.visible = true;
  }
}

function $(id) { return document.getElementById(id); }
$('massSlider').addEventListener('input', (e) => {
  state.mass = Number(e.target.value);
  $('massVal').textContent = String(state.mass);
  if (bodies) setCrateMass(bodies, state.mass);
});
$('frictionSlider').addEventListener('input', (e) => {
  state.friction = Number(e.target.value);
  $('frictionVal').textContent = state.friction.toFixed(2);
  if (bodies) setFriction(bodies, contactMaterial, state.friction);
});
$('removePinBtn').addEventListener('click', () => {
  if (world && bodies) removePin(world, bodies);
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
  const liftDur = 2200;
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
        removePin(world, bodies);
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
  let dt = (now - lastFrameTime) / 1000;
  lastFrameTime = now;
  dt = Math.min(dt, 0.05);
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
