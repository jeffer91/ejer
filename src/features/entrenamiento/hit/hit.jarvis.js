/*
  Nombre completo: hit.jarvis.js
  Ruta o ubicación: src/features/entrenamiento/hit/hit.jarvis.js

  Función o funciones:
    - Insertar panel Jarvis dentro de HIT.
    - Activar/detener micrófono con control de errores fatales para evitar bucles.
    - Enviar contexto completo de HIT al cerebro de Jarvis.
    - Permitir comando escrito como respaldo si el reconocimiento de voz falla.

  Se conecta con:
    - src/features/entrenamiento/hit/hit.controller.js
    - src/features/entrenamiento/hit/hit.view.js
    - src/features/entrenamiento/hit/hit.jarvis.brain.js
    - src/features/entrenamiento/hit/hit.css
*/

import { crearContextoJarvisHit, procesarComandoJarvisHit } from "./hit.jarvis.brain.js";

const FRASES_ACTIVACION = ["hey jarvis", "jarvis", "oye jarvis"];
const ERRORES_RECONOCIMIENTO_FATALES = ["network", "not-allowed", "service-not-allowed", "audio-capture", "language-not-supported"];

let reconocimientoActivo = null;
let jarvisEscuchando = false;
let jarvisInteractuando = false;
let ultimaFraseFinal = "";
let ultimoTiempoFrase = 0;

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function obtenerSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function puedeUsarMicrofono() {
  return Boolean(navigator.mediaDevices?.getUserMedia);
}

function puedeHablar() {
  return Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
}

function hablarJarvis(mensaje) {
  if (!puedeHablar() || !mensaje) return;

  try {
    window.speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(mensaje);
    voz.lang = "es-ES";
    voz.rate = 1;
    voz.pitch = 1;
    window.speechSynthesis.speak(voz);
  } catch {
    // Voz complementaria.
  }
}

function actualizarEstado(nodo, mensaje, activo = false) {
  if (!nodo) return;
  nodo.textContent = mensaje;
  nodo.className = activo ? "entreno-hit-jarvis-status entreno-hit-jarvis-status--on" : "entreno-hit-jarvis-status";
}

function actualizarContexto(nodo, contexto = {}) {
  if (!nodo) return;
  nodo.textContent = `Contexto HIT: ${contexto.timer?.tiempoTexto || "00:00"} · ${contexto.timer?.fase || "actividad"} · ronda ${contexto.timer?.rondaActual || 1}/${contexto.timer?.rondasTotales || 4} · tipo ${contexto.formularioCardio?.tipo || "intervalos"}.`;
}

function agregarLog(logNodo, mensaje) {
  if (!logNodo || !mensaje) return;

  if (logNodo.textContent === "Historial Jarvis HIT: sin comandos todavía.") {
    logNodo.textContent = "";
  }

  const linea = crearElemento("div", "entreno-hit-jarvis-log-line", mensaje);
  logNodo.prepend(linea);

  while (logNodo.children.length > 8) {
    logNodo.removeChild(logNodo.lastChild);
  }
}

function diagnostico() {
  return `micrófono: ${puedeUsarMicrofono() ? "sí" : "no"} · voz: ${puedeHablar() ? "sí" : "no"} · reconocimiento: ${obtenerSpeechRecognition() ? "sí" : "no"} · origen: ${window.location?.protocol || "desconocido"}`;
}

async function pedirPermisoMicrofono() {
  if (!puedeUsarMicrofono()) {
    return { ok: false, mensaje: "Este entorno no permite solicitar micrófono desde HIT." };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: `No se autorizó el micrófono. Detalle: ${error?.name || "sin detalle"}.` };
  }
}

function extraerTextoResultado(evento) {
  let textoFinal = "";
  let esFinal = false;

  for (let indice = evento.resultIndex; indice < evento.results.length; indice += 1) {
    textoFinal += evento.results[indice][0]?.transcript || "";
    if (evento.results[indice].isFinal) esFinal = true;
  }

  return { texto: texto(textoFinal).toLowerCase(), esFinal };
}

function contieneActivacion(frase = "") {
  const limpio = texto(frase).toLowerCase();
  return FRASES_ACTIVACION.some((activador) => limpio.includes(activador));
}

function esFraseRepetida(frase = "") {
  const ahora = Date.now();
  const limpia = texto(frase).toLowerCase();

  if (limpia === ultimaFraseFinal && ahora - ultimoTiempoFrase < 1500) return true;

  ultimaFraseFinal = limpia;
  ultimoTiempoFrase = ahora;
  return false;
}

function restaurarBoton(boton) {
  if (!boton) return;
  boton.textContent = "Activar Jarvis HIT";
  boton.disabled = false;
}

function detenerReconocimiento() {
  try {
    reconocimientoActivo?.abort?.();
  } catch {
    try {
      reconocimientoActivo?.stop?.();
    } catch {
      // Ignorar si ya está apagado.
    }
  }
  reconocimientoActivo = null;
}

function detenerJarvisHit({ boton, estadoNodo, transcripcionNodo } = {}) {
  jarvisEscuchando = false;
  jarvisInteractuando = false;
  detenerReconocimiento();
  restaurarBoton(boton);
  actualizarEstado(estadoNodo, "Jarvis HIT apagado.", false);
  if (transcripcionNodo) transcripcionNodo.textContent = "Micrófono detenido.";
}

function manejarErrorFatal({ error, boton, estadoNodo, transcripcionNodo, logNodo } = {}) {
  const detalle = error || "desconocido";
  const mensaje = detalle === "network"
    ? "Reconocimiento de voz no disponible por error de red. Detuve Jarvis HIT para evitar bucle; usa comando escrito."
    : `Jarvis HIT detenido por error de voz: ${detalle}. Usa comando escrito como respaldo.`;

  jarvisEscuchando = false;
  jarvisInteractuando = false;
  detenerReconocimiento();
  restaurarBoton(boton);
  actualizarEstado(estadoNodo, mensaje, false);
  if (transcripcionNodo) transcripcionNodo.textContent = `Jarvis HIT detenido: ${detalle}.`;
  agregarLog(logNodo, mensaje);
}

function responderJarvis({ mensaje, contexto, frase, estadoNodo, contextoNodo, logNodo } = {}) {
  actualizarEstado(estadoNodo, mensaje, true);
  actualizarContexto(contextoNodo, contexto);
  if (frase) agregarLog(logNodo, `Tú: ${frase}`);
  agregarLog(logNodo, `Jarvis HIT: ${mensaje}`);
  hablarJarvis(mensaje);
}

function procesarFrase({ frase, estado, timerEstado, pantalla, estadoNodo, contextoNodo, logNodo } = {}) {
  const respuesta = procesarComandoJarvisHit({
    frase,
    estado,
    timerEstado,
    pantalla,
    responder: (mensaje, contexto) => responderJarvis({ mensaje, contexto, frase, estadoNodo, contextoNodo, logNodo })
  });

  if (!respuesta) {
    actualizarEstado(estadoNodo, "Jarvis HIT escuchó, pero no ejecutó un comando nuevo.", true);
  }
}

async function activarJarvisHit({ estado, timerEstado, pantalla, boton, estadoNodo, transcripcionNodo, contextoNodo, logNodo } = {}) {
  const SpeechRecognition = obtenerSpeechRecognition();

  if (boton) {
    boton.disabled = true;
    boton.textContent = "Preparando Jarvis HIT...";
  }
  actualizarEstado(estadoNodo, "Preparando Jarvis HIT y solicitando micrófono...", true);
  if (transcripcionNodo) transcripcionNodo.textContent = `Diagnóstico: ${diagnostico()}`;
  agregarLog(logNodo, `Diagnóstico: ${diagnostico()}`);

  if (!SpeechRecognition) {
    restaurarBoton(boton);
    actualizarEstado(estadoNodo, "Este entorno no tiene reconocimiento de voz activo. Usa el comando escrito de Jarvis HIT.", false);
    return;
  }

  const permiso = await pedirPermisoMicrofono();
  if (!permiso.ok) {
    restaurarBoton(boton);
    actualizarEstado(estadoNodo, permiso.mensaje, false);
    agregarLog(logNodo, permiso.mensaje);
    return;
  }

  const recognition = new SpeechRecognition();
  reconocimientoActivo = recognition;
  jarvisEscuchando = true;
  jarvisInteractuando = false;

  recognition.lang = "es-ES";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    if (!jarvisEscuchando) return;
    if (boton) {
      boton.textContent = "Detener Jarvis HIT";
      boton.disabled = false;
    }
    const contexto = crearContextoJarvisHit({ estado, timerEstado, pantalla });
    actualizarEstado(estadoNodo, "Jarvis HIT escuchando. Di: hey Jarvis, iniciemos.", true);
    actualizarContexto(contextoNodo, contexto);
    agregarLog(logNodo, `Jarvis HIT activo · ${contexto.timer.tiempoTexto} · ${contexto.timer.fase} · ronda ${contexto.timer.rondaActual}/${contexto.timer.rondasTotales}.`);
    hablarJarvis("Jarvis HIT activo. Di hey Jarvis, iniciemos, o usa los comandos de intervalos.");
  };

  recognition.onresult = (evento) => {
    const resultado = extraerTextoResultado(evento);
    if (!resultado.texto) return;

    if (transcripcionNodo) transcripcionNodo.textContent = `Escuché: ${resultado.texto}`;
    if (!resultado.esFinal || esFraseRepetida(resultado.texto)) return;

    if (contieneActivacion(resultado.texto)) {
      jarvisInteractuando = true;
      actualizarEstado(estadoNodo, "Jarvis HIT interactuando. Puedes hablar sin repetir hey Jarvis.", true);
    }

    if (!jarvisInteractuando) return;
    procesarFrase({ frase: resultado.texto, estado, timerEstado, pantalla, estadoNodo, contextoNodo, logNodo });
  };

  recognition.onerror = (evento) => {
    const error = evento?.error || "desconocido";
    if (ERRORES_RECONOCIMIENTO_FATALES.includes(error)) {
      manejarErrorFatal({ error, boton, estadoNodo, transcripcionNodo, logNodo });
      return;
    }
    const mensaje = `Error de micrófono HIT: ${error}.`;
    actualizarEstado(estadoNodo, mensaje, false);
    agregarLog(logNodo, mensaje);
  };

  recognition.onend = () => {
    if (!jarvisEscuchando) return;
    try {
      recognition.start();
    } catch {
      jarvisEscuchando = false;
      jarvisInteractuando = false;
      restaurarBoton(boton);
      actualizarEstado(estadoNodo, "Jarvis HIT pausado. Presiona Activar Jarvis HIT para reiniciar.", false);
    }
  };

  try {
    recognition.start();
  } catch (error) {
    jarvisEscuchando = false;
    jarvisInteractuando = false;
    restaurarBoton(boton);
    actualizarEstado(estadoNodo, `No se pudo iniciar Jarvis HIT. Detalle: ${error?.name || "sin detalle"}.`, false);
  }
}

function crearComandoEscrito({ estado, timerEstado, pantalla, estadoNodo, contextoNodo, logNodo }) {
  const form = crearElemento("form", "entreno-hit-jarvis-manual");
  const input = document.createElement("input");
  const boton = crearElemento("button", "entreno-hit-button", "Enviar comando");

  input.type = "text";
  input.name = "jarvisHitComando";
  input.placeholder = "Escribe: hey Jarvis iniciemos, pausa, rondas 6, hice 20 minutos...";
  boton.type = "submit";

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const frase = texto(input.value);
    if (!frase) return;
    jarvisInteractuando = true;
    procesarFrase({ frase, estado, timerEstado, pantalla, estadoNodo, contextoNodo, logNodo });
    input.value = "";
  });

  form.appendChild(input);
  form.appendChild(boton);
  return form;
}

export function insertarPanelJarvisHit(pantalla, { estado = {}, timerEstado = {} } = {}) {
  if (!pantalla || pantalla.querySelector(".entreno-hit-jarvis")) return;

  const timer = pantalla.querySelector(".entreno-hit-timer");
  if (!timer) return;

  const panel = crearElemento("section", "entreno-hit-panel entreno-hit-jarvis");
  const top = crearElemento("div", "entreno-hit-jarvis__top");
  const textos = crearElemento("div", "");
  const boton = crearElemento("button", "entreno-hit-button entreno-hit-button--jarvis", "Activar Jarvis HIT");
  const estadoNodo = crearElemento("p", "entreno-hit-jarvis-status", "Jarvis HIT apagado.");
  const contextoNodo = crearElemento("small", "entreno-hit-jarvis-context", "Al activar, FitJeff enviará a Jarvis el contexto de HIT en cada comando.");
  const transcripcion = crearElemento("article", "entreno-hit-jarvis-log", "Transcripción: sin audio todavía.");
  const log = crearElemento("article", "entreno-hit-jarvis-log entreno-hit-jarvis-log--history", "Historial Jarvis HIT: sin comandos todavía.");
  const comandos = crearElemento("small", "entreno-hit-jarvis-context", "Comandos: hey Jarvis iniciemos · pausa · reinicia · rondas 6 · actividad 30 segundos · descanso 20 segundos · bicicleta · intensidad alta · guarda.");
  const manual = crearComandoEscrito({ estado, timerEstado, pantalla, estadoNodo, contextoNodo, logNodo: log });

  boton.type = "button";
  boton.addEventListener("click", () => {
    if (jarvisEscuchando) {
      detenerJarvisHit({ boton, estadoNodo, transcripcionNodo: transcripcion });
      return;
    }

    activarJarvisHit({ estado, timerEstado, pantalla, boton, estadoNodo, transcripcionNodo: transcripcion, contextoNodo, logNodo: log }).catch((error) => {
      restaurarBoton(boton);
      actualizarEstado(estadoNodo, `Jarvis HIT falló: ${error?.message || error?.name || "sin detalle"}.`, false);
      agregarLog(log, `Error Jarvis HIT: ${error?.stack || error?.message || error?.name || "sin detalle"}`);
    });
  });

  textos.appendChild(crearElemento("h3", "", "Jarvis HIT"));
  textos.appendChild(crearElemento("p", "", "Guía por voz o texto para intervalos, bicicleta, caminata y cardio."));
  top.appendChild(textos);
  top.appendChild(boton);

  panel.appendChild(top);
  panel.appendChild(estadoNodo);
  panel.appendChild(contextoNodo);
  panel.appendChild(transcripcion);
  panel.appendChild(log);
  panel.appendChild(manual);
  panel.appendChild(comandos);

  timer.after(panel);
}
