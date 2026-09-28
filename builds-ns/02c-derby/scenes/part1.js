// Empty bank. The referee measures it. The stomps arrive.
(function () {
  const { lerp, clamp, inv } = Kit;
  Scenes.register(1, { draw(S) {
    Kit.derbyBank(S.t);
    const x = lerp(180, 900, clamp((S.lt + 4) / 16));
    Kit.human(x, 630, 240, {
      stripes: true, shirt: '#f4f4f4', pants: '#222', hat: 'cap', hatColor: '#111',
      facing: 1, walk: S.t * 4, hair: '#3a3028', skates: false,
      arms: [0.2, 0.9],
    });
    Kit.rect(280, 600, 8, 40, '#ffd83d', { stroke: false });
    Kit.line(180, 200, 230, 250, { weight: 2, color: '#111' });
    Kit.circle(236, 256, 10, '#e8e8e8', { weight: 2 });
    if (S.lt < 2) Kit.rect(0, 0, 1280, 180, '#000', { stroke: false, alpha: Math.round(80 * (1 - clamp(inv(0, 3, S.lt)))) });
    if (S.li >= 3) Kit.sfx('STOMP', 640, 180, S.pulse * 0.3, { size: 80, dur: 0.4 });
    Kit.label('the bank', 640, 120, { size: 28, font: 'bold', color: '#f6e7c8' });
  } });
})();
