/*
  Nombre completo: modal.js
  Ruta o ubicación: src/ui/modal.js

  Función:
    - Mostrar mensajes, confirmaciones y formularios simples en ventanas modales.
    - Evitar usar alert/confirm en el flujo principal de la app.
    - Mantener una experiencia limpia en Live Server, Electron y celular.

  Se conecta con:
    - src/ui/helpers.js
    - src/app.js
    - src/actualizaciones/actualizaciones.service.js
    - src/sincronizacion/sincronizacion.service.js
*/

import { escaparHTML } from "./helpers.js";

let modalActivo = null;

export function mostrarModal({
  titulo = "FitJeff",
  contenido = "",
  acciones = [],
  cerrable = true
} = {}) {
  cerrarModal();

  const overlay = document.createElement("div");
  overlay.className = "fit-modal-overlay";
  overlay.setAttribute("role", "presentation");

  const botones = acciones.length
    ? acciones.map(crearBotonAccion).join("")
    : crearBotonAccion({ texto: "Aceptar", tipo: "secundario", valor: "ok" });

  overlay.innerHTML = `
    <section
      class="fit-modal card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fit-modal-title"
    >
      <div class="fit-modal-header">
        <h2 id="fit-modal-title">${escaparHTML(titulo)}</h2>
        ${
          cerrable
            ? `<button class="fit-modal-close" type="button" data-modal-close aria-label="Cerrar">×</button>`
            : ""
        }
      </div>

      <div class="fit-modal-body">
        ${contenido}
      </div>

      <div class="fit-modal-actions acciones">
        ${botones}
      </div>
    </section>
  `;

  document.body.appendChild(overlay);
  modalActivo = overlay;

  overlay.addEventListener("click", (event) => {
    const cerrar = event.target.closest("[data-modal-close]");
    const accion = event.target.closest("[data-modal-action]");

    if (cerrar && cerrable) {
      cerrarModal();
      return;
    }

    if (accion) {
      const valor = accion.dataset.modalAction;
      const handler = acciones.find((item) => String(item.valor) === String(valor))?.onClick;

      if (typeof handler === "function") {
        handler(valor);
      }

      if (accion.dataset.noClose !== "true") {
        cerrarModal();
      }
    }
  });

  const primerBoton = overlay.querySelector("button");
  primerBoton?.focus();

  return overlay;
}

export function cerrarModal() {
  if (modalActivo) {
    modalActivo.remove();
    modalActivo = null;
  }
}

export function mostrarMensaje(titulo, mensaje, tipo = "info") {
  return mostrarModal({
    titulo,
    contenido: `
      <div class="alerta ${tipo === "error" ? "danger" : tipo === "ok" ? "ok" : ""}">
        ${escaparHTML(mensaje)}
      </div>
    `,
    acciones: [
      {
        texto: "Aceptar",
        valor: "ok",
        tipo: "secundario"
      }
    ]
  });
}

export function mostrarConfirmacion({
  titulo = "Confirmar",
  mensaje = "¿Deseas continuar?",
  textoAceptar = "Aceptar",
  textoCancelar = "Cancelar",
  onAceptar,
  onCancelar
} = {}) {
  return mostrarModal({
    titulo,
    contenido: `<p>${escaparHTML(mensaje)}</p>`,
    acciones: [
      {
        texto: textoCancelar,
        valor: "cancelar",
        tipo: "secundario",
        onClick: onCancelar
      },
      {
        texto: textoAceptar,
        valor: "aceptar",
        tipo: "principal",
        onClick: onAceptar
      }
    ]
  });
}

export function asegurarEstilosModal() {
  if (document.getElementById("fit-modal-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "fit-modal-styles";
  style.textContent = `
    .fit-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: grid;
      place-items: center;
      padding: 16px;
      background: rgba(15, 23, 42, 0.46);
    }

    .fit-modal {
      width: min(560px, 100%);
      max-height: calc(100vh - 32px);
      overflow: auto;
    }

    .fit-modal-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      margin-bottom: 10px;
    }

    .fit-modal-header h2 {
      margin: 0;
    }

    .fit-modal-close {
      width: 38px;
      height: 38px;
      border-radius: 999px;
      background: #f3f4f6;
      color: #111827;
      font-size: 1.3rem;
    }

    .fit-modal-body {
      margin-bottom: 14px;
    }
  `;

  document.head.appendChild(style);
}

function crearBotonAccion(accion) {
  const clase = accion.tipo === "principal" ? "btn" : accion.tipo === "peligro" ? "btn peligro" : "btn secundario";

  return `
    <button
      class="${clase}"
      type="button"
      data-modal-action="${escaparHTML(accion.valor || accion.texto)}"
      ${accion.noClose ? "data-no-close=\"true\"" : ""}
    >
      ${escaparHTML(accion.texto || "Aceptar")}
    </button>
  `;
}
