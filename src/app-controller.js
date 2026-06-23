/*
  Nombre completo: app-controller.js
  Ruta o ubicación: src/app-controller.js

  Función:
    - Controlar el flujo principal de FitJeff con módulos separados.
    - Cargar y guardar estado local.
    - Conectar layout, router, vistas, formularios, PWA, actualizaciones, exportación, diagnóstico, sincronización y Jarvis.
    - Evitar que un error de Firebase, PWA, actualización o voz rompa el arranque principal.

  Se conecta con:
    - src/app.js
    - src/storage/local-storage.service.js
    - src/ui/router.js
    - src/ui/layout.js
    - src/ui/modal.js
    - src/vistas/*.view.js
    - src/jarvis/*.js
*/

import {
  cargarEstadoLocal,
  guardarEstadoLocal,
  borrarEstadoLocal,
  marcarErrorSincronizacionLocal,
  marcarSincronizacionLocal
} from "./storage/local-storage.service.js";
import { renderizarLayout, renderizarEnVista, actualizarEstadoSincronizacion } from "./ui/layout.js";
import { activarRouterDelegado, navegarA, registrarVistas, restaurarVistaGuardada, VISTAS_APP } from "./ui/router.js";
import { asegurarEstilosModal, mostrarConfirmacion, mostrarMensaje } from "./ui/modal.js";
import { leerFormulario, leerBooleano, leerNumero } from "./ui/helpers.js";

import { renderInicioView } from "./vistas/inicio.view.js";
import { renderEntrenarView } from "./vistas/entrenar.view.js";
import { renderPesoView } from "./vistas/peso.view.js";
import { renderEstadisticasView } from "./vistas/estadisticas.view.js";
import { renderRecomendacionesView } from "./vistas/recomendaciones.view.js";
import { renderAjustesView } from "./vistas/ajustes.view.js";
import { renderJarvisView } from "./vistas/jarvis.view.js";

import { crearRegistroPeso } from "./peso/peso.service.js";
import { normalizarEntrenamiento, calcularSiguienteDiaRutina } from "./entrenamiento/entrenamiento.service.js";
import { TIPOS_EJERCICIO } from "./data/rutina-base.js";
import { crearRegistroRecomendacionLocal, prepararSolicitudGemini } from "./recomendaciones/recomendaciones.service.js";
import { sincronizarEstadoConFirebase } from "./sincronizacion/sincronizacion.service.js";
import { guardarEstadisticasEnFirebase } from "./estadisticas/estadisticas.service.js";
import { inicializarPWA, instalarPWA, aplicarActualizacionPWA, escucharEstadoPWA } from "./pwa/pwa.service.js";
import { actualizarApp, revisarActualizacion } from "./actualizaciones/actualizaciones.service.js";
import { exportarDatosCompletos } from "./exportacion/exportacion.service.js";
import { imprimirDiagnosticoArranque } from "./diagnostico/arranque-check.service.js";

import { JARVIS_ACCIONES } from "./jarvis/jarvis.config.js";
import { activarJarvis, desactivarJarvis, obtenerEstadoJarvis, guardarComandoJarvis } from "./jarvis/jarvis.estado.js";
import { inicializarVozJarvis, hablarJarvis, escucharJarvis, detenerEscuchaJarvis, detenerVozJarvis } from "./jarvis/jarvis.voz.service.js";
import { interpretarComandoJarvis } from "./jarvis/jarvis.comandos.js";
import { iniciarEntrenamientoConJarvis, procesarRespuestaEntrenamientoJarvis } from "./jarvis/jarvis.entrenamiento.js";
import { crearNotaJarvis, extraerNotaDesdeComando } from "./jarvis/jarvis.notas.service.js";

export const APP_VERSION = "0.1.0";

let estado = cargarEstadoLocal();
let eventosActivos = false;

export async function iniciarFitJeff() {
  asegurarEstilosModal();
  imprimirDiagnosticoArranque();

  renderizarLayout({
    version: APP_VERSION,
    estadoSync: estado.ajustes?.usarFirebase ? "local" : "solo local"
  });

  registrarVistas({
    [VISTAS_APP.INICIO]: () => renderizarVista(renderInicioView),
    [VISTAS_APP.ENTRENAR]: () => renderizarVista(renderEntrenarView),
    [VISTAS_APP.PESO]: () => renderizarVista(renderPesoView),
    [VISTAS_APP.ESTADISTICAS]: () => renderizarVista(renderEstadisticasView),
    [VISTAS_APP.RECOMENDACIONES]: () => renderizarVista(renderRecomendacionesView),
    [VISTAS_APP.JARVIS]: () => renderizarVista(renderJarvisView),
    [VISTAS_APP.AJUSTES]: () => renderizarVista(renderAjustesView)
  });

  activarRouterDelegado(document.body);
  activarEventosApp();
  activarPWAConProteccion();

  const vistaInicial = obtenerVistaInicial();
  navegarA(vistaInicial);

  if (estado.ajustes?.usarFirebase && estado.ajustes?.sincronizarAutomaticamente) {
    sincronizarSilencioso();
  }
}

export function obtenerEstadoFitJeff() {
  return estado;
}

export function reemplazarEstadoFitJeff(nuevoEstado) {
  estado = nuevoEstado;
  guardarEstadoLocal(estado);
  navegarA(restaurarVistaGuardada());
  return estado;
}

function renderizarVista(render) {
  renderizarEnVista(render(estado));
}

function activarEventosApp() {
  if (eventosActivos) {
    return;
  }

  eventosActivos = true;

  document.body.addEventListener("click", async (event) => {
    const accion = event.target.closest("[data-action]")?.dataset.action;

    if (!accion) {
      return;
    }

    try {
      if (accion === "guardar-peso") await accionGuardarPeso();
      if (accion === "guardar-entrenamiento") await accionGuardarEntrenamiento();
      if (accion === "guardar-ajustes") await accionGuardarAjustes();
      if (accion === "generar-recomendacion-local") await accionGenerarRecomendacionLocal();
      if (accion === "preparar-gemini") await accionPrepararGemini();
      if (accion === "sincronizar-ahora") await accionSincronizarAhora();
      if (accion === "guardar-estadisticas") await accionGuardarEstadisticas();
      if (accion === "revisar-actualizacion") await accionRevisarActualizacion();
      if (accion === "actualizar-app") await accionActualizarApp();
      if (accion === "instalar-pwa") await accionInstalarPWA();
      if (accion === "aplicar-actualizacion-pwa") await accionAplicarActualizacionPWA();
      if (accion === "exportar-datos") accionExportarDatos();
      if (accion === "borrar-datos-locales") accionBorrarDatosLocales();

      if (accion === "jarvis-activar") await accionJarvisActivar();
      if (accion === "jarvis-escuchar") await accionJarvisEscuchar();
      if (accion === "jarvis-iniciar-entrenamiento") await accionJarvisIniciarEntrenamiento();
      if (accion === "jarvis-detener") await accionJarvisDetener();
      if (accion === "jarvis-respuesta-si") await accionJarvisManual(JARVIS_ACCIONES.RESPUESTA_SI);
      if (accion === "jarvis-respuesta-no") await accionJarvisManual(JARVIS_ACCIONES.RESPUESTA_NO);
      if (accion === "jarvis-repetir") await accionJarvisManual(JARVIS_ACCIONES.REPETIR);
      if (accion === "jarvis-pausar") await accionJarvisManual(JARVIS_ACCIONES.PAUSAR);
      if (accion === "jarvis-continuar") await accionJarvisManual(JARVIS_ACCIONES.CONTINUAR);
      if (accion === "jarvis-terminar") await accionJarvisManual(JARVIS_ACCIONES.TERMINAR);
      if (accion === "jarvis-guardar-nota") await accionJarvisGuardarNota();
    } catch (error) {
      console.error(`Error ejecutando acción ${accion}.`, error);
      mostrarMensaje("Acción no completada", error.message || "Ocurrió un error.", "error");
    }
  });

  document.body.addEventListener("change", (event) => {
    if (event.target.matches("#selector-dia-entrenamiento")) {
      estado.diaSeleccionado = Number(event.target.value || 1);
      guardarEstadoLocal(estado);
      navegarA(VISTAS_APP.ENTRENAR);
    }
  });
}

async function activarPWAConProteccion() {
  try {
    escucharEstadoPWA((tipo, payload) => {
      if (tipo === "actualizacion-disponible") {
        mostrarMensaje("Actualización disponible", payload.mensaje || "Hay una nueva versión lista.", "ok");
      }
    });

    await inicializarPWA();
  } catch (error) {
    console.warn("PWA no se pudo activar, pero la app sigue funcionando.", error);
  }
}

async function accionGuardarPeso() {
  const datos = leerFormulario("#form-peso");
  const resultado = crearRegistroPeso(datos);

  if (!resultado.ok) {
    mostrarMensaje("Peso no guardado", resultado.errores.join("\n"), "error");
    return;
  }

  estado.pesos.unshift(resultado.registro);
  estado.usuario.perfil.pesoActualKg = resultado.registro.pesoKg;
  guardarEstadoLocal(estado);
  await sincronizarSilencioso();
  mostrarMensaje("Peso guardado", "El registro de peso quedó guardado correctamente.", "ok");
  navegarA(VISTAS_APP.PESO);
}

async function accionGuardarEntrenamiento() {
  const form = document.getElementById("form-entrenamiento");

  if (!form) {
    mostrarMensaje("Sin formulario", "No se encontró el formulario de entrenamiento.", "error");
    return;
  }

  const datos = leerFormulario(form);
  const dia = estado.rutina.dias.find((item) => Number(item.numero) === Number(datos.diaRutina));

  if (!dia) {
    mostrarMensaje("Día no válido", "No se encontró el día de rutina seleccionado.", "error");
    return;
  }

  const entrenamiento = normalizarEntrenamiento({
    id: `entrenamiento_${Date.now()}`,
    fecha: datos.fecha,
    diaRutina: Number(datos.diaRutina),
    nombreDia: datos.nombreDia || dia.nombre,
    estado: datos.estado,
    duracionMin: leerNumero(datos.duracionMin, dia.duracionEstimadaMin),
    energiaInicial: datos.energiaInicial,
    energiaFinal: datos.energiaFinal,
    esfuerzoGeneral: datos.esfuerzoGeneral,
    dolor: datos.dolor === "si",
    zonaDolor: datos.zonaDolor || "",
    observacion: datos.observacion || "",
    ejercicios: dia.ejercicios.map((ejercicio) => leerEjercicioDesdeFormulario(ejercicio, datos)),
    creadoEn: new Date().toISOString(),
    sincronizado: false
  });

  estado.entrenamientos.unshift(entrenamiento);
  estado.rutina.diaActual = calcularSiguienteDiaRutina(entrenamiento.diaRutina);
  estado.diaSeleccionado = estado.rutina.diaActual;
  guardarEstadoLocal(estado);
  await sincronizarSilencioso();
  mostrarMensaje("Entrenamiento guardado", "El entrenamiento quedó registrado correctamente.", "ok");
  navegarA(VISTAS_APP.INICIO);
}

function leerEjercicioDesdeFormulario(ejercicio, datos) {
  if (ejercicio.tipoRegistro === TIPOS_EJERCICIO.CARDIO) {
    return {
      id: ejercicio.id,
      nombre: ejercicio.nombre,
      tipoRegistro: ejercicio.tipoRegistro,
      minutosObjetivo: ejercicio.minutosObjetivo,
      minutosCompletados: leerNumero(datos[`ex_${ejercicio.id}_minutos`], 0),
      intensidadReal: datos[`ex_${ejercicio.id}_intensidad`] || "media",
      seDetuvo: datos[`ex_${ejercicio.id}_detencion`] === "si"
    };
  }

  if (ejercicio.tipoRegistro === TIPOS_EJERCICIO.HIIT) {
    return {
      id: ejercicio.id,
      nombre: ejercicio.nombre,
      tipoRegistro: ejercicio.tipoRegistro,
      rondasObjetivo: ejercicio.rondasObjetivo,
      rondasCompletadas: leerNumero(datos[`ex_${ejercicio.id}_rondas`], 0),
      intensidadReal: datos[`ex_${ejercicio.id}_intensidad`] || "alta",
      seDetuvo: datos[`ex_${ejercicio.id}_detencion`] === "si"
    };
  }

  const series = Array.from({ length: ejercicio.seriesObjetivo || 3 }, (_, index) => {
    const numero = index + 1;
    return {
      numero,
      valor: leerNumero(datos[`ex_${ejercicio.id}_serie_${numero}`], 0),
      unidad: ejercicio.unidad,
      falloTecnico: leerBooleano(datos[`ex_${ejercicio.id}_fallo_${numero}`])
    };
  });

  return {
    id: ejercicio.id,
    nombre: ejercicio.nombre,
    tipoRegistro: ejercicio.tipoRegistro,
    unidad: ejercicio.unidad,
    series
  };
}

async function accionGuardarAjustes() {
  const datos = leerFormulario("#form-ajustes");
  const usarFirebase = leerBooleano(datos.usarFirebase);

  estado.ajustes = {
    ...estado.ajustes,
    usarFirebase,
    usarGemini: leerBooleano(datos.usarGemini),
    guardarLocalAutomatico: leerBooleano(datos.guardarLocalAutomatico),
    sincronizarAutomaticamente: usarFirebase && leerBooleano(datos.sincronizarAutomaticamente),
    mostrarRecomendaciones: leerBooleano(datos.mostrarRecomendaciones),
    mostrarEstadisticas: leerBooleano(datos.mostrarEstadisticas)
  };

  guardarEstadoLocal(estado);
  actualizarEstadoSincronizacion({ estado: usarFirebase ? "firebase activo" : "solo local" });
  mostrarMensaje("Ajustes guardados", "La configuración quedó actualizada.", "ok");
  navegarA(VISTAS_APP.AJUSTES);
}

async function accionGenerarRecomendacionLocal() {
  const datos = leerFormulario("#form-recomendacion");
  const registro = crearRegistroRecomendacionLocal(estado, datos.observacionUsuario || "");

  estado.recomendaciones.unshift(registro);
  guardarEstadoLocal(estado);
  await sincronizarSilencioso();
  mostrarMensaje("Recomendación guardada", "Se generó una recomendación local con tus datos actuales.", "ok");
  navegarA(VISTAS_APP.RECOMENDACIONES);
}

async function accionPrepararGemini() {
  const datos = leerFormulario("#form-recomendacion");
  const solicitud = prepararSolicitudGemini(estado, datos.observacionUsuario || "");
  mostrarMensaje("Solicitud Gemini preparada", solicitud.prompt.slice(0, 1000), "ok");
}

async function accionSincronizarAhora() {
  if (!estado.ajustes?.usarFirebase) {
    mostrarMensaje("Sincronización desactivada", "Firebase está desactivado en Ajustes. Tus datos siguen guardados localmente.", "error");
    return;
  }

  try {
    const resultado = await sincronizarEstadoConFirebase({
      estado,
      guardarLocal: () => guardarEstadoLocal(estado),
      onCambio: (resumen) => actualizarEstadoSincronizacion({ estado: resumen.estado })
    });

    if (resultado.ok) {
      estado = marcarSincronizacionLocal(estado);
    } else {
      estado = marcarErrorSincronizacionLocal(estado, resultado.errores?.join("\n") || "Sincronización pendiente.");
    }

    actualizarEstadoSincronizacion({ estado: resultado.estado });
    mostrarMensaje(resultado.ok ? "Sincronización lista" : "Sincronización pendiente", resultado.errores?.join("\n") || "Proceso finalizado.", resultado.ok ? "ok" : "error");
  } catch (error) {
    estado = marcarErrorSincronizacionLocal(estado, error.message);
    actualizarEstadoSincronizacion({ estado: "error" });
    mostrarMensaje("Sincronización no completada", error.message || "Firebase no respondió.", "error");
  }
}

async function sincronizarSilencioso() {
  if (!estado.ajustes?.usarFirebase || !estado.ajustes?.sincronizarAutomaticamente) {
    return null;
  }

  try {
    const resultado = await sincronizarEstadoConFirebase({
      estado,
      guardarLocal: () => guardarEstadoLocal(estado),
      onCambio: (resumen) => actualizarEstadoSincronizacion({ estado: resumen.estado })
    });

    if (resultado.ok) {
      estado = marcarSincronizacionLocal(estado);
    } else {
      estado = marcarErrorSincronizacionLocal(estado, resultado.errores?.join("\n"));
    }

    actualizarEstadoSincronizacion({ estado: resultado.estado });
    return resultado;
  } catch (error) {
    estado = marcarErrorSincronizacionLocal(estado, error.message);
    actualizarEstadoSincronizacion({ estado: "local" });
    console.warn("Sincronización silenciosa no completada.", error);
    return null;
  }
}

async function accionGuardarEstadisticas() {
  if (!estado.ajustes?.usarFirebase) {
    mostrarMensaje("Firebase desactivado", "Activa Firebase en Ajustes antes de guardar estadísticas en la nube.", "error");
    return;
  }

  try {
    const resultado = await guardarEstadisticasEnFirebase(estado);
    mostrarMensaje("Estadísticas guardadas", resultado.ok ? "Resumen enviado a Firebase." : "No se pudo guardar.", resultado.ok ? "ok" : "error");
  } catch (error) {
    mostrarMensaje("Estadísticas no guardadas", error.message || "No se pudo guardar en Firebase.", "error");
  }
}

async function accionRevisarActualizacion() {
  const resultado = await revisarActualizacion();
  mostrarMensaje("Actualización", resultado.mensaje, resultado.ok ? "ok" : "error");
}

async function accionActualizarApp() {
  const resultado = await actualizarApp();

  if (resultado?.ok === false) {
    mostrarMensaje("Actualización", resultado.mensaje || "No se pudo actualizar.", "error");
  }
}

async function accionInstalarPWA() {
  const resultado = await instalarPWA();
  mostrarMensaje("Instalación", resultado.mensaje, resultado.ok ? "ok" : "error");
}

async function accionAplicarActualizacionPWA() {
  await aplicarActualizacionPWA();
}

function accionExportarDatos() {
  const resultado = exportarDatosCompletos(estado);
  mostrarMensaje("Exportación lista", `Archivos generados: ${resultado.archivos.join(", ")}`, "ok");
}

function accionBorrarDatosLocales() {
  mostrarConfirmacion({
    titulo: "Borrar datos locales",
    mensaje: "Esto eliminará los datos guardados en este dispositivo. Exporta antes si necesitas respaldo.",
    textoAceptar: "Borrar",
    textoCancelar: "Cancelar",
    onAceptar: () => {
      estado = borrarEstadoLocal();
      guardarEstadoLocal(estado);
      navegarA(VISTAS_APP.INICIO);
    }
  });
}

async function accionJarvisActivar() {
  activarJarvis();
  const soporte = await inicializarVozJarvis();

  if (!soporte.sintesis) {
    mostrarMensaje("Jarvis activado sin voz", "Tu navegador no permite voz, pero puedes usar los botones manuales.", "error");
    navegarA(VISTAS_APP.JARVIS);
    return;
  }

  await hablarJarvis("Jarvis listo. Puedo guiar tu entrenamiento paso a paso.");
  navegarA(VISTAS_APP.JARVIS);
}

async function accionJarvisEscuchar() {
  activarJarvis();
  await inicializarVozJarvis();
  await hablarJarvis("Te escucho.");
  const resultado = await escucharJarvis();

  if (!resultado.ok) {
    mostrarMensaje("Jarvis no escuchó", resultado.mensaje || "No se recibió comando.", "error");
    navegarA(VISTAS_APP.JARVIS);
    return;
  }

  const comando = interpretarComandoJarvis(resultado.texto);
  guardarComandoJarvis(comando);
  await manejarComandoJarvis(comando);
  navegarA(VISTAS_APP.JARVIS);
}

async function manejarComandoJarvis(comando) {
  if (!comando) {
    return;
  }

  if (comando.accion === JARVIS_ACCIONES.INICIAR_ENTRENAMIENTO) {
    await accionJarvisIniciarEntrenamiento();
    return;
  }

  if (comando.accion === JARVIS_ACCIONES.ACTIVAR) {
    await hablarJarvis("Estoy listo.");
    return;
  }

  if (comando.accion === JARVIS_ACCIONES.NOTA) {
    const textoNota = extraerNotaDesdeComando(comando.original);
    const resultadoNota = crearNotaJarvis(textoNota || comando.textoUtil || comando.original);
    await hablarJarvis(resultadoNota.ok ? "Nota guardada." : "No pude guardar la nota.");
    return;
  }

  const estadoJarvis = obtenerEstadoJarvis();

  if (estadoJarvis.entrenamientoActivo || comando.accion !== JARVIS_ACCIONES.DESCONOCIDO) {
    await procesarRespuestaEntrenamientoJarvis(comando);
    return;
  }

  await hablarJarvis("No entendí bien. Puedes decir: iniciar entrenamiento, sí, no, repetir, pausar, continuar o terminar.");
}

async function accionJarvisIniciarEntrenamiento() {
  activarJarvis();
  await inicializarVozJarvis();

  const dia = Number(estado.diaSeleccionado || estado.rutina?.diaActual || 1);
  const resultado = await iniciarEntrenamientoConJarvis(estado.rutina, dia);

  if (!resultado.ok) {
    mostrarMensaje("Jarvis no inició", resultado.mensaje || "No se pudo iniciar.", "error");
  }

  navegarA(VISTAS_APP.JARVIS);
}

async function accionJarvisDetener() {
  detenerEscuchaJarvis();
  detenerVozJarvis();
  desactivarJarvis();
  mostrarMensaje("Jarvis detenido", "El asistente quedó apagado.", "ok");
  navegarA(VISTAS_APP.JARVIS);
}

async function accionJarvisManual(accion) {
  activarJarvis();
  guardarComandoJarvis({
    accion,
    original: accion,
    normalizado: accion,
    confianza: 1,
    creadoEn: new Date().toISOString()
  });

  await procesarRespuestaEntrenamientoJarvis({
    accion,
    original: accion,
    normalizado: accion,
    confianza: 1
  });

  navegarA(VISTAS_APP.JARVIS);
}

async function accionJarvisGuardarNota() {
  const textarea = document.getElementById("jarvis-nota");
  const texto = textarea?.value || "";
  const resultado = crearNotaJarvis(texto);

  if (!resultado.ok) {
    mostrarMensaje("Nota no guardada", resultado.mensaje, "error");
    return;
  }

  if (textarea) {
    textarea.value = "";
  }

  mostrarMensaje("Nota guardada", "La observación quedó guardada localmente.", "ok");
  navegarA(VISTAS_APP.JARVIS);
}

function obtenerVistaInicial() {
  const hash = String(location.hash || "").replace("#", "").trim();

  if (Object.values(VISTAS_APP).includes(hash)) {
    return hash;
  }

  return restaurarVistaGuardada();
}
