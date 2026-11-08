/* 樂園 offline cache. The version changes with every build, so a new build replaces the old cache. */
var CACHE = "paradise-a8b42710ad", FILES = ["./", "world.json?v=a8b42710ad", "game/game.css?v=a8b42710ad", "game/art.js?v=a8b42710ad", "game/art_more.js?v=a8b42710ad", "game/engine.js?v=a8b42710ad", "game/shaft.js?v=a8b42710ad", "game/local.js?v=a8b42710ad", "game/phone.js?v=a8b42710ad", "fonts/Cubic_11.woff2", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
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
