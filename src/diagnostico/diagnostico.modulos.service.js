/*
  Nombre completo: diagnostico.modulos.service.js
  Ruta o ubicación: src/diagnostico/diagnostico.modulos.service.js

  Función:
    - Verificar que los módulos principales de FitJeff puedan importarse.
    - Revisar exports mínimos esperados.
    - Detectar rutas rotas sin depender de app-controller.

  Se conecta con:
    - src/diagnostico/diagnostico.schema.js
    - src/diagnostico/diagnostico.completo.service.js
*/

import { DIAGNOSTICO_AREAS, DIAGNOSTICO_NIVELES, crearResultadoDiagnostico } from "./diagnostico.schema.js";

const MODULOS_CRITICOS = [
  {
    id: "app-controller",
    ruta: "../app-controller.js",
    exports: ["iniciarFitJeff"]
  },
  {
    id: "router",
    ruta: "../ui/router.js",
    exports: ["VISTAS_APP", "navegarA"]
  },
  {
    id: "menu",
    ruta: "../ui/menu.js",
    exports: ["MENU_PRINCIPAL"]
  },
  {
    id: "storage-local",
    ruta: "../storage/local-storage.service.js",
    exports: ["cargarEstadoLocal", "guardarEstadoLocal"]
  },
  {
    id: "rutinas",
    ruta: "../vistas/rutinas.view.js",
    exports: ["renderRutinasView"]
  },
  {
    id: "medidas",
    ruta: "../vistas/medidas.view.js",
    exports: ["renderMedidasView"]
  },
  {
    id: "reportes",
    ruta: "../vistas/reportes.view.js",
    exports: ["renderReportesView"]
  },
  {
    id: "jarvis",
    ruta: "../vistas/jarvis.view.js",
    exports: ["renderJarvisView"]
  },
  {
    id: "dashboard",
    ruta: "../dashboard/dashboard.service.js",
    exports: ["prepararDashboard"]
  },
  {
    id: "diagnostico",
    ruta: "./diagnostico.completo.service.js",
    exports: ["ejecutarDiagnosticoCompleto"]
  }
];

export async function diagnosticarModulos() {
  const resultados = [];

  for (const modulo of MODULOS_CRITICOS) {
    resultados.push(await probarModulo(modulo));
  }

  return resultados;
}

export function obtenerModulosCriticos() {
  return MODULOS_CRITICOS.map((item) => ({ ...item }));
}

async function probarModulo(modulo) {
  try {
    const importado = await import(modulo.ruta);
    const faltantes = modulo.exports.filter((nombre) => !(nombre in importado));

    if (faltantes.length) {
      return crearResultadoDiagnostico({
        id: `modulo-${modulo.id}`,
        area: DIAGNOSTICO_AREAS.MODULOS,
        ok: false,
        titulo: `Módulo ${modulo.id}`,
        mensaje: `El módulo carga, pero faltan exports: ${faltantes.join(", ")}.`,
        solucion: "Revisar exports del archivo indicado.",
        detalle: {
          ruta: modulo.ruta,
          faltantes
        }
      });
    }

    return crearResultadoDiagnostico({
      id: `modulo-${modulo.id}`,
      area: DIAGNOSTICO_AREAS.MODULOS,
      ok: true,
      titulo: `Módulo ${modulo.id}`,
      mensaje: "Importación correcta y exports disponibles.",
      detalle: {
        ruta: modulo.ruta,
        exports: modulo.exports
      }
    });
  } catch (error) {
    return crearResultadoDiagnostico({
      id: `modulo-${modulo.id}`,
      area: DIAGNOSTICO_AREAS.MODULOS,
      ok: false,
      nivel: DIAGNOSTICO_NIVELES.ERROR,
      titulo: `Módulo ${modulo.id}`,
      mensaje: error.message || "No se pudo importar el módulo.",
      solucion: "Revisar ruta, sintaxis del archivo y dependencias importadas.",
      detalle: {
        ruta: modulo.ruta
      }
    });
  }
}
