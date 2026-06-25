/*
  Nombre completo: ajustes.controller.js
  Ruta o ubicación: src/modules/ajustes/ajustes.controller.js

  Función o funciones:
    - Montar la pantalla Ajustes.
    - Guardar cambios de perfil y objetivo.
    - Reabrir Inicio cuando el usuario lo confirme.
    - Mantener Ajustes simple, sin mostrar datos técnicos.

  Se conecta con:
    - src/modules/ajustes/ajustes.service.js
    - src/modules/ajustes/ajustes.view.js
    - src/modules/ajustes/ajustes.constants.js
    - src/app/app-router.js
*/

import { AJUSTES_TEXTOS } from "./ajustes.constants.js";
import { crearAjustesService } from "./ajustes.service.js";
import { crearAjustesView, leerFormularioAjustes, mostrarErroresAjustes, mostrarMensajeAjustes } from "./ajustes.view.js";

export function crearAjustesController({ alReabrirInicio } = {}) {
  const service = crearAjustesService();

  function guardarPerfil(vista) {
    const datos = leerFormularioAjustes(vista.perfilForm);
    const resultado = service.guardarPerfil(datos);

    mostrarErroresAjustes(vista.perfilForm, resultado.errores || {});
    mostrarMensajeAjustes(vista.perfilMensaje, resultado.mensaje, resultado.ok);
  }

  function guardarObjetivo(vista) {
    const datos = leerFormularioAjustes(vista.objetivoForm);
    const resultado = service.guardarObjetivo(datos);

    mostrarErroresAjustes(vista.objetivoForm, resultado.errores || {});
    mostrarMensajeAjustes(vista.objetivoMensaje, resultado.mensaje, resultado.ok);
  }

  function reabrirInicio() {
    const confirmado = window.confirm(AJUSTES_TEXTOS.CONFIRMAR_INICIO);

    if (!confirmado) {
      return;
    }

    service.reabrirInicio();

    if (typeof alReabrirInicio === "function") {
      alReabrirInicio();
    }
  }

  function montar(contenedor) {
    const datos = service.obtenerDatos();
    const vista = crearAjustesView(datos);

    contenedor.innerHTML = "";
    contenedor.appendChild(vista.pantalla);

    vista.perfilForm.addEventListener("submit", (evento) => {
      evento.preventDefault();
      guardarPerfil(vista);
    });

    vista.objetivoForm.addEventListener("submit", (evento) => {
      evento.preventDefault();
      guardarObjetivo(vista);
    });

    vista.reabrirInicioBoton.addEventListener("click", reabrirInicio);
  }

  return {
    montar
  };
}
