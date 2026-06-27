/*
  Nombre completo: rutinas.time-view.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.time-view.js

  Función o funciones:
    - Agregar campos visuales para ejercicios por tiempo en el formulario manual de Rutinas.
    - Mostrar mejor duración, segundos, distancia y tipo de medición en rutinas guardadas.
    - Evitar que la vista siga presentando todo como series y repeticiones.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.controller.js
    - src/features/entrenamiento/rutinas/rutinas.mapper.js
    - src/features/entrenamiento/rutinas/rutinas.service.js
*/

const OPCIONES_MEDICION = [
  ["repeticiones", "Repeticiones"],
  ["tiempo", "Tiempo"],
  ["mixto", "Mixto"],
  ["distancia", "Distancia"]
];

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearCampo({ nombre, label, tipo = "text", valor = "", placeholder = "", min = "0", step = "1" }) {
  const grupo = crearElemento("label", "entreno-rutinas-field entreno-rutinas-field--time");
  const texto = crearElemento("span", "", label);
  const input = document.createElement("input");

  input.name = nombre;
  input.type = tipo;
  input.value = valor ?? "";
  input.placeholder = placeholder;
  if (tipo === "number") {
    input.min = min;
    input.step = step;
  }

  grupo.appendChild(texto);
  grupo.appendChild(input);
  return grupo;
}

function crearSelectMedicion(valorActual = "repeticiones") {
  const grupo = crearElemento("label", "entreno-rutinas-field entreno-rutinas-field--time");
  const texto = crearElemento("span", "", "Medición");
  const select = document.createElement("select");

  select.name = "medicion";
  OPCIONES_MEDICION.forEach(([valor, etiqueta]) => {
    const option = document.createElement("option");
    option.value = valor;
    option.textContent = etiqueta;
    option.selected = valor === valorActual;
    select.appendChild(option);
  });

  grupo.appendChild(texto);
  grupo.appendChild(select);
  return grupo;
}

function leerFormularioCompleto(formulario) {
  const datos = new FormData(formulario);

  return {
    nombre: datos.get("nombre"),
    totalDias: datos.get("totalDias"),
    calentamiento: datos.get("calentamiento"),
    ejerciciosTexto: datos.get("ejerciciosTexto"),
    descansoSegundos: datos.get("descansoSegundos"),
    series: datos.get("series"),
    repeticiones: datos.get("repeticiones"),
    medicion: datos.get("medicion"),
    duracionMinutos: datos.get("duracionMinutos"),
    duracionSegundos: datos.get("duracionSegundos"),
    distanciaKm: datos.get("distanciaKm"),
    activa: datos.get("activa") === "on"
  };
}

function insertarAntesDeArea(formulario, nodo) {
  const area = formulario.elements.namedItem("ejerciciosTexto");
  const contenedorArea = area?.closest("label");
  formulario.insertBefore(nodo, contenedorArea || formulario.firstChild);
}

function insertarCamposTiempoFormulario(pantalla, { onGuardar } = {}) {
  const formulario = pantalla?.querySelector(".entreno-rutinas-form form.entreno-rutinas-grid");
  if (!formulario || formulario.dataset.tiempoReady === "true") return;

  insertarAntesDeArea(formulario, crearSelectMedicion("repeticiones"));
  insertarAntesDeArea(formulario, crearCampo({ nombre: "duracionMinutos", label: "Duración min", tipo: "number", valor: "0", placeholder: "10", step: "0.1" }));
  insertarAntesDeArea(formulario, crearCampo({ nombre: "duracionSegundos", label: "Duración s", tipo: "number", valor: "0", placeholder: "45" }));
  insertarAntesDeArea(formulario, crearCampo({ nombre: "distanciaKm", label: "Distancia km", tipo: "number", valor: "", placeholder: "2.5", step: "0.1" }));

  if (typeof onGuardar === "function") {
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      evento.stopImmediatePropagation();
      onGuardar(leerFormularioCompleto(formulario));
    }, true);
  }

  formulario.dataset.tiempoReady = "true";
}

function numero(valor, defecto = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : defecto;
}

function formatearDuracion(ejercicio = {}) {
  const segundos = numero(ejercicio.duracionSegundos, 0);
  const minutos = numero(ejercicio.duracionMinutos, 0);

  if (segundos > 0 && segundos < 60) return `${segundos}s`;
  if (minutos > 0) return `${minutos} min`;
  if (segundos >= 60) return `${Math.round((segundos / 60) * 100) / 100} min`;
  if (ejercicio.duracion) return ejercicio.duracion;
  return "";
}

function formatearDetalleEjercicio(ejercicio = {}) {
  const medicion = ejercicio.medicion || "repeticiones";
  const partes = [];
  const duracion = formatearDuracion(ejercicio);
  const distancia = numero(ejercicio.distanciaKm, 0);

  if (medicion === "tiempo") {
    if (duracion) partes.push(duracion);
  } else if (medicion === "mixto") {
    if (ejercicio.series) partes.push(`${ejercicio.series} serie(s)`);
    if (ejercicio.repeticiones) partes.push(`${ejercicio.repeticiones} rep.`);
    if (duracion) partes.push(duracion);
  } else if (medicion === "distancia") {
    if (distancia > 0) partes.push(`${distancia} km`);
    if (duracion) partes.push(duracion);
  } else {
    if (ejercicio.series && ejercicio.repeticiones) partes.push(`${ejercicio.series}x${ejercicio.repeticiones}`);
    else if (ejercicio.series) partes.push(`${ejercicio.series} serie(s)`);
    else if (ejercicio.repeticiones) partes.push(`${ejercicio.repeticiones} rep.`);
  }

  if (ejercicio.descansoSegundos) partes.push(`descanso ${ejercicio.descansoSegundos}s`);
  if (ejercicio.intensidad) partes.push(ejercicio.intensidad);
  if (ejercicio.notas) partes.push(ejercicio.notas);

  return partes.join(" · ") || "Sin detalle adicional";
}

function obtenerEjerciciosDeBloque(dia = {}, bloque = {}) {
  const nombreBloque = bloque.nombre || bloque.tipo || "";
  const tipoBloque = bloque.tipo || "";
  const ejercicios = dia.ejercicios || [];
  const porNombre = ejercicios.filter((ejercicio) => ejercicio.bloque && ejercicio.bloque === nombreBloque);

  if (porNombre.length) return porNombre;
  return ejercicios.filter((ejercicio) => tipoBloque && ejercicio.tipo === tipoBloque);
}

function ejerciciosEnOrdenDeVista(rutina = {}) {
  const salida = [];

  (rutina.dias || []).forEach((dia) => {
    const bloques = Array.isArray(dia.bloques) ? dia.bloques : [];
    if (bloques.length > 0) {
      bloques.forEach((bloque) => salida.push(...obtenerEjerciciosDeBloque(dia, bloque)));
      return;
    }

    salida.push(...(dia.ejercicios || []).slice(0, 8));
  });

  return salida;
}

function calcularTotales(rutina = {}) {
  const dias = rutina.dias || [];
  const ejercicios = dias.flatMap((dia) => dia.ejercicios || []);

  return {
    dias: dias.length,
    bloques: dias.reduce((total, dia) => total + (dia.bloques || []).length, 0),
    ejercicios: ejercicios.length,
    series: ejercicios.reduce((total, ejercicio) => total + numero(ejercicio.series, 0), 0),
    tiempo: ejercicios.reduce((total, ejercicio) => total + numero(ejercicio.duracionMinutos, 0), 0),
    distancia: ejercicios.reduce((total, ejercicio) => total + numero(ejercicio.distanciaKm, 0), 0)
  };
}

function crearChip(textoChip, clase = "") {
  const chip = crearElemento("span", `entreno-rutinas-chip ${clase}`.trim(), textoChip);
  chip.dataset.tiempoChip = "true";
  return chip;
}

function actualizarTarjeta(card, rutina = {}) {
  const totales = calcularTotales(rutina);
  const resumen = card.querySelector(".entreno-rutinas-card__top span");
  const ejerciciosVista = ejerciciosEnOrdenDeVista(rutina);
  const nodosEjercicio = [...card.querySelectorAll(".entreno-rutinas-saved-exercise")];

  if (resumen) {
    const tiempo = totales.tiempo > 0 ? ` · ${Math.round(totales.tiempo * 100) / 100} min` : "";
    const distancia = totales.distancia > 0 ? ` · ${Math.round(totales.distancia * 100) / 100} km` : "";
    resumen.textContent = `${totales.dias} día(s) · ${totales.bloques} bloque(s) · ${totales.ejercicios} ejercicio(s) · ${totales.series} serie(s)${tiempo}${distancia} · ${rutina.estado}`;
  }

  nodosEjercicio.forEach((nodo, indice) => {
    const ejercicio = ejerciciosVista[indice];
    if (!ejercicio) return;

    const top = nodo.querySelector(".entreno-rutinas-saved-exercise__top");
    const detalle = [...nodo.children].find((hijo) => hijo.tagName === "SPAN" && !hijo.dataset.tiempoChip);

    if (top && !top.querySelector("[data-medicion-chip='true']")) {
      const medicion = ejercicio.medicion || "repeticiones";
      const chip = crearChip(medicion, `entreno-rutinas-chip--type entreno-rutinas-chip--${medicion}`);
      chip.dataset.medicionChip = "true";
      top.appendChild(chip);
    }

    if (detalle) detalle.textContent = formatearDetalleEjercicio(ejercicio);
  });
}

export function mejorarVistaTiempoRutinas(pantalla, { rutinas = [], onGuardar } = {}) {
  insertarCamposTiempoFormulario(pantalla, { onGuardar });

  const tarjetas = [...(pantalla?.querySelectorAll(".entreno-rutinas-card") || [])];
  tarjetas.forEach((card, indice) => actualizarTarjeta(card, rutinas[indice]));
}
