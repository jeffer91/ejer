/*
  Nombre completo: diagnostico.pwa.service.js
  Ruta o ubicación: src/diagnostico/diagnostico.pwa.service.js

  Función:
    - Revisar condiciones PWA.
    - Validar service worker, manifest, versión y caché disponible.
    - Entregar resultados legibles para la vista Diagnóstico.

  Se conecta con:
    - src/diagnostico/diagnostico.schema.js
    - src/diagnostico/diagnostico.completo.service.js
*/

import { DIAGNOSTICO_AREAS, DIAGNOSTICO_NIVELES, crearResultadoDiagnostico } from "./diagnostico.schema.js";

export async function diagnosticarPWA() {
  const resultados = [
    probarServiceWorkerSoportado(),
    probarContextoSeguro()
  ];

  resultados.push(await probarManifest());
  resultados.push(await probarVersionJson());
  resultados.push(await probarCacheStorage());

  return resultados;
}

function probarServiceWorkerSoportado() {
  const soportado = "serviceWorker" in navigator;

  return crearResultadoDiagnostico({
    id: "pwa-service-worker",
    area: DIAGNOSTICO_AREAS.PWA,
    ok: soportado,
    nivel: soportado ? DIAGNOSTICO_NIVELES.OK : DIAGNOSTICO_NIVELES.WARNING,
    titulo: "Service Worker",
    mensaje: soportado ? "El navegador soporta service worker." : "Este navegador no soporta service worker.",
    solucion: soportado ? "" : "Probar en Chrome, Edge o navegador compatible."
  });
}

function probarContextoSeguro() {
  const seguro = window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";

  return crearResultadoDiagnostico({
    id: "pwa-contexto-seguro",
    area: DIAGNOSTICO_AREAS.PWA,
    ok: seguro,
    nivel: seguro ? DIAGNOSTICO_NIVELES.OK : DIAGNOSTICO_NIVELES.WARNING,
    titulo: "Contexto seguro",
    mensaje: seguro ? "Contexto seguro disponible." : "PWA requiere HTTPS, localhost o hosting seguro.",
    solucion: seguro ? "" : "Usar Firebase Hosting, Netlify o servidor HTTPS."
  });
}

async function probarManifest() {
  try {
    const respuesta = await fetch("./public/manifest.json", { cache: "no-store" });
    const manifest = await respuesta.json();

    const ok = Boolean(manifest.name && manifest.start_url && manifest.icons);

    return crearResultadoDiagnostico({
      id: "pwa-manifest",
      area: DIAGNOSTICO_AREAS.PWA,
      ok,
      nivel: ok ? DIAGNOSTICO_NIVELES.OK : DIAGNOSTICO_NIVELES.WARNING,
      titulo: "Manifest",
      mensaje: ok ? "manifest.json disponible." : "manifest.json existe, pero faltan campos.",
      detalle: {
        name: manifest.name,
        start_url: manifest.start_url,
        icons: Array.isArray(manifest.icons) ? manifest.icons.length : 0
      },
      solucion: ok ? "" : "Completar name, start_url e icons."
    });
  } catch (error) {
    return crearResultadoDiagnostico({
      id: "pwa-manifest",
      area: DIAGNOSTICO_AREAS.PWA,
      ok: false,
      titulo: "Manifest",
      mensaje: error.message || "No se pudo leer manifest.json.",
      solucion: "Confirmar que public/manifest.json exista."
    });
  }
}

async function probarVersionJson() {
  try {
    const respuesta = await fetch("./public/version.json", { cache: "no-store" });
    const version = await respuesta.json();

    return crearResultadoDiagnostico({
      id: "pwa-version",
      area: DIAGNOSTICO_AREAS.PWA,
      ok: Boolean(version.build),
      titulo: "Version JSON",
      mensaje: `Versión ${version.appVersion || version.version || "-"} build ${version.build || "-"}.`,
      detalle: version
    });
  } catch (error) {
    return crearResultadoDiagnostico({
      id: "pwa-version",
      area: DIAGNOSTICO_AREAS.PWA,
      ok: false,
      titulo: "Version JSON",
      mensaje: error.message || "No se pudo leer public/version.json.",
      solucion: "Revisar que public/version.json sea JSON válido."
    });
  }
}

async function probarCacheStorage() {
  try {
    const disponible = "caches" in window;

    if (!disponible) {
      return crearResultadoDiagnostico({
        id: "pwa-cache",
        area: DIAGNOSTICO_AREAS.PWA,
        ok: true,
        nivel: DIAGNOSTICO_NIVELES.WARNING,
        titulo: "Cache Storage",
        mensaje: "Cache Storage no disponible en este navegador."
      });
    }

    const keys = await caches.keys();

    return crearResultadoDiagnostico({
      id: "pwa-cache",
      area: DIAGNOSTICO_AREAS.PWA,
      ok: true,
      titulo: "Cache Storage",
      mensaje: `${keys.length} cachés detectados.`,
      detalle: {
        caches: keys
      }
    });
  } catch (error) {
    return crearResultadoDiagnostico({
      id: "pwa-cache",
      area: DIAGNOSTICO_AREAS.PWA,
      ok: false,
      titulo: "Cache Storage",
      mensaje: error.message || "No se pudo revisar caché."
    });
  }
}
