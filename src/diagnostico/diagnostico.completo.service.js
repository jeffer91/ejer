/*
  Nombre completo: diagnostico.completo.service.js
  Ruta o ubicación: src/diagnostico/diagnostico.completo.service.js

  Función:
    - Ejecutar diagnóstico completo de FitJeff.
    - Combinar arranque, módulos, datos locales, PWA, Firebase y navegador.
    - Entregar resumen listo para vista, copia o exportación.

  Se conecta con:
    - src/diagnostico/arranque-check.service.js
    - src/diagnostico/diagnostico.modulos.service.js
    - src/diagnostico/diagnostico.pwa.service.js
    - src/diagnostico/diagnostico.firebase.service.js
    - src/vistas/diagnostico.view.js
*/

import { ejecutarDiagnosticoArranque } from "./arranque-check.service.js";
import { diagnosticarModulos } from "./diagnostico.modulos.service.js";
import { diagnosticarPWA } from "./diagnostico.pwa.service.js";
import { diagnosticarFirebase } from "./diagnostico.firebase.service.js";
import {
  DIAGNOSTICO_AREAS,
  DIAGNOSTICO_NIVELES,
  crearDiagnosticoBase,
  crearResultadoDiagnostico
} from "./diagnostico.schema.js";
import { cargarEstadoLocal } from "../storage/local-storage.service.js";

export async function ejecutarDiagnosticoCompleto() {
  const resultados = [];

  resultados.push(...diagnosticarNavegador());
  resultados.push(...diagnosticarDatosLocales());
  resultados.push(...normalizarArranque(ejecutarDiagnosticoArranque()));
  resultados.push(...(await diagnosticarModulos()));
  resultados.push(...(await diagnosticarPWA()));
  resultados.push(...(await diagnosticarFirebase()));
  resultados.push(...diagnosticarRendimiento());

  return crearDiagnosticoBase(resultados);
}

export function crearDiagnosticoTexto(diagnostico) {
  const resumen = diagnostico?.resumen || {};

  return [
    "DIAGNÓSTICO FITJEFF",
    "",
    `Estado: ${diagnostico?.ok ? "OK" : "REVISAR"}`,
    `Total: ${resumen.total || 0}`,
    `Correctos: ${resumen.correctos || 0}`,
    `Advertencias: ${resumen.advertencias || 0}`,
    `Errores: ${resumen.errores || 0}`,
    `Generado: ${diagnostico?.generadoEn || ""}`,
    "",
    "Resultados:",
    ...(diagnostico?.resultados || []).map((item) =>
      `- [${item.nivel}] ${item.area}/${item.id}: ${item.mensaje}${item.solucion ? ` | Solución: ${item.solucion}` : ""}`
    )
  ].join("\n");
}

function diagnosticarNavegador() {
  return [
    crearResultadoDiagnostico({
      id: "navegador-user-agent",
      area: DIAGNOSTICO_AREAS.NAVEGADOR,
      ok: true,
      nivel: DIAGNOSTICO_NIVELES.INFO,
      titulo: "Navegador",
      mensaje: navigator.userAgent,
      detalle: {
        idioma: navigator.language,
        online: navigator.onLine,
        plataforma: navigator.platform
      }
    }),
    crearResultadoDiagnostico({
      id: "navegador-online",
      area: DIAGNOSTICO_AREAS.NAVEGADOR,
      ok: true,
      nivel: navigator.onLine ? DIAGNOSTICO_NIVELES.OK : DIAGNOSTICO_NIVELES.WARNING,
      titulo: "Conexión",
      mensaje: navigator.onLine ? "El navegador reporta conexión activa." : "El navegador reporta modo sin conexión."
    })
  ];
}

function diagnosticarDatosLocales() {
  try {
    const estado = cargarEstadoLocal();
    const entrenamientos = Array.isArray(estado.entrenamientos) ? estado.entrenamientos : [];
    const pesos = Array.isArray(estado.pesos) ? estado.pesos : [];
    const rutinaOk = Array.isArray(estado.rutina?.dias) && estado.rutina.dias.length > 0;

    return [
      crearResultadoDiagnostico({
        id: "datos-estado-local",
        area: DIAGNOSTICO_AREAS.DATOS,
        ok: Boolean(estado),
        titulo: "Estado local",
        mensaje: "Estado local leído correctamente.",
        detalle: {
          entrenamientos: entrenamientos.length,
          pesos: pesos.length,
          rutinaDias: estado.rutina?.dias?.length || 0
        }
      }),
      crearResultadoDiagnostico({
        id: "datos-rutina",
        area: DIAGNOSTICO_AREAS.DATOS,
        ok: rutinaOk,
        titulo: "Rutina local",
        mensaje: rutinaOk ? "Rutina local disponible." : "No hay rutina local válida.",
        solucion: rutinaOk ? "" : "Restaurar datos base o importar una rutina."
      })
    ];
  } catch (error) {
    return [
      crearResultadoDiagnostico({
        id: "datos-estado-local",
        area: DIAGNOSTICO_AREAS.DATOS,
        ok: false,
        titulo: "Estado local",
        mensaje: error.message || "No se pudo leer estado local.",
        solucion: "Revisar localStorage o restaurar datos."
      })
    ];
  }
}

function normalizarArranque(diagnosticoArranque) {
  return (diagnosticoArranque?.resultados || []).map((item) =>
    crearResultadoDiagnostico({
      id: `arranque-${item.id}`,
      area: DIAGNOSTICO_AREAS.ARRANQUE,
      ok: item.ok,
      nivel: item.nivel,
      titulo: item.id,
      mensaje: item.mensaje,
      detalle: item
    })
  );
}

function diagnosticarRendimiento() {
  const memoria = performance?.memory;

  return [
    crearResultadoDiagnostico({
      id: "rendimiento-performance",
      area: DIAGNOSTICO_AREAS.RENDIMIENTO,
      ok: true,
      nivel: DIAGNOSTICO_NIVELES.INFO,
      titulo: "Performance API",
      mensaje: "Performance API disponible.",
      detalle: {
        tiempoCargaMs: Math.round(performance.now()),
        memoriaDisponible: Boolean(memoria),
        memoria: memoria
          ? {
              jsHeapSizeLimit: memoria.jsHeapSizeLimit,
              totalJSHeapSize: memoria.totalJSHeapSize,
              usedJSHeapSize: memoria.usedJSHeapSize
            }
          : null
      }
    })
  ];
}
