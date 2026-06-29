/*
  Nombre completo: dispositivos.service.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos.service.js

  Función o funciones:
    - Coordinar configuración local de Cubitt CT4, Google Fit y Puente FitJeff.
    - Anexar Cubitt CT4 por Web Bluetooth desde la app cuando el reloj aparece en Windows.
    - Probar conexión básica GATT sin prometer lectura automática de pasos.
    - Importar datos pegados mediante puente CSV/JSON hacia Actividad.
    - Guardar historial local de preparación, anexado, diagnóstico e importación.
    - Construir resumen visual de dispositivos para Actividad.

  Se conecta con:
    - src/features/actividad/dispositivos/dispositivos.repository.js
    - src/features/actividad/dispositivos/dispositivos-import-bridge.service.js
    - src/features/actividad/dispositivos/dispositivos-bluetooth.service.js
    - src/features/actividad/dispositivos/adapters/cubitt.adapter.js
    - src/features/actividad/dispositivos/adapters/google-fit.adapter.js
*/

import { crearCubittAdapter } from "./adapters/cubitt.adapter.js";
import { crearGoogleFitAdapter } from "./adapters/google-fit.adapter.js";
import { crearDispositivosBluetoothService } from "./dispositivos-bluetooth.service.js";
import { DISPOSITIVOS_ESTADOS, DISPOSITIVOS_FUENTES, DISPOSITIVOS_TEXTOS } from "./dispositivos.constants.js";
import { crearDispositivosImportBridgeService } from "./dispositivos-import-bridge.service.js";
import { crearDispositivosRepository } from "./dispositivos.repository.js";

function limpiarTexto(valor, max = 120) {
  return String(valor || "").trim().slice(0, max);
}

function leerBooleano(valor) {
  return valor === true || valor === "true" || valor === "on";
}

function preservarTexto(nuevoValor, valorAnterior, max = 120) {
  const nuevo = limpiarTexto(nuevoValor, max);
  return nuevo || limpiarTexto(valorAnterior, max);
}

function crearEvento(tipo, mensaje) {
  return {
    id: `disp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    tipo,
    mensaje,
    creadoEn: new Date().toISOString()
  };
}

function fechaCorta(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (_error) {
    return iso;
  }
}

function crearEstadoConResumen(estado, importBridge) {
  return {
    ...estado,
    ejemploImportacion: importBridge.ejemploCsv(),
    resumen: construirResumen(estado)
  };
}

function construirResumen(estado) {
  const cubittAnexado = Boolean(estado.cubitt.bluetoothId || estado.cubitt.identificadorLocal || estado.cubitt.bluetoothNombre);
  const cubittConectado = estado.cubitt.estado === DISPOSITIVOS_ESTADOS.CONECTADO;
  const googlePreparado = estado.googleFit.estado === DISPOSITIVOS_ESTADOS.PREPARADO && Boolean(estado.googleFit.cuenta);
  const ultimoImporte = estado.puente.ultimoImportadoEn ? "Última importación guardada" : "Sin importaciones todavía";

  return {
    cubitt: {
      titulo: `${estado.cubitt.marca} ${estado.cubitt.modelo}`.trim(),
      etiqueta: cubittConectado ? "Conectado" : cubittAnexado ? "Anexado" : "Pendiente",
      detalle: cubittConectado
        ? `Última conexión: ${fechaCorta(estado.cubitt.bluetoothUltimaConexionEn)}`
        : cubittAnexado
          ? `Anexado como ${estado.cubitt.bluetoothNombre || estado.cubitt.alias}`
          : "Pendiente de escanear por Bluetooth",
      estado: cubittConectado || cubittAnexado ? "success" : "pending"
    },
    googleFit: {
      titulo: "Google Fit",
      etiqueta: googlePreparado ? "Preparado" : "Opcional",
      detalle: googlePreparado ? "Cuenta preparada" : "No necesario para Cubitt CT4",
      estado: googlePreparado ? "success" : "info"
    },
    puente: {
      titulo: "Puente FitJeff",
      etiqueta: estado.puente.ultimoImportadoEn ? "Usado" : "Preparado",
      detalle: estado.puente.fuentePreferida === DISPOSITIVOS_FUENTES.MANUAL ? ultimoImporte : `Fuente: ${estado.puente.fuentePreferida}`,
      estado: estado.puente.ultimoImportadoEn ? "success" : "info"
    }
  };
}

export function crearDispositivosService(
  repository = crearDispositivosRepository(),
  importBridge = crearDispositivosImportBridgeService(),
  bluetooth = crearDispositivosBluetoothService()
) {
  const cubittAdapter = crearCubittAdapter();
  const googleFitAdapter = crearGoogleFitAdapter();

  function obtenerEstado() {
    return crearEstadoConResumen(repository.obtenerEstado(), importBridge);
  }

  function guardarPreparacion(datos = {}) {
    const anterior = repository.obtenerEstado();
    const cubitt = {
      ...anterior.cubitt,
      activo: leerBooleano(datos.cubittActivo),
      marca: preservarTexto(datos.cubittMarca, anterior.cubitt.marca, 60),
      modelo: preservarTexto(datos.cubittModelo, anterior.cubitt.modelo, 60),
      variante: preservarTexto(datos.cubittVariante, anterior.cubitt.variante, 60),
      alias: preservarTexto(datos.cubittAlias, anterior.cubitt.alias, 80),
      identificadorLocal: preservarTexto(datos.cubittIdentificadorLocal, anterior.cubitt.identificadorLocal, 120),
      bluetoothNombre: preservarTexto(datos.cubittBluetoothNombre, anterior.cubitt.bluetoothNombre, 120)
    };
    const googleFit = {
      ...anterior.googleFit,
      activo: leerBooleano(datos.googleFitActivo),
      cuenta: preservarTexto(datos.googleFitCuenta, anterior.googleFit.cuenta, 120),
      lecturaPasos: leerBooleano(datos.googleFitLecturaPasos),
      lecturaBicicleta: leerBooleano(datos.googleFitLecturaBicicleta),
      sincronizacionAutomatica: leerBooleano(datos.googleFitSincronizacionAutomatica)
    };
    const cubittPreparado = cubittAdapter.prepararConfiguracion(cubitt);
    const googlePreparado = googleFitAdapter.prepararConfiguracion(googleFit);
    const puente = {
      ...anterior.puente,
      fuentePreferida: limpiarTexto(datos.fuentePreferida || DISPOSITIVOS_FUENTES.CUBITT, 30),
      importarPasos: leerBooleano(datos.importarPasos),
      importarBicicleta: leerBooleano(datos.importarBicicleta),
      evitarDuplicados: leerBooleano(datos.evitarDuplicados),
      estado: DISPOSITIVOS_ESTADOS.PREPARADO
    };

    const estado = repository.guardarEstado({
      ...anterior,
      cubitt: {
        ...cubitt,
        estado: cubitt.bluetoothId || cubitt.identificadorLocal ? cubittPreparado.estado : DISPOSITIVOS_ESTADOS.PENDIENTE,
        nota: cubittPreparado.mensaje,
        ultimoIntento: new Date().toISOString()
      },
      googleFit: {
        ...googleFit,
        estado: googlePreparado.estado,
        nota: googlePreparado.mensaje,
        ultimoIntento: new Date().toISOString()
      },
      puente,
      historial: [
        crearEvento("preparacion", DISPOSITIVOS_TEXTOS.EXITO),
        ...(anterior.historial || [])
      ].slice(0, 20)
    });

    return {
      ok: true,
      mensaje: DISPOSITIVOS_TEXTOS.EXITO,
      estado: crearEstadoConResumen(estado, importBridge)
    };
  }

  async function anexarCubittBluetooth() {
    const anterior = repository.obtenerEstado();
    const resultado = await bluetooth.solicitarCubitt();

    if (!resultado.ok) {
      const estadoError = repository.guardarEstado({
        ...anterior,
        cubitt: {
          ...anterior.cubitt,
          estado: anterior.cubitt.bluetoothId ? anterior.cubitt.estado : DISPOSITIVOS_ESTADOS.ERROR,
          ultimoIntento: new Date().toISOString(),
          bluetoothUltimoDiagnostico: resultado.mensaje,
          nota: resultado.mensaje
        },
        historial: [
          crearEvento("bluetooth-error", resultado.mensaje),
          ...(anterior.historial || [])
        ].slice(0, 20)
      });

      return {
        ...resultado,
        estado: crearEstadoConResumen(estadoError, importBridge)
      };
    }

    const dispositivo = resultado.dispositivo || {};
    const estado = repository.guardarEstado({
      ...anterior,
      cubitt: {
        ...anterior.cubitt,
        activo: true,
        alias: dispositivo.nombre || anterior.cubitt.alias,
        identificadorLocal: dispositivo.id || dispositivo.nombre || anterior.cubitt.identificadorLocal,
        bluetoothId: dispositivo.id || anterior.cubitt.bluetoothId,
        bluetoothNombre: dispositivo.nombre || anterior.cubitt.bluetoothNombre,
        bluetoothAnexadoEn: resultado.creadoEn || new Date().toISOString(),
        bluetoothUltimoDiagnostico: resultado.mensaje,
        estado: DISPOSITIVOS_ESTADOS.PREPARADO,
        ultimoIntento: new Date().toISOString(),
        nota: resultado.mensaje
      },
      puente: {
        ...anterior.puente,
        fuentePreferida: DISPOSITIVOS_FUENTES.CUBITT,
        estado: DISPOSITIVOS_ESTADOS.PREPARADO
      },
      historial: [
        crearEvento("bluetooth-anexado", resultado.mensaje),
        ...(anterior.historial || [])
      ].slice(0, 20)
    });

    return {
      ...resultado,
      mensaje: DISPOSITIVOS_TEXTOS.BLUETOOTH_EXITO,
      estado: crearEstadoConResumen(estado, importBridge)
    };
  }

  async function probarConexionCubittBluetooth() {
    const anterior = repository.obtenerEstado();
    const resultado = await bluetooth.probarConexionCubitt(anterior.cubitt);

    const diagnostico = resultado.diagnostico || {};
    const estado = repository.guardarEstado({
      ...anterior,
      cubitt: {
        ...anterior.cubitt,
        estado: resultado.ok ? DISPOSITIVOS_ESTADOS.CONECTADO : DISPOSITIVOS_ESTADOS.ERROR,
        bluetoothUltimaConexionEn: resultado.ok ? (resultado.creadoEn || new Date().toISOString()) : anterior.cubitt.bluetoothUltimaConexionEn,
        bluetoothUltimoDiagnostico: resultado.mensaje,
        bluetoothBateria: diagnostico.bateria ?? anterior.cubitt.bluetoothBateria,
        bluetoothFabricante: diagnostico.fabricante || anterior.cubitt.bluetoothFabricante,
        bluetoothModeloDetectado: diagnostico.modelo || anterior.cubitt.bluetoothModeloDetectado,
        bluetoothServiciosLeidos: Array.isArray(diagnostico.serviciosLeidos) ? diagnostico.serviciosLeidos : anterior.cubitt.bluetoothServiciosLeidos,
        ultimoIntento: new Date().toISOString(),
        nota: resultado.mensaje
      },
      historial: [
        crearEvento(resultado.ok ? "bluetooth-conexion" : "bluetooth-error", resultado.mensaje),
        ...(anterior.historial || [])
      ].slice(0, 20)
    });

    return {
      ...resultado,
      estado: crearEstadoConResumen(estado, importBridge)
    };
  }

  function importarDatosPegados(texto) {
    const anterior = repository.obtenerEstado();
    const resultado = importBridge.importarTexto(texto, {
      fuentePreferida: anterior.puente.fuentePreferida || DISPOSITIVOS_FUENTES.CUBITT
    });

    const estado = repository.guardarEstado({
      ...anterior,
      puente: {
        ...anterior.puente,
        estado: resultado.ok ? DISPOSITIVOS_ESTADOS.CONECTADO : DISPOSITIVOS_ESTADOS.ERROR,
        ultimoImportadoEn: resultado.ok ? new Date().toISOString() : anterior.puente.ultimoImportadoEn,
        ultimoResultadoImportacion: resultado.mensaje
      },
      historial: [
        crearEvento(resultado.ok ? "importacion" : "importacion-error", resultado.mensaje),
        ...(anterior.historial || [])
      ].slice(0, 20)
    });

    return {
      ...resultado,
      estado: crearEstadoConResumen(estado, importBridge)
    };
  }

  return {
    obtenerEstado,
    guardarPreparacion,
    anexarCubittBluetooth,
    probarConexionCubittBluetooth,
    importarDatosPegados
  };
}

export function obtenerResumenDispositivos() {
  return crearDispositivosService().obtenerEstado().resumen;
}
