// The helmet arcs through the lights. She skates under it, bareheaded.
(function () {
  const { lerp, clamp } = Kit;
  Scenes.register(6, { draw(S) {
    Kit.derbyBank(S.t);
    const u = clamp(S.lt / 19.2);
    const x = lerp(280, 1120, u);
    const y = 420 - Math.sin(u * Math.PI) * 260;
    Kit.helmet(x, y, 110, u * Math.PI * 2, { star: true, color: '#f7f7f7' });
    if (Math.sin(S.t * 8) > 0.4) Kit.streak(x - 10, y, x + 30, y - 10, 6, '#ffd83d', 180);
    const jx = lerp(200, 1000, u);
    Kit.human(jx, 630, 250, {
      skates: true, hat: null, shirt: '#c0392b', pants: '#111',
      facing: 1, walk: S.t * 16, hair: '#1a120c', arms: [0.7, 0.9],
    });
    for (let i = 0; i < 4; i++) Kit.streak(jx - 30, 560 + i * 16, jx - 180, 540 + i * 10, 3, '#fff', 140);
    Kit.label('still up', x, y - 70, { size: 18, font: 'bold', color: '#ffd83d' });
  } });
})();
