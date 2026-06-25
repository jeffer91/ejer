/*
  Nombre completo: date.util.js
  Ruta o ubicación: src/core/utils/date.util.js

  Función o funciones:
    - Centralizar utilidades de fecha usadas por toda la app.
    - Evitar repetir cálculos de hoy, ISO y diferencia de días.
    - Mantener compatibilidad con web, Electron y Android.

  Se conecta con:
    - src/core/status/app-status.service.js
    - src/modules/registro/estadisticas/estadisticas.calculations.js
    - futuros módulos de recordatorios y sincronización.
*/

export function obtenerFechaHoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export function obtenerFechaHoraISO() {
  return new Date().toISOString();
}

export function convertirAFechaSegura(fecha) {
  if (!fecha) {
    return null;
  }

  const valor = new Date(`${fecha}T12:00:00`);
  return Number.isNaN(valor.getTime()) ? null : valor;
}

export function sumarDiasISO(fecha, dias) {
  const base = convertirAFechaSegura(fecha) || new Date();
  base.setDate(base.getDate() + Number(dias || 0));
  return base.toISOString().slice(0, 10);
}

export function diferenciaDias(fechaInicio, fechaFin = obtenerFechaHoyISO()) {
  const inicio = convertirAFechaSegura(fechaInicio);
  const fin = convertirAFechaSegura(fechaFin);

  if (!inicio || !fin) {
    return null;
  }

  const diferenciaMs = fin.getTime() - inicio.getTime();
  return Math.round(diferenciaMs / 86400000);
}

export function fechaVisible(fecha) {
  return fecha || "Sin fecha";
}
