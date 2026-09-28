// A paper boat climbs past the porthole. Nothing else is out there.
(function () {
  const { ease, lerp, clamp } = Kit;
  Scenes.register(5, { draw(S) {
    Kit.gradient(0, 0, 1280, 720, '#0c1016', '#1c2834', 6);
    Kit.circle(640, 360, 250, '#070d14', { weight: 14 });
    Kit.circle(640, 360, 220, '#102030', { stroke: false });
    const u = ease.inOut(clamp(S.lt / 18));
    const by = lerp(520, 180, u);
    const bx = 640 + Math.sin(S.t * 0.7) * 30;
    Kit.paperBoat(bx, by, 70, { rot: Math.sin(S.t) * 0.15 });
    // captain at the left, watching, not reaching
    Kit.human(180, 680, 260, {
      hat: 'cap', hatColor: '#1c2430', shirt: '#1e2a38', pants: '#14181c',
      beard: '#6b5344', facing: 1, hair: false, arms: [0.2, 0.25], mood: 'calm',
    });
    Kit.label('let it go', 180, 200, { size: 22, font: 'serif', color: '#c8c0b4' });
  } });
})();
