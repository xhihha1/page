/* 樂園 on the phone: the handheld, menus, boards, the character maker. The server decides everything that moves.
   In the static web edition window.LocalGame (local.js) plays the server inside the browser. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var SOLO = window.LocalGame || null;          // static edition: no server, no other players, no TV
  var meta = document.querySelector('meta[name="csrf-token"]'), csrf = meta ? meta.content : "";
  var DIRV = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
  var eng = new Engine($("game"), { vw: 10, vh: 9, labels: $("labels"), onMap: onMap });
  eng.held = null;                    // this phone knows its own held direction first-hand
  var world = null, ws = null, me = null, retry = 800, bannerT = 0, toastT = 0, held = null, boardBack = null;
  var uiStack = [], options = null, character = null, version = null;

  // ---- helpers -------------------------------------------------------------
  function api(method, url, body) {
    if (SOLO) return SOLO.api(method, url, body);
    var o = { method: method, headers: { "X-CSRF-Token": csrf }, credentials: "same-origin" };
    if (body !== undefined) { o.headers["Content-Type"] = "application/json"; o.body = JSON.stringify(body); }
    return fetch(url, o).then(function (r) {
      if (r.status === 401) { location.href = "/login?next=/game"; }
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) throw new Error(d.detail || "操作失敗");
        return d;
      });
    });
  }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; }
  function send(m) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); }
  function relay(m) { m.t = "ui"; send(m); }
  function toast(text) {
    var el = $("toast"); el.textContent = text; el.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 2800);
  }
  function onMap(m) {
    var el = $("banner"); el.textContent = m.name; el.hidden = false;
    clearTimeout(bannerT); bannerT = setTimeout(function () { el.hidden = true; }, 2000);
  }
  function myRec() { var a = eng.actors[eng.me]; return a ? a.rec : null; }
  function curMap() { return world && eng.map ? world.maps[eng.map] : null; }
  function ahead() {
    var r = myRec(), v = r && DIRV[r.d];
    return r ? { x: r.x + v[0], y: r.y + v[1] } : null;
  }
  function tileClass(x, y) {
    var m = curMap(), row = m.rows[y], ch = row && row.charAt(x);
    return ch ? world.classes[ch] : "solid";
  }

  // ---- screen size ---------------------------------------------------------
  function fit() {
    var dpr = window.devicePixelRatio || 1, s = $("screen"), landscape = innerWidth > innerHeight && innerHeight <= 500;
    var maxW = landscape ? innerWidth - 360 : Math.min(innerWidth, 520) - 52;
    var maxH = landscape ? innerHeight - 20 : innerHeight - 310;
    var k = Math.floor(Math.min(maxW / 160, maxH / 144) * dpr) / dpr;
    k = Math.max(k, 1);
    s.style.width = 160 * k + "px"; s.style.height = 144 * k + "px";
  }
  addEventListener("resize", fit);

  // ---- windows inside the screen -------------------------------------------
  function ui() { return uiStack[uiStack.length - 1]; }
  function renderUi() {
    var box = $("ui"), top = ui();
    box.hidden = !top;
    box.innerHTML = "";
    if (top) top.render(box);
  }
  function push(view) { uiStack.push(view); stopWalking(); renderUi(); }
  function pop() { uiStack.pop(); renderUi(); if (!uiStack.length) relay({ kind: "close" }); }
  function closeAll() { uiStack = []; renderUi(); relay({ kind: "close" }); }

  function say(title, text, then) {
    relay({ kind: "say", title: title, text: text });
    push({
      render: function (box) {
        box.innerHTML = '<div class="win">' + (title ? "<h3>" + esc(title) + "</h3>" : "") + '<div class="body">' + esc(text) + '</div><div class="more">▼</div></div>';
        box.firstChild.onclick = function () { this_key("a"); };
      },
      key: function (k) { if (k === "a" || k === "b") { pop(); if (then) then(); } }
    });
  }

  function menu(title, items, opts) {
    opts = opts || {};
    var sel = 0, list;
    while (sel < items.length - 1 && items[sel].off) sel++;
    var view = {
      render: function (box) {
        var html = '<div class="win ' + (opts.full ? "full" : "right") + '">' + (title ? "<h3>" + esc(title) + "</h3>" : "") + '<ul class="items">';
        items.forEach(function (it, i) {
          html += '<li data-i="' + i + '" class="' + (i === sel ? "sel " : "") + (it.off ? "off" : "") + '">' + esc(it.label) + (it.hint ? "<small>" + esc(it.hint) + "</small>" : "") + "</li>";
        });
        box.innerHTML = html + "</ul></div>";
        list = box.querySelector(".items");
        list.addEventListener("click", function (e) {
          var li = e.target.closest ? e.target.closest("li") : null;
          if (li) { sel = +li.getAttribute("data-i"); view.key("a"); }
        });
        var cur = list.querySelector(".sel");
        if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
      },
      key: function (k) {
        if (k === "u" || k === "d") {
          var n = items.length;
          do { sel = (sel + (k === "d" ? 1 : n - 1)) % n; } while (items[sel].off && items.some(function (i) { return !i.off; }));
          renderUi();
        } else if (k === "a") {
          if (items[sel] && !items[sel].off) items[sel].fn();
        } else if (k === "b") { pop(); if (opts.back) opts.back(); }
      }
    };
    push(view);
  }

  function ask(text, yes, no, onYes, onNo) {
    relay({ kind: "say", text: text });
    menu(text, [
      { label: yes, fn: function () { pop(); onYes(); } },
      { label: no, fn: function () { pop(); onNo(); } }
    ], { full: false, back: onNo });
  }

  // ---- input ---------------------------------------------------------------
  function setHeld(d) { held = d; eng.held = d; send({ t: "in", d: d }); }
  function stopWalking() { if (held) setHeld(null); }
  function dirDown(d) {
    if (ui()) { ui().key(d); return; }
    if (held !== d) setHeld(d);
  }
  function dirUp(d) {
    if (ui() && ui().keyUp) ui().keyUp(d);
    if (held) setHeld(null);
  }
  function this_key(k) {
    if (!$("sheet").hidden) return;
    if (ui()) { ui().key(k); return; }
    if (k === "a") interact();
    else if (k === "start") mainMenu();
    else if (k === "select") panorama();
  }

  (function bindPad() {
    var pad = $("dpad"), cur = null, parts = { u: ".up", d: ".down", l: ".left", r: ".right" };
    function mark(d) {
      Object.keys(parts).forEach(function (k) { pad.querySelector(parts[k]).classList.toggle("on", k === d); });
    }
    function at(e) {
      var r = pad.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      if (Math.abs(x) < 10 && Math.abs(y) < 10) return cur;
      return Math.abs(x) > Math.abs(y) ? (x > 0 ? "r" : "l") : (y > 0 ? "d" : "u");
    }
    function set(d) { if (d === cur) return; var old = cur; cur = d; mark(d); if (old) dirUp(old); if (d) dirDown(d); }
    pad.addEventListener("pointerdown", function (e) { e.preventDefault(); try { pad.setPointerCapture(e.pointerId); } catch (x) {} set(at(e)); });
    pad.addEventListener("pointermove", function (e) { if (cur) set(at(e)); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (n) { pad.addEventListener(n, function () { set(null); }); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-k]"), function (b) {
      var k = b.getAttribute("data-k");
      b.addEventListener("pointerdown", function (e) { e.preventDefault(); b.classList.add("on"); this_key(k); });
      ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) { b.addEventListener(n, function () { b.classList.remove("on"); }); });
    });
    var keys = { ArrowUp: "u", ArrowDown: "d", ArrowLeft: "l", ArrowRight: "r", w: "u", s: "d", a: "l", d: "r" };
    var btns = { z: "a", " ": "a", x: "b", Enter: "start", Shift: "select", Escape: "b" };
    addEventListener("keydown", function (e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (keys[e.key]) { e.preventDefault(); if (!e.repeat) { if (ui()) ui().key(keys[e.key]); else dirDown(keys[e.key]); } }
      else if (btns[e.key] && !e.repeat) { e.preventDefault(); this_key(btns[e.key]); }
    });
    addEventListener("keyup", function (e) { if (keys[e.key]) dirUp(keys[e.key]); });
  })();
  document.addEventListener("gesturestart", function (e) { e.preventDefault(); });
  document.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  // ---- talking to the world ------------------------------------------------
  function interact() {
    var a = ahead(), m = curMap(), r = myRec();
    if (r && r.lie && !r.lead) { send({ t: "getup" }); return; }
    if (!a || !m || r.lead) { if (r && r.lead) toast("跟著隊長走就好。選單可以離隊。"); return; }
    var o = m.objects.filter(function (x) { return x.x === a.x && x.y === a.y; })[0];
    if (!o && m.rows[a.y] && m.rows[a.y].charAt(a.x) === "O") {          // look over the fence at the animals
      var b = { x: a.x + (a.x - r.x), y: a.y + (a.y - r.y) };
      o = m.objects.filter(function (x) { return x.x === b.x && x.y === b.y && x.k === "npc"; })[0];
    }
    if (o) {
      if (o.k === "sign" || o.k === "npc") say(o.title, o.text);
      else if (o.k === "board") openBoard(o.region);
      else if (o.k === "elevator") elevator(o);
      else if (o.k === "telescope") telescope(o);
      else if (o.k === "dress") dressRoom();
      else if (o.k === "baptism") baptism();
      else if (o.k === "bed") send({ t: "lie" });
      else if (o.k === "shaft") openShaft(o.course, o.title);
      return;
    }
    var other = Object.keys(eng.actors).filter(function (id) {
      var q = eng.actors[id]; return id !== eng.me && !q.hid && q.tx === a.x && q.ty === a.y;
    })[0];
    if (other) { playerMenu({ id: other, n: eng.actors[other].n, on: eng.actors[other].on, here: true }); return; }
    var cls = tileClass(a.x, a.y);
    if (cls === "water" && r.v !== "boat") ask("要叫船嗎？", "搭船", "不用", function () { send({ t: "vehicle", v: "boat" }); }, function () {});
    else if (r.v === "boat" && cls !== "water" && cls !== "solid") ask("要下船嗎？", "下船", "不用", function () { send({ t: "vehicle", v: "none" }); }, function () {});
  }

  function elevator(o) {
    var floors = Object.keys(o.floors);
    menu("電梯", floors.map(function (f) { return { label: f, fn: function () { closeAll(); send({ t: "elevator", floor: f }); } }; }));
  }

  function telescope(o) {
    menu("望遠鏡：要去哪裡？", Object.keys(o.floors).map(function (f) {
      return { label: f, fn: function () { closeAll(); send({ t: "elevator", floor: f }); } };
    }).concat([{ label: "只是看看", fn: closeAll }]));
  }

  function dressRoom() {
    menu("更衣室", [
      { label: "換上禮服", hint: "男生西裝、女生白紗，跟著你的人一起換", fn: function () { closeAll(); send({ t: "dress", outfit: "wedding" }); } },
      { label: "換回自己的衣服", fn: function () { closeAll(); send({ t: "dress", outfit: "none" }); } }
    ]);
  }

  function today() { var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }
  function baptism() {
    ask("要受浸嗎？", "受浸", "再想想", function () {
      var s = sheet('<h2>受浸</h2><div class="card"><p class="small">受浸的日期會寫在召會的留言板上。</p>' +
        '<label class="small">受浸日期<input class="field" id="b-date" type="date"></label>' +
        '<p class="err" id="b-err"></p><div class="row"><button class="btn ok" id="b-ok">受浸</button><button class="btn" id="b-no">取消</button></div></div>');
      $("b-date").value = today();
      s.querySelector("#b-no").onclick = closeSheet;
      s.querySelector("#b-ok").onclick = function () {
        api("POST", "/api/v1/game/baptism", { date: $("b-date").value }).then(function (d) {
          closeSheet(); say("受浸", d.text + "\n\n弟兄姊妹一起唱：「阿們！」");
        }).catch(function (e) { $("b-err").textContent = e.message; });
      };
    }, function () {});
  }

  // ---- menus ---------------------------------------------------------------
  function mainMenu() {
    menu(null, [
      { label: "全景圖", fn: function () { pop(); panorama(); } },
      { label: "交通工具", fn: vehicleMenu },
      SOLO ? null : { label: "夥伴", fn: partyMenu },
      { label: "換裝", fn: function () { closeAll(); creator(); } },
      SOLO ? { label: "存檔", fn: saveMenu } : { label: "投影到電視", fn: castMenu },
      { label: "設定", fn: settingsMenu },
      { label: "關閉選單", fn: closeAll }
    ].filter(Boolean));
  }

  // ---- static edition: the save lives in this browser, so let people carry it ------------
  function saveMenu() {
    menu("存檔", [
      { label: "匯出存檔", hint: "下載一個檔案，換手機時用", fn: exportSave },
      { label: "匯入存檔", hint: "會蓋掉這台的進度", fn: importSave },
      { label: "存檔說明", fn: function () {
        say("存檔", "進度、留言和紀錄只存在這支手機的這個瀏覽器裡，不會上傳。\n清除網站資料或換手機前，先匯出存檔。" +
          (SOLO.persistent ? "" : "\n\n注意：這個瀏覽器不讓網頁存資料（可能是無痕模式），關掉就會不見。"));
      } }
    ]);
  }
  function exportSave() {
    var blob = new Blob([SOLO.exportSave()], { type: "application/json" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "paradise-save.json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
    closeAll(); toast("存檔已經下載。");
  }
  function importSave() {
    var input = document.createElement("input");
    input.type = "file"; input.accept = "application/json,.json";
    input.onchange = function () {
      var f = input.files && input.files[0];
      if (!f) return;
      f.text().then(function (text) {
        SOLO.importSave(text); location.reload();
      }).catch(function (e) { toast(e.message || "讀不到這個檔案"); });
    };
    input.click();
  }

  function vehicleMenu() {
    var m = curMap(), r = myRec(), a = ahead(), items = [];
    var allow = function (v) { return m.vehicles.indexOf(v) >= 0; };
    function ride(v, label, need) {
      items.push({ label: label, off: !allow(v), hint: allow(v) ? need : "這裡不能用", fn: function () { closeAll(); send({ t: "vehicle", v: v }); } });
    }
    ride("bike", "單車", "在路上才能騎"); ride("moto", "機車", "在路上才能騎"); ride("car", "開車", "全隊共乘，只能走車道");
    var water = a && tileClass(a.x, a.y) === "water";
    if (water && r.v !== "boat") items.push({ label: "搭船", hint: "全隊同船", fn: function () { closeAll(); send({ t: "vehicle", v: "boat" }); } });
    if (r.v !== "none") items.push({ label: r.v === "boat" ? "下船" : "下車", fn: function () { closeAll(); send({ t: "vehicle", v: "none" }); } });
    items.push({ label: "機場：走進傳送門", off: true });
    menu("交通工具", items);
  }

  function partyMenu() {
    api("GET", "/api/v1/game/overview").then(function (ov) {
      var items = ov.party.map(function (p) {
        return {
          label: p.n, hint: (p.on ? "線上・" + p.map : "離線") + (p.lead === eng.me ? "・隊員" : ""),
          fn: function () { playerMenu(p); }
        };
      });
      if (!items.length) items.push({ label: "還沒有其他角色", off: true });
      if (ov.me && ov.me.lead) items.unshift({ label: "離開隊伍", fn: function () { closeAll(); send({ t: "leave" }); } });
      if (ov.me && ov.me.followers) items.unshift({ label: "解散隊伍", fn: function () { closeAll(); send({ t: "disband" }); } });
      menu("夥伴", items, { full: true });
    }).catch(function (e) { toast(e.message); });
  }

  function playerMenu(p) {
    var items = [];
    if (p.on && p.here) items.push({ label: "跟隨 " + p.n, fn: function () { closeAll(); send({ t: "follow", id: p.id }); } });
    if (p.lead !== eng.me) items.push({ label: "呼叫 " + p.n + " 過來", hint: p.on ? "對方要同意" : "離線角色會直接跟上", fn: function () { closeAll(); send({ t: "call", id: p.id }); } });
    if (!items.length) { toast(p.n + " 已經在隊伍裡"); return; }
    menu(p.n, items);
  }

  function settingsMenu() {
    menu("設定", [
      { label: "螢幕色：" + (eng.mono ? "經典四階綠" : "彩色"), fn: function () { eng.mono = !eng.mono; store("mono", eng.mono ? "1" : ""); pop(); settingsMenu(); } },
      SOLO ? null : { label: "回 tvhub", fn: function () { location.href = "/"; } }
    ].filter(Boolean));
  }
  function store(k, v) { try { localStorage.setItem("game." + k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem("game." + k); } catch (e) { return null; } }

  // ---- panorama ------------------------------------------------------------
  /* Left: a window on the world map that follows the region picked in the list on the right. SELECT widens the map to
     the whole window: the arrows (or a finger, in both modes) move around it and the region nearest the middle is picked;
     SELECT or B goes back to the list. A opens the picked region's message board. */
  function panorama() {
    api("GET", "/api/v1/game/overview").then(function (ov) {
      var regs = ov.regions, sel = 0, here = -1, wide = false, t = 0, timer = 0, hold = null, holdT = 0;
      regs.forEach(function (r, i) { if (r.id === ov.where) sel = here = i; });
      var m = world.maps.overworld, cam = { x: 0, y: 0 }, T = 4, cv = null, base = null, baseT = 0, drag = null;
      var islands = {}, names = [];
      regs.forEach(function (r) {
        var g = islands[r.sub];
        if (!g) { g = islands[r.sub] = { name: r.sub, a: r.isle[0], b: r.isle[0], y: r.isle[1] - 6 }; names.push(g); }
        g.a = Math.min(g.a, r.isle[0]); g.b = Math.max(g.b, r.isle[0]);
      });
      function spot(r) { return { x: r.isle[0] + .5, y: r.isle[1] - 2.5 }; }
      function clamp() {
        cam.x = Math.max(0, Math.min(m.w - cv.width / T, cam.x));
        cam.y = Math.max(0, Math.min(m.h - cv.height / T, cam.y));
      }
      function follow() { var p = spot(regs[sel]); cam.x = p.x - cv.width / T / 2; cam.y = p.y - cv.height / T / 2; clamp(); }
      function nearest(x, y, within) {
        var best = -1, bd = within ? within * within : 1e9;
        regs.forEach(function (r, i) { var p = spot(r), d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (d < bd) { bd = d; best = i; } });
        return best;
      }
      function pickMiddle() { var i = nearest(cam.x + cv.width / T / 2, cam.y + cv.height / T / 2); if (i >= 0) sel = i; }
      function paint() {
        if (!cv) return;
        var c = cv.getContext("2d"), fs = Math.max(9, Math.round(T * 1.4)), s = Math.max(7, Math.round(T * 2.2));
        if (baseT !== T) { base = eng.miniMap(T); baseT = T; }
        c.imageSmoothingEnabled = false;
        c.fillStyle = Art.C.sea; c.fillRect(0, 0, cv.width, cv.height);
        c.drawImage(base, Math.round(-cam.x * T), Math.round(-cam.y * T));
        c.font = fs + 'px "Cubic 11", monospace'; c.textAlign = "center"; c.textBaseline = "middle";
        names.forEach(function (g) {
          var x = Math.round(((g.a + g.b) / 2 + .5 - cam.x) * T), y = Math.round((g.y - cam.y) * T), w = Math.round(c.measureText(g.name).width + 8);
          c.fillStyle = "rgba(24,24,32,.8)"; c.fillRect(x - (w >> 1), y - (fs >> 1) - 2, w, fs + 4);
          c.fillStyle = "#f8f8e8"; c.fillText(g.name, x, y);
        });
        regs.forEach(function (r, i) {
          var p = spot(r), x = Math.round((p.x - cam.x) * T - s / 2), y = Math.round((p.y - cam.y) * T - s / 2);
          if (x < -s * 2 || y < -s * 2 || x > cv.width + s || y > cv.height + s) return;
          var on = i === sel, b = on ? Math.max(2, T >> 2) : 1;
          c.fillStyle = "#181820"; c.fillRect(x - b, y - b, s + b * 2, s + b * 2);
          c.fillStyle = on ? "#f8f070" : (r.visited ? "#f8f8f0" : "#a0a0a8"); c.fillRect(x, y, s, s);
          c.fillStyle = "#181820"; c.fillText(r.no ? String(r.no) : "機", x + s / 2, y + s / 2 + 1);
          if (r.people.length) { c.fillStyle = "#30a0f0"; c.fillRect(x + s - 2, y - 4, 6, 6); }
          if (i === here && t % 2) { c.strokeStyle = "#e02020"; c.lineWidth = 2; c.strokeRect(x - b - 2, y - b - 2, s + b * 2 + 4, s + b * 2 + 4); }
        });
        if (ov.where === "overworld" && ov.at && t % 2) { c.fillStyle = "#e02020"; c.fillRect(Math.round((ov.at.x - cam.x) * T), Math.round((ov.at.y - cam.y) * T), T, T); }
      }
      function info() {
        var el = $("pano-info"), r = regs[sel], people = r.people.map(function (p) { return p.n; }).join("、");
        if (!el) return;
        el.innerHTML = (r.no ? r.no + " 號登機口・" : "") + esc(r.name) + "（" + esc(r.sub) + "）" + (i_am_here(r) ? " 你在這裡" : "") + "<br>" +
          (r.visited ? "去過" : "還沒去過") + "・留言 " + r.messages + (people ? "・" + esc(people) : "");
        var ul = $("pano-list");
        if (!ul) return;
        Array.prototype.forEach.call(ul.children, function (li, i) { li.className = i === sel ? "sel" : ""; });
        var cur = ul.children[sel]; if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
      }
      function i_am_here(r) { return r.id === ov.where; }
      function stopHold() { clearInterval(holdT); hold = null; }
      function pan(d) {
        var k = 2;
        cam.x += d === "l" ? -k : d === "r" ? k : 0; cam.y += d === "u" ? -k : d === "d" ? k : 0;
        clamp(); pickMiddle(); paint(); info();
      }
      function setWide(on) { stopHold(); wide = on; renderUi(); }
      function bindDrag() {
        function at(e) { var b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * cv.width / b.width, y: (e.clientY - b.top) * cv.height / b.height }; }
        cv.addEventListener("pointerdown", function (e) {
          e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {}
          var p = at(e); drag = { x: p.x, y: p.y, cx: cam.x, cy: cam.y, moved: false };
        });
        cv.addEventListener("pointermove", function (e) {
          if (!drag) return;
          var p = at(e);
          if (Math.abs(p.x - drag.x) + Math.abs(p.y - drag.y) > T) drag.moved = true;
          if (!drag.moved) return;
          cam.x = drag.cx - (p.x - drag.x) / T; cam.y = drag.cy - (p.y - drag.y) / T;
          clamp(); if (wide) { pickMiddle(); info(); } paint();
        });
        function end(e) {
          if (!drag) return;
          var d = drag; drag = null;
          if (d.moved || e.type !== "pointerup") return;
          var i = nearest(cam.x + d.x / T, cam.y + d.y / T, 2.5);           // a tap on a marker picks it; again opens its board
          if (i < 0) return;
          if (i === sel) { openBoard(regs[i].id); return; }
          sel = i; if (wide) { follow(); } paint(); info();
        }
        ["pointerup", "pointercancel"].forEach(function (n) { cv.addEventListener(n, end); });
      }
      var view = {
        render: function (box) {
          stopHold();
          box.innerHTML = '<div class="win full"><h3>樂園全景圖<small>' + (wide ? "方向鍵移動・SELECT 回列表" : "SELECT 看全圖") + "</small></h3>" +
            '<div class="pano' + (wide ? " wide" : "") + '"><div class="pano-map"><canvas id="pano"></canvas></div><ul class="items" id="pano-list"></ul></div>' +
            '<div class="pano-info" id="pano-info"></div></div>';
          var ul = $("pano-list");
          regs.forEach(function (x, i) {
            var li = document.createElement("li"); li.textContent = (x.no ? x.no + ". " : "✈ ") + x.name;
            li.onclick = function () { if (sel === i) view.key("a"); else { sel = i; follow(); paint(); info(); } };
            ul.appendChild(li);
          });
          var pane = box.querySelector(".pano-map"), dpr = Math.min(window.devicePixelRatio || 1, 3);
          cv = $("pano");
          cv.width = Math.max(1, Math.round(pane.clientWidth * dpr)); cv.height = Math.max(1, Math.round(pane.clientHeight * dpr));
          cv.style.width = pane.clientWidth + "px"; cv.style.height = pane.clientHeight + "px";
          T = Math.max(3, Math.floor(cv.height / m.h));                     // the whole height of the world fits
          bindDrag();
          if (wide) { clamp(); pickMiddle(); } else follow();
          paint(); info();
          clearInterval(timer); timer = setInterval(function () { t++; if ($("pano") === cv) paint(); else clearInterval(timer); }, 400);
        },
        key: function (k) {
          var n = regs.length;
          if (wide) {
            if (DIRS_UI[k]) { if (hold !== k) { stopHold(); hold = k; pan(k); holdT = setInterval(function () { pan(k); }, 90); } }
            else if (k === "a") openBoard(regs[sel].id);
            else if (k === "b" || k === "select") { setWide(false); }
            return;
          }
          if (k === "u" || k === "l") { sel = (sel + n - 1) % n; follow(); paint(); info(); }
          else if (k === "d" || k === "r") { sel = (sel + 1) % n; follow(); paint(); info(); }
          else if (k === "a") openBoard(regs[sel].id);
          else if (k === "select") setWide(true);
          else if (k === "b") { clearInterval(timer); stopHold(); pop(); }
        },
        keyUp: function (k) { if (k === hold) stopHold(); }
      };
      push(view);
    }).catch(function (e) { toast(e.message); });
  }
  var DIRS_UI = { u: 1, d: 1, l: 1, r: 1 };

  // ---- message boards ------------------------------------------------------
  function regionName(id) { var r = world.regions.filter(function (x) { return x.id === id; })[0]; return r ? r.name : id; }
  function openBoard(region) {
    api("GET", "/api/v1/game/boards/" + region).then(function (d) {
      var msgs = d.messages, title = regionName(region) + "留言板";
      relay({ kind: "say", title: title, text: msgs.length ? msgs.slice(0, 5).map(function (m) { return m.name + (m.visited_on ? "（" + m.visited_on + "）" : "") + "：" + m.body; }).join("\n") : "還沒有留言。" });
      var view = {
        render: function (box) {
          var html = '<div class="win full"><h3>' + esc(title) + '</h3><div class="scroll" id="msgs">';
          if (!msgs.length) html += "<p>還沒有留言。按 A 留下第一則。</p>" + (SOLO ? "<p class=\"small\">單機版的留言只存在這支手機。</p>" : "");
          msgs.forEach(function (m) {
            html += '<div class="msg"><div class="who"><span>' + esc(m.name) + (m.visited_on ? "・" + esc(m.visited_on) + " 到訪" : "") + "</span>" +
              (m.can_delete ? '<button class="linkish" data-del="' + m.id + '">刪除</button>' : "") + '</div><div class="txt">' + esc(m.body) + "</div></div>";
          });
          box.innerHTML = html + '</div><div class="more">A 寫留言　B 離開</div></div>';
          box.querySelector("#msgs").addEventListener("click", function (e) {
            var id = e.target.getAttribute && e.target.getAttribute("data-del");
            if (!id) return;
            ask("刪除這則留言？", "刪除", "取消", function () {
              api("DELETE", "/api/v1/game/messages/" + id).then(function () { pop(); openBoard(region); }).catch(function (x) { toast(x.message); });
            }, function () {});
          });
          box.querySelector(".more").onclick = function () { view.key("a"); };
        },
        key: function (k) {
          var s = $("msgs");
          if (k === "a") writeMessage(region);
          else if (k === "b") pop();
          else if (s && k === "u") s.scrollTop -= 60;
          else if (s && k === "d") s.scrollTop += 60;
        }
      };
      push(view);
    }).catch(function (e) { toast(e.message); });
  }

  function sheet(html) { var s = $("sheet"); s.innerHTML = html; s.hidden = false; stopWalking(); return s; }
  function closeSheet() { $("sheet").hidden = true; $("sheet").innerHTML = ""; }

  function writeMessage(region) {
    var s = sheet('<h2>' + esc(regionName(region)) + '留言</h2><div class="card">' +
      '<textarea class="field" id="m-body" rows="5" maxlength="200" placeholder="記下這裡的回憶（最多 200 字）"></textarea>' +
      '<label class="small">到訪日期（可不填）<input class="field" id="m-date" type="date"></label>' +
      '<p class="err" id="m-err"></p><div class="row"><button class="btn ok" id="m-ok">貼上留言板</button><button class="btn" id="m-no">取消</button></div></div>');
    s.querySelector("#m-no").onclick = closeSheet;
    s.querySelector("#m-ok").onclick = function () {
      api("POST", "/api/v1/game/boards/" + region, { body: $("m-body").value, visited_on: $("m-date").value }).then(function () {
        closeSheet(); pop(); openBoard(region);
      }).catch(function (e) { $("m-err").textContent = e.message; });
    };
    $("m-body").focus();
  }

  // ---- 礦坑下樓 -------------------------------------------------------------
  function scoreLines(rows) {
    if (!rows.length) return "還沒有紀錄。";
    return rows.map(function (s, i) { return (i + 1) + ". " + s.name + "　" + s.floors + " 層　" + Shaft.clock(s.ms) + (s.mine ? " ★" : ""); }).join("\n");
  }

  function openShaft(course, title) {
    api("GET", "/api/v1/game/scores").then(function (d) { shaftIntro(course, title, d.scores, ""); }).catch(function (e) { toast(e.message); });
  }

  function shaftIntro(course, title, rows, result) {
    var text = (result ? result + "\n\n" : "往下跳，別碰到頂，也別掉出去。\n普通平台回血，尖刺扣血，最多 100 層。\n\n") + "紀錄榜（層數多、時間短優先）\n" + scoreLines(rows);
    relay({ kind: "say", title: title, text: text });
    var view = {
      render: function (box) {
        box.innerHTML = '<div class="win full"><h3>' + esc(title) + '</h3><div class="scroll body">' + esc(text) + '</div><div class="more">A 開始　B 離開</div></div>';
        box.querySelector(".more").onclick = function () { view.key("a"); };
      },
      key: function (k) { if (k === "a") { pop(); shaftRun(course, title); } else if (k === "b") pop(); }
    };
    push(view);
  }

  function shaftRun(course, title) {
    var run = new Shaft.Run(), left = false, right = false, last = 0, acc = 0, sent = 0, c = null, stop = false;
    var look = character.look, theme = course;
    function finish() {
      stop = true; pop();
      var result = (run.cleared ? "通關！" : "結束了。") + "到達 " + run.floor + " 層，" + Shaft.clock(run.ms);
      api("POST", "/api/v1/game/scores", { course: course, floors: run.floor, ms: Math.round(run.ms) }).then(function (d) { shaftIntro(course, title, d.scores, result); })
        .catch(function (e) { toast(e.message); });
    }
    function frame(t) {
      if (stop) return;
      if (!c) { var cv = $("shaft-cv"); if (!cv) return; c = cv.getContext("2d"); c.imageSmoothingEnabled = false; }
      var dt = last ? Math.min((t - last) / 1000, .1) : 0;
      last = t; acc += dt;
      while (acc >= 1 / 60) { run.tick(1 / 60, left, right); acc -= 1 / 60; }
      var v = run.view(theme, look);
      Shaft.draw(c, v);
      if (t - sent > 90) { sent = t; relay(v.k ? { kind: "shaft", v: v } : {}); }
      if (run.over) finish(); else requestAnimationFrame(frame);
    }
    push({
      render: function (box) { box.innerHTML = '<canvas id="shaft-cv" width="160" height="144" style="width:100%;height:100%"></canvas>'; },
      key: function (k) { if (k === "l") left = true; else if (k === "r") right = true; else if (k === "b") { stop = true; pop(); } },
      keyUp: function (k) { if (k === "l") left = false; else if (k === "r") right = false; }
    });
    requestAnimationFrame(frame);
  }

  // ---- casting -------------------------------------------------------------
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, fail) {             // tvhub is plain http, where the Clipboard API does not exist
      var t = document.createElement("textarea");
      t.value = text; t.style.position = "fixed"; t.style.opacity = "0"; t.setAttribute("readonly", "");
      document.body.appendChild(t); t.select(); t.setSelectionRange(0, text.length);
      var done = false;
      try { done = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(t);
      if (done) ok(); else fail(new Error("copy"));
    });
  }

  function castMenu() {
    menu("投影到電視", [
      { label: "複製投影網址", hint: "貼到遙控器的開啟網址", fn: copyCast },
      { label: "直接開到電視", fn: castToTv },
      { label: "輸入配對碼", hint: "電視開 /game/screen 會顯示", fn: enterCode },
      { label: "投影說明", fn: function () { say("投影", "電視只顯示遊戲畫面，手機繼續當遙控器。\n電視開啟 /game/screen 後，用手機掃 QR Code 或輸入配對碼就會綁定。"); } }
    ]);
  }

  function copyCast() {
    api("GET", "/api/v1/game/cast").then(function (d) {
      return copyText(d.url).then(function () { toast("已複製投影網址，可以貼到遙控器的開啟網址。"); }, function () { showUrl(d.url); });
    }).catch(function (e) { toast(e.message); });
  }
  function showUrl(url) {
    var s = sheet('<h2>投影網址</h2><div class="card"><p class="small">這支手機不讓網頁自動複製，請長按下面的網址手動複製。</p><textarea class="field" id="u" rows="5" readonly></textarea><button class="btn" id="u-no">關閉</button></div>');
    $("u").value = url; $("u").select();
    s.querySelector("#u-no").onclick = closeSheet;
  }
  function castToTv() {
    Promise.all([api("GET", "/api/v1/game/cast"), api("GET", "/api/v1/devices")]).then(function (r) {
      var url = r[0].url, devs = (r[1].devices || []).filter(function (d) { return d.enabled !== false; });
      if (!devs.length) { toast("沒有可用的電視"); return; }
      menu("開到哪台？", devs.map(function (d) {
        return {
          label: d.name, fn: function () {
            closeAll(); toast("開啟中…");
            api("POST", "/api/v1/devices/" + d.id + "/open-url", { url: url }).then(function (x) { toast(x.ok ? "已在電視開啟" : (x.detail || "開啟失敗")); }, function (e) { toast(e.message); });
          }
        };
      }));
    }).catch(function (e) { toast(e.message); });
  }
  function enterCode() {
    var s = sheet('<h2>輸入配對碼</h2><div class="card"><input class="field" id="c-code" inputmode="numeric" maxlength="4" placeholder="電視上的 4 碼"><p class="err" id="c-err"></p><div class="row"><button class="btn ok" id="c-ok">配對</button><button class="btn" id="c-no">取消</button></div></div>');
    s.querySelector("#c-no").onclick = closeSheet;
    s.querySelector("#c-ok").onclick = function () {
      api("POST", "/api/v1/game/pair", { code: $("c-code").value }).then(function () { closeSheet(); closeAll(); toast("電視已經綁定你的畫面。"); })
        .catch(function (e) { $("c-err").textContent = e.message; });
    };
    $("c-code").focus();
  }

  // ---- character maker -----------------------------------------------------
  var LABEL = {
    sex: { m: "男", f: "女" },
    hair: { side: "旁分", long: "長直髮", cover: "斜旁分遮臉", curl: "短捲髮", longcurl: "長捲髮", bun: "盤髮" },
    head: { none: "無", bunny: "兔耳", clip: "髮夾", party: "生日帽" },
    outfit: { suit: "西裝", dress: "洋裝", maid: "女僕裝", bunny: "兔耳裝", beach: "海灘褲裝", aloha: "花襯衫", qipao: "旗袍", angel: "天使裝" },
    glasses: { "true": "有", "false": "無" }
  };
  function creator(first) {
    var look = character ? JSON.parse(JSON.stringify(character.look)) : { sex: "m", hair: "side", glasses: false, head: "none", outfit: "aloha" };
    var name = character ? character.name : options.default_name;
    var rows = [
      ["sex", "性別", function () { return ["m", "f"]; }],
      ["hair", "髮型", function () { return options.options.hair[look.sex]; }],
      ["glasses", "眼鏡", function () { return [false, true]; }],
      ["head", "頭飾", function () { return options.options.head; }],
      ["outfit", "衣著", function () { return options.options.outfit; }]
    ];
    var s = sheet('<h2>' + (first ? "建立你的角色" : "換裝") + '</h2><div class="card"><div class="preview" id="pv"></div>' +
      '<div id="opts"></div><label class="small">暱稱（最多 6 字）<input class="field" id="c-name" maxlength="6"></label>' +
      '<p class="err" id="c-err"></p><div class="row"><button class="btn ok" id="c-ok">' + (first ? "進入樂園" : "完成") + "</button>" + (first ? "" : '<button class="btn" id="c-no">取消</button>') + "</div></div>");
    $("c-name").value = name;
    function draw() {
      var pv = $("pv"); pv.innerHTML = "";
      ["d", "l", "u"].forEach(function (dir) {
        var cv = Art.mk(Art.CELL_W, Art.CELL_H); cv.getContext("2d").drawImage(Art.sprite(look, dir, 0, "none"), 0, 0); pv.appendChild(cv);
      });
      var box = $("opts"); box.innerHTML = "";
      rows.forEach(function (r) {
        var key = r[0], vals = r[2](), el = document.createElement("div"); el.className = "opt";
        var shown = LABEL[key][String(look[key])];
        el.innerHTML = "<label>" + r[1] + '</label><button class="btn mini">◀</button><span>' + esc(shown) + '</span><button class="btn mini">▶</button>';
        var btns = el.querySelectorAll("button");
        function turn(n) {
          var i = vals.indexOf(look[key]);
          look[key] = vals[(i + n + vals.length) % vals.length];
          if (key === "sex") look.hair = options.options.hair[look.sex][0];
          draw();
        }
        btns[0].onclick = function () { turn(-1); }; btns[1].onclick = function () { turn(1); };
        box.appendChild(el);
      });
    }
    draw();
    var no = s.querySelector("#c-no"); if (no) no.onclick = closeSheet;
    s.querySelector("#c-ok").onclick = function () {
      api("PUT", "/api/v1/game/character", { name: $("c-name").value, look: look }).then(function (d) {
        character = d.character; closeSheet();
        if (first) connect();
      }).catch(function (e) { $("c-err").textContent = e.message; });
    };
  }

  // ---- connection ----------------------------------------------------------
  function handle(m) {
    if (m.t === "init") {
      // the Pi restarted with a new version: this page still holds the old maps and scripts
      if (m.ver && version && m.ver !== version) { location.reload(); return; }
      if (m.ver) version = m.ver;
      me = m.me; eng.me = m.me; eng.enterMap(m.map, m.players); $("offline").hidden = true;
    } else if (m.t === "map") { closeAll(); eng.enterMap(m.map, m.players); }
    else if (m.t === "u") eng.update(m);
    else if (m.t === "notice" || m.t === "err") toast(m.text);
    else if (m.t === "prompt") {
      ask(m.text, m.yes, m.no, function () { send({ t: "answer", yes: true }); }, function () { send({ t: "answer", yes: false }); });
    } else if (m.t === "nochar") creator(true);
  }

  function connect() {
    if (ws && ws.readyState < 2) return;
    var proto = location.protocol === "https:" ? "wss://" : "ws://";
    ws = SOLO ? SOLO.socket() : new WebSocket(proto + location.host + "/game/ws");
    ws.onopen = function () { retry = 800; };
    ws.onmessage = function (e) { handle(JSON.parse(e.data)); };
    ws.onclose = function (e) {
      if (e.code === 4401) { location.href = "/login?next=/game"; return; }
      $("offline").hidden = false;
      setTimeout(connect, retry); retry = Math.min(retry * 1.6, 5000);
    };
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { stopWalking(); return; }
    if (!ws || ws.readyState > 1) { retry = 300; connect(); }
  });

  // ---- start ---------------------------------------------------------------
  fit();
  eng.mono = load("mono") === "1";
  Promise.all([api("GET", "/api/v1/game/world"), api("GET", "/api/v1/game/character")]).then(function (r) {
    world = r[0]; options = r[1]; character = r[1].character;
    eng.setWorld(world); eng.start();
    var q = new URLSearchParams(location.search).get("cast");
    if (q) { toast(q === "ok" ? "電視已經綁定你的畫面。" : "配對碼不正確或已過期。"); try { history.replaceState(null, "", "/game"); } catch (e) {} }
    if (character) connect(); else creator(true);
  }).catch(function (e) { $("offline").hidden = false; $("offline").textContent = "載入失敗：" + e.message; });
})();
