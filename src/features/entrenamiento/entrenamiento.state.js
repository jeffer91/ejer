/*
  Nombre completo: entrenamiento.state.js
  Ruta o ubicación: src/features/entrenamiento/entrenamiento.state.js

  Función o funciones:
    - Crear el estado inicial del módulo Entrenamiento.
    - Crear objetos base para rutinas, sesiones, cardio y ajustes.
    - Mantener estructuras consistentes para guardado local.
*/

import {
  ENTRENAMIENTO_ESTADOS_RUTINA,
  ENTRENAMIENTO_ESTADOS_SESION,
  ENTRENAMIENTO_TIPOS_CARDIO
} from "./entrenamiento.constants.js";

export function generarEntrenamientoId(prefijo = "ent") {
  const fecha = Date.now().toString(36);
  const aleatorio = Math.random().toString(36).slice(2, 8);
  return `${prefijo}-${fecha}-${aleatorio}`;
}

export function fechaEntrenamientoHoy() {
  return new Date().toISOString().slice(0, 10);
}

export function crearAjustesEntrenamientoBase(datos = {}) {
  return {
    geminiApiKey: "",
    iaActiva: false,
    vozActiva: false,
    vozNombre: "",
    volumenVoz: 1,
    velocidadVoz: 1,
    actualizadoEn: null,
    ...datos
  };
}

export function crearEjercicioEntrenamientoBase(datos = {}) {
  return {
    id: generarEntrenamientoId("ejercicio"),
    nombre: "",
    series: 3,
    repeticiones: 10,
    descansoSegundos: 60,
    notas: "",
    completado: false,
    ...datos
  };
}

export function crearDiaRutinaBase(datos = {}) {
  return {
    id: generarEntrenamientoId("dia"),
    nombre: "Día 1",
    orden: 1,
    calentamiento: "",
    ejercicios: [],
    descansoGeneralSegundos: 60,
    ...datos
  };
}

export function crearRutinaEntrenamientoBase(datos = {}) {
  const fecha = new Date().toISOString();

  return {
    id: generarEntrenamientoId("rutina"),
    nombre: "Rutina nueva",
    dias: [crearDiaRutinaBase()],
    estado: ENTRENAMIENTO_ESTADOS_RUTINA.INACTIVA,
    creadoEn: fecha,
    actualizadoEn: fecha,
    ...datos
  };
}

export function crearSesionEntrenamientoBase(datos = {}) {
  const fecha = new Date().toISOString();

  return {
    id: generarEntrenamientoId("sesion"),
    rutinaId: null,
    diaRutinaId: null,
    fecha: fechaEntrenamientoHoy(),
    estado: ENTRENAMIENTO_ESTADOS_SESION.PENDIENTE,
    ejerciciosCompletados: 0,
    seriesCompletadas: 0,
    repeticionesCompletadas: 0,
    tiempoMinutos: 0,
    notas: "",
    creadoEn: fecha,
    actualizadoEn: fecha,
    ...datos
  };
}

export function crearCardioEntrenamientoBase(datos = {}) {
  const fecha = new Date().toISOString();

  return {
    id: generarEntrenamientoId("cardio"),
    tipo: ENTRENAMIENTO_TIPOS_CARDIO.CAMINATA,
    fecha: fechaEntrenamientoHoy(),
    tiempoMinutos: 0,
    distanciaKm: null,
    intensidad: "media",
    rondas: 0,
    actividadSegundos: 0,
    descansoSegundos: 0,
    notas: "",
    creadoEn: fecha,
    actualizadoEn: fecha,
    ...datos
  };
}

export function crearCambioEntrenamientoBase(datos = {}) {
  return {
    id: generarEntrenamientoId("cambio"),
    accion: "crear",
    entidad: "entrenamiento",
    entidadId: null,
    antes: null,
    despues: null,
    creadoEn: new Date().toISOString(),
    ...datos
  };
}

export function crearEstadoEntrenamientoInicial() {
  return {
    rutinas: [],
    sesiones: [],
    cardio: [],
    ajustes: crearAjustesEntrenamientoBase(),
    historial: []
  };
}
