/*
  Nombre completo: rutinas.advanced-editor.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.advanced-editor.js

  Función o funciones:
    - Construir el editor avanzado de rutinas IA guardadas.
    - Editar ejercicios por día y bloque sin perder tipo, cardio, fútbol, duración, descanso ni notas.
    - Mantener separado este editor para no sobrecargar rutinas.view.js.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.view.js
    - src/features/entrenamiento/rutinas/rutinas.controller.js
    - src/features/entrenamiento/rutinas/rutinas.service.js
*/

const TIPOS_EJERCICIO_AVANZADO = [
  "fuerza",
  "cardio",
  "futbol",
  "tecnica",
  "movilidad",
  "core",
  "calentamiento",
  "descanso_activo",
  "otro"
];

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearInput({ nombre, label, valor = "", tipo = "text", min = "" }) {
  const grupo = crearElemento("label", "entreno-rutinas-advanced-field");
  const texto = crearElemento("span", "", label);
  const input = document.createElement("input");

  input.name = nombre;
  input.type = tipo;
  input.value = valor ?? "";
  if (min !== "") input.min = min;

  grupo.appendChild(texto);
  grupo.appendChild(input);
  return grupo;
}

function crearSelectTipo(valorActual = "") {
  const grupo = crearElemento("label", "entreno-rutinas-advanced-field");
  const texto = crearElemento("span", "", "Tipo");
  const select = document.createElement("select");

  select.name = "tipo";

  TIPOS_EJERCICIO_AVANZADO.forEach((tipo) => {
    const option = document.createElement("option");
    option.value = tipo;
    option.textContent = tipo;
    option.selected = tipo === valorActual;
    select.appendChild(option);
  });

  grupo.appendChild(texto);
  grupo.appendChild(select);
  return grupo;
}

function crearAreaNotas(valor = "") {
  const grupo = crearElemento("label", "entreno-rutinas-advanced-field entreno-rutinas-advanced-field--full");
  const texto = crearElemento("span", "", "Notas");
  const area = document.createElement("textarea");

  area.name = "notas";
  area.rows = 2;
  area.value = valor || "";

  grupo.appendChild(texto);
  grupo.appendChild(area);
  return grupo;
}

function leerDatosEjercicio(formulario) {
  const datos = new FormData(formulario);

  return {
    nombre: datos.get("nombre"),
    tipo: datos.get("tipo"),
    bloque: datos.get("bloque"),
    series: datos.get("series"),
    repeticiones: datos.get("repeticiones"),
    descansoSegundos: datos.get("descansoSegundos"),
    duracionMinutos: datos.get("duracionMinutos"),
    intensidad: datos.get("intensidad"),
    notas: datos.get("notas")
  };
}

function obtenerEjerciciosDeBloque(dia = {}, bloque = {}) {
  const nombreBloque = bloque.nombre || bloque.tipo || "";
  const tipoBloque = bloque.tipo || "";
  const ejercicios = dia.ejercicios || [];
  const porNombre = ejercicios.filter((ejercicio) => ejercicio.bloque && ejercicio.bloque === nombreBloque);

  if (porNombre.length) return porNombre;
  return ejercicios.filter((ejercicio) => tipoBloque && ejercicio.tipo === tipoBloque);
}

function crearFormularioEjercicio({ rutina, dia, bloque, ejercicio, onActualizarEjercicioAvanzado }) {
  const form = crearElemento("form", "entreno-rutinas-advanced-exercise-form");
  const guardar = crearElemento("button", "entreno-rutinas-button entreno-rutinas-button--advanced", "Guardar ejercicio");

  form.appendChild(crearInput({ nombre: "nombre", label: "Ejercicio", valor: ejercicio.nombre }));
  form.appendChild(crearSelectTipo(ejercicio.tipo || bloque.tipo || "otro"));
  form.appendChild(crearInput({ nombre: "bloque", label: "Bloque", valor: ejercicio.bloque || bloque.nombre || bloque.tipo || "" }));
  form.appendChild(crearInput({ nombre: "series", label: "Series", valor: ejercicio.series ?? "", tipo: "number", min: "0" }));
  form.appendChild(crearInput({ nombre: "repeticiones", label: "Reps", valor: ejercicio.repeticiones ?? "", tipo: "number", min: "0" }));
  form.appendChild(crearInput({ nombre: "descansoSegundos", label: "Descanso s", valor: ejercicio.descansoSegundos ?? "", tipo: "number", min: "0" }));
  form.appendChild(crearInput({ nombre: "duracionMinutos", label: "Duración min", valor: ejercicio.duracionMinutos ?? "", tipo: "number", min: "0" }));
  form.appendChild(crearInput({ nombre: "intensidad", label: "Intensidad", valor: ejercicio.intensidad || "media" }));
  form.appendChild(crearAreaNotas(ejercicio.notas));

  guardar.type = "submit";
  form.appendChild(guardar);

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    guardar.textContent = "Guardando...";
    guardar.disabled = true;
    onActualizarEjercicioAvanzado?.(rutina.id, dia.id, ejercicio.id, leerDatosEjercicio(form));
  });

  return form;
}

function crearBloqueEditor({ rutina, dia, bloque, onActualizarEjercicioAvanzado }) {
  const details = crearElemento("details", "entreno-rutinas-advanced-block");
  const summary = crearElemento("summary", "", `${bloque.nombre || bloque.tipo || "Bloque"} · ${bloque.tipo || "otro"}`);
  const ejercicios = obtenerEjerciciosDeBloque(dia, bloque);

  details.appendChild(summary);

  if (ejercicios.length === 0) {
    details.appendChild(crearElemento("small", "", "Este bloque no tiene ejercicios editables."));
    return details;
  }

  ejercicios.forEach((ejercicio) => {
    details.appendChild(crearFormularioEjercicio({ rutina, dia, bloque, ejercicio, onActualizarEjercicioAvanzado }));
  });

  return details;
}

function crearDiaEditor({ rutina, dia, onActualizarEjercicioAvanzado }) {
  const bloqueDia = crearElemento("article", "entreno-rutinas-advanced-day");
  const titulo = crearElemento("strong", "", dia.nombre || "Día");
  const bloques = Array.isArray(dia.bloques) && dia.bloques.length
    ? dia.bloques
    : [{ nombre: "Bloque general", tipo: "otro", totalEjercicios: (dia.ejercicios || []).length }];

  bloqueDia.appendChild(titulo);
  bloques.forEach((bloque) => {
    bloqueDia.appendChild(crearBloqueEditor({ rutina, dia, bloque, onActualizarEjercicioAvanzado }));
  });

  return bloqueDia;
}

export function crearEditorAvanzadoRutina({ rutina, onActualizarEjercicioAvanzado } = {}) {
  const tieneBloques = (rutina?.dias || []).some((dia) => Array.isArray(dia.bloques) && dia.bloques.length > 0);
  const esRutinaIA = rutina?.origen === "ia" || tieneBloques;

  if (!esRutinaIA || typeof onActualizarEjercicioAvanzado !== "function") return null;

  const details = crearElemento("details", "entreno-rutinas-advanced-editor");
  const summary = crearElemento("summary", "", "Editar bloques IA sin perder estructura");
  const ayuda = crearElemento("p", "", "Edita ejercicios, tipo, bloque, series, repeticiones, duración, descanso, intensidad y notas sin convertir la rutina IA en una rutina manual.");

  details.appendChild(summary);
  details.appendChild(ayuda);

  (rutina.dias || []).forEach((dia) => {
    details.appendChild(crearDiaEditor({ rutina, dia, onActualizarEjercicioAvanzado }));
  });

  return details;
}
