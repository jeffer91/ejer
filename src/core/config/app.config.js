/*
  Nombre completo: app.config.js
  Ruta o ubicación: src/core/config/app.config.js

  Función o funciones:
    - Centralizar datos generales de FitJeff.
    - Leer el número de versión desde package.json para evitar versiones duplicadas.
    - Definir nombre, modo local-first y textos base.
    - Servir como configuración común para PWA, Electron y futura APK.

  Se conecta con:
    - package.json
    - src/app/app.bootstrap.js
    - src/core/status/app-status.service.js
    - src/core/diagnostics/app-diagnostics.service.js
    - scripts/version-bump.cjs
*/

import packageInfo from "../../../package.json";

export const APP_CONFIG = Object.freeze({
  nombre: "FitJeff",
  version: packageInfo.version || "0.1.0",
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
