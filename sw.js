// Service Worker for J.A.R.V.I.S Email Relay Console PWA
// Provides robust offline caching for Static Assets, Vite Bundles, and LocalStorage Draft Shells

const CACHE_VERSION = "v4";
const STATIC_CACHE_NAME = `jarvis-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `jarvis-dynamic-${CACHE_VERSION}`;

// Core App Shell Assets required for offline startup
const PRECACHE_STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/pwa-icon.png",
  "/pwa-192.png",
  "/pwa-512.png",
  "/apple-touch-icon.png",
  "/icon.svg"
];

// Install Event - Pre-cache core static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching Core App Shell assets...");
      return cache.addAll(PRECACHE_STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
            console.log("[Service Worker] Purging old cache storage:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Check if URL is a static asset or Vite bundle
function isStaticAsset(url) {
  const pathname = url.pathname;
  return (
    pathname.startsWith("/assets/") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".json")
  );
}

// Fetch Event - Multi-Tier Caching Strategy
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests or browser extension requests
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // 1. API Endpoints Strategy: Network-First with Graceful Offline JSON Fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          console.warn("[Service Worker] Offline API intercept for:", url.pathname);
          return new Response(
            JSON.stringify({
              success: false,
              isOffline: true,
              error: "Mode Offline Aktif: Koneksi internet Anda sedang terputus.",
              notice: "Seluruh draf email dan template di localStorage tetap tersimpan dengan aman di HP Anda."
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" }
            }
          );
        })
    );
    return;
  }

  // 2. Static Assets & Vite Bundles Strategy: Stale-While-Revalidate
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            console.log("[Service Worker] Static asset fetch offline, serving from cache:", url.pathname);
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Navigation Requests (Page Loads / SPA Routes): Cache-First with App Shell Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => {/* Offline mode active */});
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("/index.html") || caches.match("/");
          }
        });
    })
  );
});

// Client Message Listener for PWA controls
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
