import * as THREE from 'three';
import { makeGroundDiffuse, makeCoverDiffuse, makeCoverNormal, makeCoverRoughness } from './textures.js';

// Dry salt crust over a dark wet bed. The truck clears crust to lay a wet
// road; refill dries that road white again.
export function buildTerrain(scene, worldMeta) {
  const size = worldMeta.size;
  const res = worldMeta.gridRes;

  const groundGeo = new THREE.PlaneGeometry(size, size, 8, 8);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshPhysicalMaterial({
    map: makeGroundDiffuse(),
    color: 0x9aa7b2,
    roughness: 0.22,
    metalness: 0.08,
    clearcoat: 0.65,
    clearcoatRoughness: 0.12
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = true;
  scene.add(ground);

  const segments = Math.round(res / 2);
  const coverGeo = new THREE.PlaneGeometry(size, size, segments, segments);
  coverGeo.rotateX(-Math.PI / 2);

  const gridData = new Uint8Array(res * res * 4).fill(255);
  const coverTex = new THREE.DataTexture(gridData, res, res, THREE.RGBAFormat, THREE.UnsignedByteType);
  coverTex.magFilter = THREE.LinearFilter;
  coverTex.minFilter = THREE.LinearFilter;
  coverTex.wrapS = coverTex.wrapT = THREE.ClampToEdgeWrapping;
  coverTex.needsUpdate = true;

  const coverMat = new THREE.MeshStandardMaterial({
    map: makeCoverDiffuse(),
    color: 0xf7f4ee,
    roughness: 0.92,
    metalness: 0.0,
    normalMap: makeCoverNormal(),
    roughnessMap: makeCoverRoughness(),
    alphaMap: coverTex,
    displacementMap: coverTex,
    displacementScale: 0.16,
    displacementBias: -0.02,
    transparent: true,
    alphaTest: 0.03,
    depthWrite: true
  });
  const cover = new THREE.Mesh(coverGeo, coverMat);
  cover.position.y = 0.02;
  cover.receiveShadow = true;
  scene.add(cover);

  function update(world) {
    if (!world.snowBytes || !world.snowDirty) return;
    const src = world.snowBytes;
    for (let i = 0; i < src.length; i++) {
      const v = src[i];
      const o = i * 4;
      gridData[o] = v; gridData[o + 1] = v; gridData[o + 2] = v; gridData[o + 3] = v;
    }
    coverTex.needsUpdate = true;
    world.snowDirty = false;
  }

  return { ground, snow: cover, snowDataTex: coverTex, update };
}
