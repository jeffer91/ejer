/*
  Nombre completo: dispositivos.view.js
  Ruta o ubicación: src/features/actividad/dispositivos/dispositivos.view.js

  Función o funciones:
    - Construir la pantalla de Dispositivos y Bluetooth.
    - Mostrar anexado local de Cubitt CT4 por Bluetooth.
    - Mostrar explorador privado GATT para buscar pasos en datos HEX.
    - Mostrar preparación local de Google Fit y puente FitJeff.
    - Mostrar puente claro de importación CSV/JSON.
    - Leer formularios de configuración e importación.
    - Mantener la vista sin lógica de guardado.

  Se conecta con:
    - src/features/actividad/dispositivos/dispositivos.controller.js
    - src/features/actividad/dispositivos/dispositivos.service.js
    - src/features/actividad/dispositivos/dispositivos.constants.js
*/

import { DISPOSITIVOS_FUENTES, DISPOSITIVOS_TEXTOS } from "./dispositivos.constants.js";
import "./dispositivos.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearInput({ name, label, value = "", placeholder = "", type = "text", readonly = false }) {
  const campo = crearElemento("label", "dispositivos-field");
  const texto = crearElemento("span", "", label);
  const input = crearElemento("input", "dispositivos-input");

  input.name = name;
  input.type = type;
  input.value = value || "";
  input.placeholder = placeholder;
  input.autocomplete = "off";
  input.readOnly = Boolean(readonly);

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

function crearBotonAccion(texto, action, variante = "secondary") {
  const boton = crearElemento("button", `dispositivos-button dispositivos-button--${variante}`, texto);
  boton.type = "button";
  boton.dataset.action = action;
  return boton;
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

function crearEstadoCard(titulo, detalle, estado, etiqueta = "") {
  const card = crearElemento("article", `dispositivos-status dispositivos-status--${estado}`);
  card.appendChild(crearElemento("span", "dispositivos-status__label", titulo));
  card.appendChild(crearElemento("strong", "", etiqueta || (estado === "success" ? "Listo" : estado === "pending" ? "Pendiente" : "Preparado")));
  card.appendChild(crearElemento("small", "", detalle));
  return card;
}

function crearDatoDiagnostico(label, valor = "") {
  const item = crearElemento("article", "dispositivos-diagnostic__item");
  item.appendChild(crearElemento("span", "", label));
  item.appendChild(crearElemento("strong", "", valor || "—"));
  return item;
}

function crearDiagnosticoCubitt(cubitt = {}) {
  const panel = crearElemento("section", "dispositivos-diagnostic");
  const servicios = Array.isArray(cubitt.bluetoothServiciosLeidos) && cubitt.bluetoothServiciosLeidos.length
    ? cubitt.bluetoothServiciosLeidos.join(", ")
    : "Pendiente";

  panel.appendChild(crearElemento("h4", "", "Diagnóstico Bluetooth"));
  panel.appendChild(crearDatoDiagnostico("Nombre detectado", cubitt.bluetoothNombre || cubitt.alias));
  panel.appendChild(crearDatoDiagnostico("ID local", cubitt.bluetoothId || cubitt.identificadorLocal));
  panel.appendChild(crearDatoDiagnostico("Batería", cubitt.bluetoothBateria === null || cubitt.bluetoothBateria === undefined ? "Pendiente" : `${cubitt.bluetoothBateria}%`));
  panel.appendChild(crearDatoDiagnostico("Fabricante", cubitt.bluetoothFabricante));
  panel.appendChild(crearDatoDiagnostico("Modelo detectado", cubitt.bluetoothModeloDetectado));
  panel.appendChild(crearDatoDiagnostico("Servicios estándar", servicios));
  panel.appendChild(crearElemento("p", "dispositivos-diagnostic__note", cubitt.bluetoothUltimoDiagnostico || cubitt.nota || "Escanea el reloj para anexarlo a FitJeff."));
  return panel;
}

function fechaCorta(iso) {
  if (!iso) return "Pendiente";
  try {
    return new Date(iso).toLocaleString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (_error) {
    return iso;
  }
}

function uuidCorto(uuid = "") {
  const texto = String(uuid || "");
  return texto.length > 18 ? `${texto.slice(0, 8)}…${texto.slice(-6)}` : texto || "—";
}

function obtenerCaracteristicasExploradas(cubitt = {}) {
  const servicios = Array.isArray(cubitt.bluetoothExploracion?.servicios) ? cubitt.bluetoothExploracion.servicios : [];
  return servicios.flatMap((servicio) => (servicio.caracteristicas || []).map((caracteristica) => ({
    servicioUuid: servicio.uuid,
    ...caracteristica
  })));
}

function crearFilaTabla(celdas = [], encabezado = false) {
  const fila = crearElemento("div", encabezado ? "dispositivos-private-table__row dispositivos-private-table__row--head" : "dispositivos-private-table__row");
  celdas.forEach((celda) => fila.appendChild(crearElemento("span", "", celda)));
  return fila;
}

function crearTablaExploracion(cubitt = {}) {
  const tabla = crearElemento("div", "dispositivos-private-table");
  const caracteristicas = obtenerCaracteristicasExploradas(cubitt);

  tabla.appendChild(crearFilaTabla(["Servicio", "Característica", "Permisos", "HEX", "Decimal posible"], true));

  if (!caracteristicas.length) {
    tabla.appendChild(crearFilaTabla(["Pendiente", "Pulsa Explorar servicios privados", "—", "—", "—"]));
    return tabla;
  }

  caracteristicas.slice(0, 16).forEach((item) => {
    tabla.appendChild(crearFilaTabla([
      uuidCorto(item.servicioUuid),
      uuidCorto(item.uuid),
      item.permisos || "—",
      item.valorHex || item.error || "sin lectura",
      item.decimalPosible || "—"
    ]));
  });

  return tabla;
}

function crearTablaCambios(cubitt = {}) {
  const tabla = crearElemento("div", "dispositivos-private-table dispositivos-private-table--changes");
  const cambios = Array.isArray(cubitt.bluetoothComparacion?.cambios) ? cubitt.bluetoothComparacion.cambios : [];

  tabla.appendChild(crearFilaTabla(["Característica", "Antes HEX", "Después HEX", "Decimal antes", "Decimal después"], true));

  if (!cambios.length) {
    tabla.appendChild(crearFilaTabla(["Pendiente", "Toma lectura 1", "Toma lectura 2", "Luego compara", "—"]));
    return tabla;
  }

  cambios.slice(0, 12).forEach((item) => {
    tabla.appendChild(crearFilaTabla([
      uuidCorto(item.caracteristicaUuid),
      item.antesHex || "—",
      item.despuesHex || "—",
      item.antesDecimal || "—",
      item.despuesDecimal || "—"
    ]));
  });

  return tabla;
}

function crearExploradorPrivado(cubitt = {}) {
  const panel = crearElemento("section", "dispositivos-private-explorer");
  const acciones = crearElemento("div", "dispositivos-bluetooth-actions");
  const explorarBoton = crearBotonAccion(DISPOSITIVOS_TEXTOS.BOTON_EXPLORAR_PRIVADO, "cubitt-explorar", "primary");
  const lectura1Boton = crearBotonAccion(DISPOSITIVOS_TEXTOS.BOTON_LECTURA_1, "cubitt-lectura-1", "secondary");
  const lectura2Boton = crearBotonAccion(DISPOSITIVOS_TEXTOS.BOTON_LECTURA_2, "cubitt-lectura-2", "secondary");
  const compararBoton = crearBotonAccion(DISPOSITIVOS_TEXTOS.BOTON_COMPARAR, "cubitt-comparar", "secondary");
  const resumen = cubitt.bluetoothExploracion?.resumen || {};

  acciones.appendChild(explorarBoton);
  acciones.appendChild(lectura1Boton);
  acciones.appendChild(lectura2Boton);
  acciones.appendChild(compararBoton);

  panel.appendChild(crearElemento("h4", "", DISPOSITIVOS_TEXTOS.EXPLORADOR_TITULO));
  panel.appendChild(crearElemento("p", "", "Usa esto para encontrar dónde el reloj guarda pasos. Primero explora, luego toma lectura 1, camina 20 o 30 pasos y toma lectura 2."));
  panel.appendChild(acciones);
  panel.appendChild(crearDatoDiagnostico("Última exploración", cubitt.bluetoothExploracion?.creadoEn ? fechaCorta(cubitt.bluetoothExploracion.creadoEn) : "Pendiente"));
  panel.appendChild(crearDatoDiagnostico("Servicios privados", resumen.totalServicios ? String(resumen.totalServicios) : "Pendiente"));
  panel.appendChild(crearDatoDiagnostico("Características", resumen.totalCaracteristicas ? String(resumen.totalCaracteristicas) : "Pendiente"));
  panel.appendChild(crearDatoDiagnostico("Lecturas HEX", resumen.totalLeidas ? String(resumen.totalLeidas) : "Pendiente"));
  panel.appendChild(crearDatoDiagnostico("Lectura 1", cubitt.bluetoothLectura1?.creadoEn ? fechaCorta(cubitt.bluetoothLectura1.creadoEn) : "Pendiente"));
  panel.appendChild(crearDatoDiagnostico("Lectura 2", cubitt.bluetoothLectura2?.creadoEn ? fechaCorta(cubitt.bluetoothLectura2.creadoEn) : "Pendiente"));
  panel.appendChild(crearDatoDiagnostico("Cambios detectados", cubitt.bluetoothComparacion?.totalCambios ? String(cubitt.bluetoothComparacion.totalCambios) : "Pendiente"));
  panel.appendChild(crearTablaExploracion(cubitt));
  panel.appendChild(crearTablaCambios(cubitt));

  return {
    panel,
    explorarBoton,
    lectura1Boton,
    lectura2Boton,
    compararBoton
  };
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

function crearPanelImportacion(estado) {
  const form = crearElemento("form", "dispositivos-import-form");
  const panel = crearElemento("section", "dispositivos-panel dispositivos-panel--import");
  const acciones = crearElemento("div", "dispositivos-import-actions");
  const mensaje = crearElemento("p", "dispositivos-message");
  const textarea = crearElemento("textarea", "dispositivos-textarea");
  const importarBoton = crearElemento("button", "dispositivos-button dispositivos-button--primary", DISPOSITIVOS_TEXTOS.BOTON_IMPORTAR);
  const ejemploBoton = crearElemento("button", "dispositivos-button dispositivos-button--secondary", "Pegar ejemplo");

  textarea.name = "datosImportacion";
  textarea.rows = 7;
  textarea.placeholder = estado.ejemploImportacion || "fecha,pasos,bicicletaMin,bicicletaKm,fuente,nota";
  textarea.autocomplete = "off";

  importarBoton.type = "submit";
  ejemploBoton.type = "button";
  ejemploBoton.dataset.action = "pegar-ejemplo";

  acciones.appendChild(importarBoton);
  acciones.appendChild(ejemploBoton);
  panel.appendChild(crearElemento("h3", "", DISPOSITIVOS_TEXTOS.IMPORTAR_TITULO));
  panel.appendChild(crearElemento("p", "", DISPOSITIVOS_TEXTOS.IMPORTAR_AYUDA));
  panel.appendChild(textarea);
  panel.appendChild(acciones);
  panel.appendChild(mensaje);
  form.appendChild(panel);

  return {
    form,
    textarea,
    mensaje,
    ejemploBoton
  };
}

export function crearDispositivosView(estado) {
  const pantalla = crearElemento("section", "dispositivos-screen");
  const header = crearElemento("section", "dispositivos-header");
  const statusGrid = crearElemento("section", "dispositivos-status-grid");
  const form = crearElemento("form", "dispositivos-form");
  const cubittPanel = crearElemento("section", "dispositivos-panel dispositivos-panel--cubitt");
  const bluetoothAcciones = crearElemento("div", "dispositivos-bluetooth-actions");
  const googlePanel = crearElemento("section", "dispositivos-panel");
  const puentePanel = crearElemento("section", "dispositivos-panel dispositivos-panel--bridge");
  const importacion = crearPanelImportacion(estado);
  const mensaje = crearElemento("p", "dispositivos-message");
  const boton = crearElemento("button", "dispositivos-button dispositivos-button--primary", DISPOSITIVOS_TEXTOS.BOTON_GUARDAR);
  const cubittEscanearBoton = crearBotonAccion(DISPOSITIVOS_TEXTOS.BOTON_BLUETOOTH_ANEXAR, "cubitt-escanear", "primary");
  const cubittProbarBoton = crearBotonAccion(DISPOSITIVOS_TEXTOS.BOTON_BLUETOOTH_PROBAR, "cubitt-probar", "secondary");
  const exploradorPrivado = crearExploradorPrivado(estado.cubitt);

  header.appendChild(crearElemento("p", "dispositivos-kicker", "Conexiones"));
  header.appendChild(crearElemento("h2", "", DISPOSITIVOS_TEXTOS.TITULO));
  header.appendChild(crearElemento("p", "", DISPOSITIVOS_TEXTOS.SUBTITULO));
  header.appendChild(crearElemento("small", "dispositivos-privacy", DISPOSITIVOS_TEXTOS.AVISO_PRIVADO));

  statusGrid.appendChild(crearEstadoCard(estado.resumen.cubitt.titulo, estado.resumen.cubitt.detalle, estado.resumen.cubitt.estado, estado.resumen.cubitt.etiqueta));
  statusGrid.appendChild(crearEstadoCard(estado.resumen.googleFit.titulo, estado.resumen.googleFit.detalle, estado.resumen.googleFit.estado, estado.resumen.googleFit.etiqueta));
  statusGrid.appendChild(crearEstadoCard(estado.resumen.puente.titulo, estado.resumen.puente.detalle, estado.resumen.puente.estado, estado.resumen.puente.etiqueta));

  bluetoothAcciones.appendChild(cubittEscanearBoton);
  bluetoothAcciones.appendChild(cubittProbarBoton);

  cubittPanel.appendChild(crearElemento("h3", "", DISPOSITIVOS_TEXTOS.CUBITT_TITULO));
  cubittPanel.appendChild(crearElemento("p", "", "Anexa el reloj directo por Bluetooth. Si conecta pero no entrega servicios estándar, usa el explorador privado."));
  cubittPanel.appendChild(bluetoothAcciones);
  cubittPanel.appendChild(crearDiagnosticoCubitt(estado.cubitt));
  cubittPanel.appendChild(exploradorPrivado.panel);
  cubittPanel.appendChild(crearCheck({ name: "cubittActivo", label: "Usar Cubitt como dispositivo principal", checked: estado.cubitt.activo }));
  cubittPanel.appendChild(crearInput({ name: "cubittMarca", label: "Marca", value: estado.cubitt.marca }));
  cubittPanel.appendChild(crearInput({ name: "cubittModelo", label: "Modelo", value: estado.cubitt.modelo }));
  cubittPanel.appendChild(crearInput({ name: "cubittVariante", label: "Variante", value: estado.cubitt.variante }));
  cubittPanel.appendChild(crearInput({ name: "cubittAlias", label: "Alias visible", value: estado.cubitt.alias }));
  cubittPanel.appendChild(crearInput({ name: "cubittBluetoothNombre", label: "Nombre Bluetooth", value: estado.cubitt.bluetoothNombre, placeholder: "Cubitt CT4", readonly: true }));
  cubittPanel.appendChild(crearInput({ name: "cubittIdentificadorLocal", label: "Identificador local del reloj", value: estado.cubitt.identificadorLocal, placeholder: "Se llena al anexar por Bluetooth" }));
  cubittPanel.appendChild(crearElemento("small", "dispositivos-note", estado.cubitt.nota));

  googlePanel.appendChild(crearElemento("h3", "", DISPOSITIVOS_TEXTOS.GOOGLE_FIT_TITULO));
  googlePanel.appendChild(crearElemento("p", "", "Opcional. Para este reloj viejo, el camino principal será Bluetooth directo desde FitJeff."));
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
  pantalla.appendChild(importacion.form);
  pantalla.appendChild(crearHistorial(estado.historial));

  return {
    pantalla,
    form,
    mensaje,
    cubittEscanearBoton,
    cubittProbarBoton,
    cubittExplorarBoton: exploradorPrivado.explorarBoton,
    cubittLectura1Boton: exploradorPrivado.lectura1Boton,
    cubittLectura2Boton: exploradorPrivado.lectura2Boton,
    cubittCompararBoton: exploradorPrivado.compararBoton,
    importForm: importacion.form,
    importTextarea: importacion.textarea,
    importMensaje: importacion.mensaje,
    ejemploBoton: importacion.ejemploBoton,
    ejemploImportacion: estado.ejemploImportacion || ""
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
