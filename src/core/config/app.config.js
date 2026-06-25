/*
  Nombre completo: app.config.js
  Ruta o ubicación: src/core/config/app.config.js

  Función o funciones:
    - Centralizar datos generales de FitJeff.
    - Definir nombre, versión, modo local-first y textos base.
    - Servir como configuración común para PWA, Electron y futura APK.

  Se conecta con:
    - src/app/app.bootstrap.js
    - src/core/status/app-status.service.js
    - src/core/diagnostics/app-diagnostics.service.js
*/

export const APP_CONFIG = Object.freeze({
  nombre: "FitJeff",
  version: "0.1.0",
  usuarioLocal: "jeff",
  modoDatos: "local-first",
  estadoCorrecto: "Datos al día",
  plataformaBase: "web-pwa",
  preparadoParaElectron: true,
  preparadoParaAndroid: true
});

export const APP_STORAGE_KEYS = Object.freeze({
  STATUS: "fitjeff:core:status",
  DIAGNOSTICS: "fitjeff:core:diagnostics",
  LAST_ERROR: "fitjeff:core:last-error",
  LAST_BACKUP_HINT: "fitjeff:core:last-backup-hint"
});
