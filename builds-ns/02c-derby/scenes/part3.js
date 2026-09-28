// Four blockers make a wall. The referee's arm goes up.
(function () {
  const { clamp } = Kit;
  Scenes.register(3, { draw(S) {
    Kit.derbyBank(S.t);
    const colors = ['#1d4e89', '#1e6b45', '#b86e00', '#3d348b'];
    for (let i = 0; i < 4; i++) {
      const bump = Math.sin(S.t * 5 + i) * 10;
      Kit.human(520 + i * 70 + bump, 630, 210, {
        skates: true, shirt: colors[i], pants: '#1a1a1a', hat: 'helmet', hatColor: colors[i],
        star: false, facing: 1, walk: S.t * 8, hair: false, arms: [0.5, 0.7],
      });
    }
    Kit.human(280, 630, 250, {
      skates: true, hat: 'helmet', star: true, hatColor: '#f4f4f4',
      shirt: '#c0392b', pants: '#1a1a1a', facing: 1, walk: S.t * 6, hair: false,
    });
    Kit.human(1080, 630, 230, {
      stripes: true, shirt: '#f4f4f4', pants: '#222', hat: 'cap', hatColor: '#111',
      skates: false, facing: -1, hair: '#3a3028',
      arms: S.li >= 3 ? [0.2, Math.PI] : [0.2, 0.4],
    });
    if (S.li >= 3) Kit.label('ready', 1080, 250, { size: 22, font: 'bold' });
  } });
})();
