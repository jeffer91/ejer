import { crearCubittAdapter } from "./adapters/cubitt.adapter.js";
import { crearGoogleFitAdapter } from "./adapters/google-fit.adapter.js";
import { DISPOSITIVOS_ESTADOS, DISPOSITIVOS_FUENTES, DISPOSITIVOS_TEXTOS } from "./dispositivos.constants.js";
import { crearDispositivosRepository } from "./dispositivos.repository.js";

function limpiarTexto(valor, max = 120) {
  return String(valor || "").trim().slice(0, max);
}

function leerBooleano(valor) {
  return valor === true || valor === "true" || valor === "on";
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
      detalle: estado.puente.fuentePreferida === DISPOSITIVOS_FUENTES.MANUAL ? "Manual por ahora" : `Fuente: ${estado.puente.fuentePreferida}`,
      estado: "info"
    }
  };
}

export function crearDispositivosService(repository = crearDispositivosRepository()) {
  const cubittAdapter = crearCubittAdapter();
  const googleFitAdapter = crearGoogleFitAdapter();

  function obtenerEstado() {
    const estado = repository.obtenerEstado();
    return {
      ...estado,
      resumen: construirResumen(estado)
    };
  }

  function guardarPreparacion(datos = {}) {
    const anterior = repository.obtenerEstado();
    const cubitt = {
      ...anterior.cubitt,
      activo: leerBooleano(datos.cubittActivo),
      marca: limpiarTexto(datos.cubittMarca || anterior.cubitt.marca, 60),
      modelo: limpiarTexto(datos.cubittModelo || anterior.cubitt.modelo, 60),
      variante: limpiarTexto(datos.cubittVariante || anterior.cubitt.variante, 60),
      alias: limpiarTexto(datos.cubittAlias || anterior.cubitt.alias, 80),
      identificadorLocal: limpiarTexto(datos.cubittIdentificadorLocal, 80)
    };
    const googleFit = {
      ...anterior.googleFit,
      activo: leerBooleano(datos.googleFitActivo),
      cuenta: limpiarTexto(datos.googleFitCuenta, 120),
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
        resumen: construirResumen(estado)
      }
    };
  }

  return {
    obtenerEstado,
    guardarPreparacion
  };
}

export function obtenerResumenDispositivos() {
  return crearDispositivosService().obtenerEstado().resumen;
}
