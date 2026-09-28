// A cyclist passes the window. The lamp sweeps the room. The cat presses the glass.
(function () {
  const { ease, inv, lerp, clamp } = Kit;
  Scenes.register(4, { draw(S) {
    Kit.kitchen(S.t, { ovenGlow: 0.5 });
    const pass = lerp(1180, 860, ease.inOut(clamp(inv(0, 6.5, S.lt))));
    const pass2 = lerp(1200, 820, ease.inOut(clamp(inv(14.4, 19, S.lt))));
    const bx = S.li >= 3 ? pass2 : pass;
    if (S.lt < 8 || S.lt > 13.5) {
      Kit.bicycle(bx, 300, 150, { spin: S.t * 10, facing: -1, lamp: true });
      Kit.human(bx - 10, 300, 120, {
        hat: 'cap', hatColor: '#1d4e89', shirt: '#1d4e89', pants: '#1a1a1a',
        facing: -1, walk: S.t * 8, hair: '#2a211b',
      });
    }
    if (S.li === 0) Kit.sfx('DING', 1000, 160, S.lt - 0.4, { size: 90 });
    if (S.li === 1) Kit.flash(0.35 * clamp(inv(4.8, 6.2, S.lt)) * (1 - clamp(inv(7.5, 9, S.lt))));
    Kit.human(360, 640, 260, {
      hat: 'toque', apron: '#f4f1ea', shirt: '#f7f4ee', pants: '#322820',
      facing: 1, mood: 'surprised',
      arms: S.li >= 2 ? [0.3, 2.8] : [0.3, 0.4],
    });
    const catX = S.li >= 3 ? 1000 : 760;
    Kit.cat(catX, S.li >= 3 ? 340 : 500, 62, { t: S.t, pose: 'sit', facing: 1 });
    if (S.li >= 3) Kit.sfx('DING', 1040, 200, S.lt - 15, { size: 80 });
  } });
})();
