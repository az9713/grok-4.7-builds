// The boat leaves through a pale slit. The submarine stays on the bottom.
(function () {
  const { lerp, clamp, inv } = Kit;
  Scenes.register(7, { draw(S) {
    Kit.gradient(0, 0, 1280, 720, '#05080c', '#1a3044', 8);
    Kit.rect(0, 40, 1280, 10, '#c5d5e4', { stroke: false, alpha: Math.round(80 + 40 * Math.sin(S.t)) });
    Kit.poly([[0, 560], [200, 520], [480, 580], [800, 500], [1280, 560], [1280, 720], [0, 720]], '#12161c', { weight: 3 });
    Kit.submarine(640, 500, 640, { rot: -0.04, glow: 0.2 });
    // tiny captain in a porthole, hatless
    Kit.circle(700, 490, 16, '#ffb080', { stroke: false });
    const u = clamp(inv(0, 12, S.lt));
    const by = lerp(360, -30, u);
    if (by > -10) Kit.paperBoat(760, by, lerp(40, 16, u), { rot: 0.1 });
    const dripY = 80 + (S.t * 30 % 200);
    Kit.circle(400, dripY, 3, '#9fd0e6', { stroke: false });
    if (S.li >= 3) Kit.label('still down', 640, 160, { size: 28, font: 'serif', color: '#9aa8b4' });
  } });
})();
