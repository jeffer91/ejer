/*
  Nombre completo: rutinas-day-selector.service.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas-day-selector.service.js

  Función o funciones:
    - Resolver qué día de una rutina activa debe cargarse en Diario.
    - Evitar el error de usar domingo como Día 1 cuando la rutina debe iniciar en lunes.
    - Permitir selección manual del día actual de entrenamiento.
    - Mantener compatibilidad con rutinas antiguas sin selector guardado.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/rutinas/rutinas.service.js
    - src/features/entrenamiento/rutinas/rutinas.view.js
    - src/features/entrenamiento/diario/diario.service.js
*/

import { ENTRENAMIENTO_DIAS } from "../entrenamiento.constants.js";

export const RUTINAS_SELECTOR_MODOS = Object.freeze({
  MANUAL: "manual",
  AUTOMATICO_LUNES: "automatico-lunes"
});

function obtenerIndiceLunesPrimero(fecha = new Date()) {
  const indiceJs = fecha.getDay();
  return indiceJs === 0 ? 6 : indiceJs - 1;
}

function obtenerDiaSemana(fecha = new Date()) {
  return ENTRENAMIENTO_DIAS[fecha.getDay()] || "hoy";
}

function obtenerDias(rutina = {}) {
  return Array.isArray(rutina.dias) ? rutina.dias : [];
}

export function crearSelectorManualDiaRutina(rutina = {}, diaRutinaId = "") {
  const dias = obtenerDias(rutina);
  const indice = dias.findIndex((dia) => dia.id === diaRutinaId);

  if (indice < 0) {
    return null;
  }

  const dia = dias[indice];

  return {
    modo: RUTINAS_SELECTOR_MODOS.MANUAL,
    diaRutinaId: dia.id,
    diaOrden: indice + 1,
    diaNombre: dia.nombre || `Día ${indice + 1}`,
    seleccionadoEn: new Date().toISOString()
  };
}

export function resolverDiaRutinaActual(rutina = {}, fecha = new Date()) {
  const dias = obtenerDias(rutina);

  if (dias.length === 0) {
    return {
      rutina,
      dia: null,
      diaSemana: obtenerDiaSemana(fecha),
      diaIndice: -1,
      diaTotal: 0,
      modoSeleccion: "sin-dias",
      selectorDia: null,
      explicacion: "La rutina activa no tiene días guardados."
    };
  }

  const selector = rutina.selectorDia || {};
  const indiceManual = selector.modo === RUTINAS_SELECTOR_MODOS.MANUAL
    ? dias.findIndex((dia) => dia.id === selector.diaRutinaId)
    : -1;

  if (indiceManual >= 0) {
    return {
      rutina,
      dia: dias[indiceManual],
      diaSemana: obtenerDiaSemana(fecha),
      diaIndice: indiceManual,
      diaTotal: dias.length,
      modoSeleccion: RUTINAS_SELECTOR_MODOS.MANUAL,
      selectorDia: selector,
      explicacion: `Día elegido manualmente: ${dias[indiceManual].nombre || `Día ${indiceManual + 1}`}.`
    };
  }

  const indiceAutomatico = obtenerIndiceLunesPrimero(fecha) % dias.length;

  return {
    rutina,
    dia: dias[indiceAutomatico] || dias[0],
    diaSemana: obtenerDiaSemana(fecha),
    diaIndice: indiceAutomatico,
    diaTotal: dias.length,
    modoSeleccion: RUTINAS_SELECTOR_MODOS.AUTOMATICO_LUNES,
    selectorDia: null,
    explicacion: "Selección automática con semana iniciando en lunes. Puedes cambiarla manualmente."
  };
}
