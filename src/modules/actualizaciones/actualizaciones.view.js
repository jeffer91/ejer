/*
  Nombre completo: actualizaciones.view.js
  Ruta o ubicación: src/modules/actualizaciones/actualizaciones.view.js

  Función o funciones:
    - Construir la pantalla de actualizaciones de FitJeff.
    - Mostrar versión actual, versión disponible, estado y barra de progreso.
    - Exponer botones para buscar, descargar y reiniciar.
    - Evitar HTML suelto para mantener una vista controlada y modular.

  Se conecta con:
    - src/modules/actualizaciones/actualizaciones.controller.js
    - src/modules/actualizaciones/actualizaciones.constants.js
    - src/modules/actualizaciones/actualizaciones.css
*/

import { ACTUALIZACIONES_TEXTOS } from "./actualizaciones.constants.js";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function formatearPorcentaje(valor) {
  const numero = Math.max(0, Math.min(100, Number(valor || 0)));
  return `${numero.toFixed(0)}%`;
}

function formatearBytes(bytes) {
  const valor = Number(bytes || 0);

  if (valor <= 0) {
    return "0 MB";
  }

  return `${(valor / 1024 / 1024).toFixed(2)} MB`;
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin registro";
  }

  try {
    return new Date(fecha).toLocaleString();
  } catch {
    return fecha;
  }
}

function crearFilaDato(etiqueta, valorInicial) {
  const fila = crearElemento("div", "fj-update-data__row");
  const label = crearElemento("span", "fj-update-data__label", etiqueta);
  const value = crearElemento("strong", "fj-update-data__value", valorInicial);

  fila.appendChild(label);
  fila.appendChild(value);

  return { fila, value };
}

export function crearActualizacionesView({ alBuscar, alDescargar, alReiniciar } = {}) {
  const refs = {};

  function crearBoton(texto, clase, onClick) {
    const boton = crearElemento("button", clase, texto);
    boton.type = "button";
    boton.addEventListener("click", () => {
      if (typeof onClick === "function") {
        onClick();
      }
    });
    return boton;
  }

  function montar(contenedor) {
    contenedor.innerHTML = "";

    const card = crearElemento("section", "fj-card fj-update-card");
    const encabezado = crearElemento("div", "fj-update-header");
    const titulo = crearElemento("h2", "fj-update-title", ACTUALIZACIONES_TEXTOS.TITULO);
    const subtitulo = crearElemento("p", "fj-update-subtitle", ACTUALIZACIONES_TEXTOS.SUBTITULO);
    const estado = crearElemento("p", "fj-update-message", ACTUALIZACIONES_TEXTOS.LISTO);

    encabezado.appendChild(titulo);
    encabezado.appendChild(subtitulo);

    const datos = crearElemento("div", "fj-update-data");
    const versionActual = crearFilaDato(ACTUALIZACIONES_TEXTOS.VERSION_ACTUAL, ACTUALIZACIONES_TEXTOS.SIN_VERSION);
    const versionDisponible = crearFilaDato(ACTUALIZACIONES_TEXTOS.VERSION_DISPONIBLE, ACTUALIZACIONES_TEXTOS.SIN_VERSION);
    const progresoTexto = crearFilaDato(ACTUALIZACIONES_TEXTOS.PROGRESO, "0%");
    const descargaTexto = crearFilaDato("Descargado", "0 MB / 0 MB");
    const ultimaRevision = crearFilaDato("Última revisión", "Sin registro");

    datos.appendChild(versionActual.fila);
    datos.appendChild(versionDisponible.fila);
    datos.appendChild(progresoTexto.fila);
    datos.appendChild(descargaTexto.fila);
    datos.appendChild(ultimaRevision.fila);

    const progressWrap = crearElemento("div", "fj-update-progress");
    const progressBar = crearElemento("div", "fj-update-progress__bar");
    progressWrap.appendChild(progressBar);

    const acciones = crearElemento("div", "fj-update-actions");
    const botonBuscar = crearBoton(ACTUALIZACIONES_TEXTOS.BUSCAR, "fj-update-button", alBuscar);
    const botonDescargar = crearBoton(ACTUALIZACIONES_TEXTOS.DESCARGAR, "fj-update-button fj-update-button--secondary", alDescargar);
    const botonReiniciar = crearBoton(ACTUALIZACIONES_TEXTOS.REINICIAR, "fj-update-button fj-update-button--success", alReiniciar);

    acciones.appendChild(botonBuscar);
    acciones.appendChild(botonDescargar);
    acciones.appendChild(botonReiniciar);

    const ayuda = crearElemento(
      "p",
      "fj-update-help",
      "En desarrollo verás el actualizador desactivado. En la app instalada buscará versiones publicadas en GitHub Releases."
    );

    card.appendChild(encabezado);
    card.appendChild(estado);
    card.appendChild(datos);
    card.appendChild(progressWrap);
    card.appendChild(acciones);
    card.appendChild(ayuda);
    contenedor.appendChild(card);

    refs.estado = estado;
    refs.versionActual = versionActual.value;
    refs.versionDisponible = versionDisponible.value;
    refs.progresoTexto = progresoTexto.value;
    refs.descargaTexto = descargaTexto.value;
    refs.ultimaRevision = ultimaRevision.value;
    refs.progressBar = progressBar;
    refs.botonBuscar = botonBuscar;
    refs.botonDescargar = botonDescargar;
    refs.botonReiniciar = botonReiniciar;
  }

  function renderizarEstado(estado = {}) {
    const porcentaje = formatearPorcentaje(estado.porcentaje);

    if (refs.estado) refs.estado.textContent = estado.mensaje || ACTUALIZACIONES_TEXTOS.LISTO;
    if (refs.versionActual) refs.versionActual.textContent = estado.versionActual || ACTUALIZACIONES_TEXTOS.SIN_VERSION;
    if (refs.versionDisponible) refs.versionDisponible.textContent = estado.versionDisponible || ACTUALIZACIONES_TEXTOS.SIN_VERSION;
    if (refs.progresoTexto) refs.progresoTexto.textContent = porcentaje;
    if (refs.descargaTexto) refs.descargaTexto.textContent = `${formatearBytes(estado.bytesDescargados)} / ${formatearBytes(estado.bytesTotales)}`;
    if (refs.ultimaRevision) refs.ultimaRevision.textContent = formatearFecha(estado.actualizadoEn);
    if (refs.progressBar) refs.progressBar.style.width = porcentaje;

    if (refs.botonBuscar) refs.botonBuscar.disabled = !estado.puedeBuscar;
    if (refs.botonDescargar) refs.botonDescargar.disabled = !estado.puedeDescargar;
    if (refs.botonReiniciar) refs.botonReiniciar.disabled = !estado.puedeReiniciar;
  }

  function marcarOcupado(ocupado = true) {
    [refs.botonBuscar, refs.botonDescargar, refs.botonReiniciar].forEach((boton) => {
      if (boton) boton.disabled = ocupado;
    });
  }

  return {
    montar,
    renderizarEstado,
    marcarOcupado
  };
}
