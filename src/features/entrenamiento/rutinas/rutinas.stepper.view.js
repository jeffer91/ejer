import { RUTINAS_STEPS } from "./rutinas.steps.js";
import "./rutinas.stepper.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function normalizarSteps(steps = []) {
  return RUTINAS_STEPS.map((base) => {
    const encontrado = steps.find((step) => step.id === base.id) || {};
    return {
      ...base,
      ...encontrado,
      contenido: encontrado.contenido || crearElemento("div", "")
    };
  });
}

export function crearRutinasStepper({ steps = [], initialStepId = "ia" } = {}) {
  const pasos = normalizarSteps(steps);
  const actualInicial = Math.max(0, pasos.findIndex((step) => step.id === initialStepId));
  let indiceActual = actualInicial >= 0 ? actualInicial : 0;

  const wrapper = crearElemento("section", "rutinas-stepper");
  const nav = crearElemento("div", "rutinas-stepper__nav");
  const panels = crearElemento("div", "rutinas-stepper__panels");
  const footer = crearElemento("footer", "rutinas-stepper__footer");
  const anterior = crearElemento("button", "rutinas-stepper__button rutinas-stepper__button--secondary", "Anterior");
  const siguiente = crearElemento("button", "rutinas-stepper__button", "Siguiente");
  const indicador = crearElemento("span", "rutinas-stepper__indicator", "");
  const botones = [];
  const paneles = [];

  anterior.type = "button";
  siguiente.type = "button";

  pasos.forEach((step, indice) => {
    const boton = crearElemento("button", "rutinas-stepper__tab");
    const numero = crearElemento("span", "rutinas-stepper__number", step.numero);
    const textos = crearElemento("span", "rutinas-stepper__text");
    const titulo = crearElemento("strong", "", step.titulo);
    const descripcion = crearElemento("small", "", step.descripcion);
    const panel = crearElemento("section", "rutinas-stepper__panel");

    boton.type = "button";
    boton.dataset.stepId = step.id;
    boton.setAttribute("aria-controls", `rutinas-step-${step.id}`);
    boton.addEventListener("click", () => irA(indice));

    textos.appendChild(titulo);
    textos.appendChild(descripcion);
    boton.appendChild(numero);
    boton.appendChild(textos);
    nav.appendChild(boton);

    panel.id = `rutinas-step-${step.id}`;
    panel.dataset.stepId = step.id;
    panel.appendChild(step.contenido);
    panels.appendChild(panel);

    botones.push(boton);
    paneles.push(panel);
  });

  function irA(indice) {
    indiceActual = Math.max(0, Math.min(indice, pasos.length - 1));

    botones.forEach((boton, botonIndice) => {
      const activo = botonIndice === indiceActual;
      boton.classList.toggle("rutinas-stepper__tab--active", activo);
      boton.setAttribute("aria-selected", String(activo));
    });

    paneles.forEach((panel, panelIndice) => {
      panel.hidden = panelIndice !== indiceActual;
    });

    indicador.textContent = `Paso ${indiceActual + 1} de ${pasos.length}`;
    anterior.disabled = indiceActual === 0;
    siguiente.disabled = indiceActual === pasos.length - 1;
  }

  anterior.addEventListener("click", () => irA(indiceActual - 1));
  siguiente.addEventListener("click", () => irA(indiceActual + 1));

  footer.appendChild(anterior);
  footer.appendChild(indicador);
  footer.appendChild(siguiente);
  wrapper.appendChild(nav);
  wrapper.appendChild(panels);
  wrapper.appendChild(footer);

  irA(indiceActual);

  return {
    elemento: wrapper,
    irA
  };
}
