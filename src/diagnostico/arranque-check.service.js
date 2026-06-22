/*
  Nombre completo: arranque-check.service.js
  Ruta o ubicación: src/diagnostico/arranque-check.service.js

  Función:
    - Revisar condiciones básicas para que FitJeff arranque correctamente.
    - Validar que existan módulos base, contenedor principal, localStorage, service worker y entorno web.
    - Generar un resumen simple para consola, diagnóstico y futuras pruebas.

  Se conecta con:
    - src/app-controller.js
    - src/storage/local-storage.service.js
    - src/data/usuario-base.js
    - src/data/rutina-base.js
    - src/pwa/pwa.service.js
*/

import { clonarUsuarioBase } from "../data/usuario-base.js";
import { clonarRutinaBase } from "../data/rutina-base.js";
import { obtenerResumenAlmacenamientoLocal } from "../storage/local-storage.service.js";

export function ejecutarDiagnosticoArranque() {
  const resultados = [
    probarDOM(),
    probarLocalStorage(),
    probarUsuarioBase(),
    probarRutinaBase(),
    probarServiceWorker(),
    probarEntorno()
  ];

  const errores = resultados.filter((item) => !item.ok);
  const advertencias = resultados.filter((item) => item.nivel === "warning");

  return {
    ok: errores.length === 0,
    total: resultados.length,
    correctos: resultados.filter((item) => item.ok).length,
    errores,
    advertencias,
    resultados,
    almacenamiento: leerResumenAlmacenamientoSeguro(),
    generadoEn: new Date().toISOString()
  };
}

export function imprimirDiagnosticoArranque() {
  const diagnostico = ejecutarDiagnosticoArranque();

  if (diagnostico.ok) {
    console.info("FitJeff diagnóstico de arranque OK", diagnostico);
  } else {
    console.warn("FitJeff diagnóstico de arranque con errores", diagnostico);
  }

  return diagnostico;
}

function probarDOM() {
  const existeApp = Boolean(document.getElementById("app"));

  return crearResultado({
    id: "dom-app",
    ok: existeApp,
    mensaje: existeApp ? "Contenedor #app disponible." : "No existe el contenedor #app."
  });
}

function probarLocalStorage() {
  try {
    const clave = "fitjeff_test_storage";
    localStorage.setItem(clave, "ok");
    const ok = localStorage.getItem(clave) === "ok";
    localStorage.removeItem(clave);

    return crearResultado({
      id: "local-storage",
      ok,
      mensaje: ok ? "localStorage disponible." : "localStorage no responde correctamente."
    });
  } catch (error) {
    return crearResultado({
      id: "local-storage",
      ok: false,
      mensaje: error.message || "localStorage no disponible."
    });
  }
}

function probarUsuarioBase() {
  try {
    const usuario = clonarUsuarioBase();
    const ok = Boolean(usuario?.perfil?.pesoActualKg && usuario?.perfil?.alturaCm);

    return crearResultado({
      id: "usuario-base",
      ok,
      mensaje: ok ? "usuario-base.js cargado." : "usuario-base.js no tiene perfil válido."
    });
  } catch (error) {
    return crearResultado({
      id: "usuario-base",
      ok: false,
      mensaje: error.message || "No se pudo cargar usuario base."
    });
  }
}

function probarRutinaBase() {
  try {
    const rutina = clonarRutinaBase();
    const ok = Array.isArray(rutina?.dias) && rutina.dias.length === 4;

    return crearResultado({
      id: "rutina-base",
      ok,
      mensaje: ok ? "rutina-base.js cargada con 4 días." : "rutina-base.js no tiene 4 días."
    });
  } catch (error) {
    return crearResultado({
      id: "rutina-base",
      ok: false,
      mensaje: error.message || "No se pudo cargar rutina base."
    });
  }
}

function probarServiceWorker() {
  const soportado = "serviceWorker" in navigator;
  const archivoLocal = location.protocol === "file:";

  if (archivoLocal) {
    return crearResultado({
      id: "service-worker",
      ok: true,
      nivel: "warning",
      mensaje: "Service worker no funciona abriendo archivo local. Usa Live Server o Firebase Hosting."
    });
  }

  return crearResultado({
    id: "service-worker",
    ok: true,
    nivel: soportado ? "ok" : "warning",
    mensaje: soportado ? "Service worker soportado." : "Este navegador no soporta service worker."
  });
}

function probarEntorno() {
  const esElectron = Boolean(window.FitJeffDesktop?.esElectron);

  return crearResultado({
    id: "entorno",
    ok: true,
    mensaje: esElectron ? "Entorno Electron detectado." : "Entorno web/PWA detectado."
  });
}

function leerResumenAlmacenamientoSeguro() {
  try {
    return obtenerResumenAlmacenamientoLocal();
  } catch (error) {
    return {
      error: error.message || "No se pudo leer resumen local."
    };
  }
}

function crearResultado({ id, ok, mensaje, nivel = null }) {
  return {
    id,
    ok: Boolean(ok),
    nivel: nivel || (ok ? "ok" : "error"),
    mensaje
  };
}
