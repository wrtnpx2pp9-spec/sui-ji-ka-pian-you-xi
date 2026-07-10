const CACHE_NAME = "miaomi-life-sim-v2";
const STATIC_ASSETS = [
  "/icons/app-icon.svg",
  "/assets/demo/cover-gentle-trap.svg",
  "/assets/demo/bg-apartment-night.svg",
  "/assets/demo/bg-phone-chat.svg",
  "/assets/demo/bg-cafe-evening.svg",
  "/assets/demo/char-heroine-calm.svg",
  "/assets/demo/char-heroine-worried.svg",
  "/assets/demo/char-zhou-gentle.svg",
  "/assets/demo/char-zhou-cold.svg",
  "/assets/demo/char-xuran-alert.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
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
      ),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate" || url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () => new Response("Offline", { status: 503, statusText: "Offline" }),
      ),
    );
    return;
  }

  const isCacheableAsset =
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:css|js|svg|png|jpg|jpeg|webp|ico|woff2?)$/.test(url.pathname);

  if (!isCacheableAsset) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(
          () =>
            new Response("Offline", { status: 503, statusText: "Offline" }),
        );
    }),
  );
});
