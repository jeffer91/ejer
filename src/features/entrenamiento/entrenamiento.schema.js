/*
  Nombre completo: entrenamiento.schema.js
  Ruta o ubicación: src/features/entrenamiento/entrenamiento.schema.js

  Función o funciones:
    - Normalizar rutinas, sesiones, cardio y ajustes antes de guardar.
    - Evitar datos incompletos o tipos incorrectos en localStorage.
    - Mantener reglas simples para crecer luego hacia Firebase.
*/

import {
  ENTRENAMIENTO_ESTADOS_RUTINA,
  ENTRENAMIENTO_ESTADOS_SESION,
  ENTRENAMIENTO_TIPOS_CARDIO,
  ENTRENAMIENTO_LIMITES
} from "./entrenamiento.constants.js";
import {
  crearAjustesEntrenamientoBase,
  crearCardioEntrenamientoBase,
  crearDiaRutinaBase,
  crearEjercicioEntrenamientoBase,
  crearRutinaEntrenamientoBase,
  crearSesionEntrenamientoBase
} from "./entrenamiento.state.js";

function texto(valor, defecto = "") {
  return typeof valor === "string" ? valor.trim() : defecto;
}

function numero(valor, defecto = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

function lista(valor) {
  return Array.isArray(valor) ? valor : [];
}

export function normalizarEjercicioEntrenamiento(datos = {}) {
  const base = crearEjercicioEntrenamientoBase(datos);

  return {
    ...base,
    nombre: texto(base.nombre, "Ejercicio"),
    series: limitar(numero(base.series, 3), 1, ENTRENAMIENTO_LIMITES.MAX_SERIES),
    repeticiones: limitar(numero(base.repeticiones, 10), 1, ENTRENAMIENTO_LIMITES.MAX_REPETICIONES),
    descansoSegundos: limitar(numero(base.descansoSegundos, 60), 0, 600),
    notas: texto(base.notas),
    completado: Boolean(base.completado)
  };
}

export function normalizarDiaRutinaEntrenamiento(datos = {}, indice = 0) {
  const base = crearDiaRutinaBase(datos);

  return {
    ...base,
    nombre: texto(base.nombre, `Día ${indice + 1}`),
    orden: indice + 1,
    calentamiento: texto(base.calentamiento),
    descansoGeneralSegundos: limitar(numero(base.descansoGeneralSegundos, 60), 0, 600),
    ejercicios: lista(base.ejercicios).slice(0, ENTRENAMIENTO_LIMITES.MAX_EJERCICIOS_POR_DIA).map(normalizarEjercicioEntrenamiento)
  };
}

export function normalizarRutinaEntrenamiento(datos = {}) {
  const base = crearRutinaEntrenamientoBase(datos);
  const dias = lista(base.dias)
    .slice(0, ENTRENAMIENTO_LIMITES.MAX_DIAS_RUTINA)
    .map(normalizarDiaRutinaEntrenamiento);

  return {
    ...base,
    nombre: texto(base.nombre, "Rutina"),
    estado: Object.values(ENTRENAMIENTO_ESTADOS_RUTINA).includes(base.estado)
      ? base.estado
      : ENTRENAMIENTO_ESTADOS_RUTINA.INACTIVA,
    dias: dias.length > 0 ? dias : [normalizarDiaRutinaEntrenamiento({}, 0)],
    actualizadoEn: new Date().toISOString()
  };
}

export function normalizarSesionEntrenamiento(datos = {}) {
  const base = crearSesionEntrenamientoBase(datos);

  return {
    ...base,
    estado: Object.values(ENTRENAMIENTO_ESTADOS_SESION).includes(base.estado)
      ? base.estado
      : ENTRENAMIENTO_ESTADOS_SESION.PENDIENTE,
    ejerciciosCompletados: Math.max(numero(base.ejerciciosCompletados, 0), 0),
    seriesCompletadas: Math.max(numero(base.seriesCompletadas, 0), 0),
    repeticionesCompletadas: Math.max(numero(base.repeticionesCompletadas, 0), 0),
    tiempoMinutos: Math.max(numero(base.tiempoMinutos, 0), 0),
    notas: texto(base.notas),
    actualizadoEn: new Date().toISOString()
  };
}

export function normalizarCardioEntrenamiento(datos = {}) {
  const base = crearCardioEntrenamientoBase(datos);

  return {
    ...base,
    tipo: Object.values(ENTRENAMIENTO_TIPOS_CARDIO).includes(base.tipo)
      ? base.tipo
      : ENTRENAMIENTO_TIPOS_CARDIO.OTRO,
    tiempoMinutos: Math.max(numero(base.tiempoMinutos, 0), 0),
    distanciaKm: base.distanciaKm === null ? null : Math.max(numero(base.distanciaKm, 0), 0),
    rondas: Math.max(numero(base.rondas, 0), 0),
    actividadSegundos: Math.max(numero(base.actividadSegundos, 0), 0),
    descansoSegundos: Math.max(numero(base.descansoSegundos, 0), 0),
    intensidad: texto(base.intensidad, "media"),
    notas: texto(base.notas),
    actualizadoEn: new Date().toISOString()
  };
}

export function normalizarAjustesEntrenamiento(datos = {}) {
  const base = crearAjustesEntrenamientoBase(datos);

  return {
    ...base,
    geminiApiKey: texto(base.geminiApiKey),
    iaActiva: Boolean(base.iaActiva),
    vozActiva: Boolean(base.vozActiva),
    vozNombre: texto(base.vozNombre),
    volumenVoz: limitar(numero(base.volumenVoz, 1), 0, 1),
    velocidadVoz: limitar(numero(base.velocidadVoz, 1), 0.5, 2),
    actualizadoEn: new Date().toISOString()
  };
}
