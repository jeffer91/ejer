/*
  Nombre completo: dispositivos.service.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos.service.js

  Función o funciones:
    - Coordinar configuración local de Cubitt CT4, Google Fit y Puente FitJeff.
    - Mantener claro que Cubitt/Google Fit aún no tienen lectura automática real.
    - Importar datos pegados mediante puente CSV/JSON hacia Actividad.
    - Guardar historial local de preparación e importación.
    - Construir resumen visual de dispositivos para Actividad.

  Se conecta con:
    - src/features/actividad/dispositivos/dispositivos.repository.js
    - src/features/actividad/dispositivos/dispositivos-import-bridge.service.js
    - src/features/actividad/dispositivos/adapters/cubitt.adapter.js
    - src/features/actividad/dispositivos/adapters/google-fit.adapter.js
*/

import { crearCubittAdapter } from "./adapters/cubitt.adapter.js";
import { crearGoogleFitAdapter } from "./adapters/google-fit.adapter.js";
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

function construirResumen(estado) {
  const cubittPreparado = estado.cubitt.estado === DISPOSITIVOS_ESTADOS.PREPARADO && Boolean(estado.cubitt.identificadorLocal);
  const googlePreparado = estado.googleFit.estado === DISPOSITIVOS_ESTADOS.PREPARADO && Boolean(estado.googleFit.cuenta);
  const ultimoImporte = estado.puente.ultimoImportadoEn ? "Última importación guardada" : "Sin importaciones todavía";

  return {
    cubitt: {
      titulo: `${estado.cubitt.marca} ${estado.cubitt.modelo}`.trim(),
      detalle: cubittPreparado ? "Preparado localmente" : "Pendiente de identificador local",
      estado: cubittPreparado ? "success" : "pending"
    },
    googleFit: {
      titulo: "Google Fit",
      detalle: googlePreparado ? "Cuenta preparada" : "Pendiente de cuenta",
      estado: googlePreparado ? "success" : "pending"
    },
    puente: {
      titulo: "Puente FitJeff",
      detalle: estado.puente.fuentePreferida === DISPOSITIVOS_FUENTES.MANUAL ? ultimoImporte : `Fuente: ${estado.puente.fuentePreferida}`,
      estado: estado.puente.ultimoImportadoEn ? "success" : "info"
    }
  };
}

export function crearDispositivosService(
  repository = crearDispositivosRepository(),
  importBridge = crearDispositivosImportBridgeService()
) {
  const cubittAdapter = crearCubittAdapter();
  const googleFitAdapter = crearGoogleFitAdapter();

  function obtenerEstado() {
    const estado = repository.obtenerEstado();
    return {
      ...estado,
      ejemploImportacion: importBridge.ejemploCsv(),
      resumen: construirResumen(estado)
    };
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
      identificadorLocal: preservarTexto(datos.cubittIdentificadorLocal, anterior.cubitt.identificadorLocal, 80)
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
      fuentePreferida: limpiarTexto(datos.fuentePreferida || DISPOSITIVOS_FUENTES.MANUAL, 30),
      importarPasos: leerBooleano(datos.importarPasos),
      importarBicicleta: leerBooleano(datos.importarBicicleta),
      evitarDuplicados: leerBooleano(datos.evitarDuplicados),
      estado: DISPOSITIVOS_ESTADOS.PREPARADO
    };

    const estado = repository.guardarEstado({
      ...anterior,
      cubitt: {
        ...cubitt,
        estado: cubittPreparado.estado,
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
      estado: {
        ...estado,
        ejemploImportacion: importBridge.ejemploCsv(),
        resumen: construirResumen(estado)
      }
    };
  }

  function importarDatosPegados(texto) {
    const anterior = repository.obtenerEstado();
    const resultado = importBridge.importarTexto(texto, {
      fuentePreferida: anterior.puente.fuentePreferida || DISPOSITIVOS_FUENTES.MANUAL
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
      estado: {
        ...estado,
        ejemploImportacion: importBridge.ejemploCsv(),
        resumen: construirResumen(estado)
      }
    };
  }

  return {
    obtenerEstado,
    guardarPreparacion,
    importarDatosPegados
  };
}

export function obtenerResumenDispositivos() {
  return crearDispositivosService().obtenerEstado().resumen;
}
