/*
  Nombre completo: jarvis.config.js
  Ruta o ubicación: src/jarvis/jarvis.config.js

  Función:
    - Centralizar la configuración base de Jarvis.
    - Definir idioma, comandos, frases, tiempos y reglas de control.
    - Mantener Jarvis gratuito y local por defecto.

  Se conecta con:
    - src/jarvis/jarvis.voz.service.js
    - src/jarvis/jarvis.comandos.js
    - src/jarvis/jarvis.estado.js
    - src/jarvis/jarvis.entrenamiento.js
    - src/vistas/jarvis.view.js
*/

export const JARVIS_CONFIG = Object.freeze({
  nombre: "Jarvis",
  idioma: "es-EC",
  idiomaAlternativo: "es-ES",
  vozPreferida: "es",
  escucharContinuamente: false,
  usarGeminiPorDefecto: false,
  volumen: 1,
  velocidad: 0.96,
  tono: 1,
  silencioEntreMensajesMs: 350,
  tiempoEscuchaMs: 9000,
  tiempoConfirmacionMs: 12000,
  tiempoDescansoDefectoSeg: 90,
  tiempoDescansoAbdomenSeg: 60,
  maxIntentosEscucha: 2,
  comandosActivacion: [
    "jarvis",
    "yarvis",
    "servis",
    "asistente"
  ],
  comandosInicio: [
    "inicia entrenamiento",
    "iniciar entrenamiento",
    "empezar entrenamiento",
    "comenzar entrenamiento",
    "arranca entrenamiento",
    "vamos a entrenar"
  ],
  comandosSi: [
    "sí",
    "si",
    "listo",
    "hecho",
    "ya",
    "terminé",
    "termine",
    "completado",
    "correcto"
  ],
  comandosNo: [
    "no",
    "todavía no",
    "aún no",
    "aun no",
    "espera",
    "falta",
    "no terminé",
    "no termine"
  ],
  comandosPausar: [
    "pausa",
    "pausar",
    "detente",
    "detener",
    "espera un momento"
  ],
  comandosContinuar: [
    "continúa",
    "continua",
    "continuar",
    "sigue",
    "seguir",
    "reanudar"
  ],
  comandosRepetir: [
    "repite",
    "repetir",
    "otra vez",
    "no escuché",
    "no escuche"
  ],
  comandosSiguiente: [
    "siguiente",
    "avanza",
    "avanzar",
    "pasar",
    "sigue al siguiente"
  ],
  comandosTerminar: [
    "terminar entrenamiento",
    "finalizar entrenamiento",
    "guardar entrenamiento",
    "cerrar entrenamiento",
    "terminar"
  ],
  comandosNota: [
    "nota",
    "observación",
    "observacion",
    "guardar nota",
    "anotar"
  ]
});

export const JARVIS_EVENTOS = Object.freeze({
  CAMBIO_ESTADO: "jarvis:cambio-estado",
  MENSAJE: "jarvis:mensaje",
  ESCUCHANDO: "jarvis:escuchando",
  HABLANDO: "jarvis:hablando",
  COMANDO: "jarvis:comando",
  ERROR: "jarvis:error",
  ENTRENAMIENTO_INICIADO: "jarvis:entrenamiento-iniciado",
  ENTRENAMIENTO_FINALIZADO: "jarvis:entrenamiento-finalizado",
  NOTA_GUARDADA: "jarvis:nota-guardada"
});

export const JARVIS_ACCIONES = Object.freeze({
  NINGUNA: "ninguna",
  ACTIVAR: "activar",
  DESACTIVAR: "desactivar",
  INICIAR_ENTRENAMIENTO: "iniciar_entrenamiento",
  RESPUESTA_SI: "respuesta_si",
  RESPUESTA_NO: "respuesta_no",
  PAUSAR: "pausar",
  CONTINUAR: "continuar",
  REPETIR: "repetir",
  SIGUIENTE: "siguiente",
  TERMINAR: "terminar",
  NOTA: "nota",
  DESCONOCIDO: "desconocido"
});

export const JARVIS_FRASES = Object.freeze({
  bienvenida: "Jarvis listo. Puedo guiar tu entrenamiento paso a paso.",
  sinVoz: "Tu navegador no permite usar voz en este momento. Puedes usar los botones manuales.",
  sinMicrofono: "No pude activar el micrófono. Revisa los permisos del navegador.",
  escuchando: "Te escucho.",
  noEntendi: "No entendí bien. Puedes responder sí, no, repetir, pausar o continuar.",
  entrenamientoIniciado: "Listo. Iniciamos el entrenamiento guiado.",
  entrenamientoPausado: "Entrenamiento pausado. Cuando quieras seguir, di continuar.",
  entrenamientoContinuado: "Continuamos.",
  entrenamientoFinalizado: "Entrenamiento finalizado. Guardemos el resumen.",
  tecnica: "Prioriza técnica, control y respiración. Detente si pierdes la forma.",
  calentamiento: "Primero realiza el calentamiento. Mantén movimientos controlados.",
  descanso: "Descansa y recupera el control antes de seguir.",
  notaGuardada: "Nota guardada correctamente."
});

export function obtenerComandosJarvis() {
  return {
    activacion: [...JARVIS_CONFIG.comandosActivacion],
    inicio: [...JARVIS_CONFIG.comandosInicio],
    si: [...JARVIS_CONFIG.comandosSi],
    no: [...JARVIS_CONFIG.comandosNo],
    pausar: [...JARVIS_CONFIG.comandosPausar],
    continuar: [...JARVIS_CONFIG.comandosContinuar],
    repetir: [...JARVIS_CONFIG.comandosRepetir],
    siguiente: [...JARVIS_CONFIG.comandosSiguiente],
    terminar: [...JARVIS_CONFIG.comandosTerminar],
    nota: [...JARVIS_CONFIG.comandosNota]
  };
}

export function crearMensajeJarvis(texto, tipo = "info", extra = {}) {
  return {
    id: `jarvis_msg_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    texto: String(texto || ""),
    tipo,
    creadoEn: new Date().toISOString(),
    ...extra
  };
}
