// Whistle. The pack jumps. The jammer finds a seam.
(function () {
  const { lerp, clamp, inv, ease } = Kit;
  Scenes.register(4, { draw(S) {
    Kit.derbyBank(S.t);
    const burst = ease.out(clamp(inv(0.2, 4, S.lt)));
    const colors = ['#1d4e89', '#1e6b45', '#b86e00', '#3d348b'];
    const seam = clamp(inv(9.6, 14, S.lt));
    for (let i = 0; i < 4; i++) {
      const gap = (i >= 2 ? seam * 80 : 0);
      Kit.human(400 + i * 90 + burst * 180 + gap, 630, 200, {
        skates: true, shirt: colors[i], pants: '#111', hat: 'helmet', hatColor: colors[i],
        facing: 1, walk: S.t * 14, hair: false, arms: [0.8, 1.0],
      });
    }
    const jx = lerp(250, 620, ease.inOut(clamp(inv(8, 16, S.lt))));
    Kit.human(jx, 630, 250, {
      skates: true, hat: 'helmet', star: true, hatColor: '#f4f4f4',
      shirt: '#c0392b', pants: '#111', facing: 1, walk: S.t * 16, hair: false,
    });
    const pivot = S.li >= 3;
    Kit.human(1100, 630, 230, {
      stripes: true, shirt: '#f4f4f4', pants: '#222', hat: 'cap', hatColor: '#111',
      skates: false, facing: pivot ? 1 : -1, hair: '#3a3028', arms: [0.2, 0.5],
    });
    Kit.circle(1040, 430, 8, '#ddd', { weight: 2 });
    if (S.li === 0) Kit.sfx('TWEET', 1040, 300, S.lt - 0.3, { size: 90 });
    if (S.pulse > 0.6) Kit.sfx('STOMP', 640, 160, 0.05, { size: 60, dur: 0.35 });
  } });
})();
