import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(path.join(__dirname, "public")));
const server = createServer(app);
const wss = new WebSocketServer({ server });
const players = new Map();
wss.on("connection", ws => {
  ws.on("message", raw => {
    const msg = JSON.parse(raw.toString());
    if (msg.t === "hi") players.set(ws, { name: String(msg.name||"guest").slice(0,16), x: 200, y: 200 });
    if (msg.t === "mv" && players.has(ws)) { const p=players.get(ws); p.x=msg.x; p.y=msg.y; }
    if (msg.t === "say" && players.has(ws)) {
      const line = { name: players.get(ws).name, text: String(msg.text||"").slice(0,140), at: Date.now() };
      const packet = JSON.stringify({ t:"chat", line });
      for (const c of wss.clients) if (c.readyState===1) c.send(packet);
    }
  });
  ws.on("close", () => players.delete(ws));
});
setInterval(() => {
  const list = [...players.values()];
  const packet = JSON.stringify({ t:"state", players: list, at: Date.now() });
  for (const c of wss.clients) if (c.readyState===1) c.send(packet);
}, 50);
server.listen(process.env.PORT || 3523, () => console.log("http://127.0.0.1:"+(process.env.PORT||3523)));
