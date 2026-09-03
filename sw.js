const CACHE_NAME = "coursehub-training-v1";
const APP_ASSETS = [
  "index.html",
  "course-app.css",
  "course-app.js",
  "manifest.webmanifest",
  "assets/course-platform-hero.png",
  "assets/coursehub-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
