/* 樂園 renderer, shared by the phone and the TV. It only draws what the server says. */
var Engine = (function () {
  "use strict";
  var TS = Art.TS;

  function Eng(canvas, opts) {
    this.cv = canvas; this.c = canvas.getContext("2d");
    this.vw = opts.vw * TS; this.vh = opts.vh * TS;
    canvas.width = this.vw; canvas.height = this.vh;
    this.c.imageSmoothingEnabled = false;
    this.labels = opts.labels || null;
    this.onMap = opts.onMap || function () {};
    this.world = null; this.map = null; this.me = null;
    this.actors = {}; this.layers = {}; this.mono = false;
    this.fadeAt = -1000; this.camX = 0; this.camY = 0;
    this.tagSelf = !!opts.tagSelf;
    this.tags = {};
    var self = this;
    this.loop = function (t) { self.frame(t); requestAnimationFrame(self.loop); };
  }

  Eng.prototype.start = function () { requestAnimationFrame(this.loop); };

  Eng.prototype.mapLayer = function (id, frame) {
    var key = id + ":" + frame;
    if (this.layers[key]) return this.layers[key];
    var m = this.world.maps[id], W = m.w * TS, H = m.h * TS;
    var cv = Art.mk(W, H), c = cv.getContext("2d"), glow = [];
    var floor = this.world.tiles[m.fill];
    for (var y = 0; y < m.h; y++) for (var x = 0; x < m.w; x++) {
      var name = this.world.tiles[m.rows[y].charAt(x)];
      if (name === "block") {                          // under multi-tile art: only its corners ever show
        name = floorOf(m, x, y, this.world, floor);
        if (name === floor && this.world.classes[m.fill] === "water") name = "grass";
      }
      c.save(); c.translate(x * TS, y * TS); Art.paintTile(c, name, frame, x, y, floorOf(m, x, y, this.world, floor)); c.restore();
      if (m.night && Art.GLOW[name]) glow.push([x, y, name]);
    }
    m.stamps.forEach(function (s) {
      if (m.night && Art.GLOW_STAMP[s.s]) return;
      c.save(); c.translate(s.x * TS, s.y * TS); Art.stamp(c, s.s, s.w * TS, s.h * TS, frame); c.restore();
    });
    if (m.night) {
      c.fillStyle = "rgba(16,16,72,.42)"; c.fillRect(0, 0, W, H);
      glow.forEach(function (g) { c.save(); c.translate(g[0] * TS, g[1] * TS); Art.paintTile(c, g[2], frame, g[0], g[1], "plaza"); c.restore(); });
      m.stamps.forEach(function (s) {
        if (Art.GLOW_STAMP[s.s]) { c.save(); c.translate(s.x * TS, s.y * TS); Art.stamp(c, s.s, s.w * TS, s.h * TS, frame); c.restore(); }
      });
    }
    // people and signs last: on night maps they stay readable, and lit stages never cover the performers
    m.objects.forEach(function (o) {
      c.save(); c.translate(o.x * TS, o.y * TS);
      if (o.k === "sign") Art.paintSign(c);
      else if (o.k === "board") Art.paintBoard(c);
      c.restore();
      if (o.k === "npc") {
        if (o.look && o.look.indexOf("animal:") === 0) { c.drawImage(Art.animal(o.look.slice(7), frame), o.x * TS, o.y * TS); return; }
        var look = Art.NPC[o.look] || Art.NPC.guide;
        c.drawImage(Art.sprite(look, "d", look.pose ? frame : 0, "none"), o.x * TS - Art.OX, o.y * TS - Art.OY);
      }
    });
    this.layers[key] = cv;
    return cv;
  };

  function floorOf(m, x, y, world, fallback) {
    // furniture sits on whatever floor is around it (bathroom tile, bedroom wood…)
    var around = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (var i = 0; i < 4; i++) {
      var row = m.rows[y + around[i][1]], ch = row && row.charAt(x + around[i][0]);
      if (ch && world.classes[ch] !== "solid" && world.classes[ch] !== "water" && ch !== "d" && ch !== "P") return world.tiles[ch];
    }
    return fallback;
  }

  Eng.prototype.setWorld = function (w) { this.world = w; };

  Eng.prototype.enterMap = function (id, players) {
    var changed = id !== this.map;
    this.map = id; this.actors = {};
    this.clearTags();
    var self = this;
    players.forEach(function (p) { self.apply(p, true); });
    if (changed) {
      this.fadeAt = performance.now();
      Object.keys(this.layers).forEach(function (k) { if (k.indexOf(id + ":") !== 0) delete self.layers[k]; });
      this.onMap(this.world.maps[id]);
      this.mapLayer(id, 0); this.mapLayer(id, 1);           // both animation frames now, under the fade, not mid-walk
    }
  };

  var DIR = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
  var GLIDE_MAX = .45;                 // how far past its tile a walker may glide while the next step is on its way

  Eng.prototype.apply = function (p, snap) {
    var a = this.actors[p.id], now = performance.now();
    if (!a) {
      a = this.actors[p.id] = { id: p.id, fx: p.x, fy: p.y, t0: 0, ms: 0, step: 0, ov: 0 };
      snap = true;
    }
    if (!snap && (a.tx !== p.x || a.ty !== p.y)) {
      var cur = this.pos(a, now), dx = p.x - a.tx, dy = p.y - a.ty, one = Math.abs(dx) + Math.abs(dy) === 1;
      // carry on from where it is drawn (maybe already gliding past its tile) at walking speed
      var left = one ? Math.max(.25, Math.abs(p.x - cur.x) + Math.abs(p.y - cur.y)) : 1;
      a.md = one ? (dx > 0 ? "r" : dx < 0 ? "l" : dy > 0 ? "d" : "u") : null;
      a.fx = cur.x; a.fy = cur.y; a.t0 = now; a.ms = (p.ms || 120) * Math.min(1, left); a.step = (a.step + 1) % 2; a.ov = 0;
    } else if (snap) { a.fx = p.x; a.fy = p.y; a.ms = 0; a.md = null; a.ov = 0; }
    a.tx = p.x; a.ty = p.y; a.d = p.d; a.v = p.v; a.hid = p.hid; a.look = p.look; a.n = p.n; a.lead = p.lead; a.on = p.on; a.lie = p.lie;
    a.w = p.w; a.sp = p.ms || a.sp;
    a.rec = p;
  };

  /* Keep gliding past the tile while the walker still heads this way and the next tile is open,
     so a late message from the Pi never shows up as a stop. */
  Eng.prototype.keepGoing = function (a) {
    if (!a.md || a.md !== a.d || a.lie || a.lead || a.hid) return false;
    var walking = a.id === this.me && this.held !== undefined ? this.held === a.d : a.w;
    if (!walking) return false;
    var m = this.world.maps[this.map], D = DIR[a.d];
    if (!m || m.warps[a.tx + "," + a.ty]) return false;
    return this.passable(m, a.tx + D[0], a.ty + D[1], a.v);
  };

  Eng.prototype.passable = function (m, x, y, v) {      // the same rule as World._passable
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false;
    for (var i = 0; i < m.objects.length; i++) if (m.objects[i].x === x && m.objects[i].y === y) return false;
    var cls = this.world.classes[m.rows[y].charAt(x)];
    if (m.warps[x + "," + y] && cls !== "solid") return true;
    if (!v || v === "none") return cls !== "solid" && cls !== "water";
    if (v === "boat") return cls === "water";
    if (v === "car") return cls === "road";
    return cls === "road" || cls === "path";
  };

  Eng.prototype.pos = function (a, now) {
    var k = a.ms ? (now - a.t0) / a.ms : 1;
    if (k < 1) return { x: a.fx + (a.tx - a.fx) * k, y: a.fy + (a.ty - a.fy) * k, moving: true, k: k };
    var go = !!this.world && this.keepGoing(a), dt = now - (a.lt || now);
    a.lt = now;
    if (go) a.ov = Math.min(GLIDE_MAX, Math.max(0, now - a.t0 - a.ms) / (a.sp || 220));
    else if (a.ov) a.ov = Math.max(0, a.ov - dt / 90);            // it stopped after all: ease back onto the tile
    if (!a.ov) return { x: a.tx, y: a.ty, moving: false };
    var D = DIR[a.md];
    return { x: a.tx + D[0] * a.ov, y: a.ty + D[1] * a.ov, moving: go, k: .99 };
  };

  Eng.prototype.update = function (msg) {
    var self = this;
    (msg.p || []).forEach(function (p) { self.apply(p, false); });
    (msg.gone || []).forEach(function (id) { delete self.actors[id]; self.dropTag(id); });
  };

  Eng.prototype.dropTag = function (id) { var t = this.tags[id]; if (t) { t.parentNode.removeChild(t); delete this.tags[id]; } };
  Eng.prototype.clearTags = function () { var self = this; Object.keys(this.tags).forEach(function (id) { self.dropTag(id); }); };

  Eng.prototype.frame = function (now) {
    var c = this.c;
    if (!this.world || !this.map) { c.fillStyle = "#0f380f"; c.fillRect(0, 0, this.vw, this.vh); return; }
    var m = this.world.maps[this.map], meA = this.actors[this.me], f = Math.floor(now / 500) % 2;
    var layer = this.mapLayer(this.map, f);
    var W = m.w * TS, H = m.h * TS, cx, cy;
    if (meA) { var mp = this.pos(meA, now); cx = mp.x * TS + 8 - this.vw / 2; cy = mp.y * TS + 8 - this.vh / 2; }
    else { cx = this.camX; cy = this.camY; }
    cx = W <= this.vw ? (W - this.vw) / 2 : Math.max(0, Math.min(W - this.vw, cx));
    cy = H <= this.vh ? (H - this.vh) / 2 : Math.max(0, Math.min(H - this.vh, cy));
    cx = Math.round(cx); cy = Math.round(cy);
    this.camX = cx; this.camY = cy;
    c.fillStyle = "#101018"; c.fillRect(0, 0, this.vw, this.vh);
    c.drawImage(layer, -cx, -cy);

    var list = [], self = this;
    Object.keys(this.actors).forEach(function (id) {
      var a = self.actors[id];
      if (a.hid) { self.dropTag(id); return; }
      var p = self.pos(a, now);
      list.push({ id: id, a: a, x: p.x, y: p.y, moving: p.moving, k: p.k || 0 });
    });
    list.sort(function (p, q) { return p.y - q.y; });
    list.forEach(function (it) {
      var fr = it.moving ? (it.a.step + (it.k > .5 ? 1 : 0)) % 2 : 0;
      if (!it.moving) fr = 0;
      var spr = Art.sprite(it.a.look, it.a.lie ? "d" : it.a.d, it.moving ? 1 - fr : 0, it.a.lie ? "lie" : it.a.v);
      var sx = Math.round(it.x * TS) - cx - Art.OX, sy = Math.round(it.y * TS) - cy - Art.OY;
      c.drawImage(spr, sx, sy);
      if (self.labels && (self.tagSelf || it.id !== self.me)) self.tag(it, sx + Art.OX + 8, sy + Art.OY - 6);
    });

    if (m.fx === "fireworks") this.fireworks(now);
    else if (m.fx === "stage") this.stageLights(now);
    var fade = 1 - (now - this.fadeAt) / 350;
    if (fade > 0) { c.fillStyle = "rgba(0,0,0," + fade + ")"; c.fillRect(0, 0, this.vw, this.vh); }
    if (this.mono) this.toGreens();
  };

  Eng.prototype.fireworks = function (now) {
    var c = this.c, cols = ["#f8e870", "#f87070", "#80e8f8", "#a0f090", "#f0a0f0"];
    for (var i = 0; i < 4; i++) {
      var period = 2600 + i * 500, t = ((now + i * 900) % period) / period, n = Math.floor((now + i * 900) / period);
      var cx = 24 + ((n * 37 + i * 71) % (this.vw - 48)), cy = 18 + ((n * 23 + i * 29) % 44);
      if (t < .3) { c.fillStyle = "#f8f8f0"; c.fillRect(cx, this.vh - (this.vh - cy) * (t / .3), 1, 3); continue; }
      var k = (t - .3) / .7, r = 4 + k * 26;
      c.fillStyle = cols[(n + i) % cols.length];
      if (k > .75 && Math.floor(now / 80) % 2) continue;
      for (var a = 0; a < 16; a++) { var b = a / 16 * 6.283; c.fillRect(Math.round(cx + Math.cos(b) * r), Math.round(cy + Math.sin(b) * r + k * k * 8), 2, 2); }
    }
  };

  Eng.prototype.stageLights = function (now) {
    var c = this.c, cols = ["rgba(248,232,112,.16)", "rgba(128,232,248,.16)", "rgba(248,128,180,.16)"], f = Math.floor(now / 350);
    for (var i = 0; i < 5; i++) { c.fillStyle = cols[(f + i) % 3]; c.fillRect(((i * 37 + f * 11) % this.vw), 0, 14, this.vh); }
  };

  Eng.prototype.tag = function (it, x, y) {
    var el = this.tags[it.id];
    if (!el) {
      el = document.createElement("span"); el.className = "tag"; el.textContent = it.a.n;
      this.labels.appendChild(el); this.tags[it.id] = el;
    }
    var k = this.labels.clientWidth / this.vw;
    el.style.transform = "translate(" + Math.round(x * k) + "px," + Math.round(y * k) + "px) translate(-50%,-100%)";
  };

  Eng.prototype.toGreens = function () {
    var img = this.c.getImageData(0, 0, this.vw, this.vh), d = img.data, G = Art.GREENS;
    for (var i = 0; i < d.length; i += 4) {
      var l = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11, g = G[l < 70 ? 0 : l < 130 ? 1 : l < 190 ? 2 : 3];
      d[i] = g[0]; d[i + 1] = g[1]; d[i + 2] = g[2];
    }
    this.c.putImageData(img, 0, 0);
  };

  /* The whole overworld as a small picture for the panorama. */
  Eng.prototype.miniMap = function (scale) {
    var m = this.world.maps.overworld, cv = Art.mk(m.w * scale, m.h * scale), c = cv.getContext("2d"), C = Art.C;
    var col = { W: C.sea, s: C.sand, ".": C.grass, ",": C.grass, '"': C.grass2, T: C.leaf, "=": C.road, "+": C.wood, "^": C.gold, X: C.cream };
    for (var y = 0; y < m.h; y++) for (var x = 0; x < m.w; x++) { c.fillStyle = col[m.rows[y].charAt(x)] || C.grass; c.fillRect(x * scale, y * scale, scale, scale); }
    return cv;
  };

  return Eng;
})();
