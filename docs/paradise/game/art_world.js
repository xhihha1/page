/* 樂園 art, fifth set (11/9): temples and processions, the moon and the sun, the church, the wedding venue,
   Taipei, Taichung, Kaohsiung, Yilan and Pinglin. Loaded after art_more.js; drawn in code like the rest. */
(function (A) {
  "use strict";
  var R = A.R, C = A.C, dots = A.dots, windows = A.windows, S = A.S, NPC = A.NPC, OUTFIT = A.OUTFIT, HEADS = A.HEADS, T = A.T;
  var SKIN = A.SKIN, GOLD = C.gold, RED = "#c82820", RED2 = "#901810", JADE = "#2a8a50", JADE2 = "#1a6a38";

  function disc(c, cx, cy, r, col) {
    for (var y = -r; y <= r; y++) { var hw = Math.round(Math.sqrt(r * r - y * y)); R(c, cx - hw, cy + y, hw * 2, 1, col); }
  }

  // ---- tiles ---------------------------------------------------------------------
  T.cypress = function (c, f, x, y) {           // 落羽松: a tall rust-red conifer on grass
    T.grass(c, f, x, y);
    R(c, 7, 12, 2, 4, C.trunk);
    for (var i = 0; i < 12; i++) { var hw = 1 + Math.round(i / 2.4); R(c, 8 - hw, i, hw * 2, 1, i % 3 ? "#b85a30" : "#8a3a20"); }
  };
  T.moonrock = function (c, f, x, y) {
    R(c, 0, 0, 16, 16, "#c8c8d0"); var h = (x * 7 + y * 13) % 5;
    if (h === 0) { disc(c, 8, 8, 4, "#a8a8b4"); disc(c, 7, 7, 2, "#b8b8c4"); }
    dots(c, "#e0e0e8", [(x * 5) % 16, (y * 3) % 16, (x * 11 + 4) % 16, (y * 7 + 9) % 16]);
  };
  T.sunfloor = function (c, f, x, y) {
    R(c, 0, 0, 16, 16, f ? "#f8b030" : "#f8a020");
    dots(c, "#f8e070", [(x * 5 + f * 3) % 16, (y * 3) % 16, (x * 11 + 4) % 16, (y * 7 + 9 + f * 5) % 16, (x + y * 3) % 16, 8]);
    if ((x + y + f) % 4 === 0) R(c, 4, 6, 3, 2, "#f86818");
  };

  // ---- signs show their gate number; minigame entrances get a marker ------------------
  var DIGITS = ["111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001",
                "111100111001111", "111100111101111", "111001010010010", "111101111101111", "111101111001111"];
  var oldSign = A.paintSign;
  A.paintSign = function (c, num) {
    oldSign(c);
    if (!num) return;
    var str = String(num), w = str.length * 4 - 1, x0 = 8 - Math.ceil(w / 2);
    R(c, x0 - 1, 3, w + 2, 7, C.cream);
    for (var k = 0; k < str.length; k++) {
      var g = DIGITS[+str[k]];
      for (var i = 0; i < 15; i++) if (g[i] === "1") R(c, x0 + k * 4 + i % 3, 4 + Math.floor(i / 3), 1, 1, C.dark);
    }
  };
  A.paintShaft = function (c) {                 // a dark way down, hazard stripes and an arrow
    R(c, 1, 2, 14, 14, "#181818"); R(c, 2, 3, 12, 12, "#303038");
    for (var i = 0; i < 14; i += 4) { R(c, 1 + i, 0, 2, 2, GOLD); R(c, 3 + i, 0, 2, 2, C.dark); }
    R(c, 7, 5, 2, 5, GOLD); R(c, 5, 9, 6, 1, GOLD); R(c, 6, 10, 4, 1, GOLD); R(c, 7, 11, 2, 1, GOLD);
  };

  // ---- headwear ------------------------------------------------------------------
  HEADS.guanhat = function (c, look, dir) { R(c, 3, -2, 10, 4, "#2a7a40"); R(c, 2, 1, 12, 1, GOLD); dots(c, RED, [7, -1]); if (dir === "d") R(c, 7, 0, 2, 2, GOLD); };
  HEADS.phoenix = function (c, look, dir) {     // 媽祖: crown with a curtain of beads
    R(c, 3, -3, 10, 4, GOLD); R(c, 5, -5, 6, 2, GOLD); dots(c, RED, [5, -2, 8, -3, 11, -2]);
    if (dir === "d") for (var x = 4; x < 12; x += 2) R(c, x, 2, 1, 4, "#f8f0c0");
  };
  HEADS.horns = function (c) { R(c, 3, -3, 2, 4, "#f0e0b0"); R(c, 11, -3, 2, 4, "#f0e0b0"); R(c, 2, -4, 1, 2, "#f0e0b0"); R(c, 13, -4, 1, 2, "#f0e0b0"); };
  HEADS.hood = function (c, look, dir) {        // ninja: everything but the eyes
    R(c, 3, 0, 10, 9, "#202028"); if (dir === "d") { R(c, 5, 4, 6, 2, look.skin || SKIN); dots(c, C.dark, [6, 5, 9, 5]); } else if (dir !== "u") { R(c, 8, 4, 3, 2, look.skin || SKIN); }
    R(c, 12, 2, 3, 1, RED);
  };
  HEADS.whitehood = function (c, look, dir) { R(c, 3, -1, 10, 3, C.white); R(c, 2, 1, 2, 11, C.white); R(c, 12, 1, 2, 11, C.white); if (dir === "u") R(c, 3, 0, 10, 10, C.white); };
  HEADS.halo = function (c) { R(c, 3, -3, 10, 1, GOLD); R(c, 2, -2, 1, 1, GOLD); R(c, 13, -2, 1, 1, GOLD); };
  HEADS.sunrays = function (c) { R(c, 3, -2, 10, 3, GOLD); for (var i = 0; i < 5; i++) R(c, 3 + i * 2 + (i > 2 ? 1 : 0), -5 + Math.abs(2 - i), 1, 3, "#f87818"); };
  HEADS.hairpin = function (c) { R(c, 6, -3, 4, 3, look_hair()); R(c, 4, -2, 8, 1, GOLD); dots(c, "#f080a8", [11, -2, 4, -3]); };
  function look_hair() { return "#302018"; }
  HEADS.kerchief = function (c, look) { R(c, 3, 0, 10, 3, look.kerchief || "#c8a060"); R(c, 12, 2, 2, 5, look.kerchief || "#c8a060"); };
  HEADS.plume = function (c) { R(c, 3, -1, 10, 3, GOLD); R(c, 6, -5, 4, 4, RED); R(c, 7, -7, 2, 2, RED); };
  HEADS.facepaint = function (c, look, dir) {   // 八家將 face paint
    if (dir === "u") return;
    R(c, 4, 3, 8, 1, RED); R(c, dir === "d" ? 7 : 9, 2, 2, 6, C.dark); dots(c, GOLD, [5, 6, 10, 6]);
    R(c, 4, 1, 8, 2, "#202020");
  };

  // ---- outfits (NPCs, and the wedding gown) ----------------------------------------
  function o(top, leg, shoe, extra) { var r = { top: top, leg: leg, shoe: shoe, paint: function () {} }; for (var k in extra || {}) r[k] = extra[k]; return r; }
  OUTFIT.gown = o(C.white, C.white, "#e0e0e8", { skirt: C.white, paint: function (c, d) {
    if (d !== "u") { R(c, 2, 13, 12, 2, C.white); dots(c, "#d8d8e8", [4, 13, 7, 14, 10, 13, 12, 14]); R(c, 6, 9, 4, 1, "#f0d0e0"); }
    R(c, 3, 2, 10, 11, "rgba(248,248,255,.55)");
  } });
  OUTFIT.greenrobe = o("#2a7a40", "#2a7a40", "#181818", { skirt: "#2a6a38", paint: function (c, d) { R(c, 4, 10, 8, 1, GOLD); if (d === "d") R(c, 6, 9, 4, 1, RED); } });
  OUTFIT.armor = o("#c8a030", "#802020", "#202020", { skirt: "#a02020", paint: function (c, d) { R(c, 4, 9, 8, 1, "#e8d070"); if (d === "d") { disc(c, 8, 11, 2, "#f0e090"); } } });
  OUTFIT.vest = o(RED, "#e8c040", "#202020", { paint: function (c, d) { if (d === "d") R(c, 7, 9, 2, 4, "#f8f0d8"); R(c, 4, 12, 8, 1, GOLD); } });
  OUTFIT.mazurobe = o("#c82838", "#c82838", "#202020", { skirt: "#e8b030", paint: function (c, d) { R(c, 4, 10, 8, 1, GOLD); if (d === "d") { R(c, 6, 11, 4, 3, "#2858a8"); dots(c, GOLD, [7, 12, 8, 13]); } } });
  OUTFIT.demon_g = o("#3a8a5a", "#c83020", "#202020", { paint: function (c) { R(c, 4, 12, 8, 1, GOLD); R(c, 3, 13, 10, 1, "#c83020"); } });
  OUTFIT.demon_r = o("#c83828", "#2a6a3a", "#202020", { paint: function (c) { R(c, 4, 12, 8, 1, GOLD); R(c, 3, 13, 10, 1, "#2a6a3a"); } });
  OUTFIT.whiterobe = o(C.white, C.white, "#d8d0c0", { skirt: C.white, paint: function (c, d) { if (d === "d") R(c, 7, 9, 2, 5, "#e8d8a0"); } });
  OUTFIT.jesusrobe = o(C.white, C.white, "#a07850", { skirt: C.white, paint: function (c, d) { R(c, d === "d" ? 4 : 6, 9, 2, 6, "#a82830"); } });
  OUTFIT.police = o("#8ab0e0", "#203050", "#181818", { paint: function (c, d) { if (d === "d") { R(c, 7, 9, 2, 4, "#203050"); dots(c, GOLD, [5, 10]); } } });
  OUTFIT.sailor = o(C.white, "#283868", "#202020", { skirt: "#283868", narrow: true, paint: function (c, d) { R(c, 4, 9, 8, 1, "#283868"); if (d === "d") R(c, 7, 10, 2, 2, RED); } });
  OUTFIT.ninja = o("#303038", "#303038", "#181818", { paint: function (c) { R(c, 4, 12, 8, 1, RED); } });
  OUTFIT.hanfu = o("#f8d8e0", "#f8d8e0", "#e090a8", { skirt: "#f0b8c8", paint: function (c) { R(c, 4, 11, 8, 1, "#e060a0"); R(c, 2, 10, 2, 5, "#f8e8f0"); R(c, 12, 10, 2, 5, "#f8e8f0"); } });
  OUTFIT.worker = o("#8a6a40", "#5a4a30", "#382818", { paint: function (c) { R(c, 4, 12, 8, 1, "#382818"); } });
  OUTFIT.moonrobe = o("#e8e8f8", "#e8e8f8", "#b8b8d8", { skirt: "#c8d0f0", paint: function (c) { R(c, 4, 10, 8, 1, "#a8b8e8"); } });
  OUTFIT.sunrobe = o("#e83818", "#e83818", "#802010", { skirt: "#f8a020", paint: function (c, d) { R(c, 4, 10, 8, 1, GOLD); if (d === "d") disc(c, 8, 12, 2, GOLD); } });
  OUTFIT.archer = o("#7a5a30", "#5a4020", "#382818", { paint: function (c, d) { R(c, d === "l" ? 3 : 11, 7, 1, 8, C.wood3); R(c, 4, 9, 8, 1, "#c8a060"); } });
  OUTFIT.shepherdrobe = o("#a88858", "#a88858", "#5a4020", { skirt: "#987848", paint: function (c) { R(c, 4, 11, 8, 1, "#5a4020"); } });
  OUTFIT.tribal = o("#202020", "#c82020", "#202020", { paint: function (c) { R(c, 4, 10, 8, 1, C.white); R(c, 4, 12, 8, 1, GOLD); dots(c, C.white, [5, 11, 8, 11, 11, 11]); } });
  OUTFIT.shirt = o("#f0f0f0", "#283048", "#181818", { paint: function (c, d) { if (d === "d") R(c, 7, 9, 2, 1, "#c8c8c8"); } });
  OUTFIT.jiajiang = o("#e86018", "#203048", "#181818", { skirt: "#c82820", paint: function (c) { R(c, 4, 10, 8, 1, GOLD); } });

  // ---- people ----------------------------------------------------------------------
  function npc(name, look) { NPC[name] = look; }
  npc("guangong", { sex: "m", hair: "side", head: "guanhat", outfit: "greenrobe", skin: "#c83020", beard: "#181818" });
  npc("zhoucang", { sex: "m", hair: "side", head: "plume", outfit: "armor", skin: "#4a3424", beard: "#181818" });
  npc("jiang", { sex: "m", hair: "side", head: "plume", outfit: "armor", skin: "#f0d0a0", beard: "#181818" });
  npc("jiang2", { sex: "m", hair: "side", head: "plume", outfit: "armor", skin: "#303030" });
  npc("drummer", { sex: "m", hair: "side", head: "kerchief", kerchief: RED, outfit: "vest" });
  npc("mazu", { sex: "f", hair: "bun", head: "phoenix", outfit: "mazurobe" });
  npc("qianliyan", { sex: "m", hair: "side", hairColor: "#c83020", head: "horns", outfit: "demon_g", skin: "#3a8a5a" });
  npc("shunfenger", { sex: "m", hair: "side", hairColor: "#284020", head: "horns", outfit: "demon_r", skin: "#c83828" });
  npc("guanyin", { sex: "f", hair: "bun", head: "whitehood", outfit: "whiterobe" });
  npc("qingshanwang", { sex: "m", hair: "side", head: "crown", outfit: "deity", skin: "#383838", beard: "#181818" });
  npc("jiajiang", { sex: "m", hair: "side", head: "facepaint", outfit: "jiajiang", skin: "#f0e8e0" });
  npc("jiajiang2", { sex: "m", hair: "side", head: "facepaint", outfit: "jiajiang", skin: "#e8e0c8" });
  npc("auntie", { sex: "f", hair: "longcurl", hairColor: "#583020", glasses: false, head: "none", outfit: "qipao" });
  npc("police", { sex: "m", hair: "side", head: "cap", capColor: "#203050", outfit: "police" });
  npc("cosplay1", { sex: "f", hair: "long", hairColor: "#e890c8", head: "clip", outfit: "sailor" });
  npc("cosplay2", { sex: "f", hair: "curl", hairColor: "#80c0f0", head: "bunny", outfit: "maid" });
  npc("ninja", { sex: "m", hair: "side", head: "hood", outfit: "ninja" });
  npc("ninja2", { sex: "f", hair: "bun", head: "hood", outfit: "ninja" });
  npc("tribal", { sex: "m", hair: "side", head: "kerchief", kerchief: "#c82020", outfit: "tribal" });
  npc("change", { sex: "f", hair: "bun", head: "hairpin", outfit: "hanfu" });
  npc("wugang", { sex: "m", hair: "side", head: "kerchief", kerchief: "#c8a060", outfit: "worker", beard: "#302018" });
  npc("taiyin", { sex: "f", hair: "long", head: "crown", outfit: "moonrobe" });
  npc("sungod", { sex: "m", hair: "side", head: "sunrays", outfit: "sunrobe", beard: "#302018" });
  npc("xihe", { sex: "f", hair: "bun", head: "crown", outfit: "sunrobe" });
  npc("kuafu", { sex: "m", hair: "long", outfit: "beach", skin: "#c88858", beard: "#302018" });
  npc("houyi", { sex: "m", hair: "side", head: "kerchief", kerchief: "#802020", outfit: "archer" });
  npc("jesus", { sex: "m", hair: "long", hairColor: "#5a3a20", beard: "#5a3a20", head: "halo", outfit: "jesusrobe" });
  npc("shepherd", { sex: "m", hair: "side", head: "kerchief", kerchief: "#d8c8a0", outfit: "shepherdrobe", beard: "#504030" });
  npc("brother", { sex: "m", hair: "side", glasses: true, outfit: "suit" });
  npc("hymn_m", { sex: "m", hair: "side", outfit: "shirt", pose: "sing" });
  npc("hymn_f", { sex: "f", hair: "long", outfit: "dress", pose: "sing" });
  npc("hymn_f2", { sex: "f", hair: "bun", glasses: true, outfit: "qipao" });

  // ---- animals ---------------------------------------------------------------------
  var MORE = {
    snake: function (c, f) { R(c, 2, 12, 12, 3, "#486828"); R(c, 3, 8, 9, 3, "#587830"); R(c, 9, 4 + f, 4, 4, "#587830"); dots(c, C.dark, [11, 5 + f]); R(c, 13, 7 + f, 2, 1, RED); R(c, 0, 0, 16, 1, C.steel); R(c, 0, 0, 1, 16, C.steel); R(c, 15, 0, 1, 16, C.steel); },
    sheep: function (c, f) { R(c, 3, 5, 10, 7, "#f0f0e8"); dots(c, "#d8d8d0", [4, 6, 7, 5, 10, 7, 12, 9]); R(c, 0, 5 + f, 4, 4, "#383838"); R(c, 4, 12, 2, 3, "#383838"); R(c, 10, 12, 2, 3, "#383838"); dots(c, C.white, [1, 6 + f]); },
    crow3: function (c, f) { R(c, 4, 4, 8, 7, GOLD); R(c, 1 + f, 6, 4, 4, "#f8d860"); R(c, 11 - f, 6, 4, 4, "#f8d860"); R(c, 7, 1, 4, 4, GOLD); R(c, 11, 2, 2, 1, "#f87818"); dots(c, C.dark, [9, 2]); R(c, 5, 11, 1, 4, "#f87818"); R(c, 8, 11, 1, 4, "#f87818"); R(c, 11, 11, 1, 4, "#f87818"); }
  };
  var oldAnimal = A.animal, cache = {};
  A.animal = function (kind, frame) {
    if (!MORE[kind]) return oldAnimal(kind, frame);
    var key = kind + frame;
    if (!cache[key]) { cache[key] = A.mk(16, 16); MORE[kind](cache[key].getContext("2d"), frame % 2); }
    return cache[key];
  };

  // ---- shared building parts -----------------------------------------------------------
  function bigTemple(c, w, h, roof, roof2, wall) {      // 廟: steps, dragon pillars, carved doors, swallowtail roofs
    A.steps(c, 20, h - 12, w - 40, 6, "#c8c0b0", "#b0a898");
    R(c, 12, h * .42, w - 24, h * .58 - 12, wall || "#d8b888");
    A.hall(c, w * .2, h * .5, w * .6, h * .5 - 14, "#b03020", "#902018", true);
    A.dragonPillar(c, w * .2 - 6, h * .5, h * .5 - 14); A.dragonPillar(c, w * .8 + 1, h * .5, h * .5 - 14);
    A.swallowRoof(c, 10, h * .3, w - 20, h * .14, roof, roof2, roof2);
    A.swallowRoof(c, w * .22, 10, w * .56, h * .14, roof, roof2, roof2);
    A.lanterns(c, w * .25, h * .45, 3, w * .2);
  }

  // ---- 大溪・大甲・大安 --------------------------------------------------------------
  S.puji = function (c, w, h) { R(c, 2, 20, w - 4, h - 20, "#d8b888"); A.hall(c, 8, 30, w - 16, h - 30, "#b03020", "#902018", true); A.swallowRoof(c, 4, 12, w - 8, 12, "#e07828", "#a84818", "#a84818"); };
  S.zhenlan = function (c, w, h) { bigTemple(c, w, h, "#e07828", "#a84818"); };
  S.turbine = function (c, w, h, f) {
    R(c, 14, 14, 4, h - 14, "#e8e8f0"); R(c, 13, h - 4, 6, 4, "#c8c8d0"); disc(c, 16, 14, 2, "#c8c8d0");
    var a = f ? 0.5 : 0;
    for (var i = 0; i < 3; i++) {
      var ang = a + i * 2.094;
      for (var r = 3; r < 14; r++) R(c, Math.round(16 + Math.cos(ang) * r), Math.round(14 + Math.sin(ang) * r), 2, 2, "#f8f8f8");
    }
  };
  S.mazu_statue = function (c, w, h) {        // a robe that widens to the ground, hands folded, beaded crown
    R(c, 4, h - 18, w - 8, 18, "#c8c0b0"); R(c, 0, h - 20, w, 3, "#a8a090");
    for (var y = 30; y < h - 20; y++) { var hw = 9 + Math.round((y - 30) * .28); R(c, w / 2 - hw, y, hw * 2, 1, (y % 9) ? "#c82838" : "#e8b030"); }
    R(c, w / 2 - 12, 34, 24, 4, "#e8b030"); R(c, w / 2 - 4, 40, 8, 14, "#2858a8"); R(c, w / 2 - 6, 44, 12, 4, "#f0c8a0");
    disc(c, w / 2, 22, 9, "#f0c8a0"); R(c, w / 2 - 9, 13, 18, 4, "#302018"); dots(c, C.dark, [w / 2 - 4, 22, w / 2 + 3, 22]);
    R(c, w / 2 - 11, 6, 22, 8, GOLD); R(c, w / 2 - 7, 1, 14, 6, GOLD); dots(c, RED, [w / 2 - 6, 9, w / 2, 3, w / 2 + 5, 9]);
    for (var x = w / 2 - 8; x < w / 2 + 9; x += 3) R(c, x, 14, 1, 6, "#f8f0c0");
  };

  // ---- 萬華・西門 ---------------------------------------------------------------------
  S.longshan = function (c, w, h) { bigTemple(c, w, h, "#2a8a6a", "#1a5a48", "#d8c098"); };
  S.qingshan_temple = function (c, w, h) { bigTemple(c, w, h, "#e07828", "#a84818"); };
  S.sedan = function (c, w, h) {
    R(c, 0, h - 14, w, 3, C.wood3); R(c, 0, 18, w, 3, C.wood3);
    R(c, 10, 6, w - 20, h - 12, RED); R(c, 12, 10, w - 24, h - 20, "#f0c030"); R(c, 8, 2, w - 16, 6, GOLD); R(c, w / 2 - 2, 0, 4, 3, GOLD);
    dots(c, RED, [16, 16, 24, 16, 32, 16]);
  };
  S.ximen_red = function (c, w, h) {
    var B = "#b84830", B2 = "#883020";
    R(c, 70, 34, w - 74, h - 34, B); for (var y = 40; y < h; y += 5) R(c, 70, y, w - 74, 1, B2); R(c, 70, 30, w - 74, 6, C.white);
    R(c, 4, 22, 70, h - 22, B); for (y = 26; y < h; y += 5) R(c, 4, y, 70, 1, B2);
    R(c, 0, 18, 78, 6, C.white); R(c, 10, 6, 58, 14, "#585860"); R(c, 22, 0, 34, 8, "#585860");
    for (var x = 10; x < 70; x += 14) { R(c, x, 34, 8, 14, C.dark); R(c, x + 1, 35, 6, 12, C.glass); R(c, x, 34, 8, 2, C.white); }
    R(c, 30, h - 30, 18, 30, C.dark); R(c, 28, h - 32, 22, 3, C.white);
    windows(c, 82, 44, 3, 2, 18, 24, C.glass);
  };
  S.wannian = function (c, w, h) {
    R(c, 0, 0, w, h, "#d8d8d0"); var cols = ["#e83878", "#38a8e8", "#f8c838", "#58c858", "#a858e8"];
    for (var i = 0; i < 5; i++) R(c, 4, 6 + i * 18, w - 8, 12, cols[i]);
    for (i = 0; i < 5; i++) for (var x = 10; x < w - 10; x += 14) R(c, x, 9 + i * 18, 8, 6, C.white);
    R(c, w / 2 - 14, h - 24, 28, 24, C.dark); R(c, 0, h - 26, w, 2, C.steel2);
  };
  S.zhongshan = function (c, w, h) {
    var G = "#b8c8b8", G2 = "#98a898";
    R(c, 0, 40, w, h - 40, G); R(c, w / 2 - 22, 8, 44, h - 8, G2); R(c, w / 2 - 26, 4, 52, 6, "#788878");
    for (var x = 8; x < w - 8; x += 16) { if (Math.abs(x + 4 - w / 2) < 26) continue; R(c, x, 56, 10, 20, C.dark); R(c, x + 1, 54, 8, 2, C.dark); R(c, x + 1, 58, 8, 17, C.glass); }
    for (x = w / 2 - 16; x < w / 2 + 16; x += 12) { R(c, x, 20, 8, 12, C.dark); R(c, x + 1, 21, 6, 10, C.glass); }
    R(c, w / 2 - 14, h - 36, 28, 36, C.dark); for (var i = 0; i < 4; i++) R(c, w / 2 - 12 + i * 7, h - 36, 3, 36, G);
    R(c, 0, h - 6, w, 6, "#888878");
  };
  S.rainbow = function (c, w, h) {
    var cols = ["#e83838", "#f88828", "#f8d838", "#48b848", "#3878e8", "#8848c8"];
    for (var i = 0; i < 6; i++) R(c, 4 + i * 15, 2, 11, h - 4, cols[i]);
  };

  // ---- 宜蘭 ----------------------------------------------------------------------------
  S.onsen = function (c, w, h) {
    R(c, 0, 40, w, h - 40, C.wood); for (var x = 0; x < w; x += 10) R(c, x, 40, 1, h - 40, C.wood3);
    for (var i = 0; i < 20; i++) { var inset = Math.round((19 - i) * 1.2); R(c, inset, 16 + i, w - inset * 2, 1, i % 3 === 2 ? "#303038" : "#484850"); }
    R(c, 20, 4, w - 40, 14, "#484850"); R(c, 16, 2, w - 32, 3, "#303038");
    windows(c, 12, 48, 7, 1, 20, 0, "#f8e8b8");
    R(c, w / 2 - 18, h - 34, 36, 34, C.dark); R(c, w / 2 - 18, h - 34, 36, 12, "#3858a8"); R(c, w / 2 - 1, h - 34, 2, 12, C.white);
  };
  S.onsen_park = function (c, w, h, f) {
    R(c, 6, h - 30, w - 12, 26, "#58a8e8"); R(c, 4, h - 32, w - 8, 3, "#a8a098"); R(c, 4, h - 6, w - 8, 3, "#a8a098");
    for (var i = 0; i < 4; i++) R(c, 16 + i * 30, h - 44 - (f ? 4 : 0), 3, 10, "rgba(255,255,255,.7)");
    R(c, 10, 22, 4, h - 52, C.wood3); R(c, w - 14, 22, 4, h - 52, C.wood3);
    A.pavilionRoof(c, 6, 8, w - 12, 16, "#484850", "#303038");
  };
  S.ninja_castle = function (c, w, h) {
    R(c, 10, 60, w - 20, h - 60, "#a8a098"); for (var y = 64; y < h; y += 8) R(c, 10, y, w - 20, 1, "#888078");
    for (var t = 0; t < 3; t++) {
      var tw = w - 40 - t * 30, tx = (w - tw) / 2, ty = 48 - t * 18;
      R(c, tx + 6, ty, tw - 12, 14, C.white); windows(c, tx + 12, ty + 3, Math.floor((tw - 24) / 16), 1, 16, 0, C.dark);
      R(c, tx, ty - 6, tw, 6, "#303038"); R(c, tx - 4, ty - 3, 6, 3, "#303038"); R(c, tx + tw - 2, ty - 3, 6, 3, "#303038");
    }
    R(c, w / 2 - 4, 0, 8, 6, GOLD);
  };
  S.ninja_gate = function (c, w, h) {
    R(c, 8, 14, 8, h - 14, "#2a2a30"); R(c, w - 16, 14, 8, h - 14, "#2a2a30"); R(c, 0, 6, w, 8, "#2a2a30"); R(c, 4, 16, w - 8, 4, "#2a2a30");
    R(c, 18, 22, w - 36, h - 22, "#e8e0c8"); for (var x = 18; x < w - 18; x += 10) R(c, x, 22, 1, h - 22, C.wood3); for (var y = 22; y < h; y += 10) R(c, 18, y, w - 36, 1, C.wood3);
  };

  // ---- 高雄 ----------------------------------------------------------------------------
  S.warehouse = function (c, w, h) {
    R(c, 0, 14, w, h - 14, "#c86848"); for (var y = 18; y < h; y += 5) R(c, 0, y, w, 1, "#a85030");
    for (var i = 0; i < 12; i++) { var inset = Math.round(Math.abs(i - 6) * 1.6); R(c, inset, 2 + Math.round(i * .9), w - inset * 2, 2, "#787880"); }
    R(c, 10, 30, 22, h - 30, "#585860"); R(c, w - 32, 30, 22, h - 30, "#585860"); for (y = 32; y < h; y += 4) { R(c, 10, y, 22, 1, "#484850"); R(c, w - 32, y, 22, 1, "#484850"); }
  };
  S.pier_hall = function (c, w, h) {
    R(c, 0, 18, w, h - 18, "#e8e8f0"); R(c, 0, 10, w, 10, "#a8c8e8"); for (var x = 0; x < w; x += 16) R(c, x, 22, 12, 20, C.glass);
    R(c, w / 2 - 20, h - 22, 40, 22, C.dark);
  };
  S.formosa_gate = function (c, w, h) {
    for (var i = 0; i < 4; i++) {
      var x = 4 + i * 23; R(c, x + 8, 20, 3, h - 20, "#787880");
      for (var j = 0; j < 14; j++) R(c, x + j, 20 - Math.round(Math.sin(j / 13 * 3.14) * 14), 2, 3, i % 2 ? "#88d0f0" : "#a8e0f8");
    }
    R(c, 0, h - 8, w, 8, "#a8a8b0"); R(c, w / 2 - 12, h - 20, 24, 12, C.dark);
  };
  S.dome_light = function (c, w, h) {           // 光之穹頂, seen from below: rings of coloured glass
    var cx = w / 2, cy = h / 2, cols = ["#e83838", "#f8a028", "#f8e048", "#48b848", "#3878e8", "#8848c8", "#e858a8"];
    for (var y = 0; y < h; y += 2) for (var x = 0; x < w; x += 2) {
      var dx = (x - cx) / (w / 2), dy = (y - cy) / (h / 2), r = Math.sqrt(dx * dx + dy * dy);
      if (r > 1) continue;
      var a = Math.atan2(dy, dx), k = Math.floor((a + 3.1416) / 6.2832 * 14 + r * 5) % cols.length;
      R(c, x, y, 2, 2, r < .12 ? "#f8f8f0" : cols[k]);
    }
    for (var t = 0; t < 360; t += 3) { var ra = t / 57.3; R(c, Math.round(cx + Math.cos(ra) * (w / 2 - 1)), Math.round(cy + Math.sin(ra) * (h / 2 - 1)), 2, 2, C.dark); }
  };

  // ---- 公館・臺大 ------------------------------------------------------------------------
  S.water_museum = function (c, w, h) {
    R(c, 0, h - 10, w, 10, "#c8c8c0"); R(c, 6, 40, w - 12, h - 50, "#f0ece0");
    for (var x = 14; x < w - 14; x += 16) R(c, x, 42, 6, h - 54, C.white);
    R(c, 4, 34, w - 8, 8, "#e0dcd0"); disc(c, w / 2, 30, 22, "#6aa898"); R(c, w / 2 - 24, 30, 48, 8, "#e0dcd0"); R(c, w / 2 - 2, 2, 4, 8, "#6aa898");
    R(c, w / 2 - 10, h - 34, 20, 24, C.dark);
  };
  S.cistern_gate = function (c, w, h) {
    disc(c, w / 2, h, w / 2 - 2, "#58a848"); R(c, w / 2 - 18, h - 30, 36, 30, "#b84830"); R(c, w / 2 - 12, h - 24, 24, 24, C.dark); disc(c, w / 2, h - 24, 12, C.dark);
    for (var y = h - 30; y < h; y += 4) R(c, w / 2 - 18, y, 6, 1, "#883020");
  };
  S.palm = function (c, w, h) {
    R(c, 7, 12, 3, h - 12, "#a88858"); for (var y = 14; y < h; y += 4) R(c, 7, y, 3, 1, "#886838");
    R(c, 0, 4, 16, 3, JADE); R(c, 2, 2, 12, 2, "#38a060"); R(c, 0, 7, 3, 3, JADE); R(c, 13, 7, 3, 3, JADE); R(c, 6, 0, 4, 3, "#38a060");
  };
  S.fu_bell = function (c, w, h) {
    R(c, 3, 10, 2, h - 10, "#888888"); R(c, 11, 10, 2, h - 10, "#888888"); R(c, 1, 6, 14, 4, "#585860");
    R(c, 6, 12, 4, 7, "#8a6a30"); R(c, 5, 18, 6, 2, "#8a6a30"); R(c, 2, h - 3, 12, 3, "#a8a098");
  };
  S.ntu_lib = function (c, w, h) {
    R(c, 0, 24, w, h - 24, "#e0c8a0"); R(c, 0, 18, w, 8, "#a87848");
    for (var x = 12; x < w - 12; x += 22) { R(c, x, 40, 14, h - 40, "#a87848"); disc(c, x + 7, 40, 7, "#a87848"); R(c, x + 2, 42, 10, h - 42, C.dark); }
    R(c, w / 2 - 20, 4, 40, 16, "#e0c8a0"); R(c, w / 2 - 22, 2, 44, 4, "#a87848");
  };

  // ---- 坪林 ----------------------------------------------------------------------------
  S.tea_museum = function (c, w, h) {
    R(c, 0, 50, w, h - 50, "#c86848"); for (var y = 54; y < h; y += 5) R(c, 0, y, w, 1, "#a85030");
    R(c, 0, 46, 48, 8, "#e07828"); R(c, w - 48, 46, 48, 8, "#e07828");
    R(c, 44, 28, w - 88, h - 28, "#d8b888");
    A.swallowRoof(c, 40, 18, w - 80, 12, "#e07828", "#a84818", "#a84818", false);
    R(c, w / 2 - 12, h - 34, 24, 34, RED2); R(c, w / 2 - 10, h - 32, 20, 32, RED);
    A.lattice(c, 54, 36, 22, 16); A.lattice(c, w - 76, 36, 22, 16);
  };
  S.suspension = function (c, w, h) {
    R(c, 2, 0, 4, 16, "#c82820"); R(c, w - 6, 0, 4, 16, "#c82820"); R(c, 2, h - 16, 4, 16, "#c82820"); R(c, w - 6, h - 16, 4, 16, "#c82820");
    R(c, 0, 0, w, 3, "#901810"); R(c, 0, h - 16, w, 3, "#901810");
    for (var y = 16; y < h - 16; y += 1) { var sag = Math.round(Math.sin((y - 16) / (h - 32) * 3.14) * 4); R(c, 4 + sag, y, 1, 1, C.dark); R(c, w - 5 - sag, y, 1, 1, C.dark); }
  };

  // ---- 金瓜石神社 --------------------------------------------------------------------------
  S.shrine_ruins = function (c, w, h) {
    R(c, 0, h - 14, w, 14, "#a8a098"); R(c, 0, h - 14, w, 2, "#c8c0b8");
    for (var x = 10; x < w - 10; x += 22) { R(c, x, 4, 7, h - 18, "#b8b0a8"); R(c, x - 1, 2, 9, 3, "#989088"); R(c, x + 1, 6, 1, h - 22, "#d8d0c8"); }
    R(c, 40, 18, 20, 6, "#989088");
  };
  S.torii = function (c, w, h) {
    R(c, 6, 10, 6, h - 10, "#a8a098"); R(c, w - 12, 10, 6, h - 10, "#a8a098"); R(c, 0, 2, w, 6, "#989088"); R(c, 2, 0, w - 4, 3, "#888078"); R(c, 4, 14, w - 8, 4, "#a8a098");
  };

  // ---- 故宮 ----------------------------------------------------------------------------
  S.npm = function (c, w, h) {
    A.steps(c, 40, h - 14, w - 80, 7, C.white, "#d8d8d0");
    R(c, 0, 66, 54, h - 74, C.cream); R(c, w - 54, 66, 54, h - 74, C.cream);
    R(c, 0, 58, 56, 10, JADE); R(c, w - 56, 58, 56, 10, JADE); R(c, 0, 66, 56, 2, GOLD); R(c, w - 56, 66, 56, 2, GOLD);
    R(c, 44, 50, w - 88, h - 64, C.cream); for (var x = 52; x < w - 52; x += 14) R(c, x, 56, 5, h - 70, "#d8c8a0");
    R(c, w / 2 - 14, h - 50, 28, 36, C.dark);
    A.pavilionRoof(c, 36, 30, w - 72, 22, JADE, JADE2); R(c, 40, 50, w - 80, 3, GOLD);
    A.pavilionRoof(c, w / 2 - 34, 8, 68, 16, JADE, JADE2);
  };
  S.jade_cabbage = function (c, w, h) {
    R(c, 0, 0, w, h, "#283040"); R(c, 2, 2, w - 4, h - 4, "#405068");
    R(c, 10, 8, 12, 18, "#e8f0e0"); R(c, 8, 4, 16, 10, "#58b868"); R(c, 12, 2, 8, 6, "#38a048"); dots(c, "#f8f070", [11, 6, 20, 9]);
    R(c, 0, h - 4, w, 4, "#202838");
  };
  S.meat_stone = function (c, w, h) {
    R(c, 0, 0, w, h, "#283040"); R(c, 2, 2, w - 4, h - 4, "#405068");
    R(c, 8, 8, 16, 16, "#d8a068"); R(c, 8, 8, 16, 5, "#8a4a28"); R(c, 8, 16, 16, 2, "#f0c890"); dots(c, "#6a3a18", [10, 10, 14, 9, 18, 11, 21, 9]);
    R(c, 12, 24, 8, 3, GOLD); R(c, 0, h - 4, w, 4, "#202838");
  };
  S.ding = function (c, w, h) {
    R(c, 0, 0, w, h, "#283040"); R(c, 2, 2, w - 4, h - 4, "#405068");
    R(c, 7, 8, 18, 12, "#4a6a58"); R(c, 6, 6, 20, 3, "#5a7a68"); R(c, 8, 3, 3, 4, "#4a6a58"); R(c, 21, 3, 3, 4, "#4a6a58");
    R(c, 9, 20, 3, 6, "#4a6a58"); R(c, 20, 20, 3, 6, "#4a6a58"); R(c, 15, 20, 2, 6, "#4a6a58"); dots(c, "#8ab098", [10, 12, 14, 14, 20, 12]);
  };

  // ---- 天文館・月球・太陽 ------------------------------------------------------------------
  S.astro_hall = function (c, w, h) {
    R(c, 0, h - 40, w, 40, "#e8e8f0"); R(c, 0, h - 44, w, 4, "#a8a8b8"); windows(c, 10, h - 32, 9, 1, 20, 0, C.glass);
    disc(c, w / 2, h - 44, 50, "#d8dce8"); disc(c, w / 2, h - 44, 46, "#c8ccd8"); R(c, 0, h - 44, w, 46, "#e8e8f0");
    R(c, w / 2 - 50, h - 46, 100, 2, "#a8a8b8"); R(c, w / 2 - 4, h - 98, 8, 46, "#788098");
    R(c, w / 2 - 14, h - 26, 28, 26, C.dark); R(c, 0, h - 40, w, 2, "#a8a8b8");
    R(c, 0, h - 40, w, 0, C.dark);
  };
  var PLANETS = [["#a8a098", 4], ["#e8c878", 5], ["#3878e8", 5, "#48b848"], ["#d86838", 4], ["#d8a868", 13, "#b88858"], ["#e8d8a0", 10], ["#88d8e8", 5], ["#4868e8", 5], ["#c8b8a8", 2]];
  PLANETS.forEach(function (p, i) {
    S["planet" + i] = function (c, w, h) {
      R(c, 0, 0, w, h, "#101828"); dots(c, C.white, [2, 2, w - 3, h - 4, w / 2, 1]);
      disc(c, w / 2, h / 2, p[1], p[0]);
      if (p[2] && i === 2) { R(c, w / 2 - 2, h / 2 - 2, 3, 2, p[2]); R(c, w / 2 + 1, h / 2 + 1, 2, 2, p[2]); }
      if (i === 4) for (var y = -8; y < 9; y += 4) R(c, w / 2 - 12, h / 2 + y, 24, 1, p[2]);
      if (i === 5) { R(c, 4, h / 2 - 1, w - 8, 2, "#c8b888"); R(c, 8, h / 2 - 3, w - 16, 1, "#c8b888"); R(c, 8, h / 2 + 2, w - 16, 1, "#c8b888"); }
    };
  });
  S.telescope = function (c, w, h) {
    R(c, 14, 18, 4, 12, "#505868"); R(c, 6, 28, 20, 3, "#505868");
    for (var i = 0; i < 16; i++) R(c, 6 + i, 18 - i, 5, 4, i < 3 ? "#303848" : "#d8dce8");
    R(c, 22, 1, 6, 6, "#303848");
  };
  S.guanghan = function (c, w, h) {
    R(c, 6, 40, w - 12, h - 40, "#f0f0f8"); for (var x = 14; x < w - 14; x += 14) R(c, x, 44, 4, h - 44, "#d8d8e8");
    R(c, w / 2 - 12, h - 30, 24, 30, "#8898c8");
    A.swallowRoof(c, 6, 24, w - 12, 16, "#a8b8e8", "#7888c8", "#7888c8", false);
    A.swallowRoof(c, 26, 6, w - 52, 12, "#a8b8e8", "#7888c8", "#7888c8", false);
  };
  S.osmanthus = function (c, w, h) {
    R(c, w / 2 - 3, h - 26, 6, 26, C.trunk); R(c, w / 2 + 2, h - 18, 6, 3, "#c8b898");
    disc(c, w / 2, 22, 20, JADE); disc(c, w / 2 - 6, 18, 10, "#38a060");
    dots(c, GOLD, [10, 12, 16, 20, 24, 10, 30, 22, 36, 16, 20, 30, 28, 34, 14, 28, 34, 28]);
  };
  S.rose = function (c, w, h) {
    R(c, 3, 2, 10, 13, "rgba(200,232,248,.6)"); R(c, 2, 14, 12, 2, "#a8a8b8");
    R(c, 7, 8, 2, 6, "#38a048"); R(c, 5, 10, 2, 1, "#38a048"); disc(c, 8, 6, 3, "#e83848"); dots(c, "#a82838", [8, 6]);
  };
  S.sun_palace = function (c, w, h, f) {
    R(c, 8, 30, w - 16, h - 30, "#f8d860"); for (var x = 16; x < w - 16; x += 14) R(c, x, 34, 4, h - 34, "#e8b030");
    R(c, w / 2 - 12, h - 26, 24, 26, "#e83818");
    A.swallowRoof(c, 8, 16, w - 16, 14, "#f87818", "#c84808", "#c84808", false);
    for (var i = 0; i < 6; i++) R(c, 10 + i * 22, (f ? 2 : 6), 4, 8, "#f84818");
  };

  // ---- 召會・青青 ----------------------------------------------------------------------------
  S.church_hall = function (c, w, h) {
    R(c, 0, 18, w, h - 18, "#f0ece0"); R(c, 0, 12, w, 8, "#a89878"); R(c, 0, 18, w, 2, "#887858");
    windows(c, 10, 30, 7, 1, 20, 0, C.glass);
    R(c, w / 2 - 20, 22, 40, 6, "#e8e0c8"); R(c, w / 2 - 16, 24, 32, 2, "#a89878");
    R(c, w / 2 - 14, h - 32, 28, 32, C.wood3); R(c, w / 2 - 12, h - 30, 24, 30, C.glass); R(c, w / 2, h - 30, 1, 30, C.wood3);
  };
  S.baptistery = function (c, w, h) {
    R(c, 0, 0, w, h, "#d8dce8"); R(c, 4, 4, w - 8, h - 10, "#58a8e8"); R(c, 6, 6, w - 12, 3, "#88c8f8");
    R(c, w - 18, h - 8, 12, 2, "#b8bcc8"); R(c, w - 16, h - 6, 10, 2, "#b8bcc8"); dots(c, C.white, [12, 14, 30, 18, 50, 12]);
  };
  S.chapel = function (c, w, h) {
    R(c, 10, 40, w - 20, h - 40, C.white); R(c, w / 2 - 12, 14, 24, 30, C.white);
    for (var i = 0; i < 16; i++) R(c, w / 2 - 14 + Math.round(i * .9), 14 - i, 28 - Math.round(i * 1.8), 1, "#b8c0d0");
    R(c, w / 2 - 1, -2, 2, 6, GOLD); R(c, w / 2 - 3, 0, 6, 2, GOLD);
    for (i = 0; i < 18; i++) { var ins = Math.round((17 - i) * 1.4); R(c, 6 + ins, 26 + i, w - 12 - ins * 2, 1, i % 3 ? "#c8d0e0" : "#a8b0c8"); }
    for (var x = 18; x < w - 18; x += 18) { if (Math.abs(x - w / 2 + 4) < 14) continue; R(c, x, 52, 8, 22, "#a8d8f0"); disc(c, x + 4, 52, 4, "#a8d8f0"); }
    R(c, w / 2 - 10, h - 34, 20, 34, "#c8a878"); disc(c, w / 2, h - 34, 10, "#c8a878"); R(c, w / 2, h - 40, 1, 40, C.wood3);
    R(c, w / 2 - 4, 22, 8, 8, "#e8a0c0");
  };
  S.banquet = function (c, w, h) {
    R(c, 0, 30, w, h - 30, "#f0e8d8"); R(c, 0, 22, w, 10, "#c89868"); for (var x = 8; x < w - 8; x += 20) R(c, x, 40, 14, h - 52, C.glass);
    R(c, w / 2 - 14, h - 34, 28, 34, C.wood3); R(c, w / 2 - 12, h - 32, 24, 32, "#f8e8c8");
    for (var i = 0; i < 8; i++) dots(c, i % 2 ? "#f080a8" : C.white, [10 + i * 22, 34, 14 + i * 22, 36]);
  };
  S.altar_cross = function (c, w, h) { R(c, 4, 6, w - 8, 10, C.white); R(c, w / 2 - 1, 0, 2, 10, GOLD); R(c, w / 2 - 4, 3, 8, 2, GOLD); dots(c, "#f080a8", [8, 6, 10, 5, w - 9, 6, w - 11, 5]); };
  S.round_table = function (c, w, h) {
    disc(c, 16, 16, 15, "#c8a878"); disc(c, 16, 16, 12, C.white); disc(c, 16, 16, 4, "#f080a8");
    dots(c, "#d8d8d0", [8, 12, 22, 12, 12, 22, 20, 21, 16, 7]);
  };
  S.cake = function (c, w, h) { R(c, 6, 18, 20, 10, C.white); R(c, 9, 10, 14, 8, C.white); R(c, 12, 4, 8, 6, C.white); dots(c, "#f080a8", [8, 20, 14, 21, 20, 20, 24, 21, 12, 12, 18, 12, 16, 5]); R(c, 4, 28, 24, 2, "#d8d8d0"); };
  S.wedding_stage = function (c, w, h) {
    R(c, 0, 0, w, h, "#f8e8f0"); for (var x = 0; x < w; x += 8) { R(c, x + 2, 2, 4, 4, x % 16 ? "#f080a8" : C.white); R(c, x + 4, h - 8, 4, 4, x % 16 ? C.white : "#f8c0d0"); }
    R(c, w / 2 - 10, 8, 20, 12, "#f8f8f8"); R(c, w / 2 - 4, 10, 8, 8, "#f080a8");
  };

  // ---- 台中 ----------------------------------------------------------------------------
  S.taichung_hall = function (c, w, h) {
    R(c, 0, 40, w, h - 46, C.white); R(c, 0, h - 8, w, 8, "#c8c8c0");
    R(c, 0, 26, w, 16, "#505868"); for (var x = 10; x < w - 10; x += 24) { R(c, x, 28, 10, 10, C.white); R(c, x + 2, 30, 6, 7, C.glass); }
    R(c, w / 2 - 22, 6, 44, 36, "#505868"); R(c, w / 2 - 16, 0, 32, 8, "#404858"); R(c, w / 2 - 10, 14, 20, 16, C.white); disc(c, w / 2, 22, 6, C.glass);
    windows(c, 8, 50, 9, 2, 20, 26, C.glass);
    R(c, w / 2 - 14, h - 38, 28, 30, C.dark); for (var i = 0; i < 4; i++) R(c, w / 2 - 14 + i * 9, h - 38, 3, 30, C.white);
  };
  S.miyahara = function (c, w, h) {
    R(c, 0, 10, w, h - 10, "#b84830"); for (var y = 14; y < h; y += 5) R(c, 0, y, w, 1, "#883020");
    R(c, 0, 8, w, 4, C.white); R(c, 0, 52, w, 3, C.white);
    for (var x = 8; x < w - 8; x += 22) { R(c, x, 22, 14, 22, C.dark); disc(c, x + 7, 22, 7, C.dark); R(c, x + 2, 24, 10, 20, "#f8d880"); R(c, x, 60, 14, h - 60, C.dark); R(c, x + 2, 62, 10, h - 62, "#f8d880"); }
  };
  S.fourth_credit = function (c, w, h) {
    R(c, 0, 14, w, h - 14, "#e8e4d8"); R(c, 0, 8, w, 8, "#c8c4b8");
    for (var x = 8; x < w - 8; x += 20) R(c, x, 22, 8, h - 30, C.white);
    R(c, w / 2 - 14, h - 34, 28, 34, C.dark); R(c, w / 2 - 12, h - 32, 24, 30, "#f8d880"); R(c, 0, h - 8, w, 8, "#a8a8a0");
  };

  // 淡水漁人碼頭 (11/9 fix): the lovers' bridge is drawn over real water and a walkable deck, not on a blue box
  S.lovers_bridge = function (c, w, h) {
    var deck = 48;                                        // the deck covers the last three tile rows
    R(c, 0, deck, w, h - deck, "#d8d4c8");
    for (var x = 0; x < w; x += 8) R(c, x, deck + 2, 1, h - deck - 4, "#c0bcb0");
    R(c, 0, deck, w, 3, C.white); R(c, 0, h - 3, w, 3, C.white); R(c, 0, deck + 3, w, 1, "#a8a8a0");
    for (x = 0; x < w; x += 12) { R(c, x, deck - 4, 2, 4, C.white); R(c, x, h - 7, 2, 4, C.white); }
    c.fillStyle = C.white;                                // the arch springs from the deck at both ends
    for (x = 4; x < w - 4; x++) {
      var y = Math.round(deck - Math.sin((x - 4) / (w - 8) * Math.PI) * (deck - 6));
      c.fillRect(x, y, 1, 4);
      if (x % 14 === 0) { c.fillStyle = "#c8ccd0"; c.fillRect(x, y + 4, 1, deck - y - 4); c.fillStyle = C.white; }
    }
    R(c, w / 2 - 2, 2, 4, 4, RED);
  };
  function fishboat(c, w, h, hull) {
    R(c, 2, h - 9, w - 4, 6, hull); R(c, 4, h - 3, w - 8, 2, "#284868"); R(c, 2, h - 10, w - 4, 1, C.white);
    R(c, 8, h - 15, 9, 6, C.white); R(c, 10, h - 13, 5, 2, C.glass); R(c, w - 9, h - 24, 1, 15, C.dark); R(c, w - 9, h - 24, 6, 3, RED);
  }
  S.fishboat = function (c, w, h) { fishboat(c, w, h, "#3878b8"); };
  S.fishboat2 = function (c, w, h) { fishboat(c, w, h, "#c84030"); };

  // 板橋大遠百 (11/9 fix): a store front instead of a dark box, the entrance drawn as its own lit stamp
  S.mega = function (c, w, h) {
    var wall = "#e8e0d0", wall2 = "#c8c0b0", glass = "#5878a8", lit = "#f8e080";
    R(c, 0, 10, w, h - 10, wall); R(c, 0, 6, w, 6, wall2); R(c, 4, 0, w - 8, 8, wall2);
    for (var x = 0; x < w; x += 16) R(c, x, 12, 2, h - 44, wall2);                       // stone piers
    R(c, 10, 20, w - 20, 22, RED); R(c, 10, 20, w - 20, 2, RED2); R(c, 10, 40, w - 20, 2, RED2);
    R(c, 16, 25, 30, 12, GOLD); R(c, 52, 25, 60, 12, C.white);                             // the store's name board
    for (var i = 0; i < 6; i++) R(c, 56 + i * 9, 28, 5, 6, RED);
    for (var y = 50; y < h - 44; y += 18) for (x = 6; x < w - 8; x += 16) { R(c, x, y, 10, 12, glass); R(c, x + 1, y + 1, 8, 4, lit); }
    R(c, 0, h - 44, w, 4, C.dark);                                                         // canopy over the shop windows
    R(c, 0, h - 40, w, 40, wall2);
    R(c, 4, h - 36, 36, 30, glass); R(c, w - 40, h - 36, 36, 30, glass);                   // display windows
    R(c, 8, h - 32, 10, 12, "#f88878"); R(c, 22, h - 28, 12, 18, "#88c8f0"); R(c, w - 34, h - 30, 12, 20, "#f8d070"); R(c, w - 18, h - 26, 10, 14, "#a8e088");
    R(c, 0, h - 4, w, 4, "#a8a098");
  };
  S.mega_door = function (c, w, h) {                     // two tiles wide: an awning, a lit EXIT/ENTER frame, sliding doors
    R(c, 0, 0, w, 6, RED); for (var x = 0; x < w; x += 6) R(c, x, 4, 3, 2, C.white);
    R(c, 1, 6, w - 2, h - 6, "#383840"); R(c, 3, 8, w - 6, h - 8, "#f8f0c0");
    R(c, 4, 9, w / 2 - 5, h - 9, "#a8d8f8"); R(c, w / 2 + 1, 9, w / 2 - 5, h - 9, "#a8d8f8");
    R(c, w / 2 - 1, 8, 2, h - 8, "#383840"); R(c, 6, 12, 3, 10, C.white); R(c, w / 2 + 3, 12, 3, 10, C.white);
  };
  A.GLOW_STAMP.mega_door = 1;

  // overworld minis for the new regions
  var L = A.LANDMARK;
  L.palace = ["npm", 14, 8]; L.astro = ["astro_hall", 12, 8]; L.yilan = ["onsen", 10, 7]; L.qingqing = ["chapel", 8, 7];
  L.church = ["church_hall", 10, 6]; L.wanhua = ["longshan", 16, 9]; L.ximen = ["ximen_red", 9, 7]; L.gongguan = ["water_museum", 12, 7];
  L.pinglin = ["tea_museum", 12, 7]; L.taichung = ["taichung_hall", 12, 8]; L.dajia = ["zhenlan", 14, 8]; L.kaohsiung = ["formosa_gate", 6, 4];
  A.GLOW_STAMP.dome_light = 1;
})(Art);
