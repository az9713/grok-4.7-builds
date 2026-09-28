import * as THREE from 'three';

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

export function makeGroundDiffuse(size = 512) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e7e1d6';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 18; i++) {
    ctx.strokeStyle = `rgba(150, 140, 128, ${0.15 + Math.random() * 0.2})`;
    ctx.lineWidth = 2 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(Math.random() * size, 0);
    ctx.bezierCurveTo(size * 0.3, Math.random() * size, size * 0.7, Math.random() * size, Math.random() * size, size);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(120, 110, 98, 0.35)';
  ctx.lineWidth = 3;
  const tile = size / 4;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tile, 0);
    ctx.lineTo(i * tile, size);
    ctx.moveTo(0, i * tile);
    ctx.lineTo(size, i * tile);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeCoverDiffuse(size = 256) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c9a24a';
  ctx.fillRect(0, 0, size, size);
  const palette = ['#e23b4a', '#f2c14e', '#3aa0d8', '#7d4ea3', '#f47bb2', '#f7f3ea', '#2f9e6b'];
  for (let i = 0; i < 700; i++) {
    ctx.save();
    ctx.translate(Math.random() * size, Math.random() * size);
    ctx.rotate(Math.random() * Math.PI);
    ctx.fillStyle = palette[i % palette.length];
    ctx.globalAlpha = 0.75 + Math.random() * 0.25;
    ctx.fillRect(-6, -2, 10 + Math.random() * 14, 3 + Math.random() * 4);
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(18, 18);
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
    const nx = (Math.random() - 0.5) * 40;
    const ny = (Math.random() - 0.5) * 40;
    img.data[i] = 128 + nx;
    img.data[i + 1] = 128 + ny;
    img.data[i + 2] = 250;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(18, 18);
  return tex;
}

export function makeCoverRoughness(size = 128) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 140 + Math.random() * 80;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  return tex;
}

export function makeWoodDiffuse(size = 256, base = '#5b3a24', grain = '#3c2515') {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = grain;
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.15 + Math.random() * 0.2;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    const y = Math.random() * size;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + (Math.random() - 0.5) * 20, size * 0.7, y + (Math.random() - 0.5) * 20, size, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeSign(text, bg, fg, w = 512, h = 128) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = fg;
  ctx.font = `700 ${Math.floor(h * 0.46)}px Segoe UI, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
