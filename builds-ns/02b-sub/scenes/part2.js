// The captain, buttoned coat, a pin in the chart. Almost still.
(function () {
  const { clamp, inv } = Kit;
  Scenes.register(2, { draw(S) {
    Kit.controlRoom(S.t);
    const bob = Math.sin(S.t * 1.2) * 2;
    Kit.rect(780, 250, 280, 200, '#d7c7a2', { weight: 3 });
    for (let i = 0; i < 5; i++) Kit.line(800, 280 + i * 28, 1040, 290 + i * 22, { weight: 1.5, color: '#5a4030' });
    const pin = clamp(inv(9.6, 14, S.lt));
    if (pin > 0) Kit.circle(980, 360, 6, '#8e1e1e', { stroke: false });
    Kit.human(520, 600 + bob, 320, {
      hat: 'cap', hatColor: '#1c2430', shirt: '#243244', pants: '#14181c',
      beard: '#6b5344', facing: 1, hair: false,
      arms: S.li >= 2 ? [0.2, 1.5] : [0.15, 0.2],
      mood: 'calm',
    });
    Kit.circle(180, 120, 8, '#6a2018', { stroke: false, alpha: 180 });
    Kit.circle(260, 140, 6, '#6a2018', { stroke: false, alpha: 120 });
    Kit.label('still buttoned', 520, 200, { size: 20, font: 'serif', color: '#c8c0b4' });
  } });
})();
