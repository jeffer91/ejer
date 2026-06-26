/*
  Nombre completo: shell.view.js
  Ruta o ubicación: src/shell/shell.view.js

  Función o funciones:
    - Construir visualmente el shell global de FitJeff.
    - Mostrar menú superior de módulos grandes.
    - Mostrar submenú interno del módulo activo.
    - Entregar el contenedor main donde se monta cada pantalla.

  Se conecta con:
    - src/shell/shell.controller.js
    - src/shell/shell.css
*/

import "./shell.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function crearModuloButton({ modulo, activo, onSeleccionarModulo }) {
  const boton = crearElemento("button", "fj-shell__module-button");
  boton.type = "button";
  boton.title = modulo.description || modulo.label;

  if (activo) {
    boton.classList.add("fj-shell__module-button--active");
  }

  const nombre = crearElemento("span", "fj-shell__module-name", modulo.label);
  const descripcion = crearElemento("span", "fj-shell__module-desc", modulo.description || "");

  boton.appendChild(nombre);
  boton.appendChild(descripcion);
  boton.addEventListener("click", () => onSeleccionarModulo(modulo.id));

  return boton;
}

function crearRutaButton({ ruta, activo, onSeleccionarRuta }) {
  const boton = crearElemento("button", "fj-shell__route-button", ruta.shortLabel || ruta.label);
  boton.type = "button";
  boton.title = ruta.description || ruta.label;

  if (activo) {
    boton.classList.add("fj-shell__route-button--active");
  }

  boton.addEventListener("click", () => onSeleccionarRuta(ruta.id));

  return boton;
}

export function montarShellView({ raiz, modulos, ubicacion, onSeleccionarModulo, onSeleccionarRuta }) {
  const shell = crearElemento("div", "fj-app-shell fj-shell");
  const topbar = crearElemento("header", "fj-shell__topbar");
  const brand = crearElemento("div", "fj-shell__brand");
  const logo = crearElemento("span", "fj-shell__logo", "FJ");
  const brandText = crearElemento("div", "fj-shell__brand-text");
  const appName = crearElemento("strong", "fj-shell__app-name", "FitJeff");
  const appMode = crearElemento("span", "fj-shell__app-mode", "App modular");
  const activeBox = crearElemento("div", "fj-shell__active");
  const activeLabel = crearElemento("span", "fj-shell__active-label", "Módulo activo");
  const activeModule = crearElemento("strong", "fj-shell__active-module", ubicacion.modulo.label);
  const routeDescription = crearElemento("span", "fj-shell__route-description", ubicacion.ruta.description || ubicacion.ruta.label);
  const modulesNav = crearElemento("nav", "fj-shell__modules");
  const routesNav = crearElemento("nav", "fj-shell__subnav");
  const main = crearElemento("main", "fj-main fj-shell__content");

  brandText.appendChild(appName);
  brandText.appendChild(appMode);
  brand.appendChild(logo);
  brand.appendChild(brandText);

  activeBox.appendChild(activeLabel);
  activeBox.appendChild(activeModule);
  activeBox.appendChild(routeDescription);

  topbar.appendChild(brand);
  topbar.appendChild(activeBox);

  modulos.forEach((modulo) => {
    modulesNav.appendChild(
      crearModuloButton({
        modulo,
        activo: modulo.id === ubicacion.moduloId,
        onSeleccionarModulo
      })
    );
  });

  ubicacion.modulo.routes.forEach((ruta) => {
    routesNav.appendChild(
      crearRutaButton({
        ruta,
        activo: ruta.id === ubicacion.rutaId,
        onSeleccionarRuta
      })
    );
  });

  shell.appendChild(topbar);
  shell.appendChild(modulesNav);
  shell.appendChild(routesNav);
  shell.appendChild(main);
  raiz.appendChild(shell);

  return main;
}
