/*
  Nombre completo: inicio.controller.js
  Ruta o ubicación: src/modules/inicio/inicio.controller.js

  Función o funciones:
    - Montar la pantalla de Inicio de primera vez.
    - Escuchar el envío del formulario inicial.
    - Guardar configuración inicial mediante inicio.service.js.
    - Avisar al router para abrir Estadísticas cuando el Inicio termina.

  Se conecta con:
    - src/modules/inicio/inicio.view.js
    - src/modules/inicio/inicio.service.js
    - src/app/app-router.js
*/

import { crearInicioService } from "./inicio.service.js";
import { crearInicioView, leerDatosInicio, mostrarErroresInicio } from "./inicio.view.js";

export function crearInicioController({ alCompletar } = {}) {
  const service = crearInicioService();

  function montar(contenedor) {
    const vista = crearInicioView();

    contenedor.innerHTML = "";
    contenedor.appendChild(vista.pantalla);

    vista.formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const datos = leerDatosInicio(vista.formulario);
      const resultado = service.guardarConfiguracionInicial(datos);

      mostrarErroresInicio(vista.formulario, resultado.errores || {});
      vista.mensaje.textContent = resultado.mensaje;
      vista.mensaje.className = resultado.ok ? "inicio-message inicio-message--ok" : "inicio-message inicio-message--error";

      if (resultado.ok && typeof alCompletar === "function") {
        alCompletar();
      }
    });
  }

  return {
    montar
  };
}
