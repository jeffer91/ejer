/*
  Nombre completo: hit.service.js
  Ruta o ubicación: src/features/entrenamiento/hit/hit.service.js

  Función o funciones:
    - Registrar HIT, caminata, bicicleta y otro cardio en almacenamiento local.
    - Validar tiempo, distancia, intensidad y rondas.
    - Construir resumen de cardio para la pantalla HIT.

  Se conecta con:
    - src/features/entrenamiento/entrenamiento.service.js
    - src/features/entrenamiento/entrenamiento.constants.js
    - src/features/entrenamiento/hit/hit.controller.js
*/

import { ENTRENAMIENTO_TIPOS_CARDIO } from "../entrenamiento.constants.js";
import { crearEntrenamientoService } from "../entrenamiento.service.js";

function numero(valor, defecto = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
}

function texto(valor, defecto = "") {
  return typeof valor === "string" ? valor.trim() : defecto;
}

function validarCardio(datos = {}) {
  const errores = [];
  const tipo = texto(datos.tipo, ENTRENAMIENTO_TIPOS_CARDIO.OTRO);
  const tiempoMinutos = numero(datos.tiempoMinutos, 0);
  const distanciaKm = datos.distanciaKm === "" || datos.distanciaKm === null ? null : numero(datos.distanciaKm, 0);
  const rondas = numero(datos.rondas, 0);
  const actividadSegundos = numero(datos.actividadSegundos, 0);
  const descansoSegundos = numero(datos.descansoSegundos, 0);

  if (!Object.values(ENTRENAMIENTO_TIPOS_CARDIO).includes(tipo)) {
    errores.push("Selecciona un tipo de cardio válido.");
  }

  if (tiempoMinutos < 1 || tiempoMinutos > 240) {
    errores.push("El tiempo debe estar entre 1 y 240 minutos.");
  }

  if (distanciaKm !== null && distanciaKm < 0) {
    errores.push("La distancia no puede ser negativa.");
  }

  if (tipo === ENTRENAMIENTO_TIPOS_CARDIO.INTERVALOS) {
    if (rondas < 1 || rondas > 50) errores.push("Las rondas deben estar entre 1 y 50.");
    if (actividadSegundos < 5 || actividadSegundos > 900) errores.push("La actividad debe estar entre 5 y 900 segundos.");
    if (descansoSegundos < 5 || descansoSegundos > 900) errores.push("El descanso debe estar entre 5 y 900 segundos.");
  }

  return {
    ok: errores.length === 0,
    errores
  };
}

function limpiarDatos(datos = {}) {
  const tipo = texto(datos.tipo, ENTRENAMIENTO_TIPOS_CARDIO.OTRO);
  const distanciaTexto = datos.distanciaKm === "" || datos.distanciaKm === null || datos.distanciaKm === undefined;

  return {
    tipo,
    tiempoMinutos: numero(datos.tiempoMinutos, 0),
    distanciaKm: distanciaTexto ? null : numero(datos.distanciaKm, 0),
    intensidad: texto(datos.intensidad, "media"),
    rondas: numero(datos.rondas, 0),
    actividadSegundos: numero(datos.actividadSegundos, 0),
    descansoSegundos: numero(datos.descansoSegundos, 0),
    notas: texto(datos.notas)
  };
}

function contarPorTipo(cardio, tipo) {
  return cardio.filter((item) => item.tipo === tipo).length;
}

function sumar(cardio, campo) {
  return cardio.reduce((total, item) => total + Number(item[campo] || 0), 0);
}

export function crearHitService(entrenamientoService = crearEntrenamientoService()) {
  function obtenerEstado() {
    const estado = entrenamientoService.obtenerEstado();
    const cardio = estado.cardio || [];

    return {
      registros: cardio,
      resumen: {
        total: cardio.length,
        tiempoTotalMinutos: sumar(cardio, "tiempoMinutos"),
        distanciaTotalKm: sumar(cardio.filter((item) => item.distanciaKm !== null), "distanciaKm"),
        intervalos: contarPorTipo(cardio, ENTRENAMIENTO_TIPOS_CARDIO.INTERVALOS),
        caminata: contarPorTipo(cardio, ENTRENAMIENTO_TIPOS_CARDIO.CAMINATA),
        bicicleta: contarPorTipo(cardio, ENTRENAMIENTO_TIPOS_CARDIO.BICICLETA),
        otro: contarPorTipo(cardio, ENTRENAMIENTO_TIPOS_CARDIO.OTRO)
      }
    };
  }

  function guardarRegistro(datosFormulario = {}) {
    const datos = limpiarDatos(datosFormulario);
    const validacion = validarCardio(datos);

    if (!validacion.ok) {
      return {
        ok: false,
        mensaje: validacion.errores[0] || "Revisa los datos del cardio.",
        errores: validacion.errores
      };
    }

    return entrenamientoService.guardarCardio(datos);
  }

  return {
    obtenerEstado,
    guardarRegistro
  };
}
