/*
  Nombre completo: rutinas.mapper.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.mapper.js

  Función o funciones:
    - Convertir texto del formulario en días de rutina.
    - Permitir ejercicios iguales para todos los días o bloques por día.
    - Calcular totales de una rutina para mostrar en pantalla.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.service.js
    - src/features/entrenamiento/rutinas/rutinas.view.js
*/

import { crearDiaRutinaBase, crearEjercicioEntrenamientoBase } from "../entrenamiento.state.js";

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function numero(valor, defecto = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

function dividirLineas(valor) {
  return texto(valor)
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);
}

function esTituloDia(linea) {
  return /^d[ií]a\s*\d*\s*[:.-]?$/i.test(linea) || /^d[ií]a\s*\d+\s*[:.-]?\s*.+$/i.test(linea);
}

function limpiarTituloDia(linea, indice) {
  const limpio = texto(linea).replace(/[:.-]\s*$/, "");
  return limpio || `Día ${indice + 1}`;
}

function crearEjercicios(nombres, series, repeticiones, descansoSegundos) {
  return nombres.map((nombre) => crearEjercicioEntrenamientoBase({
    nombre,
    series,
    repeticiones,
    descansoSegundos
  }));
}

function crearDiasConMismosEjercicios({ totalDias, ejercicios, calentamiento, descansoSegundos, series, repeticiones }) {
  return Array.from({ length: totalDias }, (_, indice) => crearDiaRutinaBase({
    nombre: `Día ${indice + 1}`,
    orden: indice + 1,
    calentamiento,
    descansoGeneralSegundos: descansoSegundos,
    ejercicios: crearEjercicios(ejercicios, series, repeticiones, descansoSegundos)
  }));
}

function crearDiasPorBloques({ lineas, totalDias, calentamiento, descansoSegundos, series, repeticiones }) {
  const bloques = [];
  let actual = null;

  lineas.forEach((linea) => {
    if (esTituloDia(linea)) {
      actual = {
        nombre: limpiarTituloDia(linea, bloques.length),
        ejercicios: []
      };
      bloques.push(actual);
      return;
    }

    if (!actual) {
      actual = {
        nombre: `Día ${bloques.length + 1}`,
        ejercicios: []
      };
      bloques.push(actual);
    }

    actual.ejercicios.push(linea);
  });

  return bloques
    .slice(0, totalDias)
    .map((bloque, indice) => crearDiaRutinaBase({
      nombre: bloque.nombre || `Día ${indice + 1}`,
      orden: indice + 1,
      calentamiento,
      descansoGeneralSegundos: descansoSegundos,
      ejercicios: crearEjercicios(bloque.ejercicios, series, repeticiones, descansoSegundos)
    }));
}

export function crearDiasRutinaDesdeFormulario(datos = {}) {
  const totalDias = limitar(numero(datos.totalDias, 1), 1, 7);
  const lineas = dividirLineas(datos.ejerciciosTexto);
  const calentamiento = texto(datos.calentamiento);
  const descansoSegundos = numero(datos.descansoSegundos, 60);
  const series = numero(datos.series, 3);
  const repeticiones = numero(datos.repeticiones, 10);
  const tieneBloques = lineas.some(esTituloDia);

  if (tieneBloques) {
    const dias = crearDiasPorBloques({ lineas, totalDias, calentamiento, descansoSegundos, series, repeticiones });
    return dias.length ? dias : crearDiasConMismosEjercicios({ totalDias, ejercicios: lineas, calentamiento, descansoSegundos, series, repeticiones });
  }

  return crearDiasConMismosEjercicios({ totalDias, ejercicios: lineas, calentamiento, descansoSegundos, series, repeticiones });
}

export function calcularTotalesRutina(rutina = {}) {
  const dias = Array.isArray(rutina.dias) ? rutina.dias : [];
  const ejercicios = dias.reduce((total, dia) => total + (dia.ejercicios || []).length, 0);
  const series = dias.reduce((total, dia) => {
    return total + (dia.ejercicios || []).reduce((sub, ejercicio) => sub + Number(ejercicio.series || 0), 0);
  }, 0);

  return {
    dias: dias.length,
    ejercicios,
    series
  };
}

export function describirRutina(rutina = {}) {
  return (rutina.dias || []).map((dia) => ({
    id: dia.id,
    nombre: dia.nombre,
    ejercicios: (dia.ejercicios || []).map((ejercicio) => ejercicio.nombre)
  }));
}
