/*
  Nombre completo: ajustes.controller.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/ajustes.controller.js

  Función o funciones:
    - Montar la pantalla Ajustes del módulo Entrenamiento.
    - Preparar conexión Gemini, IA y voz automática.
    - Dejar lista la vista para guardado local seguro.

  Se conecta con:
    - src/features/entrenamiento/ajustes/ajustes.view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { crearEntrenamientoAjustesView } from "./ajustes.view.js";

export function crearEntrenamientoAjustesController() {
  function montar(contenedor) {
    contenedor.innerHTML = "";
    contenedor.appendChild(crearEntrenamientoAjustesView());
  }

  return {
    montar
  };
}
