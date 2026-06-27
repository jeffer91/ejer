/*
  Nombre completo: rutinas.validator.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.validator.js

  Función o funciones:
    - Validar datos del formulario de Rutinas.
    - Evitar rutinas sin nombre, sin días o sin ejercicios reales.
    - Permitir rutinas por tiempo sin exigir series ni repeticiones.
    - Mantener mensajes simples para mostrar en pantalla.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.service.js
*/

import { ENTRENAMIENTO_LIMITES } from "../entrenamiento.constants.js";

function numero(valor, defecto = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
}

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function esTituloDia(linea) {
  return /^d[ií]a\s*\d*\s*[:.-]?$/i.test(linea) || /^d[ií]a\s*\d+\s*[:.-]?\s*.+$/i.test(linea);
}

function contarEjerciciosReales(ejerciciosTexto) {
  return texto(ejerciciosTexto)
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean)
    .filter((linea) => !esTituloDia(linea)).length;
}

function contieneTiempoEnTexto(ejerciciosTexto = "") {
  return /\d+(?:[.,]\d+)?\s*(min|minuto|minutos|seg|segundo|segundos|s)\b/i.test(texto(ejerciciosTexto)) || /duraci[oó]n\s*[:=]/i.test(texto(ejerciciosTexto));
}

export function validarFormularioRutina(datos = {}) {
  const errores = [];
  const nombre = texto(datos.nombre);
  const totalDias = numero(datos.totalDias, 0);
  const ejerciciosTexto = texto(datos.ejerciciosTexto);
  const totalEjercicios = contarEjerciciosReales(ejerciciosTexto);
  const series = numero(datos.series, 0);
  const repeticiones = numero(datos.repeticiones, 0);
  const duracionMinutos = numero(datos.duracionMinutos, 0);
  const medicion = texto(datos.medicion || datos.tipoMedicion || "repeticiones");
  const usaTiempo = medicion === "tiempo" || medicion === "mixto" || duracionMinutos > 0 || contieneTiempoEnTexto(ejerciciosTexto);
  const usaRepeticiones = medicion === "repeticiones" || medicion === "mixto" || !usaTiempo;

  if (!nombre) {
    errores.push("Escribe un nombre para la rutina.");
  }

  if (totalDias < ENTRENAMIENTO_LIMITES.MIN_DIAS_RUTINA || totalDias > ENTRENAMIENTO_LIMITES.MAX_DIAS_RUTINA) {
    errores.push(`Los días deben estar entre ${ENTRENAMIENTO_LIMITES.MIN_DIAS_RUTINA} y ${ENTRENAMIENTO_LIMITES.MAX_DIAS_RUTINA}.`);
  }

  if (!ejerciciosTexto || totalEjercicios < 1) {
    errores.push("Agrega al menos un ejercicio real. Los títulos como Día 1 no cuentan como ejercicio.");
  }

  if (totalEjercicios > ENTRENAMIENTO_LIMITES.MAX_DIAS_RUTINA * ENTRENAMIENTO_LIMITES.MAX_EJERCICIOS_POR_DIA) {
    errores.push("La rutina tiene demasiados ejercicios para una primera versión.");
  }

  if (usaRepeticiones && (series < 1 || series > ENTRENAMIENTO_LIMITES.MAX_SERIES)) {
    errores.push(`Las series deben estar entre 1 y ${ENTRENAMIENTO_LIMITES.MAX_SERIES}.`);
  }

  if (usaRepeticiones && (repeticiones < 1 || repeticiones > ENTRENAMIENTO_LIMITES.MAX_REPETICIONES)) {
    errores.push(`Las repeticiones deben estar entre 1 y ${ENTRENAMIENTO_LIMITES.MAX_REPETICIONES}.`);
  }

  if (medicion === "tiempo" && duracionMinutos <= 0 && !contieneTiempoEnTexto(ejerciciosTexto)) {
    errores.push("Para ejercicios por tiempo, agrega duración en minutos o escríbela en cada línea. Ejemplo: Bicicleta | duracion=10min.");
  }

  return {
    ok: errores.length === 0,
    errores
  };
}
