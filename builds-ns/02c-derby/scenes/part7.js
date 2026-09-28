// She takes the point. The helmet lands in the referee's hands. Whistle, stomps.
(function () {
  const { lerp, clamp, inv, ease } = Kit;
  Scenes.register(7, { draw(S) {
    Kit.derbyBank(S.t);
    Kit.rect(980, 590, 14, 50, '#ffd83d', { stroke: false });
    const jx = lerp(700, 1100, ease.out(clamp(inv(0, 6, S.lt))));
    Kit.human(jx, 630, 250, {
      skates: true, hat: null, shirt: '#c0392b', pants: '#111',
      facing: 1, walk: S.lt < 8 ? S.t * 14 : 0, hair: '#1a120c',
      mood: S.li >= 2 ? 'surprised' : 'calm',
    });
    Kit.human(360, 630, 230, {
      stripes: true, shirt: '#f4f4f4', pants: '#222', hat: 'cap', hatColor: '#111',
      skates: false, facing: 1, hair: '#3a3028',
      arms: S.li >= 3 ? [Math.PI, 0.4] : [0.4, 0.6],
    });
    const land = ease.out(clamp(inv(9.6, 13, S.lt)));
    const hy = lerp(180, 470, land);
    const hx = lerp(700, 420, land);
    Kit.helmet(hx, hy, 80, (1 - land) * 3, { star: true });
    if (S.li === 1) {
      Kit.sfx('TWEET', 300, 280, S.lt - 4.9, { size: 80 });
      Kit.sfx('TWEET', 460, 220, S.lt - 5.6, { size: 70 });
    }
    if (S.li >= 3) {
      Kit.sfx('STOMP', 640, 140, S.lt - 14.6, { size: 90 });
      Kit.sfx('STOMP', 820, 180, S.lt - 15.4, { size: 80 });
    }
  } });
})();
