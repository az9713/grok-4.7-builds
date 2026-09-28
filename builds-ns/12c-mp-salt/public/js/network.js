// WebSocket client. Incoming messages mutate `world` in this handler, not in
// requestAnimationFrame. Position sends ride a setInterval so an unfocused
// window still publishes and still applies salt-crust diffs.

export function createNetwork({ world, onWelcome, onChat, onDbg }) {
  const params = new URLSearchParams(location.search);
  const dbg = params.get('dbg') === '1';
  const wsUrl = `ws://${location.host}/ws`;

  let ws = null;
  let connected = false;
  let closedByUs = false;
  let opened = false;
  let soloStarted = false;
  let backoffMs = 400;

  function coverSnapshot() {
    return btoa('\u00ff'.repeat(128 * 128));
  }

  function startSolo() {
    if (soloStarted || opened) return;
    soloStarted = true;
    closedByUs = true;
    const name = params.get('name') || world.pendingName || world.me?.name || 'Guest';
    const id = 'solo';
    world.selfId = id;
    world.me = {
      id,
      name: String(name).slice(0, 20),
      x: 0,
      z: 18,
      ry: Math.PI,
      speed: 0,
      color: 0xd94b3d
    };
    world.worldMeta = { size: 120, gridRes: 128, cellSize: 120 / 128 };
    world.remotes.clear();
    world.chat.length = 0;
    world.applySnapshot(coverSnapshot());
    setTimeout(() => {
      if (onWelcome) onWelcome({ id, me: world.me, players: [], chat: [] });
    }, 0);
  }

  function send(obj) {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  }

  function connect() {
    try {
      ws = new WebSocket(wsUrl);
    } catch (err) {
      startSolo();
      return;
    }
    ws.binaryType = 'arraybuffer';

    ws.addEventListener('open', () => {
      opened = true;
      connected = true;
      backoffMs = 400;
      const name = params.get('name') || world.pendingName || world.me?.name || `Briner${Math.floor(Math.random() * 1000)}`;
      send({ t: 'join', name });
    });

    ws.addEventListener('message', (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }

      switch (msg.t) {
        case 'welcome': {
          world.selfId = msg.id;
          world.me = msg.me;
          world.worldMeta = msg.world;
          world.applySnapshot(msg.snowSnapshot);
          world.remotes.clear();
          for (const p of msg.players) {
            if (p.id !== world.selfId) world.upsertRemote(p);
          }
          world.chat.length = 0;
          for (const c of msg.chat) world.pushChat(c);
          if (onWelcome) onWelcome(msg);
          break;
        }
        case 'join': {
          if (msg.player.id !== world.selfId) world.upsertRemote(msg.player);
          break;
        }
        case 'leave': {
          world.removeRemote(msg.id);
          break;
        }
        case 'players': {
          for (const p of msg.list) {
            if (p.id !== world.selfId) world.upsertRemote(p, msg.ts);
          }
          world.lastPlayersTs = msg.ts;
          break;
        }
        case 'snow': {
          world.applyDiff(msg.d);
          world.snowVersion = (world.snowVersion || 0) + 1;
          world.lastSnowServerTs = msg.ts;
          world.lastSnowClientTs = performance.timeOrigin + performance.now();
          break;
        }
        case 'chat': {
          world.pushChat(msg.msg);
          if (onChat) onChat(msg.msg);
          break;
        }
        case 'pong': {
          if (onDbg) onDbg({ rtt: Date.now() - msg.ts });
          break;
        }
        default: break;
      }
    });

    ws.addEventListener('close', () => {
      connected = false;
      if (!opened) {
        startSolo();
        return;
      }
      if (closedByUs) return;
      setTimeout(connect, backoffMs);
      backoffMs = Math.min(backoffMs * 1.6, 5000);
    });

    ws.addEventListener('error', () => { /* close handler will follow */ });
  }
  connect();

  const sendTimer = setInterval(() => {
    if (!connected || !world.me) return;
    send({
      t: 'state',
      x: world.me.x,
      z: world.me.z,
      ry: world.me.ry,
      speed: world.me.speed
    });
  }, 66);

  function sendChat(text) {
    send({ t: 'chat', text });
  }

  function debugPing() {
    send({ t: 'ping', ts: Date.now() });
  }

  function stop() {
    closedByUs = true;
    clearInterval(sendTimer);
    if (ws) ws.close();
  }

  if (dbg) {
    window.__DBG = window.__DBG || {};
    window.__DBG.world = world;
    window.__DBG.ping = debugPing;
    window.__DBG.isConnected = () => connected;
  }

  return { send, sendChat, stop, dbg };
}
