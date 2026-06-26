/*
  Nombre completo: ajustes.view.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/ajustes.view.js

  Función o funciones:
    - Construir la pantalla Ajustes de Entrenamiento.
    - Mostrar estado local de Gemini, IA y voz automática.
    - Preparar guardado local de configuración para próximos bloques.

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

function crearToggle(label, detalle, activo = false) {
  const fila = crearElemento("article", "entreno-ajustes-row");
  const textos = crearElemento("div", "");
  const boton = crearElemento("button", "entreno-ajustes-toggle", activo ? "Activo" : "Inactivo");
  boton.type = "button";
  boton.disabled = true;
  textos.appendChild(crearElemento("strong", "", label));
  textos.appendChild(crearElemento("p", "", detalle));
  fila.appendChild(textos);
  fila.appendChild(boton);
  return fila;
}

export function crearEntrenamientoAjustesView({ ajustes = {} } = {}) {
  const pantalla = crearElemento("section", "entreno-ajustes-screen");
  const header = crearElemento("div", "entreno-ajustes-header");
  const panel = crearElemento("section", "entreno-ajustes-panel");
  const keyBox = crearElemento("label", "entreno-ajustes-key");
  const input = document.createElement("input");
  const tieneGemini = Boolean(ajustes.geminiApiKey);

  input.type = "password";
  input.placeholder = tieneGemini ? "Gemini configurado" : "API Key de Gemini pendiente";
  input.disabled = true;

  header.appendChild(crearElemento("p", "entreno-ajustes-kicker", "Conexión"));
  header.appendChild(crearElemento("h2", "", "Ajustes"));
  header.appendChild(crearElemento("p", "", "Estado local de Gemini, guía por IA y voz automática."));

  keyBox.appendChild(crearElemento("span", "", "Gemini"));
  keyBox.appendChild(input);
  keyBox.appendChild(crearElemento("small", "", tieneGemini ? "Clave guardada localmente." : "La clave se guardará solo en este dispositivo."));

  panel.appendChild(keyBox);
  panel.appendChild(crearToggle("IA de entrenamiento", "Sugerencias y ajustes de sesión.", Boolean(ajustes.iaActiva)));
  panel.appendChild(crearToggle("Voz automática", "Guía hablada durante la sesión.", Boolean(ajustes.vozActiva)));
  panel.appendChild(crearToggle("Prueba de conexión", "Se activará cuando exista el servicio Gemini.", tieneGemini));

  pantalla.appendChild(header);
  pantalla.appendChild(panel);
  return pantalla;
}
