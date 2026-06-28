/*
  Nombre completo: electron-updater.service.js
  Ruta o ubicación: electron/electron-updater.service.js

  Función o funciones:
    - Controlar la búsqueda, descarga e instalación de actualizaciones en Electron.
    - Usar electron-updater solo cuando la app esté empaquetada/instalada.
    - Buscar y descargar actualizaciones automáticamente en segundo plano.
    - Emitir eventos de estado y progreso hacia el renderer.
    - Mantener el modo desarrollo sin fallar aunque no exista una actualización publicada.

  Se conecta con:
    - electron/main.js
    - electron/electron-update-ipc.service.js
    - electron/preload.cjs
    - package.json
    - GitHub Releases
*/

import { app, BrowserWindow } from "electron";

const EVENTO_RENDERER = "fitjeff:update:event";
const BUSQUEDA_AUTOMATICA_INICIO_MS = 8000;
const BUSQUEDA_AUTOMATICA_INTERVALO_MS = 1000 * 60 * 60 * 6;

const ESTADOS = Object.freeze({
  INACTIVO: "inactivo",
  NO_DISPONIBLE_DESARROLLO: "no-disponible-desarrollo",
  BUSCANDO: "buscando",
  DISPONIBLE: "disponible",
  NO_DISPONIBLE: "no-disponible",
  DESCARGANDO: "descargando",
  DESCARGADA: "descargada",
  ERROR: "error"
});

function crearEstadoInicial() {
  return {
    estado: ESTADOS.INACTIVO,
    mensaje: "Actualizador automático listo.",
    versionActual: app.getVersion(),
    versionDisponible: "",
    porcentaje: 0,
    bytesDescargados: 0,
    bytesTotales: 0,
    velocidadBytes: 0,
    puedeBuscar: true,
    puedeDescargar: false,
    puedeReiniciar: false,
    esElectron: true,
    esInstalada: app.isPackaged,
    automaticoActivo: app.isPackaged,
    actualizadoEn: new Date().toISOString()
  };
}

function normalizarProgreso(progreso = {}) {
  return {
    porcentaje: Math.max(0, Math.min(100, Number(progreso.percent || 0))),
    bytesDescargados: Number(progreso.transferred || 0),
    bytesTotales: Number(progreso.total || 0),
    velocidadBytes: Number(progreso.bytesPerSecond || 0)
  };
}

function usarTemporizadorSinBloquearSalida(temporizador) {
  if (temporizador && typeof temporizador.unref === "function") {
    temporizador.unref();
  }

  return temporizador;
}

export function crearElectronUpdaterService({ obtenerVentanaPrincipal = () => BrowserWindow.getFocusedWindow() } = {}) {
  let autoUpdater = null;
  let eventosRegistrados = false;
  let estadoActual = crearEstadoInicial();
  let busquedaEnCurso = null;
  let temporizadorBusquedaAutomatica = null;
  let intervaloBusquedaAutomatica = null;

  function actualizarEstado(parcial = {}) {
    estadoActual = {
      ...estadoActual,
      ...parcial,
      versionActual: app.getVersion(),
      esInstalada: app.isPackaged,
      automaticoActivo: app.isPackaged,
      actualizadoEn: new Date().toISOString()
    };

    emitirEvento(estadoActual);
    return estadoActual;
  }

  function obtenerVentanasDestino() {
    const ventanaPrincipal = obtenerVentanaPrincipal();
    const ventanas = ventanaPrincipal ? [ventanaPrincipal] : BrowserWindow.getAllWindows();
    return ventanas.filter((ventana) => ventana && !ventana.isDestroyed());
  }

  function emitirEvento(payload) {
    obtenerVentanasDestino().forEach((ventana) => {
      ventana.webContents.send(EVENTO_RENDERER, payload);
    });
  }

  async function cargarAutoUpdater() {
    if (autoUpdater) {
      return autoUpdater;
    }

    const modulo = await import("electron-updater");
    autoUpdater = modulo.autoUpdater || modulo.default?.autoUpdater;

    if (!autoUpdater) {
      throw new Error("No se pudo cargar electron-updater.");
    }

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowPrerelease = false;

    registrarEventosAutoUpdater();
    return autoUpdater;
  }

  function registrarEventosAutoUpdater() {
    if (!autoUpdater || eventosRegistrados) {
      return;
    }

    eventosRegistrados = true;

    autoUpdater.on("checking-for-update", () => {
      actualizarEstado({
        estado: ESTADOS.BUSCANDO,
        mensaje: "Buscando actualización automáticamente...",
        porcentaje: 0,
        puedeBuscar: false,
        puedeDescargar: false,
        puedeReiniciar: false
      });
    });

    autoUpdater.on("update-available", (info) => {
      actualizarEstado({
        estado: ESTADOS.DISPONIBLE,
        mensaje: "Hay una actualización disponible. La descarga iniciará automáticamente.",
        versionDisponible: info?.version || "",
        porcentaje: 0,
        puedeBuscar: false,
        puedeDescargar: false,
        puedeReiniciar: false
      });
    });

    autoUpdater.on("update-not-available", () => {
      actualizarEstado({
        estado: ESTADOS.NO_DISPONIBLE,
        mensaje: "FitJeff ya está actualizado.",
        versionDisponible: "",
        porcentaje: 0,
        puedeBuscar: true,
        puedeDescargar: false,
        puedeReiniciar: false
      });
    });

    autoUpdater.on("download-progress", (progreso) => {
      actualizarEstado({
        estado: ESTADOS.DESCARGANDO,
        mensaje: "Descargando actualización automáticamente...",
        ...normalizarProgreso(progreso),
        puedeBuscar: false,
        puedeDescargar: false,
        puedeReiniciar: false
      });
    });

    autoUpdater.on("update-downloaded", (info) => {
      actualizarEstado({
        estado: ESTADOS.DESCARGADA,
        mensaje: "Actualización descargada. Se instalará automáticamente al cerrar o reiniciar FitJeff.",
        versionDisponible: info?.version || estadoActual.versionDisponible,
        porcentaje: 100,
        puedeBuscar: false,
        puedeDescargar: false,
        puedeReiniciar: true
      });
    });

    autoUpdater.on("error", (error) => {
      actualizarEstado({
        estado: ESTADOS.ERROR,
        mensaje: error?.message || "No se pudo actualizar FitJeff.",
        puedeBuscar: true,
        puedeDescargar: false,
        puedeReiniciar: false
      });
    });
  }

  function obtenerEstado() {
    return estadoActual;
  }

  async function ejecutarBusquedaActualizacion({ automatica = false } = {}) {
    if (!app.isPackaged) {
      return actualizarEstado({
        estado: ESTADOS.NO_DISPONIBLE_DESARROLLO,
        mensaje: automatica
          ? "Modo desarrollo: búsqueda automática desactivada."
          : "El actualizador automático funciona solo en la app instalada.",
        puedeBuscar: false,
        puedeDescargar: false,
        puedeReiniciar: false
      });
    }

    if (busquedaEnCurso) {
      return busquedaEnCurso;
    }

    busquedaEnCurso = (async () => {
      const updater = await cargarAutoUpdater();

      actualizarEstado({
        estado: ESTADOS.BUSCANDO,
        mensaje: automatica ? "Buscando actualización automáticamente..." : "Buscando actualización...",
        porcentaje: 0,
        puedeBuscar: false,
        puedeDescargar: false,
        puedeReiniciar: false
      });

      await updater.checkForUpdates();
      return obtenerEstado();
    })().finally(() => {
      busquedaEnCurso = null;
    });

    return busquedaEnCurso;
  }

  function programarBusquedaAutomatica() {
    if (!app.isPackaged || temporizadorBusquedaAutomatica || intervaloBusquedaAutomatica) {
      return;
    }

    const buscarEnSegundoPlano = () => {
      ejecutarBusquedaActualizacion({ automatica: true }).catch((error) => {
        actualizarEstado({
          estado: ESTADOS.ERROR,
          mensaje: error?.message || "No se pudo buscar actualizaciones automáticamente.",
          puedeBuscar: true,
          puedeDescargar: false,
          puedeReiniciar: false
        });
      });
    };

    temporizadorBusquedaAutomatica = usarTemporizadorSinBloquearSalida(setTimeout(() => {
      temporizadorBusquedaAutomatica = null;
      buscarEnSegundoPlano();
    }, BUSQUEDA_AUTOMATICA_INICIO_MS));

    intervaloBusquedaAutomatica = usarTemporizadorSinBloquearSalida(setInterval(
      buscarEnSegundoPlano,
      BUSQUEDA_AUTOMATICA_INTERVALO_MS
    ));
  }

  function buscarActualizacion() {
    return ejecutarBusquedaActualizacion({ automatica: false });
  }

  async function descargarActualizacion() {
    if (!app.isPackaged) {
      return buscarActualizacion();
    }

    const updater = await cargarAutoUpdater();
    actualizarEstado({
      estado: ESTADOS.DESCARGANDO,
      mensaje: "Iniciando descarga de actualización...",
      porcentaje: 0,
      puedeBuscar: false,
      puedeDescargar: false,
      puedeReiniciar: false
    });

    await updater.downloadUpdate();
    return obtenerEstado();
  }

  function reiniciarParaActualizar() {
    if (!autoUpdater || !estadoActual.puedeReiniciar) {
      return actualizarEstado({
        mensaje: "Todavía no hay una actualización lista para instalar."
      });
    }

    autoUpdater.quitAndInstall(false, true);
    return obtenerEstado();
  }

  async function iniciar() {
    if (!app.isPackaged) {
      return actualizarEstado({
        estado: ESTADOS.NO_DISPONIBLE_DESARROLLO,
        mensaje: "Modo desarrollo: actualizador automático desactivado.",
        puedeBuscar: false,
        puedeDescargar: false,
        puedeReiniciar: false
      });
    }

    await cargarAutoUpdater();
    programarBusquedaAutomatica();

    return actualizarEstado({
      estado: ESTADOS.INACTIVO,
      mensaje: "Actualizador automático activo. FitJeff buscará y descargará actualizaciones en segundo plano.",
      puedeBuscar: true,
      puedeDescargar: false,
      puedeReiniciar: false
    });
  }

  return {
    EVENTO_RENDERER,
    ESTADOS,
    iniciar,
    obtenerEstado,
    buscarActualizacion,
    descargarActualizacion,
    reiniciarParaActualizar
  };
}
