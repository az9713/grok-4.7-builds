import * as THREE from 'three';

// Fine frost motes in the dawn air. Cosmetic and client-local.
export function createSnowfall(scene, count = 700, spread = 56) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = Math.random() * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    speeds[i] = 0.25 + Math.random() * 0.45;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xf7fbff, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  function update(dt, centerX, centerZ) {
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= speeds[i] * dt;
      pos[i * 3] += Math.sin(performance.now() * 0.0003 + i) * 0.006;
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3] = centerX + (Math.random() - 0.5) * spread;
        pos[i * 3 + 1] = 12 + Math.random() * 4;
        pos[i * 3 + 2] = centerZ + (Math.random() - 0.5) * spread;
      }
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { points, update };
}

// Steam lifting off the heated cart belly.
export function createPlumeSystem(scene, poolSize = 140) {
  const positions = new Float32Array(poolSize * 3);
  const velocities = new Float32Array(poolSize * 3);
  const life = new Float32Array(poolSize).fill(0);
  let cursor = 0;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xf3f7fb, size: 0.22, transparent: true, opacity: 0.45, depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  function emit(originX, originY, originZ, dirX, dirZ, n = 2) {
    for (let k = 0; k < n; k++) {
      const i = cursor;
      cursor = (cursor + 1) % poolSize;
      positions[i * 3] = originX + (Math.random() - 0.5) * 0.7;
      positions[i * 3 + 1] = originY;
      positions[i * 3 + 2] = originZ + (Math.random() - 0.5) * 0.9;
      velocities[i * 3] = dirX * 0.3 + (Math.random() - 0.5) * 0.35;
      velocities[i * 3 + 1] = 0.9 + Math.random() * 0.7;
      velocities[i * 3 + 2] = dirZ * 0.3 + (Math.random() - 0.5) * 0.35;
      life[i] = 0.9 + Math.random() * 0.6;
    }
  }

  function update(dt) {
    for (let i = 0; i < poolSize; i++) {
      if (life[i] <= 0) { positions[i * 3 + 1] = -1000; continue; }
      life[i] -= dt;
      velocities[i * 3 + 1] += 0.35 * dt;
      positions[i * 3] += velocities[i * 3] * dt;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { emit, update };
}
