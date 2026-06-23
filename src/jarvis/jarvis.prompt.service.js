/*
  Nombre completo: jarvis.prompt.service.js
  Ruta o ubicación: src/jarvis/jarvis.prompt.service.js

  Función:
    - Crear prompts seguros para Jarvis inteligente.
    - Restringir respuestas a recomendaciones prudentes y prácticas.
    - Evitar diagnósticos o indicaciones riesgosas.

  Se conecta con:
    - src/jarvis/jarvis.contexto.service.js
    - src/jarvis/jarvis.gemini.service.js
    - functions/jarvis.service.js
*/

import { JARVIS_TIPOS_CONSULTA } from "./jarvis.inteligencia.schema.js";

export function crearPromptJarvisInteligente({ consulta, contexto, tipo }) {
  return [
    "Eres Jarvis, asistente de entrenamiento de FitJeff.",
    "Responde en español, claro, directo y breve.",
    "Usa únicamente recomendaciones prudentes basadas en los datos entregados.",
    "No diagnostiques condiciones médicas.",
    "No propongas aumentar intensidad si el usuario reporta señales de alerta o mala técnica.",
    "No promuevas extremos físicos, restricciones agresivas ni sobrecarga.",
    "Si faltan datos, dilo y da una acción segura.",
    "Devuelve una respuesta útil, con máximo 5 puntos.",
    "",
    `Tipo de consulta: ${tipo || JARVIS_TIPOS_CONSULTA.GENERAL}`,
    `Consulta del usuario: ${consulta.texto}`,
    "",
    "Contexto FitJeff:",
    JSON.stringify(contexto, null, 2),
    "",
    "Formato de respuesta:",
    "Resumen: una frase.",
    "Puntos: lista corta.",
    "Acciones: máximo 3 acciones concretas.",
    "Advertencias: solo si aplica."
  ].join("\n");
}

export function crearPromptRapidoJarvis(consultaTexto) {
  return [
    "Responde como Jarvis de FitJeff.",
    "Respuesta breve, segura y práctica.",
    "No diagnostiques ni propongas sobrecarga.",
    `Consulta: ${consultaTexto}`
  ].join("\n");
}

export function crearRespuestaLocalPorTipo({ consulta, contexto, tipo }) {
  const fatiga = contexto?.estadisticas?.fatiga?.nivel || "sin datos";
  const dia = contexto?.rutina?.diaSugerido;
  const indicador = contexto?.indicadores?.recientes?.[0];
  const sesion = contexto?.sesiones?.recientes?.[0];

  if (tipo === JARVIS_TIPOS_CONSULTA.RECUPERACION || fatiga === "alto") {
    return {
      resumen: "Conviene priorizar recuperación y técnica.",
      puntos: [
        "Reduce la intensidad si notas fatiga alta.",
        "Mantén descansos suficientes entre series.",
        "Prioriza control antes que más volumen."
      ],
      acciones: [
        "Haz calentamiento suave.",
        "Registra cómo te sientes al final.",
        "Retoma carga normal cuando estés estable."
      ],
      advertencias: [
        "Si aparece una señal física alarmante, detén la sesión y busca orientación profesional."
      ]
    };
  }

  if (tipo === JARVIS_TIPOS_CONSULTA.MEDIDAS) {
    return {
      resumen: "Tus indicadores ayudan a ver tendencia, no un resultado aislado.",
      puntos: [
        indicador ? `Último registro: ${indicador.fecha}.` : "Todavía faltan indicadores recientes.",
        "Compara semanas completas, no días sueltos.",
        "Prioriza constancia, energía y adherencia."
      ],
      acciones: [
        "Registra indicadores el fin de semana.",
        "Añade observación semanal.",
        "Revisa la gráfica después de 2 registros."
      ],
      advertencias: []
    };
  }

  if (tipo === JARVIS_TIPOS_CONSULTA.RUTINA || tipo === JARVIS_TIPOS_CONSULTA.ENTRENAMIENTO) {
    return {
      resumen: dia ? `Hoy puedes trabajar ${dia.nombre}.` : "Puedes iniciar con una sesión controlada.",
      puntos: [
        dia ? `Día sugerido: ${dia.numero}.` : "No hay día sugerido disponible.",
        sesion ? `Última sesión registrada: ${sesion.fecha}.` : "Aún no hay sesión reciente.",
        "Mantén técnica antes de subir carga o volumen."
      ],
      acciones: [
        "Inicia entrenamiento guiado.",
        "Marca cada serie con honestidad.",
        "Guarda observación al final."
      ],
      advertencias: [
        "No sigas si pierdes técnica de forma clara."
      ]
    };
  }

  return {
    resumen: "Puedo ayudarte con entrenamiento, rutina, indicadores o reportes.",
    puntos: [
      "Pregunta por el entrenamiento de hoy.",
      "Pide revisar tu constancia semanal.",
      "Pide un resumen de indicadores o reportes."
    ],
    acciones: [
      "Abrir Entrenar.",
      "Abrir Medidas.",
      "Abrir Reportes."
    ],
    advertencias: []
  };
}
