/*
  Nombre completo: exportacion.service.js
  Ruta o ubicación: src/exportacion/exportacion.service.js

  Función:
    - Exportar los datos de FitJeff a JSON y TXT.
    - Crear respaldos locales antes de borrar datos del dispositivo.
    - Preparar un resumen legible de entrenamientos, peso, estadísticas y recomendaciones.

  Se conecta con:
    - src/app-controller.js
    - src/storage/local-storage.service.js
    - src/estadisticas/estadisticas.service.js
    - src/ui/helpers.js
*/

import { generarResumenEstadistico } from "../estadisticas/estadisticas.service.js";
import { descargarTexto, formatearFechaHora } from "../ui/helpers.js";

export function crearBackupJSON(estado = {}) {
  return {
    app: "FitJeff",
    tipo: "backup-completo",
    version: "0.1.0",
    generadoEn: new Date().toISOString(),
    datos: estado,
    estadisticas: generarResumenEstadistico(estado)
  };
}

export function exportarBackupJSON(estado = {}) {
  const backup = crearBackupJSON(estado);
  const nombre = crearNombreArchivo("fitjeff-backup", "json");
  descargarTexto(nombre, JSON.stringify(backup, null, 2), "application/json");

  return {
    ok: true,
    nombre,
    backup
  };
}

export function crearResumenTXT(estado = {}) {
  const perfil = estado.usuario?.perfil || {};
  const estadisticas = generarResumenEstadistico(estado);
  const entrenamientos = estado.entrenamientos || [];
  const pesos = estado.pesos || [];
  const recomendaciones = estado.recomendaciones || [];

  const lineas = [];

  lineas.push("FITJEFF - RESUMEN EXPORTADO");
  lineas.push("================================");
  lineas.push(`Generado: ${formatearFechaHora(new Date().toISOString())}`);
  lineas.push("");

  lineas.push("PERFIL");
  lineas.push(`Edad: ${perfil.edad || 35}`);
  lineas.push(`Altura: ${perfil.alturaCm || 174} cm`);
  lineas.push(`Peso inicial: ${perfil.pesoInicialKg || 91} kg`);
  lineas.push(`Peso actual: ${estadisticas.peso?.pesoActualKg || perfil.pesoActualKg || 91} kg`);
  lineas.push(`Objetivo: ${perfil.objetivoPrincipal || "Sin objetivo registrado"}`);
  lineas.push("");

  lineas.push("ESTADÍSTICAS");
  lineas.push(`Entrenamientos totales: ${estadisticas.entrenamientos?.total || 0}`);
  lineas.push(`Completados: ${estadisticas.entrenamientos?.completados || 0}`);
  lineas.push(`Minutos totales: ${estadisticas.entrenamientos?.minutosTotales || 0}`);
  lineas.push(`Cumplimiento semanal: ${estadisticas.cumplimiento?.porcentajeSemana || 0}%`);
  lineas.push(`Fatiga: ${estadisticas.fatiga?.nivel || "sin datos"}`);
  lineas.push("");

  lineas.push("ÚLTIMOS PESOS");
  pesos.slice(0, 10).forEach((peso) => {
    lineas.push(`- ${peso.fecha}: ${peso.pesoKg} kg (${peso.momento || "sin momento"}) ${peso.observacion || ""}`);
  });
  if (!pesos.length) lineas.push("Sin registros de peso.");
  lineas.push("");

  lineas.push("ÚLTIMOS ENTRENAMIENTOS");
  entrenamientos.slice(0, 10).forEach((entrenamiento) => {
    lineas.push(`- ${entrenamiento.fecha}: Día ${entrenamiento.diaRutina}, ${entrenamiento.estado}, ${entrenamiento.duracionMin} min, energía final ${entrenamiento.energiaFinal}`);
    if (entrenamiento.observacion) {
      lineas.push(`  Observación: ${entrenamiento.observacion}`);
    }
  });
  if (!entrenamientos.length) lineas.push("Sin entrenamientos registrados.");
  lineas.push("");

  lineas.push("RECOMENDACIONES GUARDADAS");
  recomendaciones.slice(0, 5).forEach((rec) => {
    lineas.push(`- ${rec.fecha || rec.creadoEn}: ${rec.origen || "local"}`);
    if (rec.resumen) lineas.push(`  ${rec.resumen}`);
  });
  if (!recomendaciones.length) lineas.push("Sin recomendaciones guardadas.");

  return lineas.join("\n");
}

export function exportarResumenTXT(estado = {}) {
  const contenido = crearResumenTXT(estado);
  const nombre = crearNombreArchivo("fitjeff-resumen", "txt");
  descargarTexto(nombre, contenido, "text/plain");

  return {
    ok: true,
    nombre,
    contenido
  };
}

export function exportarDatosCompletos(estado = {}) {
  const json = exportarBackupJSON(estado);
  const txt = exportarResumenTXT(estado);

  return {
    ok: true,
    archivos: [json.nombre, txt.nombre]
  };
}

function crearNombreArchivo(base, extension) {
  const fecha = new Date().toISOString().slice(0, 19).replaceAll(":", "-");
  return `${base}_${fecha}.${extension}`;
}
