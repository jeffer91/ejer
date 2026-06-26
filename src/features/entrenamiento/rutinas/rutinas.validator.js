/*
  Nombre completo: rutinas.validator.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.validator.js

  Función o funciones:
    - Validar datos del formulario de Rutinas.
    - Evitar rutinas sin nombre, sin días o sin ejercicios.
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

export function validarFormularioRutina(datos = {}) {
  const errores = [];
  const nombre = texto(datos.nombre);
  const totalDias = numero(datos.totalDias, 0);
  const ejerciciosTexto = texto(datos.ejerciciosTexto);
  const series = numero(datos.series, 0);
  const repeticiones = numero(datos.repeticiones, 0);

  if (!nombre) {
    errores.push("Escribe un nombre para la rutina.");
  }

  if (totalDias < ENTRENAMIENTO_LIMITES.MIN_DIAS_RUTINA || totalDias > ENTRENAMIENTO_LIMITES.MAX_DIAS_RUTINA) {
    errores.push(`Los días deben estar entre ${ENTRENAMIENTO_LIMITES.MIN_DIAS_RUTINA} y ${ENTRENAMIENTO_LIMITES.MAX_DIAS_RUTINA}.`);
  }

  if (!ejerciciosTexto) {
    errores.push("Agrega al menos un ejercicio.");
  }

  if (series < 1 || series > ENTRENAMIENTO_LIMITES.MAX_SERIES) {
    errores.push(`Las series deben estar entre 1 y ${ENTRENAMIENTO_LIMITES.MAX_SERIES}.`);
  }

  if (repeticiones < 1 || repeticiones > ENTRENAMIENTO_LIMITES.MAX_REPETICIONES) {
    errores.push(`Las repeticiones deben estar entre 1 y ${ENTRENAMIENTO_LIMITES.MAX_REPETICIONES}.`);
  }

  return {
    ok: errores.length === 0,
    errores
  };
}
