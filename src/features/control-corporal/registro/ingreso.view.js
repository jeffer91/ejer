/*
  Nombre completo: ingreso.view.js
  Ruta o ubicacion: src/features/control-corporal/registro/ingreso.view.js

  Funcion o funciones:
    - Construir la pantalla de Registro / Ingreso.
    - Mostrar peso diario y medidas corporales en una vista compacta.
    - Abrir popup visual de ayuda con muñeco y texto claro desde cada botón ?.
    - Mantener la vista separada de guardado y validaciones.

  Se conecta con:
    - src/features/control-corporal/registro/registro.controller.js
    - src/features/control-corporal/registro/ingreso.constants.js
    - src/features/control-corporal/registro/ayudas-medidas.constants.js
    - src/features/control-corporal/registro/mapa-corporal.view.js
    - src/features/control-corporal/registro/medidas-modal/medidas-modal.view.js
    - src/features/control-corporal/registro/ingreso.css
*/

import { INGRESO_CAMPOS_MEDIDAS, INGRESO_CAMPOS_PESO, INGRESO_LABELS, INGRESO_TEXTOS } from "./ingreso.constants.js";
import { obtenerAyudaMedida } from "./ayudas-medidas.constants.js";
import { crearMapaCorporal } from "./mapa-corporal.view.js";
import { crearMedidasModal } from "./medidas-modal/medidas-modal.view.js";
import { fechaHoy } from "./ingreso.parser.js";
import "./ingreso.css";

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  if (texto !== undefined && texto !== null && texto !== "") {
    elemento.textContent = texto;
  }

  return elemento;
}

function crearAyudaCampo(id) {
  const ayuda = obtenerAyudaMedida(id);
  const contenedor = crearElemento("div", "ingreso-field__help");

  if (!ayuda) {
    contenedor.hidden = true;
    return contenedor;
  }

  contenedor.appendChild(crearElemento("strong", "", ayuda.titulo));
  contenedor.appendChild(crearElemento("span", "", ayuda.texto));

  return contenedor;
}

function crearBotonAyuda(id, abrirAyuda) {
  const boton = crearElemento("button", "ingreso-help-button", "?");
  boton.type = "button";
  boton.setAttribute("aria-label", `Abrir guía visual de ${INGRESO_LABELS[id] || id}`);

  boton.addEventListener("click", () => {
    if (typeof abrirAyuda === "function") {
      abrirAyuda(id);
    }
  });

  return boton;
}

function crearCampo({ id, label, placeholder, tipo, valor, inputMode, abrirAyuda }) {
  const grupo = crearElemento("div", "ingreso-field");
  const encabezado = crearElemento("div", "ingreso-field__head");
  const texto = crearElemento("label", "ingreso-field__label", label);
  const ayuda = crearAyudaCampo(id);
  const botonAyuda = crearBotonAyuda(id, abrirAyuda);
  const input = crearElemento("input", "ingreso-field__input");
  const error = crearElemento("small", "ingreso-field__error");

  texto.htmlFor = id;
  input.name = id;
  input.id = id;
  input.type = tipo || "text";
  input.placeholder = placeholder || "";
  input.autocomplete = "off";

  if (inputMode) {
    input.inputMode = inputMode;
  }

  if (valor) {
    input.value = valor;
  }

  encabezado.appendChild(texto);
  encabezado.appendChild(botonAyuda);
  grupo.appendChild(encabezado);
  grupo.appendChild(input);
  grupo.appendChild(ayuda);
  grupo.appendChild(error);

  return grupo;
}

function crearFormularioPeso({ abrirAyuda }) {
  const form = crearElemento("form", "ingreso-card ingreso-form");
  const mensaje = crearElemento("p", "ingreso-message");
  const boton = crearElemento("button", "ingreso-button", INGRESO_TEXTOS.BOTON_PESO);

  form.dataset.form = "peso";
  form.appendChild(crearElemento("h3", "ingreso-card__title", INGRESO_TEXTOS.PESO_TITULO));
  form.appendChild(crearCampo({
    id: INGRESO_CAMPOS_PESO.PESO_KG,
    label: INGRESO_LABELS.pesoKg,
    placeholder: "Ejemplo: 86.3 kg",
    inputMode: "decimal",
    abrirAyuda
  }));

  boton.type = "submit";
  form.appendChild(mensaje);
  form.appendChild(boton);

  return { form, mensaje };
}

function crearFormularioMedidas({ abrirAyuda }) {
  const form = crearElemento("form", "ingreso-card ingreso-form ingreso-card--wide");
  const grid = crearElemento("div", "ingreso-grid");
  const mensaje = crearElemento("p", "ingreso-message");
  const boton = crearElemento("button", "ingreso-button", INGRESO_TEXTOS.BOTON_MEDIDAS);

  form.dataset.form = "medidas";
  form.appendChild(crearElemento("h3", "ingreso-card__title", INGRESO_TEXTOS.MEDIDAS_TITULO));
  form.appendChild(crearMapaCorporal());

  grid.appendChild(crearCampo({
    id: INGRESO_CAMPOS_MEDIDAS.FECHA,
    label: INGRESO_LABELS.fecha,
    tipo: "date",
    valor: fechaHoy(),
    abrirAyuda
  }));

  Object.values(INGRESO_CAMPOS_MEDIDAS)
    .filter((campo) => campo !== "fecha")
    .forEach((campo) => {
      grid.appendChild(crearCampo({
        id: campo,
        label: INGRESO_LABELS[campo],
        placeholder: "cm",
        inputMode: "decimal",
        abrirAyuda
      }));
    });

  boton.type = "submit";
  form.appendChild(grid);
  form.appendChild(mensaje);
  form.appendChild(boton);

  return { form, mensaje };
}

export function crearIngresoView() {
  const pantalla = crearElemento("section", "ingreso-screen");
  const header = crearElemento("div", "ingreso-header");
  const contenedor = crearElemento("div", "ingreso-layout");
  const modal = crearMedidasModal();
  const abrirAyuda = (campo) => modal.abrir(campo);
  const peso = crearFormularioPeso({ abrirAyuda });
  const medidas = crearFormularioMedidas({ abrirAyuda });

  header.appendChild(crearElemento("p", "ingreso-kicker", "Registro corporal"));
  header.appendChild(crearElemento("h2", "", INGRESO_TEXTOS.TITULO));
  header.appendChild(crearElemento("p", "", INGRESO_TEXTOS.SUBTITULO));

  contenedor.appendChild(peso.form);
  contenedor.appendChild(medidas.form);
  pantalla.appendChild(header);
  pantalla.appendChild(contenedor);
  pantalla.appendChild(modal.elemento);

  return {
    pantalla,
    pesoForm: peso.form,
    pesoMensaje: peso.mensaje,
    medidasForm: medidas.form,
    medidasMensaje: medidas.mensaje
  };
}

export function leerFormulario(formulario) {
  const formData = new FormData(formulario);
  const datos = {};

  formData.forEach((valor, clave) => {
    datos[clave] = valor;
  });

  return datos;
}

export function mostrarErroresIngreso(formulario, errores) {
  formulario.querySelectorAll(".ingreso-field").forEach((campo) => {
    const input = campo.querySelector("input");
    const error = campo.querySelector(".ingreso-field__error");
    const mensaje = errores[input.name] || "";

    campo.classList.toggle("ingreso-field--error", Boolean(mensaje));
    error.textContent = mensaje;
  });
}

export function mostrarMensajeIngreso(elemento, mensaje, ok) {
  elemento.textContent = mensaje || "";
  elemento.className = ok ? "ingreso-message ingreso-message--ok" : "ingreso-message ingreso-message--error";
}
