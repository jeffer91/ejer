/*
  Nombre completo: rutinas.parser.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.parser.js

  Función o funciones:
    - Interpretar respuestas de IA generadas con el contrato FITJEFF_RUTINA_V1.
    - Separar rutina, días, bloques y ejercicios.
    - Detectar fuerza, cardio, fútbol, movilidad, técnica, core y otros bloques.
    - Normalizar campos clave para que luego el controller y service puedan guardar la rutina.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.prompt.js
    - src/features/entrenamiento/rutinas/rutinas.controller.js
    - src/features/entrenamiento/rutinas/rutinas.service.js
*/

import { FITJEFF_RUTINA_FORMAT_VERSION } from "./rutinas.prompt.js";

export const TIPOS_BLOQUE_RUTINA_IA = [
  "fuerza",
  "cardio",
  "futbol",
  "movilidad",
  "tecnica",
  "core",
  "calentamiento",
  "descanso_activo",
  "otro"
];

const MARCADORES = {
  RUTINA: "[RUTINA]",
  FIN_RUTINA_DATOS: "[FIN_RUTINA_DATOS]",
  DIA: "[DIA]",
  FIN_DIA: "[FIN_DIA]",
  BLOQUE: "[BLOQUE]",
  FIN_BLOQUE: "[FIN_BLOQUE]",
  FIN_RUTINA: "FIN_RUTINA"
};

const CLAVES_EJERCICIO = [
  "ejercicio",
  "tipo",
  "series",
  "repeticiones",
  "descanso",
  "duracion",
  "intensidad",
  "notas"
];

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function quitarAcentos(valor) {
  return texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizarClave(clave) {
  return quitarAcentos(clave).toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

function normalizarTipo(valor = "") {
  const limpio = quitarAcentos(valor).toLowerCase().replace(/\s+/g, "_");

  if (TIPOS_BLOQUE_RUTINA_IA.includes(limpio)) return limpio;
  if (["football", "futbol", "futbolistico", "balon"].includes(limpio)) return "futbol";
  if (["tecnico", "tecnica_deportiva", "coordinacion", "agilidad"].includes(limpio)) return "tecnica";
  if (["movilidad_articular", "estiramiento", "estiramientos"].includes(limpio)) return "movilidad";
  if (["abdomen", "abdominales"].includes(limpio)) return "core";
  if (["calentar", "activacion", "activacion_muscular"].includes(limpio)) return "calentamiento";
  if (["descanso", "recuperacion", "recuperacion_activa"].includes(limpio)) return "descanso_activo";

  return "otro";
}

function inferirTipoPorTexto(valor = "") {
  const limpio = quitarAcentos(valor).toLowerCase();

  if (/\b(caminata|trote|correr|carrera|bicicleta|bici|cuerda|cardio|eliptica|remo\s+cardio)\b/.test(limpio)) return "cardio";
  if (/\b(futbol|balon|pase|pases|tiro|tiros|conduccion|dribling|regate|cancha|coordinacion|agilidad)\b/.test(limpio)) return "futbol";
  if (/\b(movilidad|estiramiento|estiramientos|flexibilidad|activacion|articular)\b/.test(limpio)) return "movilidad";
  if (/\b(plancha|abdominal|abdominales|core|crunch|elevacion\s+de\s+piernas)\b/.test(limpio)) return "core";
  if (/\b(sentadilla|sentadillas|flexion|flexiones|peso\s+muerto|press|remo|curl|zancada|zancadas|dominada|dominadas|hip\s+thrust|mancuerna|barra|maquina)\b/.test(limpio)) return "fuerza";

  return "otro";
}

function normalizarLineas(textoFuente = "") {
  return texto(textoFuente)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);
}

function extraerBloqueCompatible(textoFuente = "", advertencias = []) {
  const contenido = texto(textoFuente);
  const inicio = contenido.indexOf(FITJEFF_RUTINA_FORMAT_VERSION);
  const fin = contenido.lastIndexOf(MARCADORES.FIN_RUTINA);

  if (inicio === -1) {
    advertencias.push("No se encontró FITJEFF_RUTINA_V1. Se intentará interpretar el texto completo.");
    return contenido;
  }

  if (fin === -1) {
    advertencias.push("No se encontró FIN_RUTINA. Se interpretará desde FITJEFF_RUTINA_V1 hasta el final del texto.");
    return contenido.slice(inicio);
  }

  return contenido.slice(inicio, fin + MARCADORES.FIN_RUTINA.length);
}

function leerClaveValor(linea = "") {
  const indice = linea.indexOf("=");
  if (indice === -1) return null;

  const clave = normalizarClave(linea.slice(0, indice));
  const valor = texto(linea.slice(indice + 1));

  if (!clave) return null;
  return { clave, valor };
}

function asignarClave(objetivo, linea) {
  const par = leerClaveValor(linea);
  if (!par) return false;

  objetivo[par.clave] = par.valor;
  return true;
}

function convertirSegundos(valor = "") {
  const limpio = quitarAcentos(valor).toLowerCase();
  const numero = Number((limpio.match(/\d+(?:[.,]\d+)?/) || [])[0]?.replace(",", "."));

  if (!Number.isFinite(numero)) return null;
  if (/min|minuto|minutos/.test(limpio)) return Math.round(numero * 60);
  return Math.round(numero);
}

function convertirMinutos(valor = "") {
  const limpio = quitarAcentos(valor).toLowerCase();
  const numero = Number((limpio.match(/\d+(?:[.,]\d+)?/) || [])[0]?.replace(",", "."));

  if (!Number.isFinite(numero)) return null;
  if (/seg|segundo|segundos|s\b/.test(limpio) && !/min/.test(limpio)) return Math.round(numero / 60);
  return Math.round(numero);
}

function convertirNumero(valor = "") {
  const numero = Number(texto(valor).replace(",", "."));
  return Number.isFinite(numero) ? numero : null;
}

function crearRutinaBase() {
  return {
    formatoVersion: FITJEFF_RUTINA_FORMAT_VERSION,
    nombre: "",
    objetivo: "",
    nivel: "",
    lugar: "",
    equipo: "",
    diasDeclarados: null,
    duracionSesion: "",
    notasGenerales: "",
    dias: []
  };
}

function crearDiaBase(indice = 0) {
  return {
    numero: indice + 1,
    nombre: `Día ${indice + 1}`,
    enfoque: "",
    calentamiento: "",
    bloques: [],
    ejercicios: []
  };
}

function crearBloqueBase() {
  return {
    tipo: "otro",
    nombre: "",
    ejercicios: []
  };
}

function parsearEjercicio(linea = "", bloqueActual = {}) {
  const limpio = texto(linea).replace(/^[-•]\s*/, "");
  const partes = limpio.split("|").map((parte) => parte.trim()).filter(Boolean);
  const datos = {};

  partes.forEach((parte, indice) => {
    const par = leerClaveValor(parte);

    if (par) {
      datos[par.clave] = par.valor;
      return;
    }

    if (indice === 0 && !datos.ejercicio) {
      datos.ejercicio = parte;
    }
  });

  const nombre = texto(datos.ejercicio || datos.nombre || limpio);
  const tipoBase = datos.tipo || bloqueActual.tipo || inferirTipoPorTexto(`${bloqueActual.nombre} ${nombre}`);
  const tipo = normalizarTipo(tipoBase === "otro" ? inferirTipoPorTexto(`${bloqueActual.nombre} ${nombre}`) : tipoBase);
  const series = convertirNumero(datos.series);
  const repeticiones = convertirNumero(datos.repeticiones);
  const descansoSegundos = convertirSegundos(datos.descanso);
  const duracionMinutos = convertirMinutos(datos.duracion);

  return {
    nombre,
    tipo,
    bloque: bloqueActual.nombre || tipo,
    series,
    repeticiones,
    descanso: texto(datos.descanso),
    descansoSegundos,
    duracion: texto(datos.duracion),
    duracionMinutos,
    intensidad: texto(datos.intensidad),
    notas: texto(datos.notas),
    fuente: linea,
    camposOriginales: CLAVES_EJERCICIO.reduce((acumulado, clave) => {
      acumulado[clave] = datos[clave] ?? "";
      return acumulado;
    }, {})
  };
}

function cerrarBloque(diaActual, bloqueActual) {
  if (!diaActual || !bloqueActual) return;

  if (!bloqueActual.tipo || bloqueActual.tipo === "otro") {
    bloqueActual.tipo = normalizarTipo(inferirTipoPorTexto(`${bloqueActual.nombre} ${(bloqueActual.ejercicios || []).map((ejercicio) => ejercicio.nombre).join(" ")}`));
  }

  diaActual.bloques.push(bloqueActual);
  diaActual.ejercicios.push(...bloqueActual.ejercicios);
}

function crearResumen(rutina) {
  const tipos = {};
  const totalBloques = rutina.dias.reduce((total, dia) => total + dia.bloques.length, 0);
  const totalEjercicios = rutina.dias.reduce((total, dia) => total + dia.ejercicios.length, 0);

  rutina.dias.forEach((dia) => {
    dia.bloques.forEach((bloque) => {
      tipos[bloque.tipo] = (tipos[bloque.tipo] || 0) + 1;
    });
  });

  return {
    dias: rutina.dias.length,
    bloques: totalBloques,
    ejercicios: totalEjercicios,
    tipos
  };
}

function validarResultado(rutina, errores, advertencias) {
  if (!rutina.nombre) advertencias.push("La rutina no tiene nombre. Se podrá asignar uno automáticamente después.");
  if (rutina.dias.length === 0) errores.push("No se detectaron días de entrenamiento.");

  rutina.dias.forEach((dia) => {
    if (dia.bloques.length === 0) errores.push(`${dia.nombre} no tiene bloques.`);
    if (dia.ejercicios.length === 0) errores.push(`${dia.nombre} no tiene ejercicios.`);

    dia.ejercicios.forEach((ejercicio) => {
      if (!ejercicio.nombre) errores.push(`${dia.nombre} tiene un ejercicio sin nombre.`);
      if (ejercicio.tipo === "cardio" && !ejercicio.duracionMinutos && !ejercicio.series) {
        advertencias.push(`${ejercicio.nombre || "Cardio"} no tiene duración ni series.`);
      }
      if ((ejercicio.tipo === "futbol" || ejercicio.tipo === "tecnica") && !ejercicio.duracionMinutos && !ejercicio.repeticiones) {
        advertencias.push(`${ejercicio.nombre || "Actividad técnica"} no tiene duración ni repeticiones.`);
      }
    });
  });
}

export function interpretarRutinaIA(textoFuente = "") {
  const errores = [];
  const advertencias = [];
  const rutina = crearRutinaBase();
  const contenido = extraerBloqueCompatible(textoFuente, advertencias);
  const lineas = normalizarLineas(contenido);
  let seccion = null;
  let diaActual = null;
  let bloqueActual = null;

  lineas.forEach((linea) => {
    if (linea === FITJEFF_RUTINA_FORMAT_VERSION || linea === MARCADORES.FIN_RUTINA) return;

    if (linea === MARCADORES.RUTINA) {
      seccion = "rutina";
      return;
    }

    if (linea === MARCADORES.FIN_RUTINA_DATOS) {
      seccion = null;
      return;
    }

    if (linea === MARCADORES.DIA) {
      cerrarBloque(diaActual, bloqueActual);
      bloqueActual = null;
      diaActual = crearDiaBase(rutina.dias.length);
      rutina.dias.push(diaActual);
      seccion = "dia";
      return;
    }

    if (linea === MARCADORES.FIN_DIA) {
      cerrarBloque(diaActual, bloqueActual);
      bloqueActual = null;
      diaActual = null;
      seccion = null;
      return;
    }

    if (linea === MARCADORES.BLOQUE) {
      if (!diaActual) {
        diaActual = crearDiaBase(rutina.dias.length);
        rutina.dias.push(diaActual);
        advertencias.push(`Se encontró un bloque sin [DIA]. Se creó ${diaActual.nombre}.`);
      }

      cerrarBloque(diaActual, bloqueActual);
      bloqueActual = crearBloqueBase();
      seccion = "bloque";
      return;
    }

    if (linea === MARCADORES.FIN_BLOQUE) {
      cerrarBloque(diaActual, bloqueActual);
      bloqueActual = null;
      seccion = diaActual ? "dia" : null;
      return;
    }

    if (seccion === "rutina") {
      const anterior = { ...rutina };
      if (asignarClave(rutina, linea)) {
        rutina.diasDeclarados = convertirNumero(rutina.dias) || rutina.diasDeclarados;
        rutina.duracionSesion = rutina.duracion_sesion || rutina.duracionSesion;
        rutina.notasGenerales = rutina.notas_generales || rutina.notasGenerales;
        rutina.dias = anterior.dias;
      }
      return;
    }

    if (seccion === "dia" && diaActual) {
      const par = leerClaveValor(linea);
      if (!par) return;

      if (par.clave === "numero") diaActual.numero = convertirNumero(par.valor) || diaActual.numero;
      if (par.clave === "nombre") diaActual.nombre = par.valor || diaActual.nombre;
      if (par.clave === "enfoque") diaActual.enfoque = par.valor;
      if (par.clave === "calentamiento") diaActual.calentamiento = par.valor;
      return;
    }

    if (seccion === "bloque" && bloqueActual) {
      if (linea.startsWith("-") || linea.startsWith("•")) {
        const ejercicio = parsearEjercicio(linea, bloqueActual);
        if (ejercicio.nombre) bloqueActual.ejercicios.push(ejercicio);
        return;
      }

      const par = leerClaveValor(linea);
      if (!par) return;

      if (par.clave === "tipo") bloqueActual.tipo = normalizarTipo(par.valor);
      if (par.clave === "nombre") bloqueActual.nombre = par.valor;
    }
  });

  cerrarBloque(diaActual, bloqueActual);

  rutina.dias.forEach((dia, indice) => {
    dia.orden = indice + 1;
    dia.numero = dia.numero || indice + 1;
    dia.nombre = dia.nombre || `Día ${indice + 1}`;
  });

  validarResultado(rutina, errores, advertencias);

  return {
    ok: errores.length === 0,
    mensaje: errores.length === 0 ? "Rutina IA interpretada correctamente." : errores[0],
    formatoVersion: FITJEFF_RUTINA_FORMAT_VERSION,
    rutina,
    resumen: crearResumen(rutina),
    errores,
    advertencias
  };
}

export function convertirRutinaIAATextoSimple(rutina = {}) {
  return (rutina.dias || []).map((dia) => {
    const ejercicios = (dia.ejercicios || []).map((ejercicio) => ejercicio.nombre).filter(Boolean).join("\n");
    return `${dia.nombre || "Día"}\n${ejercicios}`.trim();
  }).join("\n\n");
}
