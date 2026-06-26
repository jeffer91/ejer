/*
  Nombre completo: rutinas.view.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.view.js

  Función o funciones:
    - Construir la pantalla Rutinas de Entrenamiento.
    - Mostrar campos base para crear planes reutilizables.
    - Preparar activos e inactivos para el siguiente bloque.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.controller.js
    - src/features/entrenamiento/rutinas/rutinas.css
*/

import "./rutinas.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
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

export function crearEntrenamientoRutinasView() {
  const pantalla = crearElemento("section", "entreno-rutinas-screen");
  const header = crearElemento("div", "entreno-rutinas-header");
  const form = crearElemento("section", "entreno-rutinas-form");
  const grid = crearElemento("div", "entreno-rutinas-grid");
  const lista = crearElemento("section", "entreno-rutinas-list");

  header.appendChild(crearElemento("p", "entreno-rutinas-kicker", "Planes"));
  header.appendChild(crearElemento("h2", "", "Rutinas"));
  header.appendChild(crearElemento("p", "", "Aquí se crearán planes con días, calentamiento, ejercicios, descansos, series y repeticiones."));

  grid.appendChild(crearCampo("Nombre", "Ejemplo: Semana casa"));
  grid.appendChild(crearCampo("Días", "Ejemplo: 4"));
  grid.appendChild(crearCampo("Calentamiento", "Breve descripción"));
  grid.appendChild(crearCampo("Ejercicios", "Lista por día"));
  grid.appendChild(crearCampo("Descansos", "Entre actividades"));
  grid.appendChild(crearCampo("Series y repeticiones", "Formato base"));

  form.appendChild(crearElemento("h3", "", "Crear rutina"));
  form.appendChild(grid);
  form.appendChild(crearElemento("p", "entreno-rutinas-note", "Formulario visual listo. El guardado se conecta en el bloque 2."));

  lista.appendChild(crearElemento("h3", "", "Rutinas guardadas"));
  lista.appendChild(crearElemento("p", "", "Todavía no hay rutinas porque falta conectar datos locales."));

  pantalla.appendChild(header);
  pantalla.appendChild(form);
  pantalla.appendChild(lista);
  return pantalla;
}
