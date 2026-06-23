/*
  Nombre completo: rutina.validator.js
  Ruta o ubicación: src/rutinas/rutina.validator.js

  Función:
    - Validar una rutina importada.
    - Separar errores bloqueantes de advertencias.
    - Revisar acción, día, ejercicios y límites básicos.

  Se conecta con:
    - src/rutinas/rutina.schema.js
    - src/rutinas/rutina.import.service.js
*/

import { RUTINA_ACCIONES, RUTINA_CONFIG, RUTINA_TIPOS, RUTINA_UNIDADES } from "./rutina.schema.js";

export function validarRutinaImportada(rutinaImportada, rutinaActual = null) {
  const errores = [];
  const advertencias = [];

  if (!rutinaImportada) {
    return {
      ok: false,
      errores: ["No existe rutina importada."],
      advertencias
    };
  }

  if (!Object.values(RUTINA_ACCIONES).includes(rutinaImportada.accion)) {
    errores.push("La acción no es válida.");
  }

  if (!rutinaImportada.nombreDia || rutinaImportada.nombreDia.length < 3) {
    errores.push("El nombre del día es obligatorio.");
  }

  if (!Number(rutinaImportada.duracionEstimadaMin)) {
    errores.push("La duración estimada debe ser numérica.");
  }

  if (!Array.isArray(rutinaImportada.ejercicios) || !rutinaImportada.ejercicios.length) {
    errores.push("Debe existir al menos un ejercicio.");
  }

  if (rutinaImportada.ejercicios?.length > RUTINA_CONFIG.maxEjercicios) {
    errores.push(`No se permiten más de ${RUTINA_CONFIG.maxEjercicios} ejercicios.`);
  }

  validarEjercicios(rutinaImportada.ejercicios || [], errores, advertencias);

  if (rutinaImportada.accion === RUTINA_ACCIONES.REEMPLAZAR_DIA) {
    const dias = Array.isArray(rutinaActual?.dias) ? rutinaActual.dias : [];
    const existe = dias.some((dia) => Number(dia.numero) === Number(rutinaImportada.diaAReemplazar));

    if (!existe) {
      errores.push(`No existe el día ${rutinaImportada.diaAReemplazar} para reemplazar.`);
    }
  }

  if (rutinaImportada.accion === RUTINA_ACCIONES.CREAR_DIA) {
    const dias = Array.isArray(rutinaActual?.dias) ? rutinaActual.dias : [];

    if (dias.length >= RUTINA_CONFIG.maxDias) {
      errores.push(`No se permiten más de ${RUTINA_CONFIG.maxDias} días.`);
    }
  }

  if (!rutinaImportada.preparacion?.length) {
    advertencias.push("No hay preparación inicial.");
  }

  return {
    ok: errores.length === 0,
    errores,
    advertencias
  };
}

function validarEjercicios(ejercicios, errores, advertencias) {
  ejercicios.forEach((ejercicio, index) => {
    const etiqueta = `Ejercicio ${index + 1}`;

    if (!ejercicio.nombre || ejercicio.nombre.length < 2) {
      errores.push(`${etiqueta}: falta nombre.`);
    }

    if (!Object.values(RUTINA_TIPOS).includes(ejercicio.tipoRegistro)) {
      errores.push(`${etiqueta}: tipo no permitido.`);
    }

    if (!Object.values(RUTINA_UNIDADES).includes(ejercicio.unidad)) {
      errores.push(`${etiqueta}: unidad no permitida.`);
    }

    if (Number(ejercicio.seriesObjetivo) <= 0) {
      errores.push(`${etiqueta}: las series deben ser mayores a cero.`);
    }

    if (Number(ejercicio.seriesObjetivo) > 8) {
      advertencias.push(`${etiqueta}: tiene más de 8 series.`);
    }

    if (Number(ejercicio.descansoSeg) < 20) {
      advertencias.push(`${etiqueta}: descanso muy corto.`);
    }

    if (Number(ejercicio.descansoSeg) > 240) {
      advertencias.push(`${etiqueta}: descanso muy largo.`);
    }
  });
}
