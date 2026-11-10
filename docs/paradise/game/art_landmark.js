/* 樂園 art, sixth set (11/10): the famous landmarks redrawn in the style of the handheld RPGs of the
   Game Boy Color era: every building is inked with a dark outline, lit from the upper left in three or four
   tones, and roofs show their tile courses. Loaded after art_world.js; drawn in code like the rest. */
(function (A) {
  "use strict";
  var R = A.R, C = A.C, dots = A.dots, S = A.S;
  var INK = "#283040", GOLD = ["#f8e890", "#f0c030", "#b88818", "#705010"];
  // palettes run light → base → shade → dark
  var WH = ["#ffffff", "#ecece6", "#c8c8cc", "#90909c"];
  var BLUE = ["#80a8f0", "#3060c8", "#204098", "#142860"];
  var YEL = ["#f8e078", "#e8b830", "#c08818", "#7a5010"];
  var JADE = ["#78d098", "#2e9058", "#1c6a3c", "#0e4424"];
  var TEAL = ["#68c8a8", "#2a8a6a", "#1a5a48", "#0e3a2c"];
  var CREAM = ["#fff8e0", "#f0e0b8", "#d0bc90", "#a08860"];
  var STONE = ["#e0d8c8", "#b8b0a0", "#8c8478", "#5a5448"];
  var REDP = ["#f06850", "#c82820", "#901810", "#581008"];

  function px(c, x, y, col) { R(c, x, y, 1, 1, col); }
  function disc(c, cx, cy, r, col) {
    for (var y = -r; y <= r; y++) { var hw = Math.round(Math.sqrt(r * r - y * y)); R(c, cx - hw, cy + y, hw * 2, 1, col); }
  }

  /* Paint on a spare canvas, then ring every shape with a 1px ink line, the way handheld sprites are drawn. */
  function inked(fn) {
    return function (c, w, h, f) {
      var cv = A.mk(w, h), x = cv.getContext("2d");
      fn(x, w, h, f || 0);
      var a = x.getImageData(0, 0, w, h).data, ink = A.mk(w, h), k = ink.getContext("2d");
      k.fillStyle = INK;
      for (var y = 0; y < h; y++) for (var i = 0; i < w; i++) {
        var p = (y * w + i) * 4 + 3;
        if (a[p]) continue;
        if ((i > 0 && a[p - 4]) || (i < w - 1 && a[p + 4]) || (y > 0 && a[p - w * 4]) || (y < h - 1 && a[p + w * 4])) k.fillRect(i, y, 1, 1);
      }
      c.drawImage(ink, 0, 0); c.drawImage(cv, 0, 0);
    };
  }

  // ---- building parts -------------------------------------------------------------------
  /* A glazed-tile roof seen from the front: ridge on top, tile channels, a light eave lip with dark tile ends,
     corners curling up by `lift` px. `pull` is how far the ridge is set in from the eave on each side. */
  function roof(c, x, y, w, h, pull, P, lift) {
    for (var i = 0; i < h; i++) {
      var inset = Math.round(pull * (1 - i / Math.max(1, h - 1))), rx = x + inset, rw = w - inset * 2;
      R(c, rx, y + i, rw, 1, i % 5 === 4 ? P[2] : P[1]);
      R(c, rx, y + i, 2, 1, P[0]);                                    // lit left hip
      R(c, rx + rw - 2, y + i, 2, 1, P[2]);                           // shaded right hip
      if (i > 1 && i < h - 3) for (var t = rx + 4; t < rx + rw - 3; t += 4) px(c, t, y + i, P[2]);
    }
    R(c, x + pull - 2, y - 2, w - pull * 2 + 4, 3, P[3]); R(c, x + pull, y - 2, w - pull * 2, 1, P[2]);   // ridge
    R(c, x, y + h - 3, w, 2, P[0]);                                    // eave lip
    for (var e = x + 1; e < x + w; e += 3) px(c, e, y + h - 1, P[3]);
    for (var k = 0; k < lift; k++) {
      var up = Math.round(k * k / (lift * 1.4));
      R(c, x - 1 - k, y + h - 3 - up, 2, 2, k === lift - 1 ? P[3] : P[0]);
      R(c, x + w - 1 + k, y + h - 3 - up, 2, 2, k === lift - 1 ? P[3] : P[0]);
    }
  }

  /* An octagonal roof from the front: three faces (lit, front, shaded). topHW 0 makes a pointed pavilion. */
  function octRoof(c, cx, y, topHW, botHW, h, P, lift) {
    for (var i = 0; i < h; i++) {
      var hw = Math.round(topHW + (botHW - topHW) * i / Math.max(1, h - 1)), fw = Math.round(hw * .42);
      R(c, cx - hw, y + i, hw - fw, 1, P[0]); R(c, cx - fw, y + i, fw * 2, 1, i % 5 === 4 ? P[2] : P[1]); R(c, cx + fw, y + i, hw - fw, 1, P[2]);
      if (i > 1 && i < h - 3) for (var t = -fw + 3; t < fw - 1; t += 4) px(c, cx + t, y + i, P[2]);
    }
    R(c, cx - botHW, y + h - 3, botHW * 2, 2, P[0]);
    for (var e = cx - botHW + 1; e < cx + botHW; e += 3) px(c, e, y + h - 1, P[3]);
    for (var k = 0; k < lift; k++) {
      var up = Math.round(k * k / (lift * 1.4));
      R(c, cx - botHW - 1 - k, y + h - 3 - up, 2, 2, P[0]); R(c, cx + botHW - 1 + k, y + h - 3 - up, 2, 2, P[2]);
    }
  }

  function column(c, x, y, w, h, P) {
    R(c, x, y, w, h, P[1]); R(c, x, y, 1, h, P[0]); R(c, x + w - 2, y, 2, h, P[2]);
    R(c, x - 1, y, w + 2, 2, P[2]); R(c, x - 1, y + h - 2, w + 2, 2, P[2]);
  }

  function stairs(c, x, y, w, h, P) {
    for (var i = 0; i < h; i += 3) { R(c, x, y + i, w, 2, P[0]); R(c, x, y + i + 2, w, 1, P[2]); }
    R(c, x - 3, y, 3, h, P[2]); R(c, x + w, y, 3, h, P[2]);
  }

  function rail(c, x, y, w, P) {                       // stone balustrade
    R(c, x, y, w, 2, P[0]); R(c, x, y + 5, w, 2, P[1]); R(c, x, y + 7, w, 1, P[2]);
    for (var i = x; i < x + w; i += 6) { R(c, i, y, 2, 7, P[1]); px(c, i, y, P[0]); }
  }

  function plaque(c, x, y, w, h) {                     // a dark name board with gold letters
    R(c, x, y, w, h, GOLD[2]); R(c, x + 1, y + 1, w - 2, h - 2, "#203060");
    for (var i = x + 3; i < x + w - 3; i += 4) R(c, i, y + 2, 2, h - 4, GOLD[1]);
  }

  function brackets(c, x, y, w, h) {                   // 斗拱 under deep eaves: red, green and gold blocks
    R(c, x, y, w, h, "#7a2a20");
    for (var i = x + 1; i < x + w - 3; i += 6) { R(c, i, y + 1, 4, h - 2, "#2e7a68"); R(c, i + 1, y + 1, 2, 1, GOLD[1]); }
  }

  function hexWin(c, cx, cy, r, glass, lit) {          // a hexagonal window with a six-point star in it
    for (var y = -r; y <= r; y++) {
      var hw = Math.round(r * 1.15 - Math.abs(y) * .58);
      R(c, cx - hw - 1, cy + y, hw * 2 + 2, 1, "#f4f4f4");
      if (Math.abs(y) < r) R(c, cx - hw + 1, cy + y, hw * 2 - 2, 1, glass);
    }
    R(c, cx - 1, cy - r + 2, 2, r * 2 - 4, lit || "#e8f0f8"); R(c, cx - r + 2, cy - 1, r * 2 - 4, 2, lit || "#e8f0f8");
    dots(c, lit || "#e8f0f8", [cx - 3, cy - 3, cx + 2, cy - 3, cx - 3, cy + 2, cx + 2, cy + 2]);
  }

  // ---- 國父紀念館 and 台北 101 --------------------------------------------------------------
  S.sysmh = inked(function (c, w, h) {
    var cx = w / 2;
    // terrace, steps and balustrade
    R(c, 4, h - 14, w - 8, 14, STONE[1]); R(c, 4, h - 14, w - 8, 2, STONE[0]); R(c, 4, h - 2, w - 8, 2, STONE[2]);
    rail(c, 8, h - 21, cx - 38, WH); rail(c, cx + 30, h - 21, cx - 38, WH);
    stairs(c, cx - 28, h - 15, 56, 15, WH);
    // the colonnade stands in the shade of the deep eaves
    R(c, 14, 50, w - 28, h - 64, "#5a4c48"); R(c, 14, 50, w - 28, 8, "#3a3030");
    for (var wx = 24; wx < w - 24; wx += 15) { R(c, wx, 66, 8, 20, "#405868"); R(c, wx + 1, 67, 2, 18, "#6888a0"); }
    var n = 14, step = (w - 40) / (n - 1);
    for (var i = 0; i < n; i++) {
      var x = Math.round(18 + i * step);
      if (Math.abs(x + 3 - cx) < 20) continue;
      column(c, x, 54, 7, h - 74, ["#f0e8d0", "#c8bca0", "#988c70"]);
    }
    // the great door
    R(c, cx - 17, 60, 34, h - 80, GOLD[2]); R(c, cx - 15, 62, 30, h - 82, "#6a2418");
    for (var d = cx - 13; d < cx + 13; d += 6) R(c, d, 64, 4, h - 86, "#8a3420");
    R(c, cx - 1, 62, 2, h - 82, GOLD[2]);
    R(c, 10, 48, w - 20, 4, REDP[1]); for (var g = 14; g < w - 14; g += 8) px(c, g, 49, GOLD[1]);
    // the roof: a long yellow hip roof whose front eave rises in the middle like spread wings
    for (var rx = 0; rx < w; rx++) {
      var t = Math.abs(rx - cx) / 72, lc = t < 1 ? Math.round(24 * (1 - t * t) * (1 - t * t)) : 0;
      var edge = Math.min(rx, w - 1 - rx), lk = edge < 14 ? Math.round((14 - edge) * (14 - edge) / 22) : 0;
      var eave = 50 - lc - lk, top = rx < 56 ? Math.round(6 + (56 - rx) * .55) : rx > w - 57 ? Math.round(6 + (rx - (w - 57)) * .55) : 6;
      if (top > eave - 4) top = eave - 4;
      for (var y = top; y <= eave; y++) {
        var r = y - top, col = YEL[1];
        if (r === 0) col = YEL[3];
        else if (y >= eave - 2) col = y === eave ? (rx % 3 ? YEL[2] : YEL[3]) : YEL[0];
        else if (rx % 4 === 0 || r % 6 === 5) col = YEL[2];
        else if (r < 3 || rx < 56 && r < 10) col = YEL[0];
        px(c, rx, y, col);
      }
      if (lc > 2 && eave + 1 < 50) R(c, rx, eave + 1, 1, 50 - eave - 1, "#7a2a20");
    }
    brackets(c, cx - 40, 38, 80, 8);
    plaque(c, cx - 14, 29, 28, 7);
    R(c, 54, 2, 4, 6, YEL[3]); R(c, w - 58, 2, 4, 6, YEL[3]); R(c, 52, 0, 3, 3, YEL[3]); R(c, w - 55, 0, 3, 3, YEL[3]);   // ridge ends
  });

  S.tower101 = inked(function (c, w, h) {          // 台北 101: eight flared segments stacked like bamboo
    var cx = w / 2, G = ["#b8e8e0", "#68a8a0", "#3c7470", "#244848"];
    R(c, cx - 1, 0, 2, 16, "#d0d8e0"); R(c, cx - 2, 10, 4, 8, "#98a0a8");
    R(c, cx - 7, 18, 14, 5, G[2]); R(c, cx - 6, 18, 12, 2, G[1]); R(c, cx - 5, 23, 10, 5, G[3]);
    var seg = 12, top = 28;
    for (var s = 0; s < 8; s++) {
      for (var r = 0; r < seg; r++) {
        var hw = 14 - Math.round(r * .4), y = top + s * seg + r;
        R(c, cx - hw, y, hw * 2, 1, r === 0 ? G[0] : G[1]);
        R(c, cx - hw, y, 2, 1, G[0]); R(c, cx + hw - 4, y, 4, 1, G[2]);
        if (r % 3 === 2) R(c, cx - hw + 2, y, hw * 2 - 6, 1, G[2]);
      }
      R(c, cx - 1, top + s * seg + 2, 2, seg - 3, G[2]);
    }
    var yb = top + 8 * seg;
    disc(c, cx, yb + 3, 4, GOLD[1]); disc(c, cx, yb + 3, 2, G[3]);
    for (var b = 0; yb + 7 + b < h; b++) {
      var bw = 9 + Math.round(b * .3), by = yb + 7 + b;
      R(c, cx - bw, by, bw * 2, 1, b % 4 === 3 ? G[2] : G[1]); R(c, cx - bw, by, 2, 1, G[0]); R(c, cx + bw - 4, by, 4, 1, G[2]);
    }
  });

  // ---- 中正紀念堂、自由廣場、兩廳院 ----------------------------------------------------------
  S.cks_hall = inked(function (c, w, h) {
    var cx = w / 2;
    // the lower terrace and its long flight of steps
    R(c, 10, 124, w - 20, h - 124, WH[1]); R(c, 10, 124, w - 20, 2, WH[0]); R(c, 10, h - 3, w - 20, 3, WH[3]);
    rail(c, 12, 117, cx - 44, WH); rail(c, cx + 32, 117, cx - 44, WH);
    // the upper terrace
    R(c, 34, 102, w - 68, 22, WH[1]); R(c, 34, 102, w - 68, 2, WH[0]); R(c, w - 44, 102, 10, 22, WH[2]);
    rail(c, 36, 96, cx - 58, WH); rail(c, cx + 22, 96, cx - 58, WH);
    stairs(c, cx - 22, 100, 44, h - 100, WH);
    R(c, cx - 3, 100, 6, h - 100, "#d0d4e0");
    // the octagonal hall: a lit face, the front, a shaded face
    R(c, 56, 56, 96, 46, WH[1]); R(c, 56, 56, 16, 46, WH[0]); R(c, 136, 56, 16, 46, WH[2]);
    R(c, 72, 56, 1, 46, WH[2]); R(c, 135, 56, 1, 46, WH[3]);
    // pointed doorway with bronze doors
    for (var y = 64; y < 102; y++) {
      var hw = y < 76 ? Math.round(13 * Math.sqrt((y - 62) / 14)) : 13;
      R(c, cx - hw - 2, y, hw * 2 + 4, 1, GOLD[2]);
      if (y > 65) R(c, cx - hw, y, hw * 2, 1, y < 80 ? "#203048" : "#7a5a30");
    }
    R(c, cx - 1, 80, 2, 22, "#4a3418"); for (var dy = 84; dy < 100; dy += 5) { R(c, cx - 10, dy, 7, 1, "#a07a40"); R(c, cx + 3, dy, 7, 1, "#a07a40"); }
    // the lower octagonal roof
    R(c, 52, 52, 104, 4, WH[2]);
    octRoof(c, cx, 34, 34, 60, 20, BLUE, 5);
    // drum and the pointed upper roof
    R(c, 70, 26, 68, 10, WH[1]); R(c, 70, 26, 10, 10, WH[0]); R(c, 128, 26, 10, 10, WH[2]);
    for (var wx = 84; wx < 126; wx += 8) R(c, wx, 29, 4, 5, BLUE[2]);
    octRoof(c, cx, 6, 2, 38, 22, BLUE, 4);
    // gold finial
    R(c, cx - 1, 0, 2, 8, GOLD[1]); R(c, cx - 3, 3, 6, 3, GOLD[1]); px(c, cx - 1, 3, GOLD[0]); R(c, cx - 2, 7, 4, 2, GOLD[2]);
  });

  S.arch = inked(function (c, w, h) {               // 自由廣場牌樓: five openings, each bay with its own blue roof
    var cx = w / 2;
    R(c, 2, 24, w - 4, h - 24, WH[1]); R(c, 2, 24, 3, h - 24, WH[0]); R(c, w - 5, 24, 3, h - 24, WH[2]);
    R(c, 2, h - 4, w - 4, 4, WH[2]);
    var bays = [[2, 22, 20], [24, 24, 12], [w - 48, 24, 12], [w - 24, 22, 20]];
    bays.forEach(function (b) {
      var ox = b[0] + 5, ow = b[1] - 10, oy = 32 + b[2] / 2;
      R(c, ox, oy + 3, ow, h - oy - 7, "#203050"); R(c, ox + 1, oy + 1, ow - 2, 2, "#203050"); R(c, ox + 1, h - 8, ow - 2, 2, "#304060");
      roof(c, b[0], 10 + b[2], b[1], 10, 3, BLUE, 3);
      R(c, b[0] + 1, 20 + b[2], b[1] - 2, 2, WH[2]);
    });
    R(c, cx - 15, 38, 30, h - 42, "#203050"); R(c, cx - 13, 34, 26, 4, "#203050"); R(c, cx - 14, h - 8, 28, 2, "#304060");
    roof(c, cx - 24, 2, 48, 14, 6, BLUE, 4);
    R(c, cx - 22, 16, 44, 18, WH[1]); plaque(c, cx - 13, 19, 26, 8);
    for (var p = 0; p < 5; p++) { var px0 = [2, 24, cx - 2, w - 48, w - 24][p]; R(c, px0, 26, 2, h - 30, WH[0]); }
  });

  function operaHall(c, w, h, gable) {              // 國家戲劇院、音樂廳: yellow double-eave roof on red columns
    var cx = w / 2, ROOF = ["#f8d870", "#e8a820", "#b87810", "#704808"];
    R(c, 0, h - 12, w, 12, WH[1]); R(c, 0, h - 12, w, 2, WH[0]); R(c, 0, h - 2, w, 2, WH[3]);
    rail(c, 2, h - 20, cx - 22, WH); rail(c, cx + 20, h - 20, cx - 22, WH);
    stairs(c, cx - 16, h - 14, 32, 14, WH);
    R(c, 10, 44, w - 20, h - 64, "#f4e8cc"); R(c, 10, 44, w - 20, 4, "#584038");
    for (var x = 14; x < w - 18; x += 13) { if (Math.abs(x + 2 - cx) < 12) continue; column(c, x, 46, 5, h - 66, REDP); }
    R(c, cx - 10, 54, 20, h - 74, GOLD[2]); R(c, cx - 8, 56, 16, h - 76, "#6a2418"); R(c, cx - 1, 56, 2, h - 76, GOLD[2]);
    brackets(c, 8, 40, w - 16, 5);
    roof(c, 3, 24, w - 6, 17, 10, ROOF, 5);
    R(c, 22, 16, w - 44, 9, "#2a6a7a"); for (var g = 24; g < w - 24; g += 6) R(c, g, 18, 3, 5, "#3c8a9a"); R(c, 22, 15, w - 44, 1, GOLD[1]);
    roof(c, 14, 2, w - 28, 15, 12, ROOF, 4);
    if (gable) { for (var i = 0; i < 8; i++) R(c, cx - i * 2, 4 + i, i * 4 + 1, 1, i === 7 ? ROOF[3] : ROOF[2]); }
    R(c, 24, 0, 3, 4, ROOF[3]); R(c, w - 27, 0, 3, 4, ROOF[3]);
  }
  S.theater = inked(function (c, w, h) { operaHall(c, w, h, false); });
  S.concert = inked(function (c, w, h) { operaHall(c, w, h, true); });

  // ---- 故宮 ---------------------------------------------------------------------------------
  S.npm = inked(function (c, w, h) {
    var cx = w / 2;
    // the long stairs up the hill
    R(c, 0, h - 10, w, 10, STONE[1]); R(c, 0, h - 10, w, 2, STONE[0]);
    rail(c, 2, h - 17, cx - 36, WH); rail(c, cx + 34, h - 17, cx - 36, WH);
    // two wings
    [[4, 66], [w - 70, 66]].forEach(function (s) {
      var x = s[0], ww = s[1];
      R(c, x, 66, ww, h - 76, CREAM[1]); R(c, x, 66, 3, h - 76, CREAM[0]); R(c, x + ww - 3, 66, 3, h - 76, CREAM[2]);
      R(c, x, 64, ww, 3, GOLD[1]);
      for (var wx = x + 6; wx < x + ww - 8; wx += 12) { R(c, wx, 74, 7, 10, CREAM[3]); R(c, wx + 1, 75, 5, 8, "#3a5878"); R(c, wx + 1, 75, 2, 3, "#88a8c8");
        R(c, wx, 92, 7, 10, CREAM[3]); R(c, wx + 1, 93, 5, 8, "#3a5878"); }
      roof(c, x - 4, 50, ww + 8, 15, 8, JADE, 4);
    });
    // the central block, a step forward and higher
    R(c, 58, 46, w - 116, h - 56, CREAM[1]); R(c, 58, 46, 4, h - 56, CREAM[0]); R(c, w - 62, 46, 4, h - 56, CREAM[2]);
    for (var p = 66; p < w - 66; p += 14) { if (Math.abs(p + 3 - cx) < 18) continue; column(c, p, 54, 6, h - 70, CREAM); }
    R(c, cx - 16, 66, 32, h - 82, GOLD[2]); R(c, cx - 14, 68, 28, h - 84, "#283048"); R(c, cx - 1, 68, 2, h - 84, GOLD[2]);
    R(c, 56, 44, w - 112, 3, GOLD[1]);
    roof(c, 48, 28, w - 96, 17, 12, JADE, 5);
    stairs(c, cx - 24, h - 14, 48, 14, WH);
    // the top pavilion
    R(c, cx - 30, 18, 60, 12, CREAM[1]); R(c, cx - 30, 18, 3, 12, CREAM[0]); R(c, cx + 27, 18, 3, 12, CREAM[2]);
    for (var t = cx - 24; t < cx + 24; t += 8) R(c, t, 21, 4, 7, "#3a5878");
    roof(c, cx - 40, 3, 80, 16, 14, JADE, 5);
    R(c, cx - 1, 0, 2, 3, GOLD[1]);
  });

  S.npm_arch = inked(function (c, w, h) {           // 天下為公 牌坊: four white pillars, three bays, jade roofs
    var cx = w / 2, pillars = [2, 34, w - 40, w - 8];
    R(c, 0, 22, w, 6, WH[1]); R(c, 0, 22, w, 1, WH[0]); R(c, 0, 27, w, 1, WH[2]);
    pillars.forEach(function (x) { column(c, x, 18, 6, h - 22, WH); R(c, x - 2, h - 6, 10, 6, WH[2]); R(c, x - 2, h - 6, 10, 1, WH[0]); });
    roof(c, 0, 12, 40, 10, 3, JADE, 3); roof(c, w - 40, 12, 40, 10, 3, JADE, 3);
    R(c, cx - 22, 10, 44, 12, WH[1]); plaque(c, cx - 14, 12, 28, 8);
    roof(c, cx - 26, 2, 52, 10, 4, JADE, 4);
  });

  // ---- 龍山寺 -------------------------------------------------------------------------------
  function ridgeDragon(c, x, y, len, dir) {          // a 剪黏 dragon of broken porcelain along a ridge
    for (var i = 0; i < len; i++) {
      var yy = y - Math.round(Math.sin(i / len * Math.PI * 2) * 2);
      R(c, x + i * dir, yy, 1, 3, i % 3 === 0 ? "#f0c030" : "#40b070");
      if (i % 4 === 1) px(c, x + i * dir, yy - 1, "#4888e0");
    }
    R(c, x + len * dir - (dir > 0 ? 0 : 3), y - 4, 4, 4, "#40b070"); px(c, x + len * dir + (dir > 0 ? 2 : -2), y - 3, C.red);
  }

  S.longshan = inked(function (c, w, h) {
    var cx = w / 2;
    // the main hall behind, with its own swallowtail roof
    A.swallowRoof(c, 30, 30, w - 60, 16, TEAL[1], TEAL[2], TEAL[3], true);
    ridgeDragon(c, cx - 50, 26, 30, 1); ridgeDragon(c, cx + 50, 26, 30, -1);
    // stone base and steps
    R(c, 6, h - 12, w - 12, 12, STONE[1]); R(c, 6, h - 12, w - 12, 2, STONE[0]); R(c, 6, h - 2, w - 12, 2, STONE[3]);
    stairs(c, cx - 30, h - 12, 60, 12, STONE);
    // the front hall: granite walls with carved windows, five doors
    R(c, 14, 72, w - 28, h - 84, STONE[0]);
    for (var by = 76; by < h - 12; by += 6) R(c, 14, by, w - 28, 1, STONE[1]);
    [[22, 28], [w - 50, 28]].forEach(function (s) {   // round carved windows on the outer bays
      disc(c, s[0] + 14, 96, 11, STONE[2]); disc(c, s[0] + 14, 96, 9, "#4a3024");
      for (var j = -6; j <= 6; j += 3) { R(c, s[0] + 5, 96 + j, 18, 1, "#a87848"); R(c, s[0] + 14 + j, 87, 1, 18, "#a87848"); }
    });
    A.hall(c, cx - 30, 78, 60, h - 90, REDP[2], REDP[1], true);
    [[cx - 78, 40], [cx + 38, 40]].forEach(function (s) {
      R(c, s[0], 82, s[1], h - 94, REDP[2]); R(c, s[0] + 2, 84, s[1] - 4, h - 98, "#6a2418");
      R(c, s[0] + s[1] / 2 - 1, 84, 2, h - 98, GOLD[2]); for (var i = s[0] + 4; i < s[0] + s[1] - 4; i += 5) R(c, i, 86, 2, 2, GOLD[1]);
    });
    // bronze dragon pillars
    [cx - 36, cx + 30, cx - 86, cx + 80].forEach(function (x) {
      R(c, x, 74, 7, h - 86, "#4a3a20"); R(c, x, 74, 2, h - 86, "#7a6238");
      for (var y = 78; y < h - 14; y += 7) { R(c, x - 1, y, 9, 3, "#3a8a58"); px(c, x + 1, y, GOLD[1]); px(c, x + 5, y + 2, GOLD[1]); }
      R(c, x - 2, h - 15, 11, 3, STONE[2]);
    });
    A.lanterns(c, cx - 70, 70, 4, 44);
    // the front roofs: the middle bay rises above the two sides (三川脊)
    A.swallowRoof(c, 10, 60, cx - 36, 12, TEAL[1], TEAL[2], TEAL[3], false);
    A.swallowRoof(c, cx + 26, 60, cx - 36, 12, TEAL[1], TEAL[2], TEAL[3], false);
    A.swallowRoof(c, cx - 40, 52, 80, 16, TEAL[1], TEAL[2], TEAL[3], false);
    ridgeDragon(c, cx - 30, 48, 22, 1); ridgeDragon(c, cx + 30, 48, 22, -1);
    // the little pagoda on the middle ridge
    for (var s = 0; s < 4; s++) { R(c, cx - 5 + s, 44 - s * 4, 10 - s * 2, 3, s % 2 ? GOLD[1] : C.red); R(c, cx - 6 + s, 43 - s * 4, 12 - s * 2, 1, "#40b070"); }
    R(c, cx - 1, 26, 2, 4, GOLD[1]);
    plaque(c, cx - 12, 66, 24, 8);
  });

  // ---- 高雄流行音樂中心（光榮碼頭・真愛碼頭）--------------------------------------------------
  S.music_tower = inked(function (c, w, h, f) {     // 海音館: a leaning stack of hexagonal cells
    // rows from the bottom: [cells, left edge]; it bulges out above the middle and leans a little
    var rows = [[2, 30], [3, 21], [3, 30], [4, 12], [4, 21], [4, 12], [3, 21], [2, 21]];
    var lit = ["#f05040", "#f89030", "#5080f0", "#f05040"], cells = [], n = 0, r, i;
    R(c, 18, h - 8, w - 36, 8, "#a8a8b0"); R(c, 18, h - 8, w - 36, 2, "#d0d0d8");
    for (r = 0; r < rows.length; r++) for (i = 0; i < rows[r][0]; i++) cells.push([rows[r][1] + i * 18 + 10, h - 20 - r * 14, r, i]);
    cells.forEach(function (p) {                    // the white steel frame first, so neighbours share their edges
      for (var y = -9; y <= 9; y++) { var hw = Math.round(11 - Math.abs(y) * .55); R(c, p[0] - hw, p[1] + y, hw * 2, 1, Math.abs(y) > 7 ? "#c8ccd4" : "#f4f4f8"); }
    });
    cells.forEach(function (p) {
      n++;
      var on = (n * 7 + p[2]) % 5 === 0 ? lit[(n + (f || 0)) % 4] : null;
      var right = p[0] > w / 2 + 10, glass = on || (right ? "#6890b8" : n % 3 ? "#a0c8e8" : "#88b8e0");
      hexWin(c, p[0], p[1], 7, glass, on ? "#f8e8a0" : right ? "#c0d0e0" : null);
    });
    R(c, 34, h - 12, 3, 6, "#787880"); R(c, 58, h - 12, 3, 6, "#787880");
  });

  S.whale_hall = inked(function (c, w, h) {         // 鯨魚堤岸: a long white roof folded into triangles, sloping like a wave
    var base = h - 26;
    for (var x = 0; x < w; x++) {
      var top = Math.round(4 + 20 * Math.pow(x / w, 1.4) + 3 * Math.sin(x / 15));
      for (var y = top; y < base; y++) {
        var fx = (x % 16) / 16, fy = (y - top) / Math.max(1, base - top), light = (Math.floor(x / 16) % 2 ? fx > fy : fx < 1 - fy);
        px(c, x, y, y === top ? "#a8acb8" : light ? "#f8f8fc" : "#d0d4dc");
      }
    }
    R(c, 0, base, w, 2, "#a8acb8");
    R(c, 2, base + 2, w - 4, h - base - 6, "#384858");
    for (var g = 4; g < w - 6; g += 10) { R(c, g + 1, base + 4, 8, h - base - 10, "#f0e0a0"); R(c, g + 1, base + 4, 3, h - base - 10, "#f8f0c8"); }
    for (var s = 0; s < w - 8; s += 20) for (var k = 0; k < h - base - 6; k++) px(c, s + 4 + Math.round(k * .6), base + 2 + k, "#c8ccd8");
    R(c, 0, h - 4, w, 4, "#a8a8b0"); R(c, 0, h - 4, w, 1, "#d0d0d8");
  });

  A.GLOW_STAMP.music_tower = 1;

  // overworld minis
  var L = A.LANDMARK;
  L.kaohsiung = ["music_tower", 6, 8];
})(Art);
