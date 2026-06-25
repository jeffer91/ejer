/*
  Nombre completo: inicio.constants.js
  Ruta o ubicación: src/modules/inicio/inicio.constants.js

  Función o funciones:
    - Centralizar textos y claves del Inicio de primera vez.
    - Definir los campos que se piden solo al configurar la app.
    - Evitar repetir nombres de campos en vista, servicio y validación.

  Se conecta con:
    - src/modules/inicio/inicio.service.js
    - src/modules/inicio/inicio.validator.js
    - src/modules/inicio/inicio.view.js
    - src/modules/inicio/inicio.controller.js
*/

export const INICIO_STORAGE_KEYS = Object.freeze({
  COMPLETADO: "fitjeff:onboarding-completed"
});

export const INICIO_CAMPOS = Object.freeze({
  ALTURA_CM: "alturaCm",
  FECHA_NACIMIENTO: "fechaNacimiento",
  PESO_INICIAL_KG: "pesoInicialKg",
  PESO_OBJETIVO_KG: "pesoObjetivoKg"
});

export const INICIO_TEXTOS = Object.freeze({
  TITULO: "Configura FitJeff",
  SUBTITULO: "Solo necesitamos estos datos la primera vez.",
  BOTON_GUARDAR: "Guardar y ver estadísticas",
  ERROR_GENERAL: "Revisa los datos antes de continuar.",
  EXITO: "Perfil inicial guardado."
});
