/*
  Nombre completo: jarvis.view.js
  Ruta o ubicación: src/vistas/jarvis.view.js

  Función:
    - Renderizar la pantalla de Jarvis.
    - Mostrar controles de voz, estado, comandos y mensajes recientes.
    - Permitir uso manual si el micrófono no está disponible.

  Se conecta con:
    - src/app-controller.js
    - src/jarvis/jarvis.estado.js
    - src/jarvis/jarvis.voz.service.js
    - src/jarvis/jarvis.config.js
*/

import { obtenerEstadoJarvis } from "../jarvis/jarvis.estado.js";
import { obtenerSoporteVozJarvis } from "../jarvis/jarvis.voz.service.js";
import { JARVIS_CONFIG } from "../jarvis/jarvis.config.js";

export function renderJarvisView(estadoApp) {
  const estadoJarvis = obtenerEstadoJarvis();
  const soporte = obtenerSoporteVozJarvis();
  const diaActual = estadoApp?.rutina?.dias?.find((dia) => Number(dia.numero) === Number(estadoApp?.rutina?.diaActual || 1));
  const mensajes = estadoJarvis.mensajes || [];

  return `
    <section class="grid-2">
      <article class="card jarvis-panel-principal">
        <span class="pill">Asistente de voz</span>
        <h1>${JARVIS_CONFIG.nombre}</h1>
        <p>
          Controla tu entrenamiento con comandos simples. Puedes usar voz o botones grandes.
        </p>

        <div class="jarvis-orb ${estadoJarvis.activo ? "activo" : ""} ${estadoJarvis.escuchando ? "escuchando" : ""} ${estadoJarvis.hablando ? "hablando" : ""}">
          <span>${estadoJarvis.activo ? "ON" : "OFF"}</span>
        </div>

        <div class="grid-2">
          <div class="metric">
            <span>Estado</span>
            <strong>${estadoJarvis.modo}</strong>
          </div>
          <div class="metric">
            <span>Día actual</span>
            <strong>${diaActual?.numero || "-"}</strong>
          </div>
        </div>

        <div class="alerta">
          <strong>Entrenamiento sugerido</strong>
          <p>${diaActual?.nombre || "No hay rutina activa."}</p>
        </div>

        <div class="acciones">
          <button class="btn" data-action="jarvis-activar">Activar Jarvis</button>
          <button class="btn secundario" data-action="jarvis-escuchar">Escuchar</button>
          <button class="btn secundario" data-action="jarvis-iniciar-entrenamiento">Iniciar entrenamiento</button>
          <button class="btn peligro" data-action="jarvis-detener">Detener</button>
        </div>
      </article>

      <article class="card">
        <h2>Disponibilidad</h2>
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
                <th>Gemini</th>
                <td>${estadoApp?.ajustes?.usarGemini ? "Preparado" : "Desactivado"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="alerta warning">
          <strong>Comandos principales</strong>
          <p>Jarvis inicia entrenamiento, sí, no, repetir, pausar, continuar, siguiente, terminar.</p>
        </div>
      </article>
    </section>

    <section class="grid-2">
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

      <article class="card">
        <h2>Nota rápida</h2>
        <div class="campo">
          <label for="jarvis-nota">Observación</label>
          <textarea id="jarvis-nota" placeholder="Ejemplo: hoy costó más la tercera serie."></textarea>
        </div>
        <button class="btn" data-action="jarvis-guardar-nota">Guardar nota</button>
      </article>
    </section>

    <section class="card">
      <h2>Mensajes recientes</h2>
      ${mensajes.length ? renderMensajesJarvis(mensajes) : "<p>No hay mensajes recientes.</p>"}
    </section>
  `;
}

function renderMensajesJarvis(mensajes) {
  return `
    <div class="jarvis-mensajes">
      ${mensajes.slice(0, 8).map((mensaje) => `
        <div class="jarvis-mensaje ${mensaje.tipo || "info"}">
          <span>${formatearHora(mensaje.creadoEn)}</span>
          <p>${escaparHTML(mensaje.texto)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function formatearHora(fechaISO) {
  if (!fechaISO) {
    return "";
  }

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
