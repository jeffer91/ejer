/*
  Nombre completo: app-status.service.js
  Ruta o ubicación: src/core/status/app-status.service.js

  Función o funciones:
    - Controlar el estado general visible de FitJeff.
    - Mantener el texto simple "Datos al día" cuando todo está correcto.
    - Preparar estados futuros para sincronización, pendientes y errores simples.

  Se conecta con:
    - src/core/config/app.config.js
    - src/core/storage/safe-local-storage.service.js
    - futuros módulos de Firebase y sincronización.
*/

import { APP_CONFIG, APP_STORAGE_KEYS } from "../config/app.config.js";
import { obtenerFechaHoraISO } from "../utils/date.util.js";
import { crearSafeLocalStorageService } from "../storage/safe-local-storage.service.js";

const storage = crearSafeLocalStorageService();

function crearEstadoInicial() {
  return {
    texto: APP_CONFIG.estadoCorrecto,
    datosAlDia: true,
    pendienteSubir: false,
    errorSimple: "",
    actualizadoEn: obtenerFechaHoraISO()
  };
}

export function crearAppStatusService() {
  function obtenerEstado() {
    return storage.leerJson(APP_STORAGE_KEYS.STATUS, crearEstadoInicial());
  }

  function guardarEstado(parcial) {
    const estado = {
      ...obtenerEstado(),
      ...parcial,
      actualizadoEn: obtenerFechaHoraISO()
    };

    storage.guardarJson(APP_STORAGE_KEYS.STATUS, estado);
    return estado;
  }

  function marcarDatosAlDia() {
    return guardarEstado({
      texto: APP_CONFIG.estadoCorrecto,
      datosAlDia: true,
      pendienteSubir: false,
      errorSimple: ""
    });
  }

  function marcarPendiente(mensaje = "Cambios pendientes") {
    return guardarEstado({
      texto: mensaje,
      datosAlDia: false,
      pendienteSubir: true,
      errorSimple: ""
    });
  }

  function marcarErrorSimple(mensaje = "Algo no se pudo completar, pero la app sigue funcionando.") {
    return guardarEstado({
      texto: mensaje,
      datosAlDia: false,
      pendienteSubir: true,
      errorSimple: mensaje
    });
  }

  return {
    obtenerEstado,
    guardarEstado,
    marcarDatosAlDia,
    marcarPendiente,
    marcarErrorSimple
  };
}
