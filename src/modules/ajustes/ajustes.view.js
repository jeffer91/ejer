/*
  Nombre completo: ajustes.view.js
  Ruta o ubicacion: src/modules/ajustes/ajustes.view.js

  Funcion o funciones:
    - Construir la pantalla visual de Ajustes.
    - Mostrar formularios simples para perfil y objetivo.
    - Crear boton para reabrir Inicio.
    - Crear bloque simple de copia de seguridad.
    - Crear bloque de sincronización manual sin exponer detalles técnicos pesados.
    - Mantener la vista sin logica de guardado.

  Se conecta con:
    - src/modules/ajustes/ajustes.controller.js
    - src/modules/ajustes/ajustes.constants.js
    - src/modules/ajustes/ajustes.css
*/

import { AJUSTES_CAMPOS, AJUSTES_TEXTOS } from "./ajustes.constants.js";
import "./ajustes.css";

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  if (texto !== undefined && texto !== null) {
    elemento.textContent = texto;
  }

  return elemento;
}

function crearCampo({ id, label, tipo, placeholder, valor, inputMode }) {
  const grupo = crearElemento("label", "ajustes-field");
  const texto = crearElemento("span", "ajustes-field__label", label);
  const input = crearElemento("input", "ajustes-field__input");
  const error = crearElemento("small", "ajustes-field__error");

  input.id = id;
  input.name = id;
  input.type = tipo || "text";
  input.placeholder = placeholder || "";
  input.autocomplete = "off";

  if (inputMode) {
    input.inputMode = inputMode;
  }

  if (valor !== undefined && valor !== null) {
    input.value = valor;
  }

  grupo.appendChild(texto);
  grupo.appendChild(input);
  grupo.appendChild(error);

  return grupo;
}

function fechaCorta(valor) {
  if (!valor) return "Sin registro";

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;

  return fecha.toLocaleString("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function crearFormularioPerfil(datos) {
  const form = crearElemento("form", "ajustes-card ajustes-form");
  const mensaje = crearElemento("p", "ajustes-message");
  const boton = crearElemento("button", "ajustes-button", AJUSTES_TEXTOS.GUARDAR_PERFIL);

  form.dataset.form = "perfil";
  form.appendChild(crearElemento("h3", "ajustes-card__title", AJUSTES_TEXTOS.PERFIL));
  form.appendChild(crearCampo({
    id: AJUSTES_CAMPOS.ALTURA_CM,
    label: "Altura",
    placeholder: "Ejemplo: 1.75 o 175 cm",
    valor: datos.perfil?.alturaCm || "",
    inputMode: "decimal"
  }));
  form.appendChild(crearCampo({
    id: AJUSTES_CAMPOS.FECHA_NACIMIENTO,
    label: "Fecha de nacimiento",
    tipo: "date",
    valor: datos.perfil?.fechaNacimiento || ""
  }));

  boton.type = "submit";
  form.appendChild(mensaje);
  form.appendChild(boton);

  return { form, mensaje };
}

function crearFormularioObjetivo(datos) {
  const form = crearElemento("form", "ajustes-card ajustes-form");
  const mensaje = crearElemento("p", "ajustes-message");
  const boton = crearElemento("button", "ajustes-button", AJUSTES_TEXTOS.GUARDAR_OBJETIVO);

  form.dataset.form = "objetivo";
  form.appendChild(crearElemento("h3", "ajustes-card__title", AJUSTES_TEXTOS.OBJETIVO));
  form.appendChild(crearCampo({
    id: AJUSTES_CAMPOS.PESO_OBJETIVO_KG,
    label: "Peso objetivo",
    placeholder: "Ejemplo: 80 kg",
    valor: datos.objetivo?.pesoObjetivoKg || "",
    inputMode: "decimal"
  }));

  boton.type = "submit";
  form.appendChild(mensaje);
  form.appendChild(boton);

  return { form, mensaje };
}

function crearBloqueInicio() {
  const bloque = crearElemento("article", "ajustes-card ajustes-card--info");
  const boton = crearElemento("button", "ajustes-button ajustes-button--secondary", AJUSTES_TEXTOS.REABRIR_INICIO);

  boton.type = "button";
  boton.dataset.action = "reabrir-inicio";

  bloque.appendChild(crearElemento("h3", "ajustes-card__title", "Inicio"));
  bloque.appendChild(crearElemento("p", "ajustes-card__text", "Puedes reabrir la configuración inicial cuando quieras revisar los datos base."));
  bloque.appendChild(boton);

  return { bloque, boton };
}

function crearBloqueBackup() {
  const bloque = crearElemento("article", "ajustes-card ajustes-card--backup");
  const acciones = crearElemento("div", "ajustes-backup-actions");
  const mensaje = crearElemento("p", "ajustes-message");
  const exportarBoton = crearElemento("button", "ajustes-button", "Exportar copia");
  const importarBoton = crearElemento("button", "ajustes-button ajustes-button--secondary", "Importar copia");
  const inputArchivo = crearElemento("input", "ajustes-file-input");

  exportarBoton.type = "button";
  importarBoton.type = "button";
  exportarBoton.dataset.action = "exportar-backup";
  importarBoton.dataset.action = "importar-backup";

  inputArchivo.type = "file";
  inputArchivo.accept = "application/json,.json";
  inputArchivo.dataset.input = "backup-file";

  acciones.appendChild(exportarBoton);
  acciones.appendChild(importarBoton);
  bloque.appendChild(crearElemento("h3", "ajustes-card__title", "Copia de seguridad"));
  bloque.appendChild(crearElemento("p", "ajustes-card__text", "Crea o restaura una copia local de tus datos de FitJeff."));
  bloque.appendChild(acciones);
  bloque.appendChild(inputArchivo);
  bloque.appendChild(mensaje);

  return {
    bloque,
    exportarBoton,
    importarBoton,
    inputArchivo,
    mensaje
  };
}

function crearBloqueSync() {
  const bloque = crearElemento("article", "ajustes-card ajustes-card--sync");
  const acciones = crearElemento("div", "ajustes-backup-actions");
  const estado = crearElemento("div", "ajustes-sync-status");
  const mensaje = crearElemento("p", "ajustes-message");
  const sincronizarBoton = crearElemento("button", "ajustes-button", "Sincronizar ahora");

  sincronizarBoton.type = "button";
  sincronizarBoton.dataset.action = "sincronizar-manual";

  acciones.appendChild(sincronizarBoton);
  bloque.appendChild(crearElemento("h3", "ajustes-card__title", "Sincronización"));
  bloque.appendChild(crearElemento("p", "ajustes-card__text", "FitJeff sincroniza en segundo plano una vez al día y solo envía cambios pendientes."));
  bloque.appendChild(estado);
  bloque.appendChild(acciones);
  bloque.appendChild(mensaje);

  return {
    bloque,
    sincronizarBoton,
    estado,
    mensaje
  };
}

export function crearAjustesView(datos) {
  const pantalla = crearElemento("section", "ajustes-screen");
  const header = crearElemento("div", "ajustes-header");
  const layout = crearElemento("div", "ajustes-layout");
  const perfil = crearFormularioPerfil(datos);
  const objetivo = crearFormularioObjetivo(datos);
  const inicio = crearBloqueInicio();
  const sync = crearBloqueSync();
  const backup = crearBloqueBackup();

  header.appendChild(crearElemento("p", "ajustes-kicker", "Configuración"));
  header.appendChild(crearElemento("h2", "", AJUSTES_TEXTOS.TITULO));
  header.appendChild(crearElemento("p", "", AJUSTES_TEXTOS.SUBTITULO));

  layout.appendChild(perfil.form);
  layout.appendChild(objetivo.form);
  layout.appendChild(inicio.bloque);
  layout.appendChild(sync.bloque);
  layout.appendChild(backup.bloque);

  pantalla.appendChild(header);
  pantalla.appendChild(layout);

  return {
    pantalla,
    perfilForm: perfil.form,
    perfilMensaje: perfil.mensaje,
    objetivoForm: objetivo.form,
    objetivoMensaje: objetivo.mensaje,
    reabrirInicioBoton: inicio.boton,
    syncBoton: sync.sincronizarBoton,
    syncEstado: sync.estado,
    syncMensaje: sync.mensaje,
    backupExportarBoton: backup.exportarBoton,
    backupImportarBoton: backup.importarBoton,
    backupInputArchivo: backup.inputArchivo,
    backupMensaje: backup.mensaje
  };
}

export function actualizarEstadoSync(vista, estado = {}) {
  if (!vista?.syncEstado) return;

  const modulos = (estado.modulosSucios || []).map((modulo) => modulo.nombre).join(", ") || "Ninguno";
  vista.syncEstado.innerHTML = "";

  [
    ["Cola pendiente", `${estado.colaPendiente || 0} cambio(s)`],
    ["Cambios por módulo", modulos],
    ["Último automático", fechaCorta(estado.ultimoAutoSyncEn)],
    ["Último manual", fechaCorta(estado.ultimoManualSyncEn)],
    ["Último resultado", estado.ultimoResultado || "Sin registro"]
  ].forEach(([label, value]) => {
    const fila = crearElemento("p", "ajustes-sync-status__row");
    fila.appendChild(crearElemento("strong", "", label));
    fila.appendChild(crearElemento("span", "", value));
    vista.syncEstado.appendChild(fila);
  });
}

export function leerFormularioAjustes(formulario) {
  const formData = new FormData(formulario);
  const datos = {};

  formData.forEach((valor, clave) => {
    datos[clave] = valor;
  });

  return datos;
}

export function mostrarErroresAjustes(formulario, errores) {
  formulario.querySelectorAll(".ajustes-field").forEach((campo) => {
    const input = campo.querySelector("input");
    const error = campo.querySelector(".ajustes-field__error");
    const mensaje = errores[input.name] || "";

    campo.classList.toggle("ajustes-field--error", Boolean(mensaje));
    error.textContent = mensaje;
  });
}

export function mostrarMensajeAjustes(elemento, mensaje, ok) {
  elemento.textContent = mensaje || "";
  elemento.className = ok ? "ajustes-message ajustes-message--ok" : "ajustes-message ajustes-message--error";
}
