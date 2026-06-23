/*
  Nombre completo: jarvis.service.js
  Ruta o ubicación: functions/jarvis.service.js

  Función:
    - Procesar consultas inteligentes de Jarvis desde Firebase Functions.
    - Consultar el modelo remoto con clave segura del servidor.
    - Normalizar respuesta para la app FitJeff.

  Se conecta con:
    - functions/index.js
    - functions/package.json
    - src/jarvis/jarvis.gemini.service.js
*/

const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODELO_JARVIS = "gemini-1.5-flash";

function obtenerApiKeyGeminiJarvis() {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("No está configurada GEMINI_API_KEY para Jarvis.");
  }

  return key;
}

function crearClienteJarvis() {
  const genAI = new GoogleGenerativeAI(obtenerApiKeyGeminiJarvis());
  return genAI.getGenerativeModel({ model: MODELO_JARVIS });
}

async function consultarJarvisGemini({ prompt, consulta, contexto, tipo }) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("El prompt de Jarvis es obligatorio.");
  }

  const model = crearClienteJarvis();

  const resultado = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.35,
      topP: 0.85,
      topK: 32,
      maxOutputTokens: 1200
    },
    safetySettings: []
  });

  const texto = limpiarTexto(resultado.response.text());

  return normalizarRespuestaJarvis({
    texto,
    consulta,
    contexto,
    tipo,
    modelo: MODELO_JARVIS
  });
}

function normalizarRespuestaJarvis({ texto, modelo }) {
  const lineas = texto
    .split("\n")
    .map((linea) => limpiarTexto(linea.replace(/^[-*•]\s*/, "")))
    .filter(Boolean);

  const resumen = extraerResumen(texto, lineas);
  const advertencias = lineas.filter((linea) => /deten|profesional|riesgo|alerta|cuidado/i.test(linea)).slice(0, 4);
  const acciones = lineas.filter((linea) => /registra|haz|abre|revisa|inicia|descansa|guarda/i.test(linea)).slice(0, 4);
  const puntos = lineas
    .filter((linea) => linea !== resumen)
    .filter((linea) => !advertencias.includes(linea))
    .slice(0, 6);

  return {
    ok: true,
    origen: "remoto",
    modelo,
    resumen,
    respuesta: texto,
    puntos,
    acciones,
    advertencias,
    creadoEn: new Date().toISOString()
  };
}

function crearRespuestaJarvisFallback({ motivo }) {
  const respuesta = [
    "No pude consultar el servicio remoto en este momento.",
    "Respuesta local: revisa tu energía, usa técnica controlada y evita aumentar intensidad si hay fatiga.",
    "Acción: registra tu entrenamiento o revisa indicadores para tener más contexto."
  ].join("\n");

  return {
    ok: true,
    origen: "sistema",
    modelo: null,
    resumen: "Jarvis respondió con fallback local.",
    respuesta,
    puntos: [
      "Revisa energía y fatiga antes de entrenar.",
      "Mantén técnica controlada.",
      "Registra datos para mejorar futuras recomendaciones."
    ],
    acciones: [
      "Abrir Entrenar.",
      "Abrir Medidas.",
      "Guardar observación."
    ],
    advertencias: [
      motivo || "Servicio remoto no disponible."
    ],
    creadoEn: new Date().toISOString()
  };
}

function extraerResumen(texto, lineas) {
  const lineaResumen = lineas.find((linea) => /^resumen[:\s]/i.test(linea));

  if (lineaResumen) {
    return limpiarTexto(lineaResumen.replace(/^resumen[:\s]*/i, ""));
  }

  return lineas[0] || limpiarTexto(texto).slice(0, 180) || "Respuesta generada.";
}

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

module.exports = {
  consultarJarvisGemini,
  crearRespuestaJarvisFallback,
  MODELO_JARVIS
};
