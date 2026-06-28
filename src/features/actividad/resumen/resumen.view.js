import { ACTIVIDAD_ROUTES } from "../actividad.routes.js";
import { ACTIVIDAD_TEXTOS } from "../actividad.constants.js";
import "./resumen.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function formatoEntero(valor) {
  return Number(valor || 0).toLocaleString("es-EC");
}

function formatoDecimal(valor, sufijo) {
  return `${Number(valor || 0).toFixed(1)} ${sufijo}`;
}

function crearTarjeta(titulo, valor, detalle, estado = "info") {
  const tarjeta = crearElemento("article", `actividad-card actividad-card--${estado}`);
  tarjeta.appendChild(crearElemento("span", "actividad-card__label", titulo));
  tarjeta.appendChild(crearElemento("strong", "actividad-card__value", valor));
  tarjeta.appendChild(crearElemento("small", "actividad-card__detail", detalle));
  return tarjeta;
}

function crearRegistroReciente(registro) {
  const item = crearElemento("article", "actividad-recent-item");
  const titulo = registro.tipo === "bicicleta" ? "Bicicleta" : registro.tipo === "mixto" ? "Pasos + bicicleta" : "Pasos";
  const detalle = [
    registro.pasos ? `${formatoEntero(registro.pasos)} pasos` : "",
    registro.bicicletaMin ? formatoDecimal(registro.bicicletaMin, "min") : "",
    registro.bicicletaKm ? formatoDecimal(registro.bicicletaKm, "km") : ""
  ].filter(Boolean).join(" · ");

  item.appendChild(crearElemento("strong", "", titulo));
  item.appendChild(crearElemento("span", "", registro.fecha));
  item.appendChild(crearElemento("p", "", detalle || "Sin detalle"));

  return item;
}

function crearPanelDispositivos(dispositivos = {}) {
  const panel = crearElemento("section", "actividad-panel actividad-panel--devices");
  const top = crearElemento("div", "actividad-panel__top");
  const boton = crearElemento("button", "actividad-button", "Preparar dispositivos");
  const grid = crearElemento("div", "actividad-device-grid");

  boton.type = "button";
  boton.dataset.rutaDestino = ACTIVIDAD_ROUTES.DISPOSITIVOS;

  top.appendChild(crearElemento("h3", "", "Dispositivos preparados"));
  top.appendChild(boton);
  panel.appendChild(top);

  [dispositivos.cubitt, dispositivos.googleFit, dispositivos.puente].filter(Boolean).forEach((item) => {
    grid.appendChild(crearTarjeta(item.titulo, item.estado === "success" ? "Listo" : item.estado === "pending" ? "Pendiente" : "Preparado", item.detalle, item.estado));
  });

  panel.appendChild(grid);
  return panel;
}

export function crearActividadResumenView(resumen) {
  const pantalla = crearElemento("section", "actividad-screen");
  const header = crearElemento("section", "actividad-header");
  const accion = crearElemento("button", "actividad-button actividad-button--primary", "Registrar actividad");
  const tarjetas = crearElemento("section", "actividad-grid");
  const recientes = crearElemento("section", "actividad-panel");
  const recientesLista = crearElemento("div", "actividad-recent-list");

  accion.type = "button";
  accion.dataset.rutaDestino = ACTIVIDAD_ROUTES.REGISTRO;

  header.appendChild(crearElemento("p", "actividad-kicker", "Movimiento diario"));
  header.appendChild(crearElemento("h2", "", ACTIVIDAD_TEXTOS.RESUMEN_TITULO));
  header.appendChild(crearElemento("p", "", ACTIVIDAD_TEXTOS.RESUMEN_SUBTITULO));
  header.appendChild(accion);

  tarjetas.appendChild(crearTarjeta("Pasos hoy", formatoEntero(resumen.hoy.pasos), "Registro manual del día", resumen.hoy.pasos > 0 ? "success" : "pending"));
  tarjetas.appendChild(crearTarjeta("Bicicleta hoy", formatoDecimal(resumen.hoy.bicicletaMin, "min"), `${formatoDecimal(resumen.hoy.bicicletaKm, "km")}`, resumen.hoy.bicicletaMin > 0 || resumen.hoy.bicicletaKm > 0 ? "success" : "pending"));
  tarjetas.appendChild(crearTarjeta("Pasos semana", formatoEntero(resumen.semana.pasos), `${resumen.semana.diasActivos} día(s) activos`, resumen.semana.pasos > 0 ? "info" : "empty"));
  tarjetas.appendChild(crearTarjeta("Bici semana", formatoDecimal(resumen.semana.bicicletaMin, "min"), `${formatoDecimal(resumen.semana.bicicletaKm, "km")}`, resumen.semana.bicicletaMin > 0 || resumen.semana.bicicletaKm > 0 ? "info" : "empty"));

  recientes.appendChild(crearElemento("h3", "", "Registros recientes"));

  if (!resumen.recientes || resumen.recientes.length === 0) {
    recientesLista.appendChild(crearElemento("p", "actividad-empty", "Aún no hay actividad guardada."));
  } else {
    resumen.recientes.forEach((registro) => recientesLista.appendChild(crearRegistroReciente(registro)));
  }

  recientes.appendChild(recientesLista);
  pantalla.appendChild(header);
  pantalla.appendChild(tarjetas);
  pantalla.appendChild(crearPanelDispositivos(resumen.dispositivos));
  pantalla.appendChild(recientes);

  return pantalla;
}
