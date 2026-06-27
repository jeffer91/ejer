/*
  Nombre completo: estadisticas.constants.js
  Ruta o ubicación: src/features/control-corporal/estadisticas/estadisticas.constants.js

  Función o funciones:
    - Centralizar textos, etiquetas y estados visuales de Estadísticas.
    - Mantener la pantalla principal clara y sin términos técnicos.
    - Preparar indicadores para peso, objetivo, IMC, tendencia, avance, faltante y próxima medición.

  Se conecta con:
    - src/features/control-corporal/estadisticas/estadisticas.calculations.js
    - src/features/control-corporal/estadisticas/estadisticas.service.js
    - src/features/control-corporal/estadisticas/estadisticas.view.js
*/

export const ESTADISTICAS_TEXTOS = Object.freeze({
  TITULO: "Estadísticas",
  SUBTITULO: "Resumen visual de tu peso, objetivo, tendencia, avance y medidas corporales.",
  SIN_DATOS: "Aún faltan registros para mostrar estadísticas completas.",
  DATOS_AL_DIA: "Datos al día",
  PROXIMA_MEDICION: "Próxima medición",
  MEDIDAS: "Medidas corporales",
  GRAFICO_PESO: "Peso en el tiempo",
  PROGRESO_PESO: "Progreso de peso",
  MENSAJE_INTELIGENTE: "Lectura rápida"
});

export const ESTADISTICAS_TENDENCIAS = Object.freeze({
  BAJANDO: "Bajando",
  SUBIENDO: "Subiendo",
  ESTABLE: "Estable",
  INSUFICIENTE: "Faltan datos"
});

export const ESTADISTICAS_INDICADORES = Object.freeze({
  PROGRESO: "progreso",
  PENDIENTE: "pendiente",
  ALERTA: "alerta",
  INFO: "info"
});

export const ESTADISTICAS_LABELS = Object.freeze({
  pesoInicialKg: "Peso inicial",
  pesoActualKg: "Peso actual",
  pesoObjetivoKg: "Objetivo",
  cambioKg: "Último cambio",
  cambioTotalKg: "Cambio total",
  cambioSemanaKg: "Últimos 7 días",
  cambioMesKg: "Últimos 30 días",
  faltanteObjetivoKg: "Faltante",
  progresoObjetivo: "Avance",
  tendencia: "Tendencia",
  imc: "IMC",
  proximaMedicion: "Próxima medición",
  cinturaCm: "Cintura",
  abdomenCm: "Abdomen",
  pechoCm: "Pecho",
  brazoCm: "Brazo",
  piernaCm: "Pierna",
  caderaCm: "Cadera"
});
