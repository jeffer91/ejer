/*
  Nombre completo: hoy.constants.js
  Ruta o ubicacion: src/features/control-corporal/hoy/hoy.constants.js

  Funcion o funciones:
    - Centralizar textos y estados de la pantalla Hoy.
    - Evitar frases repetidas dentro de la vista y reglas.
    - Mantener lenguaje simple, visual y no tecnico.

  Se conecta con:
    - src/features/control-corporal/hoy/hoy.rules.js
    - src/features/control-corporal/hoy/hoy.view.js
*/

export const HOY_ESTADOS = Object.freeze({
  SUCCESS: "success",
  INFO: "info",
  PENDING: "pending",
  ALERT: "alert",
  EMPTY: "empty"
});

export const HOY_TEXTOS = Object.freeze({
  KICKER: "Hoy",
  TITULO_OK: "Todo listo por hoy.",
  SUBTITULO_OK: "Buen trabajo, sigue registrando con calma.",
  TITULO_INICIAL: "Empieza con tu primer registro.",
  SUBTITULO_INICIAL: "Registra tu peso para activar el resumen diario.",
  TITULO_PESO: "Falta tu peso de hoy.",
  SUBTITULO_PESO: "Regístralo en menos de un minuto.",
  TITULO_MEDIDAS: "Faltan tus medidas de la semana.",
  SUBTITULO_MEDIDAS: "Actualiza tus medidas cuando tengas un momento.",
  GRAFICO_TITULO: "Peso reciente",
  GRAFICO_VACIO: "Registra al menos dos pesos para ver un mini gráfico.",
  ACCESOS_TITULO: "Accesos rápidos"
});

export const HOY_LABELS = Object.freeze({
  PESO: "Peso",
  MEDIDAS: "Medidas",
  PROGRESO: "Progreso",
  TENDENCIA: "Tendencia"
});
