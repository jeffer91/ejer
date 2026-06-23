/*
  Nombre completo: rutinas.view.js
  Ruta o ubicación: src/vistas/rutinas.view.js

  Función:
    - Mostrar pantalla de rutinas.
    - Copiar formato para IA.
    - Pegar respuesta, validar y aplicar cambios.

  Se conecta con:
    - src/app-controller.js
    - src/rutinas/rutina.formato-fitjeff.js
    - src/rutinas/rutina.storage.service.js
*/

import { crearFormatoFitJeff, crearPromptFitJeff } from "../rutinas/rutina.formato-fitjeff.js";
import { obtenerHistorialRutinas, obtenerImportacionActual } from "../rutinas/rutina.storage.service.js";
import { escaparHTML } from "../ui/helpers.js";
import { crearEncabezadoVista } from "./componentes.view.js";

export function renderRutinasView(estadoApp = {}) {
  const rutina = estadoApp.rutina || { dias: [] };
  const diaSeleccionado = Number(estadoApp.diaSeleccionado || rutina.diaActual || 1);
  const importacion = obtenerImportacionActual();
  const historial = obtenerHistorialRutinas();
  const formato = crearFormatoFitJeff({ rutina, diaNumero: diaSeleccionado });
  const prompt = crearPromptFitJeff({ rutina, diaNumero: diaSeleccionado });

  return `
    ${crearEncabezadoVista({
      titulo: "Rutinas",
      subtitulo: "Copia un formato, pide una rutina a una IA, pega la respuesta y valida antes de guardar.",
      pill: "Importador FitJeff"
    })}

    <section class="grid-2">
      <article class="card">
        <h2>Formato para IA</h2>
        <p class="muted">Copia este formato y úsalo como base.</p>

        <div class="campo">
          <label for="rutina-dia-formato">Día base</label>
          <select id="rutina-dia-formato">
            ${renderOpcionesDias(rutina.dias, diaSeleccionado)}
          </select>
        </div>

        <div class="acciones">
          <button class="btn" data-action="rutina-copiar-formato">Copiar formato</button>
          <button class="btn secundario" data-action="rutina-copiar-prompt">Copiar prompt IA</button>
        </div>

        <textarea class="oculto" id="rutina-formato-base">${escaparHTML(formato)}</textarea>
        <textarea class="oculto" id="rutina-prompt-base">${escaparHTML(prompt)}</textarea>
      </article>

      <article class="card">
        <h2>Pegar respuesta</h2>
        <p class="muted">Pega aquí el formato devuelto.</p>

        <div class="campo">
          <label for="rutina-texto-importar">Texto</label>
          <textarea id="rutina-texto-importar" placeholder="# FORMATO FITJEFF - RUTINA"></textarea>
        </div>

        <div class="acciones">
          <button class="btn" data-action="rutina-validar-importacion">Validar</button>
          <button class="btn secundario" data-action="rutina-limpiar-importacion">Limpiar</button>
        </div>
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <h2>Previsualización</h2>
        ${renderImportacion(importacion)}
      </article>

      <article class="card">
        <h2>Historial</h2>
        ${renderHistorial(historial)}
      </article>
    </section>
  `;
}

function renderOpcionesDias(dias = [], seleccionado = 1) {
  if (!dias.length) {
    return `<option value="1">Día 1</option>`;
  }

  return dias.map((dia) => `
    <option value="${escaparHTML(dia.numero)}" ${Number(dia.numero) === Number(seleccionado) ? "selected" : ""}>
      Día ${escaparHTML(dia.numero)} - ${escaparHTML(dia.nombre)}
    </option>
  `).join("");
}

function renderImportacion(importacion) {
  if (!importacion?.rutinaImportada) {
    return `<p class="muted">Todavía no hay una rutina validada.</p>`;
  }

  const rutina = importacion.rutinaImportada;

  return `
    <div class="alerta ${importacion.ok ? "ok" : "danger"}">
      <strong>${importacion.ok ? "Lista para aplicar" : "Tiene errores"}</strong>
      <p>Acción: ${escaparHTML(rutina.accion)}</p>
    </div>

    ${renderLista("Errores", importacion.errores || [], "danger")}
    ${renderLista("Advertencias", importacion.advertencias || [], "warning")}

    <h3>${escaparHTML(rutina.nombreDia)}</h3>
    <p>${escaparHTML(rutina.objetivo)}</p>

    <div class="grid-2">
      <div class="metric">
        <span>Duración</span>
        <strong>${escaparHTML(rutina.duracionEstimadaMin)} min</strong>
      </div>
      <div class="metric">
        <span>Ejercicios</span>
        <strong>${escaparHTML(rutina.ejercicios?.length || 0)}</strong>
      </div>
    </div>

    <div class="acciones section-space">
      <button class="btn" data-action="rutina-aplicar-importacion" ${importacion.ok ? "" : "disabled"}>Aplicar rutina</button>
      <button class="btn secundario" data-action="rutina-restaurar-ultima">Restaurar última</button>
    </div>

    <div class="tabla-scroll section-space">
      <table class="tabla-simple">
        <thead>
          <tr>
            <th>Ejercicio</th>
            <th>Tipo</th>
            <th>Series</th>
            <th>Descanso</th>
          </tr>
        </thead>
        <tbody>
          ${(rutina.ejercicios || []).map((ejercicio) => `
            <tr>
              <td>${escaparHTML(ejercicio.nombre)}</td>
              <td>${escaparHTML(ejercicio.tipoRegistro)}</td>
              <td>${escaparHTML(ejercicio.seriesObjetivo)}</td>
              <td>${escaparHTML(ejercicio.descansoSeg)}s</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderLista(titulo, items, tipo) {
  if (!items.length) return "";

  return `
    <div class="alerta ${tipo}">
      <strong>${escaparHTML(titulo)}</strong>
      <ul>
        ${items.map((item) => `<li>${escaparHTML(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderHistorial(historial = []) {
  if (!historial.length) {
    return `<p class="muted">Aún no hay respaldos.</p>`;
  }

  return `
    <div class="jarvis-mensajes">
      ${historial.slice(0, 6).map((item) => `
        <div class="jarvis-mensaje">
          <span>${formatearFecha(item.creadoEn)}</span>
          <p>${escaparHTML(item.motivo || "Respaldo")}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function formatearFecha(fechaISO) {
  try {
    return new Date(fechaISO).toLocaleString("es-EC", {
      dateStyle: "short",
      timeStyle: "short"
    });
  } catch (_) {
    return "";
  }
}
