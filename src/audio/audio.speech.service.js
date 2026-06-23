/*
  Nombre completo: audio.speech.service.js
  Ruta o ubicación: src/audio/audio.speech.service.js
*/

import { AUDIO_CONFIG, crearAudioConfigBase, normalizarVolumen } from "./audio.config.js";

let vozCache = null;
let desbloqueado = false;

export function obtenerConfigAudio() {
  try {
    const guardado = JSON.parse(localStorage.getItem(AUDIO_CONFIG.storageKey) || "{}");
    return crearAudioConfigBase(guardado);
  } catch (_) {
    return crearAudioConfigBase();
  }
}

export function guardarConfigAudio(config = {}) {
  const actual = obtenerConfigAudio();
  const normalizada = crearAudioConfigBase({
    ...actual,
    ...config,
    volumen: normalizarVolumen(config.volumen ?? actual.volumen),
    actualizadoEn: new Date().toISOString()
  });

  localStorage.setItem(AUDIO_CONFIG.storageKey, JSON.stringify(normalizada));
  return normalizada;
}

export function subirVolumenAudio(paso = 0.1) {
  const actual = obtenerConfigAudio();
  return guardarConfigAudio({ volumen: normalizarVolumen(actual.volumen + paso) });
}

export function bajarVolumenAudio(paso = 0.1) {
  const actual = obtenerConfigAudio();
  return guardarConfigAudio({ volumen: normalizarVolumen(actual.volumen - paso) });
}

export function activarVozAudio() {
  return guardarConfigAudio({ vozActiva: true });
}

export function silenciarVozAudio() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  return guardarConfigAudio({ vozActiva: false });
}

export function audioDisponible() {
  return {
    speech: "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
    desbloqueado,
    seguro: window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1"
  };
}

export async function desbloquearAudioFitJeff() {
  desbloqueado = true;
  activarVozAudio();
  await hablarFitJeff(AUDIO_CONFIG.mensajes.audioActivado, { interrumpir: true });
  return audioDisponible();
}

export async function hablarFitJeff(texto, opciones = {}) {
  const config = obtenerConfigAudio();

  if (!config.vozActiva || !texto) {
    return false;
  }

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    return false;
  }

  if (opciones.interrumpir !== false) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(String(texto));
  utterance.lang = AUDIO_CONFIG.idioma;
  utterance.volume = normalizarVolumen(opciones.volumen ?? config.volumen);
  utterance.rate = Number(opciones.velocidad || config.velocidad || AUDIO_CONFIG.velocidadDefecto);
  utterance.pitch = Number(opciones.tono || config.tono || AUDIO_CONFIG.tonoDefecto);

  const voz = obtenerVozPreferida();
  if (voz) utterance.voice = voz;

  return new Promise((resolve) => {
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
  });
}

export function detenerVozFitJeff() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function obtenerVozPreferida() {
  if (vozCache) return vozCache;

  const voces = window.speechSynthesis?.getVoices?.() || [];
  vozCache =
    voces.find((voz) => AUDIO_CONFIG.vozPreferida.some((nombre) => voz.name.includes(nombre))) ||
    voces.find((voz) => String(voz.lang || "").toLowerCase().startsWith("es")) ||
    voces[0] ||
    null;

  return vozCache;
}
