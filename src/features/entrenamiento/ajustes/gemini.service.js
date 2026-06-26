/*
  Nombre completo: gemini.service.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/gemini.service.js

  Función o funciones:
    - Probar conexión con Gemini usando la API Key guardada localmente.
    - Generar guías breves de entrenamiento cuando IA esté activa.
    - Mantener Gemini separado de pantallas y ajustes.

  Se conecta con:
    - src/features/entrenamiento/ajustes/ajustes.service.js
*/

const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function texto(valor, defecto = "") {
  return typeof valor === "string" ? valor.trim() : defecto;
}

function extraerTextoGemini(respuesta = {}) {
  const partes = respuesta.candidates?.[0]?.content?.parts || [];
  return partes.map((parte) => parte.text || "").join(" ").trim();
}

function crearEndpoint(modelo, apiKey) {
  const modeloSeguro = encodeURIComponent(texto(modelo, "gemini-1.5-flash"));
  const keySegura = encodeURIComponent(texto(apiKey));
  return `${GEMINI_ENDPOINT_BASE}/${modeloSeguro}:generateContent?key=${keySegura}`;
}

async function llamarGemini({ apiKey, modelo, prompt }) {
  if (!texto(apiKey)) {
    return {
      ok: false,
      mensaje: "Primero guarda una API Key de Gemini."
    };
  }

  try {
    const respuesta = await fetch(crearEndpoint(modelo, apiKey), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });

    const data = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      return {
        ok: false,
        mensaje: data.error?.message || "Gemini no respondió correctamente."
      };
    }

    return {
      ok: true,
      mensaje: extraerTextoGemini(data) || "Gemini conectado.",
      data
    };
  } catch {
    return {
      ok: false,
      mensaje: "No se pudo conectar con Gemini. Revisa internet o la API Key."
    };
  }
}

export function crearGeminiService() {
  async function probarConexion(ajustes = {}) {
    return llamarGemini({
      apiKey: ajustes.geminiApiKey,
      modelo: ajustes.geminiModelo,
      prompt: "Responde exactamente: FitJeff conectado."
    });
  }

  async function generarGuiaEntrenamiento(ajustes = {}, contexto = {}) {
    if (!ajustes.iaActiva) {
      return {
        ok: false,
        mensaje: "La IA de entrenamiento está inactiva."
      };
    }

    const prompt = [
      "Eres FitJeff, guía breve de entrenamiento.",
      "Da una recomendación corta, motivadora y segura.",
      "No sugieras esfuerzos extremos ni ignorar dolor, mareo o malestar.",
      `Contexto: ${JSON.stringify(contexto)}`
    ].join("\n");

    return llamarGemini({
      apiKey: ajustes.geminiApiKey,
      modelo: ajustes.geminiModelo,
      prompt
    });
  }

  return {
    probarConexion,
    generarGuiaEntrenamiento
  };
}
