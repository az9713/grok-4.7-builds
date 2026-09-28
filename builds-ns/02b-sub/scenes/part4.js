// A seam weeps. He puts his palm on the iron and stays.
(function () {
  const { clamp, inv, lerp } = Kit;
  Scenes.register(4, { draw(S) {
    Kit.controlRoom(S.t);
    Kit.rect(180, 80, 16, 520, '#3a4048', { weight: 3 });
    const weep = clamp(S.lt / 14);
    Kit.streak(188, 140, 200, 140 + weep * 460, 8 + weep * 6, '#7eb6d0', 200);
    for (let i = 0; i < 4; i++) {
      const y = 200 + ((S.t * 50 + i * 90) % (weep * 400 + 20));
      Kit.circle(196, y, 3, '#9fd0e6', { stroke: false });
    }
    Kit.human(360, 600, 300, {
      hat: 'cap', hatColor: '#1c2430', shirt: '#1e2a38', pants: '#14181c',
      beard: '#6b5344', facing: -1, hair: false,
      arms: [2.2, 0.3],
      mood: 'calm',
    });
    if (S.lt > 9 && S.lt < 10) Kit.flash(0.25);
    if (S.lt > 14 && S.lt < 14.6) Kit.flash(0.18);
    Kit.label('the seam', 188, 70, { size: 18, color: '#9fd0e6' });
    const hold = clamp(inv(9.6, 12, S.lt));
    if (hold > 0.8) Kit.label('he stays', 700, 180, { size: 22, font: 'serif', color: '#c8c0b4' });
  } });
})();
