/*
  Nombre completo: jarvis.view.js
  Ruta o ubicación: src/vistas/jarvis.view.js

  Función:
    - Renderizar la pantalla de Jarvis.
    - Mostrar controles de voz, estado, comandos, mensajes recientes y consulta inteligente.
    - Permitir uso manual si el micrófono o el servicio remoto no están disponibles.
    - Mostrar con claridad si Jarvis está en modo local o Gemini remoto.

  Se conecta con:
    - src/app-controller.js
    - src/jarvis/jarvis.estado.js
    - src/jarvis/jarvis.voz.service.js
    - src/jarvis/jarvis.config.js
    - src/jarvis/jarvis.inteligente.service.js
*/

import { obtenerEstadoJarvis } from "../jarvis/jarvis.estado.js";
import { obtenerSoporteVozJarvis } from "../jarvis/jarvis.voz.service.js";
import { JARVIS_CONFIG } from "../jarvis/jarvis.config.js";
import { consultarJarvisInteligente, crearSugerenciasJarvisInteligente } from "../jarvis/jarvis.inteligente.service.js";
import { cargarEstadoLocal } from "../storage/local-storage.service.js";
import { mostrarMensaje } from "../ui/modal.js";

let eventosJarvisVistaActivos = false;

export function renderJarvisView(estadoApp) {
  activarEventosJarvisVista();

  const estadoJarvis = obtenerEstadoJarvis();
  const soporte = obtenerSoporteVozJarvis();
  const diaActual = estadoApp?.rutina?.dias?.find((dia) => Number(dia.numero) === Number(estadoApp?.rutina?.diaActual || 1));
  const mensajes = estadoJarvis.mensajes || [];
  const sugerencias = crearSugerenciasJarvisInteligente();
  const remotoActivo = Boolean(estadoApp?.ajustes?.usarGemini && estadoApp?.ajustes?.usarFirebase);

  return `
    <section class="grid-2">
      <article class="card jarvis-panel-principal">
        <span class="pill">Asistente de voz</span>
        <h1>${JARVIS_CONFIG.nombre}</h1>
        <p>Controla tu entrenamiento con comandos simples. Puedes usar voz, botones grandes o consulta inteligente.</p>

        <div class="jarvis-orb ${estadoJarvis.activo ? "activo" : ""} ${estadoJarvis.escuchando ? "escuchando" : ""} ${estadoJarvis.hablando ? "hablando" : ""}">
          <span>${estadoJarvis.activo ? "ON" : "OFF"}</span>
        </div>

        <div class="grid-2">
          <div class="metric">
            <span>Estado</span>
            <strong>${escaparHTML(estadoJarvis.modo)}</strong>
          </div>
          <div class="metric">
            <span>Día actual</span>
            <strong>${escaparHTML(diaActual?.numero || "-")}</strong>
          </div>
        </div>

        <div class="alerta">
          <strong>Entrenamiento sugerido</strong>
          <p>${escaparHTML(diaActual?.nombre || "No hay rutina activa.")}</p>
        </div>

        <div class="acciones">
          <button class="btn" data-action="jarvis-activar">Activar Jarvis</button>
          <button class="btn secundario" data-action="jarvis-escuchar">Escuchar</button>
          <button class="btn secundario" data-action="jarvis-iniciar-entrenamiento">Iniciar entrenamiento</button>
          <button class="btn peligro" data-action="jarvis-detener">Detener</button>
        </div>
      </article>

      <article class="card">
        <h2>Estado de Jarvis</h2>
        <div class="tabla-scroll">
          <table class="tabla-simple">
            <tbody>
              <tr>
                <th>Voz del navegador</th>
                <td>${soporte.sintesis ? "Disponible" : "No disponible"}</td>
              </tr>
              <tr>
                <th>Micrófono web</th>
                <td>${soporte.reconocimiento ? "Disponible" : "No disponible"}</td>
              </tr>
              <tr>
                <th>Contexto seguro</th>
                <td>${soporte.seguro ? "Sí" : "No"}</td>
              </tr>
              <tr>
                <th>Gemini remoto</th>
                <td>${remotoActivo ? "Activo por Firebase Functions" : "Modo local"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${remotoActivo ? `
          <div class="alerta ok">
            <strong>Gemini activado</strong>
            <p>Jarvis intentará responder con Firebase Functions. Si el secreto GEMINI_API_KEY falta o falla, usará respuesta local.</p>
          </div>
        ` : `
          <div class="alerta warning">
            <strong>Gemini no está activo</strong>
            <p>Para usar Jarvis remoto ve a Ajustes y configura Firebase + Gemini. La API key va como secreto GEMINI_API_KEY en Functions.</p>
          </div>
        `}

        ${crearBotonAjustesGemini()}
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <h2>Jarvis inteligente</h2>
        <p class="muted">Pregunta sobre tu entrenamiento, indicadores, reportes o recuperación.</p>

        <div class="campo">
          <label for="jarvis-consulta">Consulta</label>
          <textarea id="jarvis-consulta" placeholder="Ej. ¿Qué entrenamiento me recomiendas hoy?"></textarea>
        </div>

        <div class="acciones">
          <button class="btn" data-action="jarvis-consulta-enviar">Preguntar</button>
          <button class="btn secundario" data-action="jarvis-consulta-limpiar">Limpiar</button>
        </div>

        <div class="section-space">
          <h3>Sugerencias</h3>
          <div class="acciones acciones-grid">
            ${sugerencias.map((texto) => `
              <button class="btn secundario" data-action="jarvis-consulta-sugerir" data-consulta="${escaparHTML(texto)}">${escaparHTML(texto)}</button>
            `).join("")}
          </div>
        </div>
      </article>

      <article class="card">
        <h2>Control manual</h2>
        <p>Úsalo si la voz no reconoce bien el comando.</p>

        <div class="acciones acciones-grid">
          <button class="btn" data-action="jarvis-respuesta-si">Sí / hecho</button>
          <button class="btn secundario" data-action="jarvis-respuesta-no">No todavía</button>
          <button class="btn secundario" data-action="jarvis-repetir">Repetir</button>
          <button class="btn secundario" data-action="jarvis-pausar">Pausar</button>
          <button class="btn secundario" data-action="jarvis-continuar">Continuar</button>
          <button class="btn peligro" data-action="jarvis-terminar">Terminar</button>
        </div>
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <h2>Nota rápida</h2>
        <div class="campo">
          <label for="jarvis-nota">Observación</label>
          <textarea id="jarvis-nota" placeholder="Ejemplo: hoy costó más la tercera serie."></textarea>
        </div>
        <button class="btn" data-action="jarvis-guardar-nota">Guardar nota</button>
      </article>

      <article class="card">
        <h2>Respuesta reciente</h2>
        ${mensajes.length ? renderRespuestaReciente(mensajes[0]) : "<p>No hay respuesta reciente.</p>"}
      </article>
    </section>

    <section class="card">
      <h2>Mensajes recientes</h2>
      ${mensajes.length ? renderMensajesJarvis(mensajes) : "<p>No hay mensajes recientes.</p>"}
    </section>
  `;
}

function crearBotonAjustesGemini() {
  return `
    <div class="acciones section-space">
      <button class="btn secundario" type="button" data-nav="ajustes">Configurar Gemini</button>
      <button class="btn secundario" type="button" data-nav="diagnostico">Diagnóstico</button>
    </div>
  `;
}

function activarEventosJarvisVista() {
  if (eventosJarvisVistaActivos) return;
  eventosJarvisVistaActivos = true;

  document.body.addEventListener("click", async (event) => {
    const boton = event.target.closest("[data-action]");
    const accion = boton?.dataset.action;

    if (!accion) return;

    if (accion === "jarvis-consulta-sugerir") {
      const textarea = document.getElementById("jarvis-consulta");
      if (textarea) textarea.value = boton.dataset.consulta || "";
    }

    if (accion === "jarvis-consulta-limpiar") {
      const textarea = document.getElementById("jarvis-consulta");
      if (textarea) textarea.value = "";
    }

    if (accion === "jarvis-consulta-enviar") {
      await ejecutarConsultaInteligenteJarvis();
    }
  });
}

async function ejecutarConsultaInteligenteJarvis() {
  const textarea = document.getElementById("jarvis-consulta");
  const texto = textarea?.value || "";
  const estado = cargarEstadoLocal();
  const usarGemini = Boolean(estado.ajustes?.usarGemini && estado.ajustes?.usarFirebase);

  const resultado = await consultarJarvisInteligente({
    texto,
    estadoApp: estado,
    usarGemini
  });

  if (!resultado.ok) {
    mostrarMensaje("Jarvis", resultado.errores.join("\n"), "error");
    return;
  }

  if (textarea) textarea.value = "";

  mostrarMensaje(
    resultado.respuesta.origen === "remoto" ? "Jarvis remoto" : "Jarvis local",
    resultado.respuesta.resumen || "Respuesta generada.",
    "ok"
  );

  refrescarJarvis();
}

function refrescarJarvis() {
  const vista = document.getElementById("vista");
  if (!vista) return;
  vista.innerHTML = renderJarvisView(cargarEstadoLocal());
  vista.focus({ preventScroll: true });
}

function renderRespuestaReciente(mensaje) {
  return `
    <div class="alerta ${mensaje.tipo || ""}">
      <strong>${escaparHTML(mensaje.origen || "Jarvis")}</strong>
      <p>${escaparHTML(mensaje.texto)}</p>
      <small>${formatearHora(mensaje.creadoEn)}</small>
    </div>
  `;
}

function renderMensajesJarvis(mensajes) {
  return `
    <div class="jarvis-mensajes">
      ${mensajes.slice(0, 10).map((mensaje) => `
        <div class="jarvis-mensaje ${mensaje.tipo || "info"}">
          <span>${formatearHora(mensaje.creadoEn)}</span>
          <p>${escaparHTML(mensaje.texto)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function formatearHora(fechaISO) {
  if (!fechaISO) return "";

  try {
    return new Date(fechaISO).toLocaleTimeString("es-EC", {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (_) {
    return "";
  }
}

function escaparHTML(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
