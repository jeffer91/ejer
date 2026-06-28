/*
  Nombre completo: registro.repository.js
  Ruta o ubicación: src/features/control-corporal/registro.repository.js

  Función o funciones:
    - Guardar y leer los datos de Control corporal en almacenamiento local seguro.
    - Mantener una capa de acceso a datos separada de las pantallas.
    - Evitar que JSON dañado o localStorage no disponible rompa la app.
    - Preparar el camino para sincronizar después con Firebase sin cambiar las vistas.

  Se conecta con:
    - src/features/control-corporal/registro.service.js
    - src/features/control-corporal/registro.state.js
    - src/features/control-corporal/registro.constants.js
    - src/core/storage/safe-local-storage.service.js
*/

import { crearSafeLocalStorageService } from "../../core/storage/safe-local-storage.service.js";
import { REGISTRO_STORAGE_KEYS } from "./registro.constants.js";
import { crearEstadoRegistroInicial } from "./registro.state.js";

export function crearRegistroRepository(storage = crearSafeLocalStorageService()) {
  function leerJson(clave, valorDefecto) {
    return storage.leerJson(clave, valorDefecto);
  }

  function guardarJson(clave, valor) {
    storage.guardarJson(clave, valor);
    return valor;
  }

  function obtenerEstado() {
    const inicial = crearEstadoRegistroInicial();

    return {
      ...inicial,
      perfil: leerJson(REGISTRO_STORAGE_KEYS.PERFIL, inicial.perfil),
      objetivo: leerJson(REGISTRO_STORAGE_KEYS.OBJETIVO, inicial.objetivo),
      registros: leerJson(REGISTRO_STORAGE_KEYS.REGISTROS, []),
      historialCambios: leerJson(REGISTRO_STORAGE_KEYS.HISTORIAL_CAMBIOS, []),
      papelera: leerJson(REGISTRO_STORAGE_KEYS.PAPELERA, [])
    };
  }

  function guardarPerfil(perfil) {
    return guardarJson(REGISTRO_STORAGE_KEYS.PERFIL, perfil);
  }

  function guardarObjetivo(objetivo) {
    return guardarJson(REGISTRO_STORAGE_KEYS.OBJETIVO, objetivo);
  }

  function guardarRegistros(registros) {
    return guardarJson(REGISTRO_STORAGE_KEYS.REGISTROS, registros);
  }

  function guardarHistorialCambios(cambios) {
    return guardarJson(REGISTRO_STORAGE_KEYS.HISTORIAL_CAMBIOS, cambios);
  }

  function guardarPapelera(papelera) {
    return guardarJson(REGISTRO_STORAGE_KEYS.PAPELERA, papelera);
  }

  function guardarEstado(estado) {
    guardarPerfil(estado.perfil);
    guardarObjetivo(estado.objetivo);
    guardarRegistros(estado.registros);
    guardarHistorialCambios(estado.historialCambios);
    guardarPapelera(estado.papelera);
    return obtenerEstado();
  }

  return {
    obtenerEstado,
    guardarPerfil,
    guardarObjetivo,
    guardarRegistros,
    guardarHistorialCambios,
    guardarPapelera,
    guardarEstado
  };
}
