import * as THREE from 'three';

// Sit-down floor buffer for the lobby. Layout filename is shared with the
// other sims; this mesh is a low ride-on buffer, not a snowblower.
// Hands rest on a small wheel. There is no drink and no auger.
export function buildSnowblower(bodyColorHex = 0xd4a017) {
  const group = new THREE.Group();

  const paint = new THREE.MeshPhysicalMaterial({
    color: bodyColorHex, metalness: 0.35, roughness: 0.38,
    clearcoat: 0.55, clearcoatRoughness: 0.22
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2c30, metalness: 0.4, roughness: 0.55 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.95 });
  const glove = new THREE.MeshStandardMaterial({ color: 0xc4552a, roughness: 0.72 });
  const plastic = new THREE.MeshPhysicalMaterial({
    color: 0x7ec8e3, metalness: 0.05, roughness: 0.25,
    transparent: true, opacity: 0.72
  });
  const padMat = new THREE.MeshStandardMaterial({ color: 0x1c1c22, roughness: 0.85 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc6a15b, metalness: 0.85, roughness: 0.28 });

  const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.02, 0.16, 28), paint);
  deck.position.set(0, 0.22, 1.15);
  deck.castShadow = true;
  group.add(deck);

  const rotor = new THREE.Group();
  rotor.position.set(0, 0.12, 1.15);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.06, 24), padMat);
  rotor.add(pad);
  for (let i = 0; i < 10; i++) {
    const bristle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.72), rubber);
    bristle.rotation.y = (i / 10) * Math.PI;
    bristle.position.y = -0.02;
    rotor.add(bristle);
  }
  group.add(rotor);
  group.userData.rotor = rotor;

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 1.35), paint);
  body.position.set(0, 0.58, -0.15);
  body.castShadow = true;
  group.add(body);

  const cowling = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.55), dark);
  cowling.position.set(0, 0.82, 0.35);
  group.add(cowling);

  function wheel(x, z, r) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.16, 14), rubber);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, r, z);
    w.castShadow = true;
    return w;
  }
  group.add(wheel(-0.48, -0.55, 0.22));
  group.add(wheel(0.48, -0.55, 0.22));
  group.add(wheel(-0.42, 0.35, 0.16));
  group.add(wheel(0.42, 0.35, 0.16));

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.1, 0.48), dark);
  seat.position.set(0, 0.86, -0.45);
  group.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.08), dark);
  back.position.set(0, 1.1, -0.68);
  group.add(back);

  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.38, 14), plastic);
  tank.position.set(-0.34, 0.95, -0.15);
  group.add(tank);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.06, 10), dark);
  cap.position.set(-0.34, 1.16, -0.15);
  group.add(cap);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.48, 8), dark);
  column.position.set(0, 1.02, 0.12);
  column.rotation.x = 0.7;
  group.add(column);

  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(0, 1.18, 0.32);
  wheelGroup.rotation.x = -0.95;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 8, 20), dark);
  wheelGroup.add(ring);
  const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.018, 0.018), brass);
  wheelGroup.add(spoke);
  const spoke2 = spoke.clone();
  spoke2.rotation.z = Math.PI / 2;
  wheelGroup.add(spoke2);

  function hand(angle) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), glove);
    h.scale.set(1.05, 0.8, 1.25);
    h.position.set(Math.cos(angle) * 0.16, Math.sin(angle) * 0.16, 0.04);
    return h;
  }
  wheelGroup.add(hand(Math.PI * 0.75), hand(Math.PI * 0.25));
  group.add(wheelGroup);
  group.userData.wheelGroup = wheelGroup;
  group.userData.steerAxis = 'z';
  group.userData.steerGain = 0.45;

  group.userData.fxLocal = new THREE.Vector3(0, 0.2, 1.15);
  group.userData.fxDir = new THREE.Vector3(0, 0.35, 1);

  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return group;
}

export function buildDriverFigure(color = 0x243044) {
  const g = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.65 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xd8a273, roughness: 0.6 });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.32, 4, 8), shirt);
  torso.position.set(0, 1.15, -0.42);
  g.add(torso);
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.16), cloth);
  vest.position.set(0, 1.18, -0.4);
  g.add(vest);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), skin);
  head.position.set(0, 1.48, -0.42);
  g.add(head);
  return g;
}
