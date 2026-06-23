/*
  Nombre completo: guiado.service.js
  Ruta o ubicación: src/entrenamiento-guiado/guiado.service.js

  Función:
    - Controlar el entrenamiento guiado visual paso a paso.
    - Crear una sesión desde la rutina actual.
    - Avanzar por calentamiento, ejercicios, series, descanso, notas y resumen.
    - Funcionar localmente sin internet y sin Gemini.

  Se conecta con:
    - src/entrenamiento-guiado/guiado.config.js
    - src/entrenamiento-guiado/guiado.estado.js
    - src/entrenamiento-guiado/guiado.timer.service.js
    - src/entrenamiento-guiado/guiado.resumen.service.js
    - src/vistas/entrenamiento-guiado.view.js
    - src/app-controller.js
*/

import { GUIADO_CONFIG, GUIADO_FASES, crearPasoGuiado } from "./guiado.config.js";
import {
  obtenerEstadoGuiado,
  iniciarEstadoGuiado,
  actualizarEstadoGuiado,
  actualizarPasoGuiado,
  agregarPasoCompletadoGuiado,
  agregarMensajeGuiado,
  agregarNotaGuiado,
  pausarEstadoGuiado,
  continuarEstadoGuiado,
  finalizarEstadoGuiado
} from "./guiado.estado.js";
import {
  iniciarTimerGuiado,
  detenerTimerGuiado,
  sumarTiempoTimerGuiado
} from "./guiado.timer.service.js";
import { crearResumenEntrenamientoGuiado } from "./guiado.resumen.service.js";

const STORAGE_KEY_SESION_GUIADA = "fitjeff_guiado_sesion_actual";

export function crearSesionEntrenamientoGuiado(rutina, diaNumero = null) {
  const dia = seleccionarDiaRutina(rutina, diaNumero);

  if (!dia) {
    return {
      ok: false,
      mensaje: "No se encontró un día de rutina válido.",
      sesion: null
    };
  }

  const calentamiento = normalizarCalentamiento(dia);
  const ejercicios = normalizarEjercicios(dia);

  if (!ejercicios.length) {
    return {
      ok: false,
      mensaje: "El día seleccionado no tiene ejercicios cargados.",
      sesion: null
    };
  }

  const sesion = {
    id: `guiado_sesion_${Date.now()}`,
    diaRutina: Number(dia.numero || diaNumero || 1),
    nombreDia: dia.nombre || "Entrenamiento",
    nombreCorto: dia.nombreCorto || dia.nombre || "Entrenamiento",
    objetivo: dia.objetivo || "Completar el entrenamiento con control.",
    duracionEstimadaMin: Number(dia.duracionEstimadaMin || dia.duracionMin || 40),
    calentamiento,
    ejercicios,
    creadoEn: new Date().toISOString()
  };

  return {
    ok: true,
    mensaje: `Sesión guiada creada para ${sesion.nombreDia}.`,
    sesion
  };
}

export function iniciarEntrenamientoGuiado(rutina, diaNumero = null) {
  const resultado = crearSesionEntrenamientoGuiado(rutina, diaNumero);

  if (!resultado.ok) {
    agregarMensajeGuiado(resultado.mensaje, "error");
    return resultado;
  }

  guardarSesionGuiada(resultado.sesion);

  iniciarEstadoGuiado({
    diaRutina: resultado.sesion.diaRutina,
    nombreDia: resultado.sesion.nombreDia
  });

  agregarMensajeGuiado(`Entrenamiento guiado iniciado: ${resultado.sesion.nombreDia}.`, "ok");

  return avanzarEntrenamientoGuiado();
}

export function avanzarEntrenamientoGuiado() {
  const estado = obtenerEstadoGuiado();
  const sesion = obtenerSesionGuiada();

  if (!sesion) {
    agregarMensajeGuiado("No hay una sesión guiada activa.", "error");
    return {
      ok: false,
      mensaje: "No hay una sesión guiada activa."
    };
  }

  if (estado.pausado) {
    agregarMensajeGuiado("La sesión está pausada.", "warning");
    return {
      ok: true,
      pausado: true,
      estado
    };
  }

  if (estado.fase === GUIADO_FASES.INICIO) {
    actualizarEstadoGuiado({
      fase: GUIADO_FASES.CALENTAMIENTO,
      indiceCalentamiento: 0,
      indiceEjercicio: 0,
      indiceSerie: 0
    });
    return mostrarPasoActualGuiado();
  }

  if (estado.fase === GUIADO_FASES.CALENTAMIENTO) {
    return avanzarCalentamiento(sesion, estado);
  }

  if (estado.fase === GUIADO_FASES.EJERCICIO) {
    return avanzarEjercicio(sesion, estado);
  }

  if (estado.fase === GUIADO_FASES.DESCANSO) {
    actualizarEstadoGuiado({
      fase: GUIADO_FASES.EJERCICIO
    });
    return mostrarPasoActualGuiado();
  }

  if (estado.fase === GUIADO_FASES.RESUMEN || estado.fase === GUIADO_FASES.FINALIZADO) {
    return finalizarEntrenamientoGuiado("completado");
  }

  return mostrarPasoActualGuiado();
}

export function mostrarPasoActualGuiado() {
  const estado = obtenerEstadoGuiado();
  const sesion = obtenerSesionGuiada();

  if (!sesion) {
    return {
      ok: false,
      mensaje: "No hay sesión activa."
    };
  }

  if (estado.fase === GUIADO_FASES.CALENTAMIENTO) {
    const paso = sesion.calentamiento[estado.indiceCalentamiento];

    if (!paso) {
      actualizarEstadoGuiado({
        fase: GUIADO_FASES.EJERCICIO,
        indiceEjercicio: 0,
        indiceSerie: 0
      });
      return mostrarPasoActualGuiado();
    }

    const pasoGuiado = crearPasoGuiado(GUIADO_FASES.CALENTAMIENTO, {
      id: paso.id,
      titulo: paso.nombre,
      descripcion: paso.descripcion || "Completa este paso de calentamiento con movimientos controlados.",
      duracionSeg: paso.duracionSeg,
      serie: null,
      totalSeries: null
    });

    actualizarPasoGuiado(pasoGuiado, {
      fase: GUIADO_FASES.CALENTAMIENTO
    });

    return {
      ok: true,
      fase: GUIADO_FASES.CALENTAMIENTO,
      paso: pasoGuiado
    };
  }

  if (estado.fase === GUIADO_FASES.EJERCICIO) {
    const ejercicio = sesion.ejercicios[estado.indiceEjercicio];

    if (!ejercicio) {
      return finalizarEntrenamientoGuiado("completado");
    }

    const serieActual = Number(estado.indiceSerie || 0) + 1;
    const totalSeries = Number(ejercicio.seriesObjetivo || 1);

    if (serieActual > totalSeries) {
      actualizarEstadoGuiado({
        indiceEjercicio: estado.indiceEjercicio + 1,
        indiceSerie: 0
      });
      return mostrarPasoActualGuiado();
    }

    const pasoGuiado = crearPasoGuiado(GUIADO_FASES.EJERCICIO, {
      id: `${ejercicio.id}_serie_${serieActual}`,
      titulo: ejercicio.nombre,
      descripcion: crearDescripcionEjercicio(ejercicio, serieActual, totalSeries),
      duracionSeg: Number(ejercicio.duracionSeg || 0),
      ejercicioId: ejercicio.id,
      serie: serieActual,
      totalSeries
    });

    actualizarPasoGuiado(pasoGuiado, {
      fase: GUIADO_FASES.EJERCICIO
    });

    return {
      ok: true,
      fase: GUIADO_FASES.EJERCICIO,
      paso: pasoGuiado,
      ejercicio
    };
  }

  return {
    ok: true,
    fase: estado.fase,
    paso: estado.pasoActual
  };
}

export function marcarPasoGuiadoHecho() {
  const estado = obtenerEstadoGuiado();
  const sesion = obtenerSesionGuiada();

  if (!estado.activo || !sesion) {
    return {
      ok: false,
      mensaje: "No hay entrenamiento guiado activo."
    };
  }

  if (estado.pasoActual) {
    agregarPasoCompletadoGuiado(estado.pasoActual);
  }

  if (estado.fase === GUIADO_FASES.CALENTAMIENTO) {
    actualizarEstadoGuiado({
      indiceCalentamiento: Number(estado.indiceCalentamiento || 0) + 1
    });
    return mostrarPasoActualGuiado();
  }

  if (estado.fase === GUIADO_FASES.EJERCICIO) {
    const ejercicio = sesion.ejercicios[estado.indiceEjercicio];
    const descansoSeg = Number(
      ejercicio?.descansoSegundos ||
      ejercicio?.descansoSeg ||
      ejercicio?.descanso ||
      GUIADO_CONFIG.descansoDefectoSeg
    );

    actualizarEstadoGuiado({
      fase: GUIADO_FASES.DESCANSO
    });

    iniciarTimerGuiado(descansoSeg, () => {
      const estadoFinal = obtenerEstadoGuiado();

      if (!estadoFinal.activo) {
        return;
      }

      actualizarEstadoGuiado({
        fase: GUIADO_FASES.EJERCICIO,
        indiceSerie: Number(estadoFinal.indiceSerie || 0) + 1
      });

      mostrarPasoActualGuiado();
    });

    const pasoDescanso = crearPasoGuiado(GUIADO_FASES.DESCANSO, {
      titulo: "Descanso",
      descripcion: "Respira, toma agua si lo necesitas y prepárate para continuar.",
      duracionSeg: descansoSeg,
      ejercicioId: ejercicio?.id || null
    });

    actualizarPasoGuiado(pasoDescanso, {
      fase: GUIADO_FASES.DESCANSO
    });

    return {
      ok: true,
      fase: GUIADO_FASES.DESCANSO,
      paso: pasoDescanso
    };
  }

  return avanzarEntrenamientoGuiado();
}

export function repetirPasoGuiado() {
  const estado = obtenerEstadoGuiado();

  if (!estado.pasoActual) {
    return mostrarPasoActualGuiado();
  }

  agregarMensajeGuiado(`Repetir: ${estado.pasoActual.titulo}`, "info");

  return {
    ok: true,
    repetido: true,
    paso: estado.pasoActual
  };
}

export function pausarEntrenamientoGuiado() {
  pausarEstadoGuiado();
  agregarMensajeGuiado("Entrenamiento pausado.", "warning");

  return {
    ok: true,
    estado: obtenerEstadoGuiado()
  };
}

export function continuarEntrenamientoGuiado() {
  continuarEstadoGuiado();
  agregarMensajeGuiado("Entrenamiento reanudado.", "ok");

  return {
    ok: true,
    estado: obtenerEstadoGuiado()
  };
}

export function agregarTiempoDescansoGuiado(segundosExtra = 30) {
  const resultado = sumarTiempoTimerGuiado(segundosExtra);
  agregarMensajeGuiado(`Se agregaron ${segundosExtra} segundos al descanso.`, "info");
  return resultado;
}

export function guardarNotaGuiada(texto) {
  const nota = agregarNotaGuiado(texto);

  if (!nota) {
    return {
      ok: false,
      mensaje: "La nota está vacía.",
      nota: null
    };
  }

  agregarMensajeGuiado("Nota guardada.", "ok");

  return {
    ok: true,
    mensaje: "Nota guardada.",
    nota
  };
}

export function finalizarEntrenamientoGuiado(motivo = "completado") {
  detenerTimerGuiado();

  const estado = obtenerEstadoGuiado();
  const sesion = obtenerSesionGuiada();

  const resumen = crearResumenEntrenamientoGuiado({
    estado,
    sesion,
    motivo
  });

  finalizarEstadoGuiado(resumen);
  limpiarSesionGuiada();
  agregarMensajeGuiado("Entrenamiento guiado finalizado.", "ok");

  return {
    ok: true,
    resumen
  };
}

function avanzarCalentamiento(sesion, estado) {
  const paso = sesion.calentamiento[estado.indiceCalentamiento];

  if (!paso) {
    actualizarEstadoGuiado({
      fase: GUIADO_FASES.EJERCICIO,
      indiceEjercicio: 0,
      indiceSerie: 0
    });

    return mostrarPasoActualGuiado();
  }

  return mostrarPasoActualGuiado();
}

function avanzarEjercicio(sesion, estado) {
  const ejercicio = sesion.ejercicios[estado.indiceEjercicio];

  if (!ejercicio) {
    return finalizarEntrenamientoGuiado("completado");
  }

  return mostrarPasoActualGuiado();
}

function seleccionarDiaRutina(rutina, diaNumero = null) {
  const dias = Array.isArray(rutina?.dias) ? rutina.dias : [];
  const numero = Number(diaNumero || rutina?.diaActual || 1);

  return dias.find((dia) => Number(dia.numero) === numero) || dias[0] || null;
}

function normalizarCalentamiento(dia) {
  const pasos = Array.isArray(dia?.calentamiento?.pasos)
    ? dia.calentamiento.pasos
    : Array.isArray(dia?.calentamiento)
      ? dia.calentamiento
      : [];

  if (!pasos.length) {
    return [
      {
        id: "calentamiento_general",
        nombre: "Calentamiento general",
        descripcion: "Prepara articulaciones y respiración.",
        duracionSeg: 300
      }
    ];
  }

  return pasos.map((paso, index) => ({
    id: paso.id || `cal_${index + 1}`,
    nombre: paso.nombre || paso.actividad || `Calentamiento ${index + 1}`,
    descripcion: paso.descripcion || paso.instrucciones || "",
    duracionSeg: Number(paso.duracionSegundos || paso.duracionSeg || paso.segundos || 45)
  }));
}

function normalizarEjercicios(dia) {
  const ejercicios = Array.isArray(dia?.ejercicios) ? dia.ejercicios : [];

  return ejercicios.map((ejercicio, index) => ({
    ...ejercicio,
    id: ejercicio.id || `ejercicio_${index + 1}`,
    nombre: ejercicio.nombre || `Ejercicio ${index + 1}`,
    tipoRegistro: ejercicio.tipoRegistro || "repeticiones",
    unidad: ejercicio.unidad || "repeticiones",
    seriesObjetivo: Number(ejercicio.seriesObjetivo || ejercicio.series || ejercicio.rondasObjetivo || 1),
    descansoSegundos: Number(ejercicio.descansoSegundos || ejercicio.descansoSeg || ejercicio.descanso || 60),
    instrucciones: ejercicio.instrucciones || "Realiza el ejercicio con control."
  }));
}

function crearDescripcionEjercicio(ejercicio, serieActual, totalSeries) {
  if (ejercicio.tipoRegistro === "cardio") {
    return `Completa ${ejercicio.minutosObjetivo || ejercicio.duracionMin || "los"} minutos a ritmo controlado.`;
  }

  if (ejercicio.tipoRegistro === "hiit") {
    return `Ronda ${serieActual} de ${totalSeries}. Mantén ritmo, respiración y técnica.`;
  }

  return `Serie ${serieActual} de ${totalSeries}. Unidad: ${ejercicio.unidad || "repeticiones"}. ${ejercicio.instrucciones || ""}`;
}

function guardarSesionGuiada(sesion) {
  sessionStorage.setItem(STORAGE_KEY_SESION_GUIADA, JSON.stringify(sesion));
}

export function obtenerSesionGuiada() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_SESION_GUIADA) || "null");
  } catch (_) {
    return null;
  }
}

function limpiarSesionGuiada() {
  sessionStorage.removeItem(STORAGE_KEY_SESION_GUIADA);
}
