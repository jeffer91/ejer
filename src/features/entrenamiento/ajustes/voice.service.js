/*
  Nombre completo: voice.service.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/voice.service.js

  Función o funciones:
    - Detectar soporte de voz del navegador/Electron.
    - Listar voces disponibles.
    - Probar guía hablada con speechSynthesis.

  Se conecta con:
    - src/features/entrenamiento/ajustes/ajustes.service.js
*/

function tieneSpeech() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function numero(valor, defecto = 1) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

function obtenerVocesSistema() {
  if (!tieneSpeech()) return [];
  return window.speechSynthesis.getVoices() || [];
}

export function crearVoiceService() {
  function soportado() {
    return tieneSpeech();
  }

  function obtenerVoces() {
    return obtenerVocesSistema().map((voz) => ({
      nombre: voz.name,
      idioma: voz.lang,
      local: Boolean(voz.localService)
    }));
  }

  function detener() {
    if (tieneSpeech()) {
      window.speechSynthesis.cancel();
    }
  }

  function hablar(texto, ajustes = {}) {
    if (!tieneSpeech()) {
      return {
        ok: false,
        mensaje: "La voz no está disponible en este navegador o Electron."
      };
    }

    const frase = typeof texto === "string" && texto.trim()
      ? texto.trim()
      : "FitJeff voz activa. Entrena con control, descansa cuando lo necesites.";
    const utterance = new SpeechSynthesisUtterance(frase);
    const voces = obtenerVocesSistema();
    const vozSeleccionada = voces.find((voz) => voz.name === ajustes.vozNombre);

    if (vozSeleccionada) {
      utterance.voice = vozSeleccionada;
    }

    utterance.volume = limitar(numero(ajustes.volumenVoz, 1), 0, 1);
    utterance.rate = limitar(numero(ajustes.velocidadVoz, 1), 0.5, 2);
    utterance.pitch = 1;

    detener();
    window.speechSynthesis.speak(utterance);

    return {
      ok: true,
      mensaje: "Prueba de voz enviada."
    };
  }

  function probarVoz(ajustes = {}) {
    return hablar("FitJeff voz activa. Ajusta la intensidad a tu nivel y descansa cuando lo necesites.", ajustes);
  }

  return {
    soportado,
    obtenerVoces,
    hablar,
    probarVoz,
    detener
  };
}
