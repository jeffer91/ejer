/*
  Nombre completo: preload.js
  Ruta o ubicación: preload.js

  Función:
    - Exponer funciones seguras de Electron hacia el frontend de FitJeff.
    - Permitir consultar entorno de escritorio sin activar nodeIntegration.
    - Preparar la solicitud de actualización de escritorio desde la interfaz.

  Se conecta con:
    - main.js
    - src/actualizaciones/actualizaciones.service.js
    - src/vistas/ajustes.view.js
*/

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("FitJeffDesktop", {
  esElectron: true,

  obtenerEntorno: async () => {
    try {
      return await ipcRenderer.invoke("fitjeff:obtener-entorno");
    } catch (error) {
      return {
        esElectron: true,
        error: error.message || "No se pudo obtener el entorno."
      };
    }
  },

  solicitarActualizacion: async () => {
    try {
      return await ipcRenderer.invoke("fitjeff:solicitar-actualizacion");
    } catch (error) {
      return {
        ok: false,
        estado: "error",
        mensaje: error.message || "No se pudo solicitar actualización."
      };
    }
  }
});
