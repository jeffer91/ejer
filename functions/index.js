/*
  Nombre completo: index.js
  Ruta o ubicación: functions/index.js

  Función:
    - Exponer Firebase Functions para FitJeff.
    - Recibir solicitudes de recomendación desde la app.
    - Consultar Gemini usando una clave segura del servidor.
    - Guardar la recomendación generada en Firestore bajo usuarios/jeff/recomendaciones.

  Se conecta con:
    - functions/gemini.service.js
    - functions/package.json
    - src/recomendaciones/recomendaciones.service.js
    - src/firebase/firestore.service.js
*/

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const {
  generarRecomendacionGemini,
  crearRespuestaSinGemini
} = require("./gemini.service.js");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const USUARIO_PRINCIPAL_ID = "jeff";

exports.generarRecomendacionFitJeff = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "256MiB"
  },
  async (request) => {
    try {
      const data = request.data || {};
      validarSolicitud(data);

      const usuarioId = limpiarTexto(data.usuarioId || USUARIO_PRINCIPAL_ID);
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

      const ref = await db
        .collection("usuarios")
        .doc(usuarioId)
        .collection("recomendaciones")
        .add(documento);

      return {
        ok: true,
        id: ref.id,
        ruta: `usuarios/${usuarioId}/recomendaciones/${ref.id}`,
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

function limpiarTexto(valor) {
  return String(valor || "").trim();
}
