/*
  Nombre completo: diario.controller.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.controller.js

  Función o funciones:
    - Montar la pantalla Diario del módulo Entrenamiento.
    - Preparar la vista de rutina diaria.
    - Dejar listo el espacio para rutina activa e IA en próximos bloques.

  Se conecta con:
    - src/features/entrenamiento/diario/diario.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearEntrenamientoDiarioView } from "./diario.view.js";

export function crearEntrenamientoDiarioController() {
  function montar(contenedor) {
    contenedor.innerHTML = "";
    contenedor.appendChild(crearEntrenamientoDiarioView());
  }

  return {
    montar
  };
}
