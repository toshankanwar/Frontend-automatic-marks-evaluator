const CACHE_NAME = "autograde-v2";
const OFFLINE_URL = "/offline.html";
const API_BASE_ORIGIN = "https://api.autograde.toshankanwar.in";

const ASSETS_TO_CACHE = [
  "/",
  OFFLINE_URL,
  "/manifest.json",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests in SW cache strategies
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1) NEVER cache API domain (all routes under this base domain)
  if (url.origin === API_BASE_ORIGIN) {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() => {
        // If API fails offline, return a normal error response instead of cached HTML
        return new Response(
          JSON.stringify({ detail: "Network error while contacting API." }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }

  // 2) Network-first for page navigations
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 3) Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Cache only successful basic/cors GET responses
          if (
            response &&
            response.status === 200 &&
            (response.type === "basic" || response.type === "cors")
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback only for document requests
          if (request.destination === "document") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline", { status: 503, statusText: "Offline" });
        });
    })
  );
});