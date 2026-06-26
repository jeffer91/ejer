/*
  Nombre completo: rutinas.view.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.view.js

  Función o funciones:
    - Construir la pantalla Rutinas de Entrenamiento.
    - Mostrar campos base para crear planes reutilizables.
    - Mostrar rutinas locales activas e inactivas cuando existan.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.controller.js
    - src/features/entrenamiento/rutinas/rutinas.css
*/

import "./rutinas.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearCampo(label, placeholder) {
  const grupo = crearElemento("label", "entreno-rutinas-field");
  const texto = crearElemento("span", "", label);
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = placeholder;
  input.disabled = true;
  grupo.appendChild(texto);
  grupo.appendChild(input);
  return grupo;
}

function crearRutinaCard(rutina) {
  const card = crearElemento("article", "entreno-rutinas-card");
  card.appendChild(crearElemento("strong", "", rutina.nombre));
  card.appendChild(crearElemento("span", "", `${rutina.dias.length} día(s) · ${rutina.estado}`));
  return card;
}

export function crearEntrenamientoRutinasView({ rutinas = [] } = {}) {
  const pantalla = crearElemento("section", "entreno-rutinas-screen");
  const header = crearElemento("div", "entreno-rutinas-header");
  const form = crearElemento("section", "entreno-rutinas-form");
  const grid = crearElemento("div", "entreno-rutinas-grid");
  const lista = crearElemento("section", "entreno-rutinas-list");
  const rutinasGrid = crearElemento("div", "entreno-rutinas-saved");

  header.appendChild(crearElemento("p", "entreno-rutinas-kicker", "Planes"));
  header.appendChild(crearElemento("h2", "", "Rutinas"));
  header.appendChild(crearElemento("p", "", "Planes con días, calentamiento, ejercicios, descansos, series y repeticiones."));

  grid.appendChild(crearCampo("Nombre", "Ejemplo: Semana casa"));
  grid.appendChild(crearCampo("Días", "Ejemplo: 4"));
  grid.appendChild(crearCampo("Calentamiento", "Breve descripción"));
  grid.appendChild(crearCampo("Ejercicios", "Lista por día"));
  grid.appendChild(crearCampo("Descansos", "Entre actividades"));
  grid.appendChild(crearCampo("Series y repeticiones", "Formato base"));

  form.appendChild(crearElemento("h3", "", "Crear rutina"));
  form.appendChild(grid);
  form.appendChild(crearElemento("p", "entreno-rutinas-note", "La estructura de guardado local ya está creada. El formulario editable se activa en el bloque de Rutinas."));

  lista.appendChild(crearElemento("h3", "", "Rutinas guardadas"));

  if (rutinas.length === 0) {
    lista.appendChild(crearElemento("p", "", "Todavía no hay rutinas guardadas."));
  } else {
    rutinas.forEach((rutina) => rutinasGrid.appendChild(crearRutinaCard(rutina)));
    lista.appendChild(rutinasGrid);
  }

  pantalla.appendChild(header);
  pantalla.appendChild(form);
  pantalla.appendChild(lista);
  return pantalla;
}
