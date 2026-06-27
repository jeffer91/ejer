/*
  Nombre completo: rutinas.service.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.service.js

  Función o funciones:
    - Convertir el formulario de Rutinas en una rutina guardable.
    - Crear días iguales o días diferentes por bloques.
    - Editar, duplicar, activar, archivar y restaurar rutinas.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/rutinas/rutinas.mapper.js
    - src/features/entrenamiento/rutinas/rutinas.validator.js
    - src/features/entrenamiento/rutinas/rutinas.controller.js
*/

import { ENTRENAMIENTO_ESTADOS_RUTINA } from "../entrenamiento.constants.js";
import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { validarFormularioRutina } from "./rutinas.validator.js";
import { crearDiasRutinaDesdeFormulario } from "./rutinas.mapper.js";

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function ordenarRutinas(rutinas = []) {
  const peso = {
    [ENTRENAMIENTO_ESTADOS_RUTINA.ACTIVA]: 0,
    [ENTRENAMIENTO_ESTADOS_RUTINA.INACTIVA]: 1,
    [ENTRENAMIENTO_ESTADOS_RUTINA.ARCHIVADA]: 2
  };

  return [...rutinas].sort((a, b) => {
    const estado = (peso[a.estado] ?? 9) - (peso[b.estado] ?? 9);
    if (estado !== 0) return estado;
    return String(b.actualizadoEn || b.creadoEn || "").localeCompare(String(a.actualizadoEn || a.creadoEn || ""));
  });
}

function clonarDias(dias = []) {
  return dias.map((dia, indice) => ({
    ...dia,
    id: undefined,
    nombre: dia.nombre || `Día ${indice + 1}`,
    orden: indice + 1,
    ejercicios: (dia.ejercicios || []).map((ejercicio) => ({
      ...ejercicio,
      id: undefined,
      completado: false
    }))
  }));
}

export function crearRutinasService(entrenamientoService = crearEntrenamientoService()) {
  function obtenerRutinas() {
    return ordenarRutinas(entrenamientoService.obtenerEstado().rutinas);
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
      dias: crearDiasRutinaDesdeFormulario(datosFormulario)
    });

    if (resultado.ok && activar) {
      return entrenamientoService.activarRutina(resultado.rutina.id);
    }

    return resultado;
  }

  function activar(rutinaId) {
    return entrenamientoService.activarRutina(rutinaId);
  }

  function editarNombre(rutinaId, datos = {}) {
    const nombre = texto(datos.nombre);

    if (!nombre) {
      return {
        ok: false,
        mensaje: "Escribe un nombre para la rutina."
      };
    }

    return entrenamientoService.actualizarRutina(rutinaId, { nombre });
  }

  function actualizarDesdeFormulario(rutinaId, datosFormulario = {}) {
    const validacion = validarFormularioRutina(datosFormulario);

    if (!validacion.ok) {
      return {
        ok: false,
        mensaje: validacion.errores[0] || "Revisa los datos de la rutina.",
        errores: validacion.errores
      };
    }

    return entrenamientoService.actualizarRutina(rutinaId, {
      nombre: texto(datosFormulario.nombre),
      dias: crearDiasRutinaDesdeFormulario(datosFormulario)
    });
  }

  function duplicar(rutinaId) {
    const rutina = obtenerRutinas().find((item) => item.id === rutinaId);

    if (!rutina) {
      return { ok: false, mensaje: "No se encontró la rutina para duplicar." };
    }

    return entrenamientoService.guardarRutina({
      nombre: `${rutina.nombre} copia`,
      estado: ENTRENAMIENTO_ESTADOS_RUTINA.INACTIVA,
      dias: clonarDias(rutina.dias)
    });
  }

  function archivar(rutinaId) {
    return entrenamientoService.actualizarRutina(rutinaId, {
      estado: ENTRENAMIENTO_ESTADOS_RUTINA.ARCHIVADA
    });
  }

  function restaurar(rutinaId) {
    return entrenamientoService.actualizarRutina(rutinaId, {
      estado: ENTRENAMIENTO_ESTADOS_RUTINA.INACTIVA
    });
  }

  return {
    obtenerRutinas,
    crearDesdeFormulario,
    activar,
    editarNombre,
    actualizarDesdeFormulario,
    duplicar,
    archivar,
    restaurar
  };
}
