/*
  Nombre completo: rutinas.service.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.service.js

  Función o funciones:
    - Convertir el formulario de Rutinas en una rutina guardable.
    - Crear días, calentamiento, ejercicios, descansos, series y repeticiones.
    - Usar entrenamiento.service.js para guardar y activar rutinas.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/entrenamiento.state.js
    - src/features/entrenamiento/rutinas/rutinas.validator.js
    - src/features/entrenamiento/rutinas/rutinas.controller.js
*/

import { ENTRENAMIENTO_ESTADOS_RUTINA } from "../entrenamiento.constants.js";
import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { crearDiaRutinaBase, crearEjercicioEntrenamientoBase } from "../entrenamiento.state.js";
import { validarFormularioRutina } from "./rutinas.validator.js";

function numero(valor, defecto = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
}

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function dividirEjercicios(ejerciciosTexto) {
  return texto(ejerciciosTexto)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function crearDiasDesdeFormulario(datos) {
  const totalDias = numero(datos.totalDias, 1);
  const ejercicios = dividirEjercicios(datos.ejerciciosTexto);
  const calentamiento = texto(datos.calentamiento);
  const descansoGeneralSegundos = numero(datos.descansoSegundos, 60);
  const series = numero(datos.series, 3);
  const repeticiones = numero(datos.repeticiones, 10);

  return Array.from({ length: totalDias }, (_, indice) => {
    return crearDiaRutinaBase({
      nombre: `Día ${indice + 1}`,
      orden: indice + 1,
      calentamiento,
      descansoGeneralSegundos,
      ejercicios: ejercicios.map((nombre) => crearEjercicioEntrenamientoBase({
        nombre,
        series,
        repeticiones,
        descansoSegundos: descansoGeneralSegundos
      }))
    });
  });
}

export function crearRutinasService(entrenamientoService = crearEntrenamientoService()) {
  function obtenerRutinas() {
    return entrenamientoService.obtenerEstado().rutinas;
  }

  function crearDesdeFormulario(datosFormulario = {}) {
    const validacion = validarFormularioRutina(datosFormulario);

    if (!validacion.ok) {
      return {
        ok: false,
        mensaje: validacion.errores[0] || "Revisa los datos de la rutina.",
        errores: validacion.errores
      };
    }

    const activar = Boolean(datosFormulario.activa);
    const resultado = entrenamientoService.guardarRutina({
      nombre: texto(datosFormulario.nombre),
      estado: activar ? ENTRENAMIENTO_ESTADOS_RUTINA.ACTIVA : ENTRENAMIENTO_ESTADOS_RUTINA.INACTIVA,
      dias: crearDiasDesdeFormulario(datosFormulario)
    });

    if (resultado.ok && activar) {
      return entrenamientoService.activarRutina(resultado.rutina.id);
    }

    return resultado;
  }

  function activar(rutinaId) {
    return entrenamientoService.activarRutina(rutinaId);
  }

  return {
    obtenerRutinas,
    crearDesdeFormulario,
    activar
  };
}
