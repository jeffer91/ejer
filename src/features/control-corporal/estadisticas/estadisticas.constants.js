/*
  Nombre completo: estadisticas.constants.js
  Ruta o ubicación: src/features/control-corporal/estadisticas/estadisticas.constants.js

  Función o funciones:
    - Centralizar textos, etiquetas y estados visuales de Estadísticas.
    - Mantener la pantalla principal clara y sin términos técnicos.
    - Preparar indicadores para peso, objetivo, IMC, tendencia y próxima medición.

  Se conecta con:
    - src/features/control-corporal/estadisticas/estadisticas.calculations.js
    - src/features/control-corporal/estadisticas/estadisticas.service.js
    - src/features/control-corporal/estadisticas/estadisticas.view.js
*/

export const ESTADISTICAS_TEXTOS = Object.freeze({
  TITULO: "Estadísticas",
  SUBTITULO: "Resumen compacto de tu peso, objetivo, tendencia, IMC y medidas.",
  SIN_DATOS: "Aún faltan registros para mostrar estadísticas completas.",
  DATOS_AL_DIA: "Datos al día",
  PROXIMA_MEDICION: "Próxima medición",
  MEDIDAS: "Medidas corporales",
  GRAFICO_PESO: "Peso en el tiempo"
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
  pesoActualKg: "Peso actual",
  pesoObjetivoKg: "Objetivo",
  cambioKg: "Cambio",
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
