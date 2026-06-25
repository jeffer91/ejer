/*
  Nombre completo: app-router.js
  Ruta o ubicación: src/app/app-router.js

  Función o funciones:
    - Controlar la navegación principal de FitJeff.
    - Mostrar Inicio solo la primera vez.
    - Abrir Estadísticas por defecto después de completar Inicio.
    - Mantener el menú visible simple: Estadísticas, Registro, Historial y Ajustes.

  Se conecta con:
    - src/app/app.bootstrap.js
    - src/modules/inicio/inicio.controller.js
*/

import { crearInicioController } from "../modules/inicio/inicio.controller.js";

const RUTAS_VISIBLES = ["estadisticas", "registro", "historial", "ajustes"];

const NOMBRES = {
  inicio: "Inicio",
  estadisticas: "Estadísticas",
  registro: "Registro",
  historial: "Historial",
  ajustes: "Ajustes"
};

const TEXTOS = {
  estadisticas: "Aquí se mostrará peso actual, objetivo, tendencia, IMC, próxima medición y Datos al día.",
  registro: "Aquí irá el registro compacto de peso diario y medidas semanales.",
  historial: "Aquí podrás revisar, editar y enviar registros a papelera.",
  ajustes: "Aquí estarán perfil y objetivo en una pantalla simple."
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

  function montarPantallaBase(contenedor, ruta) {
    const tarjeta = crearElemento("section", "fj-card");
    tarjeta.appendChild(crearElemento("p", "fj-kicker", "Módulo en construcción"));
    tarjeta.appendChild(crearElemento("h2", "", NOMBRES[ruta]));
    tarjeta.appendChild(crearElemento("p", "", TEXTOS[ruta] || "Pantalla lista para crecer por bloques."));
    contenedor.appendChild(tarjeta);
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
    montarPantallaBase(main, rutaActual);
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
