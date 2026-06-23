/*
  Nombre completo: reportes.storage.service.js
  Ruta o ubicación: src/reportes/reportes.storage.service.js

  Función:
    - Guardar reportes generados localmente.
    - Consultar historial de reportes.
    - Eliminar reportes guardados.

  Se conecta con:
    - src/reportes/reportes.schema.js
    - src/vistas/reportes.view.js
*/

import { REPORTE_CONFIG, crearReporteBase } from "./reportes.schema.js";

const STORAGE_KEY_REPORTES = "fitjeff_reportes_guardados";

export function obtenerReportesGuardados() {
  try {
    const datos = JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTES) || "[]");

    if (!Array.isArray(datos)) {
      return [];
    }

    return datos
      .map(crearReporteBase)
      .sort((a, b) => String(b.creadoEn).localeCompare(String(a.creadoEn)));
  } catch (_) {
    return [];
  }
}

export function guardarReporteLocal(reporte) {
  if (!reporte) {
    return {
      ok: false,
      mensaje: "No existe reporte para guardar.",
      reportes: obtenerReportesGuardados()
    };
  }

  const normalizado = crearReporteBase(reporte);
  const actuales = obtenerReportesGuardados().filter((item) => item.id !== normalizado.id);
  const nuevos = [normalizado, ...actuales].slice(0, REPORTE_CONFIG.maxReportesGuardados);

  localStorage.setItem(STORAGE_KEY_REPORTES, JSON.stringify(nuevos));

  return {
    ok: true,
    mensaje: "Reporte guardado.",
    reporte: normalizado,
    reportes: nuevos
  };
}

export function eliminarReporteLocal(id) {
  const nuevos = obtenerReportesGuardados().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY_REPORTES, JSON.stringify(nuevos));

  return {
    ok: true,
    mensaje: "Reporte eliminado.",
    reportes: nuevos
  };
}

export function limpiarReportesLocales() {
  localStorage.removeItem(STORAGE_KEY_REPORTES);

  return {
    ok: true,
    mensaje: "Historial de reportes limpiado.",
    reportes: []
  };
}

export function obtenerUltimoReporteGuardado() {
  return obtenerReportesGuardados()[0] || null;
}
