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

  function templeFront(c, w, h, P) {             // 三川殿 front: raised middle roof, bronze dragon pillars, five doors
    var cx = w / 2;
    // the main hall behind, with its own swallowtail roof
    A.swallowRoof(c, 30, 30, w - 60, 16, P[1], P[2], P[3], true);
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
    A.swallowRoof(c, 10, 60, cx - 36, 12, P[1], P[2], P[3], false);
    A.swallowRoof(c, cx + 26, 60, cx - 36, 12, P[1], P[2], P[3], false);
    A.swallowRoof(c, cx - 40, 52, 80, 16, P[1], P[2], P[3], false);
    ridgeDragon(c, cx - 30, 48, 22, 1); ridgeDragon(c, cx + 30, 48, 22, -1);
    // the little pagoda on the middle ridge
    for (var s = 0; s < 4; s++) { R(c, cx - 5 + s, 44 - s * 4, 10 - s * 2, 3, s % 2 ? GOLD[1] : C.red); R(c, cx - 6 + s, 43 - s * 4, 12 - s * 2, 1, "#40b070"); }
    R(c, cx - 1, 26, 2, 4, GOLD[1]);
    plaque(c, cx - 12, 66, 24, 8);
  }
  S.longshan = inked(function (c, w, h) { templeFront(c, w, h, TEAL); });
  S.zhenlan = inked(function (c, w, h) { templeFront(c, w, h, ["#f0a050", "#e07828", "#a84818", "#6a2808"]); });


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

  // ---- 大巨蛋 ---------------------------------------------------------------------------------
  S.bigdome = inked(function (c, w, h) {           // a low silver ellipse in stepped rings, on a ring of glass
    var cx = w / 2, base = h - 30, rx = w / 2 - 12, ry = base - 10, y, x;
    // facade: white piers and glass
    R(c, 18, base, w - 36, h - base, WH[1]); R(c, 18, base, w - 36, 2, WH[0]); R(c, 18, h - 3, w - 36, 3, WH[3]);
    for (x = 26; x < w - 30; x += 16) { R(c, x + 5, base + 6, 10, h - base - 12, "#4a6278"); R(c, x + 6, base + 7, 3, h - base - 14, "#8ab0c8"); column(c, x, base + 4, 4, h - base - 7, WH); }
    R(c, cx - 22, base + 4, 44, h - base - 7, "#283848"); R(c, cx - 26, base + 2, 52, 4, WH[0]); R(c, cx - 1, base + 6, 2, h - base - 9, "#5878a0");
    R(c, 10, base - 6, w - 20, 7, "#384858"); for (x = 12; x < w - 12; x += 6) R(c, x, base - 5, 3, 4, "#6888a8");
    // the dome, row by row
    for (y = 0; y < ry; y++) {
      var t = 1 - y / ry, hw = Math.round(rx * Math.sqrt(1 - t * t)), yy = base - 6 - ry + y;
      if (hw < 1) continue;
      var ring = y % 12 === 11;
      R(c, cx - hw, yy, hw * 2, 1, ring ? "#9ca0b0" : "#c8ccd8");
      R(c, cx - hw, yy, Math.round(hw * .55), 1, ring ? "#b8bcc8" : "#e4e8f0");
      R(c, cx + Math.round(hw * .5), yy, hw - Math.round(hw * .5), 1, ring ? "#7c8090" : "#a8acbc");
      [-.8, -.5, -.2, .2, .5, .8].forEach(function (s) { px(c, Math.round(cx + hw * s), yy, "#9498a8"); });
    }
    disc(c, cx - 50, base - 6 - ry + 22, 6, "#f8f8fc");                 // a glint of sun
    R(c, cx - 20, base - 8 - ry, 40, 4, "#a8acbc");                       // the flat crown
  });

  // ---- 國立臺灣博物館 ---------------------------------------------------------------------------
  S.ntm_front = inked(function (c, w, h) {         // Doric portico, pediment and a dome over two long wings
    var cx = w / 2, IV = ["#fffcf0", "#f0e8d4", "#cfc4a8", "#9a8e74"];
    R(c, 0, h - 18, w, 18, STONE[1]); R(c, 0, h - 18, w, 2, STONE[0]); R(c, 0, h - 2, w, 2, STONE[3]);
    stairs(c, cx - 40, h - 18, 80, 18, WH);
    [[4, 92], [w - 96, 92]].forEach(function (s) {
      var x = s[0], ww = s[1];
      R(c, x, 52, ww, h - 70, IV[1]); R(c, x, 52, 3, h - 70, IV[0]); R(c, x + ww - 3, 52, 3, h - 70, IV[2]);
      R(c, x - 2, 46, ww + 4, 6, IV[0]); R(c, x - 2, 51, ww + 4, 1, IV[3]); rail(c, x, 38, ww, IV);
      for (var wx = x + 8; wx < x + ww - 10; wx += 16) {
        R(c, wx, 60, 9, 22, IV[3]); R(c, wx + 1, 63, 7, 18, "#486078"); disc(c, wx + 4, 63, 3, "#486078"); R(c, wx + 1, 64, 2, 6, "#90b0c8");
        R(c, wx, 92, 9, 18, IV[3]); R(c, wx + 1, 93, 7, 16, "#486078");
      }
      R(c, x, 86, ww, 2, IV[2]);
    });
    // the dome on its drum
    R(c, cx - 30, 26, 60, 20, IV[1]); R(c, cx - 30, 26, 6, 20, IV[0]); R(c, cx + 24, 26, 6, 20, IV[2]);
    for (var d = cx - 24; d < cx + 22; d += 8) { R(c, d, 30, 4, 12, "#486078"); disc(c, d + 2, 30, 2, "#486078"); }
    for (var y = 0; y < 22; y++) {
      var t = 1 - y / 22, hw = Math.round(34 * Math.sqrt(1 - t * t));
      R(c, cx - hw, 4 + y, hw * 2, 1, "#a8c0b8"); R(c, cx - hw, 4 + y, Math.round(hw * .6), 1, "#c8dcd4"); R(c, cx + Math.round(hw * .45), 4 + y, hw - Math.round(hw * .45), 1, "#789890");
      if (y % 6 === 5) R(c, cx - hw, 4 + y, hw * 2, 1, "#789890");
    }
    R(c, cx - 4, 0, 8, 6, IV[1]); R(c, cx - 1, -1, 2, 2, GOLD[1]);
    // portico: six columns under a pediment
    R(c, cx - 50, 62, 100, h - 80, "#a89878");
    for (var i = 0; i < 6; i++) column(c, cx - 46 + i * 18, 66, 8, h - 84, IV);
    R(c, cx - 2, 90, 4, h - 108, "#4a3a28");
    R(c, cx - 54, 56, 108, 8, IV[0]); R(c, cx - 54, 63, 108, 1, IV[3]); for (var g = cx - 52; g < cx + 52; g += 6) R(c, g, 58, 3, 3, IV[2]);
    for (var p = 0; p < 16; p++) R(c, cx - 56 + Math.round(p * 3.5), 56 - p, 112 - Math.round(p * 3.5) * 2, 1, p === 15 ? IV[3] : IV[0]);
    for (p = 2; p < 14; p++) R(c, cx - 50 + Math.round(p * 3.5), 56 - p, 100 - Math.round(p * 3.5) * 2, 1, IV[1]);
    disc(c, cx, 49, 3, IV[2]);
  });

  // ---- 西門紅樓 ---------------------------------------------------------------------------------
  function bricks(c, x, y, w, h, B) {
    R(c, x, y, w, h, B[1]);
    for (var j = 0; j < h; j += 4) { R(c, x, y + j + 3, w, 1, B[2]); for (var i = (j / 4) % 2 ? 2 : 6; i < w; i += 8) px(c, x + i, y + j, B[2]); }
  }
  S.ximen_red = inked(function (c, w, h) {
    var B = ["#e07850", "#b84830", "#883020", "#5a1c10"], WT = WH;
    // the cross-shaped hall behind
    bricks(c, 82, 40, w - 86, h - 44, B); R(c, 82, 40, w - 86, 3, WT[1]); R(c, 82, 70, w - 86, 3, WT[1]);
    for (var x = 90; x < w - 10; x += 14) { R(c, x, 48, 8, 14, WT[1]); R(c, x + 1, 51, 6, 10, "#486078"); disc(c, x + 4, 51, 3, "#486078"); }
    roof(c, 80, 26, w - 82, 14, 8, ["#8890a0", "#606878", "#485060", "#303848"], 2);
    // the octagon: a lit face, the front, a shaded face
    var L0 = 10, F0 = 28, F1 = 66, R1 = 84, top = 32;
    bricks(c, L0, top, F0 - L0, h - top - 4, ["#f09068", "#d06040", "#a03828", "#6a2010"]);
    bricks(c, F0, top, F1 - F0, h - top - 4, B);
    bricks(c, F1, top, R1 - F1, h - top - 4, ["#a04028", "#882818", "#681810", "#401008"]);
    [top, top + 26, h - 10].forEach(function (y) { R(c, L0, y, R1 - L0, 3, WT[1]); R(c, F1, y, R1 - F1, 3, WT[2]); });
    [[F0 + 6, top + 8], [F0 + 24, top + 8], [F0 + 6, top + 36], [F0 + 24, top + 36]].forEach(function (p) {
      R(c, p[0] - 1, p[1] - 2, 10, 18, WT[1]); R(c, p[0], p[1], 8, 15, "#486078"); disc(c, p[0] + 4, p[1], 4, WT[1]); disc(c, p[0] + 4, p[1] + 1, 3, "#486078"); R(c, p[0] + 1, p[1] + 2, 2, 6, "#90b0c8");
    });
    R(c, L0 + 5, top + 10, 8, 12, "#486078"); R(c, F1 + 5, top + 10, 8, 12, "#2a3848");
    R(c, F0 + 12, h - 30, 14, 20, WT[1]); R(c, F0 + 14, h - 28, 10, 18, "#3a2418");
    // the octagonal roof and its lantern
    octRoof(c, (L0 + R1) / 2, 16, 14, 40, 16, ["#8890a0", "#606878", "#485060", "#303848"], 3);
    R(c, 39, 6, 16, 10, WT[1]); R(c, 39, 6, 4, 10, WT[0]); R(c, 51, 6, 4, 10, WT[2]); R(c, 43, 9, 8, 5, "#486078");
    octRoof(c, 47, 0, 2, 11, 7, ["#8890a0", "#606878", "#485060", "#303848"], 1);
  });

  // ---- 天文館 -----------------------------------------------------------------------------------
  S.astro_hall = inked(function (c, w, h) {        // a white sphere on a long curved hall, an observatory dome beside it
    var cx = w / 2, base = h - 44;
    R(c, 10, base, w - 20, 44, WH[1]); R(c, 10, base, w - 20, 3, WH[0]); R(c, w - 22, base, 12, 44, WH[2]); R(c, 10, h - 3, w - 20, 3, WH[3]);
    R(c, 14, base + 10, w - 28, 10, "#3a5a88"); for (var g = 16; g < w - 16; g += 8) R(c, g, base + 11, 4, 3, "#90b8e0");
    R(c, cx - 16, h - 24, 32, 24, "#283848"); R(c, cx - 20, h - 27, 40, 4, WH[0]); R(c, cx - 1, h - 22, 2, 22, "#5878a0");
    // big sphere
    var r = 42, cy = base - 22;
    for (var y = -r; y <= r; y++) {
      if (cy + y > base) break;
      var hw = Math.round(Math.sqrt(r * r - y * y)), yy = cy + y;
      R(c, cx - hw, yy, hw * 2, 1, "#d8dce8");
      R(c, cx - hw, yy, Math.round(hw * (y < 0 ? .9 : .6)), 1, "#f0f2f8");
      R(c, cx + Math.round(hw * .45), yy, hw - Math.round(hw * .45), 1, "#a8aec0");
      [-.66, -.33, 0, .33, .66].forEach(function (s) { px(c, Math.round(cx + hw * s), yy, "#b8bccc"); });
      if ((y + r) % 10 === 9) R(c, cx - hw, yy, hw * 2, 1, "#b8bccc");
    }
    disc(c, cx - 16, cy - 20, 5, "#ffffff");
    // observatory dome with its slit
    var ox = 38, oy = base;
    for (var j = 0; j < 18; j++) { var ow = Math.round(Math.sqrt(324 - (17 - j) * (17 - j))); R(c, ox - ow, oy - 18 + j, ow * 2, 1, j % 6 === 5 ? WH[2] : WH[1]); R(c, ox - ow, oy - 18 + j, Math.round(ow * .6), 1, WH[0]); }
    R(c, ox - 2, oy - 18, 4, 16, "#283848");
    R(c, ox - 20, oy - 2, 40, 3, WH[2]);
  });

  // ---- 東海路思義教堂 ---------------------------------------------------------------------------
  S.luce = inked(function (c, w, h) {              // four curved shells of yellow diamond tiles, a skylight slit on top
    var cx = w / 2, top = 2, bot = h - 12;
    R(c, 0, h - 12, w, 12, "#88c060"); R(c, 0, h - 12, w, 2, "#a8d878");
    for (var y = top; y < bot; y++) {
      var k = (y - top) / (bot - top), hw = Math.round(6 + (w / 2 - 14) * Math.pow(k, 2.1));
      for (var x = cx - hw; x < cx + hw; x++) {
        var left = x < cx, dia = ((x + y) % 7 === 0) || ((x - y + 700) % 7 === 0);
        px(c, x, y, dia ? (left ? "#b89018" : "#8a6a10") : left ? (k < .5 ? "#f8d850" : "#e8c040") : (k < .5 ? "#d8b030" : "#c09820"));
      }
      if (hw > 8) { px(c, cx - hw, y, "#fff0a0"); px(c, cx + hw - 1, y, "#705008"); }
    }
    R(c, cx - 1, top, 2, bot - top - 26, "#d8f0f8");
    R(c, cx - 9, bot - 26, 18, 26, "#4a3020"); R(c, cx - 7, bot - 24, 14, 24, "#6a4428"); R(c, cx - 1, bot - 24, 2, 24, "#4a3020");
    R(c, 12, bot - 4, w - 24, 4, STONE[1]);
  });

  // ---- 赤崁樓 -----------------------------------------------------------------------------------
  S.chihkan = inked(function (c, w, h) {           // 海神廟 and 文昌閣 on a high brick terrace with arches
    var B = ["#e07850", "#b84830", "#883020", "#5a1c10"], ROOF = ["#f09060", "#c85a30", "#904020", "#582010"];
    bricks(c, 0, h - 40, w, 40, B); R(c, 0, h - 40, w, 3, B[0]);
    [20, w - 44].forEach(function (x) { R(c, x, h - 26, 24, 26, "#2a1810"); disc(c, x + 12, h - 26, 12, "#2a1810"); R(c, x, h - 29, 24, 1, B[0]); });
    stairs(c, w / 2 - 18, h - 40, 36, 40, STONE);
    rail(c, 0, h - 48, w / 2 - 22, WH); rail(c, w / 2 + 20, h - 48, w / 2 - 20, WH);
    [[6, 84, 0], [w - 92, 86, 1]].forEach(function (p) {
      var x = p[0], ww = p[1], tall = p[2];
      R(c, x + 6, 44, ww - 12, h - 92, REDP[1]);
      for (var q = x + 8; q < x + ww - 8; q += 14) column(c, q, 46, 4, h - 94, REDP);
      R(c, x + ww / 2 - 9, 56, 18, h - 104, "#5a1c10"); R(c, x + ww / 2 - 7, 58, 14, h - 106, "#8a3420"); R(c, x + ww / 2, 58, 1, h - 106, GOLD[2]);
      A.swallowRoof(c, x, 30, ww, 14, ROOF[1], ROOF[2], ROOF[3], false);
      R(c, x + 16, 20, ww - 32, 10, REDP[1]); for (var l = x + 20; l < x + ww - 20; l += 8) R(c, l, 22, 4, 6, "#5a1c10");
      A.swallowRoof(c, x + 10, 8 - tall * 4, ww - 20, 12 + tall * 2, ROOF[1], ROOF[2], ROOF[3], true);
    });
  });

  // ---- 美麗華摩天輪 ------------------------------------------------------------------------------
  S.ferris = inked(function (c, w, h, f) {
    var cx = w / 2, cy = h / 2 - 8, r = Math.min(w, h) / 2 - 18, a = (f || 0) * .13, i, t;
    for (t = 0; t < h - cy; t++) { R(c, Math.round(cx - 3 - t * .45), cy + t, 4, 1, "#c8ccd8"); R(c, Math.round(cx - 1 + t * .45), cy + t, 4, 1, "#9ca0b0"); }
    R(c, cx - 34, h - 6, 68, 6, STONE[1]); R(c, cx - 34, h - 6, 68, 1, STONE[0]);
    for (i = 0; i < 16; i++) {
      var d = i / 16 * 6.283 + a;
      for (t = 4; t < r; t += 2) px(c, Math.round(cx + Math.cos(d) * t), Math.round(cy + Math.sin(d) * t), "#d0d4e0");
    }
    for (i = 0; i < 240; i++) {
      var b = i / 240 * 6.283, x = Math.round(cx + Math.cos(b) * r), y = Math.round(cy + Math.sin(b) * r);
      R(c, x - 1, y - 1, 3, 3, Math.cos(b - 2.3) > 0 ? "#f05868" : "#c02838");
    }
    var cols = ["#f05868", "#f0c030", "#3c78d8", "#40b070", "#f8f8f8"];
    for (i = 0; i < 16; i++) {
      var e = i / 16 * 6.283 + a, gx = Math.round(cx + Math.cos(e) * r), gy = Math.round(cy + Math.sin(e) * r);
      R(c, gx - 4, gy + 1, 8, 8, cols[i % 5]); R(c, gx - 3, gy + 2, 6, 3, "#c8e8f8"); R(c, gx, gy - 1, 1, 2, "#606878");
    }
    disc(c, cx, cy, 6, "#f0c030"); disc(c, cx, cy, 3, "#b88818");
  });

  S.mall = inked(function (c, w, h) {              // 美麗華百樂園: the mall under the wheel
    R(c, 0, 10, w, h - 10, "#e8e0d8"); R(c, 0, 10, 3, h - 10, "#f8f4f0"); R(c, w - 4, 10, 4, h - 10, "#c0b8b0");
    R(c, 0, 4, w, 12, "#d03040"); R(c, 0, 4, w, 2, "#f06070"); R(c, 0, 15, w, 2, "#901828");
    for (var l = 8; l < w - 8; l += 7) R(c, l, 8, 4, 5, "#f8f0e0");
    for (var y = 24; y < h - 34; y += 18) for (var x = 8; x < w - 12; x += 14) {
      R(c, x, y, 10, 12, "#a09890"); R(c, x + 1, y + 1, 8, 10, "#5878a0"); R(c, x + 1, y + 1, 3, 4, "#a8c8e8");
    }
    R(c, 0, h - 30, w, 30, "#88b0d0"); for (var g = 4; g < w; g += 12) R(c, g, h - 28, 1, 28, "#5878a0");
    R(c, 0, h - 32, w, 3, "#d03040"); R(c, w / 2 - 14, h - 26, 28, 26, "#283848"); R(c, w / 2 - 1, h - 24, 2, 24, "#5878a0");
  });

  // ---- shared parts for the Japanese-era buildings ----------------------------------------------
  var SLATE = ["#9098a8", "#606878", "#485060", "#303848"], WOOD = ["#c89060", "#8a5a30", "#603818", "#3a2010"];
  var BRICK = ["#e07850", "#b84830", "#883020", "#5a1c10"], PLASTER = ["#fffaf0", "#f0e6d0", "#d0c4a8", "#a09478"];
  function sash(c, x, y, w, h, frame) {                // a white-framed sash window with a highlight
    R(c, x, y, w, h, frame || WH[1]); R(c, x + 1, y + 1, w - 2, h - 2, "#486078");
    R(c, x + 1, y + Math.floor(h / 2), w - 2, 1, frame || WH[1]); R(c, x + Math.floor(w / 2), y + 1, 1, h - 2, frame || WH[1]);
    R(c, x + 1, y + 1, 2, 3, "#90b0c8");
  }
  function arched(c, x, y, w, h, frame) {              // round-topped window or arcade opening
    var r = Math.floor(w / 2);
    disc(c, x + r, y + r, r, frame); R(c, x, y + r, w, h - r, frame);
    disc(c, x + r, y + r, r - 1, "#486078"); R(c, x + 1, y + r, w - 2, h - r - 1, "#486078"); R(c, x + 2, y + r, 2, 4, "#90b0c8");
  }
  function timber(c, x, y, w, h) {                     // half-timbering: white plaster between dark beams
    R(c, x, y, w, h, PLASTER[1]); R(c, x, y, w, 2, WOOD[3]); R(c, x, y + h - 2, w, 2, WOOD[3]);
    for (var i = x; i < x + w; i += 16) {
      R(c, i, y, 2, h, WOOD[3]);
      for (var t = 0; t < h - 2 && t < 14; t++) px(c, i + 2 + Math.round(t * 14 / Math.max(1, h - 2)), y + 2 + t, WOOD[3]);
    }
  }

  // ---- 北投 -------------------------------------------------------------------------------------
  S.beitou_station = inked(function (c, w, h) {    // 新北投車站: a little wooden station under a slate hip roof with a gable
    R(c, 6, h - 8, w - 12, 8, STONE[1]); R(c, 6, h - 8, w - 12, 1, STONE[0]);
    R(c, 12, 44, w - 24, h - 52, "#f0dcb0");
    for (var b = 14; b < w - 12; b += 4) R(c, b, 44, 1, h - 52, "#d8c090");
    for (var p = 12; p < w - 10; p += 22) R(c, p, 44, 4, h - 52, WOOD[2]);
    R(c, 12, 44, w - 24, 3, WOOD[2]); R(c, 12, 70, w - 24, 2, WOOD[2]);
    [22, 44, w - 66, w - 44].forEach(function (x) { sash(c, x, 50, 14, 16); });
    R(c, w / 2 - 14, 56, 28, h - 64, WOOD[3]); R(c, w / 2 - 12, 58, 24, h - 66, "#e8d0a0"); R(c, w / 2 - 1, 58, 2, h - 66, WOOD[3]);
    R(c, w / 2 - 22, 50, 44, 6, SLATE[1]); R(c, w / 2 - 22, 50, 44, 1, SLATE[0]);
    roof(c, 4, 18, w - 8, 26, 26, SLATE, 3);
    for (var g = 0; g < 16; g++) R(c, w / 2 - g * 2, 8 + g, g * 4 + 1, 1, g === 15 ? WOOD[3] : PLASTER[1]);      // front gable
    R(c, w / 2 - 6, 14, 12, 6, WOOD[2]); R(c, w / 2 - 5, 15, 10, 4, PLASTER[0]);
    for (g = 0; g < 18; g++) { px(c, w / 2 - 2 - g * 2, 6 + g, SLATE[3]); px(c, w / 2 - 3 - g * 2, 6 + g, SLATE[3]); px(c, w / 2 + 1 + g * 2, 6 + g, SLATE[3]); px(c, w / 2 + 2 + g * 2, 6 + g, SLATE[3]); }
  });

  S.hotspring_museum = inked(function (c, w, h) {  // 北投溫泉博物館: brick arcade below, half-timbered upper floor
    R(c, 4, 58, w - 8, h - 58, BRICK[1]);
    for (var j = 60; j < h; j += 4) R(c, 4, j + 3, w - 8, 1, BRICK[2]);
    for (var a = 10; a < w - 20; a += 22) arched(c, a, 66, 16, h - 66, PLASTER[1]);
    R(c, 4, 56, w - 8, 3, PLASTER[0]);
    timber(c, 8, 30, w - 16, 26);
    for (var wx = 18; wx < w - 22; wx += 26) sash(c, wx, 36, 12, 14, WOOD[2]);
    roof(c, 2, 10, w - 4, 21, 18, SLATE, 3);
    for (var g = 0; g < 12; g++) R(c, w - 44 + g, 18 - g, 30 - g * 2, 1, g === 11 ? WOOD[3] : PLASTER[1]);   // the gable at the east end
    R(c, w - 32, 10, 6, 6, WOOD[2]);
  });

  // ---- 南門館 -----------------------------------------------------------------------------------
  S.redhouse = inked(function (c, w, h) {          // 南門工場紅樓: red brick, white bands, arched windows, slate roof
    bricks(c, 4, 18, w - 8, h - 18, BRICK);
    [18, 58, h - 4].forEach(function (y) { R(c, 4, y, w - 8, 3, PLASTER[1]); });
    for (var x = 14; x < w - 20; x += 20) { arched(c, x, 26, 12, 26, PLASTER[1]); if (Math.abs(x + 6 - w / 2) > 12) arched(c, x, 66, 12, h - 74, PLASTER[1]); }
    R(c, w / 2 - 12, h - 34, 24, 30, PLASTER[1]); R(c, w / 2 - 10, h - 32, 20, 28, WOOD[3]); R(c, w / 2 - 1, h - 32, 2, 28, WOOD[2]);
    roof(c, 0, 4, w, 15, 10, SLATE, 2);
  });

  S.whitehouse = inked(function (c, w, h) {        // 小白宮: white two-storey veranda house
    R(c, 6, 16, w - 12, h - 16, PLASTER[0]); R(c, w - 18, 16, 12, h - 16, PLASTER[2]);
    for (var x = 10; x < w - 20; x += 18) { arched(c, x, 22, 12, 18, PLASTER[1]); arched(c, x, 52, 12, h - 56, PLASTER[1]); }
    R(c, 6, 44, w - 12, 4, PLASTER[2]); rail(c, 6, 40, w - 12, WH);
    R(c, 6, h - 3, w - 12, 3, PLASTER[3]);
    roof(c, 0, 2, w, 15, 12, ["#88b0a8", "#5a8880", "#3e6a62", "#284840"], 2);
  });

  // ---- 鐵道部 -----------------------------------------------------------------------------------
  S.railhall = inked(function (c, w, h) {          // 鐵道部本館: brick ground floor, half-timbered floor above, towers at both ends
    bricks(c, 4, 62, w - 8, h - 62, BRICK); R(c, 4, 60, w - 8, 3, PLASTER[0]);
    for (var x = 14; x < w - 20; x += 22) if (Math.abs(x + 6 - w / 2) > 14) arched(c, x, 70, 12, 26, PLASTER[1]);
    R(c, w / 2 - 14, 72, 28, h - 72, PLASTER[1]); R(c, w / 2 - 12, 74, 24, h - 74, WOOD[3]); R(c, w / 2 - 1, 74, 2, h - 74, WOOD[2]);
    timber(c, 8, 34, w - 16, 26);
    for (var wx = 30; wx < w - 34; wx += 24) sash(c, wx, 40, 12, 14, WOOD[2]);
    roof(c, 4, 14, w - 8, 21, 16, SLATE, 2);
    for (var d = 44; d < w - 50; d += 40) { R(c, d, 18, 12, 10, PLASTER[1]); R(c, d + 2, 21, 8, 6, "#486078"); roof(c, d - 2, 12, 16, 7, 6, SLATE, 0); }   // dormers
    [[4, 34], [w - 38, 34]].forEach(function (t) {
      bricks(c, t[0], 30, t[1], h - 30, BRICK); timber(c, t[0] + 2, 34, t[1] - 4, 24); sash(c, t[0] + 11, 40, 12, 14, WOOD[2]);
      octRoof(c, t[0] + t[1] / 2, 4, 1, t[1] / 2 + 3, 27, SLATE, 2);
      R(c, t[0] + t[1] / 2 - 1, 0, 2, 5, SLATE[3]);
    });
  });

  S.octagon = inked(function (c, w, h) {           // 八角樓: an octagonal brick pavilion with a vented crown
    var cx = w / 2;
    bricks(c, 12, 30, 16, h - 30, ["#f09068", "#d06040", "#a03828", "#6a2010"]);
    bricks(c, 28, 30, 24, h - 30, BRICK);
    bricks(c, 52, 30, 16, h - 30, ["#a04028", "#882818", "#681810", "#401008"]);
    R(c, 12, 30, 56, 3, PLASTER[1]); R(c, 12, h - 4, 56, 4, STONE[1]);
    arched(c, 34, 40, 12, 22, PLASTER[1]); arched(c, 16, 42, 8, 14, PLASTER[1]);
    R(c, cx - 5, h - 20, 10, 16, WOOD[3]);
    octRoof(c, cx, 14, 10, 32, 17, SLATE, 2);
    R(c, cx - 8, 4, 16, 10, PLASTER[1]); for (var v = cx - 6; v < cx + 6; v += 3) R(c, v, 6, 2, 6, SLATE[3]);
    octRoof(c, cx, 0, 1, 10, 6, SLATE, 0);
  });

  // ---- 台南：孔廟、林百貨 --------------------------------------------------------------------------
  S.confucius = inked(function (c, w, h) {          // 大成殿: red walls on a white base, double eaves, the 通天筒 on the ridge
    var cx = w / 2, ROOF = ["#e88850", "#b85028", "#883818", "#501808"];
    R(c, 6, h - 14, w - 12, 14, WH[1]); R(c, 6, h - 14, w - 12, 2, WH[0]); R(c, 6, h - 2, w - 12, 2, WH[3]);
    rail(c, 8, h - 22, cx - 30, WH); rail(c, cx + 22, h - 22, cx - 30, WH); stairs(c, cx - 18, h - 14, 36, 14, WH);
    R(c, 16, 60, w - 32, h - 82, REDP[1]); R(c, 16, 60, 3, h - 82, REDP[0]); R(c, w - 19, 60, 3, h - 82, REDP[2]);
    for (var x = 20; x < w - 24; x += 18) if (Math.abs(x + 2 - cx) > 16) column(c, x, 62, 5, h - 84, REDP);
    for (var lx = 30; lx < w - 40; lx += 36) if (Math.abs(lx + 8 - cx) > 24) { R(c, lx, 72, 16, 18, "#5a1c10"); for (var k = 0; k < 16; k += 3) R(c, lx + k, 73, 1, 16, "#c89058"); }
    R(c, cx - 14, 68, 28, h - 90, GOLD[2]); R(c, cx - 12, 70, 24, h - 92, "#6a2418"); R(c, cx - 1, 70, 2, h - 92, GOLD[2]);
    brackets(c, 14, 54, w - 28, 6);
    roof(c, 4, 36, w - 8, 19, 12, ROOF, 5);
    R(c, 32, 26, w - 64, 11, REDP[1]); plaque(c, cx - 16, 27, 32, 8);
    roof(c, 22, 10, w - 44, 17, 16, ROOF, 5);
    [cx - 44, cx + 40].forEach(function (x) { R(c, x, 0, 4, 9, "#3a8a58"); R(c, x - 1, 0, 6, 2, GOLD[1]); });      // 通天筒
  });

  S.hayashi = inked(function (c, w, h) {           // 林百貨: five floors, a rounded corner, a little shrine on the roof
    var T = ["#fff0d8", "#e8d4b0", "#c8b088", "#8a7454"];
    R(c, 6, 20, w - 12, h - 20, T[1]); R(c, 6, 20, 14, h - 20, T[0]); R(c, w - 18, 20, 12, h - 20, T[2]);
    for (var f = 0; f < 5; f++) {
      var y = 24 + f * 17;
      R(c, 6, y + 14, w - 12, 2, "#8a4a30");
      for (var x = 22; x < w - 22; x += 15) sash(c, x, y + 2, 10, 11, T[3]);
      sash(c, 9, y + 2, 7, 11, T[3]);
    }
    for (var p = 20; p < w - 18; p += 30) R(c, p, 20, 2, h - 40, T[2]);
    R(c, 6, h - 22, w - 12, 22, "#88b0d0"); for (var g = 8; g < w - 8; g += 10) R(c, g, h - 20, 1, 20, "#5878a0");
    R(c, 4, h - 25, w - 8, 4, "#8a4a30"); R(c, w / 2 - 10, h - 20, 20, 20, "#283848");
    R(c, 4, 16, w - 8, 5, T[2]); R(c, 4, 16, w - 8, 1, T[0]);
    // the rooftop shrine and its torii
    R(c, w - 54, 4, 26, 12, PLASTER[1]); roof(c, w - 58, 0, 34, 6, 4, SLATE, 1);
    R(c, w - 74, 4, 2, 12, REDP[1]); R(c, w - 64, 4, 2, 12, REDP[1]); R(c, w - 77, 2, 16, 2, REDP[1]); R(c, w - 75, 6, 12, 1, REDP[1]);
  });

  // ---- 圓山花博 ---------------------------------------------------------------------------------
  S.flora_hall = inked(function (c, w, h) {        // 爭艷館: a long white barrel vault over glass, flower beds in front
    var cx = w / 2;
    R(c, 6, 50, w - 12, h - 62, "#88b0d0");
    for (var g = 8; g < w - 8; g += 12) { R(c, g, 50, 2, h - 62, WH[1]); R(c, g + 3, 52, 3, 10, "#c0dcf0"); }
    R(c, 6, 74, w - 12, 2, WH[1]);
    for (var y = 0; y < 36; y++) {
      var t = 1 - y / 36, hw = Math.round((w / 2 - 4) * Math.sqrt(1 - t * t * .9));
      R(c, cx - hw, 14 + y, hw * 2, 1, y % 6 === 5 ? WH[2] : WH[1]);
      R(c, cx - hw, 14 + y, Math.round(hw * .4), 1, WH[0]); R(c, cx + Math.round(hw * .6), 14 + y, hw - Math.round(hw * .6), 1, WH[2]);
    }
    for (var r = 18; r < w - 18; r += 20) for (var k = 0; k < 30; k++) px(c, r, 18 + k, WH[2]);
    R(c, cx - 18, h - 34, 36, 22, "#283848"); R(c, cx - 22, h - 37, 44, 4, WH[0]); R(c, cx - 1, h - 32, 2, 20, "#5878a0");
    R(c, 6, h - 12, w - 12, 12, "#58a048");
    var fl = ["#f05868", "#f8d040", "#f8f8f8", "#c060d0"];
    for (var fx = 8; fx < w - 8; fx += 3) if (Math.abs(fx - cx) > 20) px(c, fx, h - 10 + (fx * 7) % 7, fl[(fx * 5) % 4]);
  });

  // ---- 新北市政府 -------------------------------------------------------------------------------
  S.cityhall = inked(function (c, w, h) {          // two glass towers joined at the top like a gate
    var G = ["#a8c8e0", "#6888a8", "#486480", "#2a3c50"], L = 24, Rr = w - 24, gap0 = 116, gap1 = w - 116;
    function tower(x0, x1, lit) {
      R(c, x0, 14, x1 - x0, h - 14, G[1]); R(c, x0, 14, 4, h - 14, G[0]); R(c, x1 - 5, 14, 5, h - 14, G[2]);
      for (var y = 18; y < h - 4; y += 6) R(c, x0 + 4, y, x1 - x0 - 9, 1, G[2]);
      for (var x = x0 + 8; x < x1 - 6; x += 8) R(c, x, 16, 1, h - 18, G[0]);
      for (var j = 0, yy = 19; yy < h - 8; j++, yy += 6) for (var i = 0, xx = x0 + 9; xx < x1 - 12; i++, xx += 8) if ((i * 7 + j * 13 + x0) % 9 === 0) R(c, xx, yy, 6, 4, lit);
    }
    tower(L, gap0, "#f8e090"); tower(gap1, Rr, "#f8e090");
    R(c, L - 4, 0, Rr - L + 8, 16, G[3]); R(c, L - 4, 0, Rr - L + 8, 3, "#c8d8e8");             // the crown that joins them
    for (var x = L; x < Rr; x += 10) R(c, x, 5, 6, 7, x > gap0 && x < gap1 ? "#f8e090" : G[0]);
    R(c, gap0, 16, gap1 - gap0, 4, G[3]);
    R(c, gap0 - 6, h - 30, gap1 - gap0 + 12, 30, WH[1]); R(c, gap0 - 6, h - 30, gap1 - gap0 + 12, 3, WH[0]);
    R(c, gap0, h - 24, gap1 - gap0, 24, "#5878a0"); for (var g = gap0 + 4; g < gap1; g += 8) R(c, g, h - 24, 1, 24, "#a8c8e0");
    R(c, w / 2 - 12, h - 22, 24, 22, "#283848"); R(c, w / 2 - 1, h - 20, 2, 20, "#f8e090");
  });

  // ---- 九份茶樓 ---------------------------------------------------------------------------------
  S.lantern_house = inked(function (c, w, h) {     // dark wooden tea house, warm windows, red lanterns under every eave
    var D = ["#7a5a40", "#4a3020", "#36221a", "#20140e"];
    for (var f = 0; f < 3; f++) {
      var y0 = 6 + f * 24, inset = (2 - f) * 2;
      R(c, 4 + inset, y0 + 6, w - 8 - inset * 2, 18, D[1]); R(c, 4 + inset, y0 + 6, 2, 18, D[0]);
      for (var x = 8 + inset; x < w - 12 - inset; x += 12) { R(c, x, y0 + 10, 8, 9, "#f8d070"); R(c, x + 3, y0 + 10, 1, 9, D[2]); R(c, x, y0 + 14, 8, 1, D[2]); }
      roof(c, inset, y0, w - inset * 2, 7, 3, SLATE, 2);
      for (var l = 8 + inset; l < w - 8 - inset; l += 12) { R(c, l + 1, y0 + 7, 1, 1, D[3]); R(c, l - 1, y0 + 8, 5, 5, "#e83828"); R(c, l, y0 + 7, 3, 7, "#e83828"); R(c, l, y0 + 10, 3, 1, GOLD[1]); }
    }
    R(c, 6, h - 6, w - 12, 6, STONE[1]);
    R(c, w / 2 - 9, h - 16, 18, 10, D[3]); R(c, w / 2 - 7, h - 14, 14, 8, "#f8d070");
    R(c, w - 14, 30, 8, 24, "#f8f0d8"); for (var k = 33; k < 52; k += 4) R(c, w - 12, k, 4, 2, "#a02818");    // the vertical shop sign
  });

  // ---- 台中 -------------------------------------------------------------------------------------
  S.taichung_hall = inked(function (c, w, h) {      // 台中州廳: white baroque wings, mansard roofs, a domed entrance pavilion
    var cx = w / 2, P = ["#fffaf0", "#f0ebe0", "#cdc6b6", "#9a9282"];
    R(c, 6, 44, w - 12, h - 44, P[1]); R(c, 6, 44, 4, h - 44, P[0]); R(c, w - 10, 44, 4, h - 44, P[2]);
    R(c, 6, 82, w - 12, 3, P[2]); R(c, 4, 42, w - 8, 3, P[0]);
    for (var x = 14; x < w - 18; x += 14) if (Math.abs(x + 5 - cx) > 26) { arched(c, x, 52, 10, 24, P[2]); arched(c, x, 90, 10, h - 96, P[2]); }
    roof(c, 2, 26, w - 4, 17, 6, SLATE, 0);
    for (var d = 16; d < w - 20; d += 28) if (Math.abs(d + 5 - cx) > 30) { R(c, d, 28, 10, 12, P[1]); arched(c, d + 2, 30, 6, 9, P[1]); }
    // entrance pavilion
    R(c, cx - 26, 30, 52, h - 30, P[0]); R(c, cx + 20, 30, 6, h - 30, P[2]);
    for (var p = cx - 22; p < cx + 22; p += 11) column(c, p, 60, 5, h - 66, P);
    arched(c, cx - 9, h - 40, 18, 40, P[2]); R(c, cx - 7, h - 26, 14, 26, "#3a2a20");
    R(c, cx - 28, 54, 56, 5, P[2]); R(c, cx - 26, 36, 52, 18, P[1]); arched(c, cx - 6, 38, 12, 14, P[2]);
    for (var y = 0; y < 22; y++) { var hw = Math.round(24 - y * y / 26); R(c, cx - hw, 30 - y, hw * 2, 1, y % 5 === 4 ? SLATE[2] : SLATE[1]); R(c, cx - hw, 30 - y, 3, 1, SLATE[0]); }
    R(c, cx - 1, 2, 2, 7, SLATE[3]); disc(c, cx, 4, 2, GOLD[1]);
  });

  S.miyahara = inked(function (c, w, h) {          // 宮原眼科: red brick with white arches and a stepped parapet
    bricks(c, 4, 22, w - 8, h - 22, BRICK);
    R(c, 4, 60, w - 8, 4, PLASTER[1]); R(c, 4, 22, w - 8, 4, PLASTER[1]);
    for (var x = 12; x < w - 18; x += 18) { arched(c, x, 32, 12, 24, PLASTER[1]); arched(c, x, 70, 12, h - 76, PLASTER[1]); }
    R(c, w / 2 - 12, h - 34, 24, 34, PLASTER[1]); R(c, w / 2 - 10, h - 32, 20, 32, "#f8e0a0"); R(c, w / 2 - 1, h - 32, 2, 32, WOOD[2]);
    for (var s = 0; s < 4; s++) R(c, w / 2 - 34 + s * 8, 8 + s * 0, 68 - s * 16, 14 - s * 3, s % 2 ? PLASTER[1] : BRICK[1]);   // stepped gable
    R(c, w / 2 - 26, 4, 52, 4, PLASTER[0]); R(c, w / 2 - 18, 12, 36, 8, "#203060"); for (var g = w / 2 - 15; g < w / 2 + 15; g += 6) R(c, g, 14, 4, 4, GOLD[1]);
    R(c, 4, 18, w - 8, 4, PLASTER[0]);
  });

  // ---- 淡江大橋 ---------------------------------------------------------------------------------
  S.tamkang = inked(function (c, w, h) {           // one tall white pylon, a fan of cables, a long deck over the river
    var tx = Math.round(w * .38), deck = h - 30;
    for (var x = 0; x < w; x += 46) { R(c, x + 18, deck + 8, 10, h - deck - 8, STONE[2]); R(c, x + 18, deck + 8, 3, h - deck - 8, STONE[1]); }
    R(c, 0, deck, w, 8, "#585860"); R(c, 0, deck, w, 2, WH[1]); R(c, 0, deck + 6, w, 2, "#383840");
    for (var k = 1; k <= 12; k++) {
      var ty = 10 + k * 4, lx = tx - k * 11, rx = tx + k * 18;
      for (var t = 0; t <= 40; t++) { px(c, Math.round(tx + (lx - tx) * t / 40), Math.round(ty + (deck - ty) * t / 40), "#e8ecf4"); px(c, Math.round(tx + (rx - tx) * t / 40), Math.round(ty + (deck - ty) * t / 40), "#e8ecf4"); }
    }
    for (var y = 0; y < h - 4; y++) { var hw = 3 + Math.round(y / 30); R(c, tx - hw, y, hw * 2, 1, WH[1]); R(c, tx - hw, y, 2, 1, WH[0]); R(c, tx + hw - 2, y, 2, 1, WH[2]); }
    R(c, tx - 2, 0, 4, 3, "#f05050");
  });

  // ---- 林家花園 來青閣 ----------------------------------------------------------------------------
  S.laiqing = inked(function (c, w, h) {           // a two-storey red pavilion with a balcony and swallowtail roofs
    var cx = w / 2, ROOF = ["#8890a0", "#606878", "#485060", "#303848"];
    R(c, 6, h - 10, w - 12, 10, STONE[1]); R(c, 6, h - 10, w - 12, 2, STONE[0]); stairs(c, cx - 14, h - 10, 28, 10, STONE);
    R(c, 18, 74, w - 36, h - 84, REDP[1]);
    for (var x = 22; x < w - 26; x += 18) column(c, x, 76, 5, h - 86, REDP);
    for (var lx = 30; lx < w - 40; lx += 36) if (Math.abs(lx + 9 - cx) > 20) { R(c, lx, 84, 18, 18, "#5a1c10"); for (var k = 1; k < 18; k += 3) R(c, lx + k, 85, 1, 16, "#c89058"); }
    R(c, cx - 12, 82, 24, h - 92, "#5a1c10"); R(c, cx - 10, 84, 20, h - 94, "#8a3420");
    A.swallowRoof(c, 6, 56, w - 12, 14, ROOF[1], ROOF[2], REDP[2], false);
    R(c, 30, 34, w - 60, 24, REDP[1]); for (var x2 = 34; x2 < w - 36; x2 += 14) column(c, x2, 34, 4, 22, REDP);
    for (var wx = 42; wx < w - 50; wx += 28) { R(c, wx, 38, 14, 12, "#5a1c10"); for (var q = 1; q < 14; q += 3) R(c, wx + q, 39, 1, 10, "#c89058"); }
    rail(c, 26, 50, w - 52, ["#e0b070", "#a06830", "#704010", "#402008"]);
    A.swallowRoof(c, 22, 18, w - 44, 16, ROOF[1], ROOF[2], REDP[2], true);
  });

  // ---- 基隆山上的字 -----------------------------------------------------------------------------
  var FONT = { K: "101110100110101", E: "111100110100111", L: "100100100100111", U: "101101101101111", N: "111101101101101", G: "111100101101111" };
  S.keelung_sign = inked(function (c, w, h) {       // the white KEELUNG letters on the hill above the harbour
    var word = "KEELUNG", sx = Math.round((w - word.length * 14) / 2);
    for (var i = 0; i < word.length; i++) {
      var g = FONT[word.charAt(i)];
      for (var k = 0; k < 15; k++) if (g.charAt(k) === "1") R(c, sx + i * 14 + (k % 3) * 3, 6 + Math.floor(k / 3) * 3, 3, 3, "#f8f8f8");
      R(c, sx + i * 14 + 1, 21, 1, 6, "#787880"); R(c, sx + i * 14 + 7, 21, 1, 6, "#787880");
    }
  });

  // ======== the rest of the landmarks (11/10, batch 5) ============================================
  var SEA = ["#68a0e8", "#3878d8", "#2860b0"], GREEN = ["#78c060", "#4a9a40", "#2e7030", "#1a4a20"];
  function seaBg(c, w, h, f) {
    R(c, 0, 0, w, h, SEA[1]);
    for (var y = 3; y < h; y += 8) for (var x = ((y / 8) % 2) * 8 + (f ? 4 : 0); x < w; x += 16) R(c, x, y, 5, 1, SEA[0]);
  }
  function bushes(c, x, y, w, h) {                     // a leafy hillside
    R(c, x, y, w, h, GREEN[1]);
    for (var j = y; j < y + h; j += 5) for (var i = x + ((j - y) % 10 ? 3 : 0); i < x + w - 2; i += 7) { R(c, i, j, 5, 3, GREEN[0]); px(c, i + 1, j + 3, GREEN[2]); }
  }

  // ---- street shophouses (騎樓), used on many old streets -----------------------------------------
  function shophouse(c, w, h, P, sign, awn, f) {
    R(c, 2, 6, w - 4, h - 6, P[1]); R(c, 2, 6, 2, h - 6, P[0]); R(c, w - 5, 6, 3, h - 6, P[2]);
    R(c, 0, 2, w, 5, P[3]); R(c, 0, 2, w, 1, P[2]);
    for (var fl = 0; fl < 2; fl++) {
      var y = 11 + fl * 19;
      sash(c, 8, y, 14, 12, P[0]); sash(c, w - 30, y, 14, 12, P[0]);
      R(c, 2, y + 15, w - 4, 2, P[2]);
      R(c, 9, y + 12, 10, 3, "#d8d8d8"); R(c, 10, y + 13, 2, 1, "#808080");                // air conditioner
    }
    R(c, w - 12, 8, 9, 38, sign); R(c, w - 11, 9, 7, 36, "#f8f0e0");
    for (var k = 12; k < 42; k += 6) R(c, w - 10, k, 5, 4, sign);
    R(c, 2, 48, w - 4, h - 48, "#3a3030");
    R(c, 2, 48, 6, h - 48, P[1]); R(c, w - 8, 48, 6, h - 48, P[2]);
    var goods = ["#e05050", "#f0c040", "#50a0e0", "#60b050"];
    for (var g = 12; g < w - 12; g += 6) R(c, g, h - 14, 4, 8, goods[(g / 6 + (f || 0)) % 4]);
    R(c, 10, h - 6, w - 20, 6, "#a87848");
    for (var a = 2; a < w - 2; a += 6) R(c, a, 48, 3, 6, awn);
    R(c, 2, 48, w - 4, 1, "#202020"); R(c, 2, 54, w - 4, 1, "#a0a0a0");
  }
  S.shop0 = inked(function (c, w, h, f) { shophouse(c, w, h, ["#fff4dc", "#f0dcb4", "#c8b088", "#8a6a48"], "#d03030", "#e04040", f); });
  S.shop1 = inked(function (c, w, h, f) { shophouse(c, w, h, ["#ffe8ec", "#f0c8d0", "#c89ca8", "#8a6070"], "#3060c0", "#4070d0", f); });
  S.shop2 = inked(function (c, w, h, f) { shophouse(c, w, h, ["#e8f4f4", "#c8dcdc", "#98b0b0", "#607878"], "#2a8a50", "#40a060", f); });

  // ---- 大溪老街: baroque shop fronts (牌樓厝) -------------------------------------------------------
  function baroqueFront(c, w, h, P) {
    var cx = w / 2;
    for (var y = 0; y < 18; y++) { var hw = Math.round(8 + (w / 2 - 10) * Math.pow(y / 17, .6)); R(c, cx - hw, y + 2, hw * 2, 1, P[1]); px(c, cx - hw, y + 2, P[0]); px(c, cx + hw - 1, y + 2, P[2]); }
    disc(c, cx, 12, 5, P[0]); disc(c, cx, 12, 3, P[2]); R(c, 2, 14, 5, 7, P[1]); R(c, w - 7, 14, 5, 7, P[1]); disc(c, 4, 12, 2, P[0]); disc(c, w - 5, 12, 2, P[0]);
    R(c, 2, 20, w - 4, h - 20, P[1]); R(c, 2, 20, 2, h - 20, P[0]); R(c, w - 5, 20, 3, h - 20, P[2]);
    R(c, 0, 19, w, 3, P[3]);
    arched(c, 10, 26, 12, 18, WH[1]); arched(c, w - 22, 26, 12, 18, WH[1]);
    rail(c, 4, 42, w - 8, WH);
    R(c, 2, 52, w - 4, h - 52, "#3a3028");
    [4, w / 2 - 3, w - 10].forEach(function (x) { R(c, x, 52, 6, h - 52, P[1]); px(c, x, 52, P[0]); });
    disc(c, 18, 56, 8, P[1]); disc(c, w - 18, 56, 8, P[1]); disc(c, 18, 58, 7, "#3a3028"); disc(c, w - 18, 58, 7, "#3a3028");
    R(c, 10, h - 10, 10, 10, "#c8a070"); R(c, w - 20, h - 10, 10, 10, "#a8c070");
  }
  S.daxi0 = inked(function (c, w, h) { baroqueFront(c, w, h, BRICK); });
  S.daxi1 = inked(function (c, w, h) { baroqueFront(c, w, h, ["#f8f6ee", "#dcd8cc", "#aca898", "#7a7666"]); });

  // ---- small temples ---------------------------------------------------------------------------
  function smallTemple(c, w, h, P) {
    var cx = w / 2;
    R(c, 2, h - 8, w - 4, 8, STONE[1]); R(c, 2, h - 8, w - 4, 1, STONE[0]); stairs(c, cx - 8, h - 8, 16, 8, STONE);
    R(c, 4, Math.round(h * .42), w - 8, Math.round(h * .58) - 8, "#d8c8a8");
    A.hall(c, 6, Math.round(h * .5), w - 12, Math.round(h * .5) - 8, REDP[2], REDP[1], true);
    A.lanterns(c, 6, Math.round(h * .45), 2, w - 17);
    A.swallowRoof(c, 2, Math.round(h * .26), w - 4, Math.round(h * .17), P[1], P[2], P[3], true);
    plaque(c, cx - 10, Math.round(h * .43), 20, 6);
  }
  S.temple = inked(function (c, w, h) { smallTemple(c, w, h, ["#f0a050", "#e07828", "#a84818", "#6a2808"]); });
  S.puji = inked(function (c, w, h) { smallTemple(c, w, h, ["#f0a050", "#d86828", "#a04018", "#602008"]); });
  S.qingshan_temple = inked(function (c, w, h) { smallTemple(c, w, h, ["#f0a050", "#e07828", "#a84818", "#6a2808"]); });

  S.market = inked(function (c, w, h) {            // 永樂市場: a plain market block with bolts of cloth at the door
    R(c, 2, 4, w - 4, h - 4, "#c8d0c0"); R(c, 2, 4, 2, h - 4, "#e0e8d8"); R(c, w - 5, 4, 3, h - 4, "#a0a898");
    for (var y = 8; y < 44; y += 12) for (var x = 8; x < w - 10; x += 12) sash(c, x, y, 8, 9, "#a0a898");
    R(c, 6, 44, w - 12, 8, REDP[1]); for (var k = 10; k < w - 10; k += 8) R(c, k, 46, 5, 4, "#f8f0e0");
    R(c, 2, 54, w - 4, h - 54, "#3a3030");
    var cl = ["#d86888", "#68a8d8", "#e8c850", "#78c080", "#c070d0"];
    for (var b = 6; b < w - 8; b += 7) R(c, b, h - 22, 5, 16, cl[(b / 7) % 5]);
  });

  // ---- 基隆 -------------------------------------------------------------------------------------
  S.kma = inked(function (c, w, h) {               // 基隆美術館: stone base, glass above, louvres
    R(c, 4, 12, w - 8, h - 12, "#b8bcc4"); R(c, 4, 12, w - 8, 2, "#d8dce4");
    R(c, 8, 16, w - 16, 30, "#5a7898"); for (var x = 10; x < w - 10; x += 6) R(c, x, 16, 1, 30, "#88a8c8");
    for (var y = 18; y < 46; y += 5) R(c, 8, y, w - 16, 1, "#c8ccd4");
    R(c, 0, 8, w, 5, "#787c88"); R(c, 0, 8, w, 1, "#a8acb8");
    bricks(c, 4, 48, w - 8, h - 48, ["#d8d4cc", "#b8b4ac", "#989488", "#686458"]);
    R(c, w / 2 - 16, h - 26, 32, 26, "#283848"); R(c, w / 2 - 20, h - 29, 40, 4, "#787c88");
    R(c, 14, 0, 2, 12, "#808080"); R(c, 16, 1, 10, 6, "#d03030");
  });

  S.tunnel_mouth = inked(function (c, w, h) {       // 信二防空洞: a stone portal cut into a green hill
    bushes(c, 0, 0, w, h);
    var cx = w / 2;
    disc(c, cx, 40, 30, STONE[2]); R(c, cx - 30, 40, 60, h - 40, STONE[2]);
    for (var a = 0; a < 12; a++) { var ang = Math.PI + a * Math.PI / 11; R(c, Math.round(cx + Math.cos(ang) * 27) - 2, Math.round(40 + Math.sin(ang) * 27) - 2, 5, 5, a % 2 ? STONE[1] : STONE[0]); }
    disc(c, cx, 42, 22, "#181418"); R(c, cx - 22, 42, 44, h - 42, "#181418");
    R(c, cx - 22, h - 4, 44, 4, "#383038");
    R(c, cx - 12, 4, 24, 6, "#f8f0d8"); for (var k = cx - 10; k < cx + 10; k += 5) R(c, k, 5, 3, 4, "#303030");
  });

  S.ship = inked(function (c, w, h, f) {            // a white cruise ship at the quay
    seaBg(c, w, h, f);
    for (var y = 0; y < 30; y++) { var inset = Math.round(Math.max(0, y - 18) * 1.2); R(c, 6 + inset + (y < 10 ? 0 : 0), h - 40 + y, w - 12 - inset * 2 - Math.round(y * .4), 1, y < 4 ? "#2848a0" : y < 22 ? "#f8f8f8" : "#c03030"); }
    R(c, w - 30, h - 40, 20, 4, "#2848a0");
    for (var d = 0; d < 3; d++) {
      var y0 = h - 52 - d * 12, x0 = 24 + d * 14, x1 = w - 60 - d * 10;
      R(c, x0, y0, x1 - x0, 12, d % 2 ? "#e8eef4" : "#ffffff"); R(c, x0, y0 + 11, x1 - x0, 1, "#a8b0c0");
      for (var x = x0 + 4; x < x1 - 4; x += 7) R(c, x, y0 + 4, 4, 4, "#3a5878");
    }
    R(c, w - 100, h - 92, 14, 22, "#d03030"); R(c, w - 100, h - 92, 14, 4, "#202020"); R(c, w - 98, h - 90, 3, 18, "#f06060");
    for (var b = 10; b < w - 20; b += 9) px(c, b, h - 33, "#3a5878");
  });

  S.crane = inked(function (c, w, h, f) {           // a red and white harbour crane on its pier
    seaBg(c, w, h, f);
    R(c, 0, h - 14, w, 14, "#a8a8b0"); R(c, 0, h - 14, w, 2, "#d0d0d8");
    [10, w - 18].forEach(function (x) { for (var y = 18; y < h - 14; y++) R(c, x, y, 8, 1, Math.floor(y / 8) % 2 ? "#e03030" : "#f8f8f8"); });
    R(c, 4, 12, w - 8, 8, "#e03030"); R(c, 4, 12, w - 8, 2, "#f06060");
    R(c, w / 2 - 10, 4, 20, 9, "#f8f8f8"); R(c, w / 2 - 6, 6, 5, 4, "#3a5878");
    R(c, w / 2 - 1, 20, 2, 30, "#404048"); R(c, w / 2 - 6, 50, 12, 8, "#f0c030");
  });

  // ---- 金瓜石、黃金神社、和平島 ---------------------------------------------------------------------
  S.gold_museum = inked(function (c, w, h) {        // 黃金博物館: stone and timber, a lit window with the big gold bar
    R(c, 4, 30, w - 8, h - 30, "#8a8478"); bricks(c, 4, h - 30, w - 8, 30, ["#a8a498", "#8a8478", "#6a645a", "#4a4438"]);
    for (var x = 8; x < w - 8; x += 5) R(c, x, 34, 3, h - 66, WOOD[1]);
    R(c, 20, 40, 50, 30, "#f8e8b0"); R(c, 22, 42, 46, 26, "#fff4d0");
    for (var g = 0; g < 8; g++) R(c, 32 + g, 56 - g, 26 - g * 2, 1, g % 3 ? GOLD[1] : GOLD[0]);
    R(c, w - 44, h - 34, 24, 34, "#283848");
    roof(c, 0, 14, w, 17, 10, SLATE, 2);
    R(c, w - 60, 4, 36, 10, "#203060"); for (var k = w - 57; k < w - 27; k += 6) R(c, k, 6, 4, 6, GOLD[1]);
  });

  S.mine_mouth = inked(function (c, w, h) {         // 本山五坑: a timbered adit in the rock, rails and a mine cart
    R(c, 0, 0, w, h, "#7a7068"); for (var y = 2; y < h; y += 6) for (var x = (y % 12) ? 0 : 6; x < w; x += 12) R(c, x, y, 8, 3, "#8a8078");
    bushes(c, 0, 0, w, 14);
    var cx = w / 2;
    R(c, cx - 26, 22, 52, h - 22, WOOD[2]); R(c, cx - 20, 30, 40, h - 30, "#141010");
    R(c, cx - 30, 20, 60, 8, WOOD[1]); R(c, cx - 30, 20, 60, 2, WOOD[0]);
    R(c, cx - 14, 8, 28, 10, "#f8f0d8"); for (var k = cx - 12; k < cx + 12; k += 6) R(c, k, 10, 4, 6, "#303030");
    R(c, cx - 12, h - 4, 2, 4, "#a0a0a8"); R(c, cx + 10, h - 4, 2, 4, "#a0a0a8");
    R(c, cx - 14, h - 20, 28, 14, "#5a5a68"); R(c, cx - 12, h - 22, 24, 4, "#f0c030"); disc(c, cx - 8, h - 6, 3, "#202020"); disc(c, cx + 8, h - 6, 3, "#202020");
  });

  S.shrine_ruins = inked(function (c, w, h) {       // 黃金神社: stone pillars left standing on the old platform
    R(c, 4, h - 12, w - 8, 12, STONE[1]); R(c, 4, h - 12, w - 8, 2, STONE[0]); R(c, 4, h - 2, w - 8, 2, STONE[3]);
    for (var x = 16; x < w - 16; x += 20) { column(c, x, 6, 7, h - 18, STONE); if ((x / 20) % 2) R(c, x - 2, 4, 11, 3, STONE[2]); }
    R(c, 14, 4, 50, 3, STONE[2]); R(c, w - 64, 4, 50, 3, STONE[2]);
  });

  S.torii = inked(function (c, w, h) {              // a weathered stone torii
    var P = ["#d0ccc4", "#a8a098", "#88807a", "#585048"];
    column(c, 8, 10, 7, h - 10, P); column(c, w - 15, 10, 7, h - 10, P);
    R(c, 0, 2, w, 5, P[1]); R(c, 0, 2, w, 1, P[0]); R(c, 2, 0, w - 4, 3, P[2]); R(c, 4, 13, w - 8, 4, P[1]);
    R(c, w / 2 - 3, 7, 6, 7, P[2]);
  });

  S.mushroom_rock = inked(function (c, w, h) {      // 蕈狀岩: a wide sandstone cap on a thin neck
    R(c, 12, 16, 8, 14, "#b8a078"); R(c, 12, 16, 3, 14, "#d8c098"); R(c, 10, h - 3, 12, 3, "#9a8458");
    disc(c, 16, 12, 11, "#c8a868"); R(c, 4, 12, 24, 6, "#c8a868");
    R(c, 6, 8, 12, 3, "#e8d098"); R(c, 5, 15, 22, 2, "#9a7a48"); R(c, 7, 11, 18, 1, "#a88a58");
  });

  // ---- 台北賓館、中山堂、萬年大樓、第四信用合作社 -----------------------------------------------
  S.guest_house = inked(function (c, w, h) {
    var P = ["#fffcf4", "#f0ece0", "#cfc8b8", "#9a9282"], cx = w / 2;
    R(c, 4, 36, w - 8, h - 36, P[1]); R(c, 4, 36, 3, h - 36, P[0]); R(c, w - 7, 36, 3, h - 36, P[2]); R(c, 2, 34, w - 4, 3, P[0]);
    for (var x = 10; x < w - 14; x += 16) if (Math.abs(x + 4 - cx) > 16) { arched(c, x, 44, 9, 18, P[2]); sash(c, x, 70, 9, 14, P[2]); }
    R(c, cx - 16, 30, 32, h - 30, P[0]); for (var p = cx - 14; p < cx + 14; p += 9) column(c, p, 46, 4, h - 50, P);
    arched(c, cx - 6, h - 26, 12, 26, P[2]);
    roof(c, 0, 18, w, 17, 6, SLATE, 0);
    for (var d = 12; d < w - 14; d += 22) if (Math.abs(d + 4 - cx) > 14) { R(c, d, 20, 9, 11, P[1]); arched(c, d + 2, 22, 5, 8, P[1]); }
    for (var y = 0; y < 16; y++) { var hw = Math.round(18 - y * y / 16); R(c, cx - hw, 30 - y, hw * 2, 1, SLATE[1]); R(c, cx - hw, 30 - y, 2, 1, SLATE[0]); }
    R(c, cx - 1, 8, 2, 8, SLATE[3]);
  });

  S.zhongshan = inked(function (c, w, h) {          // 中山堂: pale green tiles, arched windows, a central tower
    var P = ["#e0ecd8", "#b8ccb0", "#90a888", "#607858"], cx = w / 2;
    R(c, 4, 40, w - 8, h - 40, P[1]); R(c, 4, 40, 3, h - 40, P[0]); R(c, w - 7, 40, 3, h - 40, P[2]);
    R(c, 2, 36, w - 4, 5, P[0]); R(c, 4, 80, w - 8, 3, P[2]);
    for (var x = 12; x < w - 14; x += 14) if (Math.abs(x + 4 - cx) > 22) { arched(c, x, 48, 9, 24, P[3]); arched(c, x, 88, 9, h - 94, P[3]); }
    R(c, cx - 20, 8, 40, h - 8, P[1]); R(c, cx - 20, 8, 4, h - 8, P[0]); R(c, cx + 16, 8, 4, h - 8, P[2]);
    for (var t = 0; t < 3; t++) arched(c, cx - 6, 16 + t * 30, 12, 22, P[3]);
    arched(c, cx - 10, h - 30, 20, 30, P[3]); R(c, cx - 8, h - 18, 16, 18, WOOD[3]);
    R(c, cx - 22, 4, 44, 5, P[0]); for (var k = cx - 20; k < cx + 20; k += 5) R(c, k, 0, 3, 5, P[1]);
  });

  S.wannian = inked(function (c, w, h) {            // 萬年大樓: shop signs stacked floor by floor
    R(c, 4, 4, w - 8, h - 4, "#d8d8d0"); R(c, 4, 4, 3, h - 4, "#f0f0e8"); R(c, w - 7, 4, 3, h - 4, "#a8a8a0");
    var cols = ["#e83878", "#38a8e8", "#f8c838", "#58c858", "#a858e8"];
    for (var i = 0; i < 5; i++) {
      var y = 8 + i * 18;
      R(c, 8, y, w - 16, 11, cols[i]); R(c, 8, y, w - 16, 1, "#ffffff");
      for (var x = 12; x < w - 14; x += 9) R(c, x, y + 3, 6, 5, "#ffffff");
      R(c, 8, y + 12, w - 16, 4, "#5a7898");
    }
    R(c, 4, h - 28, w - 8, 28, "#88b0d0"); R(c, w / 2 - 12, h - 26, 24, 26, "#283848");
    R(c, 12, h - 24, 18, 18, "#f8f0f8"); disc(c, 21, h - 17, 5, "#f8d0a0"); R(c, 16, h - 24, 10, 5, "#4870d0");    // an anime poster
  });

  S.fourth_credit = inked(function (c, w, h) {      // 第四信用合作社: a white old bank, columns and a big arched window
    var P = ["#ffffff", "#f0f0ec", "#c8c8c4", "#909090"], cx = w / 2;
    R(c, 4, 16, w - 8, h - 16, P[1]); R(c, 4, 16, 3, h - 16, P[0]); R(c, w - 7, 16, 3, h - 16, P[2]);
    R(c, 0, 10, w, 7, P[0]); R(c, 0, 16, w, 1, P[3]);
    for (var x = 10; x < w - 14; x += 20) column(c, x, 22, 7, h - 30, P);
    arched(c, cx - 14, 28, 28, 40, P[2]);
    R(c, cx - 12, h - 34, 24, 34, "#f8e0a0"); R(c, cx - 10, h - 32, 20, 32, "#fff4d0"); R(c, cx - 1, h - 32, 2, 32, "#c8a060");
    R(c, 4, h - 6, w - 8, 6, STONE[1]);
    R(c, cx - 24, 0, 48, 10, P[1]); R(c, cx - 22, 2, 44, 6, "#203060"); for (var k = cx - 19; k < cx + 19; k += 6) R(c, k, 3, 4, 4, GOLD[1]);
  });

  // ---- 高雄 駁二 and the station canopy --------------------------------------------------------
  S.warehouse = inked(function (c, w, h) {          // 駁二: brick shed, corrugated roof, a big rolling door, a mural
    bricks(c, 2, 20, w - 4, h - 20, BRICK);
    for (var i = 0; i < 18; i++) { var inset = Math.round(Math.abs(i - 9) * 1.4); R(c, inset - 2, 2 + i, w - inset * 2 + 4, 1, i % 2 ? "#787c88" : "#989ca8"); }
    R(c, 10, 30, 30, h - 30, "#787c88"); for (var y = 32; y < h; y += 3) R(c, 10, y, 30, 1, "#5a5e68");
    R(c, 48, 28, w - 56, 20, "#f8f0e0"); R(c, 50, 30, 10, 16, "#f05050"); R(c, 60, 34, 12, 12, "#40a0e0"); disc(c, 80, 38, 6, "#f8c838"); R(c, 74, 40, 10, 6, "#58b858");
  });

  S.formosa_gate = inked(function (c, w, h) {       // 美麗島站: two glass shells that meet like praying hands
    var cx = w / 2;
    R(c, 0, h - 8, w, 8, STONE[1]); R(c, 0, h - 8, w, 1, STONE[0]);
    for (var y = 0; y < h - 10; y++) {
      var hw = Math.round((w / 2 - 6) * Math.sqrt(y / (h - 10)));
      R(c, cx - hw, y + 2, hw - 1, 1, y % 6 === 5 ? "#ffffff" : "#a8d8f0"); R(c, cx + 1, y + 2, hw - 1, 1, y % 6 === 5 ? "#ffffff" : "#88c0e0");
    }
    for (var k = 0; k < 6; k++) { var x = Math.round(cx - (w / 2 - 8) + k * (w / 2 - 8) / 3); R(c, x, h - 26, 1, 18, "#ffffff"); }
    R(c, cx - 12, h - 20, 24, 12, "#283848"); stairs(c, cx - 10, h - 10, 20, 10, STONE);
  });

  // ---- 動物園 -----------------------------------------------------------------------------------
  S.zoo_gate = inked(function (c, w, h) {          // 木柵動物園大門: two log towers, a green arch with the name board
    [0, w - 46].forEach(function (x) {
      R(c, x + 2, 12, 44, h - 12, WOOD[1]); for (var y = 14; y < h; y += 5) R(c, x + 2, y, 44, 1, WOOD[2]); R(c, x + 2, 12, 2, h - 12, WOOD[0]);
      R(c, x + 12, h - 22, 24, 22, "#3a2818");
    });
    R(c, 0, 4, w, 10, GREEN[1]); R(c, 0, 4, w, 2, GREEN[0]); R(c, 0, 12, w, 2, GREEN[2]);
    for (var k = 4; k < w; k += 8) R(c, k, 0, 5, 5, GREEN[1]);
    R(c, w / 2 - 34, 5, 68, 8, "#f8f0d0"); for (var i = w / 2 - 30; i < w / 2 + 30; i += 7) R(c, i, 7, 5, 4, "#305830");
    disc(c, 22, 30, 7, "#f8f8f8"); disc(c, 17, 25, 3, "#202020"); disc(c, 27, 25, 3, "#202020"); dots(c, "#202020", [19, 30, 25, 30, 22, 33]);   // a panda face
  });

  S.panda_house = inked(function (c, w, h) {       // 新光特展館: the panda house under a bamboo-green roof
    R(c, 4, 18, w - 8, h - 18, "#f0e8d8"); R(c, 4, 18, 3, h - 18, "#fff8e8"); R(c, w - 7, 18, 3, h - 18, "#c8c0b0");
    roof(c, 0, 4, w, 15, 8, ["#78c070", "#3a8a40", "#2a6a30", "#184a20"], 2);
    for (var x = 8; x < w - 8; x += 10) R(c, x, 20, 2, h - 20, "#a8c890");
    R(c, w / 2 - 12, h - 22, 24, 22, "#283848"); R(c, w / 2 - 1, h - 20, 2, 20, "#5878a0");
    disc(c, 18, 32, 7, "#f8f8f8"); disc(c, 13, 27, 3, "#202020"); disc(c, 23, 27, 3, "#202020"); dots(c, "#202020", [15, 32, 21, 32, 18, 35]);
    disc(c, w - 20, 32, 7, "#f8f8f8"); disc(c, w - 25, 27, 3, "#202020"); disc(c, w - 15, 27, 3, "#202020"); dots(c, "#202020", [w - 23, 32, w - 17, 32, w - 20, 35]);
  });

  // ---- 慈湖、大溪老茶廠、坪林 ------------------------------------------------------------------------
  S.cihu_tomb = inked(function (c, w, h) {         // 慈湖陵寢: a quiet courtyard house, white walls, dark tiles, red doors
    var cx = w / 2, DARK = ["#6a7080", "#40444e", "#30343c", "#1c1e24"];
    R(c, 2, h - 10, w - 4, 10, STONE[1]); R(c, 2, h - 10, w - 4, 2, STONE[0]); stairs(c, cx - 14, h - 10, 28, 10, STONE);
    [[4, 54], [w - 58, 54]].forEach(function (s0) {
      R(c, s0[0], 52, s0[1], h - 62, PLASTER[0]); R(c, s0[0] + s0[1] - 3, 52, 3, h - 62, PLASTER[2]);
      sash(c, s0[0] + 16, 64, 20, 18, WOOD[2]);
      roof(c, s0[0] - 2, 38, s0[1] + 4, 15, 6, DARK, 3);
    });
    R(c, 52, 34, w - 104, h - 44, PLASTER[0]); R(c, 52, 34, 3, h - 44, PLASTER[0]); R(c, w - 55, 34, 3, h - 44, PLASTER[2]);
    R(c, cx - 16, 52, 32, h - 62, "#7a1810"); R(c, cx - 14, 54, 28, h - 64, REDP[1]); R(c, cx - 1, 54, 2, h - 64, "#5a1008");
    for (var r = 58; r < h - 14; r += 6) for (var k = cx - 11; k < cx + 12; k += 6) if (Math.abs(k - cx) > 2) px(c, k, r, GOLD[1]);
    roof(c, 46, 14, w - 92, 21, 10, DARK, 4);
    R(c, cx - 10, 40, 20, 7, "#203060"); for (var g = cx - 7; g < cx + 7; g += 5) R(c, g, 42, 3, 3, GOLD[1]);
  });

  S.cihu_pavilion = inked(function (c, w, h) {     // a small lakeside pavilion
    R(c, 4, h - 6, w - 8, 6, STONE[1]); R(c, 4, h - 6, w - 8, 1, STONE[0]);
    [8, w - 14, w / 2 - 3].forEach(function (x) { column(c, x, 18, 5, h - 24, REDP); });
    rail(c, 6, h - 16, w - 12, ["#e0b070", "#a06830", "#704010", "#402008"]);
    octRoof(c, w / 2, 2, 1, w / 2 - 2, 18, ["#78c098", "#2e8a58", "#1c6a3c", "#0e4424"], 3);
  });

  S.tea_factory = inked(function (c, w, h) {       // 大溪老茶廠: a long black timber shed with rows of windows and a ridge vent
    var D = ["#6a5a50", "#3a3028", "#2a221c", "#18120e"];
    R(c, 4, 40, w - 8, h - 40, D[1]); for (var x = 6; x < w - 4; x += 4) R(c, x, 40, 1, h - 40, D[2]);
    for (var wx = 12; wx < w - 20; wx += 18) if (Math.abs(wx + 6 - w / 2) > 18) sash(c, wx, 50, 12, 14, "#d8d0c0");
    R(c, w / 2 - 16, h - 36, 32, 36, "#a07848"); R(c, w / 2 - 14, h - 34, 28, 34, "#c8a070"); R(c, w / 2 - 1, h - 34, 2, 34, "#806040");
    roof(c, 0, 16, w, 25, 18, SLATE, 0);
    R(c, w / 2 - 50, 8, 100, 9, SLATE[2]); for (var v = w / 2 - 46; v < w / 2 + 46; v += 6) R(c, v, 10, 3, 5, "#f8f0d8");
    roof(c, w / 2 - 56, 2, 112, 7, 4, SLATE, 0);
    R(c, 24, 20, 40, 10, "#f8f0d8"); for (var k = 27; k < 62; k += 7) R(c, k, 22, 5, 6, "#303030");
  });

  S.tea_museum = inked(function (c, w, h) {        // 坪林茶業博物館: a southern courtyard house of red brick and white walls
    var cx = w / 2, ROOF = ["#e09060", "#b85a30", "#883818", "#501808"];
    bricks(c, 2, 56, w - 4, h - 56, BRICK);
    roof(c, 0, 44, 56, 13, 4, ROOF, 2); roof(c, w - 56, 44, 56, 13, 4, ROOF, 2);
    R(c, 44, 30, w - 88, h - 30, PLASTER[1]); R(c, 44, 30, 3, h - 30, PLASTER[0]); R(c, w - 47, 30, 3, h - 30, PLASTER[2]);
    A.lattice(c, 54, 46, 22, 18); A.lattice(c, w - 76, 46, 22, 18);
    R(c, cx - 14, h - 40, 28, 40, REDP[2]); R(c, cx - 12, h - 38, 24, 38, REDP[1]); R(c, cx - 1, h - 38, 2, 38, REDP[3]);
    A.swallowRoof(c, 40, 18, w - 80, 13, ROOF[1], ROOF[2], ROOF[3], true);
    plaque(c, cx - 14, 34, 28, 7);
  });

  // ---- 礁溪、忍者村 ------------------------------------------------------------------------------
  S.onsen = inked(function (c, w, h) {             // a wooden bathhouse with noren curtains and steam
    R(c, 4, 40, w - 8, h - 40, "#d8b888"); for (var x = 6; x < w - 4; x += 4) R(c, x, 40, 1, h - 40, "#c0a070");
    for (var p = 4; p < w; p += 30) R(c, p, 40, 4, h - 40, WOOD[2]);
    R(c, w / 2 - 22, h - 34, 44, 34, "#3a2a20");
    for (var n = 0; n < 4; n++) { R(c, w / 2 - 20 + n * 10, h - 34, 9, 16, n % 2 ? "#3060a8" : "#c03838"); R(c, w / 2 - 17 + n * 10, h - 28, 3, 3, "#f8f8f8"); }
    for (var wx = 14; wx < w - 20; wx += 30) if (Math.abs(wx + 7 - w / 2) > 30) sash(c, wx, 50, 14, 14, WOOD[2]);
    roof(c, 0, 18, w, 23, 16, SLATE, 4);
    R(c, w / 2 - 14, 8, 28, 10, "#f8f0d8"); disc(c, w / 2, 13, 3, "#c03838");
    [20, w - 24].forEach(function (x) { for (var k = 0; k < 3; k++) R(c, x + k * 2 - 2, 2 + k * 4, 2, 4, "#e8eef4"); });
  });

  S.onsen_park = inked(function (c, w, h, f) {     // 湯圍溝: a foot bath under a dark wooden roof
    R(c, 6, h - 30, w - 12, 26, "#68b0e8"); for (var y = h - 26; y < h - 6; y += 6) R(c, 10 + (f ? 4 : 0), y, 20, 1, "#a8d8f8");
    R(c, 4, h - 32, w - 8, 3, STONE[1]); R(c, 4, h - 6, w - 8, 4, STONE[1]); R(c, 4, h - 6, w - 8, 1, STONE[0]);
    for (var i = 0; i < 4; i++) R(c, 16 + i * 30, h - 46 - (f ? 4 : 0), 3, 10, "#e8eef4");
    column(c, 10, 22, 5, h - 54, WOOD); column(c, w - 15, 22, 5, h - 54, WOOD);
    roof(c, 2, 6, w - 4, 17, 12, SLATE, 4);
  });

  S.ninja_castle = inked(function (c, w, h) {      // 忍者村: a white castle keep in three tiers on a stone base
    var cx = w / 2, BLK = ["#686878", "#383840", "#28282e", "#141418"];
    for (var y = 62; y < h; y++) { var inset = Math.round((h - y) * .25); R(c, 8 + inset, y, w - 16 - inset * 2, 1, (y % 7 === 0) ? STONE[2] : STONE[1]); }
    for (var t = 0; t < 3; t++) {
      var tw = w - 44 - t * 30, tx = Math.round((w - tw) / 2), ty = 50 - t * 18;
      R(c, tx + 4, ty, tw - 8, 14, PLASTER[0]); R(c, tx + tw - 8, ty, 4, 14, PLASTER[2]);
      for (var x = tx + 10; x < tx + tw - 12; x += 12) R(c, x, ty + 4, 6, 6, BLK[2]);
      roof(c, tx - 4, ty - 8, tw + 8, 8, 4, BLK, 4);
      if (t < 2) for (var g = 0; g < 6; g++) R(c, cx - g * 2, ty - 6 + g - 6, g * 4 + 1, 1, PLASTER[1]);
    }
    R(c, cx - 2, 0, 4, 4, GOLD[1]); R(c, cx - 8, 2, 4, 3, GOLD[1]); R(c, cx + 4, 2, 4, 3, GOLD[1]);
    R(c, cx - 8, h - 18, 16, 18, "#2a2018");
  });

  S.ninja_gate = inked(function (c, w, h) {        // a black timber gate with a tiled top
    var BLK = ["#686878", "#383840", "#28282e", "#141418"];
    column(c, 8, 16, 7, h - 16, BLK); column(c, w - 15, 16, 7, h - 16, BLK);
    R(c, 4, 16, w - 8, 4, BLK[2]);
    roof(c, 0, 4, w, 12, 6, BLK, 3);
    R(c, 16, 22, w - 32, h - 22, "#d8c8a0"); for (var x = 16; x < w - 16; x += 8) R(c, x, 22, 1, h - 22, WOOD[2]); for (var y = 22; y < h; y += 8) R(c, 16, y, w - 32, 1, WOOD[2]);
  });

  // ---- 公館 自來水博物館、臺大 --------------------------------------------------------------------
  S.water_museum = inked(function (c, w, h) {      // 自來水博物館: a white baroque pump house with Ionic columns and a dome
    var P = ["#fffcf4", "#f0ece0", "#cfc8b8", "#9a9282"], cx = w / 2;
    R(c, 2, h - 10, w - 4, 10, STONE[1]); R(c, 2, h - 10, w - 4, 2, STONE[0]); stairs(c, cx - 30, h - 10, 60, 10, WH);
    R(c, 6, 40, w - 12, h - 50, P[1]); R(c, 6, 40, 3, h - 50, P[0]); R(c, w - 9, 40, 3, h - 50, P[2]);
    for (var x = 12; x < w - 16; x += 14) { column(c, x, 46, 6, h - 58, P); R(c, x - 2, 44, 10, 3, P[2]); }
    for (var a = 19; a < w - 20; a += 28) arched(c, a, 56, 8, 24, P[2]);
    R(c, 2, 34, w - 4, 7, P[0]); R(c, 2, 40, w - 4, 1, P[3]); rail(c, 4, 26, w - 8, P);
    for (var y = 0; y < 18; y++) { var hw = Math.round(26 * Math.sqrt(1 - Math.pow(1 - y / 18, 2))); R(c, cx - hw, 8 + y, hw * 2, 1, "#a8c0b8"); R(c, cx - hw, 8 + y, Math.round(hw * .5), 1, "#c8dcd4"); R(c, cx + Math.round(hw * .5), 8 + y, hw - Math.round(hw * .5), 1, "#789890"); }
    R(c, cx - 3, 2, 6, 7, P[1]); R(c, cx - 1, 0, 2, 3, GOLD[1]);
  });

  S.cistern_gate = inked(function (c, w, h) {      // the way down to the underground cistern, in a grassy mound
    disc(c, w / 2, h, w / 2 - 2, GREEN[1]); bushes(c, 4, h - 28, w - 8, 6);
    bricks(c, w / 2 - 20, h - 32, 40, 32, BRICK);
    disc(c, w / 2, h - 22, 13, "#181418"); R(c, w / 2 - 13, h - 22, 26, 22, "#181418");
    for (var a = 0; a < 9; a++) { var ang = Math.PI + a * Math.PI / 8; R(c, Math.round(w / 2 + Math.cos(ang) * 15) - 1, Math.round(h - 22 + Math.sin(ang) * 15) - 1, 3, 3, PLASTER[1]); }
  });

  S.ntu_lib = inked(function (c, w, h) {           // 臺大總圖: tan tiles, tall arched entrance, a square tower in front
    var P = ["#f4e4c0", "#e0c8a0", "#b89c74", "#806848"], cx = w / 2;
    R(c, 2, 30, w - 4, h - 30, P[1]); R(c, 2, 30, 3, h - 30, P[0]); R(c, w - 5, 30, 3, h - 30, P[2]); R(c, 0, 26, w, 5, P[3]);
    for (var x = 10; x < w - 14; x += 16) if (Math.abs(x + 5 - cx) > 22) { arched(c, x, 40, 10, 22, P[3]); arched(c, x, 68, 10, h - 72, P[3]); }
    R(c, cx - 22, 6, 44, h - 6, P[1]); R(c, cx - 22, 6, 4, h - 6, P[0]); R(c, cx + 18, 6, 4, h - 6, P[2]); R(c, cx - 24, 2, 48, 5, P[3]);
    arched(c, cx - 12, 30, 24, h - 30, P[3]); R(c, cx - 10, h - 26, 20, 26, WOOD[3]);
    for (var k = cx - 16; k < cx + 16; k += 6) R(c, k, 12, 3, 12, P[3]);
  });

  S.palm = inked(function (c, w, h) {              // 椰林大道 royal palm
    R(c, 6, 12, 4, h - 12, "#d8d0c0"); R(c, 6, 12, 1, h - 12, "#f0e8d8"); for (var y = 14; y < h; y += 3) R(c, 6, y, 4, 1, "#a8a090");
    R(c, 6, 10, 4, 4, "#58a048");
    R(c, 1, 4, 14, 3, "#3a9048"); R(c, 3, 1, 10, 3, "#58b058"); R(c, 0, 7, 3, 4, "#2a7038"); R(c, 13, 7, 3, 4, "#2a7038"); R(c, 6, 0, 4, 2, "#78c070");
  });

  S.fu_bell = inked(function (c, w, h) {           // 傅鐘
    column(c, 2, 10, 3, h - 13, STONE); column(c, 11, 10, 3, h - 13, STONE);
    R(c, 0, 6, 16, 4, "#585860"); R(c, 0, 6, 16, 1, "#787880");
    R(c, 6, 11, 4, 7, "#9a7a38"); R(c, 5, 17, 6, 2, "#8a6a28"); px(c, 6, 12, "#c8a868");
    R(c, 1, h - 3, 14, 3, STONE[1]);
  });

  // ---- 228 和平紀念碑、鐵道部 --------------------------------------------------------------------
  S.obelisk = inked(function (c, w, h) {           // 二二八紀念碑: three tall white prisms on a stepped base
    var cx = w / 2;
    for (var i = 0; i < 3; i++) R(c, cx - 22 + i * 4, h - 6 - i * 3, 44 - i * 8, 3, i % 2 ? WH[2] : WH[1]);
    [[cx - 14, 30], [cx - 4, 6], [cx + 6, 22]].forEach(function (p) { R(c, p[0], p[1], 9, h - 14 - p[1], WH[1]); R(c, p[0], p[1], 2, h - 14 - p[1], WH[0]); R(c, p[0] + 6, p[1], 3, h - 14 - p[1], WH[2]); R(c, p[0], p[1], 9, 2, WH[0]); });
  });

  S.train = inked(function (c, w, h) {             // an old black steam engine with a tender and a carriage
    R(c, 0, h - 6, w, 2, "#787880");
    R(c, 8, 14, 70, 22, "#282830"); R(c, 8, 14, 70, 3, "#585868"); disc(c, 70, 25, 10, "#282830");
    R(c, 10, 4, 22, 14, "#202028"); R(c, 13, 7, 7, 6, "#a8c8e0"); R(c, 22, 7, 7, 6, "#a8c8e0"); R(c, 6, 2, 28, 3, "#383840");
    R(c, 56, 2, 8, 12, "#202028"); R(c, 54, 0, 12, 3, "#383840"); R(c, 42, 8, 6, 6, GOLD[1]);
    R(c, 8, 32, 74, 3, "#c03030");
    [16, 32, 48, 64].forEach(function (x) { disc(c, x, h - 9, 6, "#c03030"); disc(c, x, h - 9, 2, "#282830"); });
    R(c, 86, 14, 34, 22, "#303038"); R(c, 86, 14, 34, 3, "#585868"); disc(c, 94, h - 8, 5, "#c03030"); disc(c, 112, h - 8, 5, "#c03030");
    R(c, 124, 6, w - 128, 30, "#3a6a50"); R(c, 124, 6, w - 128, 3, "#5a8a70"); for (var x = 128; x < w - 10; x += 12) R(c, x, 12, 8, 9, "#d8e8f0");
    disc(c, 136, h - 8, 5, "#282830"); disc(c, w - 16, h - 8, 5, "#282830");
  });

  S.shelter = inked(function (c, w, h) {           // 防空洞: a grassy concrete mound with a dark doorway
    for (var y = 0; y < h; y++) { var hw = Math.round((w / 2 - 2) * Math.sqrt(Math.min(1, (y + 6) / (h * .7)))); R(c, w / 2 - hw, y, hw * 2, 1, y < 14 ? GREEN[1] : "#a8a8a0"); if (y < 14) R(c, w / 2 - hw, y, Math.round(hw * .6), 1, GREEN[0]); }
    R(c, w / 2 - 12, h - 22, 24, 22, "#a0a098"); R(c, w / 2 - 9, h - 19, 18, 19, "#181818"); R(c, 6, h - 3, w - 12, 3, "#888880");
  });

  // ---- outlines for the scenery pieces that were already detailed ------------------------------
  ["shimen_dam", "suspension", "lovers_bridge", "mazu_statue", "turbine", "sedan"].forEach(function (n) { if (S[n]) S[n] = inked(S[n]); });

  // ---- 峇里島 -----------------------------------------------------------------------------------
  var THATCH = ["#5a5048", "#3a322c", "#2a2420", "#18140f"], STRAW = ["#f0d890", "#d0b060", "#a88838", "#705818"];
  function meru(c, cx, y, tiers, w0, P) {               // stacked thatched roofs of a Balinese shrine
    for (var t = 0; t < tiers; t++) {
      var tw = w0 - t * Math.round(w0 / (tiers + 1)), ty = y - t * 7;
      for (var r = 0; r < 6; r++) { var hw = Math.round(tw / 2 - (5 - r) * 1.2); R(c, cx - hw, ty + r, hw * 2, 1, r === 5 ? P[3] : r % 2 ? P[1] : P[0]); }
      R(c, cx - 3, ty + 6, 6, 1, P[2]);
    }
    R(c, cx - 1, y - tiers * 7 - 2, 2, 4, GOLD[1]);
  }
  S.tanahlot = inked(function (c, w, h, f) {       // 海神廟: a temple on a rock in the surf
    var cx = w / 2;
    seaBg(c, w, h, f);
    for (var y = 40; y < h - 8; y++) { var hw = Math.round(w / 2 - 6 - Math.abs(y - 80) * .25); R(c, cx - hw, y, hw * 2, 1, (y % 6) ? "#8a7058" : "#6a5440"); R(c, cx - hw, y, 4, 1, "#a88a6a"); }
    bushes(c, 14, 36, w - 28, 12);
    R(c, 6, h - 10, w - 12, 6, "#f8f8f8"); for (var k = 8; k < w - 8; k += 6) R(c, k + (f ? 2 : 0), h - 6, 3, 2, SEA[0]);
    R(c, cx - 14, 30, 28, 8, "#a87848"); R(c, cx - 12, 22, 24, 9, STONE[1]);
    meru(c, cx, 14, 4, 34, THATCH);
    meru(c, cx - 30, 30, 2, 16, THATCH); meru(c, cx + 30, 30, 2, 16, THATCH);
  });

  S.ubud_palace = inked(function (c, w, h) {       // 烏布皇宮: a split gate of red brick and grey stone, thatched pavilions behind
    var cx = w / 2, B = ["#d87858", "#b85838", "#8a3c24", "#5a2414"], G = ["#c8c4b8", "#a09c90", "#787468", "#504c44"];
    meru(c, 40, 30, 2, 50, THATCH); meru(c, w - 40, 30, 2, 50, THATCH);
    R(c, 20, 32, 40, 30, "#a87848"); R(c, w - 60, 32, 40, 30, "#a87848");
    R(c, 0, 70, w, h - 70, B[1]); for (var y = 74; y < h; y += 4) R(c, 0, y, w, 1, B[2]);
    [[cx - 44, 30], [cx + 14, 30]].forEach(function (p) {
      for (var t = 0; t < 7; t++) { var tw = p[1] - t * 3, tx = p[0] + Math.round((p[1] - tw) / 2); R(c, tx, 20 + t * 10, tw, 10, t % 2 ? G[1] : B[1]); R(c, tx, 20 + t * 10, tw, 2, t % 2 ? G[0] : B[0]); R(c, tx + tw - 3, 20 + t * 10, 3, 10, t % 2 ? G[2] : B[2]); }
      R(c, p[0] + Math.round(p[1] / 2) - 2, 10, 4, 10, G[1]);
    });
    R(c, cx - 14, 40, 28, h - 40, "#3a2818"); R(c, cx - 12, 44, 24, h - 44, "#c8a040"); R(c, cx - 1, 44, 2, h - 44, "#806020");
    for (var g = cx - 10; g < cx + 10; g += 5) R(c, g, 50, 3, 3, GOLD[0]);
    R(c, cx - 16, 30, 32, 10, G[1]); meru(c, cx, 24, 2, 36, THATCH);
    [12, w - 22].forEach(function (x) { R(c, x + 4, h - 20, 2, 20, WOOD[2]); disc(c, x + 5, h - 24, 6, "#40a050"); dots(c, "#f8f8f8", [x + 2, h - 26, x + 7, h - 22, x + 5, h - 28]); });
  });

  S.villa = inked(function (c, w, h) {             // a thatched villa on stilts, open to the sea breeze
    var cx = w / 2;
    R(c, 8, h - 8, w - 16, 8, "#c8a878"); R(c, 8, h - 8, w - 16, 1, "#e8c898");
    R(c, 14, 38, w - 28, h - 46, "#f0e0c0"); for (var x = 16; x < w - 14; x += 22) column(c, x, 38, 5, h - 46, WOOD);
    R(c, cx - 12, 46, 24, h - 54, WOOD[2]); R(c, cx - 10, 48, 20, h - 56, "#c89058"); R(c, cx - 1, 48, 2, h - 56, WOOD[2]);
    for (var y = 0; y < 34; y++) { var hw = Math.round(14 + y * (w / 2 - 14) / 33); R(c, cx - hw, 4 + y, hw * 2, 1, y % 4 === 3 ? STRAW[2] : STRAW[1]); R(c, cx - hw, 4 + y, 3, 1, STRAW[0]); R(c, cx + hw - 3, 4 + y, 3, 1, STRAW[2]); }
    for (var k = 4; k < w - 4; k += 3) px(c, k, 38, STRAW[3]);
    R(c, cx - 14, 0, 28, 5, STRAW[3]);
  });

  // ---- 召會聚會所、青青會館 -----------------------------------------------------------------------
  S.church_hall = inked(function (c, w, h) {       // a plain meeting hall: cream tiles, wide glass doors, a name board
    var P = ["#fff8e8", "#f0e4c8", "#d0c0a0", "#a08c68"], cx = w / 2;
    R(c, 4, 18, w - 8, h - 18, P[1]); R(c, 4, 18, 3, h - 18, P[0]); R(c, w - 7, 18, 3, h - 18, P[2]);
    R(c, 0, 12, w, 7, "#8a5a40"); R(c, 0, 12, w, 2, "#b07a58");
    for (var x = 12; x < w - 16; x += 20) if (Math.abs(x + 6 - cx) > 26) { sash(c, x, 26, 12, 14, P[3]); sash(c, x, 52, 12, 14, P[3]); }
    R(c, cx - 22, h - 34, 44, 34, "#88b0d0"); for (var g = cx - 20; g < cx + 22; g += 11) R(c, g, h - 34, 1, 34, "#5878a0");
    R(c, cx - 24, h - 38, 48, 4, P[3]);
    R(c, cx - 24, 24, 48, 14, "#f8f8f0"); R(c, cx - 22, 26, 44, 10, "#2850a0"); for (var k = cx - 18; k < cx + 18; k += 7) R(c, k, 28, 5, 6, "#f8f8f0");
    R(c, 4, h - 4, w - 8, 4, STONE[1]);
  });

  S.chapel = inked(function (c, w, h) {            // a white wedding chapel: steep gable, rose window, bell tower and cross
    var cx = w / 2;
    R(c, 10, 46, w - 20, h - 46, PLASTER[0]); R(c, w - 16, 46, 6, h - 46, PLASTER[2]);
    for (var y = 0; y < 30; y++) { var hw = Math.round(6 + y * (w / 2 - 6) / 29); R(c, cx - hw, 18 + y, hw * 2, 1, y % 4 === 3 ? "#7a8aa0" : "#98a8c0"); R(c, cx - hw, 18 + y, 2, 1, "#c0d0e0"); }
    R(c, cx - 8, 4, 16, 20, PLASTER[0]); R(c, cx + 4, 4, 4, 20, PLASTER[2]); arched(c, cx - 4, 8, 8, 12, "#c8a040");
    R(c, cx - 1, 0, 2, 6, GOLD[1]); R(c, cx - 3, 1, 6, 2, GOLD[1]);
    disc(c, cx, 58, 9, "#c8a040"); disc(c, cx, 58, 7, "#e898b0"); disc(c, cx, 58, 3, "#f8e070");
    for (var x = 18; x < w - 22; x += 22) if (Math.abs(x + 4 - cx) > 14) arched(c, x, 58, 8, 20, "#d8c8a8");
    arched(c, cx - 10, h - 28, 20, 28, "#d8c8a8"); R(c, cx - 8, h - 18, 16, 18, "#f8f0e0");
    [[cx - 18, h - 30], [cx + 14, h - 30]].forEach(function (p) { for (var k = 0; k < 6; k++) disc(c, p[0] + (k % 2) * 3, p[1] + k * 5, 3, k % 2 ? "#f8f8f8" : "#f0a0b8"); });
  });

  S.banquet = inked(function (c, w, h) {           // the banquet hall: warm windows, a chandelier, a garden canopy
    var P = ["#fff8f0", "#f0e8dc", "#d0c4b0", "#a09078"], cx = w / 2;
    R(c, 4, 26, w - 8, h - 26, P[1]); R(c, 4, 26, 3, h - 26, P[0]); R(c, w - 7, 26, 3, h - 26, P[2]);
    roof(c, 0, 10, w, 17, 12, ["#c88870", "#a05840", "#784030", "#4a2018"], 2);
    R(c, 10, 34, w - 20, 42, "#f8e0a0"); for (var g = 12; g < w - 10; g += 14) R(c, g, 34, 2, 42, P[1]);
    for (var l = 24; l < w - 20; l += 42) { R(c, l, 38, 1, 4, GOLD[2]); R(c, l - 5, 42, 11, 3, GOLD[1]); dots(c, "#fff8d0", [l - 4, 45, l, 46, l + 4, 45]); }
    R(c, cx - 14, h - 30, 28, 30, "#283848"); R(c, cx - 12, h - 28, 24, 28, "#f8e0a0"); R(c, cx - 1, h - 28, 2, 28, P[3]);
    for (var a = cx - 20; a < cx + 20; a += 5) R(c, a, h - 36, 3, 5, a % 2 ? "#f8f8f8" : "#f0a0b8");
    R(c, 4, h - 4, w - 8, 4, STONE[1]);
  });

  S.fountain = inked(function (c, w, h, f) {       // a round stone fountain
    var cx = w / 2;
    for (var y = 0; y < 22; y++) { var hw = Math.round((w / 2 - 2) * Math.sqrt(1 - Math.pow((y - 11) / 11, 2))); R(c, cx - hw, h - 26 + y, hw * 2, 1, STONE[1]); }
    for (y = 0; y < 16; y++) { var hw2 = Math.round((w / 2 - 6) * Math.sqrt(1 - Math.pow((y - 8) / 8, 2))); R(c, cx - hw2, h - 23 + y, hw2 * 2, 1, f ? "#68b0e8" : "#58a0e0"); }
    R(c, cx - 3, 18, 6, h - 34, STONE[0]); R(c, cx - 10, 22, 20, 4, STONE[1]);
    for (var k = 0; k < 5; k++) { R(c, cx - 1, 4 + k * 3, 2, 3, "#a8d8f8"); px(c, cx - 4 - k + (f ? 1 : 0), 8 + k * 3, "#a8d8f8"); px(c, cx + 3 + k - (f ? 1 : 0), 8 + k * 3, "#a8d8f8"); }
  });

  // ---- 林家花園 ---------------------------------------------------------------------------------
  var GREYT = ["#8890a0", "#606878", "#485060", "#303848"];
  S.fangjian = inked(function (c, w, h, f) {       // 方鑑齋: the little stage across the square pond
    R(c, 0, 16, w, h - 16, SEA[0]); for (var y = 20; y < h; y += 6) R(c, 6 + (f ? 3 : 0), y, 10, 1, "#a8d0f8");
    R(c, 20, 30, w - 40, 4, STONE[1]);
    [24, w - 30].forEach(function (x) { column(c, x, 14, 5, 18, REDP); });
    R(c, 28, 16, w - 56, 14, "#5a1c10"); R(c, 30, 18, w - 60, 10, "#c89058");
    A.swallowRoof(c, 14, 2, w - 28, 12, GREYT[1], GREYT[2], REDP[2], false);
  });

  S.jigu = inked(function (c, w, h) {              // 汲古書屋: the library, a round moon gate and lattice windows
    var cx = w / 2;
    R(c, 4, 34, w - 8, h - 34, PLASTER[1]); R(c, w - 8, 34, 4, h - 34, PLASTER[2]);
    disc(c, cx, h - 18, 16, BRICK[1]); disc(c, cx, h - 18, 13, "#3a2818"); R(c, cx - 13, h - 18, 26, 18, "#3a2818"); R(c, cx - 16, h - 18, 3, 18, BRICK[1]); R(c, cx + 13, h - 18, 3, 18, BRICK[1]);
    A.lattice(c, 14, 46, 24, 22); A.lattice(c, w - 38, 46, 24, 22);
    A.swallowRoof(c, 2, 18, w - 4, 16, GREYT[1], GREYT[2], REDP[2], true);
    plaque(c, cx - 14, 36, 28, 7);
  });

  S.dingjing = inked(function (c, w, h) {          // 定靜堂: the big courtyard house, gate hall in front, side wings behind
    var cx = w / 2;
    [[0, 44], [w - 44, 44]].forEach(function (p) { bricks(c, p[0] + 2, 46, p[1] - 4, h - 46, BRICK); A.swallowRoof(c, p[0], 32, p[1], 14, GREYT[1], GREYT[2], REDP[2], false); A.lattice(c, p[0] + 12, 60, 20, 18); });
    A.swallowRoof(c, 30, 10, w - 60, 14, GREYT[1], GREYT[2], REDP[2], true);
    R(c, 36, 24, w - 72, 20, PLASTER[1]);
    R(c, 40, 56, w - 80, h - 56, PLASTER[0]); R(c, w - 44, 56, 4, h - 56, PLASTER[2]);
    A.hall(c, cx - 26, 62, 52, h - 62, REDP[2], REDP[1], true);
    A.swallowRoof(c, 36, 42, w - 72, 16, GREYT[1], GREYT[2], REDP[2], true);
    plaque(c, cx - 16, 56, 32, 7);
  });

  S.moonwater = inked(function (c, w, h, f) {      // 月波水榭: two diamond pavilions joined on the water
    R(c, 0, 0, w, h, SEA[0]); for (var y = 4; y < h; y += 7) R(c, 4 + (f ? 3 : 0), y, 10, 1, "#a8d0f8");
    [20, w - 20].forEach(function (cx) {
      for (var i = 0; i < 14; i++) { R(c, cx - i - 1, 8 + i, i * 2 + 2, 1, i % 3 === 2 ? GREYT[2] : GREYT[1]); R(c, cx - i - 1, 34 - i, i * 2 + 2, 1, PLASTER[1]); }
      R(c, cx - 13, 21, 26, 2, GREYT[3]);
      column(c, cx - 2, 22, 4, 14, REDP);
    });
    R(c, 30, 26, w - 60, 4, WOOD[1]); R(c, 0, h - 10, w, 2, STONE[1]);
  });

  S.guanjia = inked(function (c, w, h, f) {        // 觀稼樓: a two-storey lookout tower by the pond
    var cx = w / 2;
    R(c, 0, h - 10, w, 10, SEA[0]); R(c, 4 + (f ? 3 : 0), h - 5, 12, 1, "#a8d0f8");
    R(c, 10, 36, w - 20, h - 46, PLASTER[1]); R(c, w - 14, 36, 4, h - 46, PLASTER[2]);
    R(c, cx - 7, h - 28, 14, 18, "#5a1c10");
    A.swallowRoof(c, 4, 26, w - 8, 10, GREYT[1], GREYT[2], REDP[2], false);
    R(c, 16, 14, w - 32, 12, REDP[1]); A.lattice(c, 20, 16, w - 40, 8);
    A.swallowRoof(c, 10, 4, w - 20, 10, GREYT[1], GREYT[2], REDP[2], true);
  });

  // ---- 東海大學 (11/10 擴充) ---------------------------------------------------------------------
  var TANG = ["#9098a0", "#5e666e", "#454c54", "#2c3238"], CLAY = ["#c8907a", "#a86a54", "#80503e", "#583428"];
  S.bell_tower = inked(function (c, w, h) {        // 畢律斯鐘樓: a tall brick tower, an open belfry, a low tiled cap
    var cx = w / 2;
    bricks(c, 10, 28, w - 20, h - 28, ["#b8a8a0", "#98887c", "#786a60", "#504640"]);
    R(c, 10, 28, 2, h - 28, PLASTER[0]); R(c, w - 12, 28, 2, h - 28, PLASTER[2]);
    for (var y = 44; y < h - 10; y += 22) R(c, cx - 3, y, 6, 10, "#384048");
    R(c, 8, 12, w - 16, 18, PLASTER[1]); R(c, 12, 14, w - 24, 14, "#283038");
    R(c, cx - 5, 15, 10, 9, "#b88a30"); R(c, cx - 6, 23, 12, 2, "#8a6420"); px(c, cx - 3, 16, "#e8c070");
    R(c, 8, 28, w - 16, 2, PLASTER[2]);
    roof(c, 4, 4, w - 8, 9, 10, TANG, 2); R(c, cx - 1, 0, 2, 4, TANG[3]);
    R(c, 6, h - 4, w - 12, 4, STONE[1]);
  });

  function tangCollege(c, w, h, sign) {             // 文學院、理學院: low Tang-style halls, grey tiles over brick and white walls
    var cx = w / 2;
    R(c, 2, h - 6, w - 4, 6, STONE[1]); R(c, 2, h - 6, w - 4, 1, STONE[0]);
    bricks(c, 6, 46, w - 12, h - 52, CLAY);
    R(c, 6, 28, w - 12, 18, PLASTER[0]); R(c, w - 10, 28, 4, 18, PLASTER[2]);
    for (var x = 12; x < w - 18; x += 18) if (Math.abs(x + 6 - cx) > 18) { R(c, x, 31, 12, 12, WOOD[2]); R(c, x + 1, 32, 10, 10, "#c8a878"); R(c, x + 6, 32, 1, 10, WOOD[2]); R(c, x + 1, 37, 10, 1, WOOD[2]); }
    for (var p = 8; p < w - 8; p += 18) R(c, p, 28, 3, h - 34, WOOD[2]);
    R(c, cx - 14, 34, 28, h - 40, WOOD[3]); R(c, cx - 12, 36, 24, h - 42, "#a88050"); R(c, cx - 1, 36, 2, h - 42, WOOD[3]);
    stairs(c, cx - 12, h - 6, 24, 6, STONE);
    roof(c, 0, 10, w, 19, 14, TANG, 5);
    R(c, cx - 16, 20, 32, 7, "#f4ecd8"); for (var k = cx - 13; k < cx + 13; k += 6) R(c, k, 21, 4, 5, sign);
  }
  S.arts_college = inked(function (c, w, h) { tangCollege(c, w, h, "#283040"); });
  S.science_college = inked(function (c, w, h) { tangCollege(c, w, h, "#2a5a8a"); });

  S.dairy_barn = inked(function (c, w, h) {        // 東海牧場: the red barn and its milk shop
    var cx = w / 2;
    R(c, 6, 26, w - 12, h - 26, "#c83830"); for (var x = 8; x < w - 6; x += 4) R(c, x, 26, 1, h - 26, "#a82820");
    R(c, 6, 26, 2, h - 26, PLASTER[0]); R(c, w - 8, 26, 2, h - 26, PLASTER[0]);
    for (var y = 0; y < 22; y++) { var hw = Math.round(6 + y * (w / 2 - 4) / 21); R(c, cx - hw, 4 + y, hw * 2, 1, y % 4 === 3 ? "#585868" : "#707080"); }
    for (var g = 0; g < 14; g++) R(c, cx - g, 12 + g, g * 2, 1, "#c83830");
    R(c, cx - 6, 16, 12, 8, PLASTER[0]); R(c, cx - 4, 18, 8, 4, "#5878a0");
    R(c, cx - 12, h - 24, 24, 24, PLASTER[0]); R(c, cx - 10, h - 22, 20, 22, "#7a4a28"); R(c, cx - 10, h - 22, 20, 1, PLASTER[0]);
    for (var d = 0; d < 20; d++) { px(c, cx - 10 + d, h - 22 + d, PLASTER[0]); px(c, cx + 9 - d, h - 22 + d, PLASTER[0]); }
    R(c, 10, 32, 14, 10, "#f8f8f8"); R(c, 14, 30, 6, 3, "#f8f8f8"); R(c, 12, 35, 10, 4, "#4888d0");                // milk bottle
  });

  // a black-and-white dairy cow for the farm
  var oldAnimal = A.animal, cows = {};
  A.animal = function (kind, frame) {
    if (kind !== "holstein") return oldAnimal(kind, frame);
    var key = frame % 2;
    if (!cows[key]) {
      var cv = A.mk(16, 16), c = cv.getContext("2d");
      R(c, 3, 5, 11, 7, "#f8f8f8"); R(c, 5, 5, 4, 4, "#202020"); R(c, 10, 8, 3, 4, "#202020");
      R(c, 0, 4, 4, 5, "#f8f8f8"); R(c, 0, 4, 2, 2, "#202020"); R(c, 0, 7, 3, 2, "#f0a8a8"); R(c, 0, 2, 1, 2, "#c8c0b0"); R(c, 3, 2, 1, 2, "#c8c0b0");
      R(c, 4, 12, 2, 4, "#202020"); R(c, 11, 12, 2, 4 - key, "#202020"); R(c, 7, 12, 3, 2, "#f0a8a8"); R(c, 14, 6, 1, 4, "#202020");
      cows[key] = cv;
    }
    return cows[key];
  };

  // the Little Prince: a green coat, a yellow scarf, golden hair
  A.OUTFIT.prince = { top: "#3a9a58", leg: "#3a9a58", shoe: "#5a3818", paint: function (c, d) { if (d !== "u") { R(c, 5, 9, 6, 2, "#f0c030"); R(c, d === "l" ? 11 : 2, 9, 3, 5, "#f0c030"); } else R(c, 6, 9, 4, 1, "#f0c030"); } };
  A.NPC.prince = { sex: "m", hair: "cover", hairColor: "#f0d050", head: "none", outfit: "prince" };
  A.NPC.student = { sex: "f", hair: "bun", head: "none", outfit: "uniform" };

  A.GLOW_STAMP.music_tower = 1;

  // overworld minis
  var L = A.LANDMARK;
  L.kaohsiung = ["music_tower", 6, 8];
})(Art);
