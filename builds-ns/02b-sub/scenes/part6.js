// The dirge. He takes the cap off. The boat is a speck. The gauge still drips.
(function () {
  const { clamp, inv } = Kit;
  Scenes.register(6, { draw(S) {
    Kit.controlRoom(S.t);
    Kit.gauge(220, 220, 90, 0.88, { drip: S.t * 0.5 });
    const bare = S.li >= 3;
    const bob = Math.sin(S.t * 0.8) * 1.5;
    Kit.human(620, 600 + bob, 300, {
      hat: bare ? null : 'cap', hatColor: '#1c2430',
      shirt: '#1e2a38', pants: '#14181c', beard: '#6b5344',
      hair: bare ? '#3a3028' : false,
      facing: 1, arms: bare ? [0.8, 1.1] : [0.15, 0.15], mood: 'calm',
    });
    if (bare) {
      Kit.ellipse(700, 470, 28, 12, '#1c2430', { weight: 2 });
    }
    const speck = 1040;
    const sy = 180 - clamp(inv(0, 19, S.lt)) * 40;
    Kit.paperBoat(speck, sy, 18, { rot: 0.2 });
    Kit.label('hold her', 620, 160, { size: 26, font: 'serif', color: '#c8c0b4' });
  } });
})();
