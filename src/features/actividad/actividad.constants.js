/*
  Nombre completo: actividad.constants.js
  Ruta o ubicación: src/features/actividad/actividad.constants.js

  Función o funciones:
    - Centralizar claves, textos, tipos y límites de Actividad.
    - Mantener los mensajes visibles separados de la lógica.
    - Usar fecha local para el registro diario.

  Se conecta con:
    - src/features/actividad/actividad.service.js
    - src/features/actividad/actividad.repository.js
    - src/features/actividad/registro/registro.view.js
    - src/core/utils/date.util.js
*/

import { obtenerFechaHoyISO } from "../../core/utils/date.util.js";

export const ACTIVIDAD_STORAGE_KEY = "fitjeff:actividad:registros";

export const ACTIVIDAD_TIPOS = Object.freeze({
  PASOS: "pasos",
  BICICLETA: "bicicleta",
  MIXTO: "mixto"
});

export const ACTIVIDAD_LIMITES = Object.freeze({
  PASOS_MAX: 100000,
  BICICLETA_MIN_MAX: 600,
  BICICLETA_KM_MAX: 500,
  NOTA_MAX: 180
});

export const ACTIVIDAD_TEXTOS = Object.freeze({
  RESUMEN_TITULO: "Actividad",
  RESUMEN_SUBTITULO: "Registra pasos y bicicleta de forma manual. También puedes dejar preparado Cubitt CT4 y Google Fit.",
  REGISTRO_TITULO: "Registrar actividad",
  REGISTRO_SUBTITULO: "Guarda tus pasos, bicicleta o ambos. Si ya existe actividad en esa fecha, se actualizará el registro del día.",
  BOTON_GUARDAR: "Guardar actividad",
  EXITO: "Actividad guardada.",
  EXITO_ACTUALIZADO: "Actividad actualizada para esa fecha.",
  AVISO_EXISTE: "Ya existe actividad guardada para esta fecha. Si guardas, se actualizará el registro del día.",
  ERROR_SIN_DATOS: "Ingresa pasos, minutos de bicicleta o distancia para guardar.",
  ERROR_FECHA: "Selecciona una fecha válida.",
  ERROR_FECHA_FUTURA: "No guardes actividad en fechas futuras.",
  ERROR_RANGO: "El valor ingresado está fuera del rango permitido."
});

export function fechaHoyISO() {
  return obtenerFechaHoyISO();
}
