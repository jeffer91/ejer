/*
  Nombre completo: ajustes.constants.js
  Ruta o ubicación: src/modules/ajustes/ajustes.constants.js

  Función o funciones:
    - Centralizar textos y claves de la pantalla Ajustes.
    - Mantener Ajustes simple: perfil, objetivo y reabrir Inicio.
    - Evitar textos repetidos en servicio, vista y controlador.

  Se conecta con:
    - src/modules/ajustes/ajustes.service.js
    - src/modules/ajustes/ajustes.view.js
    - src/modules/ajustes/ajustes.controller.js
*/

export const AJUSTES_TEXTOS = Object.freeze({
  TITULO: "Ajustes",
  SUBTITULO: "Edita solo lo necesario: perfil y objetivo.",
  PERFIL: "Perfil",
  OBJETIVO: "Objetivo",
  REABRIR_INICIO: "Reabrir Inicio",
  GUARDAR_PERFIL: "Guardar perfil",
  GUARDAR_OBJETIVO: "Guardar objetivo",
  PERFIL_OK: "Perfil actualizado.",
  OBJETIVO_OK: "Objetivo actualizado.",
  ERROR_GENERAL: "Revisa los datos antes de guardar.",
  CONFIRMAR_INICIO: "¿Quieres reabrir la configuración inicial?"
});

export const AJUSTES_CAMPOS = Object.freeze({
  ALTURA_CM: "alturaCm",
  FECHA_NACIMIENTO: "fechaNacimiento",
  PESO_OBJETIVO_KG: "pesoObjetivoKg"
});

export const AJUSTES_STORAGE_KEYS = Object.freeze({
  INICIO_COMPLETADO: "fitjeff:onboarding-completed"
});
