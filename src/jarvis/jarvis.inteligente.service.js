/*
  Nombre completo: jarvis.inteligente.service.js
  Ruta o ubicación: src/jarvis/jarvis.inteligente.service.js

  Función:
    - Orquestar Jarvis inteligente.
    - Validar consulta, crear contexto, llamar servicio remoto o fallback local.
    - Guardar respuesta como mensaje de Jarvis.

  Se conecta con:
    - src/jarvis/jarvis.contexto.service.js
    - src/jarvis/jarvis.gemini.service.js
    - src/jarvis/jarvis.estado.js
    - src/vistas/jarvis.view.js
*/

import { agregarMensajeEstadoJarvis } from "./jarvis.estado.js";
import { crearContextoMinimoJarvis } from "./jarvis.contexto.service.js";
import {
  crearConsultaJarvisBase,
  inferirTipoConsulta,
  validarConsultaJarvis
} from "./jarvis.inteligencia.schema.js";
import { consultarJarvisConGemini } from "./jarvis.gemini.service.js";

export async function consultarJarvisInteligente({ texto, estadoApp = {}, usarGemini = false }) {
  const validacion = validarConsultaJarvis(texto);

  if (!validacion.ok) {
    return {
      ok: false,
      errores: validacion.errores,
      respuesta: null
    };
  }

  const tipo = inferirTipoConsulta(validacion.texto);
  const contexto = crearContextoMinimoJarvis(estadoApp);
  const consulta = crearConsultaJarvisBase({
    texto: validacion.texto,
    tipo,
    contexto,
    usarGemini
  });

  agregarMensajeEstadoJarvis(`Consulta: ${consulta.texto}`, "info", {
    origen: "usuario",
    tipoConsulta: tipo
  });

  const respuesta = await consultarJarvisConGemini({
    consulta,
    contexto,
    tipo,
    usarGemini
  });

  agregarMensajeEstadoJarvis(respuesta.respuesta || respuesta.resumen, respuesta.origen === "remoto" ? "ok" : "info", {
    origen: respuesta.origen,
    modelo: respuesta.modelo,
    tipoConsulta: tipo
  });

  return {
    ok: true,
    errores: [],
    consulta,
    respuesta
  };
}

export function crearSugerenciasJarvisInteligente() {
  return [
    "¿Qué entrenamiento me recomiendas hoy?",
    "Resume mi constancia de esta semana.",
    "¿Cómo voy con mis indicadores?",
    "¿Debo bajar intensidad si estoy cansado?",
    "Dame una acción concreta para mejorar mi próxima sesión."
  ];
}
