/*
  Nombre completo: actualizaciones.service.js
  Ruta o ubicación: src/modules/actualizaciones/actualizaciones.service.js

  Función o funciones:
    - Conectar la interfaz web de FitJeff con el preload seguro de Electron.
    - Obtener estado del actualizador automático.
    - Buscar, descargar y reiniciar para instalar actualizaciones.
    - Escuchar eventos de progreso enviados desde Electron.
    - Mantener respuesta segura cuando la app corre en navegador o modo desarrollo.

  Se conecta con:
    - electron/preload.cjs
    - electron/electron-update-ipc.service.js
    - electron/electron-updater.service.js
    - src/modules/actualizaciones/actualizaciones.controller.js
    - src/modules/actualizaciones/actualizaciones.constants.js
*/

import {
  ACTUALIZACIONES_ESTADO_INICIAL,
  ACTUALIZACIONES_ESTADOS,
  ACTUALIZACIONES_TEXTOS
} from "./actualizaciones.constants.js";
import { APP_CONFIG } from "../../core/config/app.config.js";

function obtenerDesktopApi() {
  return window.fitJeffDesktop || null;
}

function tieneUpdaterElectron() {
  const api = obtenerDesktopApi();
  return Boolean(api?.isElectron && api?.updates);
}

function crearEstadoNoElectron() {
  return {
    ...ACTUALIZACIONES_ESTADO_INICIAL,
    estado: ACTUALIZACIONES_ESTADOS.NO_ELECTRON,
    mensaje: ACTUALIZACIONES_TEXTOS.NO_ELECTRON,
    versionActual: APP_CONFIG.version,
    puedeBuscar: false,
    puedeDescargar: false,
    puedeReiniciar: false,
    esElectron: false,
    esInstalada: false,
    actualizadoEn: new Date().toISOString()
  };
}

function normalizarEstado(estado = {}) {
  return {
    ...ACTUALIZACIONES_ESTADO_INICIAL,
    ...estado,
    versionActual: estado.versionActual || APP_CONFIG.version,
    porcentaje: Number(estado.porcentaje || 0),
    bytesDescargados: Number(estado.bytesDescargados || 0),
    bytesTotales: Number(estado.bytesTotales || 0),
    velocidadBytes: Number(estado.velocidadBytes || 0),
    actualizadoEn: estado.actualizadoEn || new Date().toISOString()
  };
}

function desempaquetarRespuesta(respuesta, estadoFallback) {
  if (!respuesta) {
    return estadoFallback;
  }

  if (respuesta.ok && respuesta.data) {
    return normalizarEstado(respuesta.data);
  }

  if (respuesta.estado) {
    return normalizarEstado(respuesta);
  }

  return normalizarEstado({
    ...estadoFallback,
    estado: ACTUALIZACIONES_ESTADOS.ERROR,
    mensaje: respuesta.mensaje || ACTUALIZACIONES_TEXTOS.ERROR
  });
}

export function crearActualizacionesService() {
  let estadoActual = normalizarEstado({
    ...ACTUALIZACIONES_ESTADO_INICIAL,
    versionActual: APP_CONFIG.version,
    actualizadoEn: new Date().toISOString()
  });

  function obtenerEstadoActual() {
    return estadoActual;
  }

  function guardarEstado(estado) {
    estadoActual = normalizarEstado(estado);
    return estadoActual;
  }

  async function cargarEstadoInicial() {
    if (!tieneUpdaterElectron()) {
      return guardarEstado(crearEstadoNoElectron());
    }

    const respuesta = await obtenerDesktopApi().updates.getStatus();
    return guardarEstado(desempaquetarRespuesta(respuesta, estadoActual));
  }

  async function buscarActualizacion() {
    if (!tieneUpdaterElectron()) {
      return guardarEstado(crearEstadoNoElectron());
    }

    const respuesta = await obtenerDesktopApi().updates.check();
    return guardarEstado(desempaquetarRespuesta(respuesta, estadoActual));
  }

  async function descargarActualizacion() {
    if (!tieneUpdaterElectron()) {
      return guardarEstado(crearEstadoNoElectron());
    }

    const respuesta = await obtenerDesktopApi().updates.download();
    return guardarEstado(desempaquetarRespuesta(respuesta, estadoActual));
  }

  async function reiniciarParaActualizar() {
    if (!tieneUpdaterElectron()) {
      return guardarEstado(crearEstadoNoElectron());
    }

    const respuesta = await obtenerDesktopApi().updates.quitAndInstall();
    return guardarEstado(desempaquetarRespuesta(respuesta, estadoActual));
  }

  function escucharEventos(callback) {
    if (!tieneUpdaterElectron() || typeof callback !== "function") {
      return () => {};
    }

    return obtenerDesktopApi().updates.onEvent((evento) => {
      const estado = guardarEstado(evento);
      callback(estado);
    });
  }

  return {
    obtenerEstadoActual,
    cargarEstadoInicial,
    buscarActualizacion,
    descargarActualizacion,
    reiniciarParaActualizar,
    escucharEventos
  };
}
