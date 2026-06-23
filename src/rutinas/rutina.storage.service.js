/*
  Nombre completo: rutina.storage.service.js
  Ruta o ubicación: src/rutinas/rutina.storage.service.js

  Función:
    - Guardar importación actual.
    - Guardar respaldo local de rutinas antes de aplicar cambios.
    - Permitir restaurar la última rutina.

  Se conecta con:
    - src/rutinas/rutina.import.service.js
    - src/vistas/rutinas.view.js
*/

const STORAGE_KEY_IMPORTACION = "fitjeff_rutina_importacion_actual";
const STORAGE_KEY_HISTORIAL = "fitjeff_rutina_historial";

export function guardarImportacionActual(importacion) {
  localStorage.setItem(STORAGE_KEY_IMPORTACION, JSON.stringify(importacion || null));
  return importacion;
}

export function obtenerImportacionActual() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_IMPORTACION) || "null");
  } catch (_) {
    return null;
  }
}

export function limpiarImportacionActual() {
  localStorage.removeItem(STORAGE_KEY_IMPORTACION);
}

export function guardarRutinaEnHistorial(rutina, extra = {}) {
  if (!rutina) return [];

  const historial = obtenerHistorialRutinas();
  const registro = {
    id: `hist_rutina_${Date.now()}`,
    rutina: clonar(rutina),
    motivo: extra.motivo || "Respaldo de rutina",
    origen: extra.origen || "local",
    creadoEn: new Date().toISOString()
  };

  const nuevo = [registro, ...historial].slice(0, 25);
  localStorage.setItem(STORAGE_KEY_HISTORIAL, JSON.stringify(nuevo));

  return nuevo;
}

export function obtenerHistorialRutinas() {
  try {
    const historial = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORIAL) || "[]");
    return Array.isArray(historial) ? historial : [];
  } catch (_) {
    return [];
  }
}

export function obtenerUltimaRutinaHistorial() {
  return obtenerHistorialRutinas()[0] || null;
}

export function limpiarHistorialRutinas() {
  localStorage.removeItem(STORAGE_KEY_HISTORIAL);
  return [];
}

function clonar(valor) {
  return JSON.parse(JSON.stringify(valor));
}
