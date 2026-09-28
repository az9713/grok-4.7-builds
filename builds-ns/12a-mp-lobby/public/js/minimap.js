// Bottom-right minimap. Pale marble is cleared tile; gold-pink is confetti.
// The reception desk sits at the north end of the lobby (z = -34).
export function createMinimap(canvasEl, worldMeta) {
  const ctx = canvasEl.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssSize = 180;
  canvasEl.width = cssSize * dpr;
  canvasEl.height = cssSize * dpr;
  ctx.scale(dpr, dpr);

  const half = worldMeta.size / 2;
  function toMap(x, z) {
    return {
      mx: ((x + half) / worldMeta.size) * cssSize,
      my: ((z + half) / worldMeta.size) * cssSize
    };
  }

  let lastTintAt = 0;
  const tintCanvas = document.createElement('canvas');
  tintCanvas.width = tintCanvas.height = 64;
  const tintCtx = tintCanvas.getContext('2d');
  const tintImg = tintCtx.createImageData(64, 64);

  function refreshTint(world) {
    if (!world.snowBytes) return;
    const res = worldMeta.gridRes;
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const gx = Math.floor((x / 64) * res);
        const gy = Math.floor((y / 64) * res);
        const v = world.snowBytes[gy * res + gx];
        const o = (y * 64 + x) * 4;
        const t = v / 255;
        tintImg.data[o] = 214 + t * 20;
        tintImg.data[o + 1] = 206 - t * 90;
        tintImg.data[o + 2] = 196 - t * 70;
        tintImg.data[o + 3] = 255;
      }
    }
    tintCtx.putImageData(tintImg, 0, 0);
    lastTintAt = performance.now();
  }

  function draw(world) {
    if (performance.now() - lastTintAt > 500) refreshTint(world);
    ctx.clearRect(0, 0, cssSize, cssSize);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tintCanvas, 0, 0, cssSize, cssSize);

    const desk = toMap(0, -34);
    ctx.fillStyle = 'rgba(90, 62, 40, 0.9)';
    ctx.fillRect(desk.mx - 24, desk.my - 5, 48, 10);

    for (const p of world.remotes.values()) {
      const { mx, my } = toMap(p.x, p.z);
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fillStyle = `#${p.color.toString(16).padStart(6, '0')}`;
      ctx.fill();
    }

    if (world.me) {
      const { mx, my } = toMap(world.me.x, world.me.z);
      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#e0a045';
      ctx.fill();
    }
  }

  return { draw };
}
