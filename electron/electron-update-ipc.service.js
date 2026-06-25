/*
  Nombre completo: electron-update-ipc.service.js
  Ruta o ubicación: electron/electron-update-ipc.service.js

  Función o funciones:
    - Registrar canales IPC seguros para actualizaciones automáticas.
    - Permitir que el renderer consulte estado, busque, descargue y reinicie para instalar.
    - Separar la lógica de actualización del IPC general de Electron.

  Se conecta con:
    - electron/electron-ipc.service.js
    - electron/electron-updater.service.js
    - electron/preload.cjs
    - src/modules/actualizaciones/actualizaciones.service.js
*/

import { ipcMain } from "electron";

export const UPDATE_IPC_CHANNELS = Object.freeze({
  EVENT: "fitjeff:update:event",
  GET_STATUS: "fitjeff:update:get-status",
  CHECK: "fitjeff:update:check",
  DOWNLOAD: "fitjeff:update:download",
  QUIT_AND_INSTALL: "fitjeff:update:quit-and-install"
});

function crearRespuestaSegura(accion, callback) {
  return async () => {
    try {
      const data = await callback();
      return {
        ok: true,
        accion,
        data
      };
    } catch (error) {
      return {
        ok: false,
        accion,
        mensaje: error?.message || "No se pudo completar la acción de actualización."
      };
    }
  };
}

function registrarHandlerSeguro(canal, handler) {
  ipcMain.removeHandler(canal);
  ipcMain.handle(canal, handler);
}

export function registrarIpcActualizaciones(updateService) {
  if (!updateService) {
    return;
  }

  registrarHandlerSeguro(
    UPDATE_IPC_CHANNELS.GET_STATUS,
    crearRespuestaSegura("obtener-estado", () => updateService.obtenerEstado())
  );

  registrarHandlerSeguro(
    UPDATE_IPC_CHANNELS.CHECK,
    crearRespuestaSegura("buscar-actualizacion", () => updateService.buscarActualizacion())
  );

  registrarHandlerSeguro(
    UPDATE_IPC_CHANNELS.DOWNLOAD,
    crearRespuestaSegura("descargar-actualizacion", () => updateService.descargarActualizacion())
  );

  registrarHandlerSeguro(
    UPDATE_IPC_CHANNELS.QUIT_AND_INSTALL,
    crearRespuestaSegura("reiniciar-para-actualizar", () => updateService.reiniciarParaActualizar())
  );
}
