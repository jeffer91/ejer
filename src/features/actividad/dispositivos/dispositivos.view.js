import { DISPOSITIVOS_FUENTES, DISPOSITIVOS_TEXTOS } from "./dispositivos.constants.js";
import "./dispositivos.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearInput({ name, label, value = "", placeholder = "", type = "text" }) {
  const campo = crearElemento("label", "dispositivos-field");
  const texto = crearElemento("span", "", label);
  const input = crearElemento("input", "dispositivos-input");

  input.name = name;
  input.type = type;
  input.value = value || "";
  input.placeholder = placeholder;
  input.autocomplete = "off";

  campo.appendChild(texto);
  campo.appendChild(input);
  return campo;
}

function crearCheck({ name, label, checked = false }) {
  const campo = crearElemento("label", "dispositivos-check");
  const input = document.createElement("input");
  input.name = name;
  input.type = "checkbox";
  input.checked = Boolean(checked);
  campo.appendChild(input);
  campo.appendChild(crearElemento("span", "", label));
  return campo;
}

function crearSelectFuente(valorActual) {
  const campo = crearElemento("label", "dispositivos-field");
  const texto = crearElemento("span", "", "Fuente preferida");
  const select = crearElemento("select", "dispositivos-input");
  const opciones = [
    { value: DISPOSITIVOS_FUENTES.MANUAL, label: "Manual por ahora" },
    { value: DISPOSITIVOS_FUENTES.CUBITT, label: "Cubitt CT4" },
    { value: DISPOSITIVOS_FUENTES.GOOGLE_FIT, label: "Google Fit" }
  ];

  select.name = "fuentePreferida";
  opciones.forEach((opcion) => {
    const item = document.createElement("option");
    item.value = opcion.value;
    item.textContent = opcion.label;
    item.selected = opcion.value === valorActual;
    select.appendChild(item);
  });

  campo.appendChild(texto);
  campo.appendChild(select);
  return campo;
}

function crearEstadoCard(titulo, detalle, estado) {
  const card = crearElemento("article", `dispositivos-status dispositivos-status--${estado}`);
  card.appendChild(crearElemento("span", "dispositivos-status__label", titulo));
  card.appendChild(crearElemento("strong", "", estado === "success" ? "Listo" : estado === "pending" ? "Pendiente" : "Preparado"));
  card.appendChild(crearElemento("small", "", detalle));
  return card;
}

function crearHistorial(historial = []) {
  const panel = crearElemento("section", "dispositivos-panel");
  const lista = crearElemento("div", "dispositivos-history");

  panel.appendChild(crearElemento("h3", "", "Historial local"));

  if (!historial.length) {
    lista.appendChild(crearElemento("p", "dispositivos-empty", "Aún no hay preparaciones guardadas."));
  } else {
    historial.slice(0, 5).forEach((evento) => {
      const item = crearElemento("article", "dispositivos-history__item");
      item.appendChild(crearElemento("strong", "", evento.mensaje || evento.tipo));
      item.appendChild(crearElemento("span", "", evento.creadoEn || ""));
      lista.appendChild(item);
    });
  }

  panel.appendChild(lista);
  return panel;
}

export function crearDispositivosView(estado) {
  const pantalla = crearElemento("section", "dispositivos-screen");
  const header = crearElemento("section", "dispositivos-header");
  const statusGrid = crearElemento("section", "dispositivos-status-grid");
  const form = crearElemento("form", "dispositivos-form");
  const cubittPanel = crearElemento("section", "dispositivos-panel");
  const googlePanel = crearElemento("section", "dispositivos-panel");
  const puentePanel = crearElemento("section", "dispositivos-panel dispositivos-panel--bridge");
  const mensaje = crearElemento("p", "dispositivos-message");
  const boton = crearElemento("button", "dispositivos-button dispositivos-button--primary", DISPOSITIVOS_TEXTOS.BOTON_GUARDAR);

  header.appendChild(crearElemento("p", "dispositivos-kicker", "Conexiones"));
  header.appendChild(crearElemento("h2", "", DISPOSITIVOS_TEXTOS.TITULO));
  header.appendChild(crearElemento("p", "", DISPOSITIVOS_TEXTOS.SUBTITULO));
  header.appendChild(crearElemento("small", "dispositivos-privacy", DISPOSITIVOS_TEXTOS.AVISO_PRIVADO));

  statusGrid.appendChild(crearEstadoCard(estado.resumen.cubitt.titulo, estado.resumen.cubitt.detalle, estado.resumen.cubitt.estado));
  statusGrid.appendChild(crearEstadoCard(estado.resumen.googleFit.titulo, estado.resumen.googleFit.detalle, estado.resumen.googleFit.estado));
  statusGrid.appendChild(crearEstadoCard(estado.resumen.puente.titulo, estado.resumen.puente.detalle, estado.resumen.puente.estado));

  cubittPanel.appendChild(crearElemento("h3", "", DISPOSITIVOS_TEXTOS.CUBITT_TITULO));
  cubittPanel.appendChild(crearElemento("p", "", "Prepara el reloj para que luego un conector real pueda leer pasos o actividad."));
  cubittPanel.appendChild(crearCheck({ name: "cubittActivo", label: "Usar Cubitt como dispositivo preparado", checked: estado.cubitt.activo }));
  cubittPanel.appendChild(crearInput({ name: "cubittMarca", label: "Marca", value: estado.cubitt.marca }));
  cubittPanel.appendChild(crearInput({ name: "cubittModelo", label: "Modelo", value: estado.cubitt.modelo }));
  cubittPanel.appendChild(crearInput({ name: "cubittVariante", label: "Variante", value: estado.cubitt.variante }));
  cubittPanel.appendChild(crearInput({ name: "cubittAlias", label: "Alias visible", value: estado.cubitt.alias }));
  cubittPanel.appendChild(crearInput({ name: "cubittIdentificadorLocal", label: "identificador local del reloj", value: estado.cubitt.identificadorLocal, placeholder: "Escríbelo solo en tu PC" }));
  cubittPanel.appendChild(crearElemento("small", "dispositivos-note", estado.cubitt.nota));

  googlePanel.appendChild(crearElemento("h3", "", DISPOSITIVOS_TEXTOS.GOOGLE_FIT_TITULO));
  googlePanel.appendChild(crearElemento("p", "", "Deja lista la cuenta y qué datos quieres importar cuando exista la conexión real."));
  googlePanel.appendChild(crearCheck({ name: "googleFitActivo", label: "Preparar Google Fit", checked: estado.googleFit.activo }));
  googlePanel.appendChild(crearInput({ name: "googleFitCuenta", label: "Cuenta Google", value: estado.googleFit.cuenta, placeholder: "correo o alias local" }));
  googlePanel.appendChild(crearCheck({ name: "googleFitLecturaPasos", label: "Importar pasos", checked: estado.googleFit.lecturaPasos }));
  googlePanel.appendChild(crearCheck({ name: "googleFitLecturaBicicleta", label: "Importar bicicleta", checked: estado.googleFit.lecturaBicicleta }));
  googlePanel.appendChild(crearCheck({ name: "googleFitSincronizacionAutomatica", label: "Sincronización automática futura", checked: estado.googleFit.sincronizacionAutomatica }));
  googlePanel.appendChild(crearElemento("small", "dispositivos-note", estado.googleFit.nota));

  puentePanel.appendChild(crearElemento("h3", "", DISPOSITIVOS_TEXTOS.PUENTE_TITULO));
  puentePanel.appendChild(crearElemento("p", "", "Define cómo FitJeff debe tratar datos importados para evitar duplicados."));
  puentePanel.appendChild(crearSelectFuente(estado.puente.fuentePreferida));
  puentePanel.appendChild(crearCheck({ name: "importarPasos", label: "Permitir pasos importados", checked: estado.puente.importarPasos }));
  puentePanel.appendChild(crearCheck({ name: "importarBicicleta", label: "Permitir bicicleta importada", checked: estado.puente.importarBicicleta }));
  puentePanel.appendChild(crearCheck({ name: "evitarDuplicados", label: "Evitar duplicados por fecha y fuente", checked: estado.puente.evitarDuplicados }));

  boton.type = "submit";
  form.appendChild(cubittPanel);
  form.appendChild(googlePanel);
  form.appendChild(puentePanel);
  form.appendChild(mensaje);
  form.appendChild(boton);

  pantalla.appendChild(header);
  pantalla.appendChild(statusGrid);
  pantalla.appendChild(form);
  pantalla.appendChild(crearHistorial(estado.historial));

  return {
    pantalla,
    form,
    mensaje
  };
}

export function leerDispositivosForm(form) {
  const datos = new FormData(form);
  return Object.fromEntries(datos.entries());
}

export function pintarMensajeDispositivos(mensajeNodo, resultado) {
  mensajeNodo.textContent = resultado?.mensaje || "";
  mensajeNodo.classList.toggle("dispositivos-message--ok", Boolean(resultado?.ok));
  mensajeNodo.classList.toggle("dispositivos-message--error", Boolean(resultado && !resultado.ok));
}
