/*
  Nombre completo: pantalla-principal.controller.js
  Ruta o ubicación: src/features/_template/pantalla-principal/pantalla-principal.controller.js

  Función o funciones:
    - Montar una pantalla mínima de ejemplo.
    - Servir como base para nuevos controllers.
*/

import { crearTemplatePrincipalView } from "./pantalla-principal.view.js";

export function crearTemplatePrincipalController() {
  function montar(contenedor) {
    const vista = crearTemplatePrincipalView();

    contenedor.innerHTML = "";
    contenedor.appendChild(vista);
  }

  return {
    montar
  };
}
