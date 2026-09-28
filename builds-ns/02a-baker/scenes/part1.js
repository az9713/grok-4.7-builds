// Night kitchen opens. Intro is the empty room; the baker comes in with the first line.
(function () {
  const { ease, inv, lerp, clamp } = Kit;
  Scenes.register(1, { draw(S) {
    const door = S.lt < 3.2 ? ease.out(clamp(inv(-1.2, 1.6, S.lt))) : ease.in(clamp(inv(3.2, 4.4, S.lt)));
    const glow = 0.35 + (S.li >= 2 ? 0.45 : 0.15) + 0.15 * Math.sin(S.t * 4);
    Kit.kitchen(S.t, { ovenGlow: glow, door: S.lt < 4.6 ? door : 0 });
    const stretching = S.li === 1;
    const catY = stretching ? lerp(200, 250, clamp(inv(4.8, 6.0, S.lt))) : 205;
    Kit.cat(520, catY, 78, { t: S.t, pose: stretching ? 'stretch' : 'sit', facing: 1 });
    if (S.lt > 5.4) {
      const u = clamp(inv(5.4, 6.6, S.lt));
      const sy = lerp(250, 630, ease.in(u));
      Kit.ellipse(560, sy, 16, 7, '#d5dbe0', { rot: u * 4 });
      Kit.sfx('CLANG', 640, 280, S.lt - 6.5, { size: 100 });
    }
    if (S.lt > -0.4) {
      const x = lerp(-30, 300, ease.out(clamp(inv(-0.2, 4.0, S.lt))));
      const walk = S.lt < 4.0 ? S.t * 7 : 0;
      Kit.human(x, 640, 260, {
        hat: 'toque', apron: '#f4f1ea', shirt: '#f7f4ee', pants: '#322820',
        walk, facing: 1, hair: '#6b4f3a',
        mood: S.li >= 3 ? 'surprised' : 'calm',
        arms: S.li === 2 ? [1.1, 2.2] : [0.25, 0.35],
      });
    }
    if (S.li >= 3) {
      for (let i = 0; i < 6; i++) Kit.streak(200 + i * 12, 400, 230 + i * 8, 470, 4, '#ffb25a', 140);
    }
  } });
})();
