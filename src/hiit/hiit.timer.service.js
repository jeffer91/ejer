/*
  Nombre completo: hiit.timer.service.js
  Ruta o ubicación: src/hiit/hiit.timer.service.js
*/

import { hablarFitJeff, detenerVozFitJeff } from "../audio/audio.speech.service.js";

const ESTADO_BASE = {
  activo: false,
  pausado: false,
  finalizado: false,
  rutina: null,
  pasoIndice: 0,
  segundosRestantes: 0,
  segundosTranscurridos: 0,
  iniciadoEn: null,
  finalizadoEn: null
};

let estadoHIIT = { ...ESTADO_BASE };
let intervalo = null;
let callbacks = {
  onTick: null,
  onPaso: null,
  onFin: null
};

export function obtenerEstadoHIIT() {
  return {
    ...estadoHIIT,
    pasoActual: obtenerPasoActualHIIT()
  };
}

export function iniciarHIIT({ rutina, onTick, onPaso, onFin } = {}) {
  if (!rutina?.pasos?.length) {
    throw new Error("No existe rutina HIIT para iniciar.");
  }

  limpiarIntervaloHIIT();
  callbacks = { onTick, onPaso, onFin };

  estadoHIIT = {
    ...ESTADO_BASE,
    activo: true,
    rutina,
    pasoIndice: 0,
    segundosRestantes: Number(rutina.pasos[0].segundos || 0),
    iniciadoEn: new Date().toISOString()
  };

  hablarFitJeff(`Iniciando ${rutina.nombre}. ${rutina.pasos[0].voz || rutina.pasos[0].nombre}`);
  notificarPaso();
  intervalo = setInterval(tickHIIT, 1000);
  notificarTick();

  return obtenerEstadoHIIT();
}

export function pausarHIIT() {
  if (!estadoHIIT.activo || estadoHIIT.pausado) return obtenerEstadoHIIT();
  estadoHIIT.pausado = true;
  hablarFitJeff("HIIT pausado.");
  notificarTick();
  return obtenerEstadoHIIT();
}

export function continuarHIIT() {
  if (!estadoHIIT.activo || !estadoHIIT.pausado) return obtenerEstadoHIIT();
  estadoHIIT.pausado = false;
  hablarFitJeff("Continuando HIIT.");
  notificarTick();
  return obtenerEstadoHIIT();
}

export function detenerHIIT({ hablar = true } = {}) {
  limpiarIntervaloHIIT();

  if (hablar) {
    hablarFitJeff("HIIT detenido.");
  }

  estadoHIIT = {
    ...estadoHIIT,
    activo: false,
    pausado: false,
    finalizado: false,
    finalizadoEn: new Date().toISOString()
  };

  notificarTick();
  return obtenerEstadoHIIT();
}

export function terminarHIIT() {
  limpiarIntervaloHIIT();
  detenerVozFitJeff();

  estadoHIIT = {
    ...estadoHIIT,
    activo: false,
    pausado: false,
    finalizado: true,
    finalizadoEn: new Date().toISOString()
  };

  hablarFitJeff("HIIT terminado. Buen trabajo. Registra cómo te sentiste.");
  callbacks.onFin?.(obtenerEstadoHIIT());
  notificarTick();

  return obtenerEstadoHIIT();
}

export function obtenerPasoActualHIIT() {
  return estadoHIIT.rutina?.pasos?.[estadoHIIT.pasoIndice] || null;
}

function tickHIIT() {
  if (!estadoHIIT.activo || estadoHIIT.pausado) return;

  estadoHIIT.segundosRestantes -= 1;
  estadoHIIT.segundosTranscurridos += 1;

  if ([10, 5, 3, 2, 1].includes(estadoHIIT.segundosRestantes)) {
    hablarFitJeff(String(estadoHIIT.segundosRestantes), { interrumpir: false, velocidad: 1.1 });
  }

  if (estadoHIIT.segundosRestantes <= 0) {
    avanzarPasoHIIT();
    return;
  }

  notificarTick();
}

function avanzarPasoHIIT() {
  const siguiente = estadoHIIT.pasoIndice + 1;

  if (siguiente >= estadoHIIT.rutina.pasos.length) {
    terminarHIIT();
    return;
  }

  estadoHIIT.pasoIndice = siguiente;
  estadoHIIT.segundosRestantes = Number(estadoHIIT.rutina.pasos[siguiente].segundos || 0);

  const paso = obtenerPasoActualHIIT();
  hablarFitJeff(paso.voz || paso.nombre);
  notificarPaso();
  notificarTick();
}

function notificarPaso() {
  callbacks.onPaso?.(obtenerEstadoHIIT());
}

function notificarTick() {
  callbacks.onTick?.(obtenerEstadoHIIT());
}

function limpiarIntervaloHIIT() {
  if (intervalo) {
    clearInterval(intervalo);
    intervalo = null;
  }
}
