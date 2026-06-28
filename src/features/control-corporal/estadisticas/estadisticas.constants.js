/*
  Nombre completo: estadisticas.constants.js
  Ruta o ubicacion: src/features/control-corporal/estadisticas/estadisticas.constants.js

  Funcion o funciones:
    - Centralizar textos, etiquetas y estados visuales de Progreso.
    - Mantener la pantalla clara y sin saturar al usuario.
    - Preparar indicadores para peso, objetivo, IMC contextual, tendencia, avance, faltante y próxima medición.

  Se conecta con:
    - src/features/control-corporal/estadisticas/estadisticas.calculations.js
    - src/features/control-corporal/estadisticas/estadisticas.presenter.js
    - src/features/control-corporal/estadisticas/estadisticas.service.js
    - src/features/control-corporal/estadisticas/estadisticas.view.js
*/

export const ESTADISTICAS_TEXTOS = Object.freeze({
  TITULO: "Progreso",
  SUBTITULO: "Revisa los detalles importantes de tu peso, meta, tendencia y medidas.",
  SIN_DATOS: "Aún faltan registros para mostrar un progreso completo.",
  DATOS_AL_DIA: "Datos al día",
  PROXIMA_MEDICION: "Próxima medición",
  MEDIDAS: "Medidas corporales",
  GRAFICO_PESO: "Peso reciente",
  PROGRESO_PESO: "Avance hacia la meta",
  MENSAJE_INTELIGENTE: "Lectura rápida",
  DETALLE_PESO: "Detalle de peso",
  RESUMEN_PRINCIPAL: "Resumen principal",
  ANALISIS_CORPORAL: "Análisis corporal inteligente"
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
  cuelloCm: "Cuello",
  cinturaCm: "Cintura",
  abdomenCm: "Abdomen",
  pechoCm: "Pecho",
  brazoCm: "Brazo",
  piernaCm: "Pierna",
  caderaCm: "Cadera"
});
