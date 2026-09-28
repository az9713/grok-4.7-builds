// The hit. The helmet leaves her head. She stays on her skates.
(function () {
  const { lerp, clamp, inv, ease } = Kit;
  Scenes.register(5, { draw(S) {
    Kit.derbyBank(S.t);
    const hit = clamp(inv(0.4, 2.2, S.lt));
    Kit.human(520 + hit * 40, 630, 210, {
      skates: true, shirt: '#1d4e89', pants: '#111', hat: 'helmet', hatColor: '#1d4e89',
      facing: 1, walk: S.t * 8, hair: false, rot: -0.1 * hit,
    });
    const off = S.lt > 1.2;
    Kit.human(640, 630, 250, {
      skates: true, hat: off ? null : 'helmet', star: !off, hatColor: '#f4f4f4',
      shirt: '#c0392b', pants: '#111', facing: 1, walk: S.t * 14,
      hair: off ? '#1a120c' : false,
    });
    if (off) {
      const u = ease.out(clamp(inv(1.2, 6, S.lt)));
      Kit.helmet(640 + u * 180, lerp(420, 220, u), 90, u * 4, { star: true });
      Kit.sfx('POP', 760, 300, S.lt - 1.4, { size: 120 });
    }
    Kit.human(1080, 630, 220, {
      stripes: true, shirt: '#f4f4f4', pants: '#222', hat: 'cap', hatColor: '#111',
      skates: false, facing: -1, hair: '#3a3028',
    });
    Kit.circle(1020, 440, 8, '#ddd', { weight: 2 });
    if (S.li >= 3) Kit.label('ROAR', 200, 160, { size: 64, font: 'bold', color: '#ffd83d' });
  } });
})();
