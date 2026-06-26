/*
  Nombre completo: registro.state.js
  Ruta o ubicación: src/features/control-corporal/registro.state.js

  Función o funciones:
    - Crear el estado inicial del módulo Control corporal.
    - Mantener separados perfil, objetivo, registros, cambios y papelera.
    - Entregar copias seguras para evitar modificaciones accidentales.

  Se conecta con:
    - src/features/control-corporal/registro.service.js
    - src/features/control-corporal/registro.constants.js
*/

import { ESTADOS_DATO } from "./registro.constants.js";

export function crearEstadoRegistroInicial() {
  return {
    perfil: {
      alturaCm: null,
      fechaNacimiento: "",
      configurado: false,
      actualizadoEn: ""
    },
    objetivo: {
      pesoObjetivoKg: null,
      ritmoInteligente: true,
      actualizadoEn: ""
    },
    registros: [],
    historialCambios: [],
    papelera: [],
    estado: {
      datosAlDia: true,
      pendienteSubir: false,
      ultimoMensaje: "Datos al día",
      ultimoErrorSimple: "",
      ultimoErrorInterno: ""
    }
  };
}

export function clonarEstadoRegistro(estado) {
  return JSON.parse(JSON.stringify(estado || crearEstadoRegistroInicial()));
}

export function crearRegistroBase(tipo, datos) {
  const fechaActual = new Date().toISOString();

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `registro-${Date.now()}`,
    tipo,
    fecha: datos?.fecha || fechaActual.slice(0, 10),
    creadoEn: fechaActual,
    actualizadoEn: fechaActual,
    estado: ESTADOS_DATO.NORMAL,
    datos: datos || {},
    origen: "fitjeff"
  };
}

export function crearCambioRegistro({ registroId, accion, antes, despues }) {
  const fechaActual = new Date().toISOString();

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `cambio-${Date.now()}`,
    registroId,
    accion,
    antes: antes || null,
    despues: despues || null,
    creadoEn: fechaActual
  };
}
