/*
  Nombre completo: entrenamiento-guiado.view.js
  Ruta o ubicación: src/vistas/entrenamiento-guiado.view.js

  Función:
    - Renderizar la pantalla visual de entrenamiento guiado.
    - Mostrar paso actual, cronómetro, descanso, controles grandes, notas y resumen.
    - Funcionar como alternativa visual/manual a Jarvis.

  Se conecta con:
    - src/app-controller.js
    - src/entrenamiento-guiado/guiado.estado.js
    - src/entrenamiento-guiado/guiado.timer.service.js
    - src/entrenamiento-guiado/guiado.resumen.service.js
*/

import { obtenerEstadoGuiado } from "../entrenamiento-guiado/guiado.estado.js";
import { formatearTiempoGuiado } from "../entrenamiento-guiado/guiado.timer.service.js";
import { crearResumenVisualGuiado } from "../entrenamiento-guiado/guiado.resumen.service.js";
import { escaparHTML } from "../ui/helpers.js";
import { crearEncabezadoVista } from "./componentes.view.js";

export function renderEntrenamientoGuiadoView(estadoApp = {}) {
  const estadoGuiado = obtenerEstadoGuiado();
  const rutina = estadoApp.rutina || { dias: [] };
  const diaSeleccionado = Number(estadoApp.diaSeleccionado || rutina.diaActual || 1);
  const dia = rutina.dias?.find((item) => Number(item.numero) === diaSeleccionado) || rutina.dias?.[0];

  return `
    ${crearEncabezadoVista({
      titulo: "Entrenamiento guiado",
      subtitulo: "Pantalla visual con paso actual, cronómetro, descansos y resumen.",
      pill: estadoGuiado.activo ? "En curso" : "Listo"
    })}

    <section class="grid-2">
      <article class="card guiado-panel">
        <span class="pill">Día ${escaparHTML(dia?.numero || "-")}</span>
        <h2>${escaparHTML(dia?.nombre || "Sin rutina seleccionada")}</h2>
        <p class="muted">${escaparHTML(dia?.objetivo || "Entrena con control y registra tu avance.")}</p>

        ${renderPasoActual(estadoGuiado)}

        <div class="acciones acciones-grid section-space">
          <button class="btn" data-action="guiado-iniciar">Iniciar</button>
          <button class="btn" data-action="guiado-hecho">Hecho</button>
          <button class="btn secundario" data-action="guiado-repetir">Repetir</button>
          <button class="btn secundario" data-action="guiado-pausar">Pausar</button>
          <button class="btn secundario" data-action="guiado-continuar">Continuar</button>
          <button class="btn secundario" data-action="guiado-sumar-descanso">+30s descanso</button>
          <button class="btn peligro" data-action="guiado-terminar">Terminar</button>
          <button class="btn secundario" data-nav="jarvis">Abrir Jarvis</button>
        </div>
      </article>

      <article class="card">
        <h2>Estado</h2>
        <div class="grid-2">
          <div class="metric">
            <span>Fase</span>
            <strong>${escaparHTML(estadoGuiado.fase || "inicio")}</strong>
          </div>
          <div class="metric">
            <span>Tiempo</span>
            <strong>${formatearTiempoGuiado(estadoGuiado.segundosRestantes || 0)}</strong>
          </div>
          <div class="metric">
            <span>Ejercicio</span>
            <strong>${Number(estadoGuiado.indiceEjercicio || 0) + 1}</strong>
          </div>
          <div class="metric">
            <span>Serie</span>
            <strong>${Number(estadoGuiado.indiceSerie || 0) + 1}</strong>
          </div>
        </div>

        <div class="alerta ${estadoGuiado.pausado ? "warning" : "ok"} section-space">
          <strong>${estadoGuiado.pausado ? "Pausado" : estadoGuiado.activo ? "Activo" : "Sin iniciar"}</strong>
          <p>${estadoGuiado.activo ? "Usa los botones grandes para avanzar." : "Presiona iniciar para comenzar el entrenamiento guiado."}</p>
        </div>
      </article>
    </section>

    <section class="grid-2">
      <article class="card">
        <h2>Nota rápida</h2>
        <div class="campo">
          <label for="guiado-nota">Observación del entrenamiento</label>
          <textarea id="guiado-nota" placeholder="Ejemplo: hoy terminé con buena energía."></textarea>
        </div>
        <button class="btn" data-action="guiado-guardar-nota">Guardar nota</button>
      </article>

      <article class="card">
        <h2>Resumen</h2>
        ${renderResumen(estadoGuiado)}
      </article>
    </section>

    <section class="card">
      <h2>Mensajes</h2>
      ${renderMensajes(estadoGuiado.mensajes || [])}
    </section>
  `;
}

function renderPasoActual(estadoGuiado) {
  const paso = estadoGuiado.pasoActual;

  if (!paso) {
    return `
      <div class="guiado-paso-vacio">
        <h3>Listo para empezar</h3>
        <p>Presiona iniciar para cargar el primer paso del entrenamiento.</p>
      </div>
    `;
  }

  return `
    <div class="guiado-paso ${estadoGuiado.fase || ""}">
      <span class="pill">${escaparHTML(estadoGuiado.fase || "paso")}</span>
      <h1>${escaparHTML(paso.titulo || "Paso actual")}</h1>
      <p>${escaparHTML(paso.descripcion || "Completa este paso con control.")}</p>

      ${paso.serie ? `
        <div class="grid-2">
          <div class="metric">
            <span>Serie</span>
            <strong>${escaparHTML(paso.serie)}</strong>
          </div>
          <div class="metric">
            <span>Total</span>
            <strong>${escaparHTML(paso.totalSeries || "-")}</strong>
          </div>
        </div>
      ` : ""}

      ${estadoGuiado.fase === "descanso" ? `
        <div class="guiado-timer">
          ${formatearTiempoGuiado(estadoGuiado.segundosRestantes || paso.duracionSeg || 0)}
        </div>
      ` : ""}
    </div>
  `;
}

function renderResumen(estadoGuiado) {
  const resumenVisual = crearResumenVisualGuiado(estadoGuiado.resumen);

  if (!estadoGuiado.resumen) {
    return `
      <p class="muted">Todavía no hay resumen. Termina una sesión guiada para verlo aquí.</p>
    `;
  }

  return `
    <h3>${escaparHTML(resumenVisual.titulo)}</h3>
    <p>${escaparHTML(resumenVisual.descripcion)}</p>
    <div class="grid-2">
      ${resumenVisual.metricas.map((metrica) => `
        <div class="metric">
          <span>${escaparHTML(metrica.label)}</span>
          <strong>${escaparHTML(metrica.valor)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderMensajes(mensajes) {
  if (!mensajes.length) {
    return "<p class=\"muted\">Sin mensajes todavía.</p>";
  }

  return `
    <div class="jarvis-mensajes">
      ${mensajes.slice(0, 8).map((mensaje) => `
        <div class="jarvis-mensaje ${escaparHTML(mensaje.tipo || "info")}">
          <span>${formatearHora(mensaje.creadoEn)}</span>
          <p>${escaparHTML(mensaje.texto)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function formatearHora(fechaISO) {
  try {
    return new Date(fechaISO).toLocaleTimeString("es-EC", {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (_) {
    return "";
  }
}
