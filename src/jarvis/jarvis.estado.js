/*
  Nombre completo: jarvis.estado.js
  Ruta o ubicación: src/jarvis/jarvis.estado.js

  Función:
    - Crear, leer y actualizar el estado interno de Jarvis.
    - Mantener la sesión de entrenamiento guiado por voz.
    - Guardar mensajes, comandos y notas temporales.

  Se conecta con:
    - src/jarvis/jarvis.config.js
    - src/jarvis/jarvis.entrenamiento.js
    - src/jarvis/jarvis.voz.service.js
    - src/vistas/jarvis.view.js
*/

import { JARVIS_EVENTOS, crearMensajeJarvis } from "./jarvis.config.js";

export const JARVIS_MODO = Object.freeze({
  APAGADO: "apagado",
  LISTO: "listo",
  ESCUCHANDO: "escuchando",
  HABLANDO: "hablando",
  ENTRENANDO: "entrenando",
  PAUSADO: "pausado",
  FINALIZADO: "finalizado",
  ERROR: "error"
});

export function crearEstadoJarvisBase() {
  return {
    activo: false,
    modo: JARVIS_MODO.APAGADO,
    escuchando: false,
    hablando: false,
    entrenamientoActivo: false,
    entrenamientoPausado: false,
    diaRutina: null,
    nombreDia: "",
    fase: "inicio",
    indiceCalentamiento: 0,
    indiceEjercicio: 0,
    indiceSerie: 0,
    ejercicioActual: null,
    preguntaActual: null,
    ultimoComando: null,
    ultimoTextoEscuchado: "",
    ultimoMensaje: null,
    mensajes: [],
    notas: [],
    resumen: null,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString()
  };
}

let estadoJarvis = crearEstadoJarvisBase();

export function obtenerEstadoJarvis() {
  return clonar(estadoJarvis);
}

export function reemplazarEstadoJarvis(nuevoEstado) {
  estadoJarvis = normalizarEstadoJarvis(nuevoEstado);
  emitirCambio();
  return obtenerEstadoJarvis();
}

export function actualizarEstadoJarvis(parcial = {}) {
  estadoJarvis = normalizarEstadoJarvis({
    ...estadoJarvis,
    ...parcial,
    actualizadoEn: new Date().toISOString()
  });
  emitirCambio();
  return obtenerEstadoJarvis();
}

export function activarJarvis() {
  return actualizarEstadoJarvis({
    activo: true,
    modo: JARVIS_MODO.LISTO
  });
}

export function desactivarJarvis() {
  estadoJarvis = crearEstadoJarvisBase();
  emitirCambio();
  return obtenerEstadoJarvis();
}

export function marcarJarvisEscuchando(texto = "") {
  return actualizarEstadoJarvis({
    modo: JARVIS_MODO.ESCUCHANDO,
    escuchando: true,
    hablando: false,
    ultimoTextoEscuchado: texto || estadoJarvis.ultimoTextoEscuchado
  });
}

export function marcarJarvisHablando(texto = "") {
  return actualizarEstadoJarvis({
    modo: JARVIS_MODO.HABLANDO,
    escuchando: false,
    hablando: true,
    ultimoMensaje: texto || estadoJarvis.ultimoMensaje
  });
}

export function marcarJarvisListo() {
  return actualizarEstadoJarvis({
    modo: estadoJarvis.entrenamientoActivo ? JARVIS_MODO.ENTRENANDO : JARVIS_MODO.LISTO,
    escuchando: false,
    hablando: false
  });
}

export function iniciarEstadoEntrenamientoJarvis({ diaRutina, nombreDia }) {
  return actualizarEstadoJarvis({
    activo: true,
    modo: JARVIS_MODO.ENTRENANDO,
    entrenamientoActivo: true,
    entrenamientoPausado: false,
    diaRutina: Number(diaRutina || 1),
    nombreDia: nombreDia || "Entrenamiento",
    fase: "calentamiento",
    indiceCalentamiento: 0,
    indiceEjercicio: 0,
    indiceSerie: 0,
    ejercicioActual: null,
    preguntaActual: null,
    resumen: null
  });
}

export function pausarEstadoEntrenamientoJarvis() {
  return actualizarEstadoJarvis({
    modo: JARVIS_MODO.PAUSADO,
    entrenamientoPausado: true
  });
}

export function continuarEstadoEntrenamientoJarvis() {
  return actualizarEstadoJarvis({
    modo: JARVIS_MODO.ENTRENANDO,
    entrenamientoPausado: false
  });
}

export function finalizarEstadoEntrenamientoJarvis(resumen = null) {
  return actualizarEstadoJarvis({
    modo: JARVIS_MODO.FINALIZADO,
    entrenamientoActivo: false,
    entrenamientoPausado: false,
    fase: "finalizado",
    resumen
  });
}

export function guardarComandoJarvis(comando) {
  return actualizarEstadoJarvis({
    ultimoComando: comando
  });
}

export function agregarMensajeEstadoJarvis(texto, tipo = "info", extra = {}) {
  const mensaje = crearMensajeJarvis(texto, tipo, extra);
  const mensajes = [mensaje, ...(estadoJarvis.mensajes || [])].slice(0, 40);

  actualizarEstadoJarvis({
    mensajes,
    ultimoMensaje: mensaje.texto
  });

  emitirEvento(JARVIS_EVENTOS.MENSAJE, mensaje);
  return mensaje;
}

export function agregarNotaEstadoJarvis(texto, extra = {}) {
  const nota = {
    id: `jarvis_nota_${Date.now()}`,
    texto: String(texto || "").trim(),
    creadoEn: new Date().toISOString(),
    ...extra
  };

  if (!nota.texto) {
    return null;
  }

  const notas = [nota, ...(estadoJarvis.notas || [])].slice(0, 30);
  actualizarEstadoJarvis({ notas });
  emitirEvento(JARVIS_EVENTOS.NOTA_GUARDADA, nota);
  return nota;
}

export function actualizarPasoJarvis(parcial = {}) {
  return actualizarEstadoJarvis({
    fase: parcial.fase ?? estadoJarvis.fase,
    indiceCalentamiento: parcial.indiceCalentamiento ?? estadoJarvis.indiceCalentamiento,
    indiceEjercicio: parcial.indiceEjercicio ?? estadoJarvis.indiceEjercicio,
    indiceSerie: parcial.indiceSerie ?? estadoJarvis.indiceSerie,
    ejercicioActual: parcial.ejercicioActual ?? estadoJarvis.ejercicioActual,
    preguntaActual: parcial.preguntaActual ?? estadoJarvis.preguntaActual
  });
}

export function normalizarEstadoJarvis(estado = crearEstadoJarvisBase()) {
  const base = crearEstadoJarvisBase();

  return {
    ...base,
    ...estado,
    activo: Boolean(estado.activo),
    escuchando: Boolean(estado.escuchando),
    hablando: Boolean(estado.hablando),
    entrenamientoActivo: Boolean(estado.entrenamientoActivo),
    entrenamientoPausado: Boolean(estado.entrenamientoPausado),
    diaRutina: estado.diaRutina === null ? null : Number(estado.diaRutina || 1),
    indiceCalentamiento: Number(estado.indiceCalentamiento || 0),
    indiceEjercicio: Number(estado.indiceEjercicio || 0),
    indiceSerie: Number(estado.indiceSerie || 0),
    mensajes: Array.isArray(estado.mensajes) ? estado.mensajes : [],
    notas: Array.isArray(estado.notas) ? estado.notas : []
  };
}

function emitirCambio() {
  emitirEvento(JARVIS_EVENTOS.CAMBIO_ESTADO, obtenerEstadoJarvis());
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
