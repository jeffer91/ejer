/*
  Nombre completo: ajustes.view.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/ajustes.view.js

  Función o funciones:
    - Construir la pantalla Ajustes de Entrenamiento.
    - Mostrar base para Gemini, IA y voz automática.
    - Preparar guardado local de configuración para próximos bloques.

  Se conecta con:
    - src/features/entrenamiento/ajustes/ajustes.controller.js
    - src/features/entrenamiento/ajustes/ajustes.css
*/

import "./ajustes.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function crearToggle(label, detalle) {
  const fila = crearElemento("article", "entreno-ajustes-row");
  const textos = crearElemento("div", "");
  const boton = crearElemento("button", "entreno-ajustes-toggle", "Pendiente");
  boton.type = "button";
  boton.disabled = true;
  textos.appendChild(crearElemento("strong", "", label));
  textos.appendChild(crearElemento("p", "", detalle));
  fila.appendChild(textos);
  fila.appendChild(boton);
  return fila;
}

export function crearEntrenamientoAjustesView() {
  const pantalla = crearElemento("section", "entreno-ajustes-screen");
  const header = crearElemento("div", "entreno-ajustes-header");
  const panel = crearElemento("section", "entreno-ajustes-panel");
  const keyBox = crearElemento("label", "entreno-ajustes-key");
  const input = document.createElement("input");

  input.type = "password";
  input.placeholder = "API Key de Gemini";
  input.disabled = true;

  header.appendChild(crearElemento("p", "entreno-ajustes-kicker", "Conexión"));
  header.appendChild(crearElemento("h2", "", "Ajustes"));
  header.appendChild(crearElemento("p", "", "Base para conectar Gemini, guía por IA y voz automática."));

  keyBox.appendChild(crearElemento("span", "", "Gemini"));
  keyBox.appendChild(input);
  keyBox.appendChild(crearElemento("small", "", "La clave se guardará localmente cuando se active el bloque de datos."));

  panel.appendChild(keyBox);
  panel.appendChild(crearToggle("IA de entrenamiento", "Preparada para sugerencias y ajustes de sesión."));
  panel.appendChild(crearToggle("Voz automática", "Preparada para guía hablada durante la sesión."));
  panel.appendChild(crearToggle("Prueba de conexión", "Se activará cuando exista el servicio Gemini."));

  pantalla.appendChild(header);
  pantalla.appendChild(panel);
  return pantalla;
}
