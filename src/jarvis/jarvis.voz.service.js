/*
  Nombre completo: jarvis.voz.service.js
  Ruta o ubicación: src/jarvis/jarvis.voz.service.js

  Función:
    - Hacer que Jarvis hable mediante SpeechSynthesis.
    - Escuchar comandos mediante SpeechRecognition cuando el navegador lo permita.
    - Mantener alternativa manual si la voz no está disponible.

  Se conecta con:
    - src/jarvis/jarvis.config.js
    - src/jarvis/jarvis.estado.js
    - src/jarvis/jarvis.comandos.js
    - src/vistas/jarvis.view.js
*/

import { JARVIS_CONFIG, JARVIS_EVENTOS, JARVIS_FRASES } from "./jarvis.config.js";
import { marcarJarvisEscuchando, marcarJarvisHablando, marcarJarvisListo, agregarMensajeEstadoJarvis } from "./jarvis.estado.js";

let reconocimiento = null;
let escuchando = false;
let vocesDisponibles = [];

export function obtenerSoporteVozJarvis() {
  return {
    sintesis: typeof window !== "undefined" && "speechSynthesis" in window,
    reconocimiento: typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    seguro: typeof window !== "undefined" && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")
  };
}

export async function inicializarVozJarvis() {
  cargarVoces();

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = cargarVoces;
  }

  const soporte = obtenerSoporteVozJarvis();

  if (!soporte.sintesis) {
    agregarMensajeEstadoJarvis(JARVIS_FRASES.sinVoz, "warning");
  }

  if (soporte.reconocimiento) {
    crearReconocimiento();
  }

  return soporte;
}

export function hablarJarvis(texto, opciones = {}) {
  const soporte = obtenerSoporteVozJarvis();
  const mensaje = String(texto || "").trim();

  if (!mensaje) {
    return Promise.resolve({ ok: false, mensaje: "No hay texto para hablar." });
  }

  agregarMensajeEstadoJarvis(mensaje, opciones.tipo || "jarvis");

  if (!soporte.sintesis) {
    return Promise.resolve({ ok: false, mensaje: JARVIS_FRASES.sinVoz });
  }

  return new Promise((resolve) => {
    try {
      window.speechSynthesis.cancel();
      marcarJarvisHablando(mensaje);

      const utterance = new SpeechSynthesisUtterance(mensaje);
      utterance.lang = opciones.lang || JARVIS_CONFIG.idioma;
      utterance.volume = opciones.volumen ?? JARVIS_CONFIG.volumen;
      utterance.rate = opciones.velocidad ?? JARVIS_CONFIG.velocidad;
      utterance.pitch = opciones.tono ?? JARVIS_CONFIG.tono;

      const voz = seleccionarVoz();
      if (voz) {
        utterance.voice = voz;
      }

      utterance.onend = () => {
        marcarJarvisListo();
        resolve({ ok: true, mensaje });
      };

      utterance.onerror = () => {
        marcarJarvisListo();
        resolve({ ok: false, mensaje: "No se pudo reproducir la voz." });
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      marcarJarvisListo();
      resolve({ ok: false, mensaje: error.message || "Error de voz." });
    }
  });
}

export function escucharJarvis({ timeoutMs = JARVIS_CONFIG.tiempoEscuchaMs } = {}) {
  const soporte = obtenerSoporteVozJarvis();

  if (!soporte.reconocimiento) {
    return Promise.resolve({
      ok: false,
      texto: "",
      mensaje: "El reconocimiento de voz no está disponible en este navegador."
    });
  }

  if (!reconocimiento) {
    crearReconocimiento();
  }

  return new Promise((resolve) => {
    let terminado = false;
    let timer = null;

    const finalizar = (resultado) => {
      if (terminado) {
        return;
      }

      terminado = true;
      escuchando = false;
      clearTimeout(timer);

      try {
        reconocimiento.stop();
      } catch (_) {
        // Sin acción necesaria.
      }

      marcarJarvisListo();
      resolve(resultado);
    };

    reconocimiento.onstart = () => {
      escuchando = true;
      marcarJarvisEscuchando();
      emitirEvento(JARVIS_EVENTOS.ESCUCHANDO, { activo: true });
    };

    reconocimiento.onresult = (event) => {
      const texto = Array.from(event.results || [])
        .map((item) => item[0]?.transcript || "")
        .join(" ")
        .trim();

      finalizar({ ok: true, texto, mensaje: "Comando recibido." });
    };

    reconocimiento.onerror = (event) => {
      finalizar({
        ok: false,
        texto: "",
        mensaje: event.error || "No se pudo escuchar el comando."
      });
    };

    reconocimiento.onend = () => {
      if (!terminado) {
        finalizar({ ok: false, texto: "", mensaje: "Tiempo de escucha finalizado." });
      }
    };

    timer = setTimeout(() => {
      finalizar({ ok: false, texto: "", mensaje: "No se recibió respuesta a tiempo." });
    }, timeoutMs);

    try {
      reconocimiento.start();
    } catch (error) {
      finalizar({ ok: false, texto: "", mensaje: error.message || "No se pudo iniciar el micrófono." });
    }
  });
}

export function detenerEscuchaJarvis() {
  escuchando = false;

  if (reconocimiento) {
    try {
      reconocimiento.stop();
    } catch (_) {
      // Sin acción necesaria.
    }
  }

  marcarJarvisListo();
}

export function detenerVozJarvis() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  marcarJarvisListo();
}

export function estaEscuchandoJarvis() {
  return escuchando;
}

function crearReconocimiento() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  reconocimiento = new SpeechRecognition();
  reconocimiento.lang = JARVIS_CONFIG.idioma;
  reconocimiento.continuous = false;
  reconocimiento.interimResults = false;
  reconocimiento.maxAlternatives = 1;

  return reconocimiento;
}

function cargarVoces() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    vocesDisponibles = [];
    return [];
  }

  vocesDisponibles = window.speechSynthesis.getVoices() || [];
  return vocesDisponibles;
}

function seleccionarVoz() {
  if (!vocesDisponibles.length) {
    cargarVoces();
  }

  return vocesDisponibles.find((voz) => voz.lang?.toLowerCase().startsWith("es")) || vocesDisponibles[0] || null;
}

function emitirEvento(nombre, detalle) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
}
