/*
  Nombre completo: inicio.service.js
  Ruta o ubicacion: src/features/control-corporal/inicio/inicio.service.js

  Funcion o funciones:
    - Guardar la configuracion inicial de FitJeff.
    - Crear perfil, objetivo y primer registro de peso.
    - Guardar contexto muscular para análisis corporal inteligente.
    - Marcar el Inicio como completado para abrir Hoy por defecto.
    - Usar fecha local para el primer registro de peso.
    - Usar almacenamiento seguro para el estado de Inicio.

  Se conecta con:
    - src/features/control-corporal/inicio/inicio.validator.js
    - src/features/control-corporal/inicio/inicio.constants.js
    - src/features/control-corporal/registro.service.js
    - src/core/utils/date.util.js
    - src/core/storage/safe-local-storage.service.js
*/

import { obtenerFechaHoyISO } from "../../../core/utils/date.util.js";
import { crearSafeLocalStorageService } from "../../../core/storage/safe-local-storage.service.js";
import { INICIO_STORAGE_KEYS } from "./inicio.constants.js";
import { validarInicio } from "./inicio.validator.js";
import { crearRegistroService } from "../registro.service.js";

function fechaHoy() {
  return obtenerFechaHoyISO();
}

export function crearInicioService(registroService = crearRegistroService(), storage = crearSafeLocalStorageService()) {
  function estaCompletado() {
    return storage.leerTexto(INICIO_STORAGE_KEYS.COMPLETADO, "") === "true";
  }

  function marcarCompletado() {
    storage.guardarTexto(INICIO_STORAGE_KEYS.COMPLETADO, "true");
  }

  function guardarConfiguracionInicial(datos) {
    const validacion = validarInicio(datos);

    if (!validacion.ok) {
      return {
        ok: false,
        mensaje: "Revisa los datos antes de continuar.",
        errores: validacion.errores
      };
    }

    const datosLimpios = validacion.datosLimpios;

    registroService.guardarPerfil({
      alturaCm: datosLimpios.alturaCm,
      fechaNacimiento: datosLimpios.fechaNacimiento,
      nivelMuscular: datosLimpios.nivelMuscular
    });

    registroService.guardarObjetivo({
      pesoObjetivoKg: datosLimpios.pesoObjetivoKg,
      ritmoInteligente: true
    });

    const pesoGuardado = registroService.guardarPeso({
      pesoKg: datosLimpios.pesoInicialKg,
      fecha: fechaHoy(),
      origen: "inicio"
    });

    marcarCompletado();

    return {
      ok: true,
      mensaje: "Perfil inicial guardado. Abriendo Hoy.",
      pesoGuardado
    };
  }

  return {
    estaCompletado,
    marcarCompletado,
    guardarConfiguracionInicial
  };
}
