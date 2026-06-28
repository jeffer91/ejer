/*
  Nombre completo: inicio.controller.js
  Ruta o ubicacion: src/features/control-corporal/inicio/inicio.controller.js

  Funcion o funciones:
    - Montar la pantalla de Inicio de primera vez dentro de Control corporal.
    - Escuchar el envio del formulario inicial.
    - Guardar configuracion inicial mediante inicio.service.js.
    - Avisar al router para abrir Hoy cuando el Inicio termina.

  Se conecta con:
    - src/features/control-corporal/inicio/inicio.view.js
    - src/features/control-corporal/inicio/inicio.service.js
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
