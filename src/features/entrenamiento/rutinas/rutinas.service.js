/*
  Nombre completo: rutinas.service.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.service.js

  Función o funciones:
    - Convertir el formulario de Rutinas en una rutina guardable.
    - Crear días iguales o días diferentes por bloques.
    - Guardar rutinas interpretadas desde IA conservando días, bloques, tipos, medición, cardio, fútbol, duración y notas.
    - Editar ejercicios avanzados de rutinas IA sin perder estructura.
    - Editar, duplicar, activar, archivar, restaurar y borrar rutinas.
    - Seleccionar manualmente qué día de rutina debe cargarse hoy en Diario.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/entrenamiento.state.js
    - src/features/entrenamiento/rutinas/rutinas.mapper.js
    - src/features/entrenamiento/rutinas/rutinas.validator.js
    - src/features/entrenamiento/rutinas/rutinas.controller.js
*/

import { ENTRENAMIENTO_ESTADOS_RUTINA } from "../entrenamiento.constants.js";
import { crearEntrenamientoService } from "../entrenamiento.service.js";
import { crearDiaRutinaBase, crearEjercicioEntrenamientoBase } from "../entrenamiento.state.js";
import { crearDiasRutinaDesdeFormulario } from "./rutinas.mapper.js";
import { validarFormularioRutina } from "./rutinas.validator.js";

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function numero(valor, defecto = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
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
  return dias.map((dia, indice) => {
    const { id: _diaId, ...diaSinId } = dia;

    return {
      ...diaSinId,
      nombre: dia.nombre || `Día ${indice + 1}`,
      orden: indice + 1,
      ejercicios: (dia.ejercicios || []).map((ejercicio) => {
        const { id: _ejercicioId, ...ejercicioSinId } = ejercicio;
        return {
          ...ejercicioSinId,
          completado: false
        };
      })
    };
  });
}

function obtenerPrimerDescanso(dia = {}) {
  const ejercicio = (dia.ejercicios || []).find((item) => Number.isFinite(Number(item.descansoSegundos)));
  return numero(ejercicio?.descansoSegundos, 60);
}

function normalizarMedicionIA(ejercicio = {}, tipo = "otro") {
  const medicion = texto(ejercicio.medicion || ejercicio.tipoMedicion || ejercicio.unidadMedicion).toLowerCase();
  const duracionMinutos = numero(ejercicio.duracionMinutos, 0);
  const duracionSegundos = numero(ejercicio.duracionSegundos, 0);
  const distanciaKm = numero(ejercicio.distanciaKm, 0);

  if (["tiempo", "mixto", "distancia", "repeticiones"].includes(medicion)) return medicion;
  if (distanciaKm > 0) return "distancia";
  if (duracionMinutos > 0 || duracionSegundos > 0) return numero(ejercicio.series, 0) > 0 && numero(ejercicio.repeticiones, 0) > 0 ? "mixto" : "tiempo";
  if (["cardio", "movilidad", "calentamiento", "descanso_activo"].includes(tipo)) return "tiempo";
  return "repeticiones";
}

function mapearEjercicioIA(ejercicio = {}, bloque = {}) {
  const tipo = texto(ejercicio.tipo || bloque.tipo || "otro") || "otro";
  const esCardioOTecnica = ["cardio", "futbol", "tecnica", "movilidad", "calentamiento", "descanso_activo"].includes(tipo);
  const duracionMinutos = numero(ejercicio.duracionMinutos, 0);
  const duracionSegundos = numero(ejercicio.duracionSegundos, duracionMinutos > 0 ? Math.round(duracionMinutos * 60) : 0);
  const distanciaKm = numero(ejercicio.distanciaKm, 0);
  const medicion = normalizarMedicionIA({ ...ejercicio, duracionMinutos, duracionSegundos, distanciaKm }, tipo);
  const usaTiempoSolo = medicion === "tiempo";
  const usaMixto = medicion === "mixto";
  const usaDistancia = medicion === "distancia";

  return crearEjercicioEntrenamientoBase({
    nombre: texto(ejercicio.nombre) || "Ejercicio IA",
    tipo,
    medicion,
    bloque: texto(ejercicio.bloque || bloque.nombre || tipo),
    series: usaTiempoSolo || usaDistancia ? 0 : numero(ejercicio.series, esCardioOTecnica ? 0 : 3),
    repeticiones: usaTiempoSolo || usaDistancia || usaMixto ? numero(ejercicio.repeticiones, 0) : numero(ejercicio.repeticiones, 10),
    descansoSegundos: numero(ejercicio.descansoSegundos, esCardioOTecnica || usaTiempoSolo ? 0 : 60),
    duracion: texto(ejercicio.duracion),
    duracionMinutos,
    duracionSegundos,
    distanciaKm: distanciaKm || null,
    intensidad: texto(ejercicio.intensidad) || "media",
    notas: texto(ejercicio.notas),
    fuenteIA: texto(ejercicio.fuente),
    camposOriginales: ejercicio.camposOriginales || {},
    completado: false
  });
}

function mapearBloquesIA(bloques = []) {
  return bloques.map((bloque) => ({
    tipo: texto(bloque.tipo) || "otro",
    nombre: texto(bloque.nombre || bloque.tipo || "Bloque"),
    totalEjercicios: (bloque.ejercicios || []).length
  }));
}

function mapearDiaIA(dia = {}, indice = 0) {
  const bloques = Array.isArray(dia.bloques) && dia.bloques.length
    ? dia.bloques
    : [{ tipo: "otro", nombre: "Bloque general", ejercicios: dia.ejercicios || [] }];
  const ejercicios = bloques.flatMap((bloque) => (bloque.ejercicios || []).map((ejercicio) => mapearEjercicioIA(ejercicio, bloque)));

  return crearDiaRutinaBase({
    nombre: texto(dia.nombre) || `Día ${indice + 1}`,
    orden: indice + 1,
    numeroIA: dia.numero || indice + 1,
    enfoque: texto(dia.enfoque),
    calentamiento: texto(dia.calentamiento),
    descansoGeneralSegundos: obtenerPrimerDescanso({ ejercicios }),
    bloques: mapearBloquesIA(bloques),
    ejercicios
  });
}

function crearRutinaGuardableDesdeIA(resultadoIA = {}, opciones = {}) {
  const rutinaIA = resultadoIA.rutina || {};
  const dias = (rutinaIA.dias || []).map(mapearDiaIA).filter((dia) => dia.ejercicios.length > 0);
  const activar = Boolean(opciones.activa);

  return {
    nombre: texto(rutinaIA.nombre) || "Rutina generada por IA",
    estado: activar ? ENTRENAMIENTO_ESTADOS_RUTINA.ACTIVA : ENTRENAMIENTO_ESTADOS_RUTINA.INACTIVA,
    origen: "ia",
    formatoVersion: resultadoIA.formatoVersion || rutinaIA.formatoVersion || "FITJEFF_RUTINA_V1",
    objetivo: texto(rutinaIA.objetivo),
    nivel: texto(rutinaIA.nivel),
    lugar: texto(rutinaIA.lugar),
    equipo: texto(rutinaIA.equipo),
    duracionSesion: texto(rutinaIA.duracionSesion || rutinaIA.duracion_sesion),
    notasGenerales: texto(rutinaIA.notasGenerales || rutinaIA.notas_generales),
    resumenIA: resultadoIA.resumen || null,
    advertenciasIA: resultadoIA.advertencias || [],
    dias
  };
}

function numeroCampo(valor, defecto = 0) {
  if (valor === "" || valor === null || valor === undefined) return defecto;
  return numero(valor, defecto);
}

function actualizarEjercicioPreservandoIA(ejercicio = {}, datos = {}) {
  const tipo = texto(datos.tipo) || ejercicio.tipo || "otro";
  const duracionMinutos = numeroCampo(datos.duracionMinutos, ejercicio.duracionMinutos || 0);
  const duracionSegundos = numeroCampo(datos.duracionSegundos, ejercicio.duracionSegundos || (duracionMinutos > 0 ? Math.round(duracionMinutos * 60) : 0));
  const distanciaKm = numeroCampo(datos.distanciaKm, ejercicio.distanciaKm || 0);
  const medicion = normalizarMedicionIA({ ...ejercicio, ...datos, duracionMinutos, duracionSegundos, distanciaKm }, tipo);

  return {
    ...ejercicio,
    nombre: texto(datos.nombre) || ejercicio.nombre,
    tipo,
    medicion,
    bloque: texto(datos.bloque) || ejercicio.bloque || tipo,
    series: medicion === "tiempo" || medicion === "distancia" ? 0 : numeroCampo(datos.series, ejercicio.series || 0),
    repeticiones: medicion === "tiempo" || medicion === "distancia" ? 0 : numeroCampo(datos.repeticiones, ejercicio.repeticiones || 0),
    descansoSegundos: numeroCampo(datos.descansoSegundos, ejercicio.descansoSegundos || 0),
    duracionMinutos,
    duracionSegundos,
    duracion: duracionMinutos > 0 ? `${duracionMinutos}min` : texto(ejercicio.duracion),
    distanciaKm: distanciaKm || null,
    intensidad: texto(datos.intensidad) || ejercicio.intensidad || "media",
    notas: texto(datos.notas),
    actualizadoEn: new Date().toISOString()
  };
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

  function crearDesdeRutinaIA(resultadoIA = {}, opciones = {}) {
    if (!resultadoIA.ok) {
      return {
        ok: false,
        mensaje: resultadoIA.mensaje || "La rutina IA no está lista para guardar.",
        errores: resultadoIA.errores || []
      };
    }

    const datosRutina = crearRutinaGuardableDesdeIA(resultadoIA, opciones);

    if (!datosRutina.dias.length) {
      return {
        ok: false,
        mensaje: "La rutina IA no tiene días con ejercicios para guardar.",
        errores: ["No se detectaron ejercicios guardables."]
      };
    }

    const resultado = entrenamientoService.guardarRutina(datosRutina);

    if (resultado.ok && opciones.activa) {
      return entrenamientoService.activarRutina(resultado.rutina.id);
    }

    return {
      ...resultado,
      mensaje: "Rutina IA guardada con días, bloques, medición y tipos de ejercicio."
    };
  }

  function actualizarEjercicioAvanzado(rutinaId, diaId, ejercicioId, datos = {}) {
    const rutina = obtenerRutinas().find((item) => item.id === rutinaId);
    let ejercicioEncontrado = false;

    if (!rutina) {
      return { ok: false, mensaje: "No se encontró la rutina para editar." };
    }

    const dias = (rutina.dias || []).map((dia) => {
      if (dia.id !== diaId) return dia;

      const ejercicios = (dia.ejercicios || []).map((ejercicio) => {
        if (ejercicio.id !== ejercicioId) return ejercicio;
        ejercicioEncontrado = true;
        return actualizarEjercicioPreservandoIA(ejercicio, datos);
      });

      return {
        ...dia,
        ejercicios,
        descansoGeneralSegundos: obtenerPrimerDescanso({ ejercicios })
      };
    });

    if (!ejercicioEncontrado) {
      return { ok: false, mensaje: "No se encontró el ejercicio para editar." };
    }

    const resultado = entrenamientoService.actualizarRutina(rutinaId, { dias });

    return {
      ...resultado,
      mensaje: resultado.ok ? "Ejercicio actualizado sin perder la estructura IA." : resultado.mensaje
    };
  }

  function activar(rutinaId) {
    return entrenamientoService.activarRutina(rutinaId);
  }

  function seleccionarDia(rutinaId, datos = {}) {
    return entrenamientoService.seleccionarDiaRutina(rutinaId, texto(datos.diaRutinaId));
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

  function borrar(rutinaId) {
    return entrenamientoService.eliminarRutina(rutinaId);
  }

  return {
    obtenerRutinas,
    crearDesdeFormulario,
    crearDesdeRutinaIA,
    actualizarEjercicioAvanzado,
    activar,
    seleccionarDia,
    editarNombre,
    actualizarDesdeFormulario,
    duplicar,
    archivar,
    restaurar,
    borrar
  };
}
