/*
  Nombre completo: estadisticas.controller.js
  Ruta o ubicación: src/modules/registro/estadisticas/estadisticas.controller.js

  Función o funciones:
    - Montar la pantalla principal de Estadísticas.
    - Pedir el resumen a estadisticas.service.js.
    - Renderizar tarjetas, barra de objetivo, gráfico y medidas.

  Se conecta con:
    - src/modules/registro/estadisticas/estadisticas.service.js
    - src/modules/registro/estadisticas/estadisticas.view.js
    - src/app/app-router.js
*/

import { crearEstadisticasService } from "./estadisticas.service.js";
import { crearEstadisticasView } from "./estadisticas.view.js";

export function crearEstadisticasController() {
  const service = crearEstadisticasService();

  function montar(contenedor) {
    const resumen = service.obtenerResumen();
    const vista = crearEstadisticasView(resumen);

    contenedor.innerHTML = "";
    contenedor.appendChild(vista);
  }

  return {
    montar
  };
}
