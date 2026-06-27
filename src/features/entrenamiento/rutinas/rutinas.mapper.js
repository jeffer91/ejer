/*
  Nombre completo: rutinas.mapper.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.mapper.js

  Función o funciones:
    - Convertir texto del formulario en días de rutina.
    - Permitir ejercicios iguales para todos los días o bloques por día.
    - Detectar ejercicios por repeticiones, por tiempo o mixtos.
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

function convertirMinutos(valor = "") {
  const limpio = texto(valor).toLowerCase().replace(",", ".");
  const numeroDetectado = Number((limpio.match(/\d+(?:\.\d+)?/) || [])[0]);

  if (!Number.isFinite(numeroDetectado)) return 0;
  if (/seg|segundo|segundos|\bs\b/.test(limpio) && !/min/.test(limpio)) return Math.round((numeroDetectado / 60) * 100) / 100;
  return numeroDetectado;
}

function extraerDuracionDeTexto(valor = "") {
  const limpio = texto(valor);
  const matchDuracion = limpio.match(/(?:duraci[oó]n\s*[:=]\s*)?(\d+(?:[.,]\d+)?)\s*(min|minuto|minutos|seg|segundo|segundos|s)\b/i);

  if (!matchDuracion) {
    return {
      nombre: limpio,
      duracionMinutos: 0
    };
  }

  const duracionMinutos = convertirMinutos(`${matchDuracion[1]}${matchDuracion[2]}`);
  const nombre = limpio.replace(matchDuracion[0], "").replace(/[|,-]\s*$/, "").trim();

  return {
    nombre: nombre || limpio,
    duracionMinutos
  };
}

function leerClaveValor(valor = "") {
  const indice = valor.indexOf("=");
  if (indice === -1) return null;

  return {
    clave: valor.slice(0, indice).trim().toLowerCase().replace(/\s+/g, "_"),
    valor: valor.slice(indice + 1).trim()
  };
}

function parsearLineaEjercicio(linea, base = {}) {
  const partes = texto(linea).split("|").map((parte) => parte.trim()).filter(Boolean);
  const primeraParte = partes.shift() || "Ejercicio";
  const nombreConDuracion = extraerDuracionDeTexto(primeraParte);
  const datos = {
    nombre: nombreConDuracion.nombre,
    duracionMinutos: nombreConDuracion.duracionMinutos,
    series: base.series,
    repeticiones: base.repeticiones,
    descansoSegundos: base.descansoSegundos,
    medicion: base.medicion,
    intensidad: base.intensidad || "media",
    notas: ""
  };

  partes.forEach((parte) => {
    const par = leerClaveValor(parte);
    if (!par) {
      const duracion = extraerDuracionDeTexto(parte);
      if (duracion.duracionMinutos > 0) datos.duracionMinutos = duracion.duracionMinutos;
      else datos.notas = datos.notas ? `${datos.notas} · ${parte}` : parte;
      return;
    }

    if (["duracion", "duracion_minutos", "tiempo", "minutos"].includes(par.clave)) datos.duracionMinutos = convertirMinutos(par.valor);
    if (["series", "serie"].includes(par.clave)) datos.series = numero(par.valor, datos.series);
    if (["repeticiones", "reps", "rep"].includes(par.clave)) datos.repeticiones = numero(par.valor, datos.repeticiones);
    if (["descanso", "descanso_segundos"].includes(par.clave)) datos.descansoSegundos = Math.round(convertirMinutos(par.valor) * 60) || numero(par.valor, datos.descansoSegundos);
    if (["medicion", "tipo_medicion", "unidad"].includes(par.clave)) datos.medicion = par.valor;
    if (par.clave === "intensidad") datos.intensidad = par.valor;
    if (par.clave === "notas") datos.notas = par.valor;
  });

  if (datos.duracionMinutos > 0 && datos.medicion === "repeticiones") {
    datos.medicion = datos.series > 0 && datos.repeticiones > 0 ? "mixto" : "tiempo";
  }

  if (datos.medicion === "tiempo") {
    datos.series = 0;
    datos.repeticiones = 0;
  }

  return datos;
}

function crearEjercicios(lineas, opciones) {
  return lineas.map((linea) => {
    const ejercicio = parsearLineaEjercicio(linea, opciones);

    return crearEjercicioEntrenamientoBase({
      nombre: ejercicio.nombre,
      medicion: ejercicio.medicion,
      series: ejercicio.series,
      repeticiones: ejercicio.repeticiones,
      descansoSegundos: ejercicio.descansoSegundos,
      duracionMinutos: ejercicio.duracionMinutos,
      intensidad: ejercicio.intensidad,
      notas: ejercicio.notas
    });
  });
}

function crearDiasConMismosEjercicios({ totalDias, ejercicios, calentamiento, descansoSegundos, series, repeticiones, duracionMinutos, medicion }) {
  const opciones = { descansoSegundos, series, repeticiones, duracionMinutos, medicion, intensidad: "media" };

  return Array.from({ length: totalDias }, (_, indice) => crearDiaRutinaBase({
    nombre: `Día ${indice + 1}`,
    orden: indice + 1,
    calentamiento,
    descansoGeneralSegundos: descansoSegundos,
    ejercicios: crearEjercicios(ejercicios, opciones)
  }));
}

function crearDiasPorBloques({ lineas, totalDias, calentamiento, descansoSegundos, series, repeticiones, duracionMinutos, medicion }) {
  const bloques = [];
  const opciones = { descansoSegundos, series, repeticiones, duracionMinutos, medicion, intensidad: "media" };
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
      ejercicios: crearEjercicios(bloque.ejercicios, opciones)
    }));
}

export function crearDiasRutinaDesdeFormulario(datos = {}) {
  const totalDias = limitar(numero(datos.totalDias, 1), 1, 7);
  const lineas = dividirLineas(datos.ejerciciosTexto);
  const calentamiento = texto(datos.calentamiento);
  const descansoSegundos = numero(datos.descansoSegundos, 60);
  const series = numero(datos.series, 3);
  const repeticiones = numero(datos.repeticiones, 10);
  const duracionMinutos = Math.max(numero(datos.duracionMinutos, 0), 0);
  const medicion = texto(datos.medicion || datos.tipoMedicion, duracionMinutos > 0 ? "tiempo" : "repeticiones") || "repeticiones";
  const tieneBloques = lineas.some(esTituloDia);

  if (tieneBloques) {
    const dias = crearDiasPorBloques({ lineas, totalDias, calentamiento, descansoSegundos, series, repeticiones, duracionMinutos, medicion });
    return dias.length ? dias : crearDiasConMismosEjercicios({ totalDias, ejercicios: lineas, calentamiento, descansoSegundos, series, repeticiones, duracionMinutos, medicion });
  }

  return crearDiasConMismosEjercicios({ totalDias, ejercicios: lineas, calentamiento, descansoSegundos, series, repeticiones, duracionMinutos, medicion });
}

export function calcularTotalesRutina(rutina = {}) {
  const dias = Array.isArray(rutina.dias) ? rutina.dias : [];
  const ejercicios = dias.reduce((total, dia) => total + (dia.ejercicios || []).length, 0);
  const series = dias.reduce((total, dia) => {
    return total + (dia.ejercicios || []).reduce((sub, ejercicio) => sub + Number(ejercicio.series || 0), 0);
  }, 0);
  const tiempoMinutos = dias.reduce((total, dia) => {
    return total + (dia.ejercicios || []).reduce((sub, ejercicio) => sub + Number(ejercicio.duracionMinutos || 0), 0);
  }, 0);

  return {
    dias: dias.length,
    ejercicios,
    series,
    tiempoMinutos
  };
}

export function describirRutina(rutina = {}) {
  return (rutina.dias || []).map((dia) => ({
    id: dia.id,
    nombre: dia.nombre,
    ejercicios: (dia.ejercicios || []).map((ejercicio) => ejercicio.nombre)
  }));
}
