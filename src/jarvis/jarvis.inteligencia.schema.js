/*
  Nombre completo: jarvis.inteligencia.schema.js
  Ruta o ubicación: src/jarvis/jarvis.inteligencia.schema.js

  Función:
    - Definir estructura de consultas inteligentes de Jarvis.
    - Normalizar respuestas de IA o respuestas locales.
    - Mantener reglas prudentes para entrenamiento y bienestar.

  Se conecta con:
    - src/jarvis/jarvis.contexto.service.js
    - src/jarvis/jarvis.prompt.service.js
    - src/jarvis/jarvis.gemini.service.js
    - src/jarvis/jarvis.inteligente.service.js
*/

export const JARVIS_INTELIGENCIA_CONFIG = Object.freeze({
  version: "1.0.0",
  maxConsulta: 1600,
  maxRespuesta: 2200,
  modeloPreferido: "gemini-1.5-flash",
  usuarioId: "jeff",
  funcionFirebase: "consultarJarvisFitJeff"
});

export const JARVIS_TIPOS_CONSULTA = Object.freeze({
  GENERAL: "general",
  ENTRENAMIENTO: "entrenamiento",
  RUTINA: "rutina",
  MEDIDAS: "medidas",
  RECUPERACION: "recuperacion",
  REPORTE: "reporte"
});

export function crearConsultaJarvisBase(datos = {}) {
  return {
    id: datos.id || `consulta_jarvis_${Date.now()}`,
    texto: limpiarConsulta(datos.texto || ""),
    tipo: normalizarTipoConsulta(datos.tipo || JARVIS_TIPOS_CONSULTA.GENERAL),
    contexto: datos.contexto || {},
    usarGemini: Boolean(datos.usarGemini),
    creadoEn: datos.creadoEn || new Date().toISOString()
  };
}

export function crearRespuestaJarvisBase(datos = {}) {
  return {
    id: datos.id || `respuesta_jarvis_${Date.now()}`,
    ok: datos.ok !== false,
    origen: datos.origen || "local",
    modelo: datos.modelo || null,
    resumen: limpiarConsulta(datos.resumen || ""),
    respuesta: limpiarConsulta(datos.respuesta || datos.texto || ""),
    puntos: Array.isArray(datos.puntos) ? datos.puntos.slice(0, 8) : [],
    advertencias: Array.isArray(datos.advertencias) ? datos.advertencias.slice(0, 6) : [],
    acciones: Array.isArray(datos.acciones) ? datos.acciones.slice(0, 6) : [],
    creadoEn: datos.creadoEn || new Date().toISOString()
  };
}

export function validarConsultaJarvis(texto) {
  const limpio = limpiarConsulta(texto);
  const errores = [];

  if (!limpio) {
    errores.push("Escribe una pregunta para Jarvis.");
  }

  if (limpio.length > JARVIS_INTELIGENCIA_CONFIG.maxConsulta) {
    errores.push(`La consulta es muy larga. Máximo ${JARVIS_INTELIGENCIA_CONFIG.maxConsulta} caracteres.`);
  }

  return {
    ok: errores.length === 0,
    errores,
    texto: limpio
  };
}

export function normalizarTipoConsulta(tipo) {
  const limpio = String(tipo || "").toLowerCase().trim();

  if (Object.values(JARVIS_TIPOS_CONSULTA).includes(limpio)) {
    return limpio;
  }

  return JARVIS_TIPOS_CONSULTA.GENERAL;
}

export function inferirTipoConsulta(texto = "") {
  const limpio = limpiarConsulta(texto).toLowerCase();

  if (contiene(limpio, ["dolor", "cansancio", "fatiga", "recuperar", "recuperación", "recuperacion"])) {
    return JARVIS_TIPOS_CONSULTA.RECUPERACION;
  }

  if (contiene(limpio, ["rutina", "día", "dia", "ejercicio", "series", "repeticiones"])) {
    return JARVIS_TIPOS_CONSULTA.RUTINA;
  }

  if (contiene(limpio, ["peso", "medidas", "cintura", "avance", "progreso"])) {
    return JARVIS_TIPOS_CONSULTA.MEDIDAS;
  }

  if (contiene(limpio, ["reporte", "historial", "resumen", "semana", "mes"])) {
    return JARVIS_TIPOS_CONSULTA.REPORTE;
  }

  if (contiene(limpio, ["entrenar", "entrenamiento", "hoy", "guiado"])) {
    return JARVIS_TIPOS_CONSULTA.ENTRENAMIENTO;
  }

  return JARVIS_TIPOS_CONSULTA.GENERAL;
}

export function limpiarConsulta(valor = "") {
  return String(valor || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, JARVIS_INTELIGENCIA_CONFIG.maxRespuesta);
}

function contiene(texto, palabras = []) {
  return palabras.some((palabra) => texto.includes(palabra));
}
