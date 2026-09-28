import * as THREE from 'three';

// Salt dust lifted by the noon wind. Sparse, bright, client-local.
export function createSnowfall(scene, count = 420, spread = 70) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = Math.random() * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    speeds[i] = 0.8 + Math.random() * 1.4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xfffaf2, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  function update(dt, centerX, centerZ) {
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += speeds[i] * dt * 1.6;
      pos[i * 3 + 1] += Math.sin(performance.now() * 0.001 + i) * 0.01;
      if (pos[i * 3] > centerX + spread * 0.5) {
        pos[i * 3] = centerX - spread * 0.5;
        pos[i * 3 + 1] = 0.4 + Math.random() * 3;
        pos[i * 3 + 2] = centerZ + (Math.random() - 0.5) * spread;
      }
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { points, update };
}

// Brine mist off the rear spray bar.
export function createPlumeSystem(scene, poolSize = 220) {
  const positions = new Float32Array(poolSize * 3);
  const velocities = new Float32Array(poolSize * 3);
  const life = new Float32Array(poolSize).fill(0);
  let cursor = 0;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xc5d5de, size: 0.18, transparent: true, opacity: 0.55, depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  function emit(originX, originY, originZ, dirX, dirZ, n = 4) {
    for (let k = 0; k < n; k++) {
      const i = cursor;
      cursor = (cursor + 1) % poolSize;
      positions[i * 3] = originX + (Math.random() - 0.5) * 2.4;
      positions[i * 3 + 1] = originY + Math.random() * 0.15;
      positions[i * 3 + 2] = originZ + (Math.random() - 0.5) * 0.2;
      velocities[i * 3] = dirX * (1.5 + Math.random()) + (Math.random() - 0.5) * 0.8;
      velocities[i * 3 + 1] = 0.35 + Math.random() * 0.55;
      velocities[i * 3 + 2] = dirZ * (2.2 + Math.random() * 1.4) + (Math.random() - 0.5) * 0.4;
      life[i] = 0.45 + Math.random() * 0.35;
    }
  }

  function update(dt) {
    for (let i = 0; i < poolSize; i++) {
      if (life[i] <= 0) { positions[i * 3 + 1] = -1000; continue; }
      life[i] -= dt;
      velocities[i * 3 + 1] -= 1.6 * dt;
      positions[i * 3] += velocities[i * 3] * dt;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { emit, update };
}
