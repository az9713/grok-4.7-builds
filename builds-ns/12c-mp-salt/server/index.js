'use strict';

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const { WebSocketServer } = require('ws');
const { GameState, WORLD_SIZE, GRID_RES, CELL_SIZE } = require('./gameState');

const PORT = process.env.PORT || 3533;
const TICK_MS = 80;

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/vendor/three/build', express.static(path.join(__dirname, '..', 'node_modules', 'three', 'build')));
app.use('/vendor/three/examples/jsm', express.static(path.join(__dirname, '..', 'node_modules', 'three', 'examples', 'jsm')));

const server = app.listen(PORT, () => {
  console.log(`[brine-flat] listening on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server, path: '/ws' });
const game = new GameState();

function send(ws, obj) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
}

function broadcast(obj, exceptWs) {
  const payload = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN && client !== exceptWs) {
      client.send(payload);
    }
  }
}

function broadcastAll(obj) {
  const payload = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) client.send(payload);
  }
}

wss.on('connection', (ws) => {
  const id = crypto.randomUUID();
  ws.playerId = id;
  ws.isAlive = true;

  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.t) {
      case 'join': {
        const name = (typeof msg.name === 'string' && msg.name.trim()) ? msg.name.trim() : `Briner${Math.floor(Math.random() * 1000)}`;
        const player = game.addPlayer(id, name);
        send(ws, {
          t: 'welcome',
          id,
          me: player,
          world: { size: WORLD_SIZE, gridRes: GRID_RES, cellSize: CELL_SIZE },
          snowSnapshot: game.snapshotBase64(),
          players: game.playersList(),
          chat: game.chatLog
        });
        broadcast({ t: 'join', player }, ws);
        break;
      }
      case 'state': {
        if (!game.players.has(id)) return;
        const x = Number(msg.x) || 0;
        const z = Number(msg.z) || 0;
        const speed = Number(msg.speed) || 0;
        game.updatePlayerState(id, x, z, Number(msg.ry) || 0, speed);
        if (Math.abs(speed) > 0.15) game.clearCircle(x, z);
        break;
      }
      case 'clear': {
        if (!game.players.has(id)) return;
        game.clearCircle(Number(msg.x) || 0, Number(msg.z) || 0);
        break;
      }
      case 'chat': {
        const p = game.players.get(id);
        if (!p || typeof msg.text !== 'string' || !msg.text.trim()) return;
        const chatMsg = game.addChat(id, p.name, msg.text.trim());
        broadcastAll({ t: 'chat', msg: chatMsg });
        break;
      }
      case 'ping': {
        send(ws, { t: 'pong', ts: msg.ts, serverTs: Date.now() });
        break;
      }
      default:
        break;
    }
  });

  ws.on('close', () => {
    game.removePlayer(id);
    broadcastAll({ t: 'leave', id });
  });
});

const heartbeat = setInterval(() => {
  for (const client of wss.clients) {
    if (client.isAlive === false) {
      client.terminate();
      continue;
    }
    client.isAlive = false;
    client.ping();
  }
}, 15000);

setInterval(() => {
  game.refillTick();
  const diff = game.popDirtyDiff();
  const now = Date.now();
  if (diff) {
    broadcastAll({ t: 'snow', d: diff, ts: now });
  }
  if (game.players.size > 0) {
    broadcastAll({ t: 'players', list: game.playersList(), ts: now });
  }
}, TICK_MS);

process.on('SIGTERM', () => { clearInterval(heartbeat); server.close(); process.exit(0); });
