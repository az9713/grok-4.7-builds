// Golden loaves, steam, and the cyclist at the door with an empty basket.
(function () {
  const { ease, inv, lerp, clamp } = Kit;
  Scenes.register(6, { draw(S) {
    const door = clamp(inv(0, 2.2, S.lt));
    Kit.kitchen(S.t, { ovenGlow: 0.85, door, dawn: 0.15 });
    for (let i = 0; i < 4; i++) Kit.cloud(200 + i * 50, lerp(420, 220, clamp(S.lt / 8)) + (i % 2) * 20, 140, '#f4f7f8');
    const out = ease.out(clamp(inv(4.8, 9, S.lt)));
    for (let i = 0; i < 3; i++) Kit.loaf(lerp(280, 480 + i * 90, out), 500, 70, 0.85, { color: '#f0c36a' });
    Kit.human(400, 640, 260, {
      hat: 'toque', apron: '#f4f1ea', shirt: '#f7f4ee', pants: '#322820',
      facing: S.li >= 3 ? 1 : -1,
      arms: S.li === 2 ? [1.2, 2.2] : [0.3, 0.5],
    });
    Kit.cat(620, 500, 58, { t: S.t, pose: 'sit', facing: 1 });
    if (S.li >= 3) {
      const x = lerp(1400, 1080, ease.out(clamp(inv(14.4, 17.5, S.lt))));
      Kit.bicycle(x, 640, 200, { spin: S.t * 6, facing: -1, lamp: true });
      Kit.human(x - 20, 640, 230, { hat: 'cap', hatColor: '#1d4e89', shirt: '#1d4e89', pants: '#1a1a1a', facing: -1, hair: '#2a211b' });
    }
    Kit.sfx('STEAM', 300, 240, S.lt - 5.5, { size: 80, dur: 1.6 });
  } });
})();
