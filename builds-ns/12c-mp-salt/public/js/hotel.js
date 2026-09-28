import * as THREE from 'three';
import { makeMetalPanel, makeSign } from './textures.js';

// Half-buried airliner on the salt. The fuselage lies across the flat;
// one wing and the tail stick out of the crust. This is not a hotel.
export function buildHotel() {
  const root = new THREE.Group();
  const skin = new THREE.MeshPhysicalMaterial({
    map: makeMetalPanel(),
    color: 0xe7edf2,
    metalness: 0.72,
    roughness: 0.32,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25
  });
  const stripeMat = new THREE.MeshStandardMaterial({
    map: makeSign('HALCYON', '#163a4a', '#f4f7f8', 1024, 128),
    roughness: 0.4,
    metalness: 0.3
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1c242c, metalness: 0.4, roughness: 0.55 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x9ec4d4, emissive: 0x17303a, emissiveIntensity: 0.25,
    roughness: 0.12, metalness: 0.2, transparent: true, opacity: 0.75
  });
  const saltStain = new THREE.MeshStandardMaterial({ color: 0xe7e2d6, roughness: 0.95 });

  const jet = new THREE.Group();

  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, 34, 24), skin);
  fuselage.rotation.z = Math.PI / 2;
  fuselage.position.y = 0.35;
  fuselage.castShadow = true;
  jet.add(fuselage);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(3.05, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), skin);
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(17, 0.35, 0);
  nose.castShadow = true;
  jet.add(nose);

  const tailCone = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 3.05, 6, 20), skin);
  tailCone.rotation.z = Math.PI / 2;
  tailCone.position.set(-18.5, 0.55, 0);
  jet.add(tailCone);

  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7.5, 5.2), skin);
  fin.position.set(-16.5, 4.2, 0);
  fin.castShadow = true;
  jet.add(fin);
  const finStripe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 4.4), stripeMat);
  finStripe.position.set(-16.2, 5.4, 0);
  jet.add(finStripe);

  const stabL = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 4.2), skin);
  stabL.position.set(-16.2, 2.4, 3.2);
  stabL.rotation.x = -0.15;
  jet.add(stabL);
  const stabR = stabL.clone();
  stabR.position.z = -2.4;
  stabR.rotation.x = 0.4;
  jet.add(stabR);

  // One wing raised out of the salt, the other buried (only a stub shows).
  const wing = new THREE.Mesh(new THREE.BoxGeometry(8, 0.28, 16), skin);
  wing.position.set(2, 3.6, 7.5);
  wing.rotation.x = -0.55;
  wing.rotation.z = 0.08;
  wing.castShadow = true;
  jet.add(wing);
  const buriedWing = new THREE.Mesh(new THREE.BoxGeometry(6, 0.28, 4), saltStain);
  buriedWing.position.set(2, 0.15, -2.2);
  buriedWing.rotation.x = 0.4;
  jet.add(buriedWing);

  const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 3.2, 14), dark);
  engine.rotation.z = Math.PI / 2;
  engine.position.set(3.2, 2.3, 6.4);
  engine.castShadow = true;
  jet.add(engine);
  const intake = new THREE.Mesh(new THREE.CircleGeometry(0.7, 12), dark);
  intake.position.set(4.85, 2.3, 6.4);
  intake.rotation.y = Math.PI / 2;
  jet.add(intake);

  for (let i = -8; i <= 10; i += 2.1) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.08), glass);
    w.position.set(i, 1.55, 3.05);
    jet.add(w);
    const w2 = w.clone();
    w2.position.z = -3.05;
    jet.add(w2);
  }

  const cheatline = new THREE.Mesh(new THREE.BoxGeometry(28, 0.7, 0.08), stripeMat);
  cheatline.position.set(0, 1.15, 3.12);
  jet.add(cheatline);

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.08), dark);
  door.position.set(8, 0.7, 3.12);
  jet.add(door);

  jet.position.set(0, 0, -36);
  root.add(jet);

  // A couple of salt ridges so the flat isn't only the grid.
  const ridgeMat = new THREE.MeshStandardMaterial({ color: 0xf7f4ee, roughness: 0.95 });
  for (const [x, z, rot] of [[-28, 8, 0.4], [24, 22, -0.2], [-18, 30, 0.1]]) {
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(8, 0.35, 1.4), ridgeMat);
    ridge.position.set(x, 0.12, z);
    ridge.rotation.y = rot;
    ridge.receiveShadow = true;
    root.add(ridge);
  }

  root.traverse((o) => { if (o.isMesh) o.castShadow = o.castShadow || false; });
  return root;
}
