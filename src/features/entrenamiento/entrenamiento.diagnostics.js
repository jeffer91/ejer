/*
  Nombre completo: entrenamiento.diagnostics.js
  Ruta o ubicación: src/features/entrenamiento/entrenamiento.diagnostics.js

  Función o funciones:
    - Revisar consistencia básica del módulo Entrenamiento.
    - Detectar rutinas activas duplicadas, rutinas vacías y sesiones incompletas.
    - Entregar alertas simples para Stats y revisión final.

  Se conecta con:
    - src/features/entrenamiento/stats/stats.service.js
*/

import {
  ENTRENAMIENTO_ESTADOS_RUTINA,
  ENTRENAMIENTO_ESTADOS_SESION
} from "./entrenamiento.constants.js";

function lista(valor) {
  return Array.isArray(valor) ? valor : [];
}

function tieneEjercicios(rutina = {}) {
  return lista(rutina.dias).some((dia) => lista(dia.ejercicios).length > 0);
}

function crearAlerta(tipo, texto) {
  return { tipo, texto };
}

export function diagnosticarEntrenamiento(estado = {}) {
  const rutinas = lista(estado.rutinas);
  const sesiones = lista(estado.sesiones);
  const cardio = lista(estado.cardio);
  const ajustes = estado.ajustes || {};
  const activas = rutinas.filter((rutina) => rutina.estado === ENTRENAMIENTO_ESTADOS_RUTINA.ACTIVA);
  const archivadas = rutinas.filter((rutina) => rutina.estado === ENTRENAMIENTO_ESTADOS_RUTINA.ARCHIVADA);
  const rutinasVacias = rutinas.filter((rutina) => rutina.estado !== ENTRENAMIENTO_ESTADOS_RUTINA.ARCHIVADA && !tieneEjercicios(rutina));
  const sesionesCompletadasSinDetalle = sesiones.filter((sesion) => {
    return sesion.estado === ENTRENAMIENTO_ESTADOS_SESION.COMPLETADA && Number(sesion.ejerciciosCompletados || 0) > 0 && lista(sesion.detalleEjercicios).length === 0;
  });
  const cardioInvalido = cardio.filter((item) => Number(item.tiempoMinutos || 0) < 0);
  const alertas = [];

  if (activas.length > 1) {
    alertas.push(crearAlerta("pendiente", "Hay más de una rutina activa. Revisa Rutinas y deja solo una."));
  }

  if (rutinasVacias.length > 0) {
    alertas.push(crearAlerta("pendiente", "Hay rutinas sin ejercicios reales. Edita o archiva esas rutinas."));
  }

  if (sesionesCompletadasSinDetalle.length > 0) {
    alertas.push(crearAlerta("info", "Existen sesiones antiguas sin detalle por ejercicio."));
  }

  if (cardioInvalido.length > 0) {
    alertas.push(crearAlerta("pendiente", "Hay registros de cardio con tiempo inválido."));
  }

  if (ajustes.iaActiva && !ajustes.geminiApiKey) {
    alertas.push(crearAlerta("pendiente", "La IA está activa, pero falta API Key de Gemini."));
  }

  return {
    ok: alertas.length === 0,
    alertas,
    resumen: {
      rutinas: rutinas.length,
      rutinasActivas: activas.length,
      rutinasArchivadas: archivadas.length,
      sesiones: sesiones.length,
      cardio: cardio.length,
      tieneGemini: Boolean(ajustes.geminiApiKey),
      iaActiva: Boolean(ajustes.iaActiva),
      vozActiva: Boolean(ajustes.vozActiva)
    }
  };
}
