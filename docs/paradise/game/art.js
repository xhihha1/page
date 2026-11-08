/* 樂園 pixel art. Everything is drawn in code at 16×16 per tile; no external images.
   Keep the syntax plain: the TV browser may be an old WebView. */
var Art = (function () {
  "use strict";
  var TS = 16, HAIRC = "#302018", SKIN = "#f8c8a0", SKIN2 = "#d8a078";

  function mk(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function dots(c, col, pts) { c.fillStyle = col; for (var i = 0; i < pts.length; i += 2) c.fillRect(pts[i], pts[i + 1], 1, 1); }
  function hash(x, y) { var n = (x * 73856093) ^ (y * 19349663); return (n ^ (n >> 13)) >>> 0; }

  var C = {
    grass: "#88d060", grass2: "#58a848", leaf: "#38883c", leaf2: "#206830", trunk: "#785030",
    sand: "#f0e0a0", sand2: "#d8c080", dirt: "#d8b070", dirt2: "#b89050",
    side: "#c8c8c0", side2: "#a8a8a0", plaza: "#b8b0a8", plaza2: "#a09890", paver: "#c89868", paver2: "#a87848",
    road: "#585860", road2: "#484850", line: "#f0f0e0", wood: "#d8a468", wood2: "#c08c50", wood3: "#905828",
    tile: "#e8e8e0", tile2: "#c8c8c0", carpet: "#c83838", carpet2: "#a02828", conc: "#a0a0a0", conc2: "#888888",
    water: "#58a8e8", water2: "#88c8f8", sea: "#3878d8", sea2: "#68a0e8",
    wall: "#e8d8b8", wall2: "#b8a080", dark: "#282830", white: "#f8f8f0", grey: "#909098", steel: "#a8b0b8", steel2: "#788088",
    brick: "#b84830", brick2: "#883020", gold: "#f0c030", red: "#d83030", blue: "#3060c0", glass: "#90c8e8", glass2: "#c8e8f8",
    cream: "#f0e8d0", roof: "#a03028", roof2: "#782018", slate: "#606878", slate2: "#485060", green: "#40a050"
  };

  // ---- tiles: f(c, frame, x, y) paints one 16×16 tile at the origin -------
  function planks(c) { R(c, 0, 0, 16, 16, C.wood); R(c, 0, 15, 16, 1, C.wood2); R(c, 5, 0, 1, 15, C.wood2); }
  function grass(c, f, x, y) {
    R(c, 0, 0, 16, 16, C.grass);
    var h = hash(x, y);
    dots(c, C.grass2, [2 + (h & 3), 3, 3 + (h & 3), 2, 10, 5 + (h >> 2 & 3), 11, 4 + (h >> 2 & 3), 4, 11 + (h >> 4 & 1), 5, 10 + (h >> 4 & 1), 12, 13, 13, 12]);
  }
  function waterT(col, col2) {
    return function (c, f, x, y) {
      R(c, 0, 0, 16, 16, col);
      var o = (f + x + y) % 2 ? 0 : 4;
      R(c, 1 + o, 4, 4, 1, col2); R(c, 9 - o, 11, 4, 1, col2);
    };
  }
  function furn(paint) { return { floor: true, paint: paint }; }

  var T = {
    grass: grass,
    flowers: function (c, f, x, y) { grass(c, f, x, y); dots(c, C.red, [3, 3, 11, 5, 6, 11]); dots(c, C.white, [2, 3, 4, 3, 3, 2, 3, 4, 10, 5, 12, 5, 11, 4, 11, 6, 5, 11, 7, 11, 6, 10, 6, 12]); },
    tallgrass: function (c) { R(c, 0, 0, 16, 16, C.grass2); for (var i = 0; i < 4; i++) { R(c, 1 + i * 4, 3 + (i % 2) * 6, 1, 5, C.leaf); R(c, 2 + i * 4, 5 + (i % 2) * 6, 1, 3, C.leaf); } },
    sand: function (c, f, x, y) { R(c, 0, 0, 16, 16, C.sand); var h = hash(x, y); dots(c, C.sand2, [h & 15, 4, (h >> 4) & 15, 10, (h >> 8) & 15, 13]); },
    dirt: function (c, f, x, y) { R(c, 0, 0, 16, 16, C.dirt); var h = hash(x, y); dots(c, C.dirt2, [h & 15, 3, (h >> 4) & 15, 9, (h >> 8) & 15, 14, (h >> 12) & 15, 6]); },
    sidewalk: function (c) { R(c, 0, 0, 16, 16, C.side); R(c, 0, 15, 16, 1, C.side2); R(c, 15, 0, 1, 16, C.side2); },
    plaza: function (c, f, x, y) { R(c, 0, 0, 16, 16, (x + y) % 2 ? C.plaza : C.plaza2); },
    pavers: function (c) { R(c, 0, 0, 16, 16, C.paver); R(c, 0, 7, 16, 1, C.paver2); R(c, 0, 15, 16, 1, C.paver2); R(c, 3, 0, 1, 7, C.paver2); R(c, 11, 0, 1, 7, C.paver2); R(c, 7, 8, 1, 7, C.paver2); R(c, 15, 8, 1, 7, C.paver2); },
    rail: function (c) { R(c, 0, 0, 16, 16, "#a89880"); for (var i = 1; i < 16; i += 5) R(c, i, 2, 2, 12, C.wood3); R(c, 0, 4, 16, 1, C.grey); R(c, 0, 11, 16, 1, C.grey); },
    lightway: function (c, f, x) { R(c, 0, 0, 16, 16, C.plaza2); dots(c, f % 2 ? "#f8e870" : "#f88080", [2, 2, 13, 2, 2, 13, 13, 13]); dots(c, f % 2 ? "#80e8f8" : "#f8e870", [7, 7, 8, 8]); },
    road: function (c) { R(c, 0, 0, 16, 16, C.road); dots(c, C.road2, [3, 4, 11, 9, 6, 13]); },
    road_h: function (c) { R(c, 0, 0, 16, 16, C.road); R(c, 2, 7, 8, 2, C.line); },
    road_v: function (c) { R(c, 0, 0, 16, 16, C.road); R(c, 7, 2, 2, 8, C.line); },
    bridge: function (c) { R(c, 0, 0, 16, 16, C.wood); for (var i = 0; i < 16; i += 4) R(c, 0, i, 16, 1, C.wood2); },
    gate: function (c, f) { R(c, 0, 0, 16, 16, C.road); R(c, 1, 1, 14, 14, f % 2 ? C.gold : "#e0a020"); R(c, 3, 3, 10, 10, C.road); R(c, 6, 6, 4, 4, C.gold); },
    wood: planks,
    gatedoor: function (c, f) { R(c, 0, 0, 16, 16, C.steel2); R(c, 2, 0, 12, 16, "#303848"); R(c, 7, 0, 2, 16, C.gold); R(c, 3, 2, 3, 2, f % 2 ? "#50e070" : "#208040"); R(c, 10, 2, 3, 2, f % 2 ? "#208040" : "#50e070"); },
    apron: function (c, f, x) { R(c, 0, 0, 16, 16, "#787880"); if (x % 2) R(c, 7, 0, 2, 8, C.gold); },
    runway: function (c, f, x, y) { R(c, 0, 0, 16, 16, "#505058"); if (y % 2) R(c, 2, 0, 10, 2, C.line); else R(c, 0, 14, 16, 2, C.line); },
    seat: furn(function (c) { R(c, 2, 2, 12, 11, C.blue); R(c, 2, 2, 12, 4, "#284890"); R(c, 3, 13, 2, 3, C.dark); R(c, 11, 13, 2, 3, C.dark); }),
    lantern: function (c, f, x, y) { T.pavers(c); R(c, 7, 0, 2, 3, C.dark); R(c, 3, 3, 10, 9, f % 2 ? "#f04030" : C.red); R(c, 5, 2, 6, 11, f % 2 ? "#f04030" : C.red); R(c, 6, 13, 4, 2, C.gold); },
    tile: function (c) { R(c, 0, 0, 16, 16, C.tile); R(c, 0, 15, 16, 1, C.tile2); R(c, 15, 0, 1, 16, C.tile2); },
    carpet: function (c) { R(c, 0, 0, 16, 16, C.carpet); dots(c, C.carpet2, [4, 4, 12, 4, 8, 8, 4, 12, 12, 12]); },
    concrete: function (c, f, x, y) { R(c, 0, 0, 16, 16, C.conc); var h = hash(x, y); dots(c, C.conc2, [h & 15, 5, (h >> 4) & 15, 11]); },
    door: function (c) { R(c, 0, 0, 16, 16, C.wood2); R(c, 2, 1, 12, 15, C.wood3); R(c, 3, 2, 10, 14, "#a06830"); R(c, 11, 8, 1, 2, C.gold); },
    stairs: function (c) { for (var i = 0; i < 4; i++) { R(c, 0, i * 4, 16, 4, i % 2 ? C.tile2 : C.tile); R(c, 0, i * 4 + 3, 16, 1, C.grey); } },
    mat: function (c) { R(c, 0, 0, 16, 16, C.tile); R(c, 1, 2, 14, 12, "#607088"); R(c, 1, 6, 14, 1, "#485868"); R(c, 1, 10, 14, 1, "#485868"); },
    portal: function (c, f) { R(c, 0, 0, 16, 16, C.tile); R(c, 1, 1, 14, 14, "#2838a0"); R(c, 3, 3, 10, 10, f % 2 ? "#50c8f8" : "#a070f0"); R(c, 5, 5, 6, 6, f % 2 ? "#a070f0" : "#50c8f8"); R(c, 7, 7, 2, 2, C.white); },
    pond: waterT(C.water, C.water2),
    sea: waterT(C.sea, C.sea2),
    tree: function (c, f, x, y) { grass(c, f, x, y); R(c, 6, 11, 4, 5, C.trunk); R(c, 2, 2, 12, 9, C.leaf); R(c, 4, 0, 8, 13, C.leaf); R(c, 1, 4, 14, 5, C.leaf); dots(c, C.green, [5, 3, 6, 3, 9, 5, 10, 5, 4, 8, 5, 8, 11, 9]); dots(c, C.leaf2, [3, 10, 12, 10, 8, 12, 6, 12]); },
    pine: function (c) { R(c, 0, 0, 16, 16, "#202840"); R(c, 7, 13, 2, 3, C.trunk); for (var i = 0; i < 6; i++) R(c, 7 - i, 2 + i * 2, 2 + i * 2, 2, C.leaf2); dots(c, C.white, [7, 3, 5, 7, 10, 9, 4, 11, 12, 12]); },
    hedge: function (c) { R(c, 0, 0, 16, 16, C.leaf); R(c, 0, 13, 16, 3, C.leaf2); dots(c, C.green, [3, 3, 8, 2, 12, 5, 5, 8, 10, 10, 2, 11]); },
    fence: function (c, f, x, y) { grass(c, f, x, y); R(c, 0, 5, 16, 2, C.wood); R(c, 0, 10, 16, 2, C.wood); R(c, 2, 3, 2, 11, C.wood2); R(c, 11, 3, 2, 11, C.wood2); },
    rock: function (c) { R(c, 0, 0, 16, 16, C.water); R(c, 2, 4, 12, 10, C.grey); R(c, 4, 2, 8, 2, C.grey); R(c, 4, 4, 5, 3, "#b8b8c0"); R(c, 2, 12, 12, 2, "#606068"); },
    wall: function (c) { R(c, 0, 0, 16, 16, C.wall); R(c, 0, 0, 16, 3, C.wall2); R(c, 0, 15, 16, 1, C.wall2); },
    whitewall: function (c) { R(c, 0, 0, 16, 16, C.white); R(c, 0, 0, 16, 2, C.tile2); R(c, 0, 14, 16, 2, C.tile2); },
    brickwall: function (c) { R(c, 0, 0, 16, 16, C.brick); R(c, 0, 3, 16, 1, C.brick2); R(c, 0, 7, 16, 1, C.brick2); R(c, 0, 11, 16, 1, C.brick2); R(c, 0, 15, 16, 1, C.brick2); dots(c, C.brick2, [4, 1, 12, 1, 8, 5, 0, 5, 4, 9, 12, 9, 8, 13, 0, 13, 4, 0, 12, 2]); },
    block: function (c) { R(c, 0, 0, 16, 16, C.dark); },
    void: function (c) { R(c, 0, 0, 16, 16, "#101018"); },
    closed_door: function (c) { R(c, 0, 0, 16, 16, C.wall); R(c, 2, 1, 12, 15, C.slate2); R(c, 3, 2, 10, 14, C.slate); R(c, 11, 8, 1, 2, C.gold); },
    elevator: function (c) { R(c, 0, 0, 16, 16, C.steel2); R(c, 1, 1, 14, 15, C.steel); R(c, 7, 1, 2, 15, C.steel2); R(c, 6, 0, 4, 1, C.red); },
    window: function (c) { R(c, 0, 0, 16, 16, C.wall); R(c, 2, 2, 12, 12, C.white); R(c, 3, 3, 10, 10, C.glass); R(c, 7, 3, 2, 10, C.white); dots(c, C.glass2, [4, 4, 5, 5, 10, 4, 11, 5]); },
    glass: function (c) { R(c, 0, 0, 16, 16, C.glass); R(c, 0, 0, 16, 2, C.dark); R(c, 0, 14, 16, 2, C.dark); R(c, 7, 0, 1, 16, C.dark); dots(c, C.glass2, [3, 4, 4, 5, 11, 7, 12, 8]); },
    column: furn(function (c) { R(c, 4, 1, 8, 14, C.white); R(c, 3, 0, 10, 2, C.tile2); R(c, 3, 13, 10, 3, C.tile2); R(c, 6, 2, 1, 11, C.tile2); R(c, 9, 2, 1, 11, C.tile2); }),
    lamp: furn(function (c) { R(c, 7, 4, 2, 11, C.dark); R(c, 5, 15, 6, 1, C.dark); R(c, 5, 1, 6, 4, C.gold); }),
    bench: furn(function (c) { R(c, 1, 6, 14, 4, C.wood2); R(c, 2, 10, 2, 3, C.dark); R(c, 12, 10, 2, 3, C.dark); }),
    bed: furn(function (c) { R(c, 0, 0, 16, 16, "#6088c8"); R(c, 0, 7, 16, 1, "#4868a8"); R(c, 7, 0, 1, 16, "#4868a8"); }),
    pillow: furn(function (c) { R(c, 0, 0, 16, 16, "#6088c8"); R(c, 1, 2, 14, 12, C.white); R(c, 1, 12, 14, 2, C.tile2); }),
    sofa: furn(function (c) { R(c, 0, 0, 16, 16, "#409088"); R(c, 0, 0, 16, 5, "#287068"); R(c, 7, 5, 1, 11, "#287068"); dots(c, "#60b0a8", [3, 8, 11, 8]); }),
    table: furn(function (c) { R(c, 0, 1, 16, 13, C.wood3); R(c, 1, 2, 14, 10, "#b07838"); R(c, 0, 14, 2, 2, C.dark); R(c, 14, 14, 2, 2, C.dark); }),
    cabinet: furn(function (c) { R(c, 0, 0, 16, 16, "#c8a070"); R(c, 0, 0, 16, 2, C.wood3); R(c, 7, 2, 2, 14, C.wood2); R(c, 5, 8, 1, 2, C.dark); R(c, 10, 8, 1, 2, C.dark); }),
    counter: furn(function (c) { R(c, 0, 0, 16, 16, C.tile2); R(c, 0, 0, 16, 5, C.white); R(c, 0, 5, 16, 1, C.grey); R(c, 7, 6, 1, 10, C.grey); }),
    sink: furn(function (c) { R(c, 0, 0, 16, 16, C.white); R(c, 2, 3, 12, 10, C.steel); R(c, 3, 4, 10, 8, C.glass); R(c, 7, 1, 2, 4, C.steel2); }),
    stove: furn(function (c) { R(c, 0, 0, 16, 16, C.tile2); R(c, 1, 1, 14, 14, C.dark); R(c, 3, 3, 4, 4, C.grey); R(c, 9, 3, 4, 4, C.grey); R(c, 3, 10, 2, 2, C.red); R(c, 11, 10, 2, 2, C.red); }),
    fridge: furn(function (c) { R(c, 1, 0, 14, 16, C.steel); R(c, 1, 6, 14, 1, C.steel2); R(c, 12, 2, 1, 3, C.dark); R(c, 12, 8, 1, 5, C.dark); }),
    toilet: furn(function (c) { R(c, 4, 0, 8, 5, C.white); R(c, 3, 5, 10, 9, C.white); R(c, 5, 7, 6, 5, C.glass); R(c, 3, 13, 10, 2, C.tile2); }),
    shower: furn(function (c) { R(c, 0, 0, 16, 16, C.glass); R(c, 0, 0, 16, 1, C.steel2); R(c, 0, 0, 1, 16, C.steel2); R(c, 15, 0, 1, 16, C.steel2); R(c, 0, 15, 16, 1, C.steel2); R(c, 7, 7, 2, 2, C.steel2); }),
    stool: furn(function (c) { R(c, 3, 3, 10, 10, C.wood2); R(c, 2, 5, 12, 6, C.wood2); R(c, 5, 5, 6, 6, C.wood); }),
    shelf: furn(function (c) { R(c, 0, 0, 16, 16, C.wood3); for (var i = 0; i < 2; i++) { R(c, 1, 1 + i * 8, 14, 6, "#402810"); R(c, 2, 2 + i * 8, 2, 5, C.red); R(c, 5, 2 + i * 8, 2, 5, C.blue); R(c, 8, 2 + i * 8, 2, 5, C.gold); R(c, 11, 2 + i * 8, 2, 5, C.green); } }),
    desk: furn(function (c) { R(c, 0, 0, 16, 14, "#b07838"); R(c, 0, 12, 16, 2, C.wood3); R(c, 4, 3, 7, 5, C.dark); R(c, 5, 4, 5, 3, C.glass); }),
    chair: furn(function (c) { R(c, 3, 4, 10, 8, C.slate); R(c, 3, 2, 10, 3, C.slate2); R(c, 5, 12, 6, 2, C.dark); }),
    washer: furn(function (c) { R(c, 1, 0, 14, 16, C.white); R(c, 1, 0, 14, 3, C.tile2); R(c, 4, 5, 8, 8, C.steel); R(c, 6, 7, 4, 4, C.glass); }),
    tv: furn(function (c) { R(c, 2, 0, 12, 16, C.dark); R(c, 3, 1, 10, 14, "#203860"); dots(c, C.glass, [6, 4, 7, 5, 8, 6]); }),
    stall: function (c) { R(c, 0, 0, 16, 16, C.wood2); for (var i = 0; i < 4; i++) R(c, i * 4, 0, 2, 7, C.red); R(c, 0, 7, 16, 1, C.dark); R(c, 3, 10, 3, 3, C.gold); R(c, 9, 10, 3, 3, C.green); },
    showcase: furn(function (c) { R(c, 0, 2, 16, 14, C.glass); R(c, 0, 2, 16, 1, C.steel2); R(c, 0, 13, 16, 3, C.wood3); R(c, 4, 7, 4, 5, C.gold); R(c, 10, 8, 3, 4, C.brick); }),
    moto_parked: furn(function (c) { R(c, 2, 4, 3, 8, C.dark); R(c, 11, 4, 3, 8, C.dark); R(c, 3, 6, 10, 4, C.red); R(c, 6, 4, 4, 3, C.dark); }),
    garland: function (c, f) { R(c, 0, 0, 16, 16, C.plaza2); R(c, 7, 4, 2, 12, C.dark); R(c, 2, 1, 12, 6, C.leaf2); dots(c, f % 2 ? C.gold : C.red, [3, 2, 7, 4, 11, 2, 12, 5]); dots(c, f % 2 ? C.red : C.gold, [5, 5, 9, 2, 3, 5]); },
    cloth: furn(function (c) { R(c, 0, 1, 5, 14, "#d86888"); R(c, 5, 1, 6, 14, "#68a8d8"); R(c, 11, 1, 5, 14, "#e8c850"); dots(c, C.white, [2, 4, 2, 9, 8, 6, 8, 12, 13, 3, 13, 10]); }),
    goods: furn(function (c) { R(c, 0, 6, 16, 10, C.wood3); R(c, 1, 2, 4, 5, C.red); R(c, 6, 3, 4, 4, C.gold); R(c, 11, 1, 4, 6, C.green); }),
    altar: function (c) { R(c, 0, 0, 16, 16, "#701818"); R(c, 0, 10, 16, 6, C.red); R(c, 0, 10, 16, 1, C.gold); R(c, 5, 2, 6, 8, C.gold); R(c, 7, 3, 2, 3, "#f0d8a0"); }
  };
  var GLOW = { lightway: 1, garland: 1, portal: 1 };
  var GLOW_STAMP = { xmastree: 1, lightart: 1, stage: 1 };

  // ---- multi-tile art -----------------------------------------------------
  function roofBand(c, w, y, h, col, col2) { R(c, 0, y, w, h, col); for (var i = 0; i < h; i += 3) R(c, 0, y + i, w, 1, col2); }
  function windows(c, x, y, cols, rows, gx, gy, col) {
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      R(c, x + i * gx, y + j * gy, 8, 10, C.dark); R(c, x + i * gx + 1, y + j * gy + 1, 6, 8, col || C.glass); R(c, x + i * gx + 1, y + j * gy + 5, 6, 1, C.dark);
    }
  }
  function doorway(c, x, y, w, h, col) { R(c, x, y, w, h, col || C.wood3); R(c, x + 1, y + 1, w - 2, h - 1, C.dark); }
  function eaves(c, w, y) { R(c, 0, y, w, 2, C.dark); }
  function pagoda(c, w, h, wallCol) {
    roofBand(c, w, 0, 12, C.slate, C.slate2); R(c, 0, 12, w, 2, C.brick2); R(c, 2, 14, w - 4, h - 14, wallCol || C.cream);
    R(c, 0, 0, 2, 4, C.slate2); R(c, w - 2, 0, 2, 4, C.slate2);
  }

  var S = {
    home_bldg: function (c, w, h) {
      // left-right symmetric: flats above, garage on the left, lobby in the middle, a home on the right
      R(c, 0, 0, w, h, "#d8d0c0"); roofBand(c, w, 0, 8, C.slate, C.slate2);
      for (var f = 0; f < 3; f++) { windows(c, 22, 16 + f * 30, 4, 1, 26, 0); windows(c, 182, 16 + f * 30, 4, 1, 26, 0); R(c, 16, 34 + f * 30, 118, 2, C.steel2); R(c, 154, 34 + f * 30, 118, 2, C.steel2); }
      R(c, 136, 8, 16, 92, "#b8b0a0");
      R(c, 0, 100, w, 28, "#a89888");
      R(c, 16, 104, 56, 24, C.dark); for (var i = 0; i < 5; i++) R(c, 16, 106 + i * 4, 56, 1, C.steel2);       // electric parking door
      R(c, 80, 104, 32, 24, "#383840"); R(c, 86, 110, 20, 18, C.dark);                                        // B1 scooter ramp
      R(c, 128, 102, 32, 26, C.glass); R(c, 143, 102, 2, 26, C.dark); R(c, 126, 100, 36, 3, C.dark);          // lobby
      R(c, 186, 102, 18, 26, C.wood3); R(c, 200, 114, 2, 3, C.gold); windows(c, 214, 106, 3, 1, 16, 0);       // ground-floor home
      R(c, 40, 16, 8, 10, C.gold);                                                                            // our window: second floor, left
    },
    apt_bldg: function (c, w, h) {
      R(c, 0, 0, w, h, "#c8b8a0"); roofBand(c, w, 0, 8, C.roof, C.roof2);
      windows(c, 12, 14, 7, 3, 24, 24);
      R(c, 78, 86, 36, 26, C.dark); R(c, 84, 92, 24, 20, C.wood3);
    },
    laiqing: function (c, w, h) {
      pagoda(c, w, 46, C.cream); R(c, 8, 22, w - 16, 4, C.red); for (var i = 0; i < 6; i++) R(c, 16 + i * 32, 14, 4, 32, C.brick2);
      R(c, 0, 46, w, 12, C.slate); for (var j = 0; j < w; j += 6) R(c, j, 46, 2, 12, C.slate2); R(c, 0, 58, w, 2, C.brick2);
      R(c, 6, 60, w - 12, h - 60, C.cream); for (var k = 0; k < 8; k++) R(c, 10 + k * 28, 60, 4, h - 60, C.brick2);
      R(c, w / 2 - 14, 68, 28, h - 68, C.dark); R(c, 26, 66, 16, 12, C.wood); R(c, w - 42, 66, 16, 12, C.wood);
    },
    fangjian: function (c, w, h) { pagoda(c, w, h, C.cream); for (var i = 0; i < 4; i++) R(c, 6 + i * 26, 14, 4, h - 14, C.brick2); R(c, 12, 22, w - 24, 10, C.wood); },
    jigu: function (c, w, h) { pagoda(c, w, h, C.cream); doorway(c, w / 2 - 8, h - 26, 16, 26); windows(c, 12, 28, 2, 2, 12, 16, C.wood); windows(c, w - 36, 28, 2, 2, 12, 16, C.wood); },
    dingjing: function (c, w, h) {
      pagoda(c, w, h, "#d8c8a8"); R(c, 30, 32, w - 60, h - 44, C.dirt); R(c, w / 2 - 12, h - 18, 24, 18, C.dark);
      R(c, 30, 32, w - 60, 8, C.slate); R(c, 30, 32, 6, h - 44, C.slate); R(c, w - 36, 32, 6, h - 44, C.slate);
    },
    guanjia: function (c, w, h) { R(c, 0, 0, w, h, C.water); pagoda(c, w, h - 6, C.cream); doorway(c, w / 2 - 7, h - 26, 14, 20); R(c, 0, h - 8, w, 2, C.brick2); },
    moonwater: function (c, w, h) {
      R(c, 0, 0, w, h, C.water);
      c.fillStyle = C.slate;
      for (var i = 0; i < 16; i++) { c.fillRect(20 - i, 8 + i, i * 2 + 2, 2); c.fillRect(58 - i, 8 + i, i * 2 + 2, 2); c.fillRect(20 - i, 40 - i, i * 2 + 2, 2); c.fillRect(58 - i, 40 - i, i * 2 + 2, 2); }
      R(c, 18, 18, 4, 14, C.brick2); R(c, 58, 18, 4, 14, C.brick2);
    },
    cityhall: function (c, w, h) {
      R(c, 0, 16, w, h - 16, "#a8b0b8");
      R(c, 28, 0, 90, h, "#c0c8d0"); R(c, w - 118, 0, 90, h, "#c0c8d0"); R(c, 118, 4, w - 236, 12, C.steel2);
      windows(c, 34, 6, 7, 7, 12, 14, "#f8e070"); windows(c, w - 112, 6, 7, 7, 12, 14, "#f8e070");
      R(c, 124, 76, w - 248, 40, C.glass); R(c, 120, 72, w - 240, 4, C.dark); R(c, w / 2 - 12, 96, 24, 32, C.dark);
    },
    mega: function (c, w, h) {
      R(c, 0, 0, w, h, "#303858"); R(c, 6, 8, w - 12, 18, C.red); R(c, 10, 13, w - 20, 8, C.gold);
      windows(c, 10, 36, 8, 7, 13, 14, "#f8e070"); R(c, 0, 76, 8, 24, C.glass);
      R(c, 0, h - 24, w, 24, C.glass); R(c, 0, h - 26, w, 3, C.dark);
    },
    xmastree: function (c, w, h, f) {
      R(c, w / 2 - 6, h - 16, 12, 16, C.trunk);
      for (var i = 0; i < 13; i++) R(c, w / 2 - 6 - i * 3, 6 + i * 8, 12 + i * 6, 8, i % 2 ? C.leaf2 : C.leaf);
      var col = [C.gold, C.red, "#80e8f8", C.white];
      for (var j = 0; j < 64; j++) {
        var y = 10 + (j * 37) % 96, half = 4 + (y - 6) * 0.36, x = w / 2 - half + ((j * 53) % 100) / 100 * half * 2;
        R(c, x | 0, y, 2, 2, col[(j + (f || 0)) % 4]);
      }
      R(c, w / 2 - 4, 0, 8, 8, C.gold); R(c, w / 2 - 1, 0, 2, 8, C.white);
    },
    ntm_front: function (c, w, h) {
      R(c, 0, 26, w, h - 26, C.cream); R(c, 0, 26, w, 3, C.tile2); windows(c, 8, 44, 4, 2, 18, 22); windows(c, w - 68, 44, 4, 2, 18, 22);
      // dome
      for (var i = 0; i < 16; i++) { var hw = Math.round(Math.sqrt(1600 - (15 - i) * (15 - i) * 7)); R(c, w / 2 - hw, 4 + i * 1.2, hw * 2, 2, "#88a8a0"); }
      R(c, w / 2 - 2, 0, 4, 6, C.gold);
      // Doric portico
      R(c, 84, 22, w - 168, 8, C.white); c.fillStyle = C.white;
      for (var j = 0; j < 24; j++) c.fillRect(w / 2 - 6 - j * 2.2, 8 + j * .6, 12 + j * 4.4, 1);
      for (var k = 0; k < 6; k++) { R(c, 90 + k * 16, 30, 8, h - 34, C.white); R(c, 92 + k * 16, 30, 1, h - 34, C.tile2); R(c, 95 + k * 16, 30, 1, h - 34, C.tile2); }
      R(c, 80, h - 4, w - 160, 4, C.tile2); R(c, w / 2 - 6, 60, 12, h - 64, C.dark);
    },
    obelisk: function (c, w, h) {
      R(c, 4, h - 10, w - 8, 10, C.steel2); R(c, 14, 8, w - 28, h - 18, C.white); R(c, 16, 0, w - 32, 12, C.white); R(c, 14, 8, 2, h - 18, C.tile2); R(c, 2, h - 3, w - 4, 3, C.grey);
    },
    redhouse: function (c, w, h) { R(c, 0, 12, w, h - 12, C.brick); roofBand(c, w, 0, 12, C.slate, C.slate2); for (var j = 16; j < h; j += 4) R(c, 0, j, w, 1, C.brick2); windows(c, 10, 22, 8, 2, 22, 34, C.white); doorway(c, w / 2 - 9, h - 26, 18, 26); },
    whitehouse: function (c, w, h) { R(c, 0, 12, w, h - 12, C.white); roofBand(c, w, 0, 12, "#88a8a0", "#688880"); for (var k = 0; k < 5; k++) { R(c, 8 + k * 32, 14, 6, h - 14, C.tile2); } windows(c, 18, 24, 4, 2, 32, 30, C.glass); },
    railhall: function (c, w, h) {
      R(c, 0, 0, w, h, C.brick); roofBand(c, w, 0, 14, C.slate, C.slate2); R(c, 0, 14, w, 40, C.cream);
      for (var i = 0; i <= 11; i++) { R(c, i * 22, 14, 3, 40, C.wood3); } for (var j = 0; j < 11; j++) { c.fillStyle = C.wood3; for (var t = 0; t < 22; t++) c.fillRect(j * 22 + t, 14 + t * 1.8, 2, 2); }
      R(c, 0, 54, w, 3, C.dark); windows(c, 12, 62, 7, 2, 30, 24, C.white); doorway(c, w / 2 - 10, h - 30, 20, 30);
    },
    octagon: function (c, w, h) {
      R(c, 10, 18, w - 20, h - 18, C.cream); R(c, 4, 26, w - 8, h - 30, C.cream);
      for (var i = 0; i < 12; i++) R(c, w / 2 - 6 - i * 2.4, 4 + i * 1.8, 12 + i * 4.8, 2, C.slate); R(c, w / 2 - 2, 0, 4, 6, C.dark); windows(c, 16, 34, 3, 1, 16, 0, C.glass); doorway(c, w / 2 - 6, h - 18, 12, 18);
    },
    train: function (c, w, h) {
      R(c, 0, 0, w, h, "#a89880"); R(c, 0, 26, w, 2, C.grey); R(c, 0, 38, w, 2, C.grey);
      R(c, 30, 8, w - 40, 22, C.dark); R(c, 20, 2, 44, 28, "#202028"); R(c, 26, 6, 12, 10, C.glass); R(c, 44, 6, 12, 10, C.glass); R(c, 96, 0, 8, 10, C.dark); R(c, w - 12, 16, 12, 14, C.red); R(c, 64, 12, w - 90, 3, C.gold);
      for (var i = 0; i < 6; i++) { R(c, 26 + i * 26, 30, 14, 12, C.dark); R(c, 31 + i * 26, 34, 4, 4, C.red); }
    },
    bed2: function (c, w, h) {
      R(c, 0, 0, w, h, C.wood3); R(c, 1, 1, w - 2, h - 2, "#6088c8"); R(c, 2, 2, 13, 10, C.white); R(c, 17, 2, 13, 10, C.white);
      R(c, 2, 11, 13, 1, C.tile2); R(c, 17, 11, 13, 1, C.tile2); R(c, 1, 14, w - 2, 2, "#88a8e0"); R(c, 1, h - 3, w - 2, 2, "#4868a8");
    },
    fountain: function (c, w, h, f) {
      R(c, 2, 10, w - 4, h - 12, C.tile2); R(c, 0, 16, w, h - 18, C.tile2); R(c, 4, 12, w - 8, h - 16, C.water); R(c, 2, 18, w - 4, h - 24, C.water);
      R(c, 28, 20, 8, 28, C.tile2); R(c, 20, 26, 24, 4, C.tile2);
      for (var i = 0; i < 7; i++) { var o = (i + f * 2) % 4; R(c, 16 + i * 5, 14 + o * 2 + Math.abs(i - 3) * 2, 2, 8, C.glass2); }
      R(c, 31, 2, 2, 20, C.glass2); R(c, 26, 4, 12, 2, C.white);
    },
    gateplane0: function (c, w, h) { gatePlane(c, w, h, C.red, false); }, gateplane1: function (c, w, h) { gatePlane(c, w, h, C.blue, false); },
    gateplane2: function (c, w, h) { gatePlane(c, w, h, C.green, false); }, gateplane3: function (c, w, h) { gatePlane(c, w, h, C.gold, false); },
    gateplane0b: function (c, w, h) { gatePlane(c, w, h, C.red, true); }, gateplane1b: function (c, w, h) { gatePlane(c, w, h, C.blue, true); },
    gateplane2b: function (c, w, h) { gatePlane(c, w, h, C.green, true); }, gateplane3b: function (c, w, h) { gatePlane(c, w, h, C.gold, true); },
    plane_small: function (c, w, h) {
      R(c, 2, h - 3, w - 4, 3, C.steel2); R(c, 13, 2, 6, 24, C.white); R(c, 2, 11, 28, 5, C.steel); R(c, 9, 22, 14, 3, C.red); R(c, 14, 0, 4, 3, C.glass); R(c, 15, 26, 2, 3, C.dark);
    },
    tamkang: function (c, w, h) {
      R(c, 0, 0, w, h, C.water); R(c, 0, 44, w, 6, C.white); R(c, 0, 50, w, 2, C.steel2);
      var tx = 58; R(c, tx, 0, 6, h, C.white); R(c, tx - 3, 44, 12, 6, C.steel);
      c.fillStyle = C.line;
      for (var i = 1; i <= 7; i++) for (var t = 0; t < 40; t++) { c.fillRect(tx + 3 + (i * 22) * t / 40, 4 + i * 2 + (44 - 4 - i * 2) * t / 40, 1, 1); c.fillRect(tx + 3 - (i * 7) * t / 40, 4 + i * 2 + (44 - 4 - i * 2) * t / 40, 1, 1); }
      for (var k = 20; k < w; k += 48) R(c, k, 52, 6, h - 52, C.steel2);
    },
    lovers_bridge: function (c, w, h) {
      R(c, 0, 0, w, h, C.water); c.fillStyle = C.white;
      for (var x = 0; x < w; x += 2) { var y = 34 - Math.sin(x / w * Math.PI) * 26; c.fillRect(x, y, 2, 3); c.fillRect(x, y + 12, 2, 2); if (x % 16 === 0) c.fillRect(x, y, 1, 14); }
      R(c, w / 2 - 2, 0, 4, 12, C.red); R(c, 0, 50, w, 30, C.water);
    },
    beitou_station: function (c, w, h) { R(c, 0, 14, w, h - 14, C.wood); roofBand(c, w, 0, 14, C.slate, C.slate2); for (var i = 0; i < 7; i++) R(c, 8 + i * 24, 14, 3, h - 14, C.wood3); windows(c, 18, 24, 3, 1, 24, 0, C.white); doorway(c, w - 50, h - 28, 18, 28); R(c, w / 2 - 20, 2, 40, 9, C.cream); },
    hotspring_museum: function (c, w, h) { R(c, 0, 30, w, h - 30, C.brick); R(c, 0, 10, w, 20, C.cream); roofBand(c, w, 0, 10, C.slate, C.slate2); for (var i = 0; i < 8; i++) R(c, 6 + i * 22, 10, 3, 20, C.wood3); R(c, 0, 29, w, 2, C.dark); windows(c, 10, 38, 6, 1, 26, 0, C.white); doorway(c, w / 2 - 9, h - 22, 18, 22); },
    mall: function (c, w, h) { R(c, 0, 0, w, h, "#d8d0c8"); R(c, 0, 8, w, 10, C.red); windows(c, 10, 28, 6, 5, 18, 22); R(c, 0, h - 26, w, 26, C.glass); R(c, w / 2 - 12, h - 26, 24, 26, C.dark); },
    ferris: function (c, w, h, f) {
      var cx = w / 2, cy = h / 2 - 8, r = 62, a = f * .13;
      R(c, cx - 26, h - 8, 52, 8, C.steel2); c.fillStyle = C.steel2;
      for (var t = 0; t < 64; t++) { c.fillRect(cx - t * .6, cy + t * 1.3, 3, 2); c.fillRect(cx + t * .6, cy + t * 1.3, 3, 2); }
      c.fillStyle = C.white; for (var i = 0; i < 80; i++) { var b = i / 80 * 6.283; c.fillRect(cx + Math.cos(b) * r, cy + Math.sin(b) * r, 2, 2); }
      var cols = [C.red, C.gold, C.blue, C.green];
      for (var n = 0; n < 12; n++) { var d = n / 12 * 6.283 + a, x = cx + Math.cos(d) * r, y = cy + Math.sin(d) * r; c.fillStyle = C.steel; for (var j = 0; j < 30; j++) c.fillRect(cx + Math.cos(d) * r * j / 30, cy + Math.sin(d) * r * j / 30, 1, 1); R(c, x - 4, y - 3, 8, 7, cols[n % 4]); R(c, x - 2, y - 2, 4, 2, C.glass); }
      R(c, cx - 4, cy - 4, 8, 8, C.gold);
    },
    flora_hall: function (c, w, h) { R(c, 0, 16, w, h - 16, C.white); for (var i = 0; i < w; i += 16) R(c, i, 8 + (i % 32 ? 0 : 4), 14, 10, C.glass); R(c, 0, 18, w, 3, C.steel2); for (var k = 0; k < 7; k++) R(c, 8 + k * 30, 22, 14, 20, C.glass); doorway(c, w / 2 - 12, h - 28, 24, 28); },
    kma: function (c, w, h) { R(c, 0, 0, w, h, "#d8d8d0"); for (var i = 0; i < 9; i++) R(c, 6 + i * 17, 8, 12, 12, C.glass); R(c, 0, 26, w, 3, C.dark); R(c, 0, h - 20, w, 20, C.glass); R(c, w / 2 - 10, h - 20, 20, 20, C.dark); },
    tunnel_mouth: function (c, w, h) { R(c, 0, 0, w, h, "#607848"); R(c, 8, 6, w - 16, h - 6, "#888880"); R(c, 16, 14, w - 32, h - 14, C.dark); R(c, 20, 10, w - 40, 6, C.dark); dots(c, C.gold, [w / 2, 22, w / 2 - 8, 30, w / 2 + 8, 30]); },
    mine_mouth: function (c, w, h) { R(c, 0, 0, w, h, "#887058"); R(c, 16, 14, w - 32, h - 14, C.dark); R(c, 12, 10, 6, h - 10, C.wood3); R(c, w - 18, 10, 6, h - 10, C.wood3); R(c, 8, 8, w - 16, 7, C.wood3); R(c, 0, h - 3, w, 2, C.grey); R(c, w / 2 - 12, 2, 24, 7, C.gold); },
    ship: function (c, w, h) { R(c, 0, 0, w, h, C.sea); R(c, 8, 54, w - 16, 26, C.white); R(c, 0, 66, w, 20, C.blue); R(c, 0, 62, w, 4, C.red); R(c, 20, 36, w - 80, 22, C.white); windows(c, 26, 40, 8, 1, 16, 0); R(c, w - 44, 18, 16, 40, C.red); R(c, w - 44, 18, 16, 8, C.dark); },
    mushroom_rock: function (c, w, h) { R(c, 12, 16, 8, 14, "#a89878"); R(c, 3, 2, w - 6, 16, "#887860"); R(c, 6, 0, w - 12, 4, "#887860"); R(c, 7, 4, 10, 5, "#a89878"); },
    lantern_house: function (c, w, h) { R(c, 0, 0, w, h, "#584038"); roofBand(c, w, 0, 10, C.dark, C.slate2); windows(c, 8, 16, 3, 1, 16, 0, "#f8d870"); R(c, 0, 34, w, 4, C.wood3); for (var i = 0; i < 4; i++) { R(c, 4 + i * 16, 38, 2, 3, C.dark); R(c, 1 + i * 16, 41, 8, 8, C.red); } R(c, 8, 52, w - 16, h - 52, C.dark); },
    gold_museum: function (c, w, h) { R(c, 0, 14, w, h - 14, C.cream); roofBand(c, w, 0, 14, C.slate, C.slate2); windows(c, 14, 24, 5, 1, 30, 0, C.wood); R(c, w / 2 - 22, 44, 44, 10, C.gold); doorway(c, w / 2 - 10, h - 24, 20, 24); },
    luce: function (c, w, h) {
      R(c, 0, h - 8, w, 8, C.tile2); var cx = w / 2;
      for (var y = 0; y < h - 8; y++) { var k = y / (h - 8), half = 56 * Math.pow(k, 1.9) + 3; R(c, cx - half, y, half - 1, 1, y % 8 < 7 ? "#d8b838" : "#a88820"); R(c, cx + 1, y, half - 1, 1, y % 8 < 7 ? "#c8a830" : "#987818"); if (y % 8 === 0) for (var x = -half; x < half; x += 6) R(c, cx + x, y, 1, 7, "#a88820"); }
      R(c, cx - 1, 0, 2, h - 8, C.glass); R(c, cx - 8, h - 30, 16, 22, C.dark);
    },
    chihkan: function (c, w, h) {
      R(c, 0, h - 26, w, 26, C.brick); for (var y = h - 24; y < h; y += 4) R(c, 0, y, w, 1, C.brick2); doorway(c, w / 2 - 12, h - 22, 24, 22);
      for (var i = 0; i < 2; i++) { var x = 4 + i * 96; R(c, x + 6, 28, 78, 38, C.red); pagodaRoof(c, x, 8, 90); pagodaRoof(c, x + 6, 26, 78); for (var k = 0; k < 5; k++) R(c, x + 12 + k * 16, 40, 4, 26, C.brick2); }
    },
    confucius: function (c, w, h) { R(c, 0, 26, w, h - 26, C.red); pagodaRoof(c, 0, 4, w); for (var i = 0; i < 6; i++) R(c, 12 + i * 34, 26, 8, h - 26, C.brick2); doorway(c, w / 2 - 14, h - 40, 28, 40, C.gold); R(c, 0, h - 4, w, 4, C.cream); },
    hayashi: function (c, w, h) { R(c, 0, 0, w, h, "#d8c8a0"); R(c, 0, 0, w, 6, C.brick2); windows(c, 10, 12, 8, 4, 19, 16); R(c, 0, h - 16, w, 16, C.glass); R(c, w / 2 - 10, h - 16, 20, 16, C.dark); R(c, 0, 0, 8, h - 16, "#c8b890"); R(c, w - 8, 0, 8, h - 16, "#c8b890"); },
    lightart: function (c, w, h, f) {
      var cols = ["#80e8f8", "#f8e870", "#f88080", "#a0f090"];
      for (var i = 0; i < 16; i++) { var a = i / 16 * 6.283, r = 10 + (i % 3) * 7; R(c, w / 2 + Math.cos(a) * r - 1, h / 2 + Math.sin(a) * r - 1, 3, 3, cols[(i + f) % 4]); }
      R(c, w / 2 - 2, h / 2 - 2, 4, 4, C.white); R(c, w / 2 - 1, h / 2, 2, h / 2 - 2, "#b08850");
    },
    cks_hall: function (c, w, h) {
      R(c, 24, h - 20, w - 48, 20, C.tile2); for (var i = 0; i < 8; i++) R(c, 24 + i * 3, h - 20 + i * 2, w - 48 - i * 6, 2, C.white);
      R(c, 40, 44, w - 80, h - 66, C.white); doorway(c, w / 2 - 12, h - 56, 24, 34, C.gold);
      for (var y = 0; y < 3; y++) { var ww = 56 + y * 34, yy = 6 + y * 14; R(c, w / 2 - ww / 2, yy, ww, 12, "#2848a0"); R(c, w / 2 - ww / 2 - 4, yy + 10, ww + 8, 3, "#183080"); }
      R(c, w / 2 - 3, 0, 6, 8, C.gold);
    },
    arch: function (c, w, h) { R(c, 0, 18, 44, h - 18, C.white); R(c, w - 44, 18, 44, h - 18, C.white); R(c, 0, 10, w, 12, C.white); roofBand(c, w, 0, 10, "#2848a0", "#183080"); R(c, 16, 26, 14, h - 26, "#284870"); R(c, w - 30, 26, 14, h - 26, "#284870"); },
    guest_house: function (c, w, h) { R(c, 0, 14, w, h - 14, C.white); R(c, 0, 12, w, 3, C.brick2); roofBand(c, w, 0, 12, C.slate, C.slate2); R(c, w / 2 - 12, 0, 24, 14, C.slate2); windows(c, 12, 22, 6, 2, 16, 24); doorway(c, w / 2 - 8, h - 22, 16, 22); },
    sysmh: function (c, w, h) {
      R(c, 10, 40, w - 20, h - 46, C.cream); for (var i = 0; i < 12; i++) R(c, 18 + i * 17, 40, 7, h - 46, C.white); R(c, w / 2 - 10, 62, 20, h - 68, C.dark); R(c, 0, h - 6, w, 6, C.tile2);
      c.fillStyle = "#e0b030";
      for (var x = 0; x < w; x++) { var t = Math.abs(x - w / 2) / (w / 2), top = 18 - t * t * 16; c.fillRect(x, top, 1, 22 + t * 4); }
      R(c, 0, 38, w, 3, C.brick2);
    },
    bigdome: function (c, w, h) {
      R(c, 0, h - 24, w, 24, "#909098"); c.fillStyle = "#c8ccd8";
      for (var y = 0; y < h - 24; y++) { var k = 1 - y / (h - 24), half = (w / 2) * Math.sqrt(1 - k * k * .92); c.fillRect(w / 2 - half, y, half * 2, 1); }
      for (var i = 0; i < 12; i++) R(c, 12 + i * 26, h - 54, 14, 3, C.steel2); R(c, 24, h - 24, w - 48, 3, C.dark); R(c, w / 2 - 22, h - 16, 44, 16, C.glass);
    },
    stage: function (c, w, h, f) {
      R(c, 0, 0, w, h, C.dark); R(c, 10, h - 16, w - 20, 16, "#585868"); R(c, 30, 8, w - 60, 40, f % 2 ? "#4858c8" : "#c84888");
      for (var i = 0; i < 9; i++) { R(c, 14 + i * 26, 2, 6, 4, i % 2 === f % 2 ? C.gold : C.white); }
      R(c, w / 2 - 3, h - 34, 6, 10, C.white); R(c, w / 2 - 2, h - 38, 4, 5, SKIN); R(c, w / 2 - 3, h - 24, 2, 8, C.dark); R(c, w / 2 + 1, h - 24, 2, 8, C.dark);
    },
    ubud_palace: function (c, w, h) {
      R(c, 0, 40, w, h - 40, "#a89070"); var s = "#786048";
      for (var i = 0; i < 2; i++) { var x = i ? w / 2 + 8 : w / 2 - 44; for (var k = 0; k < 8; k++) R(c, x + (i ? 0 : k * 2), 8 + k * 8, 36 - k * 2, 8, k % 2 ? s : "#907858"); }
      R(c, w / 2 - 8, 40, 16, h - 40, C.dark); R(c, 10, 56, 40, 6, C.gold); R(c, w - 50, 56, 40, 6, C.gold);
    },
    tanahlot: function (c, w, h) {
      R(c, 0, 0, w, h, C.sea); R(c, 8, 48, w - 16, h - 54, "#807058"); R(c, 16, 40, w - 32, 12, "#807058"); R(c, 22, 34, w - 44, 8, C.leaf);
      for (var i = 0; i < 6; i++) { R(c, 40 - i * 3 + 6, 4 + i * 6, 16 + i * 6 - 6, 5, i % 2 ? C.dark : "#403028"); } R(c, 54, 34, 4, 8, C.wood3);
      R(c, 0, h - 6, w, 3, C.white);
    },
    villa: function (c, w, h) { R(c, 10, 30, w - 20, h - 30, C.cream); for (var y = 0; y < 30; y++) R(c, 60 - 4 - y * 1.7, y, 8 + y * 3.4, 1, y % 4 ? "#a07838" : "#785828"); doorway(c, w / 2 - 8, h - 22, 16, 22); windows(c, 22, 40, 2, 1, 14, 0); windows(c, w - 50, 40, 2, 1, 14, 0); },
    shelter: function (c, w, h) {
      R(c, 4, 6, w - 8, h - 6, C.grey); R(c, 0, 14, w, h - 14, C.grey); R(c, 8, 2, w - 16, 6, C.grass2); R(c, 0, 12, w, 3, C.grass2);
      R(c, w / 2 - 12, h - 24, 24, 24, C.dark); R(c, w / 2 - 14, h - 26, 28, 3, "#606068");
    },
    trex: function (c, w, h) {
      R(c, 0, 0, w, h, "#283048"); R(c, 0, h - 4, w, 4, C.tile2); var b = "#e8e0c8", k = "#b0a880";
      R(c, 96, 8, 26, 16, b); R(c, 100, 22, 22, 4, b); dots(c, C.dark, [112, 12]); for (var i = 0; i < 5; i++) R(c, 102 + i * 4, 21, 2, 4, k);
      for (var j = 0; j < 10; j++) R(c, 40 + j * 6, 30 - j * .4 + (j > 7 ? j : 0), 5, 3, b);
      for (var t = 0; t < 7; t++) R(c, 36 - t * 6, 30 + t * 3, 5, 3, b);
      for (var r = 0; r < 7; r++) R(c, 46 + r * 6, 33, 2, 14 - r, k);
      R(c, 52, 44, 6, 28, b); R(c, 76, 44, 6, 28, b); R(c, 48, 72, 14, 4, b); R(c, 72, 72, 14, 4, b); R(c, 92, 34, 8, 2, b);
    },
    longneck: function (c, w, h) {
      R(c, 0, 0, w, h, "#283048"); R(c, 0, h - 4, w, 4, C.tile2); var b = "#e8e0c8", k = "#b0a880";
      for (var i = 0; i < 16; i++) R(c, 74 + i * 2.6, 40 - i * 2.2, 5, 3, b); R(c, 116, 2, 12, 7, b); dots(c, C.dark, [122, 4]);
      for (var j = 0; j < 8; j++) R(c, 30 + j * 6, 40, 5, 3, b); for (var r = 0; r < 8; r++) R(c, 32 + r * 6, 43, 2, 12, k);
      for (var t = 0; t < 7; t++) R(c, 26 - t * 4, 42 + t * 3, 4, 3, b); R(c, 40, 54, 7, 22, b); R(c, 66, 54, 7, 22, b);
    },
    vault: function (c, w, h) { R(c, 0, 0, w, h, C.dark); R(c, 8, 4, w - 16, h - 4, C.steel2); c.fillStyle = C.steel; for (var i = 0; i < 12; i++) c.fillRect(w / 2 - 12 + (i < 6 ? 6 - i : i - 5), 8 + i * 2.4, 24 - (i < 6 ? 6 - i : i - 5) * 2, 3); R(c, w / 2 - 2, 18, 4, 4, C.gold); },
    shop0: function (c, w, h) { shop(c, w, h, "#e0c8a0", C.red); },
    shop1: function (c, w, h) { shop(c, w, h, "#c8b8b0", C.blue); },
    shop2: function (c, w, h) { shop(c, w, h, "#d8d0b8", C.green); },
    temple: function (c, w, h) {
      R(c, 0, 0, w, h, C.brick); roofBand(c, w, 4, 12, C.red, C.brick2); R(c, 0, 2, 6, 6, C.gold); R(c, w - 6, 2, 6, 6, C.gold); R(c, w / 2 - 4, 0, 8, 6, C.gold);
      R(c, 4, 18, w - 8, 6, C.gold); doorway(c, w / 2 - 12, h - 34, 24, 34, C.red); R(c, 8, 40, 8, 10, "#f8a030"); R(c, w - 16, 40, 8, 10, "#f8a030");
    },
    market: function (c, w, h) { R(c, 0, 0, w, h, "#d8c8a8"); R(c, 0, 0, w, 6, C.brick); R(c, w / 2 - 14, 2, 28, 14, C.brick); R(c, 8, 22, w - 16, 12, C.green); windows(c, 8, 42, 3, 1, 16, 0); },
    plane: function (c, w, h) {
      R(c, 0, 0, w, h, "#b8d8f0"); R(c, 10, 12, w - 24, 10, C.white); R(c, w - 18, 14, 14, 6, C.white); R(c, 10, 2, 8, 12, C.red); R(c, 40, 22, 26, 4, C.steel); R(c, 44, 4, 18, 8, C.steel);
      for (var i = 0; i < 12; i++) R(c, 22 + i * 6, 14, 3, 3, C.blue); R(c, 0, h - 2, w, 2, C.steel2);
    }
  };
  function pagodaRoof(c, x, y, w) { R(c, x, y + 6, w, 12, C.brick2); R(c, x + 6, y, w - 12, 8, C.roof); R(c, x - 2, y + 4, 6, 3, C.roof); R(c, x + w - 4, y + 4, 6, 3, C.roof); for (var i = 2; i < 18; i += 4) R(c, x, y + i, w, 1, C.roof2); }
  function gatePlane(c, w, h, tail, flip) {
    R(c, 0, 0, w, h, "#787880"); c.save();
    if (flip) { c.translate(0, h); c.scale(1, -1); }
    R(c, 19, 0, 10, h - 2, C.white); R(c, 21, 2, 6, 3, C.glass); R(c, 2, 18, 44, 8, C.steel); R(c, 12, h - 7, 24, 5, tail); R(c, 21, 7, 6, 2, C.blue); R(c, 22, 11, 4, 2, C.blue);
    c.restore();
  }
  function shop(c, w, h, col, sign) {
    R(c, 0, 0, w, h, col); R(c, 0, 0, w, 8, C.brick); R(c, w / 2 - 12, 0, 24, 14, col); R(c, w / 2 - 12, 0, 24, 3, C.brick); R(c, w / 2 - 3, 4, 6, 6, C.gold);
    windows(c, 8, 14, 3, 1, 16, 0); R(c, 0, 34, w, 8, sign); for (var i = 0; i < w; i += 8) R(c, i, 34, 4, 8, C.white); R(c, 6, 44, w - 12, h - 44, C.dark); R(c, 10, 48, w - 20, 12, C.wood2);
  }
  var MINI = { tamsui: ["#e0c8a0", C.red], beitou: [C.wood, C.slate], miramar: ["#d8d0c8", C.red], flora: [C.white, C.green], northcoast: [C.sand, C.blue], keelung: ["#d8d8d0", C.blue], jiufen: ["#584038", C.red], thu: ["#d8b838", "#a88820"], tainan: [C.cream, C.roof], bali: ["#a89070", "#786048"], cks: [C.white, "#2848a0"], sysmh: [C.cream, "#e0b030"], dome: ["#c8ccd8", C.steel2], home: ["#d8d0c0", C.blue], nanya: ["#c8b8a0", C.roof], lin: [C.cream, C.slate], xmas: ["#a8b0b8", C.leaf2], ntm: [C.white, "#88a8a0"], paleo: [C.cream, C.brick2], nanmen: [C.brick, C.slate], railway: [C.cream, C.wood3], dihua: ["#e0c8a0", C.brick], airport: [C.white, C.blue] };
  function mini(c, w, h, region) {
    var m = MINI[region] || [C.cream, C.slate];
    R(c, 3, 12, w - 6, h - 12, m[0]); R(c, 0, 6, w, 8, m[1]); R(c, 6, 0, w - 12, 8, m[1]); windows(c, 9, 17, 3, 2, 12, 12); R(c, w / 2 - 5, h - 12, 10, 12, C.dark);
    if (region === "xmas") { R(c, w / 2 - 1, 0, 2, 2, C.gold); }
  }

  function stamp(c, name, w, h, frame) {
    if (name.indexOf("mini_") === 0) mini(c, w, h, name.slice(5));
    else if (S[name]) S[name](c, w, h, frame || 0);
    else R(c, 0, 0, w, h, "#f0f");
  }

  function paintTile(c, name, frame, x, y, floorName) {
    var t = T[name];
    if (!t) { R(c, 0, 0, TS, TS, "#f0f"); return; }
    if (typeof t === "function") { t(c, frame, x, y); return; }
    T[floorName] && typeof T[floorName] === "function" ? T[floorName](c, frame, x, y) : R(c, 0, 0, TS, TS, C.wood);
    t.paint(c, frame, x, y);
  }

  function paintSign(c) { R(c, 7, 8, 2, 8, C.wood3); R(c, 1, 2, 14, 8, C.wood); R(c, 2, 3, 12, 6, C.wood2); R(c, 3, 4, 10, 1, C.cream); R(c, 3, 6, 7, 1, C.cream); }
  function paintBoard(c) { R(c, 2, 11, 2, 5, C.wood3); R(c, 12, 11, 2, 5, C.wood3); R(c, 0, 1, 16, 11, C.wood3); R(c, 1, 2, 14, 9, C.cream); R(c, 3, 3, 4, 3, "#f0a0a0"); R(c, 8, 4, 5, 3, "#a0d0f0"); R(c, 3, 7, 5, 3, "#f0e070"); dots(c, C.red, [5, 3, 10, 4, 5, 7]); }

  // ---- characters: 16 wide, drawn on a 20×24 cell so ears and hats fit ------
  
  var CELL_W = 20, CELL_H = 24, OX = 2, OY = 6;

  var OUTFIT = {
    suit: { top: "#283058", leg: "#283058", shoe: "#181820", paint: function (c, d) { if (d === "d") { R(c, 7, 9, 2, 4, C.white); R(c, 7, 10, 2, 3, C.red); } } },
    dress: { top: "#f080a8", leg: SKIN, shoe: "#c04070", skirt: "#f080a8", paint: function (c, d) { R(c, 4, 12, 8, 1, C.white); } },
    maid: { top: "#282830", leg: SKIN, shoe: "#181820", skirt: "#282830", paint: function (c, d) { if (d !== "u") { R(c, 6, 9, 4, 5, C.white); R(c, 3, 13, 10, 1, C.white); } else { R(c, 6, 11, 4, 1, C.white); } } },
    bunny: { top: "#e8d8e0", leg: "#e8d8e0", shoe: "#d0b8c8", paint: function (c, d) { if (d === "d") R(c, 6, 10, 4, 4, C.white); if (d === "u") R(c, 7, 12, 2, 2, C.white); } },
    beach: { top: SKIN, leg: "#3088d8", shoe: SKIN, legShort: true, paint: function (c) { R(c, 4, 12, 8, 2, "#3088d8"); R(c, 4, 13, 8, 1, C.white); } },
    aloha: { top: "#d84848", leg: "#d8b880", shoe: "#785030", legShort: true, paint: function (c) { dots(c, C.white, [5, 10, 9, 9, 10, 12, 6, 12]); dots(c, C.gold, [8, 11]); } },
    qipao: { top: "#c82828", leg: SKIN, shoe: "#801818", skirt: "#c82828", narrow: true, paint: function (c, d) { R(c, 6, 9, 4, 1, C.gold); if (d === "d") { R(c, 8, 10, 1, 3, C.gold); R(c, 10, 13, 1, 2, SKIN); } } },
    uniform: { top: "#283058", leg: "#283058", shoe: "#181820", paint: function (c, d) { if (d === "d") { R(c, 7, 9, 2, 4, C.white); dots(c, C.gold, [5, 9, 10, 9]); } } },
    attendant: { top: "#284890", leg: SKIN, shoe: "#181820", skirt: "#284890", narrow: true, paint: function (c, d) { if (d === "d") R(c, 6, 9, 4, 1, C.red); } },
    miner: { top: "#5878a8", leg: "#405070", shoe: "#382818", paint: function (c) { R(c, 4, 12, 8, 1, "#382818"); } },
    robe: { top: "#c87828", leg: "#c87828", shoe: "#583818", skirt: "#c87828", paint: function (c, d) { if (d === "d") R(c, 7, 9, 3, 5, "#a85818"); } },
    deity: { top: "#b02020", leg: "#b02020", shoe: "#181820", skirt: "#d8a020", paint: function (c, d) { R(c, 4, 10, 8, 1, C.gold); if (d === "d") R(c, 6, 11, 4, 2, "#1858a0"); } },
    doctor: { top: C.white, leg: "#405070", shoe: "#181820", paint: function (c, d) { if (d === "d") { R(c, 7, 9, 2, 4, "#80b0e0"); R(c, 5, 10, 1, 3, C.dark); } } },
    stage: { top: "#c8d0e8", leg: "#c8d0e8", shoe: "#f0f0f8", paint: function (c, d) { dots(c, "#ffffff", [5, 10, 9, 9, 7, 12, 10, 11]); dots(c, "#80e8f8", [6, 9, 10, 12]); } },
    dance: { top: "#e83878", leg: "#202028", shoe: "#f0f0f0", paint: function (c) { R(c, 4, 12, 8, 1, C.gold); } },
    angel: { top: C.white, leg: C.white, shoe: "#d8d8e8", skirt: C.white, wings: true, paint: function (c) { R(c, 4, 12, 8, 1, C.gold); } }
  };

  function drawBody(c, o, dir, frame) {
    var step = frame === 1, side = dir === "l" || dir === "r";
    if (o.wings) { R(c, 1, 8, 3, 5, "#e0e0f0"); R(c, 12, 8, 3, 5, "#e0e0f0"); }
    var l1 = step ? 15 : 14, l2 = step ? 14 : 15;
    if (o.skirt) {
      R(c, 4, 9, 8, 3, o.top); R(c, o.narrow ? 4 : 3, 12, o.narrow ? 8 : 10, o.narrow ? 2 : 3, o.skirt);
      R(c, 5, 14, 2, 2, o.leg); R(c, 9, 14, 2, 2, o.leg); R(c, 5, l1, 2, 1, o.shoe); R(c, 9, l2, 2, 1, o.shoe);
    } else {
      R(c, 4, 9, 8, 4, o.top);
      R(c, 4, 13, 8, 1, o.leg);
      if (side) { R(c, 6, 14, 3, 2, o.legShort ? SKIN : o.leg); R(c, step ? 4 : 8, 15, 3, 1, o.shoe); }
      else { R(c, 5, 14, 2, 2, o.legShort ? SKIN : o.leg); R(c, 9, 14, 2, 2, o.legShort ? SKIN : o.leg); R(c, 5, l1, 2, 1, o.shoe); R(c, 9, l2, 2, 1, o.shoe); }
    }
    if (!side) { R(c, 3, 9, 1, 4, o.top === C.white ? SKIN : o.top); R(c, 12, 9, 1, 4, o.top === C.white ? SKIN : o.top); R(c, 3, 13, 1, 1, SKIN); R(c, 12, 13, 1, 1, SKIN); }
    else { R(c, 7, 10, 2, 3, o.top === SKIN ? SKIN2 : o.top); R(c, 7, 13, 2, 1, SKIN); }
    o.paint(c, dir);
  }

  function drawHead(c, look, dir) {
    var hair = look.hair, H = HAIRC, side = dir === "l" || dir === "r";
    // long styles sit behind the head
    if (hair === "bald") { if (dir === "u") { R(c, 4, 1, 8, 8, SKIN); return; } R(c, 4, 1, 8, 8, SKIN); R(c, 6, 5, 1, 2, C.dark); R(c, 9, 5, 1, 2, C.dark); R(c, 7, 8, 2, 1, SKIN2); return; }
    if (hair === "long" || hair === "longcurl") { R(c, 3, 3, 10, 9, H); if (hair === "longcurl") dots(c, H, [2, 6, 2, 9, 13, 6, 13, 9, 3, 12, 12, 12]); }
    if (dir === "u") {
      R(c, 4, 1, 8, 8, H); R(c, 3, 3, 10, 5, H);
      if (hair === "bun") { R(c, 6, -1, 4, 3, H); }
      if (hair === "curl") dots(c, H, [3, 8, 12, 8, 6, 9, 9, 9]);
      return;
    }
    R(c, 4, 2, 8, 7, SKIN);
    if (side) {
      R(c, 9, 5, 1, 2, C.dark); R(c, 4, 1, 8, 3, H); R(c, 3, 2, 3, 6, H);
      if (hair === "cover") R(c, 7, 3, 4, 3, H);
      if (hair === "bun") R(c, 4, -1, 4, 3, H);
      if (hair === "curl") dots(c, H, [3, 8, 4, 9]);
      R(c, 9, 7, 1, 1, SKIN2);
      return;
    }
    R(c, 6, 5, 1, 2, C.dark); R(c, 9, 5, 1, 2, C.dark); R(c, 7, 8, 2, 1, SKIN2);
    R(c, 4, 1, 8, 2, H);
    if (hair === "side") { R(c, 4, 3, 5, 1, H); R(c, 3, 2, 1, 4, H); R(c, 12, 2, 1, 3, H); R(c, 4, 4, 2, 1, H); }
    else if (hair === "long") { R(c, 4, 3, 8, 1, H); R(c, 3, 2, 2, 9, H); R(c, 11, 2, 2, 9, H); }
    else if (hair === "cover") { R(c, 3, 2, 1, 4, H); R(c, 12, 2, 1, 4, H); R(c, 7, 3, 5, 1, H); R(c, 8, 4, 4, 3, H); R(c, 9, 7, 3, 1, H); }
    else if (hair === "curl") { R(c, 3, 2, 10, 2, H); R(c, 3, 2, 2, 6, H); R(c, 11, 2, 2, 6, H); dots(c, H, [5, 4, 7, 4, 10, 4, 2, 5, 13, 5, 2, 7, 13, 7]); }
    else if (hair === "longcurl") { R(c, 3, 2, 10, 2, H); R(c, 3, 2, 2, 9, H); R(c, 11, 2, 2, 9, H); dots(c, H, [6, 4, 9, 4]); }
    else if (hair === "bun") { R(c, 4, 3, 8, 1, H); R(c, 3, 2, 1, 4, H); R(c, 12, 2, 1, 4, H); R(c, 6, -1, 4, 3, H); }
  }

  function drawExtras(c, look, dir) {
    var side = dir === "l" || dir === "r";
    if (look.glasses && dir !== "u") {
      c.fillStyle = C.dark;
      if (side) { c.fillRect(8, 5, 4, 1); c.fillRect(8, 5, 1, 3); c.fillRect(11, 5, 1, 3); }
      else { c.fillRect(5, 4, 6, 1); c.fillRect(5, 4, 1, 3); c.fillRect(7, 4, 1, 3); c.fillRect(8, 4, 1, 3); c.fillRect(10, 4, 1, 3); }
    }
    if (look.head === "bunny" || look.outfit === "bunny") {
      R(c, 4, -5, 3, 7, look.outfit === "bunny" ? "#e8d8e0" : C.white); R(c, 9, -5, 3, 7, look.outfit === "bunny" ? "#e8d8e0" : C.white);
      R(c, 5, -4, 1, 5, "#f0a0b8"); R(c, 10, -4, 1, 5, "#f0a0b8");
    }
    if (look.head === "clip" && dir !== "u") { R(c, side ? 5 : 10, 2, 3, 2, "#f06090"); }
    if (look.head === "cap") { R(c, 3, 0, 10, 3, look.capColor || "#283058"); R(c, 3, 3, 11, 1, C.dark); R(c, 7, 1, 2, 1, C.gold); }
    if (look.head === "helmet") { R(c, 3, -1, 10, 4, look.helmetColor || "#f0c030"); R(c, 2, 3, 12, 1, look.helmetEdge || "#c09020"); R(c, 7, 0, 2, 2, C.white); }
    if (look.head === "crown") { R(c, 3, -2, 10, 3, C.gold); dots(c, C.red, [5, -1, 8, -1, 11, -1]); R(c, 2, 1, 12, 1, C.gold); if (dir !== "u") { R(c, 5, 8, 6, 3, "#202020"); } }
    if (look.head === "party") { for (var i = 0; i < 6; i++) R(c, 7 - (i >> 1), -4 + i, 2 + (i >> 1) * 2, 1, i % 2 ? C.gold : C.blue); R(c, 7, -5, 2, 1, C.red); }
    if (look.outfit === "angel") { R(c, 5, -2, 6, 1, C.gold); }
  }

  function paintChar(c, look, dir, frame) {
    if (look.pose && frame === 1) {          // dancers raise their arms, the singer lifts the microphone
      c.save(); c.translate(OX, OY);
      var arm = (OUTFIT[look.outfit] || OUTFIT.aloha).top;
      if (look.pose === "dance") { R(c, 2, 3, 2, 6, arm); R(c, 12, 3, 2, 6, arm); R(c, 2, 2, 2, 1, SKIN); R(c, 12, 2, 2, 1, SKIN); }
      else { R(c, 11, 6, 2, 4, arm); R(c, 11, 4, 3, 2, C.dark); }
      c.restore();
    }
    c.save();
    if (dir === "r") { c.translate(CELL_W, 0); c.scale(-1, 1); }
    c.translate(OX, OY);
    var d = dir === "r" ? "l" : dir;
    if (d === "l") { c.translate(16, 0); c.scale(-1, 1); }       // side art faces right; mirrored once for left
    var o = OUTFIT[look.outfit] || OUTFIT.aloha;
    c.save(); c.translate(0, frame === 1 ? 0 : 0); drawBody(c, o, d, frame); c.restore();
    drawHead(c, look, d); drawExtras(c, look, d);
    c.restore();
  }

  // ---- vehicles -----------------------------------------------------------
  function paintVehicle(c, v, dir, frame) {
    var side = dir === "l" || dir === "r";
    c.save(); c.translate(OX, OY);
    if (v === "car") {
      if (side) { R(c, -2, 5, 20, 8, C.red); R(c, 2, 1, 11, 6, "#b82020"); R(c, 3, 2, 4, 4, C.glass); R(c, 8, 2, 4, 4, C.glass); R(c, 0, 12, 4, 4, C.dark); R(c, 12, 12, 4, 4, C.dark); dots(c, C.gold, dir === "r" ? [17, 7] : [-2, 7]); }
      else { R(c, 1, 1, 14, 15, C.red); R(c, 3, 3, 10, 4, C.glass); R(c, 3, 11, 10, 3, dir === "d" ? C.gold : "#b82020"); R(c, 0, 3, 2, 4, C.dark); R(c, 14, 3, 2, 4, C.dark); R(c, 0, 11, 2, 4, C.dark); R(c, 14, 11, 2, 4, C.dark); }
    } else if (v === "boat") {
      R(c, -1, 8, 18, 7, C.wood); R(c, 1, 14, 14, 2, C.wood3); R(c, 1, 9, 14, 2, C.wood2);
    } else {
      var col = v === "moto" ? "#3058c8" : "#30a860", wh = frame === 1 ? C.grey : C.dark;
      if (side) { R(c, -1, 11, 5, 5, wh); R(c, 12, 11, 5, 5, wh); R(c, 3, 11, 10, v === "moto" ? 3 : 1, col); R(c, 12, 7, 2, 5, col); }
      else { R(c, 6, 10, 4, 6, wh); R(c, 3, 8, 10, 2, col); R(c, 7, 10, 2, v === "moto" ? 4 : 2, col); }
    }
    c.restore();
  }

  var cache = {};
  function sprite(look, dir, frame, vehicle) {
    var key = JSON.stringify(look) + dir + frame + vehicle;
    var s = cache[key];
    if (s) return s;
    var cv = mk(CELL_W + 8, CELL_H), c = cv.getContext("2d");
    c.translate(4, 0);
    if (vehicle === "lie") {          // head on the pillow, blanket over the rest
      c.save(); c.beginPath(); c.rect(-4, 0, CELL_W + 8, OY + 10); c.clip(); paintChar(c, look, "d", 0); c.restore();
      R(c, OX, OY + 10, 16, 6, "#88a8e0"); R(c, OX, OY + 10, 16, 1, "#4868a8");
    }
    else if (vehicle === "car") { paintVehicle(c, "car", dir, frame); }
    else if (vehicle === "boat") { c.save(); c.beginPath(); c.rect(-4, 0, CELL_W + 8, OY + 11); c.clip(); c.translate(0, -1); paintChar(c, look, dir, 0); c.restore(); paintVehicle(c, "boat", dir, frame); }
    else if (vehicle === "bike" || vehicle === "moto") { paintVehicle(c, vehicle, dir, frame); c.translate(0, -2); paintChar(c, look, dir, 0); }
    else paintChar(c, look, dir, frame);
    cache[key] = cv;
    return cv;
  }

  var NPC = {
    guide: { sex: "f", hair: "bun", glasses: false, head: "none", outfit: "suit" },
    mom: { sex: "f", hair: "curl", glasses: true, head: "none", outfit: "qipao" },
    dad: { sex: "m", hair: "side", glasses: true, head: "none", outfit: "aloha" },
    bro: { sex: "m", hair: "cover", glasses: false, head: "none", outfit: "suit" },
    santa: { sex: "m", hair: "side", glasses: false, head: "party", outfit: "qipao" }
  };

  var GREENS = [[15, 56, 15], [48, 98, 48], [139, 172, 15], [202, 220, 159]];

  return {
    TS: TS, GLOW_STAMP: GLOW_STAMP, CELL_W: CELL_W + 8, CELL_H: CELL_H, OX: OX + 4, OY: OY, GLOW: GLOW, NPC: NPC, GREENS: GREENS,
    S: S, OUTFIT: OUTFIT, dots: dots, roofBand: roofBand, windows: windows, doorway: doorway, SKIN: SKIN, SKIN2: SKIN2, HAIRC: HAIRC,
    mk: mk, R: R, C: C, paintTile: paintTile, stamp: stamp, sprite: sprite, paintSign: paintSign, paintBoard: paintBoard
  };
})();
