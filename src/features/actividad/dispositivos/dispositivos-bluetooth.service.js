/*
  Nombre completo: dispositivos-bluetooth.service.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos-bluetooth.service.js

  Función o funciones:
    - Usar Web Bluetooth para anexar un reloj Cubitt CT4 desde la app.
    - Probar conexión básica GATT sin prometer lectura automática de pasos.
    - Leer datos seguros de diagnóstico: batería e información del dispositivo cuando estén disponibles.
    - Devolver mensajes claros para que la pantalla Dispositivos pueda guiar al usuario.

  Se conecta con:
    - src/features/actividad/dispositivos/dispositivos.service.js
    - electron/electron-window.service.js
*/

const SERVICIOS_OPCIONALES = Object.freeze([
  "battery_service",
  "device_information",
  "heart_rate"
]);

const NOMBRE_RELOJ_ESPERADO = /cubitt|ct4/i;

let ultimoDispositivoBluetooth = null;

function ahoraIso() {
  return new Date().toISOString();
}

function limpiarTexto(valor, max = 160) {
  return String(valor || "").trim().slice(0, max);
}

function crearError(mensaje, error = null) {
  return {
    ok: false,
    mensaje,
    errorNombre: error?.name || "",
    errorDetalle: limpiarTexto(error?.message || "", 260),
    creadoEn: ahoraIso()
  };
}

function bluetoothDisponible() {
  return Boolean(typeof navigator !== "undefined" && navigator.bluetooth && typeof navigator.bluetooth.requestDevice === "function");
}

function normalizarDispositivo(device) {
  return {
    id: limpiarTexto(device?.id || ""),
    nombre: limpiarTexto(device?.name || "Dispositivo Bluetooth"),
    gattDisponible: Boolean(device?.gatt),
    coincideCubitt: NOMBRE_RELOJ_ESPERADO.test(device?.name || ""),
    detectadoEn: ahoraIso()
  };
}

function explicarErrorBluetooth(error) {
  if (!error) {
    return "No se pudo completar la acción Bluetooth.";
  }

  if (error.name === "NotFoundError") {
    return "No se seleccionó ningún reloj. Vuelve a escanear y elige Cubitt CT4.";
  }

  if (error.name === "NotAllowedError" || error.name === "SecurityError") {
    return "Bluetooth fue bloqueado por permisos. Activa Bluetooth y permite el acceso desde FitJeff.";
  }

  if (error.name === "NetworkError") {
    return "FitJeff encontró el reloj, pero no pudo conectar. Acerca el reloj, revisa que tenga batería y vuelve a probar.";
  }

  if (error.name === "NotSupportedError") {
    return "Este entorno no permite Web Bluetooth. Abre FitJeff desde Electron actualizado o desde un navegador compatible.";
  }

  return `Bluetooth no respondió correctamente: ${limpiarTexto(error.message || error.name || "error desconocido", 180)}`;
}

function bufferAHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ");
}

function leerTextoDesdeDataView(dataView) {
  try {
    return new TextDecoder("utf-8").decode(dataView.buffer).replace(/\0/g, "").trim();
  } catch (_error) {
    return bufferAHex(dataView.buffer);
  }
}

async function obtenerDispositivoGuardado({ id = "", nombre = "" } = {}) {
  if (ultimoDispositivoBluetooth) {
    return ultimoDispositivoBluetooth;
  }

  if (typeof navigator?.bluetooth?.getDevices !== "function") {
    return null;
  }

  const permitidos = await navigator.bluetooth.getDevices();
  const idLimpio = limpiarTexto(id);
  const nombreLimpio = limpiarTexto(nombre).toLowerCase();

  return permitidos.find((device) => {
    const mismoId = idLimpio && device.id === idLimpio;
    const mismoNombre = nombreLimpio && limpiarTexto(device.name).toLowerCase() === nombreLimpio;
    return mismoId || mismoNombre;
  }) || null;
}

async function leerCaracteristicaTexto(servicio, caracteristicaUuid) {
  try {
    const caracteristica = await servicio.getCharacteristic(caracteristicaUuid);
    const valor = await caracteristica.readValue();
    return leerTextoDesdeDataView(valor);
  } catch (_error) {
    return "";
  }
}

async function leerDiagnosticoBasico(server) {
  const diagnostico = {
    bateria: null,
    fabricante: "",
    modelo: "",
    serviciosLeidos: [],
    lecturaHex: {}
  };

  try {
    const servicioBateria = await server.getPrimaryService("battery_service");
    const caracteristicaBateria = await servicioBateria.getCharacteristic("battery_level");
    const valorBateria = await caracteristicaBateria.readValue();
    diagnostico.bateria = valorBateria.getUint8(0);
    diagnostico.serviciosLeidos.push("battery_service");
    diagnostico.lecturaHex.battery_level = bufferAHex(valorBateria.buffer);
  } catch (_error) {
    // Algunos relojes antiguos no exponen batería estándar. No bloquea el anexado.
  }

  try {
    const servicioInfo = await server.getPrimaryService("device_information");
    diagnostico.fabricante = await leerCaracteristicaTexto(servicioInfo, "manufacturer_name_string");
    diagnostico.modelo = await leerCaracteristicaTexto(servicioInfo, "model_number_string");
    diagnostico.serviciosLeidos.push("device_information");
  } catch (_error) {
    // Puede existir un protocolo privado sin información estándar.
  }

  return diagnostico;
}

export function crearDispositivosBluetoothService() {
  async function solicitarCubitt() {
    if (!bluetoothDisponible()) {
      return crearError("Bluetooth no está disponible en este entorno. Abre FitJeff en Electron y verifica que Bluetooth esté activo en Windows.");
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: SERVICIOS_OPCIONALES
      });

      ultimoDispositivoBluetooth = device;
      const dispositivo = normalizarDispositivo(device);

      return {
        ok: true,
        mensaje: dispositivo.coincideCubitt
          ? "Cubitt CT4 anexado. Ahora puedes probar conexión."
          : "Dispositivo anexado. Si no es Cubitt CT4, vuelve a escanear y selecciona el reloj correcto.",
        dispositivo,
        creadoEn: ahoraIso()
      };
    } catch (error) {
      return crearError(explicarErrorBluetooth(error), error);
    }
  }

  async function probarConexionCubitt(configuracion = {}) {
    if (!bluetoothDisponible()) {
      return crearError("Bluetooth no está disponible en este entorno. Abre FitJeff en Electron y verifica que Bluetooth esté activo en Windows.");
    }

    try {
      const device = await obtenerDispositivoGuardado({
        id: configuracion.bluetoothId || configuracion.identificadorLocal,
        nombre: configuracion.bluetoothNombre || configuracion.alias
      });

      if (!device) {
        return crearError("No encontré un reloj autorizado en esta sesión. Primero pulsa Escanear y anexar reloj.");
      }

      ultimoDispositivoBluetooth = device;

      if (!device.gatt) {
        return crearError("El reloj fue detectado, pero no expone conexión GATT desde este entorno.");
      }

      const server = await device.gatt.connect();
      const diagnostico = await leerDiagnosticoBasico(server);
      const conectado = Boolean(server.connected);

      if (server.connected) {
        server.disconnect();
      }

      return {
        ok: true,
        mensaje: diagnostico.serviciosLeidos.length
          ? "Conexión Bluetooth correcta. FitJeff pudo leer diagnóstico básico del reloj."
          : "Conexión Bluetooth correcta, pero el reloj no entregó servicios estándar. El siguiente bloque debe explorar protocolo privado.",
        dispositivo: normalizarDispositivo(device),
        conectado,
        diagnostico,
        creadoEn: ahoraIso()
      };
    } catch (error) {
      return crearError(explicarErrorBluetooth(error), error);
    }
  }

  return {
    solicitarCubitt,
    probarConexionCubitt
  };
}
