/*
  Nombre completo: diario.view.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.view.js

  Función o funciones:
    - Construir la pantalla Diario de Entrenamiento.
    - Mostrar el espacio donde irá la rutina del día.
    - Preparar acciones para iniciar, completar y revisar una sesión.

  Se conecta con:
    - src/features/entrenamiento/diario/diario.controller.js
    - src/features/entrenamiento/diario/diario.css
*/

import "./diario.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function crearAccion(texto, clase = "") {
  const boton = crearElemento("button", `entreno-diario-button ${clase}`.trim(), texto);
  boton.type = "button";
  boton.disabled = true;
  return boton;
}

export function crearEntrenamientoDiarioView() {
  const pantalla = crearElemento("section", "entreno-diario-screen");
  const header = crearElemento("div", "entreno-diario-header");
  const panel = crearElemento("section", "entreno-diario-panel");
  const acciones = crearElemento("div", "entreno-diario-actions");
  const lista = crearElemento("div", "entreno-diario-list");

  header.appendChild(crearElemento("p", "entreno-diario-kicker", "Hoy"));
  header.appendChild(crearElemento("h2", "", "Diario"));
  header.appendChild(crearElemento("p", "", "Aquí se cargará la rutina activa según el día y los ajustes guardados."));

  lista.appendChild(crearElemento("article", "entreno-diario-item", "Rutina activa: pendiente de configurar."));
  lista.appendChild(crearElemento("article", "entreno-diario-item", "Guía con IA: pendiente de conectar."));
  lista.appendChild(crearElemento("article", "entreno-diario-item", "Registro del día: pendiente de datos locales."));

  acciones.appendChild(crearAccion("Iniciar"));
  acciones.appendChild(crearAccion("Completar"));
  acciones.appendChild(crearAccion("Revisar"));

  panel.appendChild(crearElemento("h3", "", "Sesión del día"));
  panel.appendChild(lista);
  panel.appendChild(acciones);

  pantalla.appendChild(header);
  pantalla.appendChild(panel);
  return pantalla;
}
