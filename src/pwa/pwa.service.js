/*
  Nombre completo: pwa.service.js
  Ruta o ubicación: src/pwa/pwa.service.js

  Función:
    - Registrar el service worker de FitJeff desde la raíz del proyecto.
    - Detectar si la app puede instalarse en celular o navegador.
    - Controlar el evento de instalación PWA.
    - Comunicar actualizaciones disponibles al usuario.

  Se conecta con:
    - service-worker.js
    - public/manifest.json
    - public/version.json
    - src/actualizaciones/actualizaciones.service.js
    - src/ui/modal.js
    - src/app.js
*/

let eventoInstalacionPendiente = null;
let registroServiceWorker = null;
let listeners = [];
let eventosEscuchados = false;

export const ESTADOS_PWA = {
  SOPORTADA: "soportada",
  NO_SOPORTADA: "no-soportada",
  INSTALABLE: "instalable",
  INSTALADA: "instalada",
  SW_REGISTRADO: "service-worker-registrado",
  SW_ERROR: "service-worker-error",
  ACTUALIZACION_DISPONIBLE: "actualizacion-disponible"
};

export async function inicializarPWA() {
  escucharEventosPWAUnaVez();

  const sw = await registrarServiceWorker();

  return {
    soportada: esPWASoportada(),
    instalada: estaInstaladaComoPWA(),
    serviceWorker: sw,
    instalable: Boolean(eventoInstalacionPendiente)
  };
}

export function esPWASoportada() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

export function estaInstaladaComoPWA() {
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

export async function registrarServiceWorker() {
  if (!esPWASoportada()) {
    notificar(ESTADOS_PWA.NO_SOPORTADA, {
      mensaje: "Este navegador no soporta service worker."
    });
    return null;
  }

  if (location.protocol === "file:") {
    notificar(ESTADOS_PWA.SW_ERROR, {
      mensaje: "El service worker no funciona con archivo local. Usa Live Server, Firebase Hosting o HTTPS."
    });
    return null;
  }

  try {
    registroServiceWorker = await navigator.serviceWorker.register("./service-worker.js", {
      scope: "./"
    });

    registroServiceWorker.addEventListener("updatefound", () => {
      const workerNuevo = registroServiceWorker.installing;

      if (!workerNuevo) {
        return;
      }

      workerNuevo.addEventListener("statechange", () => {
        if (workerNuevo.state === "installed" && navigator.serviceWorker.controller) {
          notificar(ESTADOS_PWA.ACTUALIZACION_DISPONIBLE, {
            mensaje: "Hay una nueva versión lista para aplicar.",
            registro: registroServiceWorker
          });
        }
      });
    });

    notificar(ESTADOS_PWA.SW_REGISTRADO, {
      mensaje: "Service worker registrado.",
      registro: registroServiceWorker
    });

    return registroServiceWorker;
  } catch (error) {
    notificar(ESTADOS_PWA.SW_ERROR, {
      mensaje: error.message || "No se pudo registrar el service worker.",
      error
    });
    return null;
  }
}

export async function instalarPWA() {
  if (!eventoInstalacionPendiente) {
    return {
      ok: false,
      mensaje:
        "La instalación aún no está disponible. En celular puedes usar Agregar a pantalla de inicio desde el navegador."
    };
  }

  eventoInstalacionPendiente.prompt();
  const resultado = await eventoInstalacionPendiente.userChoice;
  eventoInstalacionPendiente = null;

  return {
    ok: resultado.outcome === "accepted",
    resultado: resultado.outcome,
    mensaje:
      resultado.outcome === "accepted"
        ? "FitJeff se instaló correctamente."
        : "Instalación cancelada."
  };
}

export async function aplicarActualizacionPWA() {
  const registro = registroServiceWorker || (await navigator.serviceWorker?.getRegistration?.("./"));

  if (!registro) {
    window.location.reload();
    return { ok: true, mensaje: "Recargando app." };
  }

  if (registro.waiting) {
    registro.waiting.postMessage({ tipo: "SKIP_WAITING" });
  }

  if (registro.active) {
    registro.active.postMessage({ tipo: "LIMPIAR_CACHE" });
  }

  window.location.reload();

  return {
    ok: true,
    mensaje: "Actualización PWA aplicada."
  };
}

export function escucharEstadoPWA(callback) {
  if (typeof callback !== "function") {
    return () => {};
  }

  listeners.push(callback);

  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
  };
}

export function obtenerResumenPWA() {
  return {
    soportada: esPWASoportada(),
    instalada: estaInstaladaComoPWA(),
    instalable: Boolean(eventoInstalacionPendiente),
    serviceWorkerRegistrado: Boolean(registroServiceWorker),
    scope: registroServiceWorker?.scope || null
  };
}

function escucharEventosPWAUnaVez() {
  if (eventosEscuchados) {
    return;
  }

  eventosEscuchados = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    eventoInstalacionPendiente = event;

    notificar(ESTADOS_PWA.INSTALABLE, {
      mensaje: "FitJeff está lista para instalarse."
    });
  });

  window.addEventListener("appinstalled", () => {
    eventoInstalacionPendiente = null;

    notificar(ESTADOS_PWA.INSTALADA, {
      mensaje: "FitJeff instalada."
    });
  });
}

function notificar(tipo, payload = {}) {
  listeners.forEach((callback) => {
    try {
      callback(tipo, payload);
    } catch (error) {
      console.warn("Error en listener PWA.", error);
    }
  });
}
