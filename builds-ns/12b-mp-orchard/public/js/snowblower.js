import * as THREE from 'three';
import { makeWoodDiffuse } from './textures.js';

// Heated orchard cart. The driver's left hand is on a tiller. The right
// hand holds a pruning lamp. There is no steering wheel and no drink.
export function buildSnowblower(bodyColorHex = 0x8c4a2f) {
  const group = new THREE.Group();

  const paint = new THREE.MeshPhysicalMaterial({
    color: bodyColorHex, metalness: 0.25, roughness: 0.48,
    clearcoat: 0.25, clearcoatRoughness: 0.4
  });
  const wood = new THREE.MeshStandardMaterial({ map: makeWoodDiffuse(), roughness: 0.82 });
  const crateMat = new THREE.MeshStandardMaterial({ map: makeWoodDiffuse(256, '#a56b3c', '#6d4122'), roughness: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2b241c, metalness: 0.45, roughness: 0.5 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1a1614, roughness: 0.96 });
  const glove = new THREE.MeshStandardMaterial({ color: 0x5c6b3a, roughness: 0.75 });
  const heaterMat = new THREE.MeshStandardMaterial({
    color: 0x3a2418, emissive: 0xff6a1a, emissiveIntensity: 0.85, roughness: 0.4, metalness: 0.3
  });
  const lampGlass = new THREE.MeshPhysicalMaterial({
    color: 0xfff1c8, emissive: 0xffc56a, emissiveIntensity: 1.6,
    roughness: 0.2, transparent: true, opacity: 0.9
  });
  const appleMat = new THREE.MeshStandardMaterial({ color: 0xc4372f, roughness: 0.45 });

  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.28, 1.7), wood);
  bed.position.set(0, 0.72, 0.35);
  bed.castShadow = true;
  group.add(bed);

  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 1.7), wood);
  sideL.position.set(-0.58, 0.98, 0.35);
  group.add(sideL);
  const sideR = sideL.clone();
  sideR.position.x = 0.58;
  group.add(sideR);

  const heater = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 1.35), heaterMat);
  heater.position.set(0, 0.42, 0.3);
  group.add(heater);
  for (let i = -2; i <= 2; i++) {
    const coil = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.05), heaterMat);
    coil.position.set(0, 0.36, 0.3 + i * 0.22);
    group.add(coil);
  }

  function makeWheel(x, z, radius) {
    const w = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.18, 16), rubber);
    tire.rotation.z = Math.PI / 2;
    w.add(tire);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.35, radius * 0.35, 0.2, 10), dark);
    hub.rotation.z = Math.PI / 2;
    w.add(hub);
    w.position.set(x, radius, z);
    return w;
  }
  group.add(makeWheel(-0.62, 0.85, 0.34));
  group.add(makeWheel(0.62, 0.85, 0.34));
  group.add(makeWheel(-0.62, -0.35, 0.42));
  group.add(makeWheel(0.62, -0.35, 0.42));

  function crate(x, y, z) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.42), crateMat);
    c.position.set(x, y, z);
    c.castShadow = true;
    group.add(c);
    const apple = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), appleMat);
    apple.position.set(x, y + 0.2, z);
    group.add(apple);
  }
  crate(-0.22, 1.02, 0.55);
  crate(0.22, 1.02, 0.55);
  crate(0, 1.02, 0.1);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.4), dark);
  seat.position.set(0, 0.95, -0.72);
  group.add(seat);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.4), paint);
  nose.position.set(0, 0.78, 1.25);
  group.add(nose);

  // Tiller: a bar, not a wheel. Left hand (vehicle +X, screen-left) grips it.
  const tiller = new THREE.Group();
  tiller.position.set(0, 0.95, -0.35);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.55, 8), dark);
  post.position.set(0, 0.22, -0.15);
  post.rotation.x = 0.55;
  tiller.add(post);
  const gripBar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.62, 8), dark);
  gripBar.rotation.z = Math.PI / 2;
  gripBar.position.set(0, 0.42, -0.38);
  tiller.add(gripBar);
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), glove);
  leftHand.scale.set(1.15, 0.8, 1.2);
  leftHand.position.set(0.22, 0.44, -0.38);
  tiller.add(leftHand);
  group.add(tiller);
  group.userData.wheelGroup = tiller;
  group.userData.steerAxis = 'y';
  group.userData.steerGain = 0.4;

  // Pruning lamp in the other hand. Vehicle -X reads as screen-right.
  const lamp = new THREE.Group();
  lamp.position.set(-0.38, 1.02, -0.55);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.28, 8), dark);
  handle.rotation.z = 0.4;
  lamp.add(handle);
  const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 8, 1, true), dark);
  cage.position.set(-0.06, 0.16, 0.02);
  lamp.add(cage);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), lampGlass);
  bulb.position.set(-0.06, 0.16, 0.02);
  lamp.add(bulb);
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 8), glove);
  rightHand.scale.set(1.1, 0.85, 1.15);
  rightHand.position.set(0.02, -0.02, 0.02);
  lamp.add(rightHand);
  const lampLight = new THREE.PointLight(0xffc56a, 0.7, 7, 2);
  lampLight.position.set(-0.06, 0.16, 0.02);
  lamp.add(lampLight);
  group.add(lamp);

  group.userData.fxLocal = new THREE.Vector3(0, 0.38, 0.35);
  group.userData.fxDir = new THREE.Vector3(0, 1, 0.15);

  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return group;
}

export function buildDriverFigure(color = 0x6d3b2a) {
  const g = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color, roughness: 0.78 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xd8a273, roughness: 0.6 });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.36, 4, 8), cloth);
  torso.position.set(0, 1.22, -0.7);
  g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), skin);
  head.position.set(0, 1.58, -0.7);
  g.add(head);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), cloth);
  cap.position.set(0, 1.64, -0.7);
  g.add(cap);
  return g;
}
