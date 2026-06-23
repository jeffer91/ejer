/*
  Nombre completo: hiit.view.js
  Ruta o ubicación: src/vistas/hiit.view.js
*/

import { desbloquearAudioFitJeff, obtenerConfigAudio, subirVolumenAudio, bajarVolumenAudio, silenciarVozAudio, activarVozAudio } from "../audio/audio.speech.service.js";
import { obtenerRutinaHIITPorId, obtenerRutinasHIIT } from "../hiit/hiit.rutinas.js";
import { continuarHIIT, detenerHIIT, iniciarHIIT, obtenerEstadoHIIT, pausarHIIT } from "../hiit/hiit.timer.service.js";
import { guardarSesionHIIT, obtenerSesionesHIIT, resumenHIIT } from "../hiit/hiit.storage.service.js";
import { mostrarMensaje } from "../ui/modal.js";
import { crearEncabezadoVista } from "./componentes.view.js";

let eventosHIITActivos = false;
let rutinaSeleccionadaId = "rapido-10";

export function renderHIITView() {
  activarEventosHIIT();

  const rutinas = obtenerRutinasHIIT();
  const rutina = obtenerRutinaHIITPorId(rutinaSeleccionadaId);
  const estado = obtenerEstadoHIIT();
  const resumen = resumenHIIT();
  const audio = obtenerConfigAudio();

  return `
    ${crearEncabezadoVista({
      titulo: "HIIT sonoro",
      subtitulo: "Rutinas rápidas para casa, bicicleta o caminata, guiadas con voz tipo Jarvis.",
      pill: "HIIT"
    })}

    <section class="grid grid-2 section-space">
      <article class="card">
        <h2>Elegir rutina</h2>
        <div class="campo">
          <label for="hiit-rutina">Rutina HIIT</label>
          <select id="hiit-rutina">
            ${rutinas.map((item) => `
              <option value="${escaparHTML(item.id)}" ${item.id === rutina.id ? "selected" : ""}>
                ${escaparHTML(item.nombre)} · ${escaparHTML(item.duracionTexto)}
              </option>
            `).join("")}
          </select>
        </div>

        <div class="alerta">
          <strong>${escaparHTML(rutina.nombre)}</strong>
          <p>${escaparHTML(rutina.descripcion)}</p>
          <p class="muted">Duración estimada: ${formatoTiempo(rutina.totalSegundos)}.</p>
        </div>

        <ul>
          ${rutina.instrucciones.map((item) => `<li>${escaparHTML(item)}</li>`).join("")}
        </ul>

        <div class="acciones">
          <button class="btn" data-action="hiit-audio">Activar audio</button>
          <button class="btn" data-action="hiit-iniciar">Iniciar HIIT</button>
          <button class="btn secundario" data-action="hiit-pausar">Pausar</button>
          <button class="btn secundario" data-action="hiit-continuar">Continuar</button>
          <button class="btn peligro" data-action="hiit-detener">Terminar</button>
        </div>
      </article>

      <article class="card">
        <h2>Panel en vivo</h2>
        <div id="hiit-panel">
          ${renderPanelHIIT(estado)}
        </div>
      </article>
    </section>

    <section class="grid grid-2 section-space">
      <article class="card">
        <h2>Audio</h2>
        <div class="grid-2">
          <div class="metric">
            <span>Voz</span>
            <strong>${audio.vozActiva ? "Activa" : "Silenciada"}</strong>
          </div>
          <div class="metric">
            <span>Volumen app</span>
            <strong>${Math.round(audio.volumen * 100)}%</strong>
          </div>
        </div>
        <div class="acciones">
          <button class="btn secundario" data-action="hiit-volumen-menos">Bajar</button>
          <button class="btn secundario" data-action="hiit-volumen-mas">Subir</button>
          <button class="btn secundario" data-action="hiit-silenciar">Silenciar voz</button>
          <button class="btn secundario" data-action="hiit-activar-voz">Activar voz</button>
        </div>
      </article>

      <article class="card">
        <h2>Resumen HIIT</h2>
        <div class="grid-2">
          <div class="metric">
            <span>Sesiones</span>
            <strong>${resumen.sesiones}</strong>
          </div>
          <div class="metric">
            <span>Minutos</span>
            <strong>${resumen.minutos}</strong>
          </div>
        </div>
        <p class="muted">${resumen.ultima ? `Última: ${escaparHTML(resumen.ultima.rutinaNombre)}` : "Todavía no hay sesiones HIIT guardadas."}</p>
      </article>
    </section>

    <section class="card section-space">
      <h2>Registrar sensación final</h2>
      <form id="form-hiit-final" class="form-grid">
        <div class="campo">
          <label for="hiitEnergiaInicial">Energía inicial</label>
          <select id="hiitEnergiaInicial" name="energiaInicial">
            <option value="">Sin registrar</option>
            <option value="1">1 baja</option>
            <option value="2">2</option>
            <option value="3">3 media</option>
            <option value="4">4</option>
            <option value="5">5 alta</option>
          </select>
        </div>
        <div class="campo">
          <label for="hiitEnergiaFinal">Energía final</label>
          <select id="hiitEnergiaFinal" name="energiaFinal">
            <option value="">Sin registrar</option>
            <option value="1">1 baja</option>
            <option value="2">2</option>
            <option value="3">3 media</option>
            <option value="4">4</option>
            <option value="5">5 alta</option>
          </select>
        </div>
        <div class="campo ancho-completo">
          <label for="hiitObservacion">Observación</label>
          <textarea id="hiitObservacion" name="observacion" placeholder="Ej. Me sentí bien, bajé ritmo al final, etc."></textarea>
        </div>
      </form>
      <button class="btn" data-action="hiit-guardar">Guardar sesión HIIT</button>
    </section>

    <section class="card section-space">
      <h2>Historial HIIT</h2>
      ${renderHistorialHIIT()}
    </section>
  `;
}

function activarEventosHIIT() {
  if (eventosHIITActivos) return;
  eventosHIITActivos = true;

  document.body.addEventListener("change", (event) => {
    if (event.target?.id === "hiit-rutina") {
      rutinaSeleccionadaId = event.target.value;
      refrescarHIIT();
    }
  });

  document.body.addEventListener("click", async (event) => {
    const accion = event.target.closest("[data-action]")?.dataset.action;
    if (!accion) return;

    if (accion === "hiit-audio") {
      await desbloquearAudioFitJeff();
      mostrarMensaje("Audio activado", "La voz de FitJeff quedó lista.", "ok");
      refrescarHIIT();
    }

    if (accion === "hiit-iniciar") iniciarRutinaHIIT();
    if (accion === "hiit-pausar") pausarHIIT();
    if (accion === "hiit-continuar") continuarHIIT();
    if (accion === "hiit-detener") detenerHIIT();

    if (accion === "hiit-volumen-mas") {
      subirVolumenAudio();
      refrescarHIIT();
    }

    if (accion === "hiit-volumen-menos") {
      bajarVolumenAudio();
      refrescarHIIT();
    }

    if (accion === "hiit-silenciar") {
      silenciarVozAudio();
      refrescarHIIT();
    }

    if (accion === "hiit-activar-voz") {
      activarVozAudio();
      refrescarHIIT();
    }

    if (accion === "hiit-guardar") guardarFinalHIIT();
  });
}

function iniciarRutinaHIIT() {
  const rutina = obtenerRutinaHIITPorId(rutinaSeleccionadaId);

  iniciarHIIT({
    rutina,
    onTick: actualizarPanelHIIT,
    onPaso: actualizarPanelHIIT,
    onFin: () => {
      mostrarMensaje("HIIT finalizado", "Puedes guardar la sesión con tu sensación final.", "ok");
      actualizarPanelHIIT(obtenerEstadoHIIT());
    }
  });

  actualizarPanelHIIT(obtenerEstadoHIIT());
}

function guardarFinalHIIT() {
  const estado = obtenerEstadoHIIT();
  const rutina = estado.rutina || obtenerRutinaHIITPorId(rutinaSeleccionadaId);
  const form = document.getElementById("form-hiit-final");
  const datos = new FormData(form);

  const resultado = guardarSesionHIIT({
    rutinaId: rutina.id,
    rutinaNombre: rutina.nombre,
    duracionSegundos: estado.segundosTranscurridos || rutina.totalSegundos,
    completado: estado.finalizado,
    energiaInicial: datos.get("energiaInicial"),
    energiaFinal: datos.get("energiaFinal"),
    observacion: datos.get("observacion")
  });

  mostrarMensaje("Sesión HIIT", resultado.mensaje, "ok");
  refrescarHIIT();
}

function actualizarPanelHIIT(estado) {
  const panel = document.getElementById("hiit-panel");
  if (!panel) return;
  panel.innerHTML = renderPanelHIIT(estado);
}

function renderPanelHIIT(estado) {
  const paso = estado.pasoActual;

  if (!estado.activo && !estado.finalizado) {
    return `<p class="muted">Selecciona una rutina y presiona Iniciar HIIT.</p>`;
  }

  return `
    <div class="metric">
      <span>${estado.finalizado ? "Finalizado" : estado.pausado ? "Pausado" : "Ahora"}</span>
      <strong>${escaparHTML(paso?.nombre || "Listo")}</strong>
    </div>
    <div class="metric section-space">
      <span>Tiempo restante</span>
      <strong>${formatoTiempo(estado.segundosRestantes || 0)}</strong>
    </div>
    <p class="muted">
      Paso ${(estado.pasoIndice || 0) + 1} de ${estado.rutina?.pasos?.length || 0}
      · Transcurrido ${formatoTiempo(estado.segundosTranscurridos || 0)}
    </p>
  `;
}

function renderHistorialHIIT() {
  const sesiones = obtenerSesionesHIIT();

  if (!sesiones.length) {
    return `<p class="muted">Todavía no hay sesiones HIIT guardadas.</p>`;
  }

  return `
    <div class="tabla-scroll">
      <table class="tabla-simple">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Rutina</th>
            <th>Duración</th>
            <th>Energía final</th>
          </tr>
        </thead>
        <tbody>
          ${sesiones.slice(0, 12).map((item) => `
            <tr>
              <td>${escaparHTML(formatoFecha(item.creadoEn))}</td>
              <td>${escaparHTML(item.rutinaNombre)}</td>
              <td>${formatoTiempo(item.duracionSegundos)}</td>
              <td>${escaparHTML(item.energiaFinal || "-")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function refrescarHIIT() {
  const vista = document.getElementById("vista");
  if (!vista) return;
  vista.innerHTML = renderHIITView();
  vista.focus({ preventScroll: true });
}

function formatoTiempo(segundos) {
  const total = Math.max(0, Number(segundos || 0));
  const min = Math.floor(total / 60);
  const seg = total % 60;
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

function formatoFecha(fechaISO) {
  try {
    return new Date(fechaISO).toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch (_) {
    return "-";
  }
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
