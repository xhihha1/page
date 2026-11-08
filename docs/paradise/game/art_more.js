/* 樂園 art, second set: temples, landmarks, animals, the zoo. Drawn in code like art.js, loaded right after it.
   The reference sheet only guided silhouettes and colours (swallowtail ridges, dragon pillars, tiered roofs…). */
(function (A) {
  "use strict";
  var R = A.R, C = A.C, dots = A.dots, windows = A.windows, doorway = A.doorway, S = A.S;
  var GOLD = C.gold, RED = "#c82820", RED2 = "#901810", TILE_O = "#d86828", TILE_O2 = "#a84818", GREEN = "#2a8a50";

  // ---- building blocks --------------------------------------------------------
  /* Temple roof with a swallowtail ridge: the ends of the ridge curl up and fork. */
  function swallowRoof(c, x, y, w, h, col, col2, ridge, deco) {
    for (var i = 0; i < h; i++) {
      var inset = Math.round((h - 1 - i) * 0.6);
      R(c, x + inset, y + i, w - inset * 2, 1, i % 3 === 2 ? col2 : col);
    }
    R(c, x - 2, y + h - 2, 4, 2, col); R(c, x + w - 2, y + h - 2, 4, 2, col);        // flared eaves
    R(c, x - 3, y + h - 4, 2, 2, col2); R(c, x + w + 1, y + h - 4, 2, 2, col2);
    R(c, x + 4, y - 2, w - 8, 3, ridge);
    for (var k = 0; k < 6; k++) {
      var up = Math.round(k * k / 5);
      R(c, x + 4 - k, y - 2 - up, 1, 2, ridge); R(c, x + w - 5 + k, y - 2 - up, 1, 2, ridge);
    }
    R(c, x - 2, y - 11, 2, 3, ridge); R(c, x + w, y - 11, 2, 3, ridge);              // the forked tips
    if (deco !== false) {
      R(c, x + w / 2 - 2, y - 7, 4, 5, GOLD); R(c, x + w / 2 - 1, y - 9, 2, 2, RED);   // pearl and gourd
      dots(c, GREEN, [x + w / 2 - 8, y - 3, x + w / 2 - 10, y - 4, x + w / 2 + 7, y - 3, x + w / 2 + 9, y - 4]);
      dots(c, GOLD, [x + w / 2 - 12, y - 3, x + w / 2 + 11, y - 3]);
    }
    R(c, x, y + h - 1, w, 1, C.dark);
  }

  /* Wooden hall front: pillars, lattice windows, a double door with door guardians. */
  function hall(c, x, y, w, h, wall, pillar, guardians) {
    R(c, x, y, w, h, wall);
    for (var px = x + 2; px < x + w - 3; px += 12) R(c, px, y, 3, h, pillar);
    var dw = Math.min(26, w - 16), dx = x + (w - dw) / 2;
    R(c, dx - 1, y + 4, dw + 2, h - 4, C.dark); R(c, dx, y + 5, dw, h - 5, RED2);
    R(c, dx + dw / 2, y + 5, 1, h - 5, C.dark);
    if (guardians) {
      R(c, dx + 3, y + 9, dw / 2 - 6, h - 14, "#3858a8"); R(c, dx + 4, y + 7, dw / 2 - 8, 3, "#e8b088");
      R(c, dx + dw / 2 + 3, y + 9, dw / 2 - 6, h - 14, "#38884a"); R(c, dx + dw / 2 + 4, y + 7, dw / 2 - 8, 3, "#e8b088");
    }
    for (var i = 0; i < dw; i += 4) R(c, dx + i, y + 6, 2, 1, GOLD);
    if (w > dw + 24) { lattice(c, x + 6, y + 6, (dx - x) - 12, h - 12); lattice(c, dx + dw + 6, y + 6, (dx - x) - 12, h - 12); }
  }

  function lattice(c, x, y, w, h) {
    if (w < 6 || h < 6) return;
    R(c, x, y, w, h, "#5a2a14");
    for (var j = y + 1; j < y + h; j += 3) for (var i = x + 1 + (j % 2); i < x + w - 1; i += 3) R(c, i, j, 1, 1, "#c89058");
  }

  function steps(c, x, y, w, n, col, col2) {
    for (var i = 0; i < n; i++) { R(c, x - i * 2, y + i * 2, w + i * 4, 2, i % 2 ? col2 : col); }
  }

  function lanterns(c, x, y, n, gap) {
    for (var i = 0; i < n; i++) { var lx = x + i * gap; R(c, lx + 2, y, 1, 2, C.dark); R(c, lx, y + 2, 5, 6, RED); R(c, lx + 1, y + 1, 3, 8, RED); R(c, lx + 1, y + 4, 3, 1, GOLD); }
  }

  function dragonPillar(c, x, y, h) {
    R(c, x, y, 5, h, "#b8b0a0");
    for (var j = 0; j < h; j += 6) { R(c, x - 1, y + j, 3, 3, GREEN); R(c, x + 3, y + j + 3, 3, 3, GREEN); dots(c, GOLD, [x, y + j + 1, x + 4, y + j + 4]); }
  }

  /* Chinese pavilion roof with tips that turn up. */
  function pavilionRoof(c, x, y, w, h, col, col2) {
    for (var i = 0; i < h; i++) { var inset = Math.round((h - 1 - i) * 0.9); R(c, x + inset, y + i, w - inset * 2, 1, i % 2 ? col2 : col); }
    R(c, x - 3, y + h - 3, 4, 2, col); R(c, x + w - 1, y + h - 3, 4, 2, col); R(c, x - 4, y + h - 5, 2, 2, col2); R(c, x + w + 2, y + h - 5, 2, 2, col2);
    R(c, x + w / 2 - 1, y - 4, 2, 4, GOLD);
  }

  function balustrade(c, x, y, w, col) { R(c, x, y, w, 2, col); for (var i = x; i < x + w; i += 4) R(c, i, y + 2, 1, 4, col); R(c, x, y + 6, w, 1, col); }

  // ---- temples and halls -----------------------------------------------------------
  S.temple = function (c, w, h) {           // 霞海城隍廟 (4×5 tiles)
    R(c, 0, h - 6, w, 6, "#a8a098"); steps(c, 12, h - 6, w - 24, 3, "#c8c0b8", "#a8a098");
    hall(c, 4, 34, w - 8, h - 40, "#d8c8a8", RED, true);
    lanterns(c, 6, 36, 2, w - 17);
    swallowRoof(c, 2, 20, w - 4, 14, TILE_O, TILE_O2, RED, true);
    R(c, w / 2 - 10, 30, 20, 5, C.dark); R(c, w / 2 - 9, 31, 18, 3, GOLD);           // name board
    dragonPillar(c, 6, 36, h - 42); dragonPillar(c, w - 11, 36, h - 42);
  };

  S.laiqing = function (c, w, h) {           // 來青閣: two storeys
    R(c, 0, h - 4, w, 4, "#a8a098");
    hall(c, 8, 64, w - 16, h - 68, C.cream, "#8a3820", false);
    lattice(c, 20, 70, 40, 18); lattice(c, w - 60, 70, 40, 18);
    swallowRoof(c, 4, 48, w - 8, 16, C.slate, C.slate2, "#5a6070", false);
    R(c, 26, 26, w - 52, 24, C.cream); for (var i = 30; i < w - 30; i += 14) R(c, i, 26, 3, 24, "#8a3820");
    lattice(c, 36, 30, w - 72, 14); balustrade(c, 24, 42, w - 48, "#8a3820");
    swallowRoof(c, 20, 10, w - 40, 16, C.slate, C.slate2, "#5a6070", true);
  };

  S.fangjian = function (c, w, h) {          // 方鑑齋 stage across the pond
    R(c, 0, 0, w, h, C.water);
    R(c, 14, 22, w - 28, h - 22, "#a8a098");
    for (var i = 18; i < w - 18; i += 16) R(c, i, 24, 3, h - 26, "#8a3820");
    swallowRoof(c, 10, 8, w - 20, 14, C.slate, C.slate2, "#5a6070", true);
  };

  S.jigu = function (c, w, h) {
    R(c, 0, h - 4, w, 4, "#a8a098");
    hall(c, 6, 28, w - 12, h - 32, C.cream, "#8a3820", false);
    for (var i = 0; i < 3; i++) { R(c, 18 + i * 40, 36, 14, 14, "#5a2a14"); R(c, 20 + i * 40, 38, 10, 10, C.cream); R(c, 24 + i * 40, 38, 2, 10, "#5a2a14"); }  // book-shaped windows
    swallowRoof(c, 2, 12, w - 4, 16, C.slate, C.slate2, "#5a6070", true);
  };

  S.dingjing = function (c, w, h) {          // 定靜堂: courtyard house seen from above
    R(c, 0, 0, w, h, "#a8a098");
    R(c, 26, 30, w - 52, h - 44, "#c8b898"); for (var y = 32; y < h - 14; y += 6) R(c, 28, y, w - 56, 1, "#b0a080");
    swallowRoof(c, 8, 12, w - 16, 18, C.slate, C.slate2, "#5a6070", true);
    R(c, 6, 30, 20, h - 36, C.slate); R(c, w - 26, 30, 20, h - 36, C.slate);
    for (var j = 32; j < h - 8; j += 4) { R(c, 6, j, 20, 1, C.slate2); R(c, w - 26, j, 20, 1, C.slate2); }
    R(c, w / 2 - 14, h - 14, 28, 14, "#8a3820"); R(c, w / 2 - 6, h - 12, 12, 12, C.dark);
  };

  S.guanjia = function (c, w, h) {           // 觀稼樓 by the pond
    R(c, 0, 0, w, h, C.water); R(c, 2, h - 12, w - 4, 8, "#a8a098");
    hall(c, 8, 30, w - 16, h - 42, C.cream, "#8a3820", false);
    pavilionRoof(c, 10, 18, w - 20, 12, C.slate, C.slate2);
    R(c, 18, 10, w - 36, 10, C.cream); pavilionRoof(c, 16, 2, w - 32, 9, C.slate, C.slate2);
  };

  S.moonwater = function (c, w, h) {         // 月波水榭: two diamonds joined
    R(c, 0, 0, w, h, C.water);
    for (var d = 0; d < 2; d++) {
      var cx = 20 + d * 38;
      for (var i = 0; i < 16; i++) R(c, cx - i, 10 + i, i * 2 + 2, 1, "#a8a098");
      for (var j = 0; j < 16; j++) R(c, cx - 15 + j, 26 + j, (15 - j) * 2 + 2, 1, "#a8a098");
      pavilionRoof(c, cx - 14, 14, 30, 10, C.slate, C.slate2);
      R(c, cx - 10, 24, 2, 10, "#8a3820"); R(c, cx + 10, 24, 2, 10, "#8a3820");
    }
  };

  S.chihkan = function (c, w, h) {           // 赤崁樓: two pavilions on a brick terrace
    R(c, 0, h - 30, w, 30, C.brick); for (var y = h - 28; y < h; y += 4) R(c, 0, y, w, 1, C.brick2);
    for (var a = 0; a < 3; a++) { var ax = 18 + a * 72; R(c, ax, h - 20, 18, 20, C.dark); R(c, ax + 2, h - 22, 14, 2, C.dark); }
    balustrade(c, 0, h - 36, w, "#e8e0d0");
    for (var i = 0; i < 2; i++) {
      var x = 6 + i * 100;
      hall(c, x + 6, 48, 74, h - 84, RED, RED2, false);
      swallowRoof(c, x + 2, 34, 82, 14, TILE_O, TILE_O2, RED, false);
      R(c, x + 16, 18, 54, 16, RED); for (var k = x + 18; k < x + 70; k += 10) R(c, k, 18, 2, 16, RED2);
      swallowRoof(c, x + 12, 4, 62, 14, TILE_O, TILE_O2, RED, true);
    }
  };

  S.confucius = function (c, w, h) {         // 孔廟大成殿: red walls, double eaves
    R(c, 0, h - 8, w, 8, "#d8d0c0"); steps(c, w / 2 - 20, h - 8, 40, 3, "#e8e0d0", "#c8c0b0");
    hall(c, 10, 52, w - 20, h - 60, RED, RED2, false);
    R(c, w / 2 - 20, 48, 40, 6, C.dark); R(c, w / 2 - 18, 49, 36, 4, GOLD);
    swallowRoof(c, 4, 36, w - 8, 14, TILE_O, TILE_O2, RED, false);
    R(c, 26, 22, w - 52, 14, RED);
    swallowRoof(c, 18, 6, w - 36, 16, TILE_O, TILE_O2, RED, true);
  };

  S.hayashi = function (c, w, h) {           // 林百貨: five floors, rounded corner, rooftop shrine
    R(c, 0, 14, w, h - 14, "#e0d0b0");
    for (var f = 0; f < 5; f++) { var y = 18 + f * 18; R(c, 0, y + 14, w, 2, "#b89878"); windows(c, 8, y + 2, 8, 1, 19, 0, "#90b8d0"); }
    R(c, 0, 14, 8, h - 14, "#d8c098"); R(c, w - 8, 14, 8, h - 14, "#d8c098");
    R(c, 0, h - 18, w, 18, C.glass); R(c, w / 2 - 10, h - 18, 20, 18, C.dark); R(c, 0, h - 20, w, 2, RED2);
    R(c, 10, 8, w - 20, 6, "#b89878"); R(c, w - 44, 0, 24, 9, RED); R(c, w - 46, 0, 28, 2, C.dark); R(c, w - 36, 3, 8, 6, C.dark);
  };

  S.cks_hall = function (c, w, h) {          // 中正紀念堂: white hall, blue octagonal double roof
    steps(c, 30, h - 22, w - 60, 10, C.white, "#d8d8d0");
    R(c, 34, 50, w - 68, h - 72, C.white); R(c, 34, 50, 4, h - 72, "#e0e0d8"); R(c, w - 38, 50, 4, h - 72, "#e0e0d8");
    R(c, w / 2 - 12, 66, 24, h - 88, C.dark); R(c, w / 2 - 14, 64, 28, 3, GOLD); R(c, w / 2 - 12, 66, 24, 4, "#1a2a60");
    for (var t = 0; t < 2; t++) {
      var ww = t ? w - 40 : w - 80, yy = t ? 34 : 12, hh = t ? 16 : 18;
      for (var i = 0; i < hh; i++) { var inset = Math.round((hh - 1 - i) * 0.8); R(c, w / 2 - ww / 2 + inset, yy + i, ww - inset * 2, 1, i % 3 === 2 ? "#183080" : "#2850b0"); }
      R(c, w / 2 - ww / 2 - 2, yy + hh - 2, ww + 4, 2, "#183080"); R(c, w / 2 - ww / 2, yy + hh, ww, 2, C.white);
    }
    R(c, w / 2 - 2, 2, 4, 10, GOLD); R(c, w / 2 - 4, 8, 8, 4, GOLD);
  };

  S.arch = function (c, w, h) {              // 自由廣場牌樓: five openings, blue roof
    R(c, 0, 14, w, 8, C.white); R(c, 0, 22, w, h - 22, C.white);
    var open = [[6, 14], [24, 14], [58, 28], [w - 38, 14], [w - 20, 14]];
    open.forEach(function (o) { var ox = o[0] < 0 ? w + o[0] : o[0]; R(c, ox, 28, o[1], h - 28, "#203858"); R(c, ox, 26, o[1], 2, "#a8a8a0"); });
    for (var i = 0; i < 12; i++) { var inset = Math.round((11 - i) * .6); R(c, inset, 2 + i, w - inset * 2, 1, i % 3 === 2 ? "#183080" : "#2850b0"); }
    R(c, w / 2 - 14, 16, 28, 6, "#203858"); R(c, w / 2 - 12, 17, 24, 4, GOLD);
  };

  S.guest_house = function (c, w, h) {       // 台北賓館: baroque, mansard roof with dormers
    R(c, 0, 26, w, h - 26, C.white); R(c, 0, 24, w, 3, "#c8c0b0");
    R(c, 2, 8, w - 4, 16, C.slate); for (var d = 8; d < w - 12; d += 18) { R(c, d, 10, 8, 10, C.white); R(c, d + 2, 13, 4, 6, C.glass); R(c, d - 1, 8, 10, 3, C.slate2); }
    R(c, w / 2 - 12, 0, 24, 10, C.slate2); R(c, w / 2 - 4, 2, 8, 6, C.white);
    windows(c, 6, 32, 6, 1, 18, 0, C.glass); R(c, w / 2 - 14, 30, 28, h - 30, "#e8e0d0");
    for (var p = 0; p < 4; p++) R(c, w / 2 - 12 + p * 8, 32, 3, h - 34, C.white);
    R(c, w / 2 - 4, h - 16, 8, 16, C.dark);
  };

  function palaceHall(c, w, h, roof, roof2) {  // 國家戲劇院、音樂廳
    R(c, 0, h - 8, w, 8, C.white); balustrade(c, 0, h - 16, w, C.white);
    R(c, 10, 34, w - 20, h - 50, "#f0e8d8");
    for (var i = 16; i < w - 16; i += 14) R(c, i, 34, 5, h - 50, RED);
    R(c, w / 2 - 10, 40, 20, h - 56, C.dark);
    swallowRoof(c, 6, 18, w - 12, 16, roof, roof2, roof2, false);
    R(c, 18, 8, w - 36, 12, roof); R(c, 14, 6, w - 28, 3, roof2);
  }
  S.theater = function (c, w, h) { palaceHall(c, w, h, "#e8b020", "#b88010"); };
  S.concert = function (c, w, h) { palaceHall(c, w, h, "#e8b020", "#b88010"); R(c, w / 2 - 6, 12, 12, 6, RED); };

  S.sysmh = function (c, w, h) {             // 國父紀念館: yellow roof sweeping up at the corners
    R(c, 0, h - 6, w, 6, C.tile2);
    R(c, 12, 34, w - 24, h - 40, "#f0e8d8");
    for (var i = 0; i < 14; i++) R(c, 16 + i * ((w - 36) / 13), 34, 6, h - 40, "#a8a098");
    R(c, w / 2 - 10, 46, 20, h - 52, C.dark);
    for (var x = 0; x < w; x++) {
      var t = Math.abs(x - w / 2) / (w / 2), lift = Math.round(Math.pow(t, 3) * 14);
      R(c, x, 14 - lift + Math.round(t * 4), 1, 18 - Math.round(t * 4), x % 4 ? "#e8b020" : "#c89010");
    }
    R(c, 0, 30, w, 3, "#b88010"); R(c, w / 2 - 30, 6, 60, 10, "#e8b020"); R(c, w / 2 - 30, 6, 60, 2, "#c89010");
  };

  S.tanahlot = function (c, w, h, f) {       // 海神廟: tiered black roofs on a sea rock
    R(c, 0, 0, w, h, C.sea);
    R(c, 6, 52, w - 12, h - 58, "#7a6a50"); R(c, 12, 44, w - 24, 10, "#8a7858"); R(c, 2, 64, w - 4, 20, "#6a5a40");
    dots(c, "#5a4a30", [10, 60, 30, 70, 50, 58, 70, 66, 20, 80, 90, 74]);
    R(c, 14, 38, w - 28, 8, C.leaf); R(c, 8, 40, 8, 8, C.leaf2); R(c, w - 18, 40, 10, 8, C.leaf2);
    for (var k = 0; k < 2; k++) {
      var cx = k ? w - 34 : 34, base = k ? 40 : 38;
      R(c, cx - 1, base - 2, 2, 4, "#5a3a20");
      for (var t = 0; t < 5; t++) { var ww = 22 - t * 4, y = base - 8 - t * 6; R(c, cx - ww / 2, y, ww, 4, "#2a2420"); R(c, cx - ww / 2 + 1, y + 4, ww - 2, 2, "#5a3a20"); }
      R(c, cx - 1, base - 40, 2, 4, GOLD);
    }
    var o = f ? 2 : 0; R(c, 0 + o, h - 8, w, 2, C.white); R(c, 4 - o, h - 20, 18, 2, C.white); R(c, w - 26 + o, h - 16, 20, 2, C.white);
  };

  S.ubud_palace = function (c, w, h) {       // 烏布皇宮 split gate (candi bentar) and stone walls
    R(c, 0, 50, w, h - 50, "#8a7860"); for (var y = 54; y < h; y += 6) R(c, 0, y, w, 1, "#706048");
    var stone = "#a89878", dark = "#706048";
    for (var side = 0; side < 2; side++) {
      for (var k = 0; k < 9; k++) {
        var ww = 44 - k * 4, y2 = 12 + (8 - k) * 6, x = side ? w / 2 + 6 : w / 2 - 6 - ww;
        R(c, x, y2, ww, 6, k % 2 ? stone : "#b8a888"); R(c, side ? x : x + ww - 2, y2, 2, 6, dark);
        dots(c, dark, [x + 4, y2 + 2, x + ww - 6, y2 + 3]);
      }
    }
    R(c, w / 2 - 6, 30, 12, h - 30, "#3a3028"); R(c, 6, 60, 16, 10, GOLD); R(c, w - 22, 60, 16, 10, GOLD);
    R(c, w / 2 - 22, h - 12, 12, 12, "#d84838"); R(c, w / 2 + 10, h - 12, 12, 12, "#d84838");
  };

  S.tunnel_mouth = function (c, w, h) {      // 信二防空洞: stone arch in the hillside
    R(c, 0, 0, w, h, "#4a7040"); dots(c, C.leaf2, [6, 4, 20, 8, 40, 3, 70, 6, 90, 10, 100, 4]);
    R(c, 10, 10, w - 20, h - 10, "#9a9890");
    for (var y = 12; y < h; y += 5) for (var x = 12 + (y % 10 ? 0 : 5); x < w - 12; x += 10) R(c, x, y, 9, 4, "#b0aea8");
    R(c, 22, 22, w - 44, h - 22, C.dark); for (var i = 0; i < 10; i++) R(c, 22 + i, 22 - Math.round(Math.sqrt(100 - (10 - i) * (10 - i))), w - 44 - i * 2, 2, C.dark);
    R(c, w / 2 - 14, 8, 28, 6, "#203040"); R(c, w / 2 - 12, 9, 24, 4, "#e8e0c0");
    dots(c, "#f8f0c0", [w / 2 - 6, 30, w / 2 + 6, 30]);
  };

  S.mine_mouth = function (c, w, h) {
    R(c, 0, 0, w, h, "#7a6048"); dots(c, "#5a4430", [8, 8, 30, 4, 60, 10, 90, 6, 14, 30, 96, 30]);
    R(c, 18, 16, w - 36, h - 16, C.dark);
    R(c, 14, 12, 8, h - 12, C.wood3); R(c, w - 22, 12, 8, h - 12, C.wood3); R(c, 10, 8, w - 20, 8, C.wood3); R(c, 10, 8, w - 20, 2, "#a07040");
    R(c, w / 2 - 16, 0, 32, 8, "#203040"); R(c, w / 2 - 14, 1, 28, 6, GOLD);
    R(c, 22, h - 4, w - 44, 2, C.grey); for (var i = 24; i < w - 24; i += 6) R(c, i, h - 6, 2, 6, C.wood3);
    R(c, w / 2 - 6, h - 16, 12, 8, "#787880"); R(c, w / 2 - 7, h - 8, 3, 3, C.dark); R(c, w / 2 + 4, h - 8, 3, 3, C.dark);   // ore cart
  };

  S.crane = function (c, w, h) {             // 基隆港 gantry crane
    R(c, 0, 0, w, h, C.sea); R(c, 0, h - 10, w, 10, "#787880");
    R(c, 10, 20, 6, h - 30, RED); R(c, w - 22, 20, 6, h - 30, RED); R(c, 6, 18, w - 6, 6, RED); R(c, 0, 12, 16, 4, RED);
    for (var i = 16; i < w - 22; i += 8) R(c, i, 24, 2, 8, RED2);
    R(c, w / 2 - 6, 24, 12, 4, C.dark); R(c, w / 2 - 1, 28, 2, 18, C.dark); R(c, w / 2 - 8, 46, 16, 10, "#3878c8");
  };

  S.longneck = function (c, w, h) {           // brontosaurus skeleton
    R(c, 0, 0, w, h, "#283048"); R(c, 0, h - 4, w, 4, C.tile2);
    var b = "#e8e0c8", k = "#b0a880";
    for (var i = 0; i < 16; i++) R(c, 70 + i * 2.6, 40 - i * 2.3, 5, 3, b);
    R(c, 110, 0, 14, 7, b); R(c, 120, 2, 4, 3, k); dots(c, C.dark, [116, 2]);
    for (var j = 0; j < 9; j++) R(c, 26 + j * 5, 38 - Math.sin(j / 8 * Math.PI) * 6, 5, 3, b);
    for (var r = 0; r < 8; r++) R(c, 30 + r * 5, 42 - Math.sin(r / 7 * Math.PI) * 5, 2, 12, k);
    for (var t = 0; t < 10; t++) R(c, 24 - t * 2.2, 40 + t * 1.8, 3, 2, b);
    R(c, 32, 50, 6, 26, b); R(c, 62, 50, 6, 26, b); R(c, 28, 74, 12, 3, b); R(c, 58, 74, 12, 3, b);
  };

  S.whale = function (c, w, h) {              // blue whale skeleton above the showcases
    R(c, 0, 0, w, h, "#283048"); var b = "#e8e0c8", k = "#b0a880";
    R(c, 4, 10, 22, 10, b); R(c, 6, 12, 18, 2, k);
    for (var i = 0; i < 20; i++) R(c, 28 + i * 3.6, 12 + Math.sin(i / 3) * 1.5, 3, 4, b);
    for (var r = 0; r < 10; r++) R(c, 30 + r * 4, 16, 1, 8, k);
    R(c, w - 14, 6, 10, 4, b); R(c, w - 14, 18, 10, 4, b); R(c, 30, 22, 8, 5, b);
  };

  S.zoo_gate = function (c, w, h) {
    R(c, 0, 10, 10, h - 10, "#a87848"); R(c, w - 10, 10, 10, h - 10, "#a87848"); R(c, 0, 4, w, 10, GREEN);
    R(c, 6, 0, w - 12, 6, "#38a060"); R(c, w / 2 - 30, 6, 60, 6, "#f8f0d0");
    dots(c, C.dark, [w / 2 - 24, 8, w / 2 - 16, 8, w / 2 - 8, 8, w / 2, 8, w / 2 + 8, 8, w / 2 + 16, 8]);
    R(c, 14, h - 12, 18, 12, "#c8a060"); R(c, w - 32, h - 12, 18, 12, "#c8a060");
  };

  S.panda_house = function (c, w, h) {
    R(c, 0, 16, w, h - 16, "#e8e0d0"); R(c, 0, 4, w, 14, "#386838"); for (var i = 0; i < w; i += 6) R(c, i, 4, 3, 14, "#4a8048");
    R(c, w / 2 - 10, h - 20, 20, 20, C.dark);
    R(c, 10, 22, 14, 12, C.white); R(c, 11, 22, 4, 4, C.dark); R(c, 19, 22, 4, 4, C.dark); R(c, 13, 27, 2, 2, C.dark); R(c, 18, 27, 2, 2, C.dark);
  };

  S.gondola = function (c, w, h, f) {         // 貓空纜車
    R(c, 0, 0, w, h, "#88c8e8"); dots(c, C.white, [20, 8, 60, 14, 120, 6]);
    R(c, 0, h - 14, w, 14, C.leaf);
    c.fillStyle = C.dark; for (var x = 0; x < w; x++) c.fillRect(x, 10 + Math.round(x / w * 14), 1, 1);
    R(c, w * .3, 14, 4, h - 28, C.steel2); R(c, w * .75, 20, 4, h - 34, C.steel2);
    for (var k = 0; k < 3; k++) { var cx = ((k * 70 + (f ? 8 : 0)) % w); var cy = 12 + Math.round(cx / w * 14); R(c, cx, cy, 1, 6, C.dark); R(c, cx - 6, cy + 6, 14, 10, k % 2 ? "#e8e8f0" : "#38a060"); R(c, cx - 4, cy + 8, 10, 4, C.glass); }
  };

  S.hill = function (c, w, h) {               // 壽山 slopes behind the zoo
    R(c, 0, 0, w, h, "#88c0e0");
    for (var x = 0; x < w; x++) { var top = Math.round(14 + Math.sin(x / 30) * 8 + Math.sin(x / 11) * 3); R(c, x, top, 1, h - top, x % 3 ? "#4a8a40" : "#3a7a34"); }
    dots(c, C.leaf2, [20, 30, 60, 26, 100, 34, 150, 28, 190, 32, 230, 26]);
  };

  // ---- animals: 16×16, two frames ---------------------------------------------
  var ANIMAL = {
    elephant: function (c, f) { R(c, 2, 4, 12, 8, "#8890a0"); R(c, 0, 4, 4, 6, "#9098a8"); R(c, 0, 9, 2, 5 + f, "#8890a0"); R(c, 3, 12, 3, 4, "#707888"); R(c, 10, 12, 3, 4, "#707888"); R(c, 3, 6, 4, 4, "#a0a8b8"); dots(c, C.dark, [1, 6]); dots(c, C.white, [0, 10]); },
    cow: function (c, f) { R(c, 3, 5, 11, 7, "#3a3028"); R(c, 0, 4, 4, 5, "#3a3028"); R(c, 0, 2, 1, 2, "#c8c0b0"); R(c, 3, 2, 1, 2, "#c8c0b0"); R(c, 4, 12, 2, 4, "#2a2018"); R(c, 11, 12, 2, 4 - f, "#2a2018"); dots(c, C.white, [1, 5]); },
    rhino: function (c, f) { R(c, 2, 5, 13, 7, "#8a8a90"); R(c, 0, 6, 4, 5, "#9a9aa0"); R(c, 0, 4, 1, 3, C.white); R(c, 2, 4, 1, 2, C.white); R(c, 3, 12, 3, 4, "#6a6a70"); R(c, 11, 12, 3, 4, "#6a6a70"); dots(c, C.dark, [3, 7]); },
    tiger: function (c, f) { R(c, 3, 6, 11, 6, "#e8902a"); R(c, 0, 4, 5, 5, "#e8902a"); for (var i = 4; i < 14; i += 3) R(c, i, 6, 1, 6, C.dark); R(c, 14, 5 - f, 2, 4, "#e8902a"); R(c, 4, 12, 2, 4, "#e8902a"); R(c, 11, 12, 2, 4, "#e8902a"); R(c, 1, 7, 3, 2, C.white); dots(c, C.dark, [1, 5, 3, 5]); },
    horse: function (c, f) { R(c, 4, 6, 10, 5, "#a06838"); R(c, 1, 2, 4, 6, "#a06838"); R(c, 3, 1, 2, 4, "#402818"); R(c, 13, 6, 2, 6, "#402818"); R(c, 5, 11, 2, 5, "#805028"); R(c, 11, 11, 2, 5 - f, "#805028"); dots(c, C.dark, [2, 3]); },
    rabbit: function (c, f) { R(c, 4, 8, 8, 6, C.white); R(c, 3, 5, 5, 5, C.white); R(c, 4, 0 + f, 1, 5, C.white); R(c, 6, 0 + f, 1, 5, C.white); R(c, 4, 1 + f, 1, 3, "#f0a0b0"); dots(c, C.red, [4, 7]); R(c, 11, 10, 2, 2, C.white); },
    dog: function (c, f) { R(c, 4, 7, 9, 5, "#c89050"); R(c, 1, 4, 5, 5, "#c89050"); R(c, 1, 3, 2, 3, "#8a5a28"); R(c, 13, 5 - f, 2, 3, "#c89050"); R(c, 5, 12, 2, 4, "#a87038"); R(c, 10, 12, 2, 4, "#a87038"); dots(c, C.dark, [2, 5, 1, 7]); },
    penguin: function (c, f) { R(c, 4, 2, 8, 12, "#202028"); R(c, 6, 5, 4, 9, C.white); R(c, 5, 3, 6, 3, "#202028"); dots(c, C.white, [6, 4, 9, 4]); R(c, 7, 6, 2, 1, "#f0a030"); R(c, 3 - f, 7, 1, 5, "#202028"); R(c, 12 + f, 7, 1, 5, "#202028"); R(c, 5, 14, 2, 1, "#f0a030"); R(c, 9, 14, 2, 1, "#f0a030"); },
    panda: function (c, f) { R(c, 3, 6, 10, 8, C.white); R(c, 3, 9, 10, 3, "#202028"); R(c, 4, 1, 8, 7, C.white); R(c, 3, 0, 3, 3, "#202028"); R(c, 10, 0, 3, 3, "#202028"); R(c, 5, 3, 2, 2, "#202028"); R(c, 9, 3, 2, 2, "#202028"); R(c, 7, 6, 2, 1, "#202028"); R(c, 1, 10 - f, 3, 3, "#202028"); R(c, 12, 10, 3, 3, "#202028"); R(c, 4, 14, 3, 2, "#202028"); R(c, 9, 14, 3, 2, "#202028"); R(c, 12 + f, 3, 3, 1, "#68a838"); },
    monkey: function (c, f) { R(c, 4, 6, 7, 6, "#9a7050"); R(c, 4, 1, 7, 6, "#9a7050"); R(c, 5, 3, 5, 4, "#e8a888"); dots(c, C.dark, [6, 4, 8, 4]); R(c, 2, 2, 2, 3, "#e8a888"); R(c, 11, 2, 2, 3, "#e8a888"); R(c, 11, 8 + f, 4, 2, "#9a7050"); R(c, 14, 6 + f, 2, 3, "#9a7050"); R(c, 4, 12, 2, 4, "#7a5038"); R(c, 9, 12, 2, 4, "#7a5038"); },
    blackbear: function (c, f) { R(c, 2, 5, 12, 8, "#1a1a20"); R(c, 3, 1, 8, 6, "#1a1a20"); R(c, 3, 0, 2, 2, "#1a1a20"); R(c, 9, 0, 2, 2, "#1a1a20"); R(c, 5, 4, 4, 3, "#8a6a50"); R(c, 4, 7, 6, 2, C.white); R(c, 5, 9, 4, 1, C.white); R(c, 3, 13, 3, 3 - f, "#101014"); R(c, 10, 13, 3, 3, "#101014"); dots(c, C.white, [4, 2, 8, 2]); },
    koala: function (c, f) { R(c, 7, 0, 3, 16, "#8a6a40"); R(c, 3, 3, 7, 9, "#9898a0"); R(c, 2, 1, 4, 4, "#9898a0"); R(c, 7, 1, 4, 4, "#9898a0"); R(c, 3, 2, 2, 2, C.white); R(c, 8, 2, 2, 2, C.white); R(c, 5, 5, 3, 3, "#303038"); R(c, 9, 7 + f, 3, 2, "#9898a0"); },
    hippo: function (c, f) { R(c, 2, 5, 13, 8, "#9a7a88"); R(c, 0, 6, 5, 6, "#a88a98"); R(c, 1, 4, 2, 2, "#9a7a88"); R(c, 0, 10 - f, 5, 2, "#e8a0b0"); R(c, 3, 13, 3, 3, "#7a5a68"); R(c, 11, 13, 3, 3, "#7a5a68"); dots(c, C.dark, [2, 7]); },
    giraffe: function (c, f) { R(c, 6, 7, 8, 5, "#e8b848"); R(c, 4 + f, 0, 3, 9, "#e8b848"); R(c, 2 + f, 0, 4, 3, "#e8b848"); R(c, 6, 12, 2, 4, "#c89838"); R(c, 12, 12, 2, 4, "#c89838"); dots(c, "#8a5a20", [7, 8, 10, 9, 12, 8, 5, 3, 5, 6, 9, 10]); dots(c, C.dark, [3 + f, 1]); }
  };
  var animalCache = {};
  A.animal = function (kind, frame) {
    var key = kind + frame, cv = animalCache[key];
    if (cv) return cv;
    cv = A.mk(16, 16); var c = cv.getContext("2d");
    (ANIMAL[kind] || ANIMAL.dog)(c, frame % 2);
    animalCache[key] = cv;
    return cv;
  };

  // NPC presets that use the extra outfits (never offered in the character maker)
  var NPC = A.NPC;
  NPC.pilot = { sex: "m", hair: "side", glasses: false, head: "cap", outfit: "uniform" };
  NPC.attendant = { sex: "f", hair: "bun", glasses: false, head: "cap", outfit: "attendant", capColor: "#284890" };
  NPC.conductor = { sex: "m", hair: "side", glasses: true, head: "cap", outfit: "uniform" };
  NPC.miner = { sex: "m", hair: "side", glasses: false, head: "helmet", outfit: "miner" };
  NPC.monk = { sex: "m", hair: "bald", glasses: false, head: "none", outfit: "robe" };
  NPC.deity = { sex: "m", hair: "bald", glasses: false, head: "crown", outfit: "deity" };
  NPC.elder = { sex: "m", hair: "bald", glasses: false, head: "none", outfit: "deity" };
  NPC.keeper = { sex: "f", hair: "curl", glasses: false, head: "cap", outfit: "miner", capColor: "#38a060" };
  NPC.doctor = { sex: "f", hair: "bun", glasses: true, head: "none", outfit: "doctor" };
  NPC.singer = { sex: "f", hair: "curl", glasses: false, head: "none", outfit: "stage", pose: "sing" };
  NPC.dancer = { sex: "f", hair: "bun", glasses: false, head: "none", outfit: "dance", pose: "dance" };
  NPC.dancer2 = { sex: "m", hair: "side", glasses: false, head: "none", outfit: "dance", pose: "dance" };

  // the stage no longer paints a tiny singer: real performers stand on it now
  S.stage = function (c, w, h, f) {
    R(c, 0, 0, w, h, C.dark); R(c, 6, h - 18, w - 12, 18, "#585868"); R(c, 6, h - 18, w - 12, 2, "#9898a8");
    R(c, 26, 6, w - 52, 34, f % 2 ? "#3848b8" : "#b83888"); R(c, 30, 10, w - 60, 26, f % 2 ? "#5868d8" : "#d858a8");
    for (var i = 0; i < 10; i++) R(c, 10 + i * 22, 1, 6, 4, i % 2 === f % 2 ? GOLD : C.white);
    R(c, 6, 6, 12, h - 24, "#303040"); R(c, w - 18, 6, 12, h - 24, "#303040");
  };

  // ---- 桃園島 ----------------------------------------------------------------------
  NPC.guard = { sex: "m", hair: "side", glasses: false, head: "helmet", helmetColor: "#f8f8f0", helmetEdge: "#c8c8c0", outfit: "uniform" };

  S.shimen_dam = function (c, w, h, f) {      // 石門水庫: a long concrete dam, the spillway pouring on the right
    R(c, 0, 0, w, h, "#a8a8a0");
    for (var y = 9; y < h; y += 6) R(c, 0, y, w, 1, "#909088");
    R(c, 0, 0, w, 5, "#d0d0c8"); R(c, 0, 5, w, 2, "#787870");
    for (var x = 2; x < w; x += 8) R(c, x, 0, 2, 3, C.dark);
    var sx = w - 132;
    R(c, sx, 5, 116, h - 5, "#787870");
    for (var k = 0; k < 6; k++) {
      R(c, sx + 4 + k * 19, 7, 14, h - 7, C.water);
      for (var j = (f ? 3 : 0) + 8; j < h; j += 6) R(c, sx + 5 + k * 19 + (j % 4), j, 10, 2, "#e8f4f8");
      R(c, sx + 2 + k * 19, 5, 2, h - 5, "#d0d0c8");
    }
    R(c, 0, h - 3, w, 3, "#888880");
  };

  function daxi(c, w, h, wall, trim) {        // 大溪老街: a baroque arcade front with a carved gable
    R(c, 0, 12, w, h - 12, wall);
    R(c, 8, 2, w - 16, 12, wall); R(c, 20, 0, w - 40, 3, wall); R(c, 6, 10, w - 12, 3, trim);
    R(c, w / 2 - 6, 3, 12, 7, trim); R(c, w / 2 - 3, 5, 6, 3, RED); dots(c, GREEN, [12, 6, 13, 7, w - 13, 6, w - 14, 7]);
    for (var i = 0; i < 3; i++) { var ax = 7 + i * 18; R(c, ax, 22, 12, 16, C.dark); R(c, ax + 1, 21, 10, 2, C.dark); R(c, ax + 1, 24, 10, 13, C.glass); R(c, ax + 1, 30, 10, 1, C.dark); }
    R(c, 0, 40, w, 3, trim);
    R(c, 0, 44, w, h - 44, C.dark);
    for (var p = 0; p < w; p += 20) R(c, p, 44, 5, h - 44, wall);
    R(c, 9, 52, 8, h - 52, C.wood2); R(c, 29, 52, 8, h - 52, C.wood2); R(c, 49, 52, 8, h - 52, "#a87848");
    R(c, 0, h - 2, w, 2, trim);
  }
  S.daxi0 = function (c, w, h) { daxi(c, w, h, "#e8dcc8", "#b8a888"); };
  S.daxi1 = function (c, w, h) { daxi(c, w, h, "#d89878", "#a86048"); };

  S.tea_factory = function (c, w, h) {        // 大溪老茶廠: white walls, dark roof, a long row of vents on the ridge
    R(c, 0, 44, w, h - 44, C.white); R(c, 0, h - 5, w, 5, "#a0a098");
    for (var i = 0; i < 22; i++) { var inset = Math.round((21 - i) * .5); R(c, inset, 22 + i, w - inset * 2, 1, i % 3 === 2 ? "#303038" : "#484850"); }
    R(c, 18, 6, w - 36, 16, "#484850"); R(c, 14, 4, w - 28, 3, "#303038");
    for (var x = 22; x < w - 26; x += 8) R(c, x, 9, 5, 9, "#88888c");
    windows(c, 10, 54, 11, 1, 19, 0, C.glass);
    R(c, w / 2 - 15, h - 34, 30, 29, C.wood3); R(c, w / 2 - 13, h - 32, 26, 27, C.dark); R(c, w / 2, h - 32, 1, 27, C.wood3);
  };

  function statue(c, w, h, kind) {            // bronze statues on stone plinths
    var B = "#5a4a30", B2 = "#7a6a48";
    R(c, 3, 30, w - 6, h - 30, "#d8d0c0"); R(c, 1, 28, w - 2, 3, "#b8b0a0"); R(c, 3, h - 3, w - 6, 3, "#a8a090");
    if (kind === 0) { R(c, 13, 3, 6, 6, B2); R(c, 11, 9, 10, 13, B); R(c, 12, 22, 3, 6, B); R(c, 17, 22, 3, 6, B); R(c, 21, 6, 2, 8, B); R(c, 22, 4, 2, 3, B2); }
    else if (kind === 1) { R(c, 7, 12, 18, 16, "#4a3a20"); R(c, 11, 9, 10, 11, B); R(c, 13, 3, 6, 6, B2); R(c, 10, 19, 12, 4, B); R(c, 11, 23, 3, 5, B); R(c, 18, 23, 3, 5, B); }
    else if (kind === 2) { R(c, 9, 3, 14, 13, B2); R(c, 11, 6, 2, 2, B); R(c, 19, 6, 2, 2, B); R(c, 5, 16, 22, 12, B); R(c, 14, 16, 4, 6, B2); }
    else { R(c, 3, 14, 22, 8, B); R(c, 22, 6, 6, 10, B); R(c, 26, 4, 4, 5, B2); R(c, 5, 22, 3, 6, B); R(c, 20, 22, 3, 6, B); R(c, 1, 15, 3, 7, B); R(c, 12, 4, 6, 11, B2); R(c, 13, 0, 4, 4, B2); }
  }
  [0, 1, 2, 3].forEach(function (k) { S["statue" + k] = function (c, w, h) { statue(c, w, h, k); }; });

  S.cihu_tomb = function (c, w, h) {          // 慈湖陵寢: a quiet courtyard house, white walls and dark tiles
    R(c, 0, 50, w, h - 50, C.white); R(c, 0, h - 6, w, 6, "#c8c0b0");
    R(c, 0, 46, 44, 8, "#383840"); R(c, w - 44, 46, 44, 8, "#383840"); R(c, 0, 53, 44, 1, C.dark); R(c, w - 44, 53, 44, 1, C.dark);
    R(c, 40, 26, w - 80, h - 32, C.white);
    swallowRoof(c, 36, 16, w - 72, 12, "#404048", "#2c2c34", "#2c2c34", false);
    R(c, w / 2 - 14, h - 40, 28, 34, RED2); R(c, w / 2 - 12, h - 38, 24, 32, RED); R(c, w / 2, h - 38, 1, 32, RED2);
    dots(c, GOLD, [w / 2 - 4, h - 22, w / 2 + 3, h - 22]);
    lattice(c, 50, 36, 22, 14); lattice(c, w - 72, 36, 22, 14);
    for (var x = 8; x < 40; x += 12) R(c, x, 64, 6, 10, "#88a0a8");
    for (x = w - 36; x < w - 4; x += 12) R(c, x, 64, 6, 10, "#88a0a8");
  };

  S.coffin = function (c, w, h) {
    R(c, 0, h - 6, w, 6, "#686870"); R(c, 4, 4, w - 8, h - 9, "#1c1c24"); R(c, 6, 6, w - 12, 3, "#3a3a48");
    dots(c, C.white, [1, h - 9, 2, h - 10, w - 2, h - 9, w - 3, h - 10]); dots(c, GOLD, [2, h - 8, w - 3, h - 8]);
  };

  S.cihu_pavilion = function (c, w, h) {
    R(c, 4, h - 4, w - 8, 4, "#c8c0b0");
    R(c, 10, 22, 4, h - 26, RED); R(c, w - 14, 22, 4, h - 26, RED);
    pavilionRoof(c, 6, 8, w - 12, 14, "#2a6a40", "#1a4a30");
  };

  S.cabin = function (c, w, h) {              // the made-up cabin of the public edition
    R(c, 8, 40, w - 16, h - 40, C.wood2);
    for (var y = 44; y < h; y += 6) R(c, 8, y, w - 16, 1, C.wood3);
    R(c, w - 36, 6, 10, 24, C.brick); R(c, w - 38, 4, 14, 3, C.brick2);
    for (var i = 0; i < 30; i++) { var inset = Math.round((29 - i) * 1.6); R(c, inset, 12 + i, w - inset * 2, 1, i % 4 === 3 ? C.roof2 : C.roof); }
    windows(c, 22, 58, 2, 1, 16, 0); windows(c, w - 54, 58, 2, 1, 16, 0);
    R(c, w / 2 - 9, h - 32, 18, 32, C.wood3); R(c, w / 2 - 7, h - 30, 14, 30, C.dark); R(c, w / 2 + 3, h - 16, 2, 2, GOLD);
  };

  // overworld: each region shows a shrunken copy of its own landmark
  var LANDMARK = {
    home: ["home_bldg", 18, 8], nanya: ["apt_bldg", 12, 7], lin: ["laiqing", 14, 8], xmas: ["xmastree", 6, 8], dihua: ["temple", 4, 5],
    flora: ["flora_hall", 13, 7], railway: ["railhall", 15, 7], ntm: ["ntm_front", 17, 9], paleo: ["trex", 8, 6], nanmen: ["redhouse", 12, 7],
    cks: ["cks_hall", 13, 10], sysmh: ["sysmh", 15, 8], dome: ["bigdome", 19, 10], airport: ["plane", 7, 2], tamsui: ["tamkang", 24, 9],
    beitou: ["hotspring_museum", 10, 7], miramar: ["ferris", 10, 10], northcoast: ["shop0", 4, 5], keelung: ["crane", 6, 6],
    jiufen: ["lantern_house", 4, 5], thu: ["luce", 13, 8], tainan: ["chihkan", 12, 8], bali: ["tanahlot", 7, 8],
    muzha: ["panda_house", 6, 4], shoushan: ["zoo_gate", 8, 4], shimen: ["shimen_dam", 9, 4], daxi: ["daxi1", 4, 5],
    cihu: ["cihu_tomb", 12, 7], cabin: ["cabin", 8, 6]
  };
  var oldStamp = A.stamp;
  A.stamp = function (c, name, w, h, frame) {
    if (name.indexOf("mini_") === 0 && LANDMARK[name.slice(5)]) {
      var l = LANDMARK[name.slice(5)], cv = A.mk(l[1] * 16, l[2] * 16);
      oldStamp(cv.getContext("2d"), l[0], l[1] * 16, l[2] * 16, 0);
      var k = Math.min(w / cv.width, h / cv.height), dw = Math.round(cv.width * k), dh = Math.round(cv.height * k);
      c.imageSmoothingEnabled = false;
      c.drawImage(cv, Math.round((w - dw) / 2), h - dh, dw, dh);
      return;
    }
    oldStamp(c, name, w, h, frame);
  };
})(Art);
