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

  A.GLOW_STAMP.music_tower = 1;

  // overworld minis
  var L = A.LANDMARK;
  L.kaohsiung = ["music_tower", 6, 8];
})(Art);
