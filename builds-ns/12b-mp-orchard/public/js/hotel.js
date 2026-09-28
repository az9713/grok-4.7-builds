import * as THREE from 'three';
import { makeWoodDiffuse, makeBark, makeSign } from './textures.js';

// Cider barn at the end of an apple orchard, dawn. Trees flank a lane
// so carts can drive the frost off the grass in front of the barn.
export function buildHotel() {
  const root = new THREE.Group();
  const timber = new THREE.MeshStandardMaterial({ map: makeWoodDiffuse(256, '#7a4a2c', '#4a2c18'), roughness: 0.82 });
  const darkTimber = new THREE.MeshStandardMaterial({ map: makeWoodDiffuse(256, '#3e2616', '#24150d'), roughness: 0.8 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x6e2e24, roughness: 0.72 });
  const bark = new THREE.MeshStandardMaterial({ map: makeBark(), roughness: 0.9 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x3e6a32, roughness: 0.85 });
  const apple = new THREE.MeshStandardMaterial({ color: 0xc4372f, roughness: 0.4 });
  const warm = new THREE.MeshPhysicalMaterial({
    color: 0xffe0a8, emissive: 0xffb15a, emissiveIntensity: 0.7,
    roughness: 0.25, transparent: true, opacity: 0.9
  });
  const metal = new THREE.MeshStandardMaterial({ color: 0x8d9094, metalness: 0.7, roughness: 0.35 });

  const barn = new THREE.Group();
  const WIDTH = 18;
  const DEPTH = 12;
  const WALL_H = 6.5;

  const body = new THREE.Mesh(new THREE.BoxGeometry(WIDTH, WALL_H, DEPTH), timber);
  body.position.y = WALL_H / 2;
  body.castShadow = true;
  barn.add(body);

  const ridgeRise = 4.2;
  const halfSpan = WIDTH / 2 + 0.6;
  const slopeLen = Math.hypot(halfSpan, ridgeRise);
  const slopeAngle = Math.atan2(ridgeRise, halfSpan);
  const slope = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.22, DEPTH + 1.2), roofMat);
  slope.position.set(halfSpan / 2, WALL_H + ridgeRise / 2, 0);
  slope.rotation.z = -slopeAngle;
  slope.castShadow = true;
  barn.add(slope);
  const slope2 = slope.clone();
  slope2.position.x = -halfSpan / 2;
  slope2.rotation.z = Math.PI + slopeAngle;
  barn.add(slope2);

  const door = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.4, 0.18), darkTimber);
  door.position.set(-2.2, 2.2, DEPTH / 2 + 0.05);
  barn.add(door);
  const door2 = door.clone();
  door2.position.x = 2.4;
  door2.position.z = DEPTH / 2 + 0.35;
  door2.rotation.y = -0.5;
  barn.add(door2);

  const interior = new THREE.PointLight(0xffb15a, 1.2, 18, 2);
  interior.position.set(0, 3.2, DEPTH / 2 - 1);
  barn.add(interior);

  function windowPane(x, y) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.5, 0.12), darkTimber);
    frame.position.set(x, y, DEPTH / 2 + 0.08);
    barn.add(frame);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.15, 0.06), warm);
    pane.position.set(x, y, DEPTH / 2 + 0.16);
    barn.add(pane);
  }
  windowPane(-6.2, 3.6);
  windowPane(6.2, 3.6);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 1.5),
    new THREE.MeshStandardMaterial({ map: makeSign('CIDER', '#6e2e24', '#f3e2c0'), roughness: 0.7 })
  );
  sign.position.set(0, 5.3, DEPTH / 2 + 0.2);
  barn.add(sign);

  function barrel(x, z) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.85, 12), darkTimber);
    b.position.set(x, 0.42, z);
    b.castShadow = true;
    barn.add(b);
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.025, 6, 12), metal);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.set(x, 0.55, z);
    barn.add(hoop);
  }
  barrel(-5.5, DEPTH / 2 + 1.4);
  barrel(-4.5, DEPTH / 2 + 1.7);
  barrel(5.2, DEPTH / 2 + 1.5);

  const press = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 1.1), darkTimber);
  press.position.set(4.2, 0.7, DEPTH / 2 + 1.6);
  barn.add(press);

  barn.position.set(0, 0, -40);
  root.add(barn);

  function appleTree(x, z, scale) {
    const t = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 2.4 * scale, 7), bark);
    trunk.position.y = 1.2 * scale;
    trunk.castShadow = true;
    t.add(trunk);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1.35 * scale, 10, 8), leaf);
    crown.position.y = 2.7 * scale;
    crown.castShadow = true;
    t.add(crown);
    for (let i = 0; i < 4; i++) {
      const a = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), apple);
      const ang = i * 1.6;
      a.position.set(Math.cos(ang) * 0.7 * scale, 2.5 * scale + (i % 2) * 0.3, Math.sin(ang) * 0.6 * scale);
      t.add(a);
    }
    t.position.set(x, 0, z);
    root.add(t);
  }

  const rows = [-26, -18, 18, 26];
  for (const x of rows) {
    for (let z = -22; z <= 36; z += 10) {
      appleTree(x, z, 0.9 + ((x + z) % 5) * 0.04);
    }
  }

  root.traverse((o) => { if (o.isMesh) o.receiveShadow = true; });
  return root;
}
