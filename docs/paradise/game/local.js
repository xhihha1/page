/* 樂園 without a server: the static web edition (SRS §8.7).
   Rules is a line-by-line copy of the single-player part of game/world.py; tests/test_static_rules.py runs both
   on the same random walks and fails if they ever disagree. LocalGame stands in for the REST API and the
   WebSocket, so phone.js runs unchanged. Saves live in this browser only (localStorage). */
(function (root) {
  "use strict";
  var DIRS = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
  var TURN_S = 0.09, KEEP_PACE_S = 0.1;
  var VEHICLE_NAMES = { bike: "單車", moto: "機車", car: "汽車", boat: "船" };

  function GameError(text) { var e = new Error(text); e.game = true; return e; }

  // ---- rules: world.py -------------------------------------------------------------
  function Rules(world) {
    this.w = world; this.maps = world.maps; this.cls = world.classes; this.speed = world.speeds;
    this.p = null; this.changed = false; this.moved = false; this.out = []; this.visits = [];
  }
  var R = Rules.prototype;

  R.tile = function (m, x, y) { return x >= 0 && x < m.w && y >= 0 && y < m.h ? m.rows[y].charAt(x) : "0"; };
  R.tileClass = function (m, x, y) { return this.cls[this.tile(m, x, y)]; };
  R.objectAt = function (m, x, y) {
    for (var i = 0; i < m.objects.length; i++) if (m.objects[i].x === x && m.objects[i].y === y) return m.objects[i];
    return null;
  };
  R.walkable = function (m, x, y) { var c = this.tileClass(m, x, y); return c !== "solid" && c !== "water" && !this.objectAt(m, x, y); };

  R.player = function (save) {
    var p = { id: "me", name: save.name, look: save.look, map: save.map, x: save.x, y: save.y, d: save.d || "d",
              vehicle: save.vehicle || "none", held: null, next_at: 0, moved_at: -1, ms: 0, warp_at: null,
              pending_warp: null, bump_at: 0, bed: null, up: null, online: true };
    this.p = p;
    this.settle(p);
    return p;
  };

  R.settle = function (p) {           // _settle: a saved spot that is gone or inside a wall moves to the region entry
    var m = this.maps[p.map];
    var onWater = m && p.vehicle === "boat" && this.tileClass(m, p.x, p.y) === "water";
    if (m && (this.walkable(m, p.x, p.y) || onWater)) return;
    var entry = this.w.spawn;
    if (m) this.w.regions.forEach(function (r) { if (r.id === m.region) entry = r.entry; });
    p.map = entry[0]; p.x = entry[1]; p.y = entry[2]; p.d = entry[3]; p.vehicle = "none";
  };

  R.record = function () {
    var p = this.p;
    return { id: p.id, n: p.name, look: p.look, map: p.map, x: p.x, y: p.y, d: p.d, v: p.vehicle, ms: p.ms, hid: false,
             lead: null, on: true, lie: p.bed !== null, w: !!p.held };
  };

  R.touch = function () { this.changed = true; };
  R.notice = function (text) { this.out.push({ t: "notice", text: text }); };

  R.setInput = function (d, now) {
    var p = this.p;
    if (d !== null && !DIRS[d]) return;
    if (!!p.held !== !!d) this.touch();
    p.held = d;
    if (d === null || p.warp_at !== null) return;
    if (p.bed) { this.getUp(); p.held = null; p.next_at = now + 0.2; return; }
    var idle = now >= p.next_at && now - p.next_at > 0.06;
    if (d !== p.d && idle) { p.d = d; p.next_at = now + TURN_S; this.touch(); }
  };

  R.tick = function (now) {
    var p = this.p;
    if (p.warp_at !== null && now >= p.warp_at) {
      var w = p.pending_warp; p.warp_at = null; p.pending_warp = null;
      this.warp(w.to, w.x, w.y, w.d);
      p.next_at = now + 0.15;
    } else if (p.held && p.warp_at === null && now >= p.next_at) this.step(p.held, now);
  };

  R.nextDue = function () {
    var p = this.p;
    if (p.warp_at !== null) return p.warp_at;
    return p.held ? p.next_at : null;
  };

  R.passable = function (x, y) {
    var p = this.p, m = this.maps[p.map];
    if (this.objectAt(m, x, y)) return false;
    var c = this.tileClass(m, x, y);
    if (m.warps[x + "," + y] && c !== "solid") return true;
    if (p.vehicle === "none") return c !== "solid" && c !== "water";
    if (p.vehicle === "boat") return c === "water";
    if (p.vehicle === "car") return c === "road";
    return c === "road" || c === "path";
  };

  R.step = function (d, now) {
    var p = this.p, nx = p.x + DIRS[d][0], ny = p.y + DIRS[d][1], m = this.maps[p.map];
    p.d = d;
    if (!this.passable(nx, ny)) {
      p.ms = 0; p.next_at = now + 0.12; this.touch();
      if (p.vehicle !== "none" && now - p.bump_at > 2.5 && this.tileClass(m, nx, ny) !== "solid" && !this.objectAt(m, nx, ny)) {
        p.bump_at = now;
        this.notice(p.vehicle === "boat" ? "到岸了，可以從選單下船。" : VEHICLE_NAMES[p.vehicle] + "過不去，可以從選單下車。");
      }
      return;
    }
    var ms = this.speed[p.vehicle];
    this.advance(nx, ny, ms);
    var start = (now - p.next_at >= 0 && now - p.next_at < KEEP_PACE_S) ? p.next_at : now;
    p.next_at = start + ms / 1000; p.moved_at = now;
    var w = m.warps[nx + "," + ny];
    if (w) { p.warp_at = p.next_at; p.pending_warp = w; }
  };

  R.advance = function (nx, ny, ms) { var p = this.p; p.x = nx; p.y = ny; p.ms = ms; this.touch(); };

  R.lieDown = function () {
    var p = this.p;
    if (p.bed) return;
    if (p.vehicle !== "none") throw GameError("先下車吧");
    var obj = this.objectAt(this.maps[p.map], p.x + DIRS[p.d][0], p.y + DIRS[p.d][1]);
    if (!obj || obj.k !== "bed") throw GameError("這裡沒有床");
    p.bed = obj.bed; p.up = [p.x, p.y, p.d];
    p.x = obj.slots[0][0]; p.y = obj.slots[0][1]; p.d = "d"; p.ms = 0;
    this.touch();
  };

  R.getUp = function () {
    var p = this.p;
    if (!p.bed) return;
    p.x = p.up[0]; p.y = p.up[1]; p.d = p.up[2]; p.bed = null; p.up = null; p.ms = 0;
    this.touch();
  };

  R.warp = function (to, x, y, d) {
    var p = this.p, target = this.maps[to];
    p.map = to; p.x = x; p.y = y; p.d = d; p.ms = 0;
    this.touch(); this.moved = true;
    if (target.region) this.visits.push(target.region);
    if (p.vehicle !== "none" && target.vehicles.indexOf(p.vehicle) < 0) p.vehicle = "none";
  };

  R.setVehicle = function (v, now) {
    var p = this.p;
    if (p.warp_at !== null) return;
    var m = this.maps[p.map], ax = p.x + DIRS[p.d][0], ay = p.y + DIRS[p.d][1];
    if (v === "none") {
      if (p.vehicle === "boat") {
        if (!this.walkable(m, ax, ay)) throw GameError("面向陸地才能下船");
        p.vehicle = "none"; this.touch();
        this.advance(ax, ay, this.speed.boat);
        p.next_at = now + this.speed.boat / 1000;
        return;
      }
      p.vehicle = "none"; this.touch();
      return;
    }
    if (v === "boat") {
      if (p.vehicle === "boat") return;
      if (this.tileClass(m, ax, ay) !== "water") throw GameError("面向水面才能叫船");
      p.vehicle = "boat"; this.touch();
      this.advance(ax, ay, this.speed.boat);
      p.next_at = now + this.speed.boat / 1000;
      return;
    }
    if (v !== "bike" && v !== "moto" && v !== "car") throw GameError("沒有這種交通工具");
    if (p.vehicle === "boat") throw GameError("先下船吧");
    if (m.vehicles.indexOf(v) < 0) throw GameError(v !== "car" ? "這裡不能騎車" : "這裡不能開車");
    var c = this.tileClass(m, p.x, p.y);
    if (c !== "road" && (v === "car" || c !== "path")) throw GameError(v === "car" ? "到車道上才能開車" : "到路上才能騎車");
    p.vehicle = v; this.touch();
  };

  R.useElevator = function (floor) {
    var p = this.p, obj = this.objectAt(this.maps[p.map], p.x + DIRS[p.d][0], p.y + DIRS[p.d][1]);
    if (!obj || obj.k !== "elevator" || !obj.floors[floor]) throw GameError("這裡沒有電梯");
    var f = obj.floors[floor];
    this.warp(f.to, f.x, f.y, f.d);
  };

  // one message from the phone, as service.handle does it
  R.handle = function (msg, now) {
    try {
      if (msg.t === "in") { this.setInput(msg.d === undefined ? null : msg.d, now); this.tick(now); }
      else if (msg.t === "vehicle") this.setVehicle(String(msg.v), now);
      else if (msg.t === "lie") this.lieDown();
      else if (msg.t === "getup") this.getUp();
      else if (msg.t === "elevator") this.useElevator(String(msg.floor));
      else if (msg.t !== "ui") throw GameError("單機版沒有這個功能");
    } catch (e) {
      if (!e.game) throw e;
      this.out.push({ t: "err", text: e.message });
    }
  };

  // ---- the browser side ---------------------------------------------------------------------
  var KEY = "paradise.save.v1", MAX_BODY = 200, MAX_FLOORS = 100, MIN_MS_PER_FLOOR = 150, COURSES = ["mine", "tunnel"];
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  function readSave() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && typeof s === "object") return s; } catch (e) {}
    return {};
  }

  function LocalGame(worldUrl) {
    this.url = worldUrl; this.world = null; this.rules = null; this.sock = null; this.timer = 0;
    this.save = readSave();
    this.save.visits = this.save.visits || []; this.save.messages = this.save.messages || []; this.save.scores = this.save.scores || [];
    this.save.next = this.save.next || 1;
    this.persistent = true;
    var self = this;
    addEventListener("pagehide", function () { self.store(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) self.store(); });
  }
  var L = LocalGame.prototype;
  L.solo = true;

  L.store = function () {
    if (this.frozen) return;            // an imported save is waiting for the reload: never write over it
    var p = this.rules && this.rules.p;
    if (p) this.save.pos = { map: p.map, x: p.bed ? p.up[0] : p.x, y: p.bed ? p.up[1] : p.y, d: p.d, vehicle: p.vehicle };
    try { localStorage.setItem(KEY, JSON.stringify(this.save)); this.persistent = true; } catch (e) { this.persistent = false; }
  };

  L.loadWorld = function () {
    var self = this;
    if (this.world) return Promise.resolve(this.world);
    return fetch(this.url).then(function (r) { if (!r.ok) throw new Error("讀不到地圖資料"); return r.json(); })
      .then(function (w) { self.world = w; return w; });
  };

  function fail(text) { return Promise.reject(new Error(text)); }

  L.cleanLook = function (raw) {
    var o = this.world.options;
    if (!raw || typeof raw !== "object") throw new Error("角色資料不正確");
    var head = raw.head === undefined ? "none" : raw.head;
    if (!o.hair[raw.sex] || o.hair[raw.sex].indexOf(raw.hair) < 0 || o.head.indexOf(head) < 0 || o.outfit.indexOf(raw.outfit) < 0)
      throw new Error("角色資料不正確");
    return { sex: raw.sex, hair: raw.hair, glasses: !!raw.glasses, head: head, outfit: raw.outfit };
  };

  L.charPayload = function () {
    var c = this.save.character;
    return { character: c ? { name: c.name, look: c.look } : null, default_name: "旅人", options: this.world.options };
  };

  L.api = function (method, url, body) {
    var self = this;
    return this.loadWorld().then(function () {
      try { return self.route(method, url.replace(/^\/api\/v1\/game\//, ""), body || {}); }
      catch (e) { return fail(e.message); }
    });
  };

  L.route = function (method, path, body) {
    var s = this.save, w = this.world, m;
    if (path === "world") return w;
    if (path === "character") {
      if (method === "GET") return this.charPayload();
      var name = String(body.name || "").trim().slice(0, 6) || "旅人";
      s.character = { name: name, look: this.cleanLook(body.look) };
      if (this.rules && this.rules.p) { this.rules.p.name = name; this.rules.p.look = s.character.look; this.rules.touch(); this.flush(); }
      if (s.visits.indexOf("cabin") < 0) s.visits.push("cabin");
      this.store();
      // connected before the character existed (as service.save_character does): start now
      var self = this;
      if (this.sock && this.sock.readyState === 1 && !(this.rules && this.rules.p)) setTimeout(function () { self.start(); }, 0);
      return this.charPayload();
    }
    if (path === "overview") {
      var p = this.rules && this.rules.p, here = p ? (w.maps[p.map].region || "overworld") : null, counts = {};
      s.messages.forEach(function (x) { counts[x.region] = (counts[x.region] || 0) + 1; });
      return {
        regions: w.regions.map(function (r) {
          return { id: r.id, name: r.name, sub: r.sub, isle: r.isle, messages: counts[r.id] || 0, visited: s.visits.indexOf(r.id) >= 0, people: [] };
        }),
        where: here, at: p ? { map: p.map, x: p.x, y: p.y } : null, sea: [], party: [],
        me: p ? { lead: null, followers: 0, v: p.vehicle } : null
      };
    }
    if ((m = path.match(/^boards\/([a-z_0-9]+)$/))) {
      var region = m[1];
      if (!w.regions.some(function (r) { return r.id === region; })) throw new Error("沒有這個區域");
      if (method === "GET") {
        return { messages: s.messages.filter(function (x) { return x.region === region; }).slice().reverse().map(function (x) {
          return { id: x.id, name: x.name, body: x.body, visited_on: x.visited_on, mine: true, can_delete: true };
        }) };
      }
      var text = String(body.body || "").trim(), visited = String(body.visited_on || "").trim() || null;
      if (!text || text.length > MAX_BODY) throw new Error("留言要 1 到 " + MAX_BODY + " 個字");
      if (visited && !DATE_RE.test(visited)) throw new Error("到訪日期格式不正確");
      var id = s.next++;
      s.messages.push({ id: id, region: region, name: s.character ? s.character.name : "旅人", body: text, visited_on: visited, at: Date.now() });
      this.store();
      return { id: id };
    }
    if ((m = path.match(/^messages\/(\d+)$/))) {
      var before = s.messages.length;
      s.messages = s.messages.filter(function (x) { return x.id !== +m[1]; });
      if (s.messages.length === before) throw new Error("留言不存在");
      this.store();
      return { ok: true };
    }
    if (path === "scores") {
      if (method === "POST") {
        var floors = parseInt(body.floors, 10), ms = parseInt(body.ms, 10);
        if (COURSES.indexOf(body.course) < 0 || !(floors >= 1 && floors <= MAX_FLOORS) || !(ms >= floors * MIN_MS_PER_FLOOR)) throw new Error("成績不正確");
        s.scores.push({ name: s.character ? s.character.name : "旅人", course: body.course, floors: floors, ms: ms });
        s.scores.sort(function (a, b) { return b.floors - a.floors || a.ms - b.ms; });
        s.scores = s.scores.slice(0, 10);
        this.store();
      }
      return { scores: s.scores.map(function (x) { return { name: x.name, floors: x.floors, ms: x.ms, course: x.course, mine: true }; }) };
    }
    throw new Error("單機版沒有這個功能");
  };

  // ---- a WebSocket that never leaves the phone --------------------------------------------
  L.socket = function () {
    var self = this, sock = { readyState: 0, onopen: null, onmessage: null, onclose: null };
    sock.send = function (raw) {
      var msg; try { msg = JSON.parse(raw); } catch (e) { return; }
      if (!self.rules || !self.rules.p || msg.t === "ui") return;      // "ui" only mirrors the phone on a TV
      self.rules.handle(msg, now());
      self.flush();
    };
    sock.close = function () { sock.readyState = 3; };
    this.sock = sock;
    this.loadWorld().then(function () {
      sock.readyState = 1;
      if (sock.onopen) sock.onopen({});
      self.start();
    });
    return sock;
  };

  function now() { return performance.now() / 1000; }

  L.emit = function (msg) { if (this.sock && this.sock.onmessage) this.sock.onmessage({ data: JSON.stringify(msg) }); };

  L.start = function () {
    var s = this.save;
    if (!s.character) { this.emit({ t: "nochar" }); return; }
    var spawn = this.world.spawn, pos = s.pos || { map: spawn[0], x: spawn[1], y: spawn[2], d: spawn[3] };
    if (!this.rules) this.rules = new Rules(this.world);
    var p = this.rules.player({ name: s.character.name, look: s.character.look, map: pos.map, x: pos.x, y: pos.y, d: pos.d, vehicle: pos.vehicle });
    var region = this.world.maps[p.map].region;
    if (region && s.visits.indexOf(region) < 0) s.visits.push(region);
    this.emit({ t: "init", me: p.id, map: p.map, players: [this.rules.record()], role: "ctl" });
    this.store();
  };

  // what service._flush does for one player
  L.flush = function () {
    var r = this.rules, s = this.save, self = this;
    if (!r || !r.p) return;
    // take everything first: the phone answers some messages at once (a new map closes its menus),
    // and that answer comes back in here before this call has finished
    var moved = r.moved, changed = r.changed, out = r.out;
    r.visits.forEach(function (v) { if (s.visits.indexOf(v) < 0) s.visits.push(v); });
    r.out = []; r.visits = []; r.changed = false; r.moved = false;
    this.schedule();
    if (moved) this.store();
    if (moved) this.emit({ t: "map", map: r.p.map, players: [r.record()] });
    else if (changed) this.emit({ t: "u", p: [r.record()], gone: [] });
    out.forEach(function (m) { self.emit(m); });
  };

  // the loop: wake when the next step falls due, like service._loop, and sleep when nothing moves
  L.schedule = function () {
    var self = this, due = this.rules.nextDue();
    clearTimeout(this.timer);
    if (due === null) return;
    this.timer = setTimeout(function () { self.rules.tick(now()); self.flush(); }, Math.max(2, (due - now()) * 1000));
  };

  // ---- save file -------------------------------------------------------------------------
  L.exportSave = function () { this.store(); return JSON.stringify({ app: "paradise", v: 1, save: this.save }, null, 1); };
  L.importSave = function (text) {
    var d = JSON.parse(text);
    if (!d || d.app !== "paradise" || !d.save || typeof d.save !== "object") throw new Error("這不是樂園的存檔");
    localStorage.setItem(KEY, JSON.stringify(d.save));
    this.frozen = true;
  };

  root.LocalRules = Rules;
  if (typeof window !== "undefined" && window.PARADISE_WORLD) root.LocalGame = new LocalGame(window.PARADISE_WORLD);
  if (typeof module !== "undefined") module.exports = { Rules: Rules };
})(typeof window !== "undefined" ? window : this);
