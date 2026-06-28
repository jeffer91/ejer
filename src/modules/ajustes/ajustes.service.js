/*
  Nombre completo: ajustes.service.js
  Ruta o ubicación: src/modules/ajustes/ajustes.service.js

  Función o funciones:
    - Leer perfil y objetivo actuales desde Control corporal.
    - Guardar cambios de altura, fecha de nacimiento y peso objetivo.
    - Permitir reabrir Inicio sin borrar los datos guardados.
    - Usar almacenamiento seguro para cambiar el estado de Inicio.

  Se conecta con:
    - src/features/control-corporal/registro.service.js
    - src/features/control-corporal/inicio/inicio.validator.js
    - src/core/storage/safe-local-storage.service.js
    - src/modules/ajustes/ajustes.constants.js
    - src/modules/ajustes/ajustes.controller.js
*/

import { convertirAlturaACm, convertirPesoAKg } from "../../features/control-corporal/inicio/inicio.validator.js";
import { crearRegistroService } from "../../features/control-corporal/registro.service.js";
import { crearSafeLocalStorageService } from "../../core/storage/safe-local-storage.service.js";
import { AJUSTES_STORAGE_KEYS } from "./ajustes.constants.js";

function fechaNacimientoValida(fecha) {
  if (!fecha) {
    return false;
  }

  const valor = new Date(fecha);
  return !Number.isNaN(valor.getTime()) && valor < new Date();
}

export function crearAjustesService(registroService = crearRegistroService(), storage = crearSafeLocalStorageService()) {
  function obtenerDatos() {
    const estado = registroService.obtenerEstado();

    return {
      perfil: estado.perfil || {},
      objetivo: estado.objetivo || {}
    };
  }

  function guardarPerfil(datos) {
    const errores = {};
    const alturaCm = convertirAlturaACm(datos.alturaCm);

    if (!alturaCm || alturaCm < 100 || alturaCm > 230) {
      errores.alturaCm = "Escribe una altura válida.";
    }

    if (!fechaNacimientoValida(datos.fechaNacimiento)) {
      errores.fechaNacimiento = "Escribe una fecha de nacimiento válida.";
    }

    if (Object.keys(errores).length > 0) {
      return {
        ok: false,
        mensaje: "Revisa los datos antes de guardar.",
        errores
      };
    }

    registroService.guardarPerfil({
      alturaCm,
      fechaNacimiento: datos.fechaNacimiento
    });

    return {
      ok: true,
      mensaje: "Perfil actualizado.",
      errores: {}
    };
  }

  function guardarObjetivo(datos) {
    const errores = {};
    const pesoObjetivoKg = convertirPesoAKg(datos.pesoObjetivoKg);

    if (!pesoObjetivoKg || pesoObjetivoKg < 30 || pesoObjetivoKg > 250) {
      errores.pesoObjetivoKg = "Escribe un peso objetivo válido.";
    }

    if (Object.keys(errores).length > 0) {
      return {
        ok: false,
        mensaje: "Revisa los datos antes de guardar.",
        errores
      };
    }

    registroService.guardarObjetivo({
      pesoObjetivoKg,
      ritmoInteligente: true
    });

    return {
      ok: true,
      mensaje: "Objetivo actualizado.",
      errores: {}
    };
  }

  function reabrirInicio() {
    storage.eliminar(AJUSTES_STORAGE_KEYS.INICIO_COMPLETADO);
    return {
      ok: true,
      mensaje: "Inicio listo para abrirse otra vez."
    };
  }

  return {
    obtenerDatos,
    guardarPerfil,
    guardarObjetivo,
    reabrirInicio
  };
}
