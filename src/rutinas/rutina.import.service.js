/*
  Nombre completo: rutina.import.service.js
  Ruta o ubicación: src/rutinas/rutina.import.service.js

  Función:
    - Preparar importación desde texto.
    - Validar importación.
    - Aplicar cambios sobre la rutina actual.

  Se conecta con:
    - src/rutinas/rutina.parser.js
    - src/rutinas/rutina.validator.js
    - src/rutinas/rutina.storage.service.js
*/

import { parsearRutinaFitJeff } from "./rutina.parser.js";
import { validarRutinaImportada } from "./rutina.validator.js";
import { guardarRutinaEnHistorial } from "./rutina.storage.service.js";
import { RUTINA_ACCIONES } from "./rutina.schema.js";

export function prepararImportacionRutina(texto, rutinaActual) {
  const parseo = parsearRutinaFitJeff(texto);

  if (!parseo.ok) {
    return {
      ok: false,
      errores: parseo.errores,
      advertencias: parseo.advertencias || [],
      rutinaImportada: parseo.rutinaImportada
    };
  }

  const validacion = validarRutinaImportada(parseo.rutinaImportada, rutinaActual);

  return {
    ok: validacion.ok,
    errores: validacion.errores,
    advertencias: [...(parseo.advertencias || []), ...(validacion.advertencias || [])],
    rutinaImportada: parseo.rutinaImportada
  };
}

export function aplicarImportacionRutina(rutinaActual, rutinaImportada) {
  const validacion = validarRutinaImportada(rutinaImportada, rutinaActual);

  if (!validacion.ok) {
    return {
      ok: false,
      errores: validacion.errores,
      advertencias: validacion.advertencias,
      rutina: rutinaActual
    };
  }

  guardarRutinaEnHistorial(rutinaActual, {
    motivo: `Antes de aplicar ${rutinaImportada.accion}`,
    origen: "importador_fitjeff"
  });

  if (rutinaImportada.accion === RUTINA_ACCIONES.CREAR_RUTINA) {
    return {
      ok: true,
      errores: [],
      advertencias: validacion.advertencias,
      rutina: crearRutinaNueva(rutinaActual, rutinaImportada),
      mensaje: "Se creó una rutina nueva."
    };
  }

  if (rutinaImportada.accion === RUTINA_ACCIONES.CREAR_DIA) {
    return {
      ok: true,
      errores: [],
      advertencias: validacion.advertencias,
      rutina: crearDiaNuevo(rutinaActual, rutinaImportada),
      mensaje: "Se creó un nuevo día."
    };
  }

  return {
    ok: true,
    errores: [],
    advertencias: validacion.advertencias,
    rutina: reemplazarDia(rutinaActual, rutinaImportada),
    mensaje: `Se reemplazó el día ${rutinaImportada.diaAReemplazar}.`
  };
}

function reemplazarDia(rutinaActual, rutinaImportada) {
  const diaNuevo = convertirImportacionADia(rutinaImportada, rutinaImportada.diaAReemplazar);

  return {
    ...rutinaActual,
    dias: (rutinaActual.dias || []).map((dia) =>
      Number(dia.numero) === Number(rutinaImportada.diaAReemplazar) ? diaNuevo : dia
    ),
    actualizadoEn: new Date().toISOString()
  };
}

function crearDiaNuevo(rutinaActual, rutinaImportada) {
  const dias = Array.isArray(rutinaActual?.dias) ? rutinaActual.dias : [];
  const numeroNuevo = Math.max(0, ...dias.map((dia) => Number(dia.numero || 0))) + 1;

  return {
    ...rutinaActual,
    dias: [...dias, convertirImportacionADia(rutinaImportada, numeroNuevo)],
    actualizadoEn: new Date().toISOString()
  };
}

function crearRutinaNueva(rutinaActual, rutinaImportada) {
  return {
    ...rutinaActual,
    nombre: `Rutina FitJeff ${new Date().toLocaleDateString("es-EC")}`,
    diaActual: 1,
    dias: [convertirImportacionADia(rutinaImportada, 1)],
    actualizadoEn: new Date().toISOString()
  };
}

function convertirImportacionADia(rutinaImportada, numeroDia) {
  return {
    numero: Number(numeroDia),
    nombre: rutinaImportada.nombreDia,
    objetivo: rutinaImportada.objetivo,
    duracionEstimadaMin: Number(rutinaImportada.duracionEstimadaMin || 40),
    calentamiento: rutinaImportada.preparacion,
    ejercicios: rutinaImportada.ejercicios,
    observaciones: rutinaImportada.observaciones,
    actualizadoEn: new Date().toISOString(),
    origen: "importador_fitjeff"
  };
}
