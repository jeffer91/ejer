/*
  Nombre completo: diagnostico.view.js
  Ruta o ubicación: src/vistas/diagnostico.view.js

  Función:
    - Renderizar pantalla de diagnóstico completo.
    - Ejecutar diagnóstico desde la vista.
    - Copiar JSON o texto del diagnóstico.

  Se conecta con:
    - src/diagnostico/diagnostico.completo.service.js
    - src/diagnostico/diagnostico.schema.js
    - src/ui/router.js
*/

import { crearEncabezadoVista } from "./componentes.view.js";
import { mostrarMensaje } from "../ui/modal.js";
import { agruparResultadosPorArea } from "../diagnostico/diagnostico.schema.js";
import { crearDiagnosticoTexto, ejecutarDiagnosticoCompleto } from "../diagnostico/diagnostico.completo.service.js";

let eventosDiagnosticoActivos = false;
let diagnosticoActual = null;
let diagnosticoEjecutandose = false;

export function renderDiagnosticoView() {
  activarEventosDiagnostico();

  return `
    ${crearEncabezadoVista({
      titulo: "Diagnóstico",
      subtitulo: "Revisa módulos, datos locales, PWA, Firebase, navegador y errores de carga.",
      pill: "Sistema"
    })}

    <section class="grid grid-2 section-space">
      <article class="card">
        <h2>Control</h2>
        <p class="muted">Ejecuta una revisión completa sin modificar tus datos.</p>

        <div class="acciones">
          <button class="btn" data-action="diagnostico-ejecutar">
            ${diagnosticoEjecutandose ? "Ejecutando..." : "Ejecutar diagnóstico"}
          </button>
          <button class="btn secundario" data-action="diagnostico-copiar-json" ${diagnosticoActual ? "" : "disabled"}>Copiar JSON</button>
          <button class="btn secundario" data-action="diagnostico-copiar-texto" ${diagnosticoActual ? "" : "disabled"}>Copiar texto</button>
        </div>
      </article>

      <article class="card">
        <h2>Resumen</h2>
        ${renderResumen(diagnosticoActual)}
      </article>
    </section>

    <section class="card section-space">
      <h2>Resultados</h2>
      ${renderResultados(diagnosticoActual)}
    </section>
  `;
}

function activarEventosDiagnostico() {
  if (eventosDiagnosticoActivos) return;
  eventosDiagnosticoActivos = true;

  document.body.addEventListener("click", async (event) => {
    const accion = event.target.closest("[data-action]")?.dataset.action;

    if (!accion) return;

    if (accion === "diagnostico-ejecutar") {
      await accionEjecutarDiagnostico();
    }

    if (accion === "diagnostico-copiar-json") {
      await copiarDiagnosticoJSON();
    }

    if (accion === "diagnostico-copiar-texto") {
      await copiarDiagnosticoTexto();
    }
  });
}

async function accionEjecutarDiagnostico() {
  diagnosticoEjecutandose = true;
  refrescarDiagnostico();

  try {
    diagnosticoActual = await ejecutarDiagnosticoCompleto();
    mostrarMensaje(
      diagnosticoActual.ok ? "Diagnóstico OK" : "Diagnóstico con alertas",
      diagnosticoActual.ok ? "No se detectaron errores críticos." : "Hay elementos para revisar.",
      diagnosticoActual.ok ? "ok" : "error"
    );
  } catch (error) {
    diagnosticoActual = {
      ok: false,
      resumen: {
        total: 1,
        correctos: 0,
        advertencias: 0,
        errores: 1,
        informativos: 0,
        porcentajeOk: 0
      },
      resultados: [
        {
          id: "diagnostico-error",
          area: "diagnostico",
          ok: false,
          nivel: "error",
          titulo: "Diagnóstico no ejecutado",
          mensaje: error.message || "Ocurrió un error ejecutando diagnóstico.",
          solucion: "Revisar consola del navegador."
        }
      ],
      generadoEn: new Date().toISOString()
    };
  } finally {
    diagnosticoEjecutandose = false;
    refrescarDiagnostico();
  }
}

async function copiarDiagnosticoJSON() {
  if (!diagnosticoActual) return;

  await copiarTexto(JSON.stringify(diagnosticoActual, null, 2));
  mostrarMensaje("Copiado", "JSON de diagnóstico copiado.", "ok");
}

async function copiarDiagnosticoTexto() {
  if (!diagnosticoActual) return;

  await copiarTexto(crearDiagnosticoTexto(diagnosticoActual));
  mostrarMensaje("Copiado", "Texto de diagnóstico copiado.", "ok");
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch (_) {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function refrescarDiagnostico() {
  const vista = document.getElementById("vista");
  if (!vista) return;
  vista.innerHTML = renderDiagnosticoView();
  vista.focus({ preventScroll: true });
}

function renderResumen(diagnostico) {
  if (!diagnostico) {
    return `<p class="muted">Aún no se ejecutó el diagnóstico.</p>`;
  }

  const resumen = diagnostico.resumen || {};

  return `
    <div class="grid-2">
      <div class="metric">
        <span>Estado</span>
        <strong>${diagnostico.ok ? "OK" : "Revisar"}</strong>
      </div>
      <div class="metric">
        <span>Correctos</span>
        <strong>${escaparHTML(resumen.correctos || 0)}</strong>
      </div>
      <div class="metric">
        <span>Advertencias</span>
        <strong>${escaparHTML(resumen.advertencias || 0)}</strong>
      </div>
      <div class="metric">
        <span>Errores</span>
        <strong>${escaparHTML(resumen.errores || 0)}</strong>
      </div>
    </div>
    <p class="muted section-space">Generado: ${escaparHTML(diagnostico.generadoEn || "")}</p>
  `;
}

function renderResultados(diagnostico) {
  if (!diagnostico) {
    return `<p class="muted">Ejecuta el diagnóstico para ver resultados.</p>`;
  }

  const grupos = agruparResultadosPorArea(diagnostico.resultados || []);

  return Object.entries(grupos).map(([area, items]) => `
    <details class="card" open>
      <summary><strong>${escaparHTML(area)}</strong> · ${items.length} revisión(es)</summary>
      <div class="section-space">
        ${items.map(renderResultado).join("")}
      </div>
    </details>
  `).join("");
}

function renderResultado(item) {
  return `
    <div class="alerta ${item.nivel || ""}">
      <strong>${escaparHTML(item.titulo || item.id)}</strong>
      <p>${escaparHTML(item.mensaje)}</p>
      ${item.solucion ? `<small><strong>Solución:</strong> ${escaparHTML(item.solucion)}</small>` : ""}
      ${item.detalle ? `<pre class="diagnostico-json">${escaparHTML(JSON.stringify(item.detalle, null, 2))}</pre>` : ""}
    </div>
  `;
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
