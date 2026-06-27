/*
  Nombre completo: diario.jarvis.brain.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.jarvis.brain.js

  Función o funciones:
    - Construir contexto completo de Diario para cada comando de Jarvis.
    - Interpretar comandos hablados durante la sesión.
    - Actualizar el formulario del Diario con repeticiones, tiempo, distancia, fallo, notas y progreso.
    - Ejecutar acciones de Diario desde voz: iniciar, guardar, completar, siguiente y repetir.

  Se conecta con:
    - src/features/entrenamiento/diario/diario.jarvis.js
    - src/features/entrenamiento/diario/diario.view.js
*/

let indiceEjercicioActual = 0;
let ultimoComando = "";
let ultimaEjecucion = 0;

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function normalizar(valor = "") {
  return texto(valor).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function numero(valor, defecto = 0) {
  const convertido = Number(String(valor ?? "").replace(",", "."));
  return Number.isFinite(convertido) ? convertido : defecto;
}

function obtenerNumero(frase = "") {
  const match = normalizar(frase).match(/\d+(?:[.,]\d+)?/);
  return match ? numero(match[0], null) : null;
}

function obtenerBotonPorTexto(pantalla, textoBoton) {
  const buscado = normalizar(textoBoton);
  return [...(pantalla?.querySelectorAll("button") || [])].find((boton) => normalizar(boton.textContent).includes(buscado));
}

function hacerClickAccion(pantalla, textoBoton) {
  const boton = obtenerBotonPorTexto(pantalla, textoBoton);
  if (!boton || boton.disabled) return false;
  boton.click();
  return true;
}

function dispararInput(campo) {
  campo?.dispatchEvent(new Event("input", { bubbles: true }));
  campo?.dispatchEvent(new Event("change", { bubbles: true }));
}

function setCampo(formulario, nombre, valor) {
  const campo = formulario?.elements?.namedItem(nombre);
  if (!campo) return false;
  campo.value = valor;
  dispararInput(campo);
  return true;
}

function setCheck(formulario, nombre, activo = true) {
  const campo = formulario?.elements?.namedItem(nombre);
  if (!campo) return false;
  campo.checked = Boolean(activo);
  dispararInput(campo);
  return true;
}

function agregarNota(formulario, nombre, nota) {
  const campo = formulario?.elements?.namedItem(nombre);
  if (!campo) return false;
  const anterior = texto(campo.value);
  campo.value = anterior ? `${anterior} · ${nota}` : nota;
  dispararInput(campo);
  return true;
}

function obtenerFormDiario(pantalla) {
  return pantalla?.querySelector("form.entreno-diario-form") || null;
}

function ejerciciosDelDia(diario = {}) {
  return diario.rutinaDelDia?.dia?.ejercicios || [];
}

function obtenerEjercicioActual(diario = {}) {
  const ejercicios = ejerciciosDelDia(diario);
  if (!ejercicios.length) return null;
  if (indiceEjercicioActual >= ejercicios.length) indiceEjercicioActual = ejercicios.length - 1;
  if (indiceEjercicioActual < 0) indiceEjercicioActual = 0;
  return ejercicios[indiceEjercicioActual] || null;
}

function buscarSiguientePendiente(pantalla, diario = {}) {
  const formulario = obtenerFormDiario(pantalla);
  const ejercicios = ejerciciosDelDia(diario);

  const indice = ejercicios.findIndex((ejercicio) => {
    const check = formulario?.elements?.namedItem(`ejercicio_${ejercicio.id}_completado`);
    return check && !check.checked;
  });

  return indice === -1 ? Math.min(indiceEjercicioActual + 1, Math.max(ejercicios.length - 1, 0)) : indice;
}

function medicionEjercicio(ejercicio = {}) {
  const medicion = ejercicio.medicion || "repeticiones";
  if (["repeticiones", "tiempo", "mixto", "distancia"].includes(medicion)) return medicion;
  if (Number(ejercicio.duracionMinutos || 0) > 0 || Number(ejercicio.duracionSegundos || 0) > 0) return "tiempo";
  if (Number(ejercicio.distanciaKm || 0) > 0) return "distancia";
  return "repeticiones";
}

function describirEjercicio(ejercicio = {}) {
  if (!ejercicio) return "No hay ejercicio activo.";

  const medicion = medicionEjercicio(ejercicio);
  const partes = [ejercicio.nombre || "Ejercicio"];

  if (medicion === "repeticiones") partes.push(`${ejercicio.series || 0} series de ${ejercicio.repeticiones || 0} repeticiones`);
  if (medicion === "tiempo") partes.push(`${ejercicio.duracionMinutos || 0} minutos ${ejercicio.duracionSegundos || 0} segundos`);
  if (medicion === "mixto") partes.push(`${ejercicio.series || 0} series por ${ejercicio.duracionMinutos || 0} minutos ${ejercicio.duracionSegundos || 0} segundos`);
  if (medicion === "distancia") partes.push(`${ejercicio.distanciaKm || 0} kilómetros`);
  if (ejercicio.descansoSegundos) partes.push(`descanso ${ejercicio.descansoSegundos} segundos`);
  if (ejercicio.notas) partes.push(ejercicio.notas);

  return partes.filter(Boolean).join(". ");
}

function leerEstadoFormulario(pantalla, diario = {}) {
  const formulario = obtenerFormDiario(pantalla);
  const ejercicios = ejerciciosDelDia(diario);

  return ejercicios.map((ejercicio, indice) => ({
    indice,
    id: ejercicio.id,
    nombre: ejercicio.nombre,
    medicion: medicionEjercicio(ejercicio),
    completado: Boolean(formulario?.elements?.namedItem(`ejercicio_${ejercicio.id}_completado`)?.checked),
    series: numero(formulario?.elements?.namedItem(`series_${ejercicio.id}`)?.value, 0),
    repeticiones: numero(formulario?.elements?.namedItem(`reps_${ejercicio.id}`)?.value, 0),
    minutos: numero(formulario?.elements?.namedItem(`tiempo_min_${ejercicio.id}`)?.value, 0),
    segundos: numero(formulario?.elements?.namedItem(`tiempo_seg_${ejercicio.id}`)?.value, 0),
    distanciaKm: numero(formulario?.elements?.namedItem(`distancia_${ejercicio.id}`)?.value, 0),
    alFallo: Boolean(formulario?.elements?.namedItem(`fallo_${ejercicio.id}`)?.checked),
    dificultad: formulario?.elements?.namedItem(`dificultad_${ejercicio.id}`)?.value || "media",
    notas: formulario?.elements?.namedItem(`nota_${ejercicio.id}`)?.value || ""
  }));
}

export function crearContextoJarvisCompleto({ diario = {}, pantalla = {}, frase = "" } = {}) {
  const rutina = diario.rutinaDelDia?.rutina;
  const dia = diario.rutinaDelDia?.dia;
  const metricas = diario.metricas || {};
  const ejercicios = ejerciciosDelDia(diario);
  const ejercicioActual = obtenerEjercicioActual(diario);

  return {
    app: "FitJeff",
    asistente: "Jarvis",
    fraseUsuario: frase,
    rutina: {
      id: rutina?.id || null,
      nombre: rutina?.nombre || "sin rutina activa",
      estado: rutina?.estado || "sin estado",
      objetivo: rutina?.objetivo || "",
      nivel: rutina?.nivel || "",
      lugar: rutina?.lugar || "",
      equipo: rutina?.equipo || ""
    },
    dia: {
      id: dia?.id || null,
      nombre: dia?.nombre || "sin día activo",
      calentamiento: dia?.calentamiento || "",
      totalEjercicios: ejercicios.length
    },
    sesion: {
      estado: diario.sesionHoy?.estado || "sin iniciar",
      tiempoMinutos: diario.sesionHoy?.tiempoMinutos || 0,
      ejerciciosCompletados: diario.sesionHoy?.ejerciciosCompletados || 0
    },
    metricas,
    ejercicioActual: {
      indice: indiceEjercicioActual,
      ...ejercicioActual,
      medicion: medicionEjercicio(ejercicioActual || {})
    },
    progresoFormulario: leerEstadoFormulario(pantalla, diario)
  };
}

function esComandoDuplicado(frase) {
  const ahora = Date.now();
  const limpio = normalizar(frase);

  if (limpio === ultimoComando && ahora - ultimaEjecucion < 1800) return true;

  ultimoComando = limpio;
  ultimaEjecucion = ahora;
  return false;
}

function limpiarFrase(frase = "") {
  return normalizar(frase).replace(/\b(hey jarvis|oye jarvis|jarvis)\b/g, "").trim();
}

function comandoContiene(frase, patrones = []) {
  return patrones.some((patron) => frase.includes(patron));
}

function registrarRepeticiones(pantalla, diario, frase) {
  const formulario = obtenerFormDiario(pantalla);
  const ejercicio = obtenerEjercicioActual(diario);
  const cantidad = obtenerNumero(frase);

  if (!formulario || !ejercicio || cantidad === null) return "No entendí cuántas repeticiones hiciste.";

  setCheck(formulario, `ejercicio_${ejercicio.id}_completado`, true);
  setCampo(formulario, `reps_${ejercicio.id}`, cantidad);

  if (comandoContiene(frase, ["series", "serie"])) setCampo(formulario, `series_${ejercicio.id}`, cantidad);

  return `Registré ${cantidad} repetición(es) en ${ejercicio.nombre}.`;
}

function registrarSeries(pantalla, diario, frase) {
  const formulario = obtenerFormDiario(pantalla);
  const ejercicio = obtenerEjercicioActual(diario);
  const cantidad = obtenerNumero(frase);

  if (!formulario || !ejercicio || cantidad === null) return "No entendí cuántas series hiciste.";

  setCheck(formulario, `ejercicio_${ejercicio.id}_completado`, true);
  setCampo(formulario, `series_${ejercicio.id}`, cantidad);
  return `Registré ${cantidad} serie(s) en ${ejercicio.nombre}.`;
}

function registrarTiempo(pantalla, diario, frase) {
  const formulario = obtenerFormDiario(pantalla);
  const ejercicio = obtenerEjercicioActual(diario);
  const cantidad = obtenerNumero(frase);

  if (!formulario || !ejercicio || cantidad === null) return "No entendí el tiempo realizado.";

  setCheck(formulario, `ejercicio_${ejercicio.id}_completado`, true);

  if (comandoContiene(frase, ["segundo", "segundos"])) {
    setCampo(formulario, `tiempo_seg_${ejercicio.id}`, cantidad);
    return `Registré ${cantidad} segundo(s) en ${ejercicio.nombre}.`;
  }

  setCampo(formulario, `tiempo_min_${ejercicio.id}`, cantidad);
  return `Registré ${cantidad} minuto(s) en ${ejercicio.nombre}.`;
}

function registrarDistancia(pantalla, diario, frase) {
  const formulario = obtenerFormDiario(pantalla);
  const ejercicio = obtenerEjercicioActual(diario);
  const cantidad = obtenerNumero(frase);

  if (!formulario || !ejercicio || cantidad === null) return "No entendí la distancia realizada.";

  setCheck(formulario, `ejercicio_${ejercicio.id}_completado`, true);
  setCampo(formulario, `distancia_${ejercicio.id}`, cantidad);
  return `Registré ${cantidad} kilómetro(s) en ${ejercicio.nombre}.`;
}

function marcarFallo(pantalla, diario) {
  const formulario = obtenerFormDiario(pantalla);
  const ejercicio = obtenerEjercicioActual(diario);

  if (!formulario || !ejercicio) return "No hay ejercicio activo para marcar al fallo.";

  setCheck(formulario, `ejercicio_${ejercicio.id}_completado`, true);
  setCheck(formulario, `fallo_${ejercicio.id}`, true);
  agregarNota(formulario, `nota_${ejercicio.id}`, "al fallo");
  return `Marcado al fallo en ${ejercicio.nombre}.`;
}

function marcarMolestia(pantalla, diario, frase) {
  const formulario = obtenerFormDiario(pantalla);
  const ejercicio = obtenerEjercicioActual(diario);
  const nota = frase.replace(/me dolio|me duele|dolor|molestia/g, "").trim() || "molestia reportada";

  if (!formulario) return "No pude registrar la molestia.";

  if (ejercicio) agregarNota(formulario, `nota_${ejercicio.id}`, `molestia: ${nota}`);
  setCampo(formulario, "molestias", nota);
  return "Registré la molestia. Baja la intensidad y detén la actividad si el dolor es fuerte o aparece mareo.";
}

function cambiarDificultad(pantalla, diario, dificultad) {
  const formulario = obtenerFormDiario(pantalla);
  const ejercicio = obtenerEjercicioActual(diario);

  if (!formulario || !ejercicio) return "No hay ejercicio activo para cambiar dificultad.";

  setCampo(formulario, `dificultad_${ejercicio.id}`, dificultad);
  return `Dificultad marcada como ${dificultad} en ${ejercicio.nombre}.`;
}

function marcarSiguiente(pantalla, diario) {
  const formulario = obtenerFormDiario(pantalla);
  const ejercicios = ejerciciosDelDia(diario);
  const actual = obtenerEjercicioActual(diario);

  if (!formulario || !ejercicios.length) return "No hay ejercicios cargados.";

  if (actual) setCheck(formulario, `ejercicio_${actual.id}_completado`, true);
  indiceEjercicioActual = Math.min(indiceEjercicioActual + 1, ejercicios.length - 1);
  const siguiente = ejercicios[indiceEjercicioActual];

  return siguiente ? `Siguiente: ${describirEjercicio(siguiente)}` : "No hay más ejercicios.";
}

function irAlSiguientePendiente(pantalla, diario) {
  indiceEjercicioActual = buscarSiguientePendiente(pantalla, diario);
  const ejercicio = obtenerEjercicioActual(diario);
  return ejercicio ? `Vamos con: ${describirEjercicio(ejercicio)}` : "No encontré ejercicios pendientes.";
}

function responderEjercicioActual(diario) {
  const ejercicio = obtenerEjercicioActual(diario);
  return ejercicio ? `Ejercicio actual: ${describirEjercicio(ejercicio)}` : "No hay ejercicio activo.";
}

export function procesarComandoJarvis({ frase = "", diario = {}, pantalla = {}, responder } = {}) {
  const limpia = limpiarFrase(frase);

  if (!limpia || esComandoDuplicado(limpia)) return null;

  let respuesta = "Comando escuchado, pero todavía no sé ejecutarlo.";

  if (comandoContiene(limpia, ["iniciemos", "iniciar", "empezar", "comencemos"])) {
    hacerClickAccion(pantalla, "Iniciar sesión");
    indiceEjercicioActual = buscarSiguientePendiente(pantalla, diario);
    respuesta = `Iniciamos. ${responderEjercicioActual(diario)}`;
  } else if (comandoContiene(limpia, ["siguiente", "listo", "ya esta", "ya está"])) {
    respuesta = marcarSiguiente(pantalla, diario);
  } else if (comandoContiene(limpia, ["pendiente", "proximo", "próximo"])) {
    respuesta = irAlSiguientePendiente(pantalla, diario);
  } else if (comandoContiene(limpia, ["repite", "repetir", "actual", "que toca", "qué toca"])) {
    respuesta = responderEjercicioActual(diario);
  } else if (comandoContiene(limpia, ["repeticiones", "reps", "repes"])) {
    respuesta = registrarRepeticiones(pantalla, diario, limpia);
  } else if (comandoContiene(limpia, ["series", "serie"])) {
    respuesta = registrarSeries(pantalla, diario, limpia);
  } else if (comandoContiene(limpia, ["minuto", "minutos", "segundo", "segundos"])) {
    respuesta = registrarTiempo(pantalla, diario, limpia);
  } else if (comandoContiene(limpia, ["kilometro", "kilometros", "km", "distancia"])) {
    respuesta = registrarDistancia(pantalla, diario, limpia);
  } else if (comandoContiene(limpia, ["fallo", "al fallo"])) {
    respuesta = marcarFallo(pantalla, diario);
  } else if (comandoContiene(limpia, ["suave", "facil", "fácil"])) {
    respuesta = cambiarDificultad(pantalla, diario, "suave");
  } else if (comandoContiene(limpia, ["duro", "alta", "pesado", "dificil", "difícil"])) {
    respuesta = cambiarDificultad(pantalla, diario, "alta");
  } else if (comandoContiene(limpia, ["media", "normal"])) {
    respuesta = cambiarDificultad(pantalla, diario, "media");
  } else if (comandoContiene(limpia, ["me duele", "me dolio", "dolor", "molestia"])) {
    respuesta = marcarMolestia(pantalla, diario, limpia);
  } else if (comandoContiene(limpia, ["guarda", "guardar progreso", "guardar"])) {
    respuesta = hacerClickAccion(pantalla, "Guardar progreso") ? "Progreso guardado." : "No pude guardar el progreso.";
  } else if (comandoContiene(limpia, ["terminar", "finalizar", "completar", "cerrar sesion", "cerrar sesión"])) {
    respuesta = hacerClickAccion(pantalla, "Completar sesión") ? "Cierro la sesión con los datos registrados." : "No pude completar la sesión.";
  }

  responder?.(respuesta, crearContextoJarvisCompleto({ diario, pantalla, frase }));
  return respuesta;
}
