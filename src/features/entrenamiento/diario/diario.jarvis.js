/*
  Nombre completo: diario.jarvis.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.jarvis.js

  Función o funciones:
    - Insertar el panel Jarvis dentro de Diario.
    - Activar y detener micrófono desde un botón visible.
    - Mantener reconocimiento de voz local del navegador/Electron.
    - Enviar contexto completo al cerebro de Jarvis en cada comando.
    - Ejecutar comandos inteligentes: iniciar, siguiente, registrar reps, tiempo, distancia, fallo, guardar y completar.

  Se conecta con:
    - src/features/entrenamiento/diario/diario.controller.js
    - src/features/entrenamiento/diario/diario.view.js
    - src/features/entrenamiento/diario/diario.jarvis.brain.js
    - src/features/entrenamiento/diario/diario.css
*/

import { crearContextoJarvisCompleto, procesarComandoJarvis } from "./diario.jarvis.brain.js";

const JARVIS_NOMBRE = "Jarvis";
const FRASES_ACTIVACION = ["hey jarvis", "jarvis", "oye jarvis"];

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
    // La voz es complementaria. Si falla, el panel sigue funcionando.
  }
}

function crearContextoResumen(diario = {}) {
  const contexto = crearContextoJarvisCompleto({ diario });

  return {
    rutina: contexto.rutina?.nombre || "sin rutina activa",
    dia: contexto.dia?.nombre || "sin día activo",
    ejercicios: contexto.dia?.totalEjercicios || 0,
    tiempoEstimadoMinutos: contexto.metricas?.tiempoEstimadoMinutos || 0,
    porTiempo: contexto.metricas?.porTiempo || 0,
    porRepeticiones: contexto.metricas?.porRepeticiones || 0,
    mixtos: contexto.metricas?.mixtos || 0,
    porDistancia: contexto.metricas?.porDistancia || 0,
    sesion: contexto.sesion?.estado || "sin iniciar"
  };
}

function actualizarEstado(estadoNodo, textoEstado, activo = false) {
  if (!estadoNodo) return;
  estadoNodo.textContent = textoEstado;
  estadoNodo.className = activo ? "entreno-diario-jarvis-status entreno-diario-jarvis-status--on" : "entreno-diario-jarvis-status";
}

function actualizarContexto(contextoNodo, contexto = {}) {
  if (!contextoNodo) return;

  contextoNodo.textContent = `Contexto completo: ${contexto.rutina?.nombre || "sin rutina"} · ${contexto.dia?.nombre || "sin día"} · ejercicio actual: ${contexto.ejercicioActual?.nombre || "pendiente"} · sesión: ${contexto.sesion?.estado || "sin iniciar"}.`;
}

function agregarLog(logNodo, textoLog) {
  if (!logNodo || !textoLog) return;

  const linea = crearElemento("div", "entreno-diario-jarvis-log-line", textoLog);
  logNodo.prepend(linea);

  while (logNodo.children.length > 8) {
    logNodo.removeChild(logNodo.lastChild);
  }
}

async function pedirPermisoMicrofono() {
  if (!puedeUsarMicrofono()) {
    return {
      ok: false,
      mensaje: "Este entorno no permite solicitar micrófono desde la app."
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { ok: true, mensaje: "Micrófono autorizado." };
  } catch {
    return {
      ok: false,
      mensaje: "No se autorizó el micrófono. Revisa permisos del navegador o de Electron."
    };
  }
}

function extraerTextoResultado(evento) {
  let textoFinal = "";
  let esFinal = false;

  for (let indice = evento.resultIndex; indice < evento.results.length; indice += 1) {
    textoFinal += evento.results[indice][0]?.transcript || "";
    if (evento.results[indice].isFinal) esFinal = true;
  }

  return {
    texto: texto(textoFinal).toLowerCase(),
    esFinal
  };
}

function contieneActivacionJarvis(frase = "") {
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

function detenerJarvis({ boton, estadoNodo, transcripcionNodo } = {}) {
  jarvisEscuchando = false;
  jarvisInteractuando = false;

  try {
    reconocimientoActivo?.stop?.();
  } catch {
    // Si ya estaba detenido, no hacemos nada.
  }

  reconocimientoActivo = null;
  if (boton) boton.textContent = "Activar Jarvis";
  actualizarEstado(estadoNodo, "Jarvis apagado.", false);
  if (transcripcionNodo) transcripcionNodo.textContent = "Micrófono detenido.";
}

async function activarJarvis({ diario, pantalla, boton, estadoNodo, transcripcionNodo, contextoNodo, logNodo } = {}) {
  const SpeechRecognition = obtenerSpeechRecognition();

  if (!SpeechRecognition) {
    actualizarEstado(estadoNodo, "Reconocimiento de voz no disponible en este entorno.", false);
    if (transcripcionNodo) transcripcionNodo.textContent = "Prueba en Chrome/Electron con permisos de micrófono habilitados.";
    return;
  }

  const permiso = await pedirPermisoMicrofono();
  if (!permiso.ok) {
    actualizarEstado(estadoNodo, permiso.mensaje, false);
    return;
  }

  const contexto = crearContextoResumen(diario);
  const recognition = new SpeechRecognition();
  reconocimientoActivo = recognition;
  jarvisEscuchando = true;
  jarvisInteractuando = false;

  recognition.lang = "es-ES";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    if (boton) boton.textContent = "Detener Jarvis";
    actualizarEstado(estadoNodo, "Jarvis escuchando. Di: hey Jarvis, iniciemos.", true);
    actualizarContexto(contextoNodo, crearContextoJarvisCompleto({ diario, pantalla }));
    agregarLog(logNodo, `Jarvis activo · ${contexto.rutina} · ${contexto.dia} · ${contexto.ejercicios} ejercicio(s).`);
    hablarJarvis(`Jarvis activo. Tengo lista la rutina ${contexto.rutina}, ${contexto.dia}. Di hey Jarvis, iniciemos.`);
  };

  recognition.onresult = (evento) => {
    const resultado = extraerTextoResultado(evento);
    if (!resultado.texto) return;

    if (transcripcionNodo) transcripcionNodo.textContent = `Escuché: ${resultado.texto}`;
    if (!resultado.esFinal || esFraseRepetida(resultado.texto)) return;

    if (contieneActivacionJarvis(resultado.texto)) {
      jarvisInteractuando = true;
      actualizarEstado(estadoNodo, "Jarvis interactuando. Puedes hablar sin repetir hey Jarvis.", true);
    }

    if (!jarvisInteractuando) return;

    procesarComandoJarvis({
      frase: resultado.texto,
      diario,
      pantalla,
      responder: (mensaje, contextoCompleto) => {
        actualizarEstado(estadoNodo, mensaje, true);
        actualizarContexto(contextoNodo, contextoCompleto);
        agregarLog(logNodo, `Tú: ${resultado.texto}`);
        agregarLog(logNodo, `Jarvis: ${mensaje}`);
        hablarJarvis(mensaje);
      }
    });
  };

  recognition.onerror = (evento) => {
    const mensaje = evento?.error === "not-allowed"
      ? "Permiso de micrófono bloqueado."
      : `Error de micrófono: ${evento?.error || "desconocido"}.`;
    actualizarEstado(estadoNodo, mensaje, false);
    agregarLog(logNodo, mensaje);
  };

  recognition.onend = () => {
    if (jarvisEscuchando) {
      try {
        recognition.start();
      } catch {
        actualizarEstado(estadoNodo, "Jarvis pausado. Presiona Activar Jarvis para reiniciar.", false);
        jarvisEscuchando = false;
        jarvisInteractuando = false;
        if (boton) boton.textContent = "Activar Jarvis";
      }
    }
  };

  try {
    recognition.start();
  } catch {
    actualizarEstado(estadoNodo, "No se pudo iniciar Jarvis. Intenta de nuevo.", false);
    jarvisEscuchando = false;
    jarvisInteractuando = false;
  }
}

export function insertarPanelJarvisDiario(pantalla, { diario = {} } = {}) {
  if (!pantalla || pantalla.querySelector(".entreno-diario-jarvis")) return;

  const panelPrincipal = pantalla.querySelector(".entreno-diario-panel");
  if (!panelPrincipal) return;

  const panel = crearElemento("section", "entreno-diario-panel entreno-diario-jarvis");
  const top = crearElemento("div", "entreno-diario-jarvis__top");
  const textos = crearElemento("div", "");
  const acciones = crearElemento("div", "entreno-diario-actions entreno-diario-actions--jarvis");
  const boton = crearElemento("button", "entreno-diario-button entreno-diario-button--jarvis", "Activar Jarvis");
  const estado = crearElemento("p", "entreno-diario-jarvis-status", "Jarvis apagado.");
  const contexto = crearElemento("small", "entreno-diario-jarvis-context", "Al activar, FitJeff enviará a Jarvis el contexto completo del día en cada comando.");
  const transcripcion = crearElemento("article", "entreno-diario-jarvis-log", "Transcripción: sin audio todavía.");
  const log = crearElemento("article", "entreno-diario-jarvis-log entreno-diario-jarvis-log--history", "Historial Jarvis: sin comandos todavía.");

  boton.type = "button";
  boton.disabled = !diario.rutinaDelDia?.rutina || !diario.rutinaDelDia?.dia;
  boton.addEventListener("click", () => {
    if (jarvisEscuchando) {
      detenerJarvis({ boton, estadoNodo: estado, transcripcionNodo: transcripcion });
      return;
    }

    activarJarvis({ diario, pantalla, boton, estadoNodo: estado, transcripcionNodo: transcripcion, contextoNodo: contexto, logNodo: log });
  });

  textos.appendChild(crearElemento("h3", "", JARVIS_NOMBRE));
  textos.appendChild(crearElemento("p", "", "Activa el micrófono para que Jarvis te guíe y registre comandos durante el entrenamiento diario."));
  top.appendChild(textos);

  acciones.appendChild(boton);
  panel.appendChild(top);
  panel.appendChild(estado);
  panel.appendChild(contexto);
  panel.appendChild(transcripcion);
  panel.appendChild(log);
  panel.appendChild(crearElemento("small", "entreno-diario-jarvis-context", "Comandos: hey Jarvis iniciemos · siguiente · hice 12 repeticiones · hice 10 minutos · al fallo · guarda · completa sesión."));
  panel.appendChild(acciones);

  panelPrincipal.after(panel);
}
