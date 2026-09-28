import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SKETCH_DATA_URI } from './generated-sketch.js';
import {
  createSim, removeDowel, fixedStep, setBookMass, setFriction, DEFAULT_BOOK_MASS,
} from './chair.js';
import { DEFAULT_FRICTION, FIXED_DT } from './physics-config.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc9d7e2);
scene.fog = new THREE.Fog(0xc9d7e2, 8, 22);

const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 40);
camera.position.set(2.15, 1.55, 2.35);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0.05, 0.72, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.8;
controls.maxDistance = 8;
controls.update();

function resize() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

scene.add(new THREE.HemisphereLight(0xdcefff, 0x4a3a2a, 0.75));
const sun = new THREE.DirectionalLight(0xfff3d6, 2.0);
sun.position.set(-3, 6, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -4;
sun.shadow.camera.right = 4;
sun.shadow.camera.top = 4;
sun.shadow.camera.bottom = -4;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 16;
sun.shadow.bias = -0.001;
scene.add(sun);

const DESK_TOP_Y = 0;
const desk = new THREE.Mesh(
  new THREE.BoxGeometry(3.6, 0.16, 2.4),
  new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.72, metalness: 0.04 }),
);
desk.position.set(0.15, DESK_TOP_Y - 0.08, 0.05);
desk.receiveShadow = true;
scene.add(desk);

const PAPER_W = 1.35;
const PAPER_D = 0.98;
const PAPER_CENTER = new THREE.Vector3(-1.05, DESK_TOP_Y + 0.012, 0.15);
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
  const len = 0.34;
  const rad = 0.012;
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(rad, rad, len, 6),
    new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.5 }),
  );
  shaft.rotation.z = Math.PI / 2;
  shaft.castShadow = true;
  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(rad, 0.001, 0.05, 6),
    new THREE.MeshStandardMaterial({ color: 0xe8c39e, roughness: 0.6 }),
  );
  tip.rotation.z = Math.PI / 2;
  tip.position.x = len / 2 + 0.025;
  const lead = new THREE.Mesh(
    new THREE.ConeGeometry(0.003, 0.018, 6),
    new THREE.MeshStandardMaterial({ color: 0x2b2b2b }),
  );
  lead.rotation.z = Math.PI / 2;
  lead.position.x = len / 2 + 0.055;
  pencil.add(shaft, tip, lead);
  pencil.rotation.y = 0.5;
  pencil.position.set(PAPER_CENTER.x + 0.42, DESK_TOP_Y + 0.02, PAPER_CENTER.z + 0.32);
  scene.add(pencil);
}

const DRAW_SCALE = 0.42;
function flattenToPaper(x, y) {
  return [
    PAPER_CENTER.x + x * DRAW_SCALE,
    PAPER_CENTER.y + 0.015,
    PAPER_CENTER.z + 0.28 - y * DRAW_SCALE,
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

const matCache = new Map();
function materialFor(color) {
  let m = matCache.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.02 });
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
  world = null;
  bodies = null;
  contactMaterial = null;
}

function buildSolid() {
  clearSolid();
  const sim = createSim({ friction: state.friction, bookMass: state.mass });
  world = sim.world;
  bodies = sim.bodies;
  contactMaterial = sim.contactMaterial;
  setFriction(bodies, contactMaterial, state.friction);
  setBookMass(bodies, state.mass);
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
  for (const body of bodies.visuals) {
    const u = body.userData;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(u.half[0] * 2, u.half[1] * 2, u.half[2] * 2),
      materialFor(u.color),
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    solidGroup.add(mesh);
    rigs.push({ mesh, body });
  }
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
}

const state = {
  stage: 'paper',
  mass: DEFAULT_BOOK_MASS,
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
  } else {
    sketchLines.visible = false;
    solidGroup.visible = true;
  }
}

function $(id) { return document.getElementById(id); }
$('massSlider').addEventListener('input', (e) => {
  state.mass = Number(e.target.value);
  $('massVal').textContent = String(state.mass);
  if (bodies) setBookMass(bodies, state.mass);
});
$('frictionSlider').addEventListener('input', (e) => {
  state.friction = Number(e.target.value);
  $('frictionVal').textContent = state.friction.toFixed(2);
  if (bodies) setFriction(bodies, contactMaterial, state.friction);
});
$('pullDowelBtn').addEventListener('click', () => {
  if (world && bodies) removeDowel(world, bodies);
  else state.pendingRemove = true;
});
$('startBtn').addEventListener('click', () => runIntro());

let introToken = 0;
function runIntro() {
  const token = ++introToken;
  state.pendingRemove = false;
  buildSolid();
  setStage('paper');
  const liftStart = performance.now() + 800;
  const liftDur = 2000;
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
        removeDowel(world, bodies);
        state.pendingRemove = false;
      }
    }, 300);
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
