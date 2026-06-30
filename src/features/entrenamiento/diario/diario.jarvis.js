/*
  Nombre completo: diario.jarvis.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.jarvis.js

  Función o funciones:
    - Insertar el panel Jarvis dentro de Diario.
    - Activar y detener micrófono desde un botón visible.
    - Mantener reconocimiento de voz local del navegador/Electron cuando el entorno lo permite.
    - Evitar bucles del micrófono cuando Jarvis habla o cuando SpeechRecognition devuelve errores temporales.
    - Usar modo de escucha corta para mejorar compatibilidad con Chrome/Electron.
    - Mostrar diagnóstico visible cuando el botón se presiona.
    - Enviar contexto completo al cerebro local de Jarvis en cada comando.
    - Enviar contexto completo a Gemini cuando la conversación necesita IA.
    - Ejecutar comandos inteligentes: iniciar, siguiente, registrar reps, tiempo, distancia, fallo, guardar y completar.
    - Permitir comando escrito como respaldo si el entorno no soporta reconocimiento de voz.

  Se conecta con:
    - src/features/entrenamiento/diario/diario.controller.js
    - src/features/entrenamiento/diario/diario.view.js
    - src/features/entrenamiento/diario/diario.jarvis.brain.js
    - src/features/entrenamiento/ajustes/gemini.service.js
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/diario/diario.css
*/

import { crearGeminiService } from "../ajustes/gemini.service.js";
import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { crearContextoJarvisCompleto, procesarComandoJarvis } from "./diario.jarvis.brain.js";

const JARVIS_NOMBRE = "Jarvis";
const FRASES_ACTIVACION = ["hey jarvis", "jarvis", "oye jarvis"];
const ERRORES_RECONOCIMIENTO_FATALES = ["not-allowed", "service-not-allowed", "audio-capture", "language-not-supported"];
const ERRORES_RECONOCIMIENTO_TEMPORALES = ["network", "no-speech", "aborted"];
const MAX_REINTENTOS_NETWORK = 2;
const RESPUESTA_LOCAL_DESCONOCIDA = "Comando escuchado, pero todavía no sé ejecutarlo.";
const PALABRAS_CONVERSACION_GEMINI = [
  "ayuda",
  "ayudame",
  "ayúdame",
  "recomienda",
  "recomendacion",
  "recomendación",
  "como voy",
  "cómo voy",
  "que hago",
  "qué hago",
  "que toca",
  "qué toca",
  "explicame",
  "explícame",
  "motivame",
  "motívame",
  "me siento",
  "cansado",
  "cansada",
  "duda",
  "dolor",
  "molestia"
];

const entrenamientoService = crearEntrenamientoService();
const geminiService = crearGeminiService();

let reconocimientoActivo = null;
let reinicioProgramado = null;
let jarvisEscuchando = false;
let jarvisInteractuando = false;
let jarvisHablando = false;
let ultimaFraseFinal = "";
let ultimoTiempoFrase = 0;
let reintentosNetwork = 0;

function crearElemento(etiqueta, clase = "", textoElemento = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (textoElemento !== undefined && textoElemento !== null) elemento.textContent = String(textoElemento);
  return elemento;
}

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function normalizar(valor = "") {
  return texto(valor).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

function obtenerAjustesEntrenamiento() {
  try {
    return entrenamientoService.obtenerEstado().ajustes || {};
  } catch {
    return {};
  }
}

function vozJarvisActiva() {
  const ajustes = obtenerAjustesEntrenamiento();
  return ajustes.vozActiva !== false;
}

function geminiDisponible(ajustes = obtenerAjustesEntrenamiento()) {
  return Boolean(ajustes.iaActiva && texto(ajustes.geminiApiKey));
}

function hablarJarvis(mensaje) {
  if (!vozJarvisActiva() || !puedeHablar() || !mensaje) return;

  try {
    jarvisHablando = true;
    window.speechSynthesis.cancel();

    const voz = new SpeechSynthesisUtterance(mensaje);
    voz.lang = "es-EC";
    voz.rate = 1;
    voz.pitch = 1;

    const liberar = () => {
      window.setTimeout(() => {
        jarvisHablando = false;
      }, 350);
    };

    voz.onend = liberar;
    voz.onerror = liberar;
    window.speechSynthesis.speak(voz);
  } catch {
    jarvisHablando = false;
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

  const ajustes = obtenerAjustesEntrenamiento();
  const estadoGemini = geminiDisponible(ajustes) ? "Gemini activo" : "Gemini inactivo";
  contextoNodo.textContent = `Contexto completo: ${contexto.rutina?.nombre || "sin rutina"} · ${contexto.dia?.nombre || "sin día"} · ejercicio actual: ${contexto.ejercicioActual?.nombre || "pendiente"} · sesión: ${contexto.sesion?.estado || "sin iniciar"} · ${estadoGemini}.`;
}

function agregarLog(logNodo, textoLog) {
  if (!logNodo || !textoLog) return;

  if (logNodo.textContent === "Historial Jarvis: sin comandos todavía.") {
    logNodo.textContent = "";
  }

  const linea = crearElemento("div", "entreno-diario-jarvis-log-line", textoLog);
  logNodo.prepend(linea);

  while (logNodo.children.length > 10) {
    logNodo.removeChild(logNodo.lastChild);
  }
}

function diagnosticarSoporteJarvis() {
  return {
    tieneMicrofono: puedeUsarMicrofono(),
    tieneReconocimiento: Boolean(obtenerSpeechRecognition()),
    tieneVoz: puedeHablar(),
    origen: window.location?.protocol || "desconocido",
    seguro: Boolean(window.isSecureContext),
    gemini: geminiDisponible() ? "activo" : "inactivo"
  };
}

function describirDiagnosticoJarvis() {
  const diagnostico = diagnosticarSoporteJarvis();
  const partes = [
    `micrófono: ${diagnostico.tieneMicrofono ? "sí" : "no"}`,
    `voz: ${diagnostico.tieneVoz ? "sí" : "no"}`,
    `reconocimiento: ${diagnostico.tieneReconocimiento ? "sí" : "no"}`,
    `Gemini: ${diagnostico.gemini}`,
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
  const limpio = normalizar(frase);
  return FRASES_ACTIVACION.some((activador) => limpio.includes(normalizar(activador)));
}

function esFraseRepetida(frase = "") {
  const ahora = Date.now();
  const limpia = normalizar(frase);

  if (limpia === ultimaFraseFinal && ahora - ultimoTiempoFrase < 1500) return true;

  ultimaFraseFinal = limpia;
  ultimoTiempoFrase = ahora;
  return false;
}

function restaurarBotonJarvis(boton) {
  if (!boton) return;
  boton.textContent = "Activar Jarvis";
  boton.disabled = false;
}

function limpiarReinicioProgramado() {
  if (!reinicioProgramado) return;
  window.clearTimeout(reinicioProgramado);
  reinicioProgramado = null;
}

function detenerReconocimientoActivo() {
  limpiarReinicioProgramado();

  try {
    reconocimientoActivo?.abort?.();
  } catch {
    try {
      reconocimientoActivo?.stop?.();
    } catch {
      // Si ya estaba detenido, no hacemos nada.
    }
  }

  reconocimientoActivo = null;
}

function detenerJarvis({ boton, estadoNodo, transcripcionNodo } = {}) {
  jarvisEscuchando = false;
  jarvisInteractuando = false;
  jarvisHablando = false;
  reintentosNetwork = 0;
  detenerReconocimientoActivo();
  restaurarBotonJarvis(boton);
  actualizarEstado(estadoNodo, "Jarvis apagado.", false);
  if (transcripcionNodo) transcripcionNodo.textContent = "Micrófono detenido.";
}

function manejarErrorFatalReconocimiento({ error, boton, estadoNodo, transcripcionNodo, logNodo } = {}) {
  const detalle = error || "desconocido";
  const mensaje = detalle === "not-allowed"
    ? "Permiso de micrófono bloqueado. Revisa privacidad de Windows y permisos de Electron."
    : detalle === "audio-capture"
      ? "No encuentro un micrófono activo. Revisa que Windows tenga un micrófono habilitado."
      : `Reconocimiento de voz detenido por error: ${detalle}. Usa el comando escrito como respaldo.`;

  jarvisEscuchando = false;
  jarvisInteractuando = true;
  detenerReconocimientoActivo();
  restaurarBotonJarvis(boton);
  actualizarEstado(estadoNodo, mensaje, false);
  if (transcripcionNodo) transcripcionNodo.textContent = `Jarvis sin micrófono: ${detalle}. La conversación escrita con Gemini sigue disponible.`;
  agregarLog(logNodo, mensaje);
}

function manejarErrorTemporalReconocimiento({ error, boton, estadoNodo, transcripcionNodo, logNodo } = {}) {
  const detalle = error || "desconocido";

  if (detalle === "network") {
    reintentosNetwork += 1;
  }

  if (detalle === "network" && reintentosNetwork > MAX_REINTENTOS_NETWORK) {
    jarvisEscuchando = false;
    jarvisInteractuando = true;
    detenerReconocimientoActivo();
    restaurarBotonJarvis(boton);
    const mensaje = "El motor de voz de Chrome/Electron no respondió después de varios intentos. Mantengo Jarvis en modo escrito con Gemini para que la conversación no se pierda.";
    actualizarEstado(estadoNodo, mensaje, false);
    if (transcripcionNodo) transcripcionNodo.textContent = "Micrófono pausado por error de red del motor de voz. Escribe el comando y Jarvis responderá con Gemini si está activo.";
    agregarLog(logNodo, mensaje);
    return;
  }

  const mensaje = detalle === "network"
    ? `El motor de voz tuvo un corte de red. Reintento ${reintentosNetwork}/${MAX_REINTENTOS_NETWORK} sin crear bucle.`
    : `Reconocimiento pausado: ${detalle}. Jarvis intentará seguir escuchando.`;

  actualizarEstado(estadoNodo, mensaje, true);
  if (transcripcionNodo) transcripcionNodo.textContent = mensaje;
  agregarLog(logNodo, mensaje);
}

function responderJarvis({ mensaje, contextoCompleto, resultadoTexto, estadoNodo, contextoNodo, logNodo, origen = "Jarvis" } = {}) {
  actualizarEstado(estadoNodo, mensaje, true);
  actualizarContexto(contextoNodo, contextoCompleto);
  if (resultadoTexto) agregarLog(logNodo, `Tú: ${resultadoTexto}`);
  agregarLog(logNodo, `${origen}: ${mensaje}`);
  hablarJarvis(mensaje);
}

function esRespuestaLocalBasica(respuesta = "") {
  return normalizar(respuesta) === normalizar(RESPUESTA_LOCAL_DESCONOCIDA);
}

function debeConsultarGemini({ frase = "", respuestaLocal = "" } = {}) {
  const limpia = normalizar(frase);

  if (!limpia) return false;
  if (esRespuestaLocalBasica(respuestaLocal)) return true;
  return PALABRAS_CONVERSACION_GEMINI.some((palabra) => limpia.includes(normalizar(palabra)));
}

async function consultarGeminiJarvis({ frase, respuestaLocal, diario, pantalla, estadoNodo, contextoNodo, logNodo } = {}) {
  const ajustes = obtenerAjustesEntrenamiento();

  if (!geminiDisponible(ajustes)) {
    agregarLog(logNodo, "Gemini no está activo. Actívalo en Ajustes para conversación inteligente.");
    return null;
  }

  const contextoCompleto = crearContextoJarvisCompleto({ diario, pantalla, frase });
  actualizarEstado(estadoNodo, "Jarvis está pensando con Gemini...", true);
  actualizarContexto(contextoNodo, contextoCompleto);

  const resultado = await geminiService.conversarJarvisEntrenamiento(
    ajustes,
    contextoCompleto,
    frase,
    respuestaLocal
  );

  if (!resultado.ok) {
    const mensaje = `Gemini no respondió: ${resultado.mensaje}`;
    actualizarEstado(estadoNodo, mensaje, false);
    agregarLog(logNodo, mensaje);
    return null;
  }

  responderJarvis({
    mensaje: resultado.mensaje,
    contextoCompleto,
    estadoNodo,
    contextoNodo,
    logNodo,
    origen: "Jarvis + Gemini"
  });

  return resultado.mensaje;
}

async function procesarFraseJarvis({ frase, diario, pantalla, estadoNodo, contextoNodo, logNodo } = {}) {
  const respuestaLocal = procesarComandoJarvis({
    frase,
    diario,
    pantalla,
    responder: (mensaje, contextoCompleto) => responderJarvis({
      mensaje,
      contextoCompleto,
      resultadoTexto: frase,
      estadoNodo,
      contextoNodo,
      logNodo,
      origen: "Jarvis"
    })
  });

  if (!respuestaLocal) {
    actualizarEstado(estadoNodo, "Jarvis escuchó, pero no ejecutó un comando nuevo.", true);
    return;
  }

  if (debeConsultarGemini({ frase, respuestaLocal })) {
    await consultarGeminiJarvis({ frase, respuestaLocal, diario, pantalla, estadoNodo, contextoNodo, logNodo });
  }
}

function iniciarReconocimientoSeguro({ recognition, boton, estadoNodo, transcripcionNodo, logNodo } = {}) {
  if (!jarvisEscuchando || !recognition) return;

  if (jarvisHablando) {
    limpiarReinicioProgramado();
    reinicioProgramado = window.setTimeout(() => {
      reinicioProgramado = null;
      iniciarReconocimientoSeguro({ recognition, boton, estadoNodo, transcripcionNodo, logNodo });
    }, 700);
    return;
  }

  try {
    recognition.start();
  } catch (error) {
    jarvisEscuchando = false;
    jarvisInteractuando = true;
    restaurarBotonJarvis(boton);
    const mensaje = `Jarvis quedó pausado. Presiona Activar Jarvis para reiniciar. Detalle: ${error?.name || "sin detalle"}.`;
    actualizarEstado(estadoNodo, mensaje, false);
    if (transcripcionNodo) transcripcionNodo.textContent = mensaje;
    agregarLog(logNodo, mensaje);
  }
}

function programarReinicioReconocimiento({ recognition, boton, estadoNodo, transcripcionNodo, logNodo } = {}) {
  if (!jarvisEscuchando || !recognition || reinicioProgramado) return;

  reinicioProgramado = window.setTimeout(() => {
    reinicioProgramado = null;
    iniciarReconocimientoSeguro({ recognition, boton, estadoNodo, transcripcionNodo, logNodo });
  }, jarvisHablando ? 900 : 450);
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
    restaurarBotonJarvis(boton);
    jarvisInteractuando = true;
    actualizarEstado(estadoNodo, "El botón sí responde, pero este entorno no tiene reconocimiento de voz activo. Usa el comando escrito; Gemini responderá si está activo.", false);
    if (transcripcionNodo) transcripcionNodo.textContent = "Reconocimiento de voz no disponible. El modo escrito queda activo como respaldo.";
    agregarLog(logNodo, "Reconocimiento de voz no disponible. Modo escrito activo.");
    return;
  }

  const permiso = await pedirPermisoMicrofono();
  if (!permiso.ok) {
    restaurarBotonJarvis(boton);
    jarvisInteractuando = true;
    actualizarEstado(estadoNodo, permiso.mensaje, false);
    agregarLog(logNodo, permiso.mensaje);
    return;
  }

  const contexto = crearContextoResumen(diario);
  const ajustes = obtenerAjustesEntrenamiento();
  const recognition = new SpeechRecognition();
  let saludoInicialEmitido = false;

  reconocimientoActivo = recognition;
  jarvisEscuchando = true;
  jarvisInteractuando = false;
  jarvisHablando = false;
  reintentosNetwork = 0;

  recognition.lang = "es-EC";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  recognition.onstart = () => {
    if (!jarvisEscuchando) return;
    if (boton) {
      boton.textContent = "Detener Jarvis";
      boton.disabled = false;
    }

    const estadoGemini = geminiDisponible(ajustes) ? "con Gemini activo" : "sin Gemini activo";
    actualizarEstado(estadoNodo, `Jarvis escuchando ${estadoGemini}. Di: hey Jarvis, iniciemos.`, true);
    actualizarContexto(contextoNodo, crearContextoJarvisCompleto({ diario, pantalla }));

    if (saludoInicialEmitido) return;

    saludoInicialEmitido = true;
    agregarLog(logNodo, `Jarvis activo ${estadoGemini} · ${contexto.rutina} · ${contexto.dia} · ${contexto.ejercicios} ejercicio(s).`);
    hablarJarvis(`Jarvis activo. Tengo lista la rutina ${contexto.rutina}, ${contexto.dia}. Di hey Jarvis, iniciemos.`);
  };

  recognition.onresult = (evento) => {
    if (jarvisHablando) {
      if (transcripcionNodo) transcripcionNodo.textContent = "Jarvis está hablando. Espera un momento y responde después.";
      return;
    }

    const resultado = extraerTextoResultado(evento);
    if (!resultado.texto) return;

    if (transcripcionNodo) transcripcionNodo.textContent = `Escuché: ${resultado.texto}`;
    if (!resultado.esFinal || esFraseRepetida(resultado.texto)) return;

    reintentosNetwork = 0;

    if (contieneActivacionJarvis(resultado.texto)) {
      jarvisInteractuando = true;
      actualizarEstado(estadoNodo, "Jarvis interactuando. Puedes responder sin repetir hey Jarvis.", true);
    }

    if (!jarvisInteractuando) return;

    procesarFraseJarvis({ frase: resultado.texto, diario, pantalla, estadoNodo, contextoNodo, logNodo }).catch((error) => {
      const mensaje = `Jarvis falló al procesar la frase: ${error?.message || error?.name || "sin detalle"}.`;
      actualizarEstado(estadoNodo, mensaje, false);
      agregarLog(logNodo, mensaje);
    });
  };

  recognition.onerror = (evento) => {
    const error = evento?.error || "desconocido";

    if (ERRORES_RECONOCIMIENTO_FATALES.includes(error)) {
      manejarErrorFatalReconocimiento({ error, boton, estadoNodo, transcripcionNodo, logNodo });
      return;
    }

    if (ERRORES_RECONOCIMIENTO_TEMPORALES.includes(error)) {
      manejarErrorTemporalReconocimiento({ error, boton, estadoNodo, transcripcionNodo, logNodo });
      return;
    }

    const mensaje = `Error de micrófono: ${error}. Jarvis seguirá disponible por escrito.`;
    actualizarEstado(estadoNodo, mensaje, false);
    agregarLog(logNodo, mensaje);
  };

  recognition.onend = () => {
    if (!jarvisEscuchando) return;
    programarReinicioReconocimiento({ recognition, boton, estadoNodo, transcripcionNodo, logNodo });
  };

  iniciarReconocimientoSeguro({ recognition, boton, estadoNodo, transcripcionNodo, logNodo });
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
    procesarFraseJarvis({ frase, diario, pantalla, estadoNodo, contextoNodo, logNodo }).catch((error) => {
      const mensaje = `Jarvis no pudo procesar el comando escrito: ${error?.message || error?.name || "sin detalle"}.`;
      actualizarEstado(estadoNodo, mensaje, false);
      agregarLog(logNodo, mensaje);
    });
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

  const ajustes = obtenerAjustesEntrenamiento();
  const textoGemini = geminiDisponible(ajustes)
    ? "Gemini está activo para conversación inteligente."
    : "Gemini está inactivo; los comandos locales siguen funcionando.";

  const panel = crearElemento("section", "entreno-diario-panel entreno-diario-jarvis");
  const top = crearElemento("div", "entreno-diario-jarvis__top");
  const textos = crearElemento("div", "");
  const acciones = crearElemento("div", "entreno-diario-actions entreno-diario-actions--jarvis");
  const boton = crearElemento("button", "entreno-diario-button entreno-diario-button--jarvis", "Activar Jarvis");
  const estado = crearElemento("p", "entreno-diario-jarvis-status", "Jarvis apagado.");
  const contexto = crearElemento("small", "entreno-diario-jarvis-context", `Al activar, FitJeff enviará a Jarvis el contexto completo del día en cada comando. ${textoGemini}`);
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
      restaurarBotonJarvis(boton);
    });
  });

  textos.appendChild(crearElemento("h3", "", JARVIS_NOMBRE));
  textos.appendChild(crearElemento("p", "", "Activa el micrófono para conversar con Jarvis durante el entrenamiento diario. Si el motor de voz falla, puedes seguir por escrito con Gemini."));
  top.appendChild(textos);

  acciones.appendChild(boton);
  panel.appendChild(top);
  panel.appendChild(estado);
  panel.appendChild(contexto);
  panel.appendChild(transcripcion);
  panel.appendChild(log);
  panel.appendChild(comandoManual);
  panel.appendChild(crearElemento("small", "entreno-diario-jarvis-context", "Comandos: hey Jarvis iniciemos · siguiente · hice 12 repeticiones · hice 10 minutos · al fallo · guarda · completa sesión · cómo voy · ayúdame."));
  panel.appendChild(acciones);

  panelPrincipal.after(panel);
}
