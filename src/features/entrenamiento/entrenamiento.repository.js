/*
  Nombre completo: entrenamiento.repository.js
  Ruta o ubicación: src/features/entrenamiento/entrenamiento.repository.js

  Función o funciones:
    - Leer y guardar los datos de Entrenamiento en almacenamiento local.
    - Separar el acceso a datos de las pantallas y servicios.
    - Preparar sincronización futura sin cambiar la interfaz visual.
*/

import { ENTRENAMIENTO_STORAGE_KEYS } from "./entrenamiento.constants.js";
import { crearEstadoEntrenamientoInicial } from "./entrenamiento.state.js";
import {
  normalizarAjustesEntrenamiento,
  normalizarCardioEntrenamiento,
  normalizarRutinaEntrenamiento,
  normalizarSesionEntrenamiento
} from "./entrenamiento.schema.js";

function leerJson(clave, valorDefecto) {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? JSON.parse(texto) : valorDefecto;
  } catch {
    return valorDefecto;
  }
}

function guardarJson(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
  return valor;
}

function normalizarLista(valor, normalizador) {
  return Array.isArray(valor) ? valor.map(normalizador) : [];
}

export function crearEntrenamientoRepository() {
  function obtenerEstado() {
    const inicial = crearEstadoEntrenamientoInicial();

    return {
      ...inicial,
      rutinas: normalizarLista(leerJson(ENTRENAMIENTO_STORAGE_KEYS.RUTINAS, []), normalizarRutinaEntrenamiento),
      sesiones: normalizarLista(leerJson(ENTRENAMIENTO_STORAGE_KEYS.SESIONES, []), normalizarSesionEntrenamiento),
      cardio: normalizarLista(leerJson(ENTRENAMIENTO_STORAGE_KEYS.CARDIO, []), normalizarCardioEntrenamiento),
      ajustes: normalizarAjustesEntrenamiento(leerJson(ENTRENAMIENTO_STORAGE_KEYS.AJUSTES, inicial.ajustes)),
      historial: leerJson(ENTRENAMIENTO_STORAGE_KEYS.HISTORIAL, [])
    };
  }

  function guardarRutinas(rutinas) {
    return guardarJson(ENTRENAMIENTO_STORAGE_KEYS.RUTINAS, normalizarLista(rutinas, normalizarRutinaEntrenamiento));
  }

  function guardarSesiones(sesiones) {
    return guardarJson(ENTRENAMIENTO_STORAGE_KEYS.SESIONES, normalizarLista(sesiones, normalizarSesionEntrenamiento));
  }

  function guardarCardio(cardio) {
    return guardarJson(ENTRENAMIENTO_STORAGE_KEYS.CARDIO, normalizarLista(cardio, normalizarCardioEntrenamiento));
  }

  function guardarAjustes(ajustes) {
    return guardarJson(ENTRENAMIENTO_STORAGE_KEYS.AJUSTES, normalizarAjustesEntrenamiento(ajustes));
  }

  function guardarHistorial(historial) {
    return guardarJson(ENTRENAMIENTO_STORAGE_KEYS.HISTORIAL, Array.isArray(historial) ? historial : []);
  }

  function guardarEstado(estado) {
    guardarRutinas(estado.rutinas);
    guardarSesiones(estado.sesiones);
    guardarCardio(estado.cardio);
    guardarAjustes(estado.ajustes);
    guardarHistorial(estado.historial);
    return obtenerEstado();
  }

  function limpiarTodo() {
    Object.values(ENTRENAMIENTO_STORAGE_KEYS).forEach((clave) => localStorage.removeItem(clave));
    return obtenerEstado();
  }

  return {
    obtenerEstado,
    guardarRutinas,
    guardarSesiones,
    guardarCardio,
    guardarAjustes,
    guardarHistorial,
    guardarEstado,
    limpiarTodo
  };
}
