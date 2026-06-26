/*
  Nombre completo: pantalla-principal.view.js
  Ruta o ubicación: src/features/_template/pantalla-principal/pantalla-principal.view.js

  Función o funciones:
    - Construir una pantalla mínima de ejemplo.
    - Servir como base visual para nuevas funcionalidades.
*/

import "./pantalla-principal.css";

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  if (texto) {
    elemento.textContent = texto;
  }

  return elemento;
}

export function crearTemplatePrincipalView() {
  const pantalla = crearElemento("section", "template-screen");
  const card = crearElemento("article", "template-card");

  card.appendChild(crearElemento("p", "template-kicker", "Nueva funcionalidad"));
  card.appendChild(crearElemento("h2", "", "Pantalla principal"));
  card.appendChild(crearElemento("p", "", "Duplica esta plantilla y reemplaza el contenido por la nueva funcionalidad."));
  pantalla.appendChild(card);

  return pantalla;
}
