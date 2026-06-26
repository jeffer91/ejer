/*
  Nombre completo: diario.service.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.service.js

  Función o funciones:
    - Preparar la rutina activa del día.
    - Iniciar y completar sesiones diarias con guardado local.
    - Calcular ejercicios, series, repeticiones y tiempo estimado.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/entrenamiento.constants.js
    - src/features/entrenamiento/diario/diario.controller.js
*/

import { ENTRENAMIENTO_ESTADOS_SESION } from "../entrenamiento.constants.js";
import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { fechaEntrenamientoHoy } from "../entrenamiento.state.js";

function sumarEjercicios(dia) {
  return Array.isArray(dia?.ejercicios) ? dia.ejercicios.length : 0;
}

function sumarSeries(dia) {
  return (dia?.ejercicios || []).reduce((total, ejercicio) => total + Number(ejercicio.series || 0), 0);
}

function sumarRepeticiones(dia) {
  return (dia?.ejercicios || []).reduce((total, ejercicio) => {
    return total + Number(ejercicio.series || 0) * Number(ejercicio.repeticiones || 0);
  }, 0);
}

function calcularTiempoEstimado(dia) {
  const totalSeries = sumarSeries(dia);
  const descanso = Number(dia?.descansoGeneralSegundos || 60);
  const segundosTrabajo = totalSeries * 45;
  const segundosDescanso = Math.max(totalSeries - 1, 0) * descanso;
  return Math.max(1, Math.round((segundosTrabajo + segundosDescanso) / 60));
}

function buscarSesionHoy(estado, rutinaId, diaRutinaId) {
  const hoy = fechaEntrenamientoHoy();

  return estado.sesiones.find((sesion) => {
    return sesion.fecha === hoy && sesion.rutinaId === rutinaId && sesion.diaRutinaId === diaRutinaId;
  }) || null;
}

export function crearDiarioService(entrenamientoService = crearEntrenamientoService()) {
  function obtenerDiario() {
    const estado = entrenamientoService.obtenerEstado();
    const rutinaDelDia = entrenamientoService.obtenerRutinaDelDia();
    const resumen = entrenamientoService.obtenerResumen();
    const rutina = rutinaDelDia.rutina;
    const dia = rutinaDelDia.dia;
    const sesionHoy = rutina && dia ? buscarSesionHoy(estado, rutina.id, dia.id) : null;

    return {
      rutinaDelDia,
      resumen,
      sesionHoy,
      metricas: {
        ejercicios: sumarEjercicios(dia),
        series: sumarSeries(dia),
        repeticiones: sumarRepeticiones(dia),
        tiempoEstimadoMinutos: calcularTiempoEstimado(dia)
      }
    };
  }

  function iniciarSesion() {
    const diario = obtenerDiario();
    const { rutina, dia } = diario.rutinaDelDia;

    if (!rutina || !dia) {
      return {
        ok: false,
        mensaje: "Primero crea y activa una rutina."
      };
    }

    if (diario.sesionHoy?.estado === ENTRENAMIENTO_ESTADOS_SESION.COMPLETADA) {
      return {
        ok: false,
        mensaje: "La sesión de hoy ya está completada."
      };
    }

    if (diario.sesionHoy?.estado === ENTRENAMIENTO_ESTADOS_SESION.INICIADA) {
      return {
        ok: true,
        mensaje: "La sesión ya estaba iniciada.",
        sesion: diario.sesionHoy
      };
    }

    return entrenamientoService.guardarSesion({
      rutinaId: rutina.id,
      diaRutinaId: dia.id,
      estado: ENTRENAMIENTO_ESTADOS_SESION.INICIADA,
      ejerciciosCompletados: 0,
      seriesCompletadas: 0,
      repeticionesCompletadas: 0,
      tiempoMinutos: 0,
      notas: "Sesión iniciada desde Diario."
    });
  }

  function completarSesion() {
    const diario = obtenerDiario();
    const { rutina, dia } = diario.rutinaDelDia;

    if (!rutina || !dia) {
      return {
        ok: false,
        mensaje: "Primero crea y activa una rutina."
      };
    }

    if (diario.sesionHoy?.estado === ENTRENAMIENTO_ESTADOS_SESION.COMPLETADA) {
      return {
        ok: true,
        mensaje: "La sesión de hoy ya estaba completada.",
        sesion: diario.sesionHoy
      };
    }

    return entrenamientoService.completarSesion({
      rutinaId: rutina.id,
      diaRutinaId: dia.id,
      ejerciciosCompletados: diario.metricas.ejercicios,
      seriesCompletadas: diario.metricas.series,
      repeticionesCompletadas: diario.metricas.repeticiones,
      tiempoMinutos: diario.metricas.tiempoEstimadoMinutos,
      notas: "Sesión completada desde Diario."
    });
  }

  return {
    obtenerDiario,
    iniciarSesion,
    completarSesion
  };
}
