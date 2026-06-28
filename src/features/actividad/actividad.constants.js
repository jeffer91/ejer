import { obtenerFechaHoyISO } from "../../core/utils/date.util.js";

export const ACTIVIDAD_STORAGE_KEY = "fitjeff:actividad:registros";

export const ACTIVIDAD_TIPOS = Object.freeze({
  PASOS: "pasos",
  BICICLETA: "bicicleta",
  MIXTO: "mixto"
});

export const ACTIVIDAD_TEXTOS = Object.freeze({
  RESUMEN_TITULO: "Actividad",
  RESUMEN_SUBTITULO: "Registra pasos y bicicleta de forma manual. También puedes dejar preparado Cubitt CT4 y Google Fit.",
  REGISTRO_TITULO: "Registrar actividad",
  REGISTRO_SUBTITULO: "Guarda tus pasos, bicicleta o ambos. No necesitas completar todo.",
  BOTON_GUARDAR: "Guardar actividad",
  EXITO: "Actividad guardada.",
  ERROR_SIN_DATOS: "Ingresa pasos, minutos de bicicleta o distancia para guardar.",
  ERROR_FECHA: "Selecciona una fecha válida."
});

export function fechaHoyISO() {
  return obtenerFechaHoyISO();
}
