const CACHE_NAME = "gosa-savings-pwa-v3";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./src/main.js",
  "./src/App.js",
  "./src/main.jsx",
  "./src/App.jsx",
  "./src/styles.css",
  "./src/vendor/react-lite.js",
  "./src/vendor/react-dom-client-lite.js",
  "./output/imagegen/mascot.png",
  "./output/imagegen/mascot-trimmed.png",
  "./output/imagegen/icon-taxi-trimmed.png",
  "./output/imagegen/icon-ramen-trimmed.png",
  "./output/imagegen/icon-shopping-trimmed.png",
  "./output/imagegen/icon-subscription-trimmed.png",
  "./output/imagegen/category-icons.png",
  "./output/imagegen/gosa-savings-ui-mockup.png"
];

const OPTIONAL_ASSETS = [
  "./install.html",
  "./privacy.html",
  "./support.html",
  "./public/icons/app-icon-192.png",
  "./public/icons/app-icon-512.png",
  "./public/icons/maskable-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_ASSETS);
      await Promise.all(
        OPTIONAL_ASSETS.map((url) =>
          cache.add(url).catch(() => undefined)
        )
      );
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
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
        caches.match(event.request).then((cached) =>
          cached || caches.match("./index.html")
        )
      )
  );
});
