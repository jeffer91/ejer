/*
  Nombre completo: rutinas.controller.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.controller.js

  Función o funciones:
    - Montar la pantalla Rutinas del módulo Entrenamiento.
    - Crear rutinas reales con datos del formulario.
    - Interpretar rutinas generadas por IA con el contrato FITJEFF_RUTINA_V1.
    - Preparar la rutina IA interpretada para cargarla en el formulario manual.
    - Guardar rutinas IA interpretadas como rutinas reales de FitJeff.
    - Editar ejercicios avanzados de rutinas IA sin perder bloques ni tipos.
    - Seleccionar manualmente qué día de rutina se debe cargar hoy en Diario.
    - Ejecutar diagnóstico rápido del flujo IA sin guardar datos.
    - Borrar rutinas con confirmación desde la pantalla.
    - Mostrar ayuda y vista mejorada para ejercicios por tiempo.
    - Editar, duplicar, activar, archivar y restaurar rutinas guardadas.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.service.js
    - src/features/entrenamiento/rutinas/rutinas.view.js
    - src/features/entrenamiento/rutinas/rutinas.parser.js
    - src/features/entrenamiento/rutinas/rutinas.ia.diagnostics.js
    - src/features/entrenamiento/rutinas/rutinas.delete-actions.js
    - src/features/entrenamiento/rutinas/rutinas.time-help.js
    - src/features/entrenamiento/rutinas/rutinas.time-view.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { insertarBotonesBorrarRutina } from "./rutinas.delete-actions.js";
import { ejecutarDiagnosticoRutinaIA, insertarPanelDiagnosticoRutinaIA } from "./rutinas.ia.diagnostics.js";
import { convertirRutinaIAATextoSimple, interpretarRutinaIA } from "./rutinas.parser.js";
import { crearRutinasService } from "./rutinas.service.js";
import { insertarAyudaTiempoRutinas } from "./rutinas.time-help.js";
import { mejorarVistaTiempoRutinas } from "./rutinas.time-view.js";
import { crearEntrenamientoRutinasView } from "./rutinas.view.js";

function primerEjercicioConValor(rutina, clave) {
  for (const dia of rutina?.dias || []) {
    for (const ejercicio of dia.ejercicios || []) {
      const valor = ejercicio?.[clave];
      if (valor !== null && valor !== undefined && valor !== "") return valor;
    }
  }

  return null;
}

function crearDatosFormularioDesdeRutinaIA(resultado) {
  const rutina = resultado?.rutina || {};
  const primerDia = (rutina.dias || [])[0] || {};
  const descanso = primerEjercicioConValor(rutina, "descansoSegundos") || 60;
  const series = primerEjercicioConValor(rutina, "series") || 3;
  const repeticiones = primerEjercicioConValor(rutina, "repeticiones") || 10;
  const medicion = primerEjercicioConValor(rutina, "medicion") || "repeticiones";
  const duracionMinutos = primerEjercicioConValor(rutina, "duracionMinutos") || 0;
  const duracionSegundos = primerEjercicioConValor(rutina, "duracionSegundos") || 0;
  const distanciaKm = primerEjercicioConValor(rutina, "distanciaKm") || "";

  return {
    nombre: rutina.nombre || "Rutina generada por IA",
    totalDias: String((rutina.dias || []).length || rutina.diasDeclarados || 1),
    calentamiento: primerDia.calentamiento || "",
    descansoSegundos: String(descanso),
    series: String(series),
    repeticiones: String(repeticiones),
    medicion: String(medicion),
    duracionMinutos: String(duracionMinutos),
    duracionSegundos: String(duracionSegundos),
    distanciaKm: String(distanciaKm || ""),
    ejerciciosTexto: convertirRutinaIAATextoSimple(rutina)
  };
}

export function crearEntrenamientoRutinasController() {
  const service = crearRutinasService();
  let contenedorActual = null;
  let mensajeActual = null;

  function interpretarTextoRutinaIA(textoFuente = "") {
    const resultado = interpretarRutinaIA(textoFuente);

    return {
      ...resultado,
      formulario: resultado.ok ? crearDatosFormularioDesdeRutinaIA(resultado) : null
    };
  }

  function guardarRutinaIA(resultadoIA) {
    return service.crearDesdeRutinaIA(resultadoIA);
  }

  function guardarRutinaManual(datos) {
    return service.crearDesdeFormulario(datos);
  }

  function diagnosticarFlujoIA() {
    return ejecutarDiagnosticoRutinaIA({
      interpretarTextoRutinaIA,
      puedeGuardar: true
    });
  }

  function refrescar(mensaje = mensajeActual) {
    if (!contenedorActual) return;

    mensajeActual = mensaje;
    contenedorActual.innerHTML = "";

    const rutinas = service.obtenerRutinas();
    const vista = crearEntrenamientoRutinasView({
      rutinas,
      mensaje,
      onInterpretarRutinaIA: interpretarTextoRutinaIA,
      onGuardarRutinaIA: (resultadoIA) => refrescar(guardarRutinaIA(resultadoIA)),
      onGuardar: (datos) => refrescar(guardarRutinaManual(datos)),
      onActivar: (rutinaId) => refrescar(service.activar(rutinaId)),
      onSeleccionarDia: (rutinaId, datos) => refrescar(service.seleccionarDia(rutinaId, datos)),
      onEditarNombre: (rutinaId, datos) => refrescar(service.editarNombre(rutinaId, datos)),
      onActualizarPlan: (rutinaId, datos) => refrescar(service.actualizarDesdeFormulario(rutinaId, datos)),
      onActualizarEjercicioAvanzado: (rutinaId, diaId, ejercicioId, datos) => refrescar(service.actualizarEjercicioAvanzado(rutinaId, diaId, ejercicioId, datos)),
      onDuplicar: (rutinaId) => refrescar(service.duplicar(rutinaId)),
      onArchivar: (rutinaId) => refrescar(service.archivar(rutinaId)),
      onRestaurar: (rutinaId) => refrescar(service.restaurar(rutinaId))
    });

    contenedorActual.appendChild(vista);
    insertarAyudaTiempoRutinas(vista);
    mejorarVistaTiempoRutinas(vista, {
      rutinas,
      onGuardar: (datos) => refrescar(guardarRutinaManual(datos))
    });
    insertarBotonesBorrarRutina(vista, {
      rutinas,
      onBorrar: (rutinaId) => refrescar(service.borrar(rutinaId))
    });
    insertarPanelDiagnosticoRutinaIA(vista, { onEjecutar: diagnosticarFlujoIA });
  }

  function montar(contenedor) {
    contenedorActual = contenedor;
    refrescar(null);
  }

  return {
    montar
  };
}
