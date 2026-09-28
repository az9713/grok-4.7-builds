// Plain-data shared world state. The network handler writes this immediately;
// the render loop only reads it. `snowBytes` is the frost grid
// (255 = frosted grass, 0 = a dark melted lane).

export class World {
  constructor() {
    this.selfId = null;
    this.me = null;
    this.worldMeta = null;
    this.remotes = new Map();
    this.snowBytes = null;
    this.snowDirty = true;
    this.chat = [];
    this.snowVersion = 0;
    this.lastSnowServerTs = 0;
    this.lastSnowClientTs = 0;
    this.lastPlayersTs = 0;
    this.pendingName = null;
  }

  applySnapshot(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    this.snowBytes = bytes;
    this.snowDirty = true;
  }

  applyDiff(pairs) {
    if (!this.snowBytes || !pairs) return;
    for (const [idx, val] of pairs) this.snowBytes[idx] = val;
    this.snowDirty = true;
  }

  upsertRemote(p, ts) {
    const existing = this.remotes.get(p.id);
    const now = ts || Date.now();
    if (existing) {
      existing.prev = { x: existing.x, z: existing.z, ry: existing.ry, ts: existing.lastTs };
      existing.x = p.x; existing.z = p.z; existing.ry = p.ry; existing.speed = p.speed;
      existing.name = p.name; existing.color = p.color;
      existing.lastTs = now;
    } else {
      this.remotes.set(p.id, {
        id: p.id, name: p.name, color: p.color,
        x: p.x, z: p.z, ry: p.ry, speed: p.speed || 0,
        lastTs: now, prev: { x: p.x, z: p.z, ry: p.ry, ts: now }
      });
    }
  }

  removeRemote(id) {
    this.remotes.delete(id);
  }

  pushChat(msg) {
    this.chat.push(msg);
    if (this.chat.length > 30) this.chat.shift();
  }
}
