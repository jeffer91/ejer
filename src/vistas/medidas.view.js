/*
  Nombre completo: medidas.view.js
  Ruta o ubicación: src/vistas/medidas.view.js

  Función:
    - Renderizar pantalla de medidas semanales.
    - Mostrar formulario, resumen, gráficos simples e historial.
    - Manejar guardado y recordatorios sin tocar app-controller.

  Se conecta con:
    - src/ui/router.js
    - src/medidas/medidas.service.js
    - src/medidas/medidas.storage.service.js
    - src/medidas/medidas.recordatorio.service.js
    - src/medidas/medidas.graficas.service.js
*/

import { escaparHTML, leerFormulario } from "../ui/helpers.js";
import { mostrarMensaje } from "../ui/modal.js";
import { crearEncabezadoVista } from "./componentes.view.js";
import { obtenerMedidasSemanales, omitirRecordatorioSemana, posponerRecordatorioDomingo } from "../medidas/medidas.storage.service.js";
import { crearRegistroMedidas, obtenerResumenMedidas, crearMensajeResumenMedidas } from "../medidas/medidas.service.js";
import { crearMiniGraficaSVG, crearBarraCumplimiento } from "../medidas/medidas.graficas.service.js";
import { formatoMedida } from "../medidas/medidas.format.service.js";
import { evaluarRecordatorioMedidas, crearTextoRecordatorioMedidas } from "../medidas/medidas.recordatorio.service.js";

let eventosMedidasActivos = false;

export function renderMedidasView() {
  activarEventosMedidas();

  const historial = obtenerMedidasSemanales();
  const resumen = obtenerResumenMedidas();
  const recordatorio = evaluarRecordatorioMedidas();
  const textos = crearTextoRecordatorioMedidas();
  const actual = resumen.actual || {};
  const hoy = new Date().toISOString().slice(0, 10);

  return `
    ${crearEncabezadoVista({
      titulo: "Medidas semanales",
      subtitulo: "Registra tu avance una vez por semana, sin juicios y con enfoque en constancia.",
      pill: "Sábado / domingo"
    })}

    ${recordatorio.mostrar ? `
      <section class="card alerta ok">
        <h2>${escaparHTML(textos.titulo)}</h2>
        <p>${escaparHTML(textos.mensaje)}</p>
        <div class="acciones">
          <button class="btn" data-action="medidas-focus-form">${escaparHTML(textos.ahora)}</button>
          <button class="btn secundario" data-action="medidas-recordar-domingo">${escaparHTML(textos.domingo)}</button>
          <button class="btn secundario" data-action="medidas-omitir-semana">${escaparHTML(textos.omitir)}</button>
        </div>
      </section>
    ` : ""}

    <section class="grid-2">
      <article class="card">
        <h2>Registrar semana</h2>
        <p class="muted">Completa solo los campos que quieras registrar.</p>

        <form id="form-medidas" class="form-grid">
          <div class="campo">
            <label for="fecha">Fecha</label>
            <input type="date" id="fecha" name="fecha" value="${escaparHTML(hoy)}">
          </div>

          <div class="campo">
            <label for="pesoKg">Peso actual</label>
            <input type="number" step="0.1" id="pesoKg" name="pesoKg" placeholder="Ej. 91.0">
          </div>

          <div class="campo">
            <label for="cinturaCm">Cintura</label>
            <input type="number" step="0.1" id="cinturaCm" name="cinturaCm" placeholder="cm">
          </div>

          <div class="campo">
            <label for="pechoCm">Pecho</label>
            <input type="number" step="0.1" id="pechoCm" name="pechoCm" placeholder="cm">
          </div>

          <div class="campo">
            <label for="brazoCm">Brazo</label>
            <input type="number" step="0.1" id="brazoCm" name="brazoCm" placeholder="cm">
          </div>

          <div class="campo">
            <label for="piernaCm">Pierna</label>
            <input type="number" step="0.1" id="piernaCm" name="piernaCm" placeholder="cm">
          </div>

          <div class="campo">
            <label for="energiaSemana">Energía de la semana</label>
            <select id="energiaSemana" name="energiaSemana">
              <option value="1">1 - Baja</option>
              <option value="2">2</option>
              <option value="3" selected>3 - Normal</option>
              <option value="4">4</option>
              <option value="5">5 - Alta</option>
            </select>
          </div>

          <div class="campo">
            <label for="cumplimientoSemana">Entrenamientos completados</label>
            <input type="number" min="0" max="7" step="1" id="cumplimientoSemana" name="cumplimientoSemana" placeholder="0 a 7">
          </div>

          <div class="campo ancho-completo">
            <label for="observacion">Observación semanal</label>
            <textarea id="observacion" name="observacion" placeholder="Ej. Me sentí con más energía o tuve una semana cargada."></textarea>
          </div>
        </form>

        <div class="acciones">
          <button class="btn" data-action="guardar-medidas">Guardar medidas</button>
        </div>
      </article>

      <article class="card">
        <h2>Resumen visual</h2>
        <p>${escaparHTML(crearMensajeResumenMedidas(resumen))}</p>

        <div class="grid-2">
          <div class="metric">
            <span>Registros</span>
            <strong>${escaparHTML(resumen.totalRegistros)}</strong>
          </div>
          <div class="metric">
            <span>Promedio energía</span>
            <strong>${escaparHTML(resumen.promedioEnergia ?? "-")}</strong>
          </div>
        </div>

        <div class="section-space">
          ${crearBarraCumplimiento(actual.cumplimientoSemana || 0)}
        </div>
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <h2>Gráficos</h2>
        <div class="grid-2">
          ${crearMiniGraficaSVG(historial, "pesoKg", "Peso")}
          ${crearMiniGraficaSVG(historial, "cinturaCm", "Cintura")}
          ${crearMiniGraficaSVG(historial, "cumplimientoSemana", "Constancia")}
          ${crearMiniGraficaSVG(historial, "energiaSemana", "Energía")}
        </div>
      </article>

      <article class="card">
        <h2>Historial</h2>
        ${renderHistorialMedidas(historial)}
      </article>
    </section>
  `;
}

function activarEventosMedidas() {
  if (eventosMedidasActivos) return;
  eventosMedidasActivos = true;

  document.body.addEventListener("click", async (event) => {
    const accion = event.target.closest("[data-action]")?.dataset.action;

    if (!accion) return;

    if (accion === "guardar-medidas") {
      await guardarMedidasDesdeVista();
    }

    if (accion === "medidas-focus-form") {
      document.getElementById("form-medidas")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (accion === "medidas-recordar-domingo") {
      posponerRecordatorioDomingo();
      mostrarMensaje("Recordatorio pospuesto", "Se volverá a mostrar el domingo.", "ok");
      refrescarMedidas();
    }

    if (accion === "medidas-omitir-semana") {
      omitirRecordatorioSemana();
      mostrarMensaje("Semana omitida", "No se volverá a mostrar el recordatorio esta semana.", "ok");
      refrescarMedidas();
    }
  });
}

async function guardarMedidasDesdeVista() {
  const datos = leerFormulario("#form-medidas");
  const resultado = crearRegistroMedidas(datos);

  if (!resultado.ok) {
    mostrarMensaje("Medidas no guardadas", resultado.errores.join("\n"), "error");
    return;
  }

  mostrarMensaje("Medidas guardadas", "El registro semanal quedó guardado correctamente.", "ok");
  refrescarMedidas();
}

function refrescarMedidas() {
  const vista = document.getElementById("vista");
  if (vista) {
    vista.innerHTML = renderMedidasView();
    vista.focus({ preventScroll: true });
  }
}

function renderHistorialMedidas(historial = []) {
  if (!historial.length) {
    return `<p class="muted">Aún no hay registros semanales.</p>`;
  }

  return `
    <div class="tabla-scroll">
      <table class="tabla-simple">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Peso</th>
            <th>Cintura</th>
            <th>Constancia</th>
            <th>Energía</th>
          </tr>
        </thead>
        <tbody>
          ${historial.slice(0, 10).map((item) => `
            <tr>
              <td>${escaparHTML(item.fecha)}</td>
              <td>${escaparHTML(formatoMedida(item.pesoKg))}</td>
              <td>${escaparHTML(formatoMedida(item.cinturaCm))}</td>
              <td>${escaparHTML(item.cumplimientoSemana ?? 0)}/7</td>
              <td>${escaparHTML(item.energiaSemana ?? "-")}/5</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
