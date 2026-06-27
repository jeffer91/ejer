/*
  Nombre completo: ajustes.view.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/ajustes.view.js

  Función o funciones:
    - Construir la pantalla Ajustes de Entrenamiento.
    - Guardar API Key, modelo, IA y voz automática.
    - Probar Gemini y voz desde la interfaz.

  Se conecta con:
    - src/features/entrenamiento/ajustes/ajustes.controller.js
    - src/features/entrenamiento/ajustes/ajustes.css
*/

import "./ajustes.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearCampo({ nombre, label, tipo = "text", valor = "", placeholder = "" }) {
  const grupo = crearElemento("label", "entreno-ajustes-field");
  const texto = crearElemento("span", "", label);
  const input = document.createElement("input");

  input.name = nombre;
  input.type = tipo;
  input.value = valor || "";
  input.placeholder = placeholder;
  input.step = tipo === "number" ? "0.1" : "";

  grupo.appendChild(texto);
  grupo.appendChild(input);
  return grupo;
}

function crearCheck({ nombre, label, detalle, activo = false }) {
  const grupo = crearElemento("label", "entreno-ajustes-check");
  const input = document.createElement("input");
  const textos = crearElemento("div", "");

  input.type = "checkbox";
  input.name = nombre;
  input.checked = Boolean(activo);
  textos.appendChild(crearElemento("strong", "", label));
  textos.appendChild(crearElemento("span", "", detalle));
  grupo.appendChild(input);
  grupo.appendChild(textos);
  return grupo;
}

function crearSelectVoz(voces = [], vozActual = "") {
  const grupo = crearElemento("label", "entreno-ajustes-field");
  const texto = crearElemento("span", "", "Voz");
  const select = document.createElement("select");

  select.name = "vozNombre";
  const opcionBase = document.createElement("option");
  opcionBase.value = "";
  opcionBase.textContent = voces.length ? "Voz predeterminada" : "Sin voces cargadas";
  select.appendChild(opcionBase);

  voces.forEach((voz) => {
    const opcion = document.createElement("option");
    opcion.value = voz.nombre;
    opcion.textContent = `${voz.nombre} · ${voz.idioma || "sin idioma"}`;
    opcion.selected = voz.nombre === vozActual;
    select.appendChild(opcion);
  });

  grupo.appendChild(texto);
  grupo.appendChild(select);
  return grupo;
}

function leerFormulario(formulario) {
  const datos = new FormData(formulario);

  return {
    geminiApiKey: datos.get("geminiApiKey"),
    geminiModelo: datos.get("geminiModelo"),
    iaActiva: datos.get("iaActiva") === "on",
    vozActiva: datos.get("vozActiva") === "on",
    vozNombre: datos.get("vozNombre"),
    volumenVoz: datos.get("volumenVoz"),
    velocidadVoz: datos.get("velocidadVoz")
  };
}

function crearMensaje(mensaje) {
  if (!mensaje) return null;

  const caja = crearElemento("div", mensaje.ok ? "entreno-ajustes-message entreno-ajustes-message--ok" : "entreno-ajustes-message entreno-ajustes-message--error");
  caja.appendChild(crearElemento("strong", "", mensaje.ok ? "Listo" : "Revisar"));
  caja.appendChild(crearElemento("span", "", mensaje.mensaje || "Acción realizada."));
  return caja;
}

function crearEstado(label, activo, detalle) {
  const fila = crearElemento("article", "entreno-ajustes-row");
  const textos = crearElemento("div", "");
  const estado = crearElemento("span", activo ? "entreno-ajustes-pill entreno-ajustes-pill--on" : "entreno-ajustes-pill", activo ? "Activo" : "Inactivo");

  textos.appendChild(crearElemento("strong", "", label));
  textos.appendChild(crearElemento("p", "", detalle));
  fila.appendChild(textos);
  fila.appendChild(estado);
  return fila;
}

export function crearEntrenamientoAjustesView({ vista = {}, mensaje = null, onGuardar, onBorrarKey, onProbarVoz, onProbarGemini } = {}) {
  const pantalla = crearElemento("section", "entreno-ajustes-screen");
  const header = crearElemento("div", "entreno-ajustes-header");
  const panel = crearElemento("section", "entreno-ajustes-panel");
  const form = crearElemento("form", "entreno-ajustes-form");
  const estadoPanel = crearElemento("section", "entreno-ajustes-panel");
  const acciones = crearElemento("div", "entreno-ajustes-actions");
  const mensajeNodo = crearMensaje(mensaje);
  const ajustes = vista.ajustes || {};
  const voces = vista.voces || [];

  header.appendChild(crearElemento("p", "entreno-ajustes-kicker", "Conexión"));
  header.appendChild(crearElemento("h2", "", "Ajustes"));
  header.appendChild(crearElemento("p", "", "Configura Gemini, IA de entrenamiento y voz automática."));

  if (mensajeNodo) panel.appendChild(mensajeNodo);

  form.appendChild(crearCampo({
    nombre: "geminiApiKey",
    label: "API Key Gemini",
    tipo: "password",
    placeholder: ajustes.geminiApiKeyVisible ? `Guardada: ${ajustes.geminiApiKeyVisible}` : "Pega aquí tu API Key"
  }));
  form.appendChild(crearCampo({
    nombre: "geminiModelo",
    label: "Modelo Gemini",
    valor: ajustes.geminiModelo || "gemini-1.5-flash",
    placeholder: "gemini-1.5-flash"
  }));
  form.appendChild(crearSelectVoz(voces, ajustes.vozNombre));
  form.appendChild(crearCampo({ nombre: "volumenVoz", label: "Volumen", tipo: "number", valor: ajustes.volumenVoz ?? 1 }));
  form.appendChild(crearCampo({ nombre: "velocidadVoz", label: "Velocidad", tipo: "number", valor: ajustes.velocidadVoz ?? 1 }));
  form.appendChild(crearCheck({ nombre: "iaActiva", label: "IA de entrenamiento", detalle: "Permite usar Gemini para guías y sugerencias.", activo: ajustes.iaActiva }));
  form.appendChild(crearCheck({ nombre: "vozActiva", label: "Voz automática", detalle: "Permite guía hablada durante sesiones.", activo: ajustes.vozActiva }));

  const guardar = crearElemento("button", "entreno-ajustes-button entreno-ajustes-button--primary", "Guardar ajustes");
  const probarGemini = crearElemento("button", "entreno-ajustes-button", "Probar Gemini");
  const probarVoz = crearElemento("button", "entreno-ajustes-button", "Probar voz");
  const borrarKey = crearElemento("button", "entreno-ajustes-button entreno-ajustes-button--danger", "Borrar Key");

  guardar.type = "submit";
  probarGemini.type = "button";
  probarVoz.type = "button";
  borrarKey.type = "button";

  probarGemini.addEventListener("click", () => onProbarGemini?.());
  probarVoz.addEventListener("click", () => onProbarVoz?.());
  borrarKey.addEventListener("click", () => onBorrarKey?.());

  acciones.appendChild(guardar);
  acciones.appendChild(probarGemini);
  acciones.appendChild(probarVoz);
  acciones.appendChild(borrarKey);
  form.appendChild(acciones);

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    onGuardar?.(leerFormulario(form));
  });

  panel.appendChild(form);

  estadoPanel.appendChild(crearElemento("h3", "", "Estado"));
  estadoPanel.appendChild(crearEstado("Gemini", Boolean(ajustes.geminiApiKeyVisible), ajustes.ultimaPruebaGemini?.mensaje || "Pendiente de prueba."));
  estadoPanel.appendChild(crearEstado("IA", Boolean(ajustes.iaActiva), "Controla sugerencias inteligentes."));
  estadoPanel.appendChild(crearEstado("Voz", Boolean(ajustes.vozActiva), vista.vozSoportada ? "Voz disponible en este entorno." : "Voz no disponible en este entorno."));
  estadoPanel.appendChild(crearElemento("p", "entreno-ajustes-safe", "La guía de entrenamiento debe ajustarse a tu nivel. Detén la sesión si aparece dolor fuerte, mareo o malestar."));

  pantalla.appendChild(header);
  pantalla.appendChild(panel);
  pantalla.appendChild(estadoPanel);
  return pantalla;
}
