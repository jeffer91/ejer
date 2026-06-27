/*
  Nombre completo: entrenamiento.service.js
  Ruta o ubicación: src/features/entrenamiento/entrenamiento.service.js

  Función o funciones:
    - Coordinar la lógica principal del módulo Entrenamiento.
    - Guardar, actualizar, activar y eliminar rutinas usando repository.
    - Guardar sesiones, cardio y ajustes usando repository.
    - Calcular resumen básico para Stats y Diario.
*/

import {
  ENTRENAMIENTO_DIAS,
  ENTRENAMIENTO_ESTADOS_RUTINA,
  ENTRENAMIENTO_ESTADOS_SESION,
  ENTRENAMIENTO_TIPOS_CARDIO
} from "./entrenamiento.constants.js";
import { crearEntrenamientoRepository } from "./entrenamiento.repository.js";
import {
  crearCambioEntrenamientoBase,
  crearCardioEntrenamientoBase,
  crearRutinaEntrenamientoBase,
  crearSesionEntrenamientoBase,
  fechaEntrenamientoHoy
} from "./entrenamiento.state.js";
import {
  normalizarAjustesEntrenamiento,
  normalizarCardioEntrenamiento,
  normalizarRutinaEntrenamiento,
  normalizarSesionEntrenamiento
} from "./entrenamiento.schema.tiempo.js";

function ordenarPorFechaDesc(a, b) {
  return String(b.fecha || b.creadoEn || "").localeCompare(String(a.fecha || a.creadoEn || ""));
}

function mismaFecha(registro, fecha) {
  return registro.fecha === fecha;
}

function sumar(lista, campo) {
  return lista.reduce((total, item) => total + Number(item[campo] || 0), 0);
}

function obtenerDiaSemanaActual() {
  return ENTRENAMIENTO_DIAS[new Date().getDay()];
}

export function crearEntrenamientoService(repository = crearEntrenamientoRepository()) {
  function obtenerEstado() {
    return repository.obtenerEstado();
  }

  function registrarCambio(estado, cambio) {
    const historial = [crearCambioEntrenamientoBase(cambio), ...(estado.historial || [])];
    repository.guardarHistorial(historial);
    return historial;
  }

  function guardarRutina(datosRutina) {
    const estado = obtenerEstado();
    const rutina = normalizarRutinaEntrenamiento(crearRutinaEntrenamientoBase(datosRutina));
    const rutinas = [rutina, ...estado.rutinas];

    repository.guardarRutinas(rutinas);
    registrarCambio(estado, {
      accion: "crear-rutina",
      entidad: "rutina",
      entidadId: rutina.id,
      despues: rutina
    });

    return {
      ok: true,
      mensaje: "Rutina guardada.",
      rutina
    };
  }

  function actualizarRutina(rutinaId, cambios) {
    const estado = obtenerEstado();
    const anterior = estado.rutinas.find((rutina) => rutina.id === rutinaId);

    if (!anterior) {
      return { ok: false, mensaje: "No se encontró la rutina." };
    }

    const rutinas = estado.rutinas.map((rutina) => {
      if (rutina.id !== rutinaId) return rutina;
      return normalizarRutinaEntrenamiento({ ...rutina, ...cambios, id: rutina.id, creadoEn: rutina.creadoEn });
    });
    const actualizada = rutinas.find((rutina) => rutina.id === rutinaId);

    repository.guardarRutinas(rutinas);
    registrarCambio(estado, {
      accion: "actualizar-rutina",
      entidad: "rutina",
      entidadId: rutinaId,
      antes: anterior,
      despues: actualizada
    });

    return {
      ok: true,
      mensaje: "Rutina actualizada.",
      rutina: actualizada
    };
  }

  function eliminarRutina(rutinaId) {
    const estado = obtenerEstado();
    const anterior = estado.rutinas.find((rutina) => rutina.id === rutinaId);

    if (!anterior) {
      return { ok: false, mensaje: "No se encontró la rutina para borrar." };
    }

    const rutinas = estado.rutinas.filter((rutina) => rutina.id !== rutinaId);
    const sesionesRelacionadas = estado.sesiones.filter((sesion) => sesion.rutinaId === rutinaId).length;

    repository.guardarRutinas(rutinas);
    registrarCambio(estado, {
      accion: "eliminar-rutina",
      entidad: "rutina",
      entidadId: rutinaId,
      antes: anterior,
      despues: {
        eliminada: true,
        sesionesRelacionadas
      }
    });

    return {
      ok: true,
      mensaje: sesionesRelacionadas > 0
        ? `Rutina borrada. Se conservaron ${sesionesRelacionadas} sesión(es) históricas.`
        : "Rutina borrada definitivamente.",
      rutina: anterior
    };
  }

  function activarRutina(rutinaId) {
    const estado = obtenerEstado();
    let encontrada = null;

    const rutinas = estado.rutinas.map((rutina) => {
      const activa = rutina.id === rutinaId;
      const nuevaRutina = normalizarRutinaEntrenamiento({
        ...rutina,
        estado: activa ? ENTRENAMIENTO_ESTADOS_RUTINA.ACTIVA : ENTRENAMIENTO_ESTADOS_RUTINA.INACTIVA
      });

      if (activa) encontrada = nuevaRutina;
      return nuevaRutina;
    });

    if (!encontrada) {
      return { ok: false, mensaje: "No se encontró la rutina." };
    }

    repository.guardarRutinas(rutinas);
    registrarCambio(estado, {
      accion: "activar-rutina",
      entidad: "rutina",
      entidadId: rutinaId,
      despues: encontrada
    });

    return {
      ok: true,
      mensaje: "Rutina activada.",
      rutina: encontrada
    };
  }

  function obtenerRutinaActiva() {
    const estado = obtenerEstado();
    return estado.rutinas.find((rutina) => rutina.estado === ENTRENAMIENTO_ESTADOS_RUTINA.ACTIVA) || null;
  }

  function obtenerRutinaDelDia() {
    const rutina = obtenerRutinaActiva();

    if (!rutina) {
      return {
        rutina: null,
        dia: null,
        diaSemana: obtenerDiaSemanaActual()
      };
    }

    const indice = new Date().getDay() % Math.max(rutina.dias.length, 1);

    return {
      rutina,
      dia: rutina.dias[indice] || rutina.dias[0] || null,
      diaSemana: obtenerDiaSemanaActual()
    };
  }

  function guardarSesion(datosSesion) {
    const estado = obtenerEstado();
    const sesion = normalizarSesionEntrenamiento(crearSesionEntrenamientoBase(datosSesion));
    const sesiones = [sesion, ...estado.sesiones].sort(ordenarPorFechaDesc);

    repository.guardarSesiones(sesiones);
    registrarCambio(estado, {
      accion: "guardar-sesion",
      entidad: "sesion",
      entidadId: sesion.id,
      despues: sesion
    });

    return {
      ok: true,
      mensaje: "Sesión guardada.",
      sesion
    };
  }

  function actualizarSesion(sesionId, cambios) {
    const estado = obtenerEstado();
    const anterior = estado.sesiones.find((sesion) => sesion.id === sesionId);

    if (!anterior) {
      return { ok: false, mensaje: "No se encontró la sesión." };
    }

    const sesiones = estado.sesiones.map((sesion) => {
      if (sesion.id !== sesionId) return sesion;
      return normalizarSesionEntrenamiento({
        ...sesion,
        ...cambios,
        id: sesion.id,
        creadoEn: sesion.creadoEn
      });
    }).sort(ordenarPorFechaDesc);
    const actualizada = sesiones.find((sesion) => sesion.id === sesionId);

    repository.guardarSesiones(sesiones);
    registrarCambio(estado, {
      accion: "actualizar-sesion",
      entidad: "sesion",
      entidadId: sesionId,
      antes: anterior,
      despues: actualizada
    });

    return {
      ok: true,
      mensaje: "Sesión actualizada.",
      sesion: actualizada
    };
  }

  function completarSesion(datosSesion = {}) {
    if (datosSesion.id) {
      return actualizarSesion(datosSesion.id, {
        ...datosSesion,
        estado: ENTRENAMIENTO_ESTADOS_SESION.COMPLETADA
      });
    }

    return guardarSesion({
      ...datosSesion,
      estado: ENTRENAMIENTO_ESTADOS_SESION.COMPLETADA
    });
  }

  function guardarCardio(datosCardio) {
    const estado = obtenerEstado();
    const cardio = normalizarCardioEntrenamiento(crearCardioEntrenamientoBase(datosCardio));
    const registros = [cardio, ...estado.cardio].sort(ordenarPorFechaDesc);

    repository.guardarCardio(registros);
    registrarCambio(estado, {
      accion: "guardar-cardio",
      entidad: "cardio",
      entidadId: cardio.id,
      despues: cardio
    });

    return {
      ok: true,
      mensaje: "Cardio guardado.",
      cardio
    };
  }

  function guardarAjustes(datosAjustes) {
    const estado = obtenerEstado();
    const ajustes = normalizarAjustesEntrenamiento({
      ...estado.ajustes,
      ...datosAjustes
    });

    repository.guardarAjustes(ajustes);
    registrarCambio(estado, {
      accion: "guardar-ajustes",
      entidad: "ajustes",
      despues: {
        iaActiva: ajustes.iaActiva,
        vozActiva: ajustes.vozActiva,
        vozNombre: ajustes.vozNombre,
        tieneGemini: Boolean(ajustes.geminiApiKey)
      }
    });

    return {
      ok: true,
      mensaje: "Ajustes guardados.",
      ajustes
    };
  }

  function obtenerResumen() {
    const estado = obtenerEstado();
    const hoy = fechaEntrenamientoHoy();
    const sesionesCompletadas = estado.sesiones.filter((sesion) => sesion.estado === ENTRENAMIENTO_ESTADOS_SESION.COMPLETADA);
    const sesionesHoy = estado.sesiones.filter((sesion) => mismaFecha(sesion, hoy));
    const cardioHoy = estado.cardio.filter((item) => mismaFecha(item, hoy));
    const caminatas = estado.cardio.filter((item) => item.tipo === ENTRENAMIENTO_TIPOS_CARDIO.CAMINATA).length;
    const bicicleta = estado.cardio.filter((item) => item.tipo === ENTRENAMIENTO_TIPOS_CARDIO.BICICLETA).length;
    const intervalos = estado.cardio.filter((item) => item.tipo === ENTRENAMIENTO_TIPOS_CARDIO.INTERVALOS).length;

    return {
      totalRutinas: estado.rutinas.length,
      rutinasActivas: estado.rutinas.filter((rutina) => rutina.estado === ENTRENAMIENTO_ESTADOS_RUTINA.ACTIVA).length,
      totalSesiones: estado.sesiones.length,
      sesionesCompletadas: sesionesCompletadas.length,
      sesionesHoy: sesionesHoy.length,
      cardioHoy: cardioHoy.length,
      ejerciciosCompletados: sumar(sesionesCompletadas, "ejerciciosCompletados"),
      seriesCompletadas: sumar(sesionesCompletadas, "seriesCompletadas"),
      repeticionesCompletadas: sumar(sesionesCompletadas, "repeticionesCompletadas"),
      tiempoTotalMinutos: sumar(sesionesCompletadas, "tiempoMinutos") + sumar(estado.cardio, "tiempoMinutos"),
      caminatas,
      bicicleta,
      intervalos,
      iaActiva: estado.ajustes.iaActiva,
      vozActiva: estado.ajustes.vozActiva,
      tieneGemini: Boolean(estado.ajustes.geminiApiKey)
    };
  }

  return {
    obtenerEstado,
    guardarRutina,
    actualizarRutina,
    eliminarRutina,
    activarRutina,
    obtenerRutinaActiva,
    obtenerRutinaDelDia,
    guardarSesion,
    actualizarSesion,
    completarSesion,
    guardarCardio,
    guardarAjustes,
    obtenerResumen
  };
}
