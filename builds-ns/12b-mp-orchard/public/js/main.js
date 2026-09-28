import * as THREE from 'three';
import { World } from './world.js';
import { createNetwork } from './network.js';
import { buildTerrain } from './terrain.js';
import { buildSnowblower, buildDriverFigure } from './snowblower.js';
import { buildHotel } from './hotel.js';
import { createSnowfall, createPlumeSystem } from './snowfx.js';
import { createMinimap } from './minimap.js';
import { createChat } from './chat.js';

const world = new World();

const joinScreen = document.getElementById('join-screen');
const nameInput = document.getElementById('name-input');
const joinBtn = document.getElementById('join-btn');
const hud = document.getElementById('hud');
const loadingEl = document.getElementById('loading');
loadingEl.classList.add('hidden');

const params = new URLSearchParams(location.search);
const nameFromLink = params.get('name');
nameInput.value = nameFromLink || `Picker${Math.floor(Math.random() * 1000)}`;

let started = false;
function beginGame(name) {
  if (started) return;
  started = true;
  world.pendingName = name;
  joinScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  init();
}

joinBtn.addEventListener('click', () => beginGame(nameInput.value.trim() || 'Picker'));
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') joinBtn.click(); });

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.domElement.id = 'scene';
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const skyColor = 0xf0b48a;
scene.background = new THREE.Color(skyColor);
scene.fog = new THREE.Fog(0xd98a62, 28, 125);

const camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 0.05, 400);

const sun = new THREE.DirectionalLight(0xffb070, 2.7);
sun.position.set(-55, 9, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
sun.shadow.camera.left = -55;
sun.shadow.camera.right = 55;
sun.shadow.camera.top = 55;
sun.shadow.camera.bottom = -55;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 140;
sun.shadow.bias = -0.0015;
sun.shadow.normalBias = 0.03;
scene.add(sun);
scene.add(sun.target);

scene.add(new THREE.HemisphereLight(0xffc9a0, 0x3d5a32, 0.55));
scene.add(new THREE.AmbientLight(0xffe0c4, 0.08));

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let terrain, snowfall, plume, minimapUI, network, chatUI;
let localVehicle, wheelGroup;
const remoteVehicles = new Map();

const speedReadout = document.getElementById('speed-readout');
const playerListEl = document.getElementById('player-list');
const minimapCanvas = document.getElementById('minimap');
const chatLogEl = document.getElementById('chat-log');
const chatInputEl = document.getElementById('chat-input');

const input = { fwd: 0, steer: 0 };
const keyState = new Set();

function isTypingChat() {
  return document.activeElement === chatInputEl;
}

window.addEventListener('keydown', (e) => {
  if (isTypingChat()) return;
  keyState.add(e.key.toLowerCase());
});
window.addEventListener('keyup', (e) => {
  keyState.delete(e.key.toLowerCase());
});

function readInput() {
  if (isTypingChat()) { input.fwd = 0; input.steer = 0; return; }
  let fwd = 0, steer = 0;
  if (keyState.has('w') || keyState.has('arrowup')) fwd += 1;
  if (keyState.has('s') || keyState.has('arrowdown')) fwd -= 1;
  if (keyState.has('a') || keyState.has('arrowleft')) steer -= 1;
  if (keyState.has('d') || keyState.has('arrowright')) steer += 1;
  input.fwd = fwd; input.steer = steer;
}

const VEHICLE = { maxFwd: 6.4, maxRev: 2.8, accel: 6.2, friction: 4.8, turnRate: 1.55 };

function init() {
  network = createNetwork({
    world,
    onWelcome: (msg) => onWelcome(msg),
    onChat: (m) => { if (chatUI) chatUI.push(m); },
  });
  chatUI = createChat({
    logEl: chatLogEl,
    inputEl: chatInputEl,
    onSend: (text) => network.sendChat(text)
  });
}

let sceneBuilt = false;

function onWelcome() {
  chatUI.reset();
  for (const c of world.chat) chatUI.push(c);

  if (sceneBuilt) {
    localVehicle.position.set(world.me.x, 0, world.me.z);
    localVehicle.rotation.y = world.me.ry;
    for (const [, rv] of remoteVehicles) scene.remove(rv.group);
    remoteVehicles.clear();
    for (const p of world.remotes.values()) spawnRemote(p);
    return;
  }
  sceneBuilt = true;

  terrain = buildTerrain(scene, world.worldMeta);
  scene.add(buildHotel());
  snowfall = createSnowfall(scene);
  plume = createPlumeSystem(scene);
  minimapUI = createMinimap(minimapCanvas, world.worldMeta);

  localVehicle = buildSnowblower(world.me.color);
  localVehicle.position.set(world.me.x, 0, world.me.z);
  localVehicle.rotation.y = world.me.ry;
  scene.add(localVehicle);
  wheelGroup = localVehicle.userData.wheelGroup;

  camera.position.set(0.02, 1.46, -1.22);
  camera.rotation.set(0.22, Math.PI, 0);
  localVehicle.add(camera);

  for (const p of world.remotes.values()) spawnRemote(p);

  lastFrame = performance.now();
  requestAnimationFrame(frame);
}

function spawnRemote(p) {
  const group = buildSnowblower(p.color);
  const driver = buildDriverFigure(0x6d3b2a);
  group.add(driver);
  group.position.set(p.x, 0, p.z);
  group.rotation.y = p.ry;
  scene.add(group);
  remoteVehicles.set(p.id, { group, driver });
}

function reconcileRemotes() {
  for (const id of world.remotes.keys()) {
    if (!remoteVehicles.has(id)) spawnRemote(world.remotes.get(id));
  }
  for (const id of [...remoteVehicles.keys()]) {
    if (!world.remotes.has(id)) {
      scene.remove(remoteVehicles.get(id).group);
      remoteVehicles.delete(id);
    }
  }
}

function updatePlayerListHUD() {
  const rows = [];
  if (world.me) rows.push({ name: world.me.name + ' (you)', color: world.me.color });
  for (const p of world.remotes.values()) rows.push({ name: p.name, color: p.color });
  playerListEl.textContent = '';
  for (const r of rows) {
    const row = document.createElement('div');
    row.className = 'row';
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = '#' + r.color.toString(16).padStart(6, '0');
    row.appendChild(dot);
    row.appendChild(document.createTextNode(r.name));
    playerListEl.appendChild(row);
  }
}

function sprayFrom(vehicle, n) {
  const local = vehicle.userData.fxLocal;
  const dirLocal = vehicle.userData.fxDir;
  if (!local || !dirLocal) return;
  const origin = local.clone().applyMatrix4(vehicle.matrixWorld);
  const dir = dirLocal.clone().transformDirection(vehicle.matrixWorld);
  plume.emit(origin.x, origin.y, origin.z, dir.x, dir.z, n);
}

let lastFrame = 0;
let hudTimer = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - lastFrame) / 1000, 0.1);
  lastFrame = now;

  readInput();

  const me = world.me;
  const targetSpeed = input.fwd > 0 ? VEHICLE.maxFwd : (input.fwd < 0 ? -VEHICLE.maxRev : 0);
  if (input.fwd !== 0) {
    me.speed += Math.sign(targetSpeed - me.speed) * VEHICLE.accel * dt;
    if (Math.abs(me.speed - targetSpeed) < VEHICLE.accel * dt) me.speed = targetSpeed;
  } else {
    const decel = VEHICLE.friction * dt;
    if (Math.abs(me.speed) <= decel) me.speed = 0;
    else me.speed -= Math.sign(me.speed) * decel;
  }
  const speedFactor = Math.min(Math.abs(me.speed) / 2.5, 1);
  if (input.steer !== 0 && speedFactor > 0.02) {
    const dir = me.speed >= 0 ? 1 : -1;
    me.ry += input.steer * VEHICLE.turnRate * speedFactor * dir * dt;
  }
  me.x += Math.sin(me.ry) * me.speed * dt;
  me.z += Math.cos(me.ry) * me.speed * dt;
  const half = world.worldMeta.size / 2 - 2;
  me.x = Math.max(-half, Math.min(half, me.x));
  me.z = Math.max(-half, Math.min(half, me.z));

  localVehicle.position.set(me.x, 0, me.z);
  localVehicle.rotation.y = me.ry;
  if (wheelGroup) {
    const axis = localVehicle.userData.steerAxis || 'y';
    const gain = localVehicle.userData.steerGain || 0.4;
    wheelGroup.rotation[axis] = -input.steer * gain;
  }

  if (Math.abs(me.speed) > 0.3) sprayFrom(localVehicle, 2);

  reconcileRemotes();
  for (const [id, rv] of remoteVehicles) {
    const p = world.remotes.get(id);
    if (!p) continue;
    rv.group.position.x += (p.x - rv.group.position.x) * Math.min(dt * 10, 1);
    rv.group.position.z += (p.z - rv.group.position.z) * Math.min(dt * 10, 1);
    let dRy = p.ry - rv.group.rotation.y;
    dRy = Math.atan2(Math.sin(dRy), Math.cos(dRy));
    rv.group.rotation.y += dRy * Math.min(dt * 10, 1);
    if (Math.abs(p.speed) > 0.3) sprayFrom(rv.group, 2);
  }

  terrain.update(world);
  snowfall.update(dt, me.x, me.z);
  plume.update(dt);
  sun.target.position.set(me.x, 0, me.z);
  sun.position.set(me.x - 50, 9, me.z + 22);

  minimapUI.draw(world);

  hudTimer += dt;
  if (hudTimer > 0.15) {
    hudTimer = 0;
    speedReadout.textContent = `${Math.round(Math.abs(me.speed) * 3.6)} km/h`;
    updatePlayerListHUD();
  }

  renderer.render(scene, camera);
}

if (nameFromLink) beginGame(nameFromLink);
