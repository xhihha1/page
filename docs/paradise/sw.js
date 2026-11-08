/* 樂園 offline cache. The version changes with every build, so a new build replaces the old cache. */
var CACHE = "paradise-d22f5bbdf4", FILES = ["./", "world.json?v=d22f5bbdf4", "game/game.css?v=d22f5bbdf4", "game/art.js?v=d22f5bbdf4", "game/art_more.js?v=d22f5bbdf4", "game/engine.js?v=d22f5bbdf4", "game/shaft.js?v=d22f5bbdf4", "game/local.js?v=d22f5bbdf4", "game/phone.js?v=d22f5bbdf4", "fonts/Cubic_11.woff2", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
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
