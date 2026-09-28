// The dive. Exterior first, then the captain in the red cabin. No animals.
(function () {
  const { ease, inv, lerp, clamp } = Kit;
  Scenes.register(1, { draw(S) {
    if (S.lt < 0.4) {
      Kit.gradient(0, 0, 1280, 720, '#070b10', '#163044', 8);
      const y = lerp(180, 420, clamp(inv(-9, 0.2, S.lt)));
      Kit.submarine(640, y, 520, { rot: 0.08, glow: 0.4 });
      for (let i = 0; i < 8; i++) {
        const by = ((S.t * 40 + i * 80) % 700);
        Kit.circle(200 + i * 120, 700 - by, 4 + (i % 3), '#9fd0e6', { stroke: false, alpha: 140 });
      }
      Kit.label('fathoms', 1100, 80, { size: 22, color: '#9fd0e6', font: 'bold' });
      return;
    }
    Kit.controlRoom(S.t);
    const x = lerp(200, 560, ease.out(clamp(inv(0.4, 6, S.lt))));
    Kit.circle(620, 430, 70, '#2a3038', { weight: 4 });
    for (let i = 0; i < 4; i++) {
      const a = S.t * 0.4 + i * Math.PI / 2;
      Kit.line(620, 430, 620 + Math.cos(a) * 90, 430 + Math.sin(a) * 90, { weight: 4, color: '#8a8070' });
    }
    Kit.human(x, 600, 280, {
      hat: 'cap', hatColor: '#1c2430', shirt: '#1e2a38', pants: '#14181c',
      beard: '#6b5344', facing: 1, walk: S.lt < 6 ? S.t * 5 : 0,
      arms: S.li >= 2 ? [1.2, 1.4] : [0.3, 0.3], mood: 'calm', hair: false,
    });
    const fath = Math.floor(80 + clamp(S.lt / 19) * 140);
    Kit.label(String(fath), 200, 160, { size: 42, font: 'bold', color: '#e8e0d4' });
  } });
})();
