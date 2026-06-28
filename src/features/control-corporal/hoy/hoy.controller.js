/*
  Nombre completo: hoy.controller.js
  Ruta o ubicacion: src/features/control-corporal/hoy/hoy.controller.js

  Funcion o funciones:
    - Montar la pantalla principal Hoy dentro de Control corporal.
    - Pedir el resumen simple a hoy.service.js.
    - Conectar botones de accion con la navegacion del shell.

  Se conecta con:
    - src/features/control-corporal/hoy/hoy.service.js
    - src/features/control-corporal/hoy/hoy.view.js
    - src/features/control-corporal/control-corporal.module.js
*/

import { crearHoyService } from "./hoy.service.js";
import { crearHoyView } from "./hoy.view.js";

export function crearHoyController({ alNavegar } = {}) {
  const service = crearHoyService();

  function navegarARuta(ruta) {
    if (!ruta) return;

    if (typeof alNavegar === "function") {
      alNavegar(ruta);
    }
  }

  function conectarAcciones(vista) {
    vista.querySelectorAll("[data-ruta-destino]").forEach((boton) => {
      boton.addEventListener("click", () => navegarARuta(boton.dataset.rutaDestino));
    });
  }

  function montar(contenedor) {
    const resumen = service.obtenerResumen();
    const vista = crearHoyView(resumen);

    contenedor.innerHTML = "";
    contenedor.appendChild(vista);
    conectarAcciones(vista);
  }

  return {
    montar
  };
}
