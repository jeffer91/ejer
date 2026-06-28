/*
  Nombre completo: date.util.js
  Ruta o ubicacion: src/core/utils/date.util.js

  Funcion o funciones:
    - Centralizar utilidades de fecha usadas por toda la app.
    - Evitar desfases por UTC al calcular la fecha local del usuario.
    - Mantener compatibilidad con web, Electron y Android.

  Se conecta con:
    - src/core/status/app-status.service.js
    - src/features/control-corporal/registro/ingreso.parser.js
    - src/features/control-corporal/hoy/hoy.rules.js
    - src/features/actividad/actividad.constants.js
    - src/features/actividad/actividad.service.js
*/

function pad2(valor) {
  return String(valor).padStart(2, "0");
}

export function formatearFechaLocalISO(fecha = new Date()) {
  const fechaSegura = fecha instanceof Date ? fecha : new Date(fecha);

  if (Number.isNaN(fechaSegura.getTime())) {
    return null;
  }

  const anio = fechaSegura.getFullYear();
  const mes = pad2(fechaSegura.getMonth() + 1);
  const dia = pad2(fechaSegura.getDate());

  return `${anio}-${mes}-${dia}`;
}

export function obtenerFechaHoyISO() {
  return formatearFechaLocalISO(new Date());
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
  return formatearFechaLocalISO(base);
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
