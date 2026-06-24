/*
  Nombre completo: service-worker.js
  Ruta o ubicación: service-worker.js
*/

const FITJEFF_CACHE_VERSION = "fitjeff-root-v0.1.0-build-18";
const FITJEFF_RUNTIME_CACHE = "fitjeff-runtime-v0.1.0-build-18";

const ARCHIVOS_APP = [
  "./",
  "./index.html",
  "./assets/icons/icon.svg",
  "./public/manifest.json",
  "./public/version.json",
  "./public/fit-redesign.css",
  "./styles/base.css",
  "./styles/layout.css",
  "./styles/componentes.css",
  "./styles/responsive.css",
  "./src/app.js",
  "./src/app-controller.js",
  "./src/ui/router.js",
  "./src/ui/menu.js",
  "./src/ui/layout.js",
  "./src/ui/helpers.js",
  "./src/ui/modal.js",
  "./src/vistas/inicio.view.js",
  "./src/vistas/entrenar.view.js",
  "./src/vistas/registrar.view.js",
  "./src/vistas/progreso.view.js",
  "./src/vistas/asistente.view.js",
  "./src/vistas/ajustes.view.js",
  "./src/vistas/componentes.view.js",
  "./src/automatizacion/fitjeff-hoy.service.js",
  "./src/automatizacion/hoy-acciones.service.js",
  "./src/automatizacion/hoy-pendientes.service.js",
  "./src/firebase/firebase.config.js",
  "./src/firebase/firebase.app.js",
  "./src/firebase/firestore.paths.js",
  "./src/firebase/firestore.schema.js",
  "./src/firebase/firestore.service.js",
  "./src/sincronizacion/sync-fitjeff.mapper.js",
  "./src/sincronizacion/sincronizacion.service.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(FITJEFF_CACHE_VERSION)
      .then((cache) => cache.addAll(ARCHIVOS_APP))
      .catch((error) => console.warn("FitJeff SW: precache incompleto.", error))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("fitjeff-") && key !== FITJEFF_CACHE_VERSION && key !== FITJEFF_RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(responderNavegacion(request));
    return;
  }

  if (url.pathname.endsWith("version.json") || url.pathname.endsWith(".js") || url.pathname.endsWith(".css") || url.pathname.endsWith(".html")) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

self.addEventListener("message", (event) => {
  const tipo = event.data?.tipo;
  if (tipo === "SKIP_WAITING") self.skipWaiting();
  if (tipo === "LIMPIAR_CACHE") event.waitUntil(limpiarCachesFitJeff());
});

async function responderNavegacion(request) {
  try {
    const respuestaRed = await fetch(request);
    const cache = await caches.open(FITJEFF_RUNTIME_CACHE);
    cache.put("./index.html", respuestaRed.clone());
    return respuestaRed;
  } catch (error) {
    const cache = await caches.open(FITJEFF_CACHE_VERSION);
    return (await cache.match("./index.html")) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(FITJEFF_CACHE_VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const respuestaRed = await fetch(request);
    if (respuestaRed.ok) {
      const runtime = await caches.open(FITJEFF_RUNTIME_CACHE);
      runtime.put(request, respuestaRed.clone());
    }
    return respuestaRed;
  } catch (error) {
    return Response.error();
  }
}

async function networkFirst(request) {
  const cache = await caches.open(FITJEFF_RUNTIME_CACHE);
  try {
    const respuestaRed = await fetch(request, { cache: "no-store" });
    if (respuestaRed.ok) cache.put(request, respuestaRed.clone());
    return respuestaRed;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || Response.error();
  }
}

async function limpiarCachesFitJeff() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => key.startsWith("fitjeff-")).map((key) => caches.delete(key)));
}
