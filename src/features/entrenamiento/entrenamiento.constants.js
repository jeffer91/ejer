/*
  Nombre completo: entrenamiento.constants.js
  Ruta o ubicación: src/features/entrenamiento/entrenamiento.constants.js

  Función o funciones:
    - Centralizar claves locales, estados y tipos del módulo Entrenamiento.
    - Evitar textos y valores repetidos en repository, state y service.
    - Preparar el módulo para sincronización futura sin cambiar pantallas.
*/

export const ENTRENAMIENTO_STORAGE_KEYS = {
  RUTINAS: "fitjeff.entrenamiento.rutinas",
  SESIONES: "fitjeff.entrenamiento.sesiones",
  CARDIO: "fitjeff.entrenamiento.cardio",
  AJUSTES: "fitjeff.entrenamiento.ajustes",
  HISTORIAL: "fitjeff.entrenamiento.historial"
};

export const ENTRENAMIENTO_ESTADOS_RUTINA = {
  ACTIVA: "activa",
  INACTIVA: "inactiva"
};

export const ENTRENAMIENTO_ESTADOS_SESION = {
  PENDIENTE: "pendiente",
  INICIADA: "iniciada",
  COMPLETADA: "completada",
  CANCELADA: "cancelada"
};

export const ENTRENAMIENTO_TIPOS_CARDIO = {
  INTERVALOS: "intervalos",
  CAMINATA: "caminata",
  BICICLETA: "bicicleta",
  OTRO: "otro"
};

export const ENTRENAMIENTO_DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado"
];

export const ENTRENAMIENTO_LIMITES = {
  MIN_DIAS_RUTINA: 1,
  MAX_DIAS_RUTINA: 7,
  MAX_EJERCICIOS_POR_DIA: 20,
  MAX_SERIES: 20,
  MAX_REPETICIONES: 200
};
