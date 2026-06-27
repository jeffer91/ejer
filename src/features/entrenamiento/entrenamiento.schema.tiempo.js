/*
  Nombre completo: entrenamiento.schema.tiempo.js
  Ruta o ubicación: src/features/entrenamiento/entrenamiento.schema.tiempo.js

  Función o funciones:
    - Extender el esquema base para ejercicios medidos por tiempo.
    - Permitir bicicleta, caminata, movilidad, plancha y calentamientos sin series ni repeticiones obligatorias.
    - Mantener compatibilidad con rutinas antiguas ya guardadas.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.schema.js
    - src/features/entrenamiento/entrenamiento.repository.js
    - src/features/entrenamiento/entrenamiento.service.js
*/

import {
  normalizarAjustesEntrenamiento,
  normalizarCardioEntrenamiento,
  normalizarDetalleEjercicioSesion,
  normalizarEjercicioEntrenamiento as normalizarEjercicioBase,
  normalizarRutinaEntrenamiento as normalizarRutinaBase,
  normalizarSesionEntrenamiento as normalizarSesionBase
} from "./entrenamiento.schema.js";

const MEDICIONES = ["repeticiones", "tiempo", "mixto", "distancia"];

function numero(valor, defecto = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
}

function texto(valor, defecto = "") {
  return typeof valor === "string" ? valor.trim() : defecto;
}

function normalizarMedicion(datos = {}) {
  const medicion = texto(datos.medicion || datos.tipoMedicion || datos.unidadMedicion);
  const duracionMinutos = Math.max(numero(datos.duracionMinutos, 0), 0);
  const duracionSegundos = Math.max(numero(datos.duracionSegundos, 0), 0);
  const distanciaKm = datos.distanciaKm === null ? null : Math.max(numero(datos.distanciaKm, 0), 0);

  if (["tiempo", "mixto", "distancia"].includes(medicion)) return medicion;
  if (duracionMinutos > 0 || duracionSegundos > 0) return "tiempo";
  if (distanciaKm && distanciaKm > 0) return "distancia";
  return MEDICIONES.includes(medicion) ? medicion : "repeticiones";
}

export function normalizarEjercicioEntrenamiento(datos = {}) {
  const base = normalizarEjercicioBase(datos);
  const duracionMinutos = Math.max(numero(datos.duracionMinutos ?? base.duracionMinutos, 0), 0);
  const duracionSegundos = Math.max(numero(datos.duracionSegundos ?? base.duracionSegundos, 0), 0);
  const distanciaKm = datos.distanciaKm === null ? null : Math.max(numero(datos.distanciaKm ?? base.distanciaKm, 0), 0);
  const medicion = normalizarMedicion({ ...datos, ...base, duracionMinutos, duracionSegundos, distanciaKm });
  const usaTiempo = medicion === "tiempo" || medicion === "mixto";
  const usaRepeticiones = medicion === "repeticiones" || medicion === "mixto";

  return {
    ...base,
    medicion,
    series: usaRepeticiones ? Number(base.series || 0) : 0,
    repeticiones: usaRepeticiones ? Number(base.repeticiones || 0) : 0,
    duracionMinutos,
    duracionSegundos,
    distanciaKm,
    intensidad: texto(base.intensidad, "media"),
    usaTiempo,
    usaRepeticiones
  };
}

function normalizarDiaTiempo(dia = {}) {
  return {
    ...dia,
    ejercicios: Array.isArray(dia.ejercicios) ? dia.ejercicios.map(normalizarEjercicioEntrenamiento) : []
  };
}

export function normalizarRutinaEntrenamiento(datos = {}) {
  const rutina = normalizarRutinaBase(datos);

  return {
    ...rutina,
    dias: Array.isArray(rutina.dias) ? rutina.dias.map(normalizarDiaTiempo) : []
  };
}

export function normalizarSesionEntrenamiento(datos = {}) {
  const sesion = normalizarSesionBase(datos);

  return {
    ...sesion,
    detalleEjercicios: Array.isArray(sesion.detalleEjercicios)
      ? sesion.detalleEjercicios.map((detalle) => ({
        ...normalizarDetalleEjercicioSesion(detalle),
        medicion: MEDICIONES.includes(detalle.medicion) ? detalle.medicion : "repeticiones",
        tiempoCompletadoMinutos: Math.max(numero(detalle.tiempoCompletadoMinutos, 0), 0),
        tiempoCompletadoSegundos: Math.max(numero(detalle.tiempoCompletadoSegundos, 0), 0)
      }))
      : []
  };
}

export {
  normalizarAjustesEntrenamiento,
  normalizarCardioEntrenamiento
};
