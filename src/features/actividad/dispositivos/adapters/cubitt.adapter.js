import { DISPOSITIVOS_ESTADOS } from "../dispositivos.constants.js";

export function crearCubittAdapter() {
  function prepararConfiguracion(configuracion = {}) {
    const identificadorLocal = String(configuracion.identificadorLocal || configuracion.bluetoothId || "").trim();

    return {
      proveedor: "cubitt",
      listoParaConectar: Boolean(identificadorLocal),
      estado: identificadorLocal ? DISPOSITIVOS_ESTADOS.PREPARADO : DISPOSITIVOS_ESTADOS.PENDIENTE,
      mensaje: identificadorLocal
        ? "Cubitt CT4 anexado localmente. Ahora puedes probar conexión Bluetooth."
        : "Pulsa Escanear y anexar reloj para guardar el Cubitt CT4 en esta PC."
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
