/*
  Nombre completo: reportes.service.js
  Ruta o ubicación: src/reportes/reportes.service.js

  Función:
    - Construir reportes semanales, mensuales o completos.
    - Unir entrenamientos, medidas, estadísticas y observaciones.
    - Preparar resúmenes e historial para la vista de reportes.

  Se conecta con:
    - src/reportes/reportes.schema.js
    - src/reportes/reportes.format.service.js
    - src/estadisticas/estadisticas.service.js
    - src/medidas/medidas.storage.service.js
    - src/vistas/reportes.view.js
*/

import { generarResumenEstadistico } from "../estadisticas/estadisticas.service.js";
import { obtenerMedidasSemanales } from "../medidas/medidas.storage.service.js";
import { ordenarPorFechaDesc } from "../ui/helpers.js";
import { REPORTE_CONFIG, REPORTE_TIPOS, crearRangoReporte, crearReporteBase, fechaEnRango, normalizarTipoReporte } from "./reportes.schema.js";
import { formatoKgReporte, formatoMinReporte, limpiarTextoReporte } from "./reportes.format.service.js";

export function crearReporteFitJeff(estado = {}, tipo = REPORTE_TIPOS.SEMANAL) {
  const rango = crearRangoReporte(normalizarTipoReporte(tipo));
  const entrenamientos = filtrarEntrenamientosPorRango(estado.entrenamientos || [], rango.desde, rango.hasta);
  const medidas = filtrarMedidasPorRango(obtenerMedidasSemanales(), rango.desde, rango.hasta);
  const estadisticas = generarResumenEstadistico(estado);
  const resumen = crearResumenReporte({ estado, entrenamientos, medidas, estadisticas, rango });

  return crearReporteBase({
    tipo: rango.tipo,
    titulo: crearTituloReporte(rango.tipo, rango.desde, rango.hasta),
    desde: rango.desde,
    hasta: rango.hasta,
    resumen,
    entrenamientos: entrenamientos.slice(0, REPORTE_CONFIG.maxEntrenamientosHistorial),
    medidas: medidas.slice(0, REPORTE_CONFIG.maxMedidasHistorial),
    alertas: crearAlertasReporte({ entrenamientos, medidas, estadisticas }),
    observaciones: crearObservacionesReporte(entrenamientos)
  });
}

export function crearHistorialGeneral(estado = {}) {
  const entrenamientos = ordenarPorFechaDesc(estado.entrenamientos || []);
  const medidas = obtenerMedidasSemanales();

  return {
    entrenamientos: entrenamientos.slice(0, REPORTE_CONFIG.maxEntrenamientosHistorial),
    medidas: medidas.slice(0, REPORTE_CONFIG.maxMedidasHistorial),
    totalEntrenamientos: entrenamientos.length,
    totalMedidas: medidas.length
  };
}

export function crearResumenReporte({ estado, entrenamientos, medidas, estadisticas, rango }) {
  const minutos = entrenamientos.reduce((total, item) => total + Number(item.duracionMin || 0), 0);
  const entrenosCompletados = entrenamientos.filter((item) => item.estado === "completo" || item.estado === "completado").length;
  const pesoFinal = medidas[0]?.pesoKg || estadisticas.peso?.pesoActualKg || estado.usuario?.perfil?.pesoActualKg || null;
  const energiaFinalPromedio = promedio(entrenamientos.map((item) => item.energiaFinal));

  return {
    tipo: rango.tipo,
    periodo: `${rango.desde} a ${rango.hasta}`,
    entrenamientos: entrenamientos.length,
    entrenamientosCompletados: entrenosCompletados,
    minutosTotales: minutos,
    minutosTexto: formatoMinReporte(minutos),
    pesoActual: pesoFinal,
    pesoTexto: formatoKgReporte(pesoFinal),
    medidasRegistradas: medidas.length,
    energiaPromedio: energiaFinalPromedio,
    cumplimientoSemana: estadisticas.cumplimiento?.porcentajeSemana || 0,
    fatiga: estadisticas.fatiga?.nivel || "sin datos"
  };
}

export function crearAlertasReporte({ entrenamientos, medidas, estadisticas }) {
  const alertas = [];

  if (!entrenamientos.length) {
    alertas.push("No se registraron entrenamientos en el periodo.");
  }

  if (!medidas.length) {
    alertas.push("No se registraron medidas en el periodo.");
  }

  if ((estadisticas.fatiga?.nivel || "") === "alto") {
    alertas.push(estadisticas.fatiga?.mensaje || "Fatiga alta detectada.");
  }

  if (entrenamientos.length >= 3) {
    alertas.push("Hay constancia suficiente para analizar el periodo.");
  }

  return alertas;
}

export function crearObservacionesReporte(entrenamientos = []) {
  return entrenamientos
    .map((item) => limpiarTextoReporte(item.observacion || ""))
    .filter(Boolean)
    .slice(0, 10);
}

export function crearTituloReporte(tipo, desde, hasta) {
  if (tipo === REPORTE_TIPOS.MENSUAL) {
    return `Reporte mensual FitJeff (${desde} a ${hasta})`;
  }

  if (tipo === REPORTE_TIPOS.COMPLETO) {
    return `Reporte completo FitJeff (${hasta})`;
  }

  return `Reporte semanal FitJeff (${desde} a ${hasta})`;
}

function filtrarEntrenamientosPorRango(entrenamientos, desde, hasta) {
  return ordenarPorFechaDesc(entrenamientos)
    .filter((item) => fechaEnRango(item.fecha || item.creadoEn, desde, hasta));
}

function filtrarMedidasPorRango(medidas, desde, hasta) {
  return medidas
    .filter((item) => fechaEnRango(item.fecha, desde, hasta))
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
}

function promedio(lista) {
  const limpia = lista.filter((valor) => Number.isFinite(Number(valor)));

  if (!limpia.length) {
    return null;
  }

  const total = limpia.reduce((suma, valor) => suma + Number(valor), 0);
  return Math.round((total / limpia.length) * 10) / 10;
}
