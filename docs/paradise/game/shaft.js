/* 礦坑下樓: platforms rise, you drop from one to the next. All art and rules are our own. Plain syntax for old TV browsers. */
var Shaft = (function () {
  "use strict";
  var W = 160, H = 144, TOP = 14, MAX_FLOOR = 100, FLOOR_PX = 40, GAP = 34, PW = 52, MAX_HP = 10, FALL_HP = 4;
  var NORMAL = 0, SPIKE = 1, LEFT = 2, RIGHT = 3, SPRING = 4, FRAGILE = 5;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function speedAt(floor) { return Math.min(30 + floor * .42, 70); }
  function widthAt(floor) { return Math.max(36, 52 - floor * .2); }

  function kindAt(floor, lastBad) {
    var r = Math.random(), spike = Math.min(.12 + floor * .003, .3), frag = Math.min(.06 + floor * .002, .16);
    if (r < spike) return lastBad ? NORMAL : SPIKE;
    if (r < spike + frag) return lastBad ? NORMAL : FRAGILE;
    if (r < spike + frag + .16) return Math.random() < .5 ? LEFT : RIGHT;
    if (r < spike + frag + .26) return SPRING;
    return NORMAL;
  }

  function Run() {
    this.ps = [];
    for (var y = 70; y < H + GAP; y += GAP) this.ps.push({ x: rnd(14, W - 14 - PW), y: y, w: PW, t: NORMAL, gone: -1, seen: false });
    this.ps[0].x = 59;
    this.x = 74; this.y = 40; this.vy = 0; this.d = "d"; this.hp = MAX_HP; this.floor = 1; this.dist = 0; this.ms = 0;
    this.on = null; this.through = 0; this.hurt = 0; this.over = false; this.cleared = false; this.lastBad = false; this.step = 0;
  }

  Run.prototype.tick = function (dt, left, right) {
    if (this.over) return;
    this.ms += dt * 1000;
    var v = speedAt(this.floor), i, p;
    this.dist += v * dt;
    this.floor = Math.min(MAX_FLOOR, 1 + Math.floor(this.dist / FLOOR_PX));
    if (this.floor >= MAX_FLOOR) { this.over = true; this.cleared = true; return; }
    for (i = this.ps.length - 1; i >= 0; i--) {
      p = this.ps[i]; p.y -= v * dt;
      if (p.gone >= 0) { p.gone -= dt; if (p.gone < 0) { if (this.on === p) this.on = null; p.y = -99; } }
      if (p.y < TOP - 8) this.ps.splice(i, 1);
    }
    var last = this.ps[this.ps.length - 1];
    if (!last || last.y < H) {
      var t = kindAt(this.floor, this.lastBad), base = last ? last.y : H;
      this.lastBad = t === SPIKE || t === FRAGILE;
      var pw = Math.round(widthAt(this.floor));
      this.ps.push({ x: rnd(14, W - 14 - pw), y: base + GAP, w: pw, t: t, gone: -1, seen: false });
    }
    var move = (right ? 78 : 0) - (left ? 78 : 0);
    if (move) this.d = move > 0 ? "r" : "l";
    if (this.on) { if (this.on.t === LEFT) move -= 34; else if (this.on.t === RIGHT) move += 34; }
    this.x = Math.max(12, Math.min(W - 22, this.x + move * dt));
    this.step += Math.abs(move) * dt;
    this.through = Math.max(0, this.through - dt); this.hurt = Math.max(0, this.hurt - dt);

    if (this.on && (this.x + 10 < this.on.x || this.x > this.on.x + this.on.w)) this.on = null;
    if (this.on) { this.y = this.on.y - 12; this.vy = 0; }
    else {
      var feet = this.y + 12;
      this.vy = Math.min(this.vy + 480 * dt, 170);
      this.y += this.vy * dt;
      if (this.vy >= 0 && !this.through) {
        for (i = 0; i < this.ps.length; i++) {
          p = this.ps[i];
          if (this.x + 10 > p.x && this.x < p.x + p.w && feet <= p.y + 3 && this.y + 12 >= p.y - 1) { this.land(p); break; }
        }
      }
    }
    if (this.y < TOP + 2) {
      this.y = TOP + 8; this.vy = 60; this.on = null; this.through = .3;
      this.hit(3);
    }
    if (this.y > H) this.rescue();
  };

  Run.prototype.land = function (p) {
    this.on = p; this.y = p.y - 12; this.vy = 0;
    var first = !p.seen; p.seen = true;
    if (p.t === SPIKE) { if (first) this.hit(3); }
    else if (first && this.hp < MAX_HP) this.hp += 1;
    if (p.t === SPRING) { this.on = null; this.vy = -190; p.seen = false; }
    if (p.t === FRAGILE && p.gone < 0) p.gone = .4;
  };

  /* Falling off costs health, not the whole run: a safe platform catches you near the top. */
  Run.prototype.rescue = function () {
    this.hurt = 0;
    this.hit(FALL_HP);
    if (this.over) return;
    var pw = 52, px = Math.max(14, Math.min(W - 14 - pw, this.x - pw / 2 + 5)), py = 72, p = { x: px, y: py, w: pw, t: NORMAL, gone: -1, seen: true };
    this.ps = this.ps.filter(function (q) { return Math.abs(q.y - py) > 12; });
    this.ps.push(p);
    this.ps.sort(function (a, b) { return a.y - b.y; });
    this.x = px + pw / 2 - 5; this.y = py - 12; this.on = p; this.vy = 0;
  };

  Run.prototype.hit = function (n) {
    if (this.hurt > 0) return;
    this.hp -= n; this.hurt = .5;
    if (this.hp <= 0) { this.hp = 0; this.over = true; }
  };

  Run.prototype.view = function (theme, look) {
    return { k: "shaft", th: theme, look: look, x: Math.round(this.x), y: Math.round(this.y), d: this.d, hp: this.hp, fl: this.floor, hurt: this.hurt > 0 ? 1 : 0,
      st: Math.floor(this.step / 12) % 2, ps: this.ps.map(function (p) { return [Math.round(p.x), Math.round(p.y), p.w, p.t, p.gone >= 0 ? 1 : 0]; }) };
  };

  var THEME = {
    mine: { bg: "#2a2018", bg2: "#3a2c20", wall: "#584030", wall2: "#40301f", plat: "#a07848", lamp: "#f0c030" },
    tunnel: { bg: "#20242c", bg2: "#2c3038", wall: "#585c64", wall2: "#44484f", plat: "#9098a0", lamp: "#f8f0c0" }
  };

  function drawPlatform(c, p, th, f) {
    var R = Art.R, x = p[0], y = p[1], w = p[2], t = p[3];
    if (t === SPIKE) {
      R(c, x, y + 3, w, 4, "#606068");
      for (var i = 0; i < w; i += 6) { R(c, x + i + 2, y - 2, 2, 5, "#e8e8f0"); R(c, x + i + 1, y + 1, 4, 2, "#b0b0c0"); }
    } else if (t === LEFT || t === RIGHT) {
      R(c, x, y, w, 7, "#303038");
      for (var j = 0; j < w; j += 6) R(c, x + ((j + (t === LEFT ? -f : f) * 3 + w * 3) % w), y + 2, 3, 3, "#f0c030");
    } else if (t === SPRING) {
      R(c, x, y, w, 3, "#40b060"); for (var k = 4; k < w; k += 8) R(c, x + k, y + 3, 3, 4, "#a0a0a8");
    } else if (t === FRAGILE) {
      for (var n = 0; n < w; n += 8) { if (p[4] && (n + f) % 16 === 0) continue; R(c, x + n, y + (p[4] ? 1 : 0), 7, 5, "#c0a890"); }
    } else {
      R(c, x, y, w, 7, th.plat); R(c, x, y + 5, w, 2, "#000"); c.globalAlpha = 1;
    }
  }

  function draw(c, v) {
    var R = Art.R, th = THEME[v.th] || THEME.mine, f = Math.floor(Date.now() / 160) % 2;
    R(c, 0, 0, W, H, th.bg);
    for (var y = (Math.floor(Date.now() / 40) % 24) * -1; y < H; y += 24) R(c, 16, y, W - 32, 2, th.bg2);
    R(c, 0, 0, 12, H, th.wall); R(c, W - 12, 0, 12, H, th.wall);
    for (var i = 0; i < H; i += 16) { R(c, 3, i + 4, 6, 3, th.wall2); R(c, W - 9, i + 12, 6, 3, th.wall2); }
    if (v.th === "tunnel") for (var l = 8; l < H; l += 40) R(c, 12, l, 2, 4, th.lamp);
    v.ps.forEach(function (p) { if (p[1] > 0) drawPlatform(c, p, th, f); });
    if (!(v.hurt && f)) c.drawImage(Art.sprite(v.look, v.d, v.st, "none"), v.x - Art.OX - 3, v.y - Art.OY - 4);
    R(c, 12, 0, W - 24, TOP - 2, "#181820"); R(c, 12, TOP - 2, W - 24, 2, "#888");
    for (var s = 14; s < W - 14; s += 6) { R(c, s + 2, TOP, 2, 3, "#c0c0c8"); }
    c.fillStyle = "#f8f8f0"; c.font = '11px "Cubic 11", monospace'; c.textBaseline = "top"; c.fillText(v.fl + " 層", 16, 1);
    for (var h = 0; h < MAX_HP; h++) R(c, W - 16 - h * 5, 3, 4, 6, h < v.hp ? "#e04040" : "#505058");
  }

  function clock(ms) { var s = ms / 1000, m = Math.floor(s / 60); return (m ? m + " 分 " : "") + (s - m * 60).toFixed(1) + " 秒"; }

  return { Run: Run, draw: draw, clock: clock, W: W, H: H, MAX_FLOOR: MAX_FLOOR };
})();
if (typeof module !== "undefined") module.exports = Shaft;
