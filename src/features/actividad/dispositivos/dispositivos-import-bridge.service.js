/*
  Nombre completo: dispositivos-import-bridge.service.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos-import-bridge.service.js

  Función o funciones:
    - Crear un puente claro de importación para datos de actividad exportados desde reloj, Google Fit u otra fuente.
    - Leer datos pegados en formato CSV, líneas separadas por coma, punto y coma, tabulador o JSON simple.
    - Convertir filas importadas en registros diarios de Actividad sin crear pantallas técnicas.
    - Evitar duplicados usando la regla existente de un registro principal por fecha.
    - Marcar Actividad como módulo con cambios pendientes para sincronización futura.

  Se conecta con:
    - src/features/actividad/actividad.repository.js
    - src/features/actividad/actividad.constants.js
    - src/features/actividad/dispositivos/dispositivos.service.js
    - src/core/sync/sync-metadata.service.js
*/

import { crearSyncMetadataService, SYNC_MODULES } from "../../../core/sync/sync-metadata.service.js";
import { convertirAFechaSegura, formatearFechaLocalISO } from "../../../core/utils/date.util.js";
import { ACTIVIDAD_LIMITES, ACTIVIDAD_TIPOS } from "../actividad.constants.js";
import { crearActividadRepository } from "../actividad.repository.js";
import { DISPOSITIVOS_FUENTES } from "./dispositivos.constants.js";

const COLUMNAS = Object.freeze({
  FECHA: ["fecha", "date", "dia", "día", "day"],
  PASOS: ["pasos", "steps", "step", "cantidadpasos"],
  BICI_MIN: ["bicicletamin", "bicicleta_min", "bike_minutes", "bikemin", "cyclingmin", "minutosbicicleta", "min"],
  BICI_KM: ["bicicletakm", "bicicleta_km", "bike_km", "cyclingkm", "kilometrosbicicleta", "km"],
  NOTA: ["nota", "notes", "observacion", "observación", "comentario"],
  FUENTE: ["fuente", "source", "origen"]
});

function normalizarClave(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function numero(valor) {
  const normalizado = String(valor ?? "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .trim();
  const n = Number(normalizado);
  return Number.isFinite(n) && n > 0 ? Number(n.toFixed(2)) : 0;
}

function limitarNumero(valor, maximo) {
  return Math.min(numero(valor), maximo);
}

function detectarSeparador(linea) {
  if (linea.includes(";")) return ";";
  if (linea.includes("\t")) return "\t";
  return ",";
}

function partirLinea(linea, separador) {
  return String(linea || "")
    .split(separador)
    .map((item) => item.trim().replace(/^"|"$/g, ""));
}

function extraerCampoPorClaves(objeto = {}, claves = []) {
  const mapa = new Map();
  Object.entries(objeto).forEach(([clave, valor]) => mapa.set(normalizarClave(clave), valor));
  const claveEncontrada = claves.map(normalizarClave).find((clave) => mapa.has(clave));
  return claveEncontrada ? mapa.get(claveEncontrada) : "";
}

function normalizarFecha(valor) {
  const texto = String(valor || "").trim();
  const fechaDirecta = convertirAFechaSegura(texto);

  if (fechaDirecta) {
    return formatearFechaLocalISO(fechaDirecta);
  }

  const partes = texto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!partes) return "";

  const dia = Number(partes[1]);
  const mes = Number(partes[2]) - 1;
  const anio = Number(partes[3].length === 2 ? `20${partes[3]}` : partes[3]);
  const fecha = new Date(anio, mes, dia);

  return convertirAFechaSegura(fecha) ? formatearFechaLocalISO(fecha) : "";
}

function detectarTipo({ pasos, bicicletaMin, bicicletaKm }) {
  if (pasos > 0 && (bicicletaMin > 0 || bicicletaKm > 0)) return ACTIVIDAD_TIPOS.MIXTO;
  if (bicicletaMin > 0 || bicicletaKm > 0) return ACTIVIDAD_TIPOS.BICICLETA;
  return ACTIVIDAD_TIPOS.PASOS;
}

function normalizarFuente(valor, fuentePreferida) {
  const fuente = normalizarClave(valor || fuentePreferida || DISPOSITIVOS_FUENTES.MANUAL);
  if (fuente.includes("cubitt")) return DISPOSITIVOS_FUENTES.CUBITT;
  if (fuente.includes("google") || fuente.includes("fit")) return DISPOSITIVOS_FUENTES.GOOGLE_FIT;
  return fuentePreferida || DISPOSITIVOS_FUENTES.MANUAL;
}

function normalizarFila(fila = {}, fuentePreferida) {
  const fecha = normalizarFecha(extraerCampoPorClaves(fila, COLUMNAS.FECHA));
  const pasos = Math.round(limitarNumero(extraerCampoPorClaves(fila, COLUMNAS.PASOS), ACTIVIDAD_LIMITES.PASOS_MAX));
  const bicicletaMin = limitarNumero(extraerCampoPorClaves(fila, COLUMNAS.BICI_MIN), ACTIVIDAD_LIMITES.BICICLETA_MIN_MAX);
  const bicicletaKm = limitarNumero(extraerCampoPorClaves(fila, COLUMNAS.BICI_KM), ACTIVIDAD_LIMITES.BICICLETA_KM_MAX);
  const nota = String(extraerCampoPorClaves(fila, COLUMNAS.NOTA) || "Importado desde puente FitJeff").slice(0, ACTIVIDAD_LIMITES.NOTA_MAX);
  const fuente = normalizarFuente(extraerCampoPorClaves(fila, COLUMNAS.FUENTE), fuentePreferida);

  if (!fecha || (pasos <= 0 && bicicletaMin <= 0 && bicicletaKm <= 0)) {
    return null;
  }

  return {
    fecha,
    tipo: detectarTipo({ pasos, bicicletaMin, bicicletaKm }),
    pasos,
    bicicletaMin,
    bicicletaKm,
    nota,
    fuente,
    origen: "puente-dispositivos",
    importado: true,
    importadoEn: new Date().toISOString()
  };
}

function parsearJson(texto, fuentePreferida) {
  const data = JSON.parse(texto);
  const filas = Array.isArray(data) ? data : Array.isArray(data.registros) ? data.registros : [];
  return filas.map((fila) => normalizarFila(fila, fuentePreferida)).filter(Boolean);
}

function parsearTabla(texto, fuentePreferida) {
  const lineas = String(texto || "")
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter(Boolean);

  if (lineas.length < 2) return [];

  const separador = detectarSeparador(lineas[0]);
  const cabeceras = partirLinea(lineas[0], separador);

  return lineas.slice(1).map((linea) => {
    const valores = partirLinea(linea, separador);
    const fila = {};
    cabeceras.forEach((cabecera, index) => {
      fila[cabecera] = valores[index] || "";
    });
    return normalizarFila(fila, fuentePreferida);
  }).filter(Boolean);
}

function parsearTexto(texto, fuentePreferida) {
  const limpio = String(texto || "").trim();
  if (!limpio) return [];

  if (limpio.startsWith("[") || limpio.startsWith("{")) {
    return parsearJson(limpio, fuentePreferida);
  }

  return parsearTabla(limpio, fuentePreferida);
}

export function crearDispositivosImportBridgeService(
  repository = crearActividadRepository(),
  syncMetadata = crearSyncMetadataService()
) {
  function importarTexto(texto, { fuentePreferida = DISPOSITIVOS_FUENTES.MANUAL } = {}) {
    try {
      const registros = parsearTexto(texto, fuentePreferida);

      if (registros.length === 0) {
        return {
          ok: false,
          mensaje: "No se encontraron filas válidas para importar.",
          importados: 0,
          actualizados: 0
        };
      }

      let nuevos = 0;
      let actualizados = 0;

      registros.forEach((registro) => {
        const resultado = repository.guardarOActualizarPorFecha(registro);
        if (resultado.actualizado) actualizados += 1;
        else nuevos += 1;
      });

      syncMetadata.marcarModuloSucio(SYNC_MODULES.ACTIVIDAD, "Actividad importada desde puente de dispositivos");

      return {
        ok: true,
        mensaje: `Importación lista: ${registros.length} fila(s), ${nuevos} nueva(s), ${actualizados} actualizada(s).`,
        importados: registros.length,
        nuevos,
        actualizados
      };
    } catch (error) {
      return {
        ok: false,
        mensaje: "No se pudo importar. Revisa que el texto sea CSV o JSON válido.",
        detalle: error?.message || "Error de importación",
        importados: 0,
        actualizados: 0
      };
    }
  }

  function ejemploCsv() {
    return "fecha,pasos,bicicletaMin,bicicletaKm,fuente,nota\n2026-06-28,8200,0,0,cubitt,Importado desde reloj\n2026-06-29,6000,25,8.5,google-fit,Actividad mixta";
  }

  return {
    importarTexto,
    ejemploCsv
  };
}
