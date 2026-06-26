/*
  Nombre completo: shell.controller.js
  Ruta o ubicación: src/shell/shell.controller.js

  Función o funciones:
    - Coordinar el menú superior global.
    - Conectar módulos grandes con sus rutas internas.
    - Devolver el contenedor donde se monta la pantalla activa.

  Se conecta con:
    - src/shell/shell.view.js
    - src/shell/shell.menu.config.js
    - src/shell/shell.router.js
    - src/app/app-router.js
*/

import { SHELL_MODULES } from "./shell.menu.config.js";
import { montarShellView } from "./shell.view.js";
import { obtenerRutaPorDefectoShell } from "./shell.router.js";

export function crearShellController({ raiz, onNavegar }) {
  function montar(ubicacion) {
    return montarShellView({
      raiz,
      modulos: SHELL_MODULES,
      ubicacion,
      onSeleccionarModulo: (moduloId) => {
        const rutaDestino = obtenerRutaPorDefectoShell(moduloId);
        onNavegar(rutaDestino);
      },
      onSeleccionarRuta: (rutaId) => {
        onNavegar(rutaId);
      }
    });
  }

  return {
    montar
  };
}
