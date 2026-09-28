import * as THREE from 'three';

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

export function makeGroundDiffuse(size = 512) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2a3138';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 6 + Math.random() * 28;
    ctx.fillStyle = `rgba(${20 + Math.random() * 30}, ${28 + Math.random() * 20}, ${36 + Math.random() * 24}, 0.35)`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.45, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(180, 200, 210, 0.08)';
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * size, Math.random() * size);
    ctx.lineTo(Math.random() * size, Math.random() * size);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeCoverDiffuse(size = 512) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(170, 160, 145, 0.55)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const arms = 3 + Math.floor(Math.random() * 3);
    for (let a = 0; a < arms; a++) {
      const ang = Math.random() * Math.PI * 2;
      const len = 10 + Math.random() * 40;
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.4})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeCoverNormal(size = 256) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgb(128,128,255)';
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const crack = Math.sin(x * 0.35) * Math.cos(y * 0.22);
      const i = (y * size + x) * 4;
      img.data[i] = 128 + crack * 40 + (Math.random() - 0.5) * 18;
      img.data[i + 1] = 128 + (Math.random() - 0.5) * 18;
      img.data[i + 2] = 245;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  return tex;
}

export function makeCoverRoughness(size = 128) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 200 + Math.random() * 50;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

export function makeMetalPanel(size = 256) {
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#d5dbe2';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#8d98a6';
  ctx.lineWidth = 3;
  for (let y = 0; y < size; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#6e7884';
  for (let y = 16; y < size; y += 32) {
    for (let x = 20; x < size; x += 48) {
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
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
  ctx.font = `700 ${Math.floor(h * 0.5)}px Segoe UI, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
