/*
  Nombre completo: jarvis.comandos.js
  Ruta o ubicación: src/jarvis/jarvis.comandos.js

  Función:
    - Interpretar texto reconocido por voz.
    - Convertir frases naturales cortas en acciones internas de Jarvis.
    - Mantener el control local sin depender de Gemini.

  Se conecta con:
    - src/jarvis/jarvis.config.js
    - src/jarvis/jarvis.estado.js
    - src/jarvis/jarvis.entrenamiento.js
    - src/vistas/jarvis.view.js
*/

import { JARVIS_ACCIONES, JARVIS_CONFIG, obtenerComandosJarvis } from "./jarvis.config.js";

export function interpretarComandoJarvis(texto = "") {
  const original = String(texto || "").trim();
  const normalizado = normalizarTextoComando(original);
  const comandos = obtenerComandosJarvis();

  if (!normalizado) {
    return crearResultadoComando(JARVIS_ACCIONES.NINGUNA, original, normalizado, 0);
  }

  const sinActivador = quitarActivadorJarvis(normalizado, comandos.activacion);

  const pruebas = [
    [JARVIS_ACCIONES.INICIAR_ENTRENAMIENTO, comandos.inicio],
    [JARVIS_ACCIONES.RESPUESTA_SI, comandos.si],
    [JARVIS_ACCIONES.RESPUESTA_NO, comandos.no],
    [JARVIS_ACCIONES.PAUSAR, comandos.pausar],
    [JARVIS_ACCIONES.CONTINUAR, comandos.continuar],
    [JARVIS_ACCIONES.REPETIR, comandos.repetir],
    [JARVIS_ACCIONES.SIGUIENTE, comandos.siguiente],
    [JARVIS_ACCIONES.TERMINAR, comandos.terminar],
    [JARVIS_ACCIONES.NOTA, comandos.nota]
  ];

  for (const [accion, lista] of pruebas) {
    const coincidencia = buscarCoincidencia(sinActivador, lista);

    if (coincidencia.ok) {
      return crearResultadoComando(accion, original, normalizado, coincidencia.confianza, {
        coincidencia: coincidencia.frase,
        textoUtil: extraerTextoUtil(sinActivador, coincidencia.frase)
      });
    }
  }

  if (contieneActivador(normalizado, comandos.activacion)) {
    return crearResultadoComando(JARVIS_ACCIONES.ACTIVAR, original, normalizado, 0.7);
  }

  return crearResultadoComando(JARVIS_ACCIONES.DESCONOCIDO, original, normalizado, 0.25, {
    textoUtil: sinActivador
  });
}

export function esComandoAfirmativo(texto = "") {
  return interpretarComandoJarvis(texto).accion === JARVIS_ACCIONES.RESPUESTA_SI;
}

export function esComandoNegativo(texto = "") {
  return interpretarComandoJarvis(texto).accion === JARVIS_ACCIONES.RESPUESTA_NO;
}

export function requiereGemini(resultadoComando) {
  if (!resultadoComando) {
    return false;
  }

  return resultadoComando.accion === JARVIS_ACCIONES.DESCONOCIDO && resultadoComando.confianza < 0.5;
}

export function normalizarTextoComando(texto = "") {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:!?¿¡()\[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function quitarActivadorJarvis(textoNormalizado, activadores = JARVIS_CONFIG.comandosActivacion) {
  let salida = textoNormalizado;

  activadores.forEach((activador) => {
    const limpio = normalizarTextoComando(activador);

    if (salida.startsWith(`${limpio} `)) {
      salida = salida.replace(`${limpio} `, "").trim();
    }

    if (salida === limpio) {
      salida = "";
    }
  });

  return salida;
}

function buscarCoincidencia(texto, frases = []) {
  for (const frase of frases) {
    const limpia = normalizarTextoComando(frase);

    if (!limpia) {
      continue;
    }

    if (texto === limpia) {
      return { ok: true, frase, confianza: 1 };
    }

    if (texto.startsWith(`${limpia} `) || texto.endsWith(` ${limpia}`) || texto.includes(` ${limpia} `)) {
      return { ok: true, frase, confianza: 0.88 };
    }

    if (texto.includes(limpia)) {
      return { ok: true, frase, confianza: 0.72 };
    }
  }

  return { ok: false, frase: null, confianza: 0 };
}

function contieneActivador(texto, activadores = []) {
  return activadores.some((activador) => {
    const limpio = normalizarTextoComando(activador);
    return texto === limpio || texto.startsWith(`${limpio} `) || texto.includes(` ${limpio} `);
  });
}

function extraerTextoUtil(texto, frase) {
  const limpia = normalizarTextoComando(frase);
  return String(texto || "").replace(limpia, "").trim();
}

function crearResultadoComando(accion, original, normalizado, confianza, extra = {}) {
  return {
    accion,
    original,
    normalizado,
    confianza,
    creadoEn: new Date().toISOString(),
    ...extra
  };
}
