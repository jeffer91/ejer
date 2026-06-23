/*
  Nombre completo: medidas.format.service.js
  Ruta o ubicación: src/medidas/medidas.format.service.js

  Función:
    - Formatear valores de medidas para vistas.
    - Evitar repetir lógica visual en la pantalla de medidas.

  Se conecta con:
    - src/vistas/medidas.view.js
*/

export function formatoMedida(valor, sufijo = "") {
  if (valor === null || valor === undefined || valor === "") {
    return "-";
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "-";
  }

  return `${Math.round(numero * 10) / 10}${sufijo}`;
}

export function formatearFechaCorta(fechaISO) {
  try {
    return new Date(`${fechaISO}T00:00:00`).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit"
    });
  } catch (_) {
    return fechaISO || "";
  }
}

export function escapeHTML(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
