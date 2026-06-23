/*
  Nombre completo: dashboard.format.service.js
  Ruta o ubicación: src/dashboard/dashboard.format.service.js

  Función:
    - Formatear números, porcentajes, fechas y textos cortos del dashboard.
    - Evitar que las vistas repitan lógica de presentación.

  Se conecta con:
    - src/dashboard/dashboard.service.js
    - src/dashboard/dashboard.graficas.service.js
    - src/vistas/inicio.view.js
    - src/vistas/estadisticas.view.js
*/

export function formatoNumero(valor, decimales = 0, vacio = "-") {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return vacio;
  }

  return String(Math.round(numero * 10 ** decimales) / 10 ** decimales);
}

export function formatoKg(valor) {
  const numero = formatoNumero(valor, 1);
  return numero === "-" ? "-" : `${numero} kg`;
}

export function formatoCm(valor) {
  const numero = formatoNumero(valor, 1);
  return numero === "-" ? "-" : `${numero} cm`;
}

export function formatoMinutos(valor) {
  const numero = formatoNumero(valor, 0, "0");
  return `${numero} min`;
}

export function formatoPorcentaje(valor) {
  const numero = formatoNumero(valor, 0, "0");
  return `${numero}%`;
}

export function formatoFechaCorta(fechaISO) {
  if (!fechaISO) {
    return "-";
  }

  try {
    return new Date(`${fechaISO}T00:00:00`).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "short"
    });
  } catch (_) {
    return fechaISO;
  }
}

export function limitarTextoDashboard(texto = "", max = 90) {
  const limpio = String(texto || "").replace(/\s+/g, " ").trim();

  if (limpio.length <= max) {
    return limpio;
  }

  return `${limpio.slice(0, max - 1)}…`;
}

export function escapeDashboard(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
