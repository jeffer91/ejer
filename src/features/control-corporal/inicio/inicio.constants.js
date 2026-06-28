/*
  Nombre completo: inicio.constants.js
  Ruta o ubicacion: src/features/control-corporal/inicio/inicio.constants.js

  Funcion o funciones:
    - Centralizar textos y claves del Inicio de primera vez.
    - Definir los campos que se piden solo al configurar la app.
    - Preparar la salida natural hacia la pantalla Hoy.
    - Agregar contexto muscular para no depender solo del IMC.
    - Evitar repetir nombres de campos en vista, servicio y validacion.

  Se conecta con:
    - src/features/control-corporal/inicio/inicio.service.js
    - src/features/control-corporal/inicio/inicio.validator.js
    - src/features/control-corporal/inicio/inicio.view.js
    - src/features/control-corporal/inicio/inicio.controller.js
*/

export const INICIO_STORAGE_KEYS = Object.freeze({
  COMPLETADO: "fitjeff:onboarding-completed"
});

export const INICIO_CAMPOS = Object.freeze({
  ALTURA_CM: "alturaCm",
  FECHA_NACIMIENTO: "fechaNacimiento",
  NIVEL_MUSCULAR: "nivelMuscular",
  PESO_INICIAL_KG: "pesoInicialKg",
  PESO_OBJETIVO_KG: "pesoObjetivoKg"
});

export const INICIO_OPCIONES = Object.freeze({
  nivelMuscular: [
    { value: "bajo", label: "Bajo / poco entrenamiento" },
    { value: "medio", label: "Medio / entreno regular" },
    { value: "alto", label: "Alto / mucha masa muscular" }
  ]
});

export const INICIO_TEXTOS = Object.freeze({
  TITULO: "Configura FitJeff",
  SUBTITULO: "Estos datos ayudan a que el análisis no dependa solo del peso o del IMC.",
  BOTON_GUARDAR: "Guardar y abrir Hoy",
  ERROR_GENERAL: "Revisa los datos antes de continuar.",
  EXITO: "Perfil inicial guardado. Abriendo Hoy."
});
