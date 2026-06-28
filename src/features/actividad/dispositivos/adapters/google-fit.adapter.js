import { DISPOSITIVOS_ESTADOS } from "../dispositivos.constants.js";

export function crearGoogleFitAdapter() {
  function prepararConfiguracion(configuracion = {}) {
    const cuenta = String(configuracion.cuenta || "").trim();

    return {
      proveedor: "google-fit",
      listoParaConectar: Boolean(cuenta),
      estado: cuenta ? DISPOSITIVOS_ESTADOS.PREPARADO : DISPOSITIVOS_ESTADOS.PENDIENTE,
      mensaje: cuenta
        ? "Google Fit preparado para autorización futura."
        : "Agrega la cuenta que usarás cuando se implemente la conexión real."
    };
  }

  function normalizarActividadLectura(lectura = {}) {
    return {
      fuente: "google-fit",
      pasos: Number(lectura.pasos || 0),
      bicicletaMin: Number(lectura.bicicletaMin || 0),
      bicicletaKm: Number(lectura.bicicletaKm || 0),
      fecha: lectura.fecha || "",
      idExterno: lectura.idExterno || ""
    };
  }

  return {
    prepararConfiguracion,
    normalizarActividadLectura
  };
}
