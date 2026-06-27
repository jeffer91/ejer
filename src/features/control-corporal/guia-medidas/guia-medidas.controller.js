/*
  Nombre completo: guia-medidas.controller.js
  Ruta o ubicación: src/features/control-corporal/guia-medidas/guia-medidas.controller.js

  Función o funciones:
    - Montar la pantalla Guía visual de medidas dentro de Control corporal.
    - Mantener la guía separada de Estadísticas, Registro e Historial.

  Se conecta con:
    - src/features/control-corporal/guia-medidas/guia-medidas.view.js
    - src/features/control-corporal/control-corporal.module.js
*/

import { crearGuiaMedidasView } from "./guia-medidas.view.js";

export function crearGuiaMedidasController() {
  function montar(contenedor) {
    contenedor.innerHTML = "";
    contenedor.appendChild(crearGuiaMedidasView());
  }

  return {
    montar
  };
}
