// The jammer arrives, star on the helmet, and looks back.
(function () {
  const { ease, lerp, clamp, inv } = Kit;
  Scenes.register(2, { draw(S) {
    Kit.derbyBank(S.t);
    const x = lerp(-80, 420, ease.out(clamp(inv(0, 6, S.lt))));
    const look = S.li >= 3;
    Kit.human(x, 630, 260, {
      skates: true, hat: 'helmet', hatColor: '#f4f4f4', star: true,
      shirt: '#c0392b', pants: '#1a1a1a', facing: look ? -1 : 1,
      walk: S.t * 12, hair: false,
      arms: S.li === 1 ? [1.4, 1.6] : [0.6, 0.8],
    });
    if (S.li >= 2) {
      for (let i = 0; i < 5; i++) Kit.streak(x - 40, 560 + i * 12, x - 160, 540 + i * 14, 4, '#fff1c2', 160);
      Kit.sfx('CLACK', x + 80, 480, S.lt - 10, { size: 80 });
    }
    Kit.rect(300, 600, 10, 36, '#ffd83d', { stroke: false });
    if (look) Kit.flash(0.12);
  } });
})();
