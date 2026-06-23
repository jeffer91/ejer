/*
  Nombre completo: reportes.export.service.js
  Ruta o ubicación: src/reportes/reportes.export.service.js

  Función:
    - Exportar reportes en JSON, TXT y CSV.
    - Crear descargas locales desde el navegador.
    - Generar texto reutilizable para copiar o respaldar.

  Se conecta con:
    - src/reportes/reportes.format.service.js
    - src/vistas/reportes.view.js
*/

import { REPORTE_FORMATOS } from "./reportes.schema.js";
import { escaparCSV, formatoFechaReporte, formatoKgReporte, formatoMinReporte, nombreArchivoSeguro } from "./reportes.format.service.js";

export function exportarReporte(reporte, formato = REPORTE_FORMATOS.TXT) {
  if (!reporte) {
    return {
      ok: false,
      mensaje: "No existe reporte para exportar."
    };
  }

  if (formato === REPORTE_FORMATOS.JSON) {
    return descargarTexto({
      nombre: `${nombreArchivoSeguro(reporte.titulo)}.json`,
      contenido: JSON.stringify(reporte, null, 2),
      tipo: "application/json"
    });
  }

  if (formato === REPORTE_FORMATOS.CSV) {
    return descargarTexto({
      nombre: `${nombreArchivoSeguro(reporte.titulo)}.csv`,
      contenido: crearCSVReporte(reporte),
      tipo: "text/csv"
    });
  }

  return descargarTexto({
    nombre: `${nombreArchivoSeguro(reporte.titulo)}.txt`,
    contenido: crearTextoReporte(reporte),
    tipo: "text/plain"
  });
}

export function crearTextoReporte(reporte) {
  const resumen = reporte.resumen || {};

  return [
    reporte.titulo,
    "",
    `Periodo: ${resumen.periodo || `${reporte.desde} a ${reporte.hasta}`}`,
    `Entrenamientos: ${resumen.entrenamientos || 0}`,
    `Completados: ${resumen.entrenamientosCompletados || 0}`,
    `Minutos: ${formatoMinReporte(resumen.minutosTotales || 0)}`,
    `Peso actual: ${formatoKgReporte(resumen.pesoActual)}`,
    `Medidas registradas: ${resumen.medidasRegistradas || 0}`,
    `Energía promedio: ${resumen.energiaPromedio ?? "-"}`,
    `Fatiga: ${resumen.fatiga || "sin datos"}`,
    "",
    "Alertas:",
    ...(reporte.alertas || []).map((item) => `- ${item}`),
    "",
    "Entrenamientos:",
    ...(reporte.entrenamientos || []).map((item) =>
      `- ${formatoFechaReporte(item.fecha)} | Día ${item.diaRutina || "-"} | ${item.nombreDia || "Entrenamiento"} | ${formatoMinReporte(item.duracionMin || 0)} | ${item.estado || "-"}`
    ),
    "",
    "Medidas:",
    ...(reporte.medidas || []).map((item) =>
      `- ${formatoFechaReporte(item.fecha)} | Peso ${formatoKgReporte(item.pesoKg)} | Cintura ${item.cinturaCm ?? "-"} cm | Energía ${item.energiaSemana ?? "-"}`
    ),
    "",
    "Observaciones:",
    ...(reporte.observaciones || []).map((item) => `- ${item}`)
  ].join("\n");
}

export function crearCSVReporte(reporte) {
  const filas = [
    ["tipo", "fecha", "detalle", "valor_1", "valor_2", "estado"]
  ];

  (reporte.entrenamientos || []).forEach((item) => {
    filas.push([
      "entrenamiento",
      item.fecha || "",
      `Día ${item.diaRutina || ""} - ${item.nombreDia || ""}`,
      item.duracionMin || 0,
      item.energiaFinal || "",
      item.estado || ""
    ]);
  });

  (reporte.medidas || []).forEach((item) => {
    filas.push([
      "medida",
      item.fecha || "",
      "medida semanal",
      item.pesoKg ?? "",
      item.cinturaCm ?? "",
      `energia ${item.energiaSemana ?? ""}`
    ]);
  });

  return filas.map((fila) => fila.map(escaparCSV).join(",")).join("\n");
}

function descargarTexto({ nombre, contenido, tipo }) {
  const blob = new Blob([contenido], { type: `${tipo};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);

  return {
    ok: true,
    mensaje: `Archivo generado: ${nombre}`,
    nombre
  };
}
