/*
  Nombre completo: service-worker.js
  Ruta o ubicación: service-worker.js

  Función:
    - Permitir que FitJeff controle toda la app como PWA desde la raíz.
    - Guardar archivos principales en caché y permitir actualización controlada.
    - Incluir dashboard, reportes, diagnóstico, rutinas, medidas, Jarvis inteligente y entrenamiento guiado.
*/

const FITJEFF_CACHE_VERSION = "fitjeff-root-v0.1.0-build-10";
const FITJEFF_RUNTIME_CACHE = "fitjeff-runtime-v0.1.0-build-10";

const ARCHIVOS_APP = [
  "./",
  "./index.html",
  "./assets/icons/icon.svg",
  "./public/manifest.json",
  "./public/version.json",
  "./styles/base.css",
  "./styles/layout.css",
  "./styles/componentes.css",
  "./styles/responsive.css",
  "./src/app.js",
  "./src/app-controller.js",
  "./src/data/usuario-base.js",
  "./src/data/rutina-base.js",
  "./src/storage/local-storage.service.js",
  "./src/exportacion/exportacion.service.js",
  "./src/firebase/firebase.config.js",
  "./src/firebase/firebase.app.js",
  "./src/firebase/firestore.service.js",
  "./src/sincronizacion/sincronizacion.service.js",
  "./src/perfil/perfil.service.js",
  "./src/peso/peso.service.js",
  "./src/entrenamiento/entrenamiento.service.js",
  "./src/entrenamiento-guiado/guiado.config.js",
  "./src/entrenamiento-guiado/guiado.estado.js",
  "./src/entrenamiento-guiado/guiado.timer.service.js",
  "./src/entrenamiento-guiado/guiado.service.js",
  "./src/entrenamiento-guiado/guiado.resumen.service.js",
  "./src/dashboard/dashboard.constantes.js",
  "./src/dashboard/dashboard.format.service.js",
  "./src/dashboard/dashboard.service.js",
  "./src/dashboard/dashboard.graficas.service.js",
  "./src/dashboard/dashboard.alertas.service.js",
  "./src/dashboard/dashboard.estilos.service.js",
  "./src/reportes/reportes.schema.js",
  "./src/reportes/reportes.format.service.js",
  "./src/reportes/reportes.service.js",
  "./src/reportes/reportes.storage.service.js",
  "./src/reportes/reportes.export.service.js",
  "./src/rutinas/rutina.schema.js",
  "./src/rutinas/rutina.formato-fitjeff.js",
  "./src/rutinas/rutina.parser.js",
  "./src/rutinas/rutina.validator.js",
  "./src/rutinas/rutina.storage.service.js",
  "./src/rutinas/rutina.import.service.js",
  "./src/medidas/medidas.schema.js",
  "./src/medidas/medidas.storage.service.js",
  "./src/medidas/medidas.service.js",
  "./src/medidas/medidas.recordatorio.service.js",
  "./src/medidas/medidas.graficas.service.js",
  "./src/medidas/medidas.format.service.js",
  "./src/diagnostico/arranque-check.service.js",
  "./src/diagnostico/diagnostico.schema.js",
  "./src/diagnostico/diagnostico.modulos.service.js",
  "./src/diagnostico/diagnostico.pwa.service.js",
  "./src/diagnostico/diagnostico.firebase.service.js",
  "./src/diagnostico/diagnostico.completo.service.js",
  "./src/estadisticas/estadisticas.calculos.js",
  "./src/estadisticas/estadisticas.service.js",
  "./src/recomendaciones/recomendaciones.prompt.js",
  "./src/recomendaciones/recomendaciones.service.js",
  "./src/actualizaciones/actualizaciones.service.js",
  "./src/pwa/pwa.service.js",
  "./src/jarvis/jarvis.config.js",
  "./src/jarvis/jarvis.estado.js",
  "./src/jarvis/jarvis.comandos.js",
  "./src/jarvis/jarvis.voz.service.js",
  "./src/jarvis/jarvis.entrenamiento.js",
  "./src/jarvis/jarvis.notas.service.js",
  "./src/jarvis/jarvis.inteligencia.schema.js",
  "./src/jarvis/jarvis.contexto.service.js",
  "./src/jarvis/jarvis.prompt.service.js",
  "./src/jarvis/jarvis.gemini.service.js",
  "./src/jarvis/jarvis.inteligente.service.js",
  "./src/ui/helpers.js",
  "./src/ui/router.js",
  "./src/ui/layout.js",
  "./src/ui/menu.js",
  "./src/ui/modal.js",
  "./src/vistas/componentes.view.js",
  "./src/vistas/inicio.view.js",
  "./src/vistas/entrenar.view.js",
  "./src/vistas/entrenamiento-guiado.view.js",
  "./src/vistas/rutinas.view.js",
  "./src/vistas/medidas.view.js",
  "./src/vistas/reportes.view.js",
  "./src/vistas/diagnostico.view.js",
  "./src/vistas/peso.view.js",
  "./src/vistas/estadisticas.view.js",
  "./src/vistas/recomendaciones.view.js",
  "./src/vistas/jarvis.view.js",
  "./src/vistas/ajustes.view.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches
      .open(FITJEFF_CACHE_VERSION)
      .then((cache) => cache.addAll(ARCHIVOS_APP))
      .catch((error) => console.warn("FitJeff SW: precache incompleto.", error))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("fitjeff-") &&
                key !== FITJEFF_CACHE_VERSION &&
                key !== FITJEFF_RUNTIME_CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
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

  if (url.pathname.endsWith("version.json")) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.endsWith(".js") || url.pathname.endsWith(".css") || url.pathname.endsWith(".html")) {
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

    if (respuestaRed.ok) {
      cache.put(request, respuestaRed.clone());
    }

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
