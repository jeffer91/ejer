/*
  Nombre completo: diario.view.js
  Ruta o ubicación: src/features/entrenamiento/diario/diario.view.js

  Función o funciones:
    - Construir la pantalla Diario de Entrenamiento.
    - Mostrar la rutina activa del día cuando exista.
    - Preparar acciones para iniciar, completar y revisar una sesión.

  Se conecta con:
    - src/features/entrenamiento/diario/diario.controller.js
    - src/features/entrenamiento/diario/diario.css
*/

import "./diario.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

function crearAccion(texto, clase = "") {
  const boton = crearElemento("button", `entreno-diario-button ${clase}`.trim(), texto);
  boton.type = "button";
  boton.disabled = true;
  return boton;
}

function crearItem(texto) {
  return crearElemento("article", "entreno-diario-item", texto);
}

export function crearEntrenamientoDiarioView({ rutinaDelDia = {}, resumen = {} } = {}) {
  const pantalla = crearElemento("section", "entreno-diario-screen");
  const header = crearElemento("div", "entreno-diario-header");
  const panel = crearElemento("section", "entreno-diario-panel");
  const acciones = crearElemento("div", "entreno-diario-actions");
  const lista = crearElemento("div", "entreno-diario-list");
  const rutina = rutinaDelDia.rutina;
  const dia = rutinaDelDia.dia;

  header.appendChild(crearElemento("p", "entreno-diario-kicker", rutinaDelDia.diaSemana || "Hoy"));
  header.appendChild(crearElemento("h2", "", "Diario"));
  header.appendChild(crearElemento("p", "", "Rutina activa según el día y los ajustes guardados."));

  if (rutina && dia) {
    lista.appendChild(crearItem(`Rutina activa: ${rutina.nombre}`));
    lista.appendChild(crearItem(`Día cargado: ${dia.nombre}`));
    lista.appendChild(crearItem(`Ejercicios preparados: ${dia.ejercicios.length}`));
  } else {
    lista.appendChild(crearItem("Rutina activa: pendiente de configurar."));
    lista.appendChild(crearItem("Crea una rutina y actívala para que Diario cargue el día automáticamente."));
  }

  lista.appendChild(crearItem(`IA: ${resumen.iaActiva ? "activa" : "inactiva"} · Voz: ${resumen.vozActiva ? "activa" : "inactiva"}`));

  acciones.appendChild(crearAccion("Iniciar"));
  acciones.appendChild(crearAccion("Completar"));
  acciones.appendChild(crearAccion("Revisar"));

  panel.appendChild(crearElemento("h3", "", "Sesión del día"));
  panel.appendChild(lista);
  panel.appendChild(acciones);

  pantalla.appendChild(header);
  pantalla.appendChild(panel);
  return pantalla;
}
