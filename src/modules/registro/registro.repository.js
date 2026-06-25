/*
  Nombre completo: registro.repository.js
  Ruta o ubicación: src/modules/registro/registro.repository.js

  Función o funciones:
    - Guardar y leer los datos del módulo Registro en almacenamiento local.
    - Mantener una capa de acceso a datos separada de las pantallas.
    - Preparar el camino para sincronizar después con Firebase sin cambiar las vistas.

  Se conecta con:
    - src/modules/registro/registro.service.js
    - src/modules/registro/registro.state.js
    - src/modules/registro/registro.constants.js
*/

import { REGISTRO_STORAGE_KEYS } from "./registro.constants.js";
import { crearEstadoRegistroInicial } from "./registro.state.js";

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
}

export function crearRegistroRepository() {
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
    guardarJson(REGISTRO_STORAGE_KEYS.PERFIL, perfil);
    return perfil;
  }

  function guardarObjetivo(objetivo) {
    guardarJson(REGISTRO_STORAGE_KEYS.OBJETIVO, objetivo);
    return objetivo;
  }

  function guardarRegistros(registros) {
    guardarJson(REGISTRO_STORAGE_KEYS.REGISTROS, registros);
    return registros;
  }

  function guardarHistorialCambios(cambios) {
    guardarJson(REGISTRO_STORAGE_KEYS.HISTORIAL_CAMBIOS, cambios);
    return cambios;
  }

  function guardarPapelera(papelera) {
    guardarJson(REGISTRO_STORAGE_KEYS.PAPELERA, papelera);
    return papelera;
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
