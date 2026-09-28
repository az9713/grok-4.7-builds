// Dawn. The cat rides in the basket. One last loaf rises on the counter.
(function () {
  const { ease, inv, lerp, clamp } = Kit;
  Scenes.register(7, { draw(S) {
    const dawn = ease.inOut(clamp(S.lt / 16));
    Kit.kitchen(S.t, { ovenGlow: lerp(0.5, 0.15, dawn), dawn, door: 1 });
    const ride = S.li >= 1;
    const bx = ride ? lerp(900, 1280, ease.in(clamp(inv(6, 18, S.lt)))) : 980;
    Kit.bicycle(bx, 640, 230, { spin: ride ? S.t * 12 : 0, facing: 1, lamp: dawn < 0.6 });
    Kit.human(bx - 30, 640, 230, {
      hat: 'cap', hatColor: '#1d4e89', shirt: '#1d4e89', pants: '#1a1a1a',
      facing: 1, walk: ride ? S.t * 10 : 0, hair: '#2a211b',
    });
    if (ride) Kit.cat(bx + 70, 500, 48, { t: S.t, pose: 'sit', facing: 1 });
    else Kit.cat(760, 500, 60, { t: S.t, pose: 'sit', facing: 1 });
    const wave = S.li >= 2;
    Kit.human(420, 640, 260, {
      hat: 'toque', apron: '#f4f1ea', shirt: '#f7f4ee', pants: '#322820',
      facing: 1, arms: wave ? [0.2, 2.7] : [0.3, 0.4],
    });
    const rise = 0.4 + clamp(inv(14.4, 19, S.lt)) * 0.9;
    Kit.loaf(700, 500, 80, rise, { color: '#f2d48a' });
    if (S.li >= 3) Kit.label('first light', 640, 160, { size: 28, font: 'serif', color: '#6a3a20' });
  } });
})();
