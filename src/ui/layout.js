/*
  Nombre completo: layout.js
  Ruta o ubicación: src/ui/layout.js

  Función:
    - Construir el contenedor visual principal de FitJeff.
    - Renderizar header, navegación superior, área principal y estado de sincronización.
    - Evitar duplicar estructura HTML en cada vista.

  Se conecta con:
    - src/ui/menu.js
    - src/ui/router.js
    - src/ui/helpers.js
    - src/app.js
*/

import { crearMenuPrincipal } from "./menu.js";
import { escaparHTML } from "./helpers.js";

export function renderizarLayout({
  rootId = "app",
  titulo = "FitJeff",
  subtitulo = "Tu entrenamiento de hoy",
  version = "0.1.0",
  estadoSync = "local",
  accionesHeader = true
} = {}) {
  const root = document.getElementById(rootId);

  if (!root) {
    throw new Error(`No se encontró el contenedor #${rootId}.`);
  }

  root.innerHTML = `
    <div class="fit-shell">
      <header class="fit-header">
        <div class="fit-header-inner">
          <div class="fit-brand">
            <strong>${escaparHTML(titulo)}</strong>
            <span>${escaparHTML(subtitulo)}</span>
          </div>

          <div class="acciones fit-header-actions">
            <span class="pill" id="fit-version">v${escaparHTML(version)}</span>
            <span class="pill" id="fit-sync-status">${escaparHTML(estadoSync)}</span>
            ${accionesHeader ? crearAccionesHeader() : ""}
          </div>
        </div>

        ${crearMenuPrincipal()}
      </header>

      <main id="vista" class="fit-main" tabindex="-1"></main>
    </div>
  `;

  return {
    root,
    vista: obtenerContenedorVista(),
    syncStatus: document.getElementById("fit-sync-status")
  };
}

export function obtenerContenedorVista() {
  const vista = document.getElementById("vista");

  if (!vista) {
    throw new Error("No existe el contenedor principal #vista.");
  }

  return vista;
}

export function limpiarVista() {
  const vista = obtenerContenedorVista();
  vista.innerHTML = "";
  return vista;
}

export function renderizarEnVista(html) {
  const vista = obtenerContenedorVista();
  vista.innerHTML = html;
  vista.focus({ preventScroll: true });
  return vista;
}

export function actualizarEstadoSincronizacion({ estado = "local", detalle = "" } = {}) {
  const elemento = document.getElementById("fit-sync-status");

  if (!elemento) {
    return;
  }

  const texto = detalle ? `${estado}: ${detalle}` : estado;
  elemento.textContent = texto;
  elemento.dataset.estado = estado;
}

export function mostrarPantallaCarga(mensaje = "Cargando FitJeff...") {
  return renderizarEnVista(`
    <section class="card center" style="min-height: 260px;">
      <div>
        <h1>FitJeff</h1>
        <p class="muted">${escaparHTML(mensaje)}</p>
      </div>
    </section>
  `);
}

export function mostrarErrorPantalla({ titulo = "Ocurrió un problema", mensaje = "Intenta nuevamente." } = {}) {
  return renderizarEnVista(`
    <section class="card">
      <h1>${escaparHTML(titulo)}</h1>
      <div class="alerta danger">
        ${escaparHTML(mensaje)}
      </div>
      <div class="acciones section-space">
        <button class="btn secundario" type="button" data-nav="inicio">Volver al inicio</button>
      </div>
    </section>
  `);
}

function crearAccionesHeader() {
  return `
    <button class="btn secundario" type="button" data-nav="ajustes">
      Ajustes
    </button>
  `;
}
