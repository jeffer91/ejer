/*
  Nombre completo: gemini.service.js
  Ruta o ubicación: src/features/entrenamiento/ajustes/gemini.service.js

  Función o funciones:
    - Probar conexión con Gemini usando la API Key guardada localmente.
    - Generar guías breves de entrenamiento cuando IA esté activa.
    - Enviar siempre contexto completo porque Gemini no conserva memoria entre llamadas.
    - Evitar fallos por modelos antiguos probando modelos compatibles de respaldo.
    - Mantener Gemini separado de pantallas y ajustes.

  Se conecta con:
    - src/features/entrenamiento/ajustes/ajustes.service.js
*/

const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
export const GEMINI_MODELO_RECOMENDADO = "gemini-2.5-flash";

const GEMINI_MODELOS_RESPALDO = [
  GEMINI_MODELO_RECOMENDADO,
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-2.5-flash-lite"
];

function texto(valor, defecto = "") {
  return typeof valor === "string" ? valor.trim() : defecto;
}

function extraerTextoGemini(respuesta = {}) {
  const partes = respuesta.candidates?.[0]?.content?.parts || [];
  return partes.map((parte) => parte.text || "").join(" ").trim();
}

function normalizarModeloGemini(modelo) {
  const limpio = texto(modelo);

  if (!limpio) return GEMINI_MODELO_RECOMENDADO;
  if (/^gemini-1\.5/i.test(limpio)) return GEMINI_MODELO_RECOMENDADO;
  return limpio;
}

function crearListaModelos(modelo) {
  const principal = normalizarModeloGemini(modelo);
  return [principal, ...GEMINI_MODELOS_RESPALDO].filter((item, indice, lista) => item && lista.indexOf(item) === indice);
}

function crearEndpoint(modelo, apiKey) {
  const modeloSeguro = encodeURIComponent(normalizarModeloGemini(modelo));
  const keySegura = encodeURIComponent(texto(apiKey));
  return `${GEMINI_ENDPOINT_BASE}/${modeloSeguro}:generateContent?key=${keySegura}`;
}

function esErrorDeModelo(mensaje = "") {
  return /not found|not supported|generateContent|ListModels|modelo|model/i.test(texto(mensaje));
}

function crearPromptConContexto({ instruccion = "", contexto = {}, modo = "guia" } = {}) {
  return [
    "CONTEXTO OBLIGATORIO FITJEFF",
    "Gemini no conserva memoria entre llamadas. Usa únicamente este contexto para responder.",
    "Rol: eres FitJeff, asistente breve y seguro de entrenamiento dentro de una app local.",
    "Objetivo: dar ayuda clara, corta y útil según los datos actuales de la app.",
    "Reglas de seguridad: no sugieras esfuerzos extremos; no indiques ignorar dolor, mareo o malestar; recomienda bajar intensidad o detenerse si hay molestias importantes.",
    "Formato: responde en español, directo y sin explicación larga.",
    `Modo: ${modo}`,
    `Contexto actual de la app: ${JSON.stringify(contexto || {})}`,
    "INSTRUCCIÓN ACTUAL",
    instruccion
  ].join("\n");
}

async function llamarGeminiModelo({ apiKey, modelo, prompt }) {
  const respuesta = await fetch(crearEndpoint(modelo, apiKey), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
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
      mensaje: data.error?.message || "Gemini no respondió correctamente.",
      status: respuesta.status,
      data
    };
  }

  return {
    ok: true,
    mensaje: extraerTextoGemini(data) || "Gemini conectado.",
    data
  };
}

async function llamarGemini({ apiKey, modelo, prompt }) {
  if (!texto(apiKey)) {
    return {
      ok: false,
      mensaje: "Primero guarda una API Key de Gemini."
    };
  }

  const modelos = crearListaModelos(modelo);
  let ultimoError = null;

  try {
    for (const modeloActual of modelos) {
      const resultado = await llamarGeminiModelo({ apiKey, modelo: modeloActual, prompt });

      if (resultado.ok) {
        return {
          ...resultado,
          modeloUsado: modeloActual
        };
      }

      ultimoError = resultado;

      if (!esErrorDeModelo(resultado.mensaje)) {
        break;
      }
    }

    return {
      ok: false,
      mensaje: ultimoError?.mensaje
        ? `${ultimoError.mensaje} Modelo sugerido: ${GEMINI_MODELO_RECOMENDADO}.`
        : "Gemini no respondió correctamente.",
      data: ultimoError?.data || null
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
      prompt: crearPromptConContexto({
        modo: "prueba_conexion",
        contexto: {
          app: "FitJeff",
          pantalla: "Ajustes",
          accion: "probar_conexion_gemini"
        },
        instruccion: "Responde exactamente: FitJeff conectado."
      })
    });
  }

  async function generarGuiaEntrenamiento(ajustes = {}, contexto = {}) {
    if (!ajustes.iaActiva) {
      return {
        ok: false,
        mensaje: "La IA de entrenamiento está inactiva."
      };
    }

    return llamarGemini({
      apiKey: ajustes.geminiApiKey,
      modelo: ajustes.geminiModelo,
      prompt: crearPromptConContexto({
        modo: "guia_entrenamiento",
        contexto,
        instruccion: "Da una recomendación corta, motivadora y segura para el entrenamiento actual. Usa el contexto recibido; no inventes memoria anterior."
      })
    });
  }

  return {
    probarConexion,
    generarGuiaEntrenamiento
  };
}
