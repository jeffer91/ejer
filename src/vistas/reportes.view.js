/*
  Nombre completo: reportes.view.js
  Ruta o ubicación: src/vistas/reportes.view.js

  Función:
    - Renderizar pantalla de historial y reportes.
    - Generar reportes semanales, mensuales o completos.
    - Guardar y exportar reportes en JSON, TXT y CSV.

  Se conecta con:
    - src/reportes/reportes.service.js
    - src/reportes/reportes.storage.service.js
    - src/reportes/reportes.export.service.js
    - src/storage/local-storage.service.js
    - src/ui/router.js
*/

import { cargarEstadoLocal } from "../storage/local-storage.service.js";
import { escaparHTML, leerFormulario } from "../ui/helpers.js";
import { mostrarMensaje } from "../ui/modal.js";
import { crearEncabezadoVista } from "./componentes.view.js";
import { crearHistorialGeneral, crearReporteFitJeff } from "../reportes/reportes.service.js";
import { eliminarReporteLocal, guardarReporteLocal, obtenerReportesGuardados, obtenerUltimoReporteGuardado } from "../reportes/reportes.storage.service.js";
import { exportarReporte } from "../reportes/reportes.export.service.js";
import { REPORTE_FORMATOS, REPORTE_TIPOS } from "../reportes/reportes.schema.js";
import { formatoFechaReporte, formatoKgReporte, formatoMinReporte } from "../reportes/reportes.format.service.js";

let eventosReportesActivos = false;
let reporteActual = null;

export function renderReportesView(estadoRecibido = null) {
  activarEventosReportes();

  const estado = estadoRecibido || cargarEstadoLocal();
  const historial = crearHistorialGeneral(estado);
  const reportes = obtenerReportesGuardados();
  const ultimo = reporteActual || obtenerUltimoReporteGuardado();

  return `
    ${crearEncabezadoVista({
      titulo: "Historial y reportes",
      subtitulo: "Revisa tus entrenamientos, medidas y exporta reportes para respaldar tu progreso.",
      pill: "Reportes"
    })}

    <section class="grid grid-2 section-space">
      <article class="card">
        <h2>Generar reporte</h2>
        <p class="muted">El reporte se crea con los datos guardados actualmente en FitJeff.</p>

        <form id="form-reportes" class="form-grid">
          <div class="campo">
            <label for="tipoReporte">Tipo de reporte</label>
            <select id="tipoReporte" name="tipoReporte">
              <option value="${REPORTE_TIPOS.SEMANAL}">Semanal</option>
              <option value="${REPORTE_TIPOS.MENSUAL}">Mensual</option>
              <option value="${REPORTE_TIPOS.COMPLETO}">Completo</option>
            </select>
          </div>
        </form>

        <div class="acciones">
          <button class="btn" data-action="reportes-generar">Generar</button>
          <button class="btn secundario" data-action="reportes-guardar" ${ultimo ? "" : "disabled"}>Guardar</button>
        </div>
      </article>

      <article class="card">
        <h2>Resumen general</h2>
        <div class="grid-2">
          <div class="metric">
            <span>Entrenamientos</span>
            <strong>${escaparHTML(historial.totalEntrenamientos)}</strong>
          </div>
          <div class="metric">
            <span>Medidas</span>
            <strong>${escaparHTML(historial.totalMedidas)}</strong>
          </div>
        </div>
      </article>
    </section>

    <section class="grid grid-2 section-space">
      <article class="card">
        <h2>Reporte actual</h2>
        ${renderReporteActual(ultimo)}
      </article>

      <article class="card">
        <h2>Reportes guardados</h2>
        ${renderReportesGuardados(reportes)}
      </article>
    </section>

    <section class="grid grid-2 section-space">
      <article class="card">
        <h2>Entrenamientos recientes</h2>
        ${renderEntrenamientos(historial.entrenamientos)}
      </article>

      <article class="card">
        <h2>Medidas recientes</h2>
        ${renderMedidas(historial.medidas)}
      </article>
    </section>
  `;
}

function activarEventosReportes() {
  if (eventosReportesActivos) return;
  eventosReportesActivos = true;

  document.body.addEventListener("click", (event) => {
    const accion = event.target.closest("[data-action]")?.dataset.action;
    const idReporte = event.target.closest("[data-reporte-id]")?.dataset.reporteId;

    if (!accion) return;

    if (accion === "reportes-generar") {
      accionGenerarReporte();
    }

    if (accion === "reportes-guardar") {
      accionGuardarReporte();
    }

    if (accion === "reportes-exportar-json") {
      accionExportar(REPORTE_FORMATOS.JSON);
    }

    if (accion === "reportes-exportar-txt") {
      accionExportar(REPORTE_FORMATOS.TXT);
    }

    if (accion === "reportes-exportar-csv") {
      accionExportar(REPORTE_FORMATOS.CSV);
    }

    if (accion === "reportes-eliminar" && idReporte) {
      eliminarReporteLocal(idReporte);
      mostrarMensaje("Reporte eliminado", "El reporte fue eliminado del historial local.", "ok");
      refrescarReportes();
    }
  });
}

function accionGenerarReporte() {
  const datos = leerFormulario("#form-reportes");
  const estado = cargarEstadoLocal();
  reporteActual = crearReporteFitJeff(estado, datos.tipoReporte || REPORTE_TIPOS.SEMANAL);

  mostrarMensaje("Reporte generado", "El reporte quedó listo para guardar o exportar.", "ok");
  refrescarReportes();
}

function accionGuardarReporte() {
  if (!reporteActual) {
    reporteActual = obtenerUltimoReporteGuardado();
  }

  const resultado = guardarReporteLocal(reporteActual);

  mostrarMensaje(resultado.ok ? "Reporte guardado" : "Reporte no guardado", resultado.mensaje, resultado.ok ? "ok" : "error");
  refrescarReportes();
}

function accionExportar(formato) {
  const reporte = reporteActual || obtenerUltimoReporteGuardado();

  if (!reporte) {
    mostrarMensaje("Sin reporte", "Primero genera un reporte.", "error");
    return;
  }

  const resultado = exportarReporte(reporte, formato);
  mostrarMensaje(resultado.ok ? "Exportación lista" : "Exportación no completada", resultado.mensaje, resultado.ok ? "ok" : "error");
}

function refrescarReportes() {
  const vista = document.getElementById("vista");

  if (!vista) return;

  vista.innerHTML = renderReportesView();
  vista.focus({ preventScroll: true });
}

function renderReporteActual(reporte) {
  if (!reporte) {
    return `<p class="muted">Todavía no se generó ningún reporte.</p>`;
  }

  const resumen = reporte.resumen || {};

  return `
    <h3>${escaparHTML(reporte.titulo)}</h3>
    <p class="muted">${escaparHTML(resumen.periodo || `${reporte.desde} a ${reporte.hasta}`)}</p>

    <div class="grid-2">
      <div class="metric">
        <span>Entrenamientos</span>
        <strong>${escaparHTML(resumen.entrenamientos || 0)}</strong>
      </div>
      <div class="metric">
        <span>Minutos</span>
        <strong>${escaparHTML(resumen.minutosTotales || 0)}</strong>
      </div>
      <div class="metric">
        <span>Peso</span>
        <strong>${escaparHTML(formatoKgReporte(resumen.pesoActual))}</strong>
      </div>
      <div class="metric">
        <span>Medidas</span>
        <strong>${escaparHTML(resumen.medidasRegistradas || 0)}</strong>
      </div>
    </div>

    <div class="section-space">
      <h4>Alertas</h4>
      ${(reporte.alertas || []).length
        ? `<ul>${reporte.alertas.map((item) => `<li>${escaparHTML(item)}</li>`).join("")}</ul>`
        : `<p class="muted">Sin alertas para este periodo.</p>`
      }
    </div>

    <div class="acciones">
      <button class="btn secundario" data-action="reportes-exportar-txt">TXT</button>
      <button class="btn secundario" data-action="reportes-exportar-json">JSON</button>
      <button class="btn secundario" data-action="reportes-exportar-csv">CSV</button>
    </div>
  `;
}

function renderReportesGuardados(reportes = []) {
  if (!reportes.length) {
    return `<p class="muted">Todavía no hay reportes guardados.</p>`;
  }

  return `
    <div class="jarvis-mensajes">
      ${reportes.slice(0, 8).map((reporte) => `
        <div class="jarvis-mensaje">
          <span>${escaparHTML(formatoFechaReporte(reporte.creadoEn?.slice(0, 10)))}</span>
          <p><strong>${escaparHTML(reporte.titulo)}</strong></p>
          <div class="acciones">
            <button class="btn secundario" data-reporte-id="${escaparHTML(reporte.id)}" data-action="reportes-eliminar">Eliminar</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderEntrenamientos(entrenamientos = []) {
  if (!entrenamientos.length) {
    return `<p class="muted">Todavía no hay entrenamientos registrados.</p>`;
  }

  return `
    <div class="tabla-scroll">
      <table class="tabla-simple">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Día</th>
            <th>Duración</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${entrenamientos.map((item) => `
            <tr>
              <td>${escaparHTML(formatoFechaReporte(item.fecha))}</td>
              <td>Día ${escaparHTML(item.diaRutina || "-")}</td>
              <td>${escaparHTML(formatoMinReporte(item.duracionMin || 0))}</td>
              <td>${escaparHTML(item.estado || "-")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderMedidas(medidas = []) {
  if (!medidas.length) {
    return `<p class="muted">Todavía no hay medidas registradas.</p>`;
  }

  return `
    <div class="tabla-scroll">
      <table class="tabla-simple">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Peso</th>
            <th>Cintura</th>
            <th>Energía</th>
          </tr>
        </thead>
        <tbody>
          ${medidas.map((item) => `
            <tr>
              <td>${escaparHTML(formatoFechaReporte(item.fecha))}</td>
              <td>${escaparHTML(formatoKgReporte(item.pesoKg))}</td>
              <td>${escaparHTML(item.cinturaCm ?? "-")}</td>
              <td>${escaparHTML(item.energiaSemana ?? "-")}/5</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
