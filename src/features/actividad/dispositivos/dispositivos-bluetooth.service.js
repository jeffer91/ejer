/*
  Nombre completo: dispositivos-bluetooth.service.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos-bluetooth.service.js

  Función o funciones:
    - Usar Web Bluetooth para anexar un reloj Cubitt CT4 desde la app.
    - Probar conexión básica GATT sin prometer lectura automática de pasos.
    - Explorar servicios privados candidatos del reloj con UUID válidos.
    - Tomar lecturas crudas en HEX para comparar cambios y ubicar posibles pasos.
    - Reautorizar el reloj cuando la sesión Bluetooth no conserva el dispositivo permitido.
    - Devolver mensajes claros para que la pantalla Dispositivos pueda guiar al usuario.

  Se conecta con:
    - src/features/actividad/dispositivos/dispositivos.service.js
    - electron/electron-window.service.js
*/

const SERVICIOS_ESTANDAR = Object.freeze([
  "battery_service",
  "device_information",
  "heart_rate"
]);

const SERVICIOS_PRIVADOS_CANDIDATOS_RAW = Object.freeze([
  "0000fee0-0000-1000-8000-00805f9b34fb",
  "0000fee1-0000-1000-8000-00805f9b34fb",
  "0000fee7-0000-1000-8000-00805f9b34fb",
  "0000fee9-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "0000fff0-0000-1000-8000-00805f9b34fb",
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "0000ff10-0000-1000-8000-00805f9b34fb",
  "0000ae00-0000-1000-8000-00805f9b34fb",
  "0000af30-0000-1000-8000-00805f9b34fb",
  "0000d0ff-0000-1000-8000-00805f9b34fb",
  "0000fef5-0000-1000-8000-00805f9b34fb",
  "0000fef6-0000-1000-8000-00805f9b34fb",
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455"
]);

const UUID_VALIDO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function normalizarServicioBluetooth(servicio) {
  const valor = String(servicio || "").trim().toLowerCase();
  if (["battery_service", "device_information", "heart_rate"].includes(valor)) return valor;
  if (/^0x[0-9a-f]{4}$/.test(valor)) return valor;
  if (UUID_VALIDO.test(valor)) return valor;
  return "";
}

const SERVICIOS_PRIVADOS_CANDIDATOS = Object.freeze(
  SERVICIOS_PRIVADOS_CANDIDATOS_RAW.map(normalizarServicioBluetooth).filter(Boolean)
);

const SERVICIOS_OPCIONALES = Object.freeze(
  [...SERVICIOS_ESTANDAR, ...SERVICIOS_PRIVADOS_CANDIDATOS].map(normalizarServicioBluetooth).filter(Boolean)
);

const NOMBRE_RELOJ_ESPERADO = /cubitt|ct\s*4|ct4/i;

let ultimoDispositivoBluetooth = null;

function ahoraIso() {
  return new Date().toISOString();
}

function limpiarTexto(valor, max = 160) {
  return String(valor || "").trim().slice(0, max);
}

function obtenerBluetoothApi() {
  if (typeof navigator === "undefined" || !navigator.bluetooth) {
    return null;
  }

  return navigator.bluetooth;
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
  const bluetooth = obtenerBluetoothApi();
  return Boolean(bluetooth && typeof bluetooth.requestDevice === "function");
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

function obtenerPropiedades(caracteristica) {
  const props = caracteristica?.properties || {};
  return {
    read: Boolean(props.read),
    write: Boolean(props.write),
    writeWithoutResponse: Boolean(props.writeWithoutResponse),
    notify: Boolean(props.notify),
    indicate: Boolean(props.indicate)
  };
}

function propiedadesComoTexto(propiedades = {}) {
  return Object.entries(propiedades)
    .filter(([, activo]) => activo)
    .map(([nombre]) => nombre)
    .join(", ") || "sin permisos visibles";
}

function analizarDataView(dataView) {
  const bytes = Array.from(new Uint8Array(dataView.buffer));
  const analisis = {
    hex: bufferAHex(dataView.buffer),
    bytes,
    longitud: bytes.length,
    texto: leerTextoDesdeDataView(dataView),
    decimalPosible: ""
  };

  const candidatos = [];

  if (bytes.length >= 1) {
    candidatos.push(`u8=${dataView.getUint8(0)}`);
  }

  if (bytes.length >= 2) {
    candidatos.push(`u16LE=${dataView.getUint16(0, true)}`);
    candidatos.push(`u16BE=${dataView.getUint16(0, false)}`);
  }

  if (bytes.length >= 4) {
    candidatos.push(`u32LE=${dataView.getUint32(0, true)}`);
    candidatos.push(`u32BE=${dataView.getUint32(0, false)}`);
  }

  analisis.decimalPosible = candidatos.join(" · ");
  return analisis;
}

function resumirLecturaCaracteristica(caracteristica, lectura = null, error = null) {
  const propiedades = obtenerPropiedades(caracteristica);
  const base = {
    uuid: caracteristica.uuid,
    propiedades,
    permisos: propiedadesComoTexto(propiedades),
    leible: propiedades.read,
    valorHex: "",
    valorTexto: "",
    decimalPosible: "",
    longitud: 0,
    error: ""
  };

  if (lectura) {
    const analisis = analizarDataView(lectura);
    return {
      ...base,
      valorHex: analisis.hex,
      valorTexto: limpiarTexto(analisis.texto, 120),
      decimalPosible: limpiarTexto(analisis.decimalPosible, 180),
      longitud: analisis.longitud
    };
  }

  if (error) {
    return {
      ...base,
      error: limpiarTexto(error.message || error.name || "No se pudo leer", 180)
    };
  }

  return base;
}

async function solicitarDispositivoBluetooth() {
  const bluetooth = obtenerBluetoothApi();

  if (!bluetoothDisponible()) {
    throw new Error("Bluetooth no está disponible en este entorno. Abre FitJeff en Electron y verifica que Bluetooth esté activo en Windows.");
  }

  const device = await bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: SERVICIOS_OPCIONALES
  });

  ultimoDispositivoBluetooth = device;
  return device;
}

async function obtenerDispositivoGuardado({ id = "", nombre = "" } = {}) {
  if (ultimoDispositivoBluetooth) {
    return ultimoDispositivoBluetooth;
  }

  const bluetooth = obtenerBluetoothApi();

  if (!bluetooth || typeof bluetooth.getDevices !== "function") {
    return null;
  }

  const permitidos = await bluetooth.getDevices();
  const idLimpio = limpiarTexto(id);
  const nombreLimpio = limpiarTexto(nombre).toLowerCase();

  return permitidos.find((device) => {
    const mismoId = idLimpio && device.id === idLimpio;
    const mismoNombre = nombreLimpio && limpiarTexto(device.name).toLowerCase() === nombreLimpio;
    const pareceCubitt = NOMBRE_RELOJ_ESPERADO.test(device.name || "");
    return mismoId || mismoNombre || pareceCubitt;
  }) || null;
}

async function conectarDispositivo(configuracion = {}, opciones = {}) {
  let device = await obtenerDispositivoGuardado({
    id: configuracion.bluetoothId || configuracion.identificadorLocal,
    nombre: configuracion.bluetoothNombre || configuracion.alias
  });

  if (!device || opciones.forzarSelector) {
    device = await solicitarDispositivoBluetooth();
  }

  ultimoDispositivoBluetooth = device;

  if (!device.gatt) {
    throw new Error("El reloj fue detectado, pero no expone conexión GATT desde este entorno.");
  }

  const server = await device.gatt.connect();
  return { device, server };
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

async function explorarServicio(server, serviceUuid) {
  try {
    const servicio = await server.getPrimaryService(serviceUuid);
    const caracteristicas = await servicio.getCharacteristics();
    const leidas = [];

    for (const caracteristica of caracteristicas) {
      const propiedades = obtenerPropiedades(caracteristica);

      if (!propiedades.read) {
        leidas.push(resumirLecturaCaracteristica(caracteristica));
        continue;
      }

      try {
        const valor = await caracteristica.readValue();
        leidas.push(resumirLecturaCaracteristica(caracteristica, valor));
      } catch (error) {
        leidas.push(resumirLecturaCaracteristica(caracteristica, null, error));
      }
    }

    return {
      encontrado: true,
      uuid: servicio.uuid || serviceUuid,
      caracteristicas: leidas,
      totalCaracteristicas: leidas.length,
      totalLeidas: leidas.filter((item) => item.valorHex).length,
      error: ""
    };
  } catch (error) {
    return {
      encontrado: false,
      uuid: serviceUuid,
      caracteristicas: [],
      totalCaracteristicas: 0,
      totalLeidas: 0,
      error: limpiarTexto(error.message || error.name || "Servicio no disponible", 180)
    };
  }
}

function construirResumenExploracion(servicios = []) {
  const encontrados = servicios.filter((servicio) => servicio.encontrado);
  const caracteristicas = encontrados.flatMap((servicio) => servicio.caracteristicas || []);

  return {
    totalCandidatos: servicios.length,
    totalServicios: encontrados.length,
    totalCaracteristicas: caracteristicas.length,
    totalLeidas: caracteristicas.filter((item) => item.valorHex).length
  };
}

function crearMapaLectura(exploracion) {
  const mapa = {};
  const servicios = Array.isArray(exploracion?.servicios) ? exploracion.servicios : [];

  servicios.forEach((servicio) => {
    (servicio.caracteristicas || []).forEach((caracteristica) => {
      const clave = `${servicio.uuid}|${caracteristica.uuid}`;
      mapa[clave] = {
        servicioUuid: servicio.uuid,
        caracteristicaUuid: caracteristica.uuid,
        permisos: caracteristica.permisos,
        valorHex: caracteristica.valorHex,
        decimalPosible: caracteristica.decimalPosible,
        valorTexto: caracteristica.valorTexto,
        longitud: caracteristica.longitud
      };
    });
  });

  return mapa;
}

function compararMapasLectura(lectura1 = {}, lectura2 = {}) {
  const mapa1 = lectura1.mapa || {};
  const mapa2 = lectura2.mapa || {};
  const claves = Array.from(new Set([...Object.keys(mapa1), ...Object.keys(mapa2)]));

  return claves
    .map((clave) => {
      const anterior = mapa1[clave] || {};
      const nuevo = mapa2[clave] || {};
      return {
        clave,
        servicioUuid: nuevo.servicioUuid || anterior.servicioUuid || "",
        caracteristicaUuid: nuevo.caracteristicaUuid || anterior.caracteristicaUuid || "",
        permisos: nuevo.permisos || anterior.permisos || "",
        antesHex: anterior.valorHex || "",
        despuesHex: nuevo.valorHex || "",
        antesDecimal: anterior.decimalPosible || "",
        despuesDecimal: nuevo.decimalPosible || "",
        cambio: (anterior.valorHex || "") !== (nuevo.valorHex || "")
      };
    })
    .filter((item) => item.cambio)
    .slice(0, 40);
}

export function crearDispositivosBluetoothService() {
  async function solicitarCubitt() {
    try {
      const device = await solicitarDispositivoBluetooth();
      const dispositivo = normalizarDispositivo(device);

      return {
        ok: true,
        mensaje: dispositivo.coincideCubitt
          ? "Cubitt CT4 anexado. Ahora puedes avanzar por las verificaciones."
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
      const { device, server } = await conectarDispositivo(configuracion);
      const diagnostico = await leerDiagnosticoBasico(server);
      const conectado = Boolean(server.connected);

      if (server.connected) {
        server.disconnect();
      }

      return {
        ok: true,
        mensaje: diagnostico.serviciosLeidos.length
          ? "Conexión Bluetooth correcta. FitJeff pudo leer diagnóstico básico del reloj."
          : "Conexión Bluetooth correcta, pero el reloj no entregó servicios estándar. Avanza a Explorar servicios privados.",
        dispositivo: normalizarDispositivo(device),
        conectado,
        diagnostico,
        creadoEn: ahoraIso()
      };
    } catch (error) {
      return crearError(explicarErrorBluetooth(error), error);
    }
  }

  async function explorarServiciosPrivados(configuracion = {}) {
    if (!bluetoothDisponible()) {
      return crearError("Bluetooth no está disponible en este entorno. Abre FitJeff en Electron y verifica que Bluetooth esté activo en Windows.");
    }

    try {
      const { device, server } = await conectarDispositivo(configuracion);
      const servicios = [];

      for (const serviceUuid of SERVICIOS_PRIVADOS_CANDIDATOS) {
        servicios.push(await explorarServicio(server, serviceUuid));
      }

      if (server.connected) {
        server.disconnect();
      }

      const encontrados = servicios.filter((servicio) => servicio.encontrado);
      const resumen = construirResumenExploracion(servicios);
      const exploracion = {
        creadoEn: ahoraIso(),
        dispositivo: normalizarDispositivo(device),
        candidatos: SERVICIOS_PRIVADOS_CANDIDATOS,
        servicios: encontrados,
        resumen
      };

      return {
        ok: encontrados.length > 0,
        mensaje: encontrados.length > 0
          ? `Exploración lista: ${resumen.totalServicios} servicio(s), ${resumen.totalCaracteristicas} característica(s), ${resumen.totalLeidas} lectura(s) HEX.`
          : "No se encontraron servicios privados candidatos. Vuelve a Escanear y anexar reloj para reautorizar permisos Bluetooth ampliados.",
        exploracion,
        creadoEn: exploracion.creadoEn
      };
    } catch (error) {
      return crearError(explicarErrorBluetooth(error), error);
    }
  }

  async function tomarLecturaPrivada(configuracion = {}, numero = 1) {
    const resultado = await explorarServiciosPrivados(configuracion);

    if (!resultado.ok) {
      return resultado;
    }

    const lectura = {
      id: `lectura-${numero}`,
      numero,
      creadoEn: ahoraIso(),
      exploracion: resultado.exploracion,
      mapa: crearMapaLectura(resultado.exploracion)
    };

    return {
      ok: true,
      mensaje: `Lectura ${numero} guardada. Ahora ${numero === 1 ? "camina 20 o 30 pasos y toma la lectura 2" : "puedes comparar cambios"}.`,
      lectura,
      exploracion: resultado.exploracion,
      creadoEn: lectura.creadoEn
    };
  }

  function compararLecturas(lectura1, lectura2) {
    if (!lectura1?.mapa || !lectura2?.mapa) {
      return crearError("Faltan lecturas. Primero toma Lectura 1, camina unos pasos y luego toma Lectura 2.");
    }

    const cambios = compararMapasLectura(lectura1, lectura2);

    return {
      ok: true,
      mensaje: cambios.length
        ? `Comparación lista: ${cambios.length} característica(s) cambiaron. Revisa las candidatas a pasos.`
        : "No se detectaron cambios entre las dos lecturas. Camina más pasos o espera unos segundos antes de repetir.",
      comparacion: {
        creadoEn: ahoraIso(),
        cambios,
        totalCambios: cambios.length
      },
      creadoEn: ahoraIso()
    };
  }

  return {
    solicitarCubitt,
    probarConexionCubitt,
    explorarServiciosPrivados,
    tomarLecturaPrivada,
    compararLecturas
  };
}
