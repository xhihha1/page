/* 樂園 offline cache. The version changes with every build, so a new build replaces the old cache. */
var CACHE = "paradise-4cfef5bb5e", FILES = ["./", "world.json?v=4cfef5bb5e", "game/game.css?v=4cfef5bb5e", "game/art.js?v=4cfef5bb5e", "game/art_more.js?v=4cfef5bb5e", "game/art_world.js?v=4cfef5bb5e", "game/engine.js?v=4cfef5bb5e", "game/shaft.js?v=4cfef5bb5e", "game/local.js?v=4cfef5bb5e", "game/phone.js?v=4cfef5bb5e", "fonts/Cubic_11.woff2", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("paradise-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {            // the page: newest when online, cached when not
    e.respondWith(fetch(e.request).catch(function () { return caches.match("./"); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function (hit) { return hit || fetch(e.request); }));
});
