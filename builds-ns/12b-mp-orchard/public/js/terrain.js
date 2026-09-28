import * as THREE from 'three';
import { makeGroundDiffuse, makeCoverDiffuse, makeCoverNormal, makeCoverRoughness } from './textures.js';

// Grass under a frost sheet. Driving melts the frost (alpha goes to 0) and
// leaves a dark lane; the server refill brings the white sheet back.
export function buildTerrain(scene, worldMeta) {
  const size = worldMeta.size;
  const res = worldMeta.gridRes;

  const groundGeo = new THREE.PlaneGeometry(size, size, 10, 10);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({
    map: makeGroundDiffuse(),
    roughness: 0.96,
    metalness: 0
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

  const coverMat = new THREE.MeshPhysicalMaterial({
    map: makeCoverDiffuse(),
    color: 0xf4f8fc,
    roughness: 0.72,
    metalness: 0.0,
    sheen: 0.85,
    sheenColor: 0xd5e6f5,
    sheenRoughness: 0.45,
    clearcoat: 0.12,
    clearcoatRoughness: 0.35,
    normalMap: makeCoverNormal(),
    roughnessMap: makeCoverRoughness(),
    alphaMap: coverTex,
    displacementMap: coverTex,
    displacementScale: 0.1,
    displacementBias: -0.01,
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
