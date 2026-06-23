/*
  Nombre completo: guiado.estado.js
  Ruta o ubicación: src/entrenamiento-guiado/guiado.estado.js

  Función:
    - Controlar el estado de la pantalla de entrenamiento guiado.
    - Guardar fase actual, paso actual, temporizador, pausa y resumen.
    - Funcionar junto a Jarvis o de manera manual.

  Se conecta con:
    - src/entrenamiento-guiado/guiado.config.js
    - src/entrenamiento-guiado/guiado.timer.service.js
    - src/entrenamiento-guiado/guiado.service.js
*/

import { GUIADO_FASES } from "./guiado.config.js";

export const GUIADO_EVENTOS = Object.freeze({
  CAMBIO: "guiado:cambio",
  TIMER: "guiado:timer",
  FINALIZADO: "guiado:finalizado"
});

export function crearEstadoGuiadoBase() {
  return {
    activo: false,
    pausado: false,
    fase: GUIADO_FASES.INICIO,
    diaRutina: null,
    nombreDia: "",
    pasoActual: null,
    indiceCalentamiento: 0,
    indiceEjercicio: 0,
    indiceSerie: 0,
    segundosRestantes: 0,
    segundosTranscurridos: 0,
    pasosCompletados: [],
    mensajes: [],
    notas: [],
    resumen: null,
    iniciadoEn: null,
    actualizadoEn: new Date().toISOString(),
    finalizadoEn: null
  };
}

let estadoGuiado = crearEstadoGuiadoBase();

export function obtenerEstadoGuiado() {
  return clonar(estadoGuiado);
}

export function reemplazarEstadoGuiado(nuevoEstado) {
  estadoGuiado = normalizarEstadoGuiado(nuevoEstado);
  emitirCambio();
  return obtenerEstadoGuiado();
}

export function actualizarEstadoGuiado(parcial = {}) {
  estadoGuiado = normalizarEstadoGuiado({
    ...estadoGuiado,
    ...parcial,
    actualizadoEn: new Date().toISOString()
  });
  emitirCambio();
  return obtenerEstadoGuiado();
}

export function iniciarEstadoGuiado({ diaRutina, nombreDia }) {
  return actualizarEstadoGuiado({
    activo: true,
    pausado: false,
    fase: GUIADO_FASES.CALENTAMIENTO,
    diaRutina: Number(diaRutina || 1),
    nombreDia: nombreDia || "Entrenamiento",
    pasoActual: null,
    indiceCalentamiento: 0,
    indiceEjercicio: 0,
    indiceSerie: 0,
    segundosRestantes: 0,
    segundosTranscurridos: 0,
    pasosCompletados: [],
    mensajes: [],
    notas: [],
    resumen: null,
    iniciadoEn: new Date().toISOString(),
    finalizadoEn: null
  });
}

export function pausarEstadoGuiado() {
  return actualizarEstadoGuiado({
    pausado: true
  });
}

export function continuarEstadoGuiado() {
  return actualizarEstadoGuiado({
    pausado: false
  });
}

export function finalizarEstadoGuiado(resumen = null) {
  const nuevoEstado = actualizarEstadoGuiado({
    activo: false,
    pausado: false,
    fase: GUIADO_FASES.FINALIZADO,
    resumen,
    finalizadoEn: new Date().toISOString()
  });

  emitirEvento(GUIADO_EVENTOS.FINALIZADO, resumen);
  return nuevoEstado;
}

export function actualizarPasoGuiado(pasoActual, parcial = {}) {
  return actualizarEstadoGuiado({
    pasoActual,
    ...parcial
  });
}

export function agregarPasoCompletadoGuiado(paso) {
  if (!paso) {
    return obtenerEstadoGuiado();
  }

  const completado = {
    ...paso,
    completadoEn: new Date().toISOString()
  };

  return actualizarEstadoGuiado({
    pasosCompletados: [...(estadoGuiado.pasosCompletados || []), completado]
  });
}

export function agregarMensajeGuiado(texto, tipo = "info") {
  const contenido = String(texto || "").trim();

  if (!contenido) {
    return obtenerEstadoGuiado();
  }

  const mensaje = {
    id: `guiado_msg_${Date.now()}`,
    texto: contenido,
    tipo,
    creadoEn: new Date().toISOString()
  };

  return actualizarEstadoGuiado({
    mensajes: [mensaje, ...(estadoGuiado.mensajes || [])].slice(0, 30)
  });
}

export function agregarNotaGuiado(texto) {
  const contenido = String(texto || "").trim();

  if (!contenido) {
    return null;
  }

  const nota = {
    id: `guiado_nota_${Date.now()}`,
    texto: contenido,
    creadoEn: new Date().toISOString()
  };

  actualizarEstadoGuiado({
    notas: [nota, ...(estadoGuiado.notas || [])].slice(0, 30)
  });

  return nota;
}

export function normalizarEstadoGuiado(estado = crearEstadoGuiadoBase()) {
  const base = crearEstadoGuiadoBase();

  return {
    ...base,
    ...estado,
    activo: Boolean(estado.activo),
    pausado: Boolean(estado.pausado),
    diaRutina: estado.diaRutina === null ? null : Number(estado.diaRutina || 1),
    indiceCalentamiento: Number(estado.indiceCalentamiento || 0),
    indiceEjercicio: Number(estado.indiceEjercicio || 0),
    indiceSerie: Number(estado.indiceSerie || 0),
    segundosRestantes: Number(estado.segundosRestantes || 0),
    segundosTranscurridos: Number(estado.segundosTranscurridos || 0),
    pasosCompletados: Array.isArray(estado.pasosCompletados) ? estado.pasosCompletados : [],
    mensajes: Array.isArray(estado.mensajes) ? estado.mensajes : [],
    notas: Array.isArray(estado.notas) ? estado.notas : []
  };
}

function emitirCambio() {
  emitirEvento(GUIADO_EVENTOS.CAMBIO, obtenerEstadoGuiado());
}

function emitirEvento(nombre, detalle) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
}

function clonar(valor) {
  return JSON.parse(JSON.stringify(valor));
}
