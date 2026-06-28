/*
  Nombre completo: app-router.js
  Ruta o ubicacion: src/app/app-router.js

  Funcion o funciones:
    - Controlar la navegacion principal de FitJeff.
    - Mostrar Inicio solo la primera vez.
    - Abrir Hoy como pantalla principal despues de completar Inicio.
    - Conectar el shell global con modulos grandes y submenus internos.
    - Montar funcionalidades desde src/features/features.registry.js.
    - Conectar Sistema: Actualizaciones y Ajustes.

  Se conecta con:
    - src/app/app.bootstrap.js
    - src/shell/shell.controller.js
    - src/shell/shell.memory.js
    - src/shell/shell.router.js
    - src/features/features.registry.js
    - src/features/control-corporal/inicio/inicio.controller.js
    - src/modules/ajustes/ajustes.controller.js
    - src/modules/actualizaciones/actualizaciones.controller.js
*/

import { esRutaFeature, montarPantallaFeature } from "../features/features.registry.js";
import { crearInicioController } from "../features/control-corporal/inicio/inicio.controller.js";
import { crearShellController } from "../shell/shell.controller.js";
import { SHELL_DEFAULT_ROUTE_ID, SHELL_ONBOARDING_ROUTE_ID } from "../shell/shell.menu.config.js";
import { guardarUbicacionShell, limpiarUbicacionShell } from "../shell/shell.memory.js";
import { resolverUbicacionShell } from "../shell/shell.router.js";
import { crearAjustesController } from "../modules/ajustes/ajustes.controller.js";
import { crearActualizacionesController } from "../modules/actualizaciones/actualizaciones.controller.js";

function limpiar(contenedor) {
  while (contenedor.firstChild) {
    contenedor.removeChild(contenedor.firstChild);
  }
}

export function crearRouterFitJeff(configuracion) {
  let perfilCompletado = configuracion.perfilInicialCompletado;
  const ubicacionInicial = resolverUbicacionShell({ rutaId: SHELL_DEFAULT_ROUTE_ID });
  let rutaActual = perfilCompletado ? ubicacionInicial.rutaId : SHELL_ONBOARDING_ROUTE_ID;
  let controllerActual = null;

  function desmontarControllerActual() {
    if (controllerActual && typeof controllerActual.desmontar === "function") {
      controllerActual.desmontar();
    }

    controllerActual = null;
  }

  function montarActualizaciones(contenedor) {
    controllerActual = crearActualizacionesController();
    controllerActual.montar(contenedor);
  }

  function montarAjustes(contenedor) {
    controllerActual = crearAjustesController({
      alReabrirInicio: () => {
        perfilCompletado = false;
        rutaActual = SHELL_ONBOARDING_ROUTE_ID;
        limpiarUbicacionShell();
        renderizarInicio();
      }
    });

    controllerActual.montar(contenedor);
  }

  function montarShell(ubicacion) {
    desmontarControllerActual();
    limpiar(configuracion.raiz);
    guardarUbicacionShell(ubicacion);

    const shellController = crearShellController({
      raiz: configuracion.raiz,
      onNavegar: navegar
    });

    return shellController.montar(ubicacion);
  }

  function renderizarInicio() {
    desmontarControllerActual();
    limpiar(configuracion.raiz);

    controllerActual = crearInicioController({
      alCompletar: () => {
        perfilCompletado = true;
        navegar(SHELL_DEFAULT_ROUTE_ID);
      }
    });

    controllerActual.montar(configuracion.raiz);
  }

  function renderizar(ruta) {
    rutaActual = ruta || rutaActual;

    if (!perfilCompletado) {
      rutaActual = SHELL_ONBOARDING_ROUTE_ID;
      renderizarInicio();
      return;
    }

    if (rutaActual === SHELL_ONBOARDING_ROUTE_ID) {
      rutaActual = SHELL_DEFAULT_ROUTE_ID;
    }

    const ubicacion = resolverUbicacionShell({ rutaId: rutaActual });
    rutaActual = ubicacion.rutaId;
    const main = montarShell(ubicacion);

    if (esRutaFeature(rutaActual)) {
      controllerActual = montarPantallaFeature(rutaActual, main, {
        alGuardar: () => {},
        alNavegar: navegar
      });
      return;
    }

    if (rutaActual === "actualizaciones") {
      montarActualizaciones(main);
      return;
    }

    if (rutaActual === "ajustes") {
      montarAjustes(main);
    }
  }

  function navegar(ruta) {
    rutaActual = ruta || rutaActual;
    renderizar(rutaActual);
  }

  return {
    iniciar: () => renderizar(rutaActual),
    navegar,
    obtenerRutaActual: () => rutaActual
  };
}
