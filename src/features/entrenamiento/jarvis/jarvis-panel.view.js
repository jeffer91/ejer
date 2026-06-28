import "./jarvis-panel.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearComandoManual({ claseForm, claseBoton, inputName, placeholder, botonTexto, onSubmit }) {
  const form = crearElemento("form", claseForm);
  const input = document.createElement("input");
  const boton = crearElemento("button", claseBoton, botonTexto || "Enviar comando");

  input.type = "text";
  input.name = inputName || "jarvisComando";
  input.placeholder = placeholder || "Escribe un comando para Jarvis.";
  boton.type = "submit";

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const frase = typeof input.value === "string" ? input.value.trim() : "";
    if (!frase) return;
    onSubmit?.(frase);
    input.value = "";
  });

  form.appendChild(input);
  form.appendChild(boton);
  return form;
}

export function crearJarvisPanel({
  panelClass,
  topClass,
  buttonClass,
  statusClass,
  contextClass,
  logClass,
  manualClass,
  title,
  description,
  buttonText,
  buttonDisabled = false,
  estadoInicial,
  contextoInicial,
  transcripcionInicial,
  historialInicial,
  comandos,
  manualInputName,
  manualPlaceholder,
  manualButtonText,
  onToggle,
  onManualSubmit
} = {}) {
  const panel = crearElemento("section", panelClass || "entreno-jarvis-panel");
  const top = crearElemento("div", topClass || "entreno-jarvis-panel__top");
  const textos = crearElemento("div", "");
  const boton = crearElemento("button", buttonClass || "entreno-jarvis-panel__button", buttonText || "Activar Jarvis");
  const estado = crearElemento("p", statusClass || "entreno-jarvis-panel__status", estadoInicial || "Jarvis apagado.");
  const contexto = crearElemento("small", contextClass || "entreno-jarvis-panel__context", contextoInicial || "Jarvis usará el contexto actual en cada comando.");
  const transcripcion = crearElemento("article", logClass || "entreno-jarvis-panel__log", transcripcionInicial || "Transcripción: sin audio todavía.");
  const log = crearElemento("article", `${logClass || "entreno-jarvis-panel__log"} entreno-jarvis-panel__log--history`, historialInicial || "Historial Jarvis: sin comandos todavía.");
  const comandosNodo = crearElemento("small", `${contextClass || "entreno-jarvis-panel__context"} entreno-jarvis-panel__commands`, comandos || "Comandos: hey Jarvis iniciemos · siguiente · guardar.");
  const manual = crearComandoManual({
    claseForm: manualClass || "entreno-jarvis-panel__manual",
    claseBoton: buttonClass || "entreno-jarvis-panel__button",
    inputName: manualInputName,
    placeholder: manualPlaceholder,
    botonTexto: manualButtonText,
    onSubmit: onManualSubmit
  });

  boton.type = "button";
  boton.disabled = Boolean(buttonDisabled);
  boton.addEventListener("click", () => onToggle?.());

  textos.appendChild(crearElemento("h3", "", title || "Jarvis"));
  textos.appendChild(crearElemento("p", "", description || "Guía por voz o texto para tu entrenamiento."));
  top.appendChild(textos);
  top.appendChild(boton);

  panel.appendChild(top);
  panel.appendChild(estado);
  panel.appendChild(contexto);
  panel.appendChild(transcripcion);
  panel.appendChild(log);
  panel.appendChild(manual);
  panel.appendChild(comandosNodo);

  return {
    panel,
    boton,
    estado,
    contexto,
    transcripcion,
    log,
    manual,
    comandos: comandosNodo
  };
}
