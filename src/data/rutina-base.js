/*
  Nombre completo: rutina-base.js
  Ruta o ubicación: src/data/rutina-base.js

  Función:
    - Definir la rutina base de 4 días de FitJeff.
    - Entregar días, calentamientos, ejercicios, descansos y tipos de registro.
    - Dar funciones para clonar la rutina y obtener un día por número.

  Se conecta con:
    - src/storage/local-storage.service.js
    - src/entrenamiento/entrenamiento.service.js
    - src/vistas/entrenar.view.js
    - src/vistas/inicio.view.js
*/

export const TIPOS_EJERCICIO = {
  REPETICIONES: "repeticiones",
  TIEMPO: "tiempo",
  CARDIO: "cardio",
  HIIT: "hiit"
};

const CALENTAMIENTO_SUPERIOR = {
  duracionMin: 5,
  pasos: [
    { nombre: "Rotación de hombros", duracionSegundos: 45 },
    { nombre: "Aperturas de pecho", duracionSegundos: 45 },
    { nombre: "Rotación de muñecas y codos", duracionSegundos: 45 },
    { nombre: "Posición de oso estática", duracionSegundos: 45 },
    { nombre: "Flexiones suaves con rodillas", duracionSegundos: 60 },
    { nombre: "Agua y preparación", duracionSegundos: 60 }
  ]
};

export const RUTINA_BASE = {
  id: "rutina_fitjeff_4_dias",
  nombre: "Rutina FitJeff 4 días",
  version: "1.0.0",
  diaActual: 1,
  reglaSeguridad: "Prioriza técnica, control y descanso adecuado.",
  dias: [
    {
      numero: 1,
      nombre: "Pecho, tríceps y abdomen",
      nombreCorto: "Pecho + Tríceps",
      objetivo: "Tren superior con técnica controlada.",
      duracionEstimadaMin: 38,
      calentamiento: CALENTAMIENTO_SUPERIOR,
      ejercicios: [
        crearEjercicioSeries("flexiones_tradicionales", "Flexiones tradicionales", TIPOS_EJERCICIO.REPETICIONES, "repeticiones", 3, 90),
        crearEjercicioSeries("flexiones_diamante", "Flexiones diamante", TIPOS_EJERCICIO.REPETICIONES, "repeticiones", 3, 90),
        crearEjercicioSeries("fondos_silla", "Fondos en silla", TIPOS_EJERCICIO.REPETICIONES, "repeticiones", 3, 90),
        crearEjercicioSeries("plancha_abdominal", "Plancha abdominal", TIPOS_EJERCICIO.TIEMPO, "segundos", 3, 60)
      ]
    },
    {
      numero: 2,
      nombre: "Bicicleta moderada y abdomen",
      nombreCorto: "Bicicleta moderada",
      objetivo: "Cardio constante y abdomen.",
      duracionEstimadaMin: 53,
      calentamiento: { duracionMin: 3, pasos: [{ nombre: "Bicicleta suave", duracionSegundos: 180 }] },
      ejercicios: [
        crearCardio("bicicleta_moderada", "Bicicleta moderada", 48),
        crearEjercicioSeries("elevaciones_piernas", "Elevaciones de piernas", TIPOS_EJERCICIO.REPETICIONES, "repeticiones", 3, 60)
      ]
    },
    {
      numero: 3,
      nombre: "Espalda, bíceps y abdomen",
      nombreCorto: "Espalda + Bíceps",
      objetivo: "Espalda y bíceps con peso corporal.",
      duracionEstimadaMin: 38,
      calentamiento: CALENTAMIENTO_SUPERIOR,
      ejercicios: [
        crearEjercicioSeries("deslizamientos_suelo", "Deslizamientos en el suelo", TIPOS_EJERCICIO.REPETICIONES, "repeticiones", 3, 90),
        crearEjercicioSeries("superman", "Extensiones Superman", TIPOS_EJERCICIO.REPETICIONES, "repeticiones", 3, 90),
        crearEjercicioSeries("biceps_isometrico", "Bíceps isométricos sentados", TIPOS_EJERCICIO.TIEMPO, "segundos", 3, 90),
        crearEjercicioSeries("elevaciones_piernas_dia3", "Elevación de piernas", TIPOS_EJERCICIO.REPETICIONES, "repeticiones", 3, 60)
      ]
    },
    {
      numero: 4,
      nombre: "Bicicleta HIIT y abdomen",
      nombreCorto: "HIIT bicicleta",
      objetivo: "Cardio por intervalos con control.",
      duracionEstimadaMin: 31,
      calentamiento: { duracionMin: 3, pasos: [{ nombre: "Bicicleta suave", duracionSegundos: 180 }] },
      ejercicios: [
        crearHIIT("hiit_bicicleta", "HIIT bicicleta", 10, 45, 75),
        crearEjercicioSeries("crunch_clasico", "Crunch clásico", TIPOS_EJERCICIO.REPETICIONES, "repeticiones", 3, 75)
      ]
    }
  ]
};

export function clonarRutinaBase() {
  return structuredCloneSeguro(RUTINA_BASE);
}

export function obtenerDiaPorNumero(numeroDia = 1) {
  const numero = Number(numeroDia) || 1;
  return RUTINA_BASE.dias.find((dia) => Number(dia.numero) === numero) || RUTINA_BASE.dias[0];
}

export function obtenerSiguienteDia(numeroDia = 1) {
  const numero = Number(numeroDia) || 1;
  return numero >= RUTINA_BASE.dias.length ? 1 : numero + 1;
}

function crearEjercicioSeries(id, nombre, tipoRegistro, unidad, seriesObjetivo, descansoSegundos) {
  return {
    id,
    nombre,
    tipoRegistro,
    unidad,
    seriesObjetivo,
    descansoSegundos,
    instrucciones: "Registra el valor real de cada serie."
  };
}

function crearCardio(id, nombre, minutosObjetivo) {
  return {
    id,
    nombre,
    tipoRegistro: TIPOS_EJERCICIO.CARDIO,
    minutosObjetivo,
    instrucciones: "Registra minutos e intensidad real."
  };
}

function crearHIIT(id, nombre, rondasObjetivo, trabajoSegundos, recuperacionSegundos) {
  return {
    id,
    nombre,
    tipoRegistro: TIPOS_EJERCICIO.HIIT,
    rondasObjetivo,
    trabajoSegundos,
    recuperacionSegundos,
    instrucciones: "Registra rondas completadas."
  };
}

function structuredCloneSeguro(valor) {
  if (typeof structuredClone === "function") {
    return structuredClone(valor);
  }

  return JSON.parse(JSON.stringify(valor));
}
