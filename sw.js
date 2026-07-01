const CACHE_NAME = "gosa-savings-app-v13";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./app-v7.js",
  "./growth-stages.js",
  "./manifest.webmanifest",
  "./install.html",
  "./privacy.html",
  "./support.html",
  "./public/icons/app-icon-192.png",
  "./public/icons/app-icon-512.png",
  "./public/icons/maskable-icon-512.png",
  "./output/imagegen/mascot-trimmed.png",
  "./output/imagegen/mascot-stage-0-transparent.png",
  "./output/imagegen/mascot-stage-1-transparent.png",
  "./output/imagegen/mascot-stage-2-transparent.png",
  "./output/imagegen/mascot-stage-3-transparent.png",
  "./output/imagegen/mascot-stage-4-transparent.png",
  "./output/imagegen/mascot-stage-5-transparent.png",
  ...Array.from({ length: 25 }, (_, index) => `./output/imagegen/growth/growth-${String(index).padStart(2, "0")}-${[
    "wakaba","tsubomi","asagao","himawari","tanpopo","sumire","tsubaki","ajisai","yuri","bara","ran","sakura","hanamizuki","ume","momiji","keyaki","icho","kusunoki","matsu","hinoki","sequoia","gajumaru","jomon-sugi","mokuton-jukai-kotan","yggdrasil"
  ][index]}.png`)
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => Promise.allSettled(CORE_ASSETS.map((asset) => cache.add(asset))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("./index.html")),
      ),
  );
});
