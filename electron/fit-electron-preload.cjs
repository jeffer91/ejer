/* =========================================================
Nombre completo: fit-electron-preload.cjs
Ruta o ubicación: electron/fit-electron-preload.cjs
Función o funciones:
- Preparar un puente seguro mínimo para Electron.
- Exponer información básica del entorno sin activar nodeIntegration.
- Evitar errores por preload faltante al ejecutar npm start.
Con qué se conecta:
- electron/fit-electron-main.cjs
- src/index.html
========================================================= */
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('FitnessJeffElectron', {
  appName: 'Fitness Jeff',
  mode: 'electron',
  ready: true
});
