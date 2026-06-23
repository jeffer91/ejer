/*
  Nombre completo: jarvis.gemini.service.js
  Ruta o ubicación: src/jarvis/jarvis.gemini.service.js

  Función:
    - Conectar Jarvis con una función segura del servidor.
    - Enviar consulta y contexto compacto.
    - Usar respuesta local si el servicio remoto no está disponible.
*/

import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";
import { obtenerFirebaseApp } from "../firebase/firebase.app.js";
import { JARVIS_INTELIGENCIA_CONFIG, crearRespuestaJarvisBase } from "./jarvis.inteligencia.schema.js";
import { crearPromptJarvisInteligente, crearRespuestaLocalPorTipo } from "./jarvis.prompt.service.js";

export async function consultarJarvisConGemini({ consulta, contexto, tipo, usarGemini = false }) {
  const local = crearRespuestaLocalPorTipo({ consulta, contexto, tipo });

  if (!usarGemini) {
    return crearRespuestaJarvisBase({
      origen: "local",
      resumen: local.resumen,
      respuesta: crearTextoDesdeRespuesta(local),
      puntos: local.puntos,
      acciones: local.acciones,
      advertencias: local.advertencias
    });
  }

  try {
    const app = obtenerFirebaseApp();
    const functions = getFunctions(app, "us-central1");
    const callable = httpsCallable(functions, JARVIS_INTELIGENCIA_CONFIG.funcionFirebase);
    const prompt = crearPromptJarvisInteligente({ consulta, contexto, tipo });
    const resultado = await callable({
      usuarioId: JARVIS_INTELIGENCIA_CONFIG.usuarioId,
      consulta,
      contexto,
      tipo,
      prompt
    });
    const data = resultado.data || {};

    if (!data.ok) {
      throw new Error(data.mensaje || "Respuesta remota no válida.");
    }

    return crearRespuestaJarvisBase({
      origen: "remoto",
      modelo: data.modelo || JARVIS_INTELIGENCIA_CONFIG.modeloPreferido,
      resumen: data.resumen,
      respuesta: data.respuesta,
      puntos: data.puntos || [],
      acciones: data.acciones || [],
      advertencias: data.advertencias || []
    });
  } catch (error) {
    console.warn("Jarvis remoto no disponible, usando respuesta local.", error);
    return crearRespuestaJarvisBase({
      origen: "local",
      resumen: local.resumen,
      respuesta: crearTextoDesdeRespuesta(local),
      puntos: local.puntos,
      acciones: local.acciones,
      advertencias: [...(local.advertencias || []), "Servicio remoto no disponible; se usó respuesta local."]
    });
  }
}

export function crearTextoDesdeRespuesta(respuesta) {
  return [
    respuesta.resumen,
    ...(respuesta.puntos || []).map((item) => `• ${item}`),
    ...(respuesta.acciones?.length ? ["Acciones:", ...respuesta.acciones.map((item) => `• ${item}`)] : []),
    ...(respuesta.advertencias?.length ? ["Advertencias:", ...respuesta.advertencias.map((item) => `• ${item}`)] : [])
  ].filter(Boolean).join("\n");
}
