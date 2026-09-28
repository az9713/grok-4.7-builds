import * as THREE from 'three';

// Brine truck. Cab, cylindrical tank, rear spray bar. Hands on the wheel.
// No thermos, no auger. The camera stays a fixed cockpit — no mouse-look.
export function buildSnowblower(bodyColorHex = 0xd7dee6) {
  const group = new THREE.Group();

  const paint = new THREE.MeshPhysicalMaterial({
    color: bodyColorHex, metalness: 0.55, roughness: 0.32,
    clearcoat: 0.7, clearcoatRoughness: 0.16
  });
  const tankPaint = new THREE.MeshPhysicalMaterial({
    color: bodyColorHex, metalness: 0.62, roughness: 0.28,
    clearcoat: 0.45, clearcoatRoughness: 0.2
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x23272c, metalness: 0.55, roughness: 0.45 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.96 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xc5d5e4, roughness: 0.08, metalness: 0.1,
    transparent: true, opacity: 0.45
  });
  const glove = new THREE.MeshStandardMaterial({ color: 0xf0c14a, roughness: 0.7 });
  const brine = new THREE.MeshPhysicalMaterial({
    color: 0x2f6f86, metalness: 0.05, roughness: 0.15,
    transparent: true, opacity: 0.8
  });
  const stripe = new THREE.MeshStandardMaterial({ color: 0x1f8a84, roughness: 0.4, metalness: 0.2 });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 4.4), dark);
  chassis.position.set(0, 0.7, -0.2);
  chassis.castShadow = true;
  group.add(chassis);

  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.15, 1.45), paint);
  cab.position.set(0, 1.35, 0.85);
  cab.castShadow = true;
  group.add(cab);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.55, 1.15), paint);
  hood.position.set(0, 0.95, 1.85);
  group.add(hood);

  const win = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.55, 0.06), glass);
  win.position.set(0, 1.55, 1.58);
  group.add(win);
  const winL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.7), glass);
  winL.position.set(-0.78, 1.52, 0.9);
  group.add(winL);
  const winR = winL.clone();
  winR.position.x = 0.78;
  group.add(winR);

  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.15, 20), tankPaint);
  tank.rotation.z = Math.PI / 2;
  tank.position.set(0, 1.45, -1.15);
  tank.castShadow = true;
  group.add(tank);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.18, 20), stripe);
  band.rotation.z = Math.PI / 2;
  band.position.set(0, 1.45, -1.15);
  group.add(band);

  const sight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.16), brine);
  sight.position.set(0.66, 1.45, -1.15);
  group.add(sight);

  function truckWheel(x, z) {
    const w = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.32, 16), rubber);
    tire.rotation.z = Math.PI / 2;
    w.add(tire);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.36, 10), dark);
    hub.rotation.z = Math.PI / 2;
    w.add(hub);
    w.position.set(x, 0.48, z);
    return w;
  }
  group.add(truckWheel(-0.85, 1.45));
  group.add(truckWheel(0.85, 1.45));
  group.add(truckWheel(-0.85, -0.85));
  group.add(truckWheel(0.85, -0.85));
  group.add(truckWheel(-0.85, -1.55));
  group.add(truckWheel(0.85, -1.55));

  const bar = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.08, 0.08), dark);
  bar.position.set(0, 0.62, -2.45);
  group.add(bar);
  for (let i = -4; i <= 4; i++) {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.12, 8), brine);
    nozzle.position.set(i * 0.24, 0.52, -2.45);
    group.add(nozzle);
  }
  const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), dark);
  hose.position.set(0.4, 0.95, -2.05);
  hose.rotation.x = 0.6;
  group.add(hose);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.55, 8), dark);
  column.position.set(0.28, 1.15, 1.15);
  column.rotation.x = 0.45;
  group.add(column);

  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(0.28, 1.32, 1.32);
  wheelGroup.rotation.x = -1.05;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 18), dark);
  wheelGroup.add(ring);
  for (let i = 0; i < 3; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.02), dark);
    spoke.rotation.z = (i / 3) * Math.PI;
    wheelGroup.add(spoke);
  }
  function hand(angle) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), glove);
    h.scale.set(1, 0.8, 1.2);
    h.position.set(Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, 0.04);
    return h;
  }
  wheelGroup.add(hand(2.4), hand(0.7));
  group.add(wheelGroup);
  group.userData.wheelGroup = wheelGroup;
  group.userData.steerAxis = 'z';
  group.userData.steerGain = 0.4;

  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 10), stripe);
  beacon.position.set(0, 1.98, 0.85);
  group.add(beacon);

  group.userData.fxLocal = new THREE.Vector3(0, 0.5, -2.45);
  group.userData.fxDir = new THREE.Vector3(0, 0.2, -1);

  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return group;
}

export function buildDriverFigure(color = 0x1f8a84) {
  const g = new THREE.Group();
  const vest = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x2c3138, roughness: 0.75 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xd8a273, roughness: 0.6 });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.4, 4, 8), cloth);
  torso.position.set(0.05, 1.45, 0.7);
  g.add(torso);
  const hi = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.32, 0.2), vest);
  hi.position.set(0.05, 1.5, 0.72);
  g.add(hi);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), skin);
  head.position.set(0.05, 1.88, 0.7);
  g.add(head);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 10), vest);
  hat.position.set(0.05, 2.0, 0.7);
  g.add(hat);
  return g;
}
