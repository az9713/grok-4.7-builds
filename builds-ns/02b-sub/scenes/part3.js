// Close on the dripping gauge. The needle climbs and does not come back.
(function () {
  const { clamp } = Kit;
  Scenes.register(3, { draw(S) {
    Kit.gradient(0, 0, 1280, 720, '#10141a', '#2a3038', 6);
    Kit.rect(0, 620, 1280, 100, '#1a1e24', { stroke: false });
    const needle = 0.22 + clamp(S.lt / 19.2) * 0.72;
    Kit.gauge(560, 340, 230, needle, { drip: S.t * 0.7, label: 'DEPTH' });
    Kit.human(1040, 640, 240, {
      hat: 'cap', hatColor: '#1c2430', shirt: '#1e2a38', pants: '#14181c',
      beard: '#6b5344', facing: -1, hair: false,
      arms: [0.2, 0.4 + clamp(S.lt / 19) * 0.8],
      mood: needle > 0.75 ? 'surprised' : 'calm',
    });
    if (S.li >= 0) Kit.sfx('DRIP', 760, 200, (S.lt % 4.8) - 0.2, { size: 64, dur: 0.8, color: '#9fd0e6' });
  } });
})();
