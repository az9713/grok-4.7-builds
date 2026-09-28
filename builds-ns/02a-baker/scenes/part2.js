// Kneading. The dough squashes on the beat. The cat starts a flour cloud.
(function () {
  const { ease, inv, lerp, clamp } = Kit;
  Scenes.register(2, { draw(S) {
    Kit.kitchen(S.t, { ovenGlow: 0.55 });
    Kit.ellipse(430, 470, 90, 28, '#c9b8a0', { weight: 4 });
    const squash = 0.65 + 0.35 * S.pulse;
    Kit.ellipse(430, 455, 70 * (1.15 - squash * 0.2), 36 * squash, '#f3e2b8', { weight: 3 });
    const knead = Math.sin(S.t * 6) * 0.6;
    Kit.human(390, 640, 260, {
      hat: 'toque', apron: '#f4f1ea', shirt: '#f7f4ee', pants: '#322820',
      facing: 1, arms: [0.4 + knead, 2.4], walk: S.li < 2 ? S.t * 2 : 0,
    });
    const catX = lerp(700, 860, clamp(inv(9.6, 13, S.lt)));
    Kit.cat(catX, 500, 64, { t: S.t, pose: S.li >= 2 ? 'leap' : 'sit', facing: 1 });
    if (S.li >= 2) {
      const u = clamp(inv(9.6, 16, S.lt));
      for (let i = 0; i < 5; i++) Kit.cloud(lerp(780, 200 + i * 40, u), 360 + (i % 2) * 30, 120 + i * 10, '#f7f4ee');
      Kit.sfx('PUFF', 700, 300, S.lt - 11.2, { size: 90, color: '#fff' });
    }
    Kit.label('FLOUR', 250, 430, { size: 18, rot: -0.2 });
  } });
})();
