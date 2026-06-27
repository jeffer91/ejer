/*
  Nombre completo: hit.jarvis.brain.js
  Ruta o ubicación: src/features/entrenamiento/hit/hit.jarvis.brain.js

  Función o funciones:
    - Construir contexto completo de HIT para Jarvis.
    - Interpretar comandos escritos o hablados en la pantalla HIT.
    - Controlar temporizador: iniciar, pausar y reiniciar.
    - Completar formulario de cardio: tipo, tiempo, distancia, intensidad, rondas, actividad, descanso y notas.
    - Guardar registro de cardio desde comandos de Jarvis.

  Se conecta con:
    - src/features/entrenamiento/hit/hit.jarvis.js
    - src/features/entrenamiento/hit/hit.view.js
*/

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

function esNodoDom(valor) {
  return Boolean(valor && typeof valor.querySelector === "function" && typeof valor.querySelectorAll === "function");
}

function buscarUno(pantalla, selector) {
  return esNodoDom(pantalla) ? pantalla.querySelector(selector) : null;
}

function buscarTodos(pantalla, selector) {
  return esNodoDom(pantalla) ? [...pantalla.querySelectorAll(selector)] : [];
}

function obtenerFormularioHit(pantalla) {
  return buscarUno(pantalla, "form.entreno-hit-form");
}

function obtenerFormularioTimer(pantalla) {
  return buscarUno(pantalla, "form.entreno-hit-timer-form");
}

function obtenerBotonPorTexto(pantalla, textoBoton) {
  const buscado = normalizar(textoBoton);
  return buscarTodos(pantalla, "button").find((boton) => normalizar(boton.textContent).includes(buscado));
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

function agregarNota(formulario, nota) {
  const campo = formulario?.elements?.namedItem("notas");
  if (!campo) return false;
  const anterior = texto(campo.value);
  campo.value = anterior ? `${anterior} · ${nota}` : nota;
  dispararInput(campo);
  return true;
}

function leerCampo(formulario, nombre, defecto = "") {
  return formulario?.elements?.namedItem(nombre)?.value ?? defecto;
}

function leerFormularioHit(pantalla) {
  const form = obtenerFormularioHit(pantalla);

  return {
    tipo: leerCampo(form, "tipo", "intervalos"),
    tiempoMinutos: numero(leerCampo(form, "tiempoMinutos", 0), 0),
    distanciaKm: numero(leerCampo(form, "distanciaKm", 0), 0),
    intensidad: leerCampo(form, "intensidad", "media"),
    rondas: numero(leerCampo(form, "rondas", 0), 0),
    actividadSegundos: numero(leerCampo(form, "actividadSegundos", 0), 0),
    descansoSegundos: numero(leerCampo(form, "descansoSegundos", 0), 0),
    notas: leerCampo(form, "notas", "")
  };
}

function leerFormularioTimer(pantalla) {
  const form = obtenerFormularioTimer(pantalla);

  return {
    actividadSegundos: numero(leerCampo(form, "actividadSegundos", 0), 0),
    descansoSegundos: numero(leerCampo(form, "descansoSegundos", 0), 0),
    rondas: numero(leerCampo(form, "rondas", 0), 0)
  };
}

export function crearContextoJarvisHit({ estado = {}, timerEstado = {}, pantalla = null, frase = "" } = {}) {
  return {
    app: "FitJeff",
    asistente: "Jarvis",
    pantalla: "HIT",
    fraseUsuario: frase,
    resumen: estado.resumen || {},
    ultimoRegistro: (estado.registros || [])[0] || null,
    timer: {
      activo: Boolean(timerEstado.activo),
      fase: timerEstado.fase || "actividad",
      rondaActual: timerEstado.rondaActual || 1,
      rondasTotales: timerEstado.rondasTotales || 4,
      segundosRestantes: timerEstado.segundosRestantes || 0,
      tiempoTexto: timerEstado.tiempoTexto || "00:00",
      actividadSegundos: timerEstado.actividadSegundos || 30,
      descansoSegundos: timerEstado.descansoSegundos || 30
    },
    formularioCardio: leerFormularioHit(pantalla),
    formularioTimer: leerFormularioTimer(pantalla)
  };
}

function limpiarFrase(frase = "") {
  return normalizar(frase).replace(/\b(hey jarvis|oye jarvis|jarvis)\b/g, "").trim();
}

function comandoContiene(frase, patrones = []) {
  return patrones.some((patron) => frase.includes(patron));
}

function esComandoDuplicado(frase) {
  const ahora = Date.now();
  const limpio = normalizar(frase);

  if (limpio === ultimoComando && ahora - ultimaEjecucion < 1500) return true;

  ultimoComando = limpio;
  ultimaEjecucion = ahora;
  return false;
}

function seleccionarTipo(pantalla, tipo) {
  const form = obtenerFormularioHit(pantalla);
  if (!form) return "No encontré el formulario de cardio.";
  setCampo(form, "tipo", tipo);
  return `Tipo de cardio marcado como ${tipo}.`;
}

function cambiarIntensidad(pantalla, intensidad) {
  const form = obtenerFormularioHit(pantalla);
  if (!form) return "No encontré el formulario de cardio.";
  setCampo(form, "intensidad", intensidad);
  return `Intensidad marcada como ${intensidad}.`;
}

function registrarTiempo(pantalla, frase) {
  const form = obtenerFormularioHit(pantalla);
  const cantidad = obtenerNumero(frase);
  if (!form || cantidad === null) return "No entendí el tiempo del cardio.";
  setCampo(form, "tiempoMinutos", cantidad);
  return `Registré ${cantidad} minuto(s) de cardio.`;
}

function registrarDistancia(pantalla, frase) {
  const form = obtenerFormularioHit(pantalla);
  const cantidad = obtenerNumero(frase);
  if (!form || cantidad === null) return "No entendí la distancia.";
  setCampo(form, "distanciaKm", cantidad);
  return `Registré ${cantidad} kilómetro(s).`;
}

function registrarRondas(pantalla, frase) {
  const formHit = obtenerFormularioHit(pantalla);
  const formTimer = obtenerFormularioTimer(pantalla);
  const cantidad = obtenerNumero(frase);
  if (cantidad === null) return "No entendí cuántas rondas.";
  setCampo(formHit, "rondas", cantidad);
  setCampo(formTimer, "rondas", cantidad);
  return `Configuré ${cantidad} ronda(s).`;
}

function registrarActividad(pantalla, frase) {
  const formHit = obtenerFormularioHit(pantalla);
  const formTimer = obtenerFormularioTimer(pantalla);
  const cantidad = obtenerNumero(frase);
  if (cantidad === null) return "No entendí los segundos de actividad.";
  setCampo(formHit, "actividadSegundos", cantidad);
  setCampo(formTimer, "actividadSegundos", cantidad);
  return `Actividad configurada en ${cantidad} segundo(s).`;
}

function registrarDescanso(pantalla, frase) {
  const formHit = obtenerFormularioHit(pantalla);
  const formTimer = obtenerFormularioTimer(pantalla);
  const cantidad = obtenerNumero(frase);
  if (cantidad === null) return "No entendí los segundos de descanso.";
  setCampo(formHit, "descansoSegundos", cantidad);
  setCampo(formTimer, "descansoSegundos", cantidad);
  return `Descanso configurado en ${cantidad} segundo(s).`;
}

function registrarNota(pantalla, frase) {
  const form = obtenerFormularioHit(pantalla);
  const nota = frase.replace(/nota|apunta|anota|registrar/g, "").trim() || "nota por voz";
  if (!form) return "No encontré el formulario de cardio.";
  agregarNota(form, nota);
  return "Nota agregada al cardio.";
}

function describirTimer(timerEstado = {}) {
  return `Temporizador: ${timerEstado.tiempoTexto || "00:00"}, fase ${timerEstado.fase || "actividad"}, ronda ${timerEstado.rondaActual || 1} de ${timerEstado.rondasTotales || 4}.`;
}

export function procesarComandoJarvisHit({ frase = "", estado = {}, timerEstado = {}, pantalla = null, responder } = {}) {
  const limpia = limpiarFrase(frase);

  if (!limpia || esComandoDuplicado(limpia)) return null;

  let respuesta = "Comando escuchado en HIT, pero todavía no sé ejecutarlo.";

  if (comandoContiene(limpia, ["iniciemos", "iniciar", "empezar", "comencemos", "arranca"])) {
    respuesta = hacerClickAccion(pantalla, "Iniciar") ? "Inicié el temporizador HIT." : "No pude iniciar el temporizador.";
  } else if (comandoContiene(limpia, ["pausa", "pausar", "deten", "detén"])) {
    respuesta = hacerClickAccion(pantalla, "Pausar") ? "Temporizador pausado." : "No pude pausar el temporizador.";
  } else if (comandoContiene(limpia, ["reinicia", "reiniciar", "otra vez", "desde cero"])) {
    respuesta = hacerClickAccion(pantalla, "Reiniciar") ? "Temporizador reiniciado." : "No pude reiniciar el temporizador.";
  } else if (comandoContiene(limpia, ["configura", "configurar"])) {
    respuesta = hacerClickAccion(pantalla, "Configurar") ? "Temporizador configurado." : "No pude configurar el temporizador.";
  } else if (comandoContiene(limpia, ["que toca", "qué toca", "estado", "tiempo queda", "tiempo queda"])) {
    respuesta = describirTimer(timerEstado);
  } else if (comandoContiene(limpia, ["intervalo", "intervalos", "hit", "hiit"])) {
    respuesta = seleccionarTipo(pantalla, "intervalos");
  } else if (comandoContiene(limpia, ["bicicleta", "bici"])) {
    respuesta = seleccionarTipo(pantalla, "bicicleta");
  } else if (comandoContiene(limpia, ["caminata", "caminar" ])) {
    respuesta = seleccionarTipo(pantalla, "caminata");
  } else if (comandoContiene(limpia, ["otro cardio", "otro"])) {
    respuesta = seleccionarTipo(pantalla, "otro");
  } else if (comandoContiene(limpia, ["minuto", "minutos"])) {
    respuesta = registrarTiempo(pantalla, limpia);
  } else if (comandoContiene(limpia, ["kilometro", "kilometros", "km", "distancia"])) {
    respuesta = registrarDistancia(pantalla, limpia);
  } else if (comandoContiene(limpia, ["ronda", "rondas"])) {
    respuesta = registrarRondas(pantalla, limpia);
  } else if (comandoContiene(limpia, ["actividad", "trabajo", "activo"])) {
    respuesta = registrarActividad(pantalla, limpia);
  } else if (comandoContiene(limpia, ["descanso", "recuperacion", "recuperación"])) {
    respuesta = registrarDescanso(pantalla, limpia);
  } else if (comandoContiene(limpia, ["alta", "duro", "fuerte"])) {
    respuesta = cambiarIntensidad(pantalla, "alta");
  } else if (comandoContiene(limpia, ["suave", "facil", "fácil"])) {
    respuesta = cambiarIntensidad(pantalla, "suave");
  } else if (comandoContiene(limpia, ["media", "normal"])) {
    respuesta = cambiarIntensidad(pantalla, "media");
  } else if (comandoContiene(limpia, ["nota", "anota", "apunta"])) {
    respuesta = registrarNota(pantalla, limpia);
  } else if (comandoContiene(limpia, ["guardar", "guarda", "guardar cardio"])) {
    respuesta = hacerClickAccion(pantalla, "Guardar cardio") ? "Cardio guardado." : "No pude guardar el cardio.";
  }

  responder?.(respuesta, crearContextoJarvisHit({ estado, timerEstado, pantalla, frase }));
  return respuesta;
}
