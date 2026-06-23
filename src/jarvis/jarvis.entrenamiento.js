/*
  Nombre completo: jarvis.entrenamiento.js
  Ruta o ubicación: src/jarvis/jarvis.entrenamiento.js

  Función:
    - Guiar el entrenamiento paso a paso con Jarvis.
    - Avanzar por calentamiento, ejercicios, series y cierre.
    - Funcionar localmente sin Gemini.

  Se conecta con:
    - src/jarvis/jarvis.config.js
    - src/jarvis/jarvis.estado.js
    - src/jarvis/jarvis.comandos.js
    - src/jarvis/jarvis.voz.service.js
    - src/data/rutina-base.js
    - src/vistas/jarvis.view.js
*/

import { JARVIS_ACCIONES, JARVIS_FRASES } from "./jarvis.config.js";
import {
  obtenerEstadoJarvis,
  iniciarEstadoEntrenamientoJarvis,
  pausarEstadoEntrenamientoJarvis,
  continuarEstadoEntrenamientoJarvis,
  finalizarEstadoEntrenamientoJarvis,
  actualizarPasoJarvis,
  agregarMensajeEstadoJarvis
} from "./jarvis.estado.js";
import { hablarJarvis } from "./jarvis.voz.service.js";
import { interpretarComandoJarvis } from "./jarvis.comandos.js";

export function crearSesionJarvisEntrenamiento(rutina, diaNumero = null) {
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

  return {
    ok: true,
    mensaje: `Sesión creada para ${dia.nombre}.`,
    sesion: {
      id: `jarvis_sesion_${Date.now()}`,
      diaRutina: Number(dia.numero || diaNumero || 1),
      nombreDia: dia.nombre || "Entrenamiento",
      duracionEstimadaMin: dia.duracionEstimadaMin || dia.duracionMin || 40,
      calentamiento,
      ejercicios,
      creadoEn: new Date().toISOString()
    }
  };
}

export async function iniciarEntrenamientoConJarvis(rutina, diaNumero = null) {
  const resultado = crearSesionJarvisEntrenamiento(rutina, diaNumero);

  if (!resultado.ok) {
    agregarMensajeEstadoJarvis(resultado.mensaje, "error");
    await hablarJarvis(resultado.mensaje);
    return resultado;
  }

  const { sesion } = resultado;

  iniciarEstadoEntrenamientoJarvis({
    diaRutina: sesion.diaRutina,
    nombreDia: sesion.nombreDia
  });

  guardarSesionTemporal(sesion);

  await hablarJarvis(`Listo. Hoy toca ${sesion.nombreDia}. ${JARVIS_FRASES.tecnica}`);
  return avanzarJarvisAlPasoActual();
}

export async function procesarRespuestaEntrenamientoJarvis(texto) {
  const comando = typeof texto === "string" ? interpretarComandoJarvis(texto) : texto;

  if (!comando) {
    return avanzarJarvisAlPasoActual();
  }

  if (comando.accion === JARVIS_ACCIONES.PAUSAR) {
    pausarEstadoEntrenamientoJarvis();
    await hablarJarvis(JARVIS_FRASES.entrenamientoPausado);
    return { ok: true, accion: comando.accion };
  }

  if (comando.accion === JARVIS_ACCIONES.CONTINUAR) {
    continuarEstadoEntrenamientoJarvis();
    await hablarJarvis(JARVIS_FRASES.entrenamientoContinuado);
    return avanzarJarvisAlPasoActual();
  }

  if (comando.accion === JARVIS_ACCIONES.REPETIR) {
    return repetirPasoJarvis();
  }

  if (comando.accion === JARVIS_ACCIONES.TERMINAR) {
    return finalizarEntrenamientoConJarvis("finalizado_por_usuario");
  }

  if (comando.accion === JARVIS_ACCIONES.RESPUESTA_NO) {
    await hablarJarvis("Está bien. Tómate unos segundos más y mantén el control.");
    return { ok: true, accion: comando.accion };
  }

  if (comando.accion === JARVIS_ACCIONES.RESPUESTA_SI || comando.accion === JARVIS_ACCIONES.SIGUIENTE) {
    avanzarIndicePaso();
    return avanzarJarvisAlPasoActual();
  }

  await hablarJarvis("Puedes responder sí, no, repetir, pausar, continuar o terminar.");
  return { ok: false, accion: comando.accion };
}

export async function avanzarJarvisAlPasoActual() {
  const estado = obtenerEstadoJarvis();
  const sesion = leerSesionTemporal();

  if (!sesion) {
    await hablarJarvis("No hay una sesión de entrenamiento activa.");
    return { ok: false, mensaje: "Sin sesión activa." };
  }

  if (estado.entrenamientoPausado) {
    await hablarJarvis("El entrenamiento está pausado. Di continuar cuando estés listo.");
    return { ok: true, pausado: true };
  }

  if (estado.fase === "calentamiento") {
    return hablarPasoCalentamiento(sesion, estado);
  }

  if (estado.fase === "ejercicios") {
    return hablarPasoEjercicio(sesion, estado);
  }

  if (estado.fase === "finalizado") {
    return finalizarEntrenamientoConJarvis("completado");
  }

  actualizarPasoJarvis({ fase: "calentamiento", indiceCalentamiento: 0 });
  return hablarPasoCalentamiento(sesion, obtenerEstadoJarvis());
}

export async function repetirPasoJarvis() {
  const estado = obtenerEstadoJarvis();

  if (estado.preguntaActual?.texto) {
    await hablarJarvis(estado.preguntaActual.texto);
    return { ok: true, repetido: true };
  }

  return avanzarJarvisAlPasoActual();
}

export async function finalizarEntrenamientoConJarvis(motivo = "completado") {
  const sesion = leerSesionTemporal();
  const resumen = {
    id: `jarvis_resumen_${Date.now()}`,
    motivo,
    diaRutina: sesion?.diaRutina || null,
    nombreDia: sesion?.nombreDia || "Entrenamiento",
    finalizadoEn: new Date().toISOString()
  };

  finalizarEstadoEntrenamientoJarvis(resumen);
  limpiarSesionTemporal();
  await hablarJarvis("Entrenamiento finalizado. Puedes guardar una nota o revisar el resumen.");

  return { ok: true, resumen };
}

function hablarPasoCalentamiento(sesion, estado) {
  const paso = sesion.calentamiento[estado.indiceCalentamiento];

  if (!paso) {
    actualizarPasoJarvis({ fase: "ejercicios", indiceEjercicio: 0, indiceSerie: 0 });
    return avanzarJarvisAlPasoActual();
  }

  const texto = `Calentamiento: ${paso.nombre}. Duración sugerida: ${paso.duracionTexto}. ¿Ya lo hiciste?`;

  actualizarPasoJarvis({
    fase: "calentamiento",
    ejercicioActual: paso,
    preguntaActual: { tipo: "calentamiento", texto }
  });

  return hablarJarvis(texto).then(() => ({ ok: true, fase: "calentamiento", paso }));
}

function hablarPasoEjercicio(sesion, estado) {
  const ejercicio = sesion.ejercicios[estado.indiceEjercicio];

  if (!ejercicio) {
    actualizarPasoJarvis({ fase: "finalizado" });
    return finalizarEntrenamientoConJarvis("completado");
  }

  const serieActual = Number(estado.indiceSerie || 0) + 1;
  const totalSeries = Number(ejercicio.seriesObjetivo || 1);

  if (serieActual > totalSeries) {
    actualizarPasoJarvis({
      fase: "ejercicios",
      indiceEjercicio: estado.indiceEjercicio + 1,
      indiceSerie: 0
    });
    return avanzarJarvisAlPasoActual();
  }

  const texto = crearTextoEjercicio(ejercicio, serieActual, totalSeries);

  actualizarPasoJarvis({
    fase: "ejercicios",
    ejercicioActual: ejercicio,
    preguntaActual: { tipo: "ejercicio", texto, ejercicioId: ejercicio.id, serie: serieActual }
  });

  return hablarJarvis(texto).then(() => ({ ok: true, fase: "ejercicios", ejercicio, serieActual }));
}

function crearTextoEjercicio(ejercicio, serieActual, totalSeries) {
  if (ejercicio.tipoRegistro === "cardio") {
    return `${ejercicio.nombre}. Realiza ${ejercicio.minutosObjetivo || ejercicio.duracionMin || "los"} minutos a ritmo controlado. ¿Ya lo completaste?`;
  }

  if (ejercicio.tipoRegistro === "hiit") {
    return `${ejercicio.nombre}. Ronda ${serieActual} de ${totalSeries}. Mantén control y respira. ¿Ya terminaste esta ronda?`;
  }

  const unidad = ejercicio.unidad || "repeticiones";
  const descanso = ejercicio.descansoSeg ? ` Luego descansa ${ejercicio.descansoSeg} segundos.` : "";
  return `${ejercicio.nombre}. Serie ${serieActual} de ${totalSeries}. Registra ${unidad} con buena técnica.${descanso} ¿Ya terminaste?`;
}

function avanzarIndicePaso() {
  const estado = obtenerEstadoJarvis();
  const sesion = leerSesionTemporal();

  if (!sesion) {
    return;
  }

  if (estado.fase === "calentamiento") {
    actualizarPasoJarvis({ indiceCalentamiento: estado.indiceCalentamiento + 1 });
    return;
  }

  if (estado.fase === "ejercicios") {
    actualizarPasoJarvis({ indiceSerie: estado.indiceSerie + 1 });
  }
}

function seleccionarDiaRutina(rutina, diaNumero = null) {
  const dias = Array.isArray(rutina?.dias) ? rutina.dias : [];
  const numero = Number(diaNumero || rutina?.diaActual || 1);
  return dias.find((dia) => Number(dia.numero) === numero) || dias[0] || null;
}

function normalizarCalentamiento(dia) {
  const origen = Array.isArray(dia.calentamiento) ? dia.calentamiento : [];

  if (!origen.length) {
    return [{ id: "cal_1", nombre: "Calentamiento general", duracionTexto: "5 minutos" }];
  }

  return origen.map((item, index) => ({
    id: item.id || `cal_${index + 1}`,
    nombre: item.nombre || item.actividad || `Calentamiento ${index + 1}`,
    duracionTexto: item.duracionTexto || item.duracion || `${item.duracionSeg || 45} segundos`
  }));
}

function normalizarEjercicios(dia) {
  const ejercicios = Array.isArray(dia.ejercicios) ? dia.ejercicios : [];

  return ejercicios.map((ejercicio, index) => ({
    ...ejercicio,
    id: ejercicio.id || `ej_${index + 1}`,
    nombre: ejercicio.nombre || `Ejercicio ${index + 1}`,
    tipoRegistro: ejercicio.tipoRegistro || "repeticiones",
    seriesObjetivo: Number(ejercicio.seriesObjetivo || ejercicio.series || 1),
    descansoSeg: Number(ejercicio.descansoSeg || ejercicio.descanso || 60)
  }));
}

function guardarSesionTemporal(sesion) {
  sessionStorage.setItem("fitjeff_jarvis_sesion", JSON.stringify(sesion));
}

function leerSesionTemporal() {
  try {
    return JSON.parse(sessionStorage.getItem("fitjeff_jarvis_sesion") || "null");
  } catch (_) {
    return null;
  }
}

function limpiarSesionTemporal() {
  sessionStorage.removeItem("fitjeff_jarvis_sesion");
}
