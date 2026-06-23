/*
  Nombre completo: reportes.format.service.js
  Ruta o ubicación: src/reportes/reportes.format.service.js

  Función:
    - Formatear valores usados en reportes.
    - Preparar texto seguro para HTML, TXT y CSV.
    - Mantener limpio el render de la vista.

  Se conecta con:
    - src/reportes/reportes.service.js
    - src/reportes/reportes.export.service.js
    - src/vistas/reportes.view.js
*/

export function formatoNumeroReporte(valor, decimales = 0, vacio = "-") {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return vacio;
  }

  return String(Math.round(numero * 10 ** decimales) / 10 ** decimales);
}

export function formatoKgReporte(valor) {
  const numero = formatoNumeroReporte(valor, 1);

  return numero === "-" ? "-" : `${numero} kg`;
}

export function formatoCmReporte(valor) {
  const numero = formatoNumeroReporte(valor, 1);

  return numero === "-" ? "-" : `${numero} cm`;
}

export function formatoMinReporte(valor) {
  const numero = formatoNumeroReporte(valor, 0, "0");

  return `${numero} min`;
}

export function formatoFechaReporte(fechaISO) {
  if (!fechaISO) {
    return "-";
  }

  try {
    return new Date(`${String(fechaISO).slice(0, 10)}T00:00:00`).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  } catch (_) {
    return String(fechaISO);
  }
}

export function limpiarTextoReporte(valor = "") {
  return String(valor || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function escaparHTMLReporte(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function escaparCSV(valor) {
  const texto = String(valor ?? "").replaceAll('"', '""');

  if (texto.includes(",") || texto.includes("\n") || texto.includes('"')) {
    return `"${texto}"`;
  }

  return texto;
}

export function nombreArchivoSeguro(nombre = "fitjeff-reporte") {
  return String(nombre || "fitjeff-reporte")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "fitjeff-reporte";
}
