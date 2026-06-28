/*
  Nombre completo: service-worker.js
  Ruta o ubicación: service-worker.js

  Función o funciones:
    - Activar la base PWA real de FitJeff en producción.
    - Guardar archivos mínimos para que la app pueda abrir con red inestable.
    - Usar caché dinámico solo para peticiones GET del mismo origen.
    - Entregar index.html como respaldo cuando una navegación falle.
    - Limpiar cachés antiguos para evitar versiones mezcladas.

  Se conecta con:
    - src/app/app.bootstrap.js
    - index.html
    - manifest.webmanifest
    - public/icons/icon.svg
*/

const CACHE_VERSION = "fitjeff-pwa-v22";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon.svg"
];

function esGetMismoOrigen(request) {
  try {
    const url = new URL(request.url);
    return request.method === "GET" && url.origin === self.location.origin;
  } catch {
    return false;
  }
}

function esNavegacion(request) {
  return request.mode === "navigate" || request.destination === "document";
}

async function guardarEnCache(cacheName, request, response) {
  if (!response || !response.ok) {
    return response;
  }

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  return response;
}

async function responderEstatico(request) {
  const cache = await caches.open(STATIC_CACHE);
  const guardado = await cache.match(request);

  if (guardado) {
    return guardado;
  }

  const respuesta = await fetch(request);
  return guardarEnCache(STATIC_CACHE, request, respuesta);
}

async function responderDinamico(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const guardado = await cache.match(request);

  try {
    const respuesta = await fetch(request);
    if (respuesta.ok) {
      await cache.put(request, respuesta.clone());
    }
    return respuesta;
  } catch {
    if (guardado) {
      return guardado;
    }

    if (esNavegacion(request)) {
      const fallback = await caches.match("./index.html");
      if (fallback) return fallback;
    }

    throw new Error("FitJeff no pudo responder esta solicitud sin conexión.");
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("fitjeff-pwa-") && !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (!esGetMismoOrigen(request)) {
    return;
  }

  const url = new URL(request.url);
  const esArchivoBase = PRECACHE_URLS.some((item) => {
    const normalizado = new URL(item, self.location.href).pathname;
    return normalizado === url.pathname;
  });

  event.respondWith(esArchivoBase ? responderEstatico(request) : responderDinamico(request));
});
