/*
  Nombre completo: actualizaciones.service.js
  Ruta o ubicación: src/actualizaciones/actualizaciones.service.js

  Función:
    - Revisar la versión local de FitJeff contra un archivo version.json.
    - Preparar actualización en PWA mediante service worker.
    - Preparar actualización en Electron mediante el puente seguro de preload.js.
    - Permitir un botón "Actualizar app" para celular, navegador y escritorio.

  Se conecta con:
    - public/version.json cuando se cree.
    - public/service-worker.js cuando se cree.
    - preload.js
    - main.js
    - src/ui/modal.js
    - src/app.js
*/

export const VERSION_APP = "0.1.0";

export const ESTADOS_ACTUALIZACION = {
  ACTUALIZADO: "actualizado",
  DISPONIBLE: "disponible",
  REVISANDO: "revisando",
  ERROR: "error",
  NO_CONFIGURADO: "no-configurado"
};

const VERSION_URL = "./version.json";
const STORAGE_ULTIMA_REVISION = "fitjeff_ultima_revision_actualizacion";

export async function revisarActualizacion() {
  const resultado = {
    ok: true,
    estado: ESTADOS_ACTUALIZACION.REVISANDO,
    versionLocal: VERSION_APP,
    versionRemota: null,
    hayActualizacion: false,
    mensaje: "Revisando actualización...",
    revisadoEn: new Date().toISOString()
  };

  try {
    const remoto = await leerVersionRemota();

    if (!remoto) {
      return {
        ...resultado,
        ok: false,
        estado: ESTADOS_ACTUALIZACION.NO_CONFIGURADO,
        mensaje:
          "Todavía no existe version.json. Se creará en el bloque de PWA."
      };
    }

    const versionRemota = remoto.version || remoto.appVersion || null;
    const hayActualizacion = compararVersiones(versionRemota, VERSION_APP) > 0;

    guardarUltimaRevision();

    return {
      ...resultado,
      estado: hayActualizacion
        ? ESTADOS_ACTUALIZACION.DISPONIBLE
        : ESTADOS_ACTUALIZACION.ACTUALIZADO,
      versionRemota,
      hayActualizacion,
      notas: remoto.notas || "",
      fechaPublicacion: remoto.fechaPublicacion || null,
      mensaje: hayActualizacion
        ? `Hay una nueva versión disponible: ${versionRemota}.`
        : "La app está actualizada."
    };
  } catch (error) {
    return {
      ...resultado,
      ok: false,
      estado: ESTADOS_ACTUALIZACION.ERROR,
      mensaje: error.message || "No se pudo revisar actualización.",
      error
    };
  }
}

export async function aplicarActualizacionWeb() {
  try {
    if ("serviceWorker" in navigator) {
      const registros = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registros.map((registro) => registro.update()));
    }

    limpiarCacheNavegadorBasico();
    guardarUltimaRevision();
    window.location.reload();

    return {
      ok: true,
      mensaje: "Actualización web aplicada."
    };
  } catch (error) {
    return {
      ok: false,
      mensaje: error.message || "No se pudo aplicar la actualización web.",
      error
    };
  }
}

export async function aplicarActualizacionElectron() {
  if (!window.FitJeffDesktop?.solicitarActualizacion) {
    return {
      ok: false,
      estado: ESTADOS_ACTUALIZACION.NO_CONFIGURADO,
      mensaje: "El puente de actualización de Electron todavía no está activo."
    };
  }

  try {
    return await window.FitJeffDesktop.solicitarActualizacion();
  } catch (error) {
    return {
      ok: false,
      estado: ESTADOS_ACTUALIZACION.ERROR,
      mensaje: error.message || "No se pudo solicitar actualización en Electron.",
      error
    };
  }
}

export async function actualizarApp() {
  const esElectron = Boolean(window.FitJeffDesktop?.esElectron);

  if (esElectron) {
    const electron = await aplicarActualizacionElectron();

    if (electron?.ok) {
      return electron;
    }
  }

  return aplicarActualizacionWeb();
}

export function obtenerUltimaRevisionActualizacion() {
  return localStorage.getItem(STORAGE_ULTIMA_REVISION);
}

export function crearResumenActualizacion() {
  return {
    versionActual: VERSION_APP,
    ultimaRevision: obtenerUltimaRevisionActualizacion(),
    modo: window.FitJeffDesktop?.esElectron ? "electron" : "web-pwa",
    serviceWorkerDisponible: "serviceWorker" in navigator
  };
}

async function leerVersionRemota() {
  const url = `${VERSION_URL}?t=${Date.now()}`;
  const respuesta = await fetch(url, {
    cache: "no-store"
  });

  if (!respuesta.ok) {
    return null;
  }

  return respuesta.json();
}

function compararVersiones(versionA, versionB) {
  if (!versionA || !versionB) {
    return 0;
  }

  const a = String(versionA).split(".").map(Number);
  const b = String(versionB).split(".").map(Number);
  const largo = Math.max(a.length, b.length);

  for (let i = 0; i < largo; i += 1) {
    const parteA = a[i] || 0;
    const parteB = b[i] || 0;

    if (parteA > parteB) {
      return 1;
    }

    if (parteA < parteB) {
      return -1;
    }
  }

  return 0;
}

function limpiarCacheNavegadorBasico() {
  if (!("caches" in window)) {
    return;
  }

  caches.keys().then((keys) => {
    keys
      .filter((key) => key.startsWith("fitjeff-"))
      .forEach((key) => caches.delete(key));
  });
}

function guardarUltimaRevision() {
  localStorage.setItem(STORAGE_ULTIMA_REVISION, new Date().toISOString());
}
