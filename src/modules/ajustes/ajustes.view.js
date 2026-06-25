/*
  Nombre completo: ajustes.view.js
  Ruta o ubicación: src/modules/ajustes/ajustes.view.js

  Función o funciones:
    - Construir la pantalla visual de Ajustes.
    - Mostrar formularios simples para perfil y objetivo.
    - Crear botón para reabrir Inicio.
    - Mantener la vista sin lógica de guardado.

  Se conecta con:
    - src/modules/ajustes/ajustes.controller.js
    - src/modules/ajustes/ajustes.constants.js
    - src/modules/ajustes/ajustes.css
*/

import { AJUSTES_CAMPOS, AJUSTES_TEXTOS } from "./ajustes.constants.js";
import "./ajustes.css";

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  if (texto !== undefined && texto !== null) {
    elemento.textContent = texto;
  }

  return elemento;
}

function crearCampo({ id, label, tipo, placeholder, valor }) {
  const grupo = crearElemento("label", "ajustes-field");
  const texto = crearElemento("span", "ajustes-field__label", label);
  const input = crearElemento("input", "ajustes-field__input");
  const error = crearElemento("small", "ajustes-field__error");

  input.id = id;
  input.name = id;
  input.type = tipo || "text";
  input.placeholder = placeholder || "";
  input.autocomplete = "off";

  if (valor !== undefined && valor !== null) {
    input.value = valor;
  }

  grupo.appendChild(texto);
  grupo.appendChild(input);
  grupo.appendChild(error);

  return grupo;
}

function crearFormularioPerfil(datos) {
  const form = crearElemento("form", "ajustes-card ajustes-form");
  const mensaje = crearElemento("p", "ajustes-message");
  const boton = crearElemento("button", "ajustes-button", AJUSTES_TEXTOS.GUARDAR_PERFIL);

  form.dataset.form = "perfil";
  form.appendChild(crearElemento("h3", "ajustes-card__title", AJUSTES_TEXTOS.PERFIL));
  form.appendChild(crearCampo({
    id: AJUSTES_CAMPOS.ALTURA_CM,
    label: "Altura",
    placeholder: "Ejemplo: 1.75 o 175 cm",
    valor: datos.perfil?.alturaCm || ""
  }));
  form.appendChild(crearCampo({
    id: AJUSTES_CAMPOS.FECHA_NACIMIENTO,
    label: "Fecha de nacimiento",
    tipo: "date",
    valor: datos.perfil?.fechaNacimiento || ""
  }));

  boton.type = "submit";
  form.appendChild(mensaje);
  form.appendChild(boton);

  return { form, mensaje };
}

function crearFormularioObjetivo(datos) {
  const form = crearElemento("form", "ajustes-card ajustes-form");
  const mensaje = crearElemento("p", "ajustes-message");
  const boton = crearElemento("button", "ajustes-button", AJUSTES_TEXTOS.GUARDAR_OBJETIVO);

  form.dataset.form = "objetivo";
  form.appendChild(crearElemento("h3", "ajustes-card__title", AJUSTES_TEXTOS.OBJETIVO));
  form.appendChild(crearCampo({
    id: AJUSTES_CAMPOS.PESO_OBJETIVO_KG,
    label: "Peso objetivo",
    placeholder: "Ejemplo: 80 kg",
    valor: datos.objetivo?.pesoObjetivoKg || ""
  }));

  boton.type = "submit";
  form.appendChild(mensaje);
  form.appendChild(boton);

  return { form, mensaje };
}

function crearBloqueInicio() {
  const bloque = crearElemento("article", "ajustes-card ajustes-card--info");
  const boton = crearElemento("button", "ajustes-button ajustes-button--secondary", AJUSTES_TEXTOS.REABRIR_INICIO);

  boton.type = "button";
  boton.dataset.action = "reabrir-inicio";

  bloque.appendChild(crearElemento("h3", "ajustes-card__title", "Inicio"));
  bloque.appendChild(crearElemento("p", "ajustes-card__text", "Puedes reabrir la configuración inicial cuando quieras revisar los datos base."));
  bloque.appendChild(boton);

  return { bloque, boton };
}

export function crearAjustesView(datos) {
  const pantalla = crearElemento("section", "ajustes-screen");
  const header = crearElemento("div", "ajustes-header");
  const layout = crearElemento("div", "ajustes-layout");
  const perfil = crearFormularioPerfil(datos);
  const objetivo = crearFormularioObjetivo(datos);
  const inicio = crearBloqueInicio();

  header.appendChild(crearElemento("p", "ajustes-kicker", "Configuración"));
  header.appendChild(crearElemento("h2", "", AJUSTES_TEXTOS.TITULO));
  header.appendChild(crearElemento("p", "", AJUSTES_TEXTOS.SUBTITULO));

  layout.appendChild(perfil.form);
  layout.appendChild(objetivo.form);
  layout.appendChild(inicio.bloque);

  pantalla.appendChild(header);
  pantalla.appendChild(layout);

  return {
    pantalla,
    perfilForm: perfil.form,
    perfilMensaje: perfil.mensaje,
    objetivoForm: objetivo.form,
    objetivoMensaje: objetivo.mensaje,
    reabrirInicioBoton: inicio.boton
  };
}

export function leerFormularioAjustes(formulario) {
  const formData = new FormData(formulario);
  const datos = {};

  formData.forEach((valor, clave) => {
    datos[clave] = valor;
  });

  return datos;
}

export function mostrarErroresAjustes(formulario, errores) {
  formulario.querySelectorAll(".ajustes-field").forEach((campo) => {
    const input = campo.querySelector("input");
    const error = campo.querySelector(".ajustes-field__error");
    const mensaje = errores[input.name] || "";

    campo.classList.toggle("ajustes-field--error", Boolean(mensaje));
    error.textContent = mensaje;
  });
}

export function mostrarMensajeAjustes(elemento, mensaje, ok) {
  elemento.textContent = mensaje || "";
  elemento.className = ok ? "ajustes-message ajustes-message--ok" : "ajustes-message ajustes-message--error";
}
