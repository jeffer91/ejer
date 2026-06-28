import { DISPOSITIVOS_ESTADOS } from "../dispositivos.constants.js";

export function crearCubittAdapter() {
  function prepararConfiguracion(configuracion = {}) {
    const identificadorLocal = String(configuracion.identificadorLocal || "").trim();

    return {
      proveedor: "cubitt",
      listoParaConectar: Boolean(identificadorLocal),
      estado: identificadorLocal ? DISPOSITIVOS_ESTADOS.PREPARADO : DISPOSITIVOS_ESTADOS.PENDIENTE,
      mensaje: identificadorLocal
        ? "Cubitt CT4 preparado para un conector real futuro."
        : "Escribe el identificador local del reloj desde la app para dejarlo preparado."
    };
  }

  function normalizarActividadLectura(lectura = {}) {
    return {
      fuente: "cubitt",
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
