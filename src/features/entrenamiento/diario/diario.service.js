/*
  Nombre completo: diario.service.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.service.js

  Función o funciones:
    - Preparar la rutina activa del día.
    - Iniciar, guardar progreso y completar sesiones diarias con guardado local.
    - Calcular ejercicios, series, repeticiones y tiempo estimado.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/entrenamiento.constants.js
    - src/features/entrenamiento/diario/diario.mapper.js
    - src/features/entrenamiento/diario/diario.controller.js
*/

import { ENTRENAMIENTO_ESTADOS_SESION } from "../entrenamiento.constants.js";
import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { fechaEntrenamientoHoy } from "../entrenamiento.state.js";
import { crearDetalleBaseDesdeDia, mapearFormularioDiario, validarCierreSesion } from "./diario.mapper.js";

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

function crearSesionBase(rutina, dia, estado = ENTRENAMIENTO_ESTADOS_SESION.INICIADA) {
  return {
    rutinaId: rutina.id,
    diaRutinaId: dia.id,
    estado,
    ejerciciosCompletados: 0,
    seriesCompletadas: 0,
    repeticionesCompletadas: 0,
    tiempoMinutos: 0,
    dificultadGeneral: "media",
    molestias: "",
    detalleEjercicios: crearDetalleBaseDesdeDia(dia),
    notas: "Sesión creada desde Diario."
  };
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

    return entrenamientoService.guardarSesion(crearSesionBase(rutina, dia, ENTRENAMIENTO_ESTADOS_SESION.INICIADA));
  }

  function guardarProgreso(datosFormulario = {}) {
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
        mensaje: "La sesión ya está completada."
      };
    }

    const datosSesion = {
      ...mapearFormularioDiario(datosFormulario, dia),
      rutinaId: rutina.id,
      diaRutinaId: dia.id,
      estado: ENTRENAMIENTO_ESTADOS_SESION.INICIADA
    };

    if (diario.sesionHoy) {
      const resultado = entrenamientoService.actualizarSesion(diario.sesionHoy.id, datosSesion);
      return { ...resultado, mensaje: "Progreso guardado." };
    }

    const resultado = entrenamientoService.guardarSesion(datosSesion);
    return { ...resultado, mensaje: "Progreso guardado." };
  }

  function completarSesion(datosFormulario = {}) {
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

    const datosSesion = {
      ...mapearFormularioDiario(datosFormulario, dia),
      rutinaId: rutina.id,
      diaRutinaId: dia.id,
      estado: ENTRENAMIENTO_ESTADOS_SESION.COMPLETADA
    };
    const validacion = validarCierreSesion(datosSesion);

    if (!validacion.ok) {
      return {
        ok: false,
        mensaje: validacion.errores[0],
        errores: validacion.errores
      };
    }

    if (diario.sesionHoy) {
      const resultado = entrenamientoService.actualizarSesion(diario.sesionHoy.id, datosSesion);
      return { ...resultado, mensaje: "Sesión completada con detalle." };
    }

    const resultado = entrenamientoService.completarSesion(datosSesion);
    return { ...resultado, mensaje: "Sesión completada con detalle." };
  }

  return {
    obtenerDiario,
    iniciarSesion,
    guardarProgreso,
    completarSesion
  };
}
