/*
  Nombre completo: rutinas.time-help.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.time-help.js

  Función o funciones:
    - Mostrar ayuda rápida para registrar ejercicios por tiempo en Rutinas.
    - Explicar ejemplos como bicicleta, caminata, plancha y movilidad sin series/repeticiones.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.controller.js
*/

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = String(texto);
  return elemento;
}

export function insertarAyudaTiempoRutinas(pantalla) {
  if (!pantalla || pantalla.querySelector(".entreno-rutinas-time-help")) return;

  const formBox = pantalla.querySelector(".entreno-rutinas-form");
  const form = pantalla.querySelector(".entreno-rutinas-grid");
  if (!formBox || !form) return;

  const ayuda = crearElemento("div", "entreno-rutinas-message entreno-rutinas-message--ok entreno-rutinas-time-help");
  ayuda.appendChild(crearElemento("strong", "", "Ejercicios por tiempo"));
  ayuda.appendChild(crearElemento("span", "", "Para calentamientos, cardio, movilidad o planchas puedes escribir duración sin usar series ni repeticiones."));
  ayuda.appendChild(crearElemento("small", "", "Ejemplos: Bicicleta suave | duracion=10min · Plancha | duracion=45s · Caminata | duracion=15min · Estiramiento de cadera | duracion=6min"));

  formBox.insertBefore(ayuda, form);
}
