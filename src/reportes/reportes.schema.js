/*
  Nombre completo: reportes.schema.js
  Ruta o ubicación: src/reportes/reportes.schema.js

  Función:
    - Definir la estructura oficial de reportes en FitJeff.
    - Normalizar rangos, tipos y registros guardados.
    - Centralizar límites y tipos de exportación.

  Se conecta con:
    - src/reportes/reportes.service.js
    - src/reportes/reportes.storage.service.js
    - src/reportes/reportes.export.service.js
    - src/vistas/reportes.view.js
*/

export const REPORTE_TIPOS = Object.freeze({
  SEMANAL: "semanal",
  MENSUAL: "mensual",
  COMPLETO: "completo"
});

export const REPORTE_FORMATOS = Object.freeze({
  JSON: "json",
  TXT: "txt",
  CSV: "csv"
});

export const REPORTE_CONFIG = Object.freeze({
  version: "1.0.0",
  maxReportesGuardados: 30,
  maxEntrenamientosHistorial: 25,
  maxMedidasHistorial: 20,
  diasSemana: 7,
  diasMes: 30
});

export function crearReporteBase(datos = {}) {
  const ahora = new Date();

  return {
    id: datos.id || `reporte_${Date.now()}`,
    tipo: normalizarTipoReporte(datos.tipo || REPORTE_TIPOS.SEMANAL),
    titulo: datos.titulo || "Reporte FitJeff",
    desde: datos.desde || "",
    hasta: datos.hasta || ahora.toISOString().slice(0, 10),
    resumen: datos.resumen || {},
    entrenamientos: Array.isArray(datos.entrenamientos) ? datos.entrenamientos : [],
    medidas: Array.isArray(datos.medidas) ? datos.medidas : [],
    alertas: Array.isArray(datos.alertas) ? datos.alertas : [],
    observaciones: Array.isArray(datos.observaciones) ? datos.observaciones : [],
    creadoEn: datos.creadoEn || ahora.toISOString()
  };
}

export function normalizarTipoReporte(tipo) {
  const limpio = String(tipo || "").toLowerCase().trim();

  if (Object.values(REPORTE_TIPOS).includes(limpio)) {
    return limpio;
  }

  return REPORTE_TIPOS.SEMANAL;
}

export function crearRangoReporte(tipo = REPORTE_TIPOS.SEMANAL, fechaBase = new Date()) {
  const hasta = new Date(fechaBase);
  const desde = new Date(fechaBase);
  const tipoNormalizado = normalizarTipoReporte(tipo);

  if (tipoNormalizado === REPORTE_TIPOS.MENSUAL) {
    desde.setDate(hasta.getDate() - REPORTE_CONFIG.diasMes + 1);
  } else if (tipoNormalizado === REPORTE_TIPOS.COMPLETO) {
    desde.setFullYear(2000, 0, 1);
  } else {
    desde.setDate(hasta.getDate() - REPORTE_CONFIG.diasSemana + 1);
  }

  return {
    tipo: tipoNormalizado,
    desde: desde.toISOString().slice(0, 10),
    hasta: hasta.toISOString().slice(0, 10)
  };
}

export function fechaEnRango(fecha, desde, hasta) {
  const valor = String(fecha || "").slice(0, 10);

  if (!valor) {
    return false;
  }

  return valor >= desde && valor <= hasta;
}

export function crearResultadoReporte(ok = true, mensaje = "") {
  return {
    ok,
    mensaje,
    errores: [],
    advertencias: []
  };
}
