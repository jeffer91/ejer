/*
  Nombre completo: diario.jarvis.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.jarvis.js

  Función o funciones:
    - Insertar el panel Jarvis dentro de Diario.
    - Activar y detener micrófono desde un botón visible.
    - Mantener reconocimiento de voz local del navegador/Electron.
    - Mostrar diagnóstico visible cuando el botón se presiona.
    - Enviar contexto completo al cerebro de Jarvis en cada comando.
    - Ejecutar comandos inteligentes: iniciar, siguiente, registrar reps, tiempo, distancia, fallo, guardar y completar.
    - Permitir comando escrito como respaldo si el entorno no soporta reconocimiento de voz.

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

  if (logNodo.textContent === "Historial Jarvis: sin comandos todavía.") {
    logNodo.textContent = "";
  }

  const linea = crearElemento("div", "entreno-diario-jarvis-log-line", textoLog);
  logNodo.prepend(linea);

  while (logNodo.children.length > 8) {
    logNodo.removeChild(logNodo.lastChild);
  }
}

function diagnosticarSoporteJarvis() {
  return {
    tieneMicrofono: puedeUsarMicrofono(),
    tieneReconocimiento: Boolean(obtenerSpeechRecognition()),
    tieneVoz: puedeHablar(),
    origen: window.location?.protocol || "desconocido",
    seguro: Boolean(window.isSecureContext)
  };
}

function describirDiagnosticoJarvis() {
  const diagnostico = diagnosticarSoporteJarvis();
  const partes = [
    `micrófono: ${diagnostico.tieneMicrofono ? "sí" : "no"}`,
    `voz: ${diagnostico.tieneVoz ? "sí" : "no"}`,
    `reconocimiento: ${diagnostico.tieneReconocimiento ? "sí" : "no"}`,
    `origen: ${diagnostico.origen}`
  ];

  return partes.join(" · ");
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
  } catch (error) {
    return {
      ok: false,
      mensaje: `No se autorizó el micrófono. Revisa permisos de Windows/Electron. Detalle: ${error?.name || "sin detalle"}.`
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
  if (boton) {
    boton.textContent = "Activar Jarvis";
    boton.disabled = false;
  }
  actualizarEstado(estadoNodo, "Jarvis apagado.", false);
  if (transcripcionNodo) transcripcionNodo.textContent = "Micrófono detenido.";
}

function responderJarvis({ mensaje, contextoCompleto, resultadoTexto, estadoNodo, contextoNodo, logNodo } = {}) {
  actualizarEstado(estadoNodo, mensaje, true);
  actualizarContexto(contextoNodo, contextoCompleto);
  if (resultadoTexto) agregarLog(logNodo, `Tú: ${resultadoTexto}`);
  agregarLog(logNodo, `Jarvis: ${mensaje}`);
  hablarJarvis(mensaje);
}

function procesarFraseJarvis({ frase, diario, pantalla, estadoNodo, contextoNodo, logNodo } = {}) {
  const respuesta = procesarComandoJarvis({
    frase,
    diario,
    pantalla,
    responder: (mensaje, contextoCompleto) => responderJarvis({
      mensaje,
      contextoCompleto,
      resultadoTexto: frase,
      estadoNodo,
      contextoNodo,
      logNodo
    })
  });

  if (!respuesta) {
    actualizarEstado(estadoNodo, "Jarvis escuchó, pero no ejecutó un comando nuevo.", true);
  }
}

async function activarJarvis({ diario, pantalla, boton, estadoNodo, transcripcionNodo, contextoNodo, logNodo } = {}) {
  const SpeechRecognition = obtenerSpeechRecognition();

  if (boton) {
    boton.disabled = true;
    boton.textContent = "Preparando Jarvis...";
  }
  actualizarEstado(estadoNodo, "Preparando Jarvis y solicitando micrófono...", true);
  if (transcripcionNodo) transcripcionNodo.textContent = `Diagnóstico: ${describirDiagnosticoJarvis()}`;
  agregarLog(logNodo, `Diagnóstico: ${describirDiagnosticoJarvis()}`);

  if (!SpeechRecognition) {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Activar Jarvis";
    }
    actualizarEstado(estadoNodo, "El botón sí responde, pero este entorno no tiene reconocimiento de voz activo. Usa el comando escrito de Jarvis o prueba en Chrome/Electron actualizado.", false);
    if (transcripcionNodo) transcripcionNodo.textContent = "Reconocimiento de voz no disponible. El modo escrito queda activo como respaldo.";
    agregarLog(logNodo, "Reconocimiento de voz no disponible. Modo escrito activo.");
    return;
  }

  const permiso = await pedirPermisoMicrofono();
  if (!permiso.ok) {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Activar Jarvis";
    }
    actualizarEstado(estadoNodo, permiso.mensaje, false);
    agregarLog(logNodo, permiso.mensaje);
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
    if (boton) {
      boton.textContent = "Detener Jarvis";
      boton.disabled = false;
    }
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
    procesarFraseJarvis({ frase: resultado.texto, diario, pantalla, estadoNodo, contextoNodo, logNodo });
  };

  recognition.onerror = (evento) => {
    const mensaje = evento?.error === "not-allowed"
      ? "Permiso de micrófono bloqueado. Revisa privacidad de Windows y permisos de Electron."
      : `Error de micrófono: ${evento?.error || "desconocido"}.`;
    actualizarEstado(estadoNodo, mensaje, false);
    agregarLog(logNodo, mensaje);
    if (boton && !jarvisEscuchando) {
      boton.textContent = "Activar Jarvis";
      boton.disabled = false;
    }
  };

  recognition.onend = () => {
    if (jarvisEscuchando) {
      try {
        recognition.start();
      } catch {
        actualizarEstado(estadoNodo, "Jarvis pausado. Presiona Activar Jarvis para reiniciar.", false);
        jarvisEscuchando = false;
        jarvisInteractuando = false;
        if (boton) {
          boton.textContent = "Activar Jarvis";
          boton.disabled = false;
        }
      }
    }
  };

  try {
    recognition.start();
  } catch (error) {
    actualizarEstado(estadoNodo, `No se pudo iniciar Jarvis. Detalle: ${error?.name || "sin detalle"}.`, false);
    agregarLog(logNodo, `No se pudo iniciar reconocimiento: ${error?.message || error?.name || "sin detalle"}`);
    jarvisEscuchando = false;
    jarvisInteractuando = false;
    if (boton) {
      boton.textContent = "Activar Jarvis";
      boton.disabled = false;
    }
  }
}

function crearComandoEscrito({ diario, pantalla, estadoNodo, contextoNodo, logNodo }) {
  const caja = crearElemento("form", "entreno-diario-jarvis-manual");
  const input = document.createElement("input");
  const boton = crearElemento("button", "entreno-diario-button", "Enviar comando");

  input.type = "text";
  input.placeholder = "Escribe: hey Jarvis iniciemos, hice 10 minutos, siguiente...";
  input.name = "jarvisComando";
  boton.type = "submit";

  caja.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const frase = texto(input.value);
    if (!frase) return;
    jarvisInteractuando = true;
    procesarFraseJarvis({ frase, diario, pantalla, estadoNodo, contextoNodo, logNodo });
    input.value = "";
  });

  caja.appendChild(input);
  caja.appendChild(boton);
  return caja;
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
  const comandoManual = crearComandoEscrito({ diario, pantalla, estadoNodo: estado, contextoNodo: contexto, logNodo: log });

  boton.type = "button";
  boton.disabled = !diario.rutinaDelDia?.rutina || !diario.rutinaDelDia?.dia;
  boton.addEventListener("click", () => {
    if (jarvisEscuchando) {
      detenerJarvis({ boton, estadoNodo: estado, transcripcionNodo: transcripcion });
      return;
    }

    activarJarvis({ diario, pantalla, boton, estadoNodo: estado, transcripcionNodo: transcripcion, contextoNodo: contexto, logNodo: log }).catch((error) => {
      actualizarEstado(estado, `Jarvis falló al activarse: ${error?.message || error?.name || "sin detalle"}.`, false);
      agregarLog(log, `Error al activar Jarvis: ${error?.stack || error?.message || error?.name || "sin detalle"}`);
      boton.textContent = "Activar Jarvis";
      boton.disabled = false;
    });
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
  panel.appendChild(comandoManual);
  panel.appendChild(crearElemento("small", "entreno-diario-jarvis-context", "Comandos: hey Jarvis iniciemos · siguiente · hice 12 repeticiones · hice 10 minutos · al fallo · guarda · completa sesión."));
  panel.appendChild(acciones);

  panelPrincipal.after(panel);
}
