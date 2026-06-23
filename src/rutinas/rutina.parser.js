/*
  Nombre completo: rutina.parser.js
  Ruta o ubicación: src/rutinas/rutina.parser.js

  Función:
    - Leer texto en formato FitJeff.
    - Extraer metadatos, preparación, ejercicios y observaciones.
    - Convertir tablas Markdown en objetos internos.

  Se conecta con:
    - src/rutinas/rutina.schema.js
    - src/rutinas/rutina.validator.js
    - src/rutinas/rutina.import.service.js
*/

import {
  crearRutinaImportBase,
  crearPreparacionBase,
  crearEjercicioBase,
  normalizarAccion,
  normalizarEntero,
  normalizarSegundos,
  clave
} from "./rutina.schema.js";

export function parsearRutinaFitJeff(texto = "") {
  const contenido = String(texto || "").replace(/\r/g, "").trim();
  const base = crearRutinaImportBase();

  if (!contenido) {
    return {
      ok: false,
      errores: ["No se pegó ningún texto."],
      advertencias: [],
      rutinaImportada: base
    };
  }

  const metadata = extraerMetadata(contenido);
  const preparacion = parsearPreparacion(extraerEntre(contenido, "## Preparación", "## Ejercicios"));
  const ejercicios = parsearEjercicios(extraerEntre(contenido, "## Ejercicios", "## Observaciones"));
  const observaciones = parsearLista(extraerDesde(contenido, "## Observaciones"));

  const rutinaImportada = {
    ...base,
    accion: normalizarAccion(metadata.accion || base.accion),
    diaAReemplazar: normalizarEntero(metadata.diaAReemplazar || metadata.numeroDia, 1),
    numeroDia: normalizarEntero(metadata.numeroDia || metadata.diaAReemplazar, 1),
    nombreDia: metadata.nombreDia || base.nombreDia,
    duracionEstimadaMin: normalizarEntero(metadata.duracionEstimada, base.duracionEstimadaMin),
    objetivo: metadata.objetivo || base.objetivo,
    preparacion,
    ejercicios,
    observaciones,
    textoOriginal: contenido,
    creadoEn: new Date().toISOString()
  };

  return {
    ok: true,
    errores: [],
    advertencias: crearAdvertencias(rutinaImportada),
    rutinaImportada
  };
}

function extraerMetadata(texto) {
  const metadata = {};

  texto.split("\n").forEach((linea) => {
    const partes = linea.split(":");

    if (partes.length < 2) return;

    const llave = clave(partes.shift());
    const valor = partes.join(":").trim();

    if (llave === "accion") metadata.accion = valor;
    if (llave === "dia a reemplazar") metadata.diaAReemplazar = valor;
    if (llave === "dia" || llave === "numero de dia") metadata.numeroDia = valor;
    if (llave === "nombre del dia") metadata.nombreDia = valor;
    if (llave === "duracion estimada") metadata.duracionEstimada = valor;
    if (llave === "objetivo") metadata.objetivo = valor;
  });

  return metadata;
}

function parsearPreparacion(seccion = "") {
  return filasTabla(seccion).map((celdas, index) => {
    return crearPreparacionBase({
      id: `prep_${normalizarEntero(celdas[0], index + 1)}`,
      nombre: celdas[1] || "",
      duracionSeg: normalizarSegundos(celdas[2], 45)
    });
  }).filter((item) => item.nombre);
}

function parsearEjercicios(seccion = "") {
  return filasTabla(seccion).map((celdas, index) => {
    return crearEjercicioBase({
      id: `ej_${normalizarEntero(celdas[0], index + 1)}`,
      nombre: celdas[1] || "",
      tipo: celdas[2] || "repeticiones",
      series: celdas[3] || "3",
      unidad: celdas[4] || "repeticiones",
      descansoSeg: normalizarSegundos(celdas[5], 90),
      instrucciones: celdas[6] || "Realizar con control."
    });
  }).filter((item) => item.nombre);
}

function filasTabla(seccion = "") {
  return String(seccion || "")
    .split("\n")
    .map((linea) => linea.trim())
    .filter((linea) => linea.startsWith("|") && linea.endsWith("|"))
    .filter((linea) => !linea.includes("---"))
    .map((linea) => linea.slice(1, -1).split("|").map((celda) => celda.trim()))
    .filter((celdas) => !["orden", ""].includes(clave(celdas[0] || "")));
}

function parsearLista(seccion = "") {
  return String(seccion || "")
    .split("\n")
    .map((linea) => linea.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function extraerEntre(texto, inicio, fin) {
  const i = texto.indexOf(inicio);
  if (i === -1) return "";

  const desde = i + inicio.length;
  const f = texto.indexOf(fin, desde);

  return f === -1 ? texto.slice(desde).trim() : texto.slice(desde, f).trim();
}

function extraerDesde(texto, inicio) {
  const i = texto.indexOf(inicio);
  return i === -1 ? "" : texto.slice(i + inicio.length).trim();
}

function crearAdvertencias(rutina) {
  const advertencias = [];

  if (!rutina.preparacion.length) advertencias.push("No se detectó preparación.");
  if (!rutina.ejercicios.length) advertencias.push("No se detectaron ejercicios.");
  if (rutina.ejercicios.length > 10) advertencias.push("Hay muchos ejercicios. Revisa la duración.");

  return advertencias;
}
