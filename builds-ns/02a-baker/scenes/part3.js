// The loaf climbs past the shelf. The cat rides it. They both look up.
(function () {
  const { ease, inv, lerp, clamp } = Kit;
  Scenes.register(3, { draw(S) {
    Kit.kitchen(S.t, { ovenGlow: 0.4 });
    const rise = lerp(0.15, 1.55, ease.inOut(clamp(S.lt / 18)));
    Kit.loaf(860, 500, 150, rise, { color: rise > 1 ? '#f0c36a' : '#e2b56a' });
    const top = 500 - 150 * (0.28 + 0.85 * Math.min(rise, 1.6)) * 0.9;
    if (S.li >= 2) {
      const hop = ease.outBack(clamp(inv(9.6, 11.2, S.lt)));
      Kit.cat(lerp(700, 860, hop), lerp(500, top, hop), 60, { t: S.t, pose: hop < 1 ? 'leap' : 'sit', facing: 1 });
    } else {
      Kit.cat(680, 500, 60, { t: S.t, pose: 'sit', facing: 1 });
    }
    const bx = lerp(420, 300, clamp(inv(9.6, 12, S.lt)));
    Kit.human(bx, 640, 260, {
      hat: 'toque', apron: '#f4f1ea', shirt: '#f7f4ee', pants: '#322820',
      facing: 1, mood: S.li >= 2 ? 'surprised' : 'calm',
      arms: S.li >= 3 ? [2.4, 2.6] : [0.3, 0.4],
    });
    if (rise > 1.35) Kit.sfx('BUMP', 900, 120, S.lt - 16.2, { size: 110 });
    Kit.label('still rising', 860, Math.max(80, top - 40), { size: 20, font: 'serif' });
  } });
})();
