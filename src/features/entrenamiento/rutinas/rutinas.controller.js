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
    - Editar, duplicar, activar, archivar y restaurar rutinas guardadas.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.service.js
    - src/features/entrenamiento/rutinas/rutinas.view.js
    - src/features/entrenamiento/rutinas/rutinas.parser.js
    - src/features/entrenamiento/entrenamiento.module.js
*/

import { convertirRutinaIAATextoSimple, interpretarRutinaIA } from "./rutinas.parser.js";
import { crearRutinasService } from "./rutinas.service.js";
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

  return {
    nombre: rutina.nombre || "Rutina generada por IA",
    totalDias: String((rutina.dias || []).length || rutina.diasDeclarados || 1),
    calentamiento: primerDia.calentamiento || "",
    descansoSegundos: String(descanso),
    series: String(series),
    repeticiones: String(repeticiones),
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

  function refrescar(mensaje = mensajeActual) {
    if (!contenedorActual) return;

    mensajeActual = mensaje;
    contenedorActual.innerHTML = "";
    contenedorActual.appendChild(crearEntrenamientoRutinasView({
      rutinas: service.obtenerRutinas(),
      mensaje,
      onInterpretarRutinaIA: interpretarTextoRutinaIA,
      onGuardarRutinaIA: (resultadoIA) => refrescar(guardarRutinaIA(resultadoIA)),
      onGuardar: (datos) => refrescar(service.crearDesdeFormulario(datos)),
      onActivar: (rutinaId) => refrescar(service.activar(rutinaId)),
      onEditarNombre: (rutinaId, datos) => refrescar(service.editarNombre(rutinaId, datos)),
      onActualizarPlan: (rutinaId, datos) => refrescar(service.actualizarDesdeFormulario(rutinaId, datos)),
      onActualizarEjercicioAvanzado: (rutinaId, diaId, ejercicioId, datos) => refrescar(service.actualizarEjercicioAvanzado(rutinaId, diaId, ejercicioId, datos)),
      onDuplicar: (rutinaId) => refrescar(service.duplicar(rutinaId)),
      onArchivar: (rutinaId) => refrescar(service.archivar(rutinaId)),
      onRestaurar: (rutinaId) => refrescar(service.restaurar(rutinaId))
    }));
  }

  function montar(contenedor) {
    contenedorActual = contenedor;
    refrescar(null);
  }

  return {
    montar
  };
}
