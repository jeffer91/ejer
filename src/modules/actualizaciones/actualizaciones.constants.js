/*
  Nombre completo: actualizaciones.constants.js
  Ruta o ubicación: src/modules/actualizaciones/actualizaciones.constants.js

  Función o funciones:
    - Centralizar textos, estados y valores visuales del módulo de actualizaciones.
    - Evitar duplicar mensajes en controller, service y view.
    - Mantener una capa preparada para Electron y futura APK.

  Se conecta con:
    - src/modules/actualizaciones/actualizaciones.service.js
    - src/modules/actualizaciones/actualizaciones.view.js
    - src/modules/actualizaciones/actualizaciones.controller.js
    - electron/preload.cjs
*/

export const ACTUALIZACIONES_ESTADOS = Object.freeze({
  INACTIVO: "inactivo",
  NO_DISPONIBLE_DESARROLLO: "no-disponible-desarrollo",
  BUSCANDO: "buscando",
  DISPONIBLE: "disponible",
  NO_DISPONIBLE: "no-disponible",
  DESCARGANDO: "descargando",
  DESCARGADA: "descargada",
  ERROR: "error",
  NO_ELECTRON: "no-electron"
});

export const ACTUALIZACIONES_TEXTOS = Object.freeze({
  TITULO: "Actualizaciones",
  SUBTITULO: "Control de versiones y actualización automática de FitJeff.",
  BUSCAR: "Buscar actualización",
  DESCARGAR: "Descargar actualización",
  REINICIAR: "Reiniciar para actualizar",
  VERSION_ACTUAL: "Versión actual",
  VERSION_DISPONIBLE: "Versión disponible",
  PROGRESO: "Progreso",
  SIN_VERSION: "No disponible",
  NO_ELECTRON: "Esta pantalla funciona completamente dentro de la app de escritorio Electron.",
  NO_INSTALADA: "En desarrollo, el actualizador automático queda desactivado. Se activa cuando la app esté instalada.",
  LISTO: "Actualizador listo.",
  ERROR: "No se pudo completar la acción de actualización."
});

export const ACTUALIZACIONES_ESTADO_INICIAL = Object.freeze({
  estado: ACTUALIZACIONES_ESTADOS.INACTIVO,
  mensaje: ACTUALIZACIONES_TEXTOS.LISTO,
  versionActual: "0.1.0",
  versionDisponible: "",
  porcentaje: 0,
  bytesDescargados: 0,
  bytesTotales: 0,
  velocidadBytes: 0,
  puedeBuscar: true,
  puedeDescargar: false,
  puedeReiniciar: false,
  esElectron: false,
  esInstalada: false,
  actualizadoEn: ""
});
