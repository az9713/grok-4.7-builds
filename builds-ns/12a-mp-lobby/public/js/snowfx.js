import * as THREE from 'three';

const CONFETTI = [
  [0.89, 0.23, 0.29],
  [0.95, 0.76, 0.31],
  [0.23, 0.63, 0.85],
  [0.49, 0.31, 0.64],
  [0.96, 0.48, 0.70],
  [0.97, 0.95, 0.92]
];

// Confetti drifting through the lobby. Cosmetic and client-local.
export function createSnowfall(scene, count = 900, spread = 48) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = Math.random() * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    speeds[i] = 0.35 + Math.random() * 0.55;
    const col = CONFETTI[i % CONFETTI.length];
    colors[i * 3] = col[0];
    colors[i * 3 + 1] = col[1];
    colors[i * 3 + 2] = col[2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.12, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  function update(dt, centerX, centerZ) {
    const pos = geo.attributes.position.array;
    const t = performance.now() * 0.001;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= speeds[i] * dt;
      pos[i * 3] += Math.sin(t + i) * 0.012;
      pos[i * 3 + 2] += Math.cos(t * 0.7 + i) * 0.008;
      if (pos[i * 3 + 1] < 0.05) {
        pos[i * 3] = centerX + (Math.random() - 0.5) * spread;
        pos[i * 3 + 1] = 6.5 + Math.random() * 1.2;
        pos[i * 3 + 2] = centerZ + (Math.random() - 0.5) * spread;
      }
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { points, update };
}

export function createPlumeSystem(scene, poolSize = 160) {
  const positions = new Float32Array(poolSize * 3);
  const colors = new Float32Array(poolSize * 3);
  const velocities = new Float32Array(poolSize * 3);
  const life = new Float32Array(poolSize).fill(0);
  let cursor = 0;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.14, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  function emit(originX, originY, originZ, dirX, dirZ, n = 3) {
    for (let k = 0; k < n; k++) {
      const i = cursor;
      cursor = (cursor + 1) % poolSize;
      const col = CONFETTI[(i + k) % CONFETTI.length];
      colors[i * 3] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];
      positions[i * 3] = originX + (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = originY + Math.random() * 0.15;
      positions[i * 3 + 2] = originZ + (Math.random() - 0.5) * 0.8;
      velocities[i * 3] = dirX * (1.2 + Math.random()) + (Math.random() - 0.5) * 1.4;
      velocities[i * 3 + 1] = 0.8 + Math.random() * 1.1;
      velocities[i * 3 + 2] = dirZ * (1.2 + Math.random()) + (Math.random() - 0.5) * 1.4;
      life[i] = 0.6 + Math.random() * 0.45;
    }
  }

  function update(dt) {
    for (let i = 0; i < poolSize; i++) {
      if (life[i] <= 0) { positions[i * 3 + 1] = -1000; continue; }
      life[i] -= dt;
      velocities[i * 3 + 1] -= 2.4 * dt;
      positions[i * 3] += velocities[i * 3] * dt;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  }

  return { emit, update };
}
