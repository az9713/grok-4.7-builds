import * as THREE from 'three';

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

export function makeGroundDiffuse(size = 512) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2c4a28';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = 30 + Math.random() * 50;
    ctx.fillStyle = `rgba(${shade}, ${shade + 28}, ${shade * 0.4}, 0.35)`;
    ctx.fillRect(x, y, 1 + Math.random() * 2, 4 + Math.random() * 8);
  }
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = `rgba(90, 60, 30, ${0.15 + Math.random() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * size, Math.random() * size, 8 + Math.random() * 20, 3, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeCoverDiffuse(size = 256) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e7eef4';
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    img.data[i] = 220 + n;
    img.data[i + 1] = 230 + n;
    img.data[i + 2] = 240 + n * 0.4;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * size, Math.random() * size);
    ctx.lineTo(Math.random() * size, Math.random() * size);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeCoverNormal(size = 256) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgb(128,128,255)';
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const nx = (Math.random() - 0.5) * 55;
    const ny = (Math.random() - 0.5) * 55;
    img.data[i] = 128 + nx;
    img.data[i + 1] = 128 + ny;
    img.data[i + 2] = 255 - Math.abs(nx * 0.2);
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(20, 20);
  return tex;
}

export function makeCoverRoughness(size = 128) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 170 + Math.random() * 70;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  return tex;
}

export function makeWoodDiffuse(size = 256, base = '#6b4428', grain = '#3e2616') {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = grain;
  for (let i = 0; i < 46; i++) {
    ctx.globalAlpha = 0.18 + Math.random() * 0.25;
    ctx.lineWidth = 1 + Math.random() * 2.4;
    ctx.beginPath();
    const y = Math.random() * size;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + (Math.random() - 0.5) * 18, size * 0.7, y + (Math.random() - 0.5) * 18, size, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeBark(size = 256) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#4a3424';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#2a1c12';
  for (let x = 0; x < size; x += 7) {
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, size);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeSign(text, bg, fg, w = 512, h = 160) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.fillStyle = fg;
  ctx.font = `700 ${Math.floor(h * 0.42)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
