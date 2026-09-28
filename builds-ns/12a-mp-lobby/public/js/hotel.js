import * as THREE from 'three';
import { makeWoodDiffuse, makeSign } from './textures.js';

// Hotel lobby after a party: reception wall, columns, chandeliers, ceiling.
// The driveable floor is the lobby tile in front of the desk.
export function buildHotel() {
  const root = new THREE.Group();
  const marble = new THREE.MeshStandardMaterial({ color: 0xe7e0d4, roughness: 0.45, metalness: 0.05 });
  const stone = new THREE.MeshStandardMaterial({ color: 0xb7ab9c, roughness: 0.7 });
  const wood = new THREE.MeshStandardMaterial({ map: makeWoodDiffuse(256, '#6a4330', '#3d2418'), roughness: 0.75 });
  const darkWood = new THREE.MeshStandardMaterial({ map: makeWoodDiffuse(256, '#3c2418', '#24140e'), roughness: 0.7 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc6a15b, metalness: 0.9, roughness: 0.25 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x7a1f33, roughness: 0.8 });
  const warmGlass = new THREE.MeshPhysicalMaterial({
    color: 0xfff0c4, emissive: 0xffc56a, emissiveIntensity: 0.9,
    roughness: 0.2, transparent: true, opacity: 0.92
  });
  const balloonColors = [0xe23b4a, 0xf2c14e, 0x3aa0d8, 0xf47bb2, 0x7d4ea3];

  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xe8d7b8, roughness: 0.9, side: THREE.DoubleSide });
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 7.4;
  root.add(ceiling);

  function column(x, z) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 6.6, 12), marble);
    col.position.set(x, 3.3, z);
    col.castShadow = true;
    root.add(col);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.22, 1.25), stone);
    cap.position.set(x, 6.7, z);
    root.add(cap);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.28, 12), stone);
    base.position.set(x, 0.14, z);
    root.add(base);
  }
  for (let z = -10; z <= 34; z += 14) {
    column(-16, z);
    column(16, z);
  }

  function chandelier(x, z) {
    const g = new THREE.Group();
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), brass);
    chain.position.y = 0.55;
    g.add(chain);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 8, 20), brass);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), warmGlass);
      bulb.position.set(Math.cos(a) * 0.7, -0.12, Math.sin(a) * 0.7);
      g.add(bulb);
    }
    const light = new THREE.PointLight(0xffd7a1, 0.55, 16, 2);
    g.add(light);
    g.position.set(x, 6.2, z);
    root.add(g);
  }
  chandelier(0, -8);
  chandelier(0, 16);

  const wall = new THREE.Group();
  const back = new THREE.Mesh(new THREE.BoxGeometry(34, 7.2, 0.6), marble);
  back.position.set(0, 3.6, 0);
  back.castShadow = true;
  back.receiveShadow = true;
  wall.add(back);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(8, 1.15, 1.4), darkWood);
  desk.position.set(0, 0.58, 1.5);
  desk.castShadow = true;
  wall.add(desk);
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(8.3, 0.08, 1.6), stone);
  deskTop.position.set(0, 1.18, 1.5);
  wall.add(deskTop);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 0.9),
    new THREE.MeshStandardMaterial({ map: makeSign('RECEPTION', '#6a4330', '#f4e7c8'), roughness: 0.6 })
  );
  sign.position.set(0, 5.4, 0.36);
  wall.add(sign);

  function door(x) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.4, 0.2), brass);
    frame.position.set(x, 1.8, 0.35);
    wall.add(frame);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(2.05, 3.05, 0.1), wood);
    leaf.position.set(x, 1.75, 0.48);
    wall.add(leaf);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.3, 0.06), warmGlass);
    pane.position.set(x, 2.3, 0.56);
    wall.add(pane);
  }
  door(-6.5);
  door(6.5);

  const runner = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.02, 18), cloth);
  runner.position.set(0, 0.02, 11);
  wall.add(runner);

  function balloons(x, z) {
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(
        new THREE.SphereGeometry(0.28 + Math.random() * 0.08, 10, 8),
        new THREE.MeshStandardMaterial({ color: balloonColors[i % balloonColors.length], roughness: 0.35 })
      );
      b.position.set(x + (i - 2) * 0.22, 2.2 + (i % 2) * 0.35, z);
      wall.add(b);
    }
  }
  balloons(-10, 1.2);
  balloons(10, 1.2);

  const sconceL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.2), warmGlass);
  sconceL.position.set(-12, 3.2, 0.4);
  wall.add(sconceL);
  const sconceR = sconceL.clone();
  sconceR.position.x = 12;
  wall.add(sconceR);

  wall.position.set(0, 0, -36);
  root.add(wall);
  root.traverse((o) => { if (o.isMesh) o.receiveShadow = true; });
  return root;
}
