/*
  Nombre completo: index.js
  Ruta o ubicación: functions/index.js

  Función:
    - Exponer Firebase Functions para FitJeff.
    - Recibir solicitudes de recomendación desde la app.
    - Consultar Gemini usando una clave segura del servidor.
    - Exponer Jarvis inteligente sin filtrar la clave al frontend.
    - Guardar resultados en la estructura Firestore vigente: fitjeff/{usuarioId}/...

  Se conecta con:
    - functions/gemini.service.js
    - functions/jarvis.service.js
    - functions/package.json
    - src/recomendaciones/recomendaciones.service.js
    - src/jarvis/jarvis.gemini.service.js
*/

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {
  generarRecomendacionGemini,
  crearRespuestaSinGemini
} = require("./gemini.service.js");
const {
  consultarJarvisGemini,
  crearRespuestaJarvisFallback
} = require("./jarvis.service.js");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const USUARIO_PRINCIPAL_ID = "jeff";
const FITJEFF_COLLECTION = "fitjeff";
const GEMINI_SECRET = "GEMINI_API_KEY";
const FITJEFF_SUBCOLECCIONES = Object.freeze({
  recomendaciones: "recomendaciones",
  asistente: "asistente"
});

exports.generarRecomendacionFitJeff = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB",
    secrets: [GEMINI_SECRET]
  },
  async (request) => {
    try {
      const data = request.data || {};
      validarSolicitud(data);

      const usuarioId = normalizarUsuarioId(data.usuarioId || USUARIO_PRINCIPAL_ID);
      const prompt = limpiarTexto(data.prompt);
      const datos = data.datos || {};
      const observacionUsuario = limpiarTexto(data.observacionUsuario || "");

      let recomendacion;

      try {
        recomendacion = await generarRecomendacionGemini({ prompt, datos });
      } catch (errorGemini) {
        logger.warn("No se pudo generar recomendación con Gemini.", errorGemini);
        recomendacion = crearRespuestaSinGemini({
          motivo: errorGemini.message,
          datos
        });
      }

      const documento = {
        ...recomendacion,
        usuarioId,
        observacionUsuario,
        estado: recomendacion.origen === "gemini" ? "generada" : "fallback",
        creadoEn: new Date().toISOString(),
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp()
      };

      const ref = await obtenerReferenciaFitJeff(usuarioId, FITJEFF_SUBCOLECCIONES.recomendaciones)
        .add(documento);

      return {
        ok: true,
        id: ref.id,
        ruta: `${FITJEFF_COLLECTION}/${usuarioId}/${FITJEFF_SUBCOLECCIONES.recomendaciones}/${ref.id}`,
        recomendacion: {
          idFirestore: ref.id,
          ...documento
        }
      };
    } catch (error) {
      logger.error("Error en generarRecomendacionFitJeff.", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        error.message || "No se pudo generar la recomendación."
      );
    }
  }
);

exports.consultarJarvisFitJeff = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB",
    secrets: [GEMINI_SECRET]
  },
  async (request) => {
    try {
      const data = request.data || {};
      validarSolicitudJarvis(data);

      const usuarioId = normalizarUsuarioId(data.usuarioId || USUARIO_PRINCIPAL_ID);
      const prompt = limpiarTexto(data.prompt);
      const consulta = data.consulta || {};
      const contexto = data.contexto || {};
      const tipo = limpiarTexto(data.tipo || "general");

      let respuesta;

      try {
        respuesta = await consultarJarvisGemini({
          prompt,
          consulta,
          contexto,
          tipo
        });
      } catch (errorGemini) {
        logger.warn("Jarvis remoto no disponible.", errorGemini);
        respuesta = crearRespuestaJarvisFallback({
          motivo: errorGemini.message
        });
      }

      const documento = {
        ...respuesta,
        usuarioId,
        tipo,
        consultaTexto: limpiarTexto(consulta.texto || ""),
        creadoEn: new Date().toISOString(),
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp()
      };

      const ref = await obtenerReferenciaFitJeff(usuarioId, FITJEFF_SUBCOLECCIONES.asistente)
        .add(documento);

      return {
        ...documento,
        ok: documento.ok !== false,
        idFirestore: ref.id,
        ruta: `${FITJEFF_COLLECTION}/${usuarioId}/${FITJEFF_SUBCOLECCIONES.asistente}/${ref.id}`
      };
    } catch (error) {
      logger.error("Error en consultarJarvisFitJeff.", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        "internal",
        error.message || "No se pudo consultar Jarvis."
      );
    }
  }
);

exports.pingFitJeff = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 15,
    memory: "128MiB"
  },
  async () => {
    return {
      ok: true,
      app: "FitJeff",
      status: "online",
      fecha: new Date().toISOString()
    };
  }
);

function obtenerReferenciaFitJeff(usuarioId, subcoleccion) {
  return db
    .collection(FITJEFF_COLLECTION)
    .doc(normalizarUsuarioId(usuarioId))
    .collection(subcoleccion);
}

function validarSolicitud(data) {
  if (!data || typeof data !== "object") {
    throw new HttpsError("invalid-argument", "La solicitud está vacía.");
  }

  if (!data.prompt || typeof data.prompt !== "string") {
    throw new HttpsError("invalid-argument", "El prompt es obligatorio.");
  }

  if (data.prompt.length > 20000) {
    throw new HttpsError(
      "invalid-argument",
      "El prompt es demasiado largo. Reduce el rango de datos analizados."
    );
  }
}

function validarSolicitudJarvis(data) {
  if (!data || typeof data !== "object") {
    throw new HttpsError("invalid-argument", "La solicitud de Jarvis está vacía.");
  }

  if (!data.prompt || typeof data.prompt !== "string") {
    throw new HttpsError("invalid-argument", "El prompt de Jarvis es obligatorio.");
  }

  if (data.prompt.length > 16000) {
    throw new HttpsError(
      "invalid-argument",
      "La consulta de Jarvis es demasiado larga."
    );
  }
}

function normalizarUsuarioId(valor) {
  const limpio = limpiarTexto(valor);
  return limpio || USUARIO_PRINCIPAL_ID;
}

function limpiarTexto(valor) {
  return String(valor || "").trim();
}
