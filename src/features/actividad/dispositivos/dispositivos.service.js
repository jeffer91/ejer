/*
  Nombre completo: dispositivos.service.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos.service.js

  Función o funciones:
    - Coordinar configuración local de Cubitt CT4, Google Fit y Puente FitJeff.
    - Separar la pantalla Dispositivos en subpáginas para reducir distracciones visuales.
    - Anexar Cubitt CT4 por Web Bluetooth desde la app cuando el reloj aparece en Windows.
    - Probar conexión básica GATT sin prometer lectura automática de pasos.
    - Explorar protocolo privado del reloj mediante servicios GATT candidatos.
    - Tomar dos lecturas HEX y comparar cambios para ubicar posibles pasos.
    - Manejar paginación del asistente de verificaciones Bluetooth.
    - Importar datos pegados mediante puente CSV/JSON hacia Actividad.
    - Guardar historial local de preparación, anexado, diagnóstico, exploración e importación.
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
import { DISPOSITIVOS_ESTADOS, DISPOSITIVOS_FUENTES, DISPOSITIVOS_PAGINAS, DISPOSITIVOS_TEXTOS } from "./dispositivos.constants.js";
import { crearDispositivosImportBridgeService } from "./dispositivos-import-bridge.service.js";
import { crearDispositivosRepository } from "./dispositivos.repository.js";

const TOTAL_PAGINAS_VERIFICACION = 5;
const PAGINAS_DISPOSITIVOS_VALIDAS = Object.values(DISPOSITIVOS_PAGINAS);

function limpiarTexto(valor, max = 120) {
  return String(valor || "").trim().slice(0, max);
}

function tieneCampo(datos, campo) {
  return Object.prototype.hasOwnProperty.call(datos || {}, campo);
}

function leerBooleano(valor) {
  return valor === true || valor === "true" || valor === "on";
}

function leerBooleanoCampo(datos, campo, valorAnterior = false) {
  if (!tieneCampo(datos, campo)) return Boolean(valorAnterior);
  return leerBooleano(datos[campo]);
}

function preservarTexto(nuevoValor, valorAnterior, max = 120) {
  const nuevo = limpiarTexto(nuevoValor, max);
  return nuevo || limpiarTexto(valorAnterior, max);
}

function preservarTextoCampo(datos, campo, valorAnterior, max = 120) {
  if (!tieneCampo(datos, campo)) return limpiarTexto(valorAnterior, max);
  return preservarTexto(datos[campo], valorAnterior, max);
}

function normalizarPaginaVerificacion(pagina) {
  const numero = Number(pagina);
  if (!Number.isFinite(numero)) return 1;
  return Math.min(TOTAL_PAGINAS_VERIFICACION, Math.max(1, Math.round(numero)));
}

function normalizarPaginaDispositivos(pagina) {
  const valor = limpiarTexto(pagina, 40);
  return PAGINAS_DISPOSITIVOS_VALIDAS.includes(valor) ? valor : DISPOSITIVOS_PAGINAS.CUBITT;
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
  const paginaActiva = normalizarPaginaDispositivos(estado.paginaActiva);
  return {
    ...estado,
    paginaActiva,
    cubitt: {
      ...estado.cubitt,
      bluetoothVerificacionPagina: normalizarPaginaVerificacion(estado.cubitt?.bluetoothVerificacionPagina || 1)
    },
    ejemploImportacion: importBridge.ejemploCsv(),
    resumen: construirResumen(estado)
  };
}

function construirResumen(estado) {
  const cubittAnexado = Boolean(estado.cubitt.bluetoothId || estado.cubitt.identificadorLocal || estado.cubitt.bluetoothNombre);
  const cubittConectado = estado.cubitt.estado === DISPOSITIVOS_ESTADOS.CONECTADO;
  const cubittExplorado = Boolean(estado.cubitt.bluetoothExploracion?.resumen?.totalServicios);
  const googlePreparado = estado.googleFit.estado === DISPOSITIVOS_ESTADOS.PREPARADO && Boolean(estado.googleFit.cuenta);
  const ultimoImporte = estado.puente.ultimoImportadoEn ? "Última importación guardada" : "Sin importaciones todavía";

  return {
    cubitt: {
      titulo: `${estado.cubitt.marca} ${estado.cubitt.modelo}`.trim(),
      etiqueta: cubittExplorado ? "Explorado" : cubittConectado ? "Conectado" : cubittAnexado ? "Anexado" : "Pendiente",
      detalle: cubittExplorado
        ? `${estado.cubitt.bluetoothExploracion.resumen.totalServicios} servicio(s), ${estado.cubitt.bluetoothExploracion.resumen.totalLeidas} lectura(s) HEX`
        : cubittConectado
          ? `Última conexión: ${fechaCorta(estado.cubitt.bluetoothUltimaConexionEn)}`
          : cubittAnexado
            ? `Anexado como ${estado.cubitt.bluetoothNombre || estado.cubitt.alias}`
            : "Pendiente de escanear por Bluetooth",
      estado: cubittExplorado || cubittConectado || cubittAnexado ? "success" : "pending",
      pagina: DISPOSITIVOS_PAGINAS.CUBITT
    },
    googleFit: {
      titulo: "Google Fit",
      etiqueta: googlePreparado ? "Preparado" : "Opcional",
      detalle: googlePreparado ? "Cuenta preparada" : "No necesario para Cubitt CT4",
      estado: googlePreparado ? "success" : "info",
      pagina: DISPOSITIVOS_PAGINAS.GOOGLE_FIT
    },
    puente: {
      titulo: "Puente FitJeff",
      etiqueta: estado.puente.ultimoImportadoEn ? "Usado" : "Preparado",
      detalle: estado.puente.fuentePreferida === DISPOSITIVOS_FUENTES.MANUAL ? ultimoImporte : `Fuente: ${estado.puente.fuentePreferida}`,
      estado: estado.puente.ultimoImportadoEn ? "success" : "info",
      pagina: DISPOSITIVOS_PAGINAS.PUENTE
    },
    historial: {
      titulo: "Historial local",
      etiqueta: Array.isArray(estado.historial) && estado.historial.length ? `${estado.historial.length} eventos` : "Vacío",
      detalle: Array.isArray(estado.historial) && estado.historial.length ? "Últimas acciones guardadas en esta PC" : "Sin eventos todavía",
      estado: "info",
      pagina: DISPOSITIVOS_PAGINAS.HISTORIAL
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

  function cambiarPaginaDispositivos(pagina) {
    const anterior = repository.obtenerEstado();
    const paginaActiva = normalizarPaginaDispositivos(pagina);
    const estado = repository.guardarEstado({
      ...anterior,
      paginaActiva
    });

    return {
      ok: true,
      mensaje: `Subpágina activa: ${paginaActiva}.`,
      estado: crearEstadoConResumen(estado, importBridge)
    };
  }

  function guardarPreparacion(datos = {}) {
    const anterior = repository.obtenerEstado();
    const cubitt = {
      ...anterior.cubitt,
      activo: leerBooleanoCampo(datos, "cubittActivo", anterior.cubitt.activo),
      marca: preservarTextoCampo(datos, "cubittMarca", anterior.cubitt.marca, 60),
      modelo: preservarTextoCampo(datos, "cubittModelo", anterior.cubitt.modelo, 60),
      variante: preservarTextoCampo(datos, "cubittVariante", anterior.cubitt.variante, 60),
      alias: preservarTextoCampo(datos, "cubittAlias", anterior.cubitt.alias, 80),
      identificadorLocal: preservarTextoCampo(datos, "cubittIdentificadorLocal", anterior.cubitt.identificadorLocal, 120),
      bluetoothNombre: preservarTextoCampo(datos, "cubittBluetoothNombre", anterior.cubitt.bluetoothNombre, 120),
      bluetoothVerificacionPagina: normalizarPaginaVerificacion(anterior.cubitt.bluetoothVerificacionPagina || 1)
    };
    const googleFit = {
      ...anterior.googleFit,
      activo: leerBooleanoCampo(datos, "googleFitActivo", anterior.googleFit.activo),
      cuenta: preservarTextoCampo(datos, "googleFitCuenta", anterior.googleFit.cuenta, 120),
      lecturaPasos: leerBooleanoCampo(datos, "googleFitLecturaPasos", anterior.googleFit.lecturaPasos),
      lecturaBicicleta: leerBooleanoCampo(datos, "googleFitLecturaBicicleta", anterior.googleFit.lecturaBicicleta),
      sincronizacionAutomatica: leerBooleanoCampo(datos, "googleFitSincronizacionAutomatica", anterior.googleFit.sincronizacionAutomatica)
    };
    const puente = {
      ...anterior.puente,
      fuentePreferida: tieneCampo(datos, "fuentePreferida")
        ? limpiarTexto(datos.fuentePreferida || DISPOSITIVOS_FUENTES.CUBITT, 30)
        : anterior.puente.fuentePreferida,
      importarPasos: leerBooleanoCampo(datos, "importarPasos", anterior.puente.importarPasos),
      importarBicicleta: leerBooleanoCampo(datos, "importarBicicleta", anterior.puente.importarBicicleta),
      evitarDuplicados: leerBooleanoCampo(datos, "evitarDuplicados", anterior.puente.evitarDuplicados),
      estado: DISPOSITIVOS_ESTADOS.PREPARADO
    };
    const cubittPreparado = cubittAdapter.prepararConfiguracion(cubitt);
    const googlePreparado = googleFitAdapter.prepararConfiguracion(googleFit);

    const estado = repository.guardarEstado({
      ...anterior,
      paginaActiva: normalizarPaginaDispositivos(anterior.paginaActiva),
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

  function cambiarPaginaVerificacionCubitt(pagina) {
    const anterior = repository.obtenerEstado();
    const paginaNormalizada = normalizarPaginaVerificacion(pagina);
    const estado = repository.guardarEstado({
      ...anterior,
      paginaActiva: DISPOSITIVOS_PAGINAS.CUBITT,
      cubitt: {
        ...anterior.cubitt,
        bluetoothVerificacionPagina: paginaNormalizada
      }
    });

    return {
      ok: true,
      mensaje: `Verificación ${paginaNormalizada} de ${TOTAL_PAGINAS_VERIFICACION}.`,
      estado: crearEstadoConResumen(estado, importBridge)
    };
  }

  async function anexarCubittBluetooth() {
    const anterior = repository.obtenerEstado();
    const resultado = await bluetooth.solicitarCubitt();

    if (!resultado.ok) {
      const estadoError = repository.guardarEstado({
        ...anterior,
        paginaActiva: DISPOSITIVOS_PAGINAS.CUBITT,
        cubitt: {
          ...anterior.cubitt,
          estado: anterior.cubitt.bluetoothId ? anterior.cubitt.estado : DISPOSITIVOS_ESTADOS.ERROR,
          ultimoIntento: new Date().toISOString(),
          bluetoothUltimoDiagnostico: resultado.mensaje,
          bluetoothVerificacionPagina: 1,
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
      paginaActiva: DISPOSITIVOS_PAGINAS.CUBITT,
      cubitt: {
        ...anterior.cubitt,
        activo: true,
        alias: dispositivo.nombre || anterior.cubitt.alias,
        identificadorLocal: dispositivo.id || dispositivo.nombre || anterior.cubitt.identificadorLocal,
        bluetoothId: dispositivo.id || anterior.cubitt.bluetoothId,
        bluetoothNombre: dispositivo.nombre || anterior.cubitt.bluetoothNombre,
        bluetoothAnexadoEn: resultado.creadoEn || new Date().toISOString(),
        bluetoothUltimoDiagnostico: resultado.mensaje,
        bluetoothVerificacionPagina: 1,
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
      paginaActiva: DISPOSITIVOS_PAGINAS.CUBITT,
      cubitt: {
        ...anterior.cubitt,
        estado: resultado.ok ? DISPOSITIVOS_ESTADOS.CONECTADO : DISPOSITIVOS_ESTADOS.ERROR,
        bluetoothUltimaConexionEn: resultado.ok ? (resultado.creadoEn || new Date().toISOString()) : anterior.cubitt.bluetoothUltimaConexionEn,
        bluetoothUltimoDiagnostico: resultado.mensaje,
        bluetoothBateria: diagnostico.bateria ?? anterior.cubitt.bluetoothBateria,
        bluetoothFabricante: diagnostico.fabricante || anterior.cubitt.bluetoothFabricante,
        bluetoothModeloDetectado: diagnostico.modelo || anterior.cubitt.bluetoothModeloDetectado,
        bluetoothServiciosLeidos: Array.isArray(diagnostico.serviciosLeidos) ? diagnostico.serviciosLeidos : anterior.cubitt.bluetoothServiciosLeidos,
        bluetoothVerificacionPagina: resultado.ok ? 1 : normalizarPaginaVerificacion(anterior.cubitt.bluetoothVerificacionPagina || 1),
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

  async function explorarCubittPrivado() {
    const anterior = repository.obtenerEstado();
    const resultado = await bluetooth.explorarServiciosPrivados(anterior.cubitt);
    const estado = repository.guardarEstado({
      ...anterior,
      paginaActiva: DISPOSITIVOS_PAGINAS.CUBITT,
      cubitt: {
        ...anterior.cubitt,
        estado: resultado.exploracion ? DISPOSITIVOS_ESTADOS.CONECTADO : DISPOSITIVOS_ESTADOS.ERROR,
        bluetoothExploracion: resultado.exploracion || anterior.cubitt.bluetoothExploracion,
        bluetoothUltimoDiagnostico: resultado.mensaje,
        bluetoothVerificacionPagina: resultado.exploracion ? 2 : normalizarPaginaVerificacion(anterior.cubitt.bluetoothVerificacionPagina || 1),
        ultimoIntento: new Date().toISOString(),
        nota: resultado.mensaje
      },
      historial: [
        crearEvento(resultado.exploracion ? "bluetooth-exploracion" : "bluetooth-error", resultado.mensaje),
        ...(anterior.historial || [])
      ].slice(0, 20)
    });

    return {
      ...resultado,
      estado: crearEstadoConResumen(estado, importBridge)
    };
  }

  async function tomarLecturaCubittPrivada(numero = 1) {
    const slot = Number(numero) === 2 ? 2 : 1;
    const anterior = repository.obtenerEstado();
    const resultado = await bluetooth.tomarLecturaPrivada(anterior.cubitt, slot);
    const cubittActualizado = {
      ...anterior.cubitt,
      estado: resultado.lectura ? DISPOSITIVOS_ESTADOS.CONECTADO : DISPOSITIVOS_ESTADOS.ERROR,
      bluetoothExploracion: resultado.exploracion || anterior.cubitt.bluetoothExploracion,
      bluetoothUltimoDiagnostico: resultado.mensaje,
      bluetoothVerificacionPagina: resultado.lectura ? (slot === 1 ? 3 : 4) : normalizarPaginaVerificacion(anterior.cubitt.bluetoothVerificacionPagina || 1),
      ultimoIntento: new Date().toISOString(),
      nota: resultado.mensaje
    };

    if (slot === 1 && resultado.lectura) {
      cubittActualizado.bluetoothLectura1 = resultado.lectura;
      cubittActualizado.bluetoothLectura2 = null;
      cubittActualizado.bluetoothComparacion = null;
    }

    if (slot === 2 && resultado.lectura) {
      cubittActualizado.bluetoothLectura2 = resultado.lectura;
      cubittActualizado.bluetoothComparacion = null;
    }

    const estado = repository.guardarEstado({
      ...anterior,
      paginaActiva: DISPOSITIVOS_PAGINAS.CUBITT,
      cubitt: cubittActualizado,
      historial: [
        crearEvento(resultado.lectura ? `bluetooth-lectura-${slot}` : "bluetooth-error", resultado.mensaje),
        ...(anterior.historial || [])
      ].slice(0, 20)
    });

    return {
      ...resultado,
      estado: crearEstadoConResumen(estado, importBridge)
    };
  }

  function compararLecturasCubittPrivadas() {
    const anterior = repository.obtenerEstado();
    const resultado = bluetooth.compararLecturas(anterior.cubitt.bluetoothLectura1, anterior.cubitt.bluetoothLectura2);

    const estado = repository.guardarEstado({
      ...anterior,
      paginaActiva: DISPOSITIVOS_PAGINAS.CUBITT,
      cubitt: {
        ...anterior.cubitt,
        bluetoothComparacion: resultado.comparacion || anterior.cubitt.bluetoothComparacion,
        bluetoothUltimoDiagnostico: resultado.mensaje,
        bluetoothVerificacionPagina: resultado.comparacion ? 5 : normalizarPaginaVerificacion(anterior.cubitt.bluetoothVerificacionPagina || 4),
        ultimoIntento: new Date().toISOString(),
        nota: resultado.mensaje
      },
      historial: [
        crearEvento(resultado.ok ? "bluetooth-comparacion" : "bluetooth-error", resultado.mensaje),
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
      paginaActiva: DISPOSITIVOS_PAGINAS.PUENTE,
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
    cambiarPaginaDispositivos,
    guardarPreparacion,
    cambiarPaginaVerificacionCubitt,
    anexarCubittBluetooth,
    probarConexionCubittBluetooth,
    explorarCubittPrivado,
    tomarLecturaCubittPrivada,
    compararLecturasCubittPrivadas,
    importarDatosPegados
  };
}

export function obtenerResumenDispositivos() {
  return crearDispositivosService().obtenerEstado().resumen;
}
