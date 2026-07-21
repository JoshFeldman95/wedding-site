// service-worker.js
//
// GitHub Pages doesn't let us set custom Cache-Control headers (max-age is
// fixed at 600s and there's no way to override it), which means even
// "cached" images get revalidated with a 304 round-trip periodically.
//
// This service worker sidesteps that entirely: it explicitly stores the
// photos in the Cache Storage API on first visit, then serves them straight
// from that cache on every later request — no network round-trip, no 304,
// no waiting on 3G. This is under our control regardless of what headers
// the host sends.

const CACHE_NAME = "wedding-photos-v1"; // bump this (v2, v3...) if you replace photos

const PHOTO_URLS = [
  "img/toronto-v2.webp",
  "img/heart-1.webp",
  "img/heart-2.webp",
  "img/heart-3.webp",
  "img/heart-4.webp",
  "img/heart-5.webp",
  "img/heart-6.webp",
  "img/heart-7.webp",
  "img/heart-8.webp",
  "img/heart-9.webp",
  "img/heart-10.webp",
  "img/baby-becca.webp",
  "img/baby-josh.webp",
  "img/first-met.webp",
  "img/house-island-day.webp",
  "img/first-date.webp",
  "img/dating.webp",
  "img/prom.webp",
  "img/first-apartment.webp",
  "img/engagement.webp",
  "img/speducci.webp",
];

// On install: fetch and store every photo, then activate immediately.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PHOTO_URLS))
  );
  self.skipWaiting();
});

// On activate: delete any old versioned caches (e.g. if you bumped
// CACHE_NAME after swapping in resized photos) and take control of open tabs.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Serve photos from cache first (instant, no network). Falls back to the
// network for anything not in our list (and for the cached list itself if
// it's somehow missing, e.g. first install still in progress).
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isPhoto = PHOTO_URLS.some((path) => url.pathname.endsWith(path));

  if (!isPhoto) return; // let the browser handle everything else normally

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
