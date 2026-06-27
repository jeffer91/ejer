/*
  Nombre completo: diario.jarvis.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.jarvis.js

  Función o funciones:
    - Insertar el panel Jarvis dentro de Diario.
    - Activar y detener micrófono desde un botón visible.
    - Preparar reconocimiento de voz local del navegador/Electron.
    - Detectar frase inicial: "hey jarvis" o "jarvis".
    - Dejar lista la base para que el siguiente bloque conecte comandos inteligentes con contexto completo.

  Se conecta con:
    - src/features/entrenamiento/diario/diario.controller.js
    - src/features/entrenamiento/diario/diario.view.js
    - src/features/entrenamiento/diario/diario.css
*/

const JARVIS_NOMBRE = "Jarvis";
const FRASES_ACTIVACION = ["hey jarvis", "jarvis", "oye jarvis"];

let reconocimientoActivo = null;
let jarvisEscuchando = false;

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
  if (!puedeHablar()) return;

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
  const rutina = diario.rutinaDelDia?.rutina;
  const dia = diario.rutinaDelDia?.dia;
  const metricas = diario.metricas || {};

  return {
    rutina: rutina?.nombre || "sin rutina activa",
    dia: dia?.nombre || "sin día activo",
    ejercicios: metricas.ejercicios || 0,
    tiempoEstimadoMinutos: metricas.tiempoEstimadoMinutos || 0,
    porTiempo: metricas.porTiempo || 0,
    porRepeticiones: metricas.porRepeticiones || 0,
    mixtos: metricas.mixtos || 0,
    porDistancia: metricas.porDistancia || 0,
    sesion: diario.sesionHoy?.estado || "sin iniciar"
  };
}

function actualizarEstado(estadoNodo, textoEstado, activo = false) {
  if (!estadoNodo) return;
  estadoNodo.textContent = textoEstado;
  estadoNodo.className = activo ? "entreno-diario-jarvis-status entreno-diario-jarvis-status--on" : "entreno-diario-jarvis-status";
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

  for (let indice = evento.resultIndex; indice < evento.results.length; indice += 1) {
    textoFinal += evento.results[indice][0]?.transcript || "";
  }

  return texto(textoFinal).toLowerCase();
}

function contieneActivacionJarvis(frase = "") {
  const limpio = texto(frase).toLowerCase();
  return FRASES_ACTIVACION.some((activador) => limpio.includes(activador));
}

function detenerJarvis({ boton, estadoNodo, transcripcionNodo } = {}) {
  jarvisEscuchando = false;

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

async function activarJarvis({ diario, boton, estadoNodo, transcripcionNodo, contextoNodo } = {}) {
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

  recognition.lang = "es-ES";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    if (boton) boton.textContent = "Detener Jarvis";
    actualizarEstado(estadoNodo, "Jarvis escuchando. Di: hey Jarvis, iniciemos.", true);
    if (contextoNodo) contextoNodo.textContent = `Contexto listo: ${contexto.rutina} · ${contexto.dia} · ${contexto.ejercicios} ejercicio(s).`;
    hablarJarvis(`Jarvis activo. Tengo lista la rutina ${contexto.rutina}, ${contexto.dia}. Di hey Jarvis, iniciemos.`);
  };

  recognition.onresult = (evento) => {
    const frase = extraerTextoResultado(evento);
    if (!frase) return;

    if (transcripcionNodo) transcripcionNodo.textContent = frase;

    if (contieneActivacionJarvis(frase)) {
      actualizarEstado(estadoNodo, "Jarvis activado por voz. Listo para iniciar interacción.", true);
      hablarJarvis("Te escucho. En el siguiente bloque podré guiar y registrar la rutina con comandos inteligentes.");
    }
  };

  recognition.onerror = (evento) => {
    const mensaje = evento?.error === "not-allowed"
      ? "Permiso de micrófono bloqueado."
      : `Error de micrófono: ${evento?.error || "desconocido"}.`;
    actualizarEstado(estadoNodo, mensaje, false);
  };

  recognition.onend = () => {
    if (jarvisEscuchando) {
      try {
        recognition.start();
      } catch {
        actualizarEstado(estadoNodo, "Jarvis pausado. Presiona Activar Jarvis para reiniciar.", false);
        jarvisEscuchando = false;
        if (boton) boton.textContent = "Activar Jarvis";
      }
    }
  };

  try {
    recognition.start();
  } catch {
    actualizarEstado(estadoNodo, "No se pudo iniciar Jarvis. Intenta de nuevo.", false);
    jarvisEscuchando = false;
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
  const contexto = crearElemento("small", "entreno-diario-jarvis-context", "Al activar, FitJeff preparará el contexto actual del día.");
  const transcripcion = crearElemento("article", "entreno-diario-jarvis-log", "Transcripción: sin audio todavía.");

  boton.type = "button";
  boton.disabled = !diario.rutinaDelDia?.rutina || !diario.rutinaDelDia?.dia;
  boton.addEventListener("click", () => {
    if (jarvisEscuchando) {
      detenerJarvis({ boton, estadoNodo: estado, transcripcionNodo: transcripcion });
      return;
    }

    activarJarvis({ diario, boton, estadoNodo: estado, transcripcionNodo: transcripcion, contextoNodo: contexto });
  });

  textos.appendChild(crearElemento("h3", "", JARVIS_NOMBRE));
  textos.appendChild(crearElemento("p", "", "Activa el micrófono para preparar la interacción por voz del entrenamiento diario."));
  top.appendChild(textos);

  acciones.appendChild(boton);
  panel.appendChild(top);
  panel.appendChild(estado);
  panel.appendChild(contexto);
  panel.appendChild(transcripcion);
  panel.appendChild(acciones);

  panelPrincipal.after(panel);
}
