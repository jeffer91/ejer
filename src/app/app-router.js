/*
  Nombre completo: app-router.js
  Ruta o ubicación: src/app/app-router.js

  Función o funciones:
    - Controlar la navegación principal de FitJeff.
    - Mostrar Inicio solo la primera vez.
    - Abrir Estadísticas por defecto después de completar Inicio.
    - Conectar Estadísticas con su pantalla real.
    - Conectar Registro con su pantalla real de Ingreso.
    - Conectar Historial con su pantalla real.
    - Conectar Ajustes con su pantalla real.
    - Mantener el menú visible simple: Estadísticas, Registro, Historial y Ajustes.

  Se conecta con:
    - src/app/app.bootstrap.js
    - src/modules/inicio/inicio.controller.js
    - src/modules/ajustes/ajustes.controller.js
    - src/modules/registro/estadisticas/estadisticas.controller.js
    - src/modules/registro/ingreso/ingreso.controller.js
    - src/modules/registro/historial/historial.controller.js
*/

import { crearInicioController } from "../modules/inicio/inicio.controller.js";
import { crearAjustesController } from "../modules/ajustes/ajustes.controller.js";
import { crearEstadisticasController } from "../modules/registro/estadisticas/estadisticas.controller.js";
import { crearHistorialController } from "../modules/registro/historial/historial.controller.js";
import { crearIngresoController } from "../modules/registro/ingreso/ingreso.controller.js";

const RUTAS_VISIBLES = ["estadisticas", "registro", "historial", "ajustes"];

const NOMBRES = {
  inicio: "Inicio",
  estadisticas: "Estadísticas",
  registro: "Registro",
  historial: "Historial",
  ajustes: "Ajustes"
};

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function limpiar(contenedor) {
  while (contenedor.firstChild) {
    contenedor.removeChild(contenedor.firstChild);
  }
}

export function crearRouterFitJeff(configuracion) {
  let perfilCompletado = configuracion.perfilInicialCompletado;
  let rutaActual = perfilCompletado ? "estadisticas" : "inicio";

  function montarEstadisticas(contenedor) {
    const controller = crearEstadisticasController();
    controller.montar(contenedor);
  }

  function montarRegistro(contenedor) {
    const controller = crearIngresoController({
      alGuardar: () => {}
    });

    controller.montar(contenedor);
  }

  function montarHistorial(contenedor) {
    const controller = crearHistorialController();
    controller.montar(contenedor);
  }

  function montarAjustes(contenedor) {
    const controller = crearAjustesController({
      alReabrirInicio: () => {
        perfilCompletado = false;
        rutaActual = "inicio";
        renderizarInicio();
      }
    });

    controller.montar(contenedor);
  }

  function montarShell(ruta) {
    limpiar(configuracion.raiz);

    const shell = crearElemento("div", "fj-app-shell");
    const header = crearElemento("header", "fj-header");
    const titulo = crearElemento("h1", "", NOMBRES[ruta]);
    const estado = crearElemento("span", "fj-status fj-status--info", "Datos al día");
    const nav = crearElemento("nav", "fj-nav");
    const main = crearElemento("main", "fj-main");

    header.appendChild(titulo);
    header.appendChild(estado);

    RUTAS_VISIBLES.forEach((rutaItem) => {
      const boton = crearElemento("button", "fj-nav__button", NOMBRES[rutaItem]);
      boton.type = "button";
      if (rutaItem === ruta) boton.classList.add("fj-nav__button--active");
      boton.addEventListener("click", () => navegar(rutaItem));
      nav.appendChild(boton);
    });

    shell.appendChild(header);
    shell.appendChild(nav);
    shell.appendChild(main);
    configuracion.raiz.appendChild(shell);

    return main;
  }

  function renderizarInicio() {
    limpiar(configuracion.raiz);

    const controller = crearInicioController({
      alCompletar: () => {
        perfilCompletado = true;
        navegar("estadisticas");
      }
    });

    controller.montar(configuracion.raiz);
  }

  function renderizar(ruta) {
    rutaActual = ruta || rutaActual;

    if (!perfilCompletado) {
      rutaActual = "inicio";
      renderizarInicio();
      return;
    }

    if (rutaActual === "inicio") {
      rutaActual = "estadisticas";
    }

    const main = montarShell(rutaActual);

    if (rutaActual === "estadisticas") {
      montarEstadisticas(main);
      return;
    }

    if (rutaActual === "registro") {
      montarRegistro(main);
      return;
    }

    if (rutaActual === "historial") {
      montarHistorial(main);
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
