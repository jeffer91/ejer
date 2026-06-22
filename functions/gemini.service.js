/*
  Nombre completo: gemini.service.js
  Ruta o ubicación: functions/gemini.service.js

  Función:
    - Centralizar la comunicación segura entre Firebase Functions y Gemini.
    - Construir una respuesta de recomendación clara, prudente y accionable.
    - Evitar que la clave privada de Gemini se use desde el frontend.
    - Devolver recomendaciones en texto y estructura simple para guardar en Firestore.

  Se conecta con:
    - functions/index.js
    - functions/package.json
    - src/recomendaciones/recomendaciones.service.js
    - src/recomendaciones/recomendaciones.prompt.js
*/

const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODELO_GEMINI = "gemini-1.5-flash";

function obtenerApiKeyGemini() {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error(
      "No está configurada GEMINI_API_KEY. Configúrala como secreto o variable de entorno en Firebase Functions."
    );
  }

  return key;
}

function crearClienteGemini() {
  const genAI = new GoogleGenerativeAI(obtenerApiKeyGemini());
  return genAI.getGenerativeModel({ model: MODELO_GEMINI });
}

async function generarRecomendacionGemini({ prompt, datos }) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("El prompt para Gemini es obligatorio.");
  }

  const model = crearClienteGemini();

  const resultado = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.45,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 1300
    },
    safetySettings: []
  });

  const texto = resultado.response.text();

  return normalizarRespuestaGemini({
    texto,
    datos,
    modelo: MODELO_GEMINI
  });
}

function normalizarRespuestaGemini({ texto, datos, modelo }) {
  const limpio = limpiarTexto(texto);

  return {
    origen: "gemini",
    modelo,
    resumen: extraerPrimerParrafo(limpio),
    textoCompleto: limpio,
    recomendaciones: dividirEnPuntos(limpio),
    datosAnalizados: crearResumenDatosAnalizados(datos),
    creadoEn: new Date().toISOString()
  };
}

function crearRespuestaSinGemini({ motivo, datos }) {
  const texto = [
    "Todavía no se pudo generar una recomendación con Gemini.",
    motivo,
    "Recomendación segura: registra tus entrenamientos, controla técnica, evita entrenar con dolor y mantén constancia antes de aumentar intensidad."
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    origen: "sistema",
    modelo: null,
    resumen: "No se pudo generar recomendación con Gemini.",
    textoCompleto: texto,
    recomendaciones: dividirEnPuntos(texto),
    datosAnalizados: crearResumenDatosAnalizados(datos),
    creadoEn: new Date().toISOString()
  };
}

function crearResumenDatosAnalizados(datos = {}) {
  return {
    perfilDisponible: Boolean(datos.perfil),
    pesoDisponible: Boolean(datos.peso),
    entrenamientoDisponible: Boolean(datos.entrenamiento),
    rendimientoDisponible: Array.isArray(datos.rendimiento) && datos.rendimiento.length > 0,
    ultimosEntrenamientos: Array.isArray(datos.ultimosEntrenamientos)
      ? datos.ultimosEntrenamientos.length
      : 0,
    ultimosPesos: Array.isArray(datos.ultimosPesos) ? datos.ultimosPesos.length : 0
  };
}

function dividirEnPuntos(texto) {
  return texto
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean)
    .filter((linea) => linea.length > 2)
    .slice(0, 20);
}

function extraerPrimerParrafo(texto) {
  return (
    texto
      .split("\n")
      .map((linea) => linea.trim())
      .find(Boolean) || "Recomendación generada."
  );
}

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

module.exports = {
  generarRecomendacionGemini,
  crearRespuestaSinGemini,
  MODELO_GEMINI
};
