// Loaves go into the oven. A tap keeps time. The cat sleeps in the steam.
(function () {
  const { ease, inv, lerp, clamp } = Kit;
  Scenes.register(5, { draw(S) {
    const shut = S.li >= 1 ? 1 : 0;
    Kit.kitchen(S.t, { ovenGlow: shut ? 0.95 : 0.7 });
    const peel = lerp(520, 240, ease.inOut(clamp(inv(0.2, 4.2, S.lt))));
    Kit.rect(peel, 455, 280, 14, '#c9a06a', { weight: 2, r: 3 });
    if (S.li === 0) {
      for (let i = 0; i < 3; i++) Kit.loaf(peel + 40 + i * 70, 455, 54, 0.7);
    }
    Kit.human(peel + 300, 640, 260, {
      hat: 'toque', apron: '#f4f1ea', shirt: '#f7f4ee', pants: '#322820',
      facing: -1, arms: [0.4, 1.6], walk: S.li === 0 ? S.t * 4 : 0,
    });
    if (S.li >= 1) Kit.sfx('HUM', 280, 300, S.lt - 5.2, { size: 70, dur: 2.2 });
    // tap
    Kit.rect(700, 430, 18, 70, '#9aa3a8', { weight: 2 });
    const drop = (S.t * 2) % 1;
    Kit.circle(709, 500 + drop * 80, 4, '#8ec8e8', { weight: 1.5 });
    if (S.li >= 3) {
      Kit.cat(760, 500, 70, { t: S.t, pose: 'sit', facing: -1 });
      for (let i = 0; i < 4; i++) Kit.streak(740, 470 - i * 12, 770, 430 - i * 16, 6, '#f7f7f7', 100);
      Kit.label('asleep', 820, 430, { size: 18, font: 'serif' });
    } else {
      Kit.cat(900, 640, 60, { t: S.t, pose: 'sit', facing: -1 });
    }
  } });
})();
