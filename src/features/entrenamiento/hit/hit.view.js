/*
  Nombre completo: hit.view.js
  Ruta o ubicación: src/features/entrenamiento/hit/hit.view.js

  Función o funciones:
    - Construir la pantalla HIT de Entrenamiento.
    - Mostrar base para intervalos, caminata y bicicleta.
    - Preparar temporizador y registro seguro para próximos bloques.

  Se conecta con:
    - src/features/entrenamiento/hit/hit.controller.js
    - src/features/entrenamiento/hit/hit.css
*/

import "./hit.css";

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function crearModo(titulo, detalle) {
  const tarjeta = crearElemento("article", "entreno-hit-card");
  tarjeta.appendChild(crearElemento("h3", "", titulo));
  tarjeta.appendChild(crearElemento("p", "", detalle));
  tarjeta.appendChild(crearElemento("span", "entreno-hit-badge", "Pendiente de activar"));
  return tarjeta;
}

export function crearEntrenamientoHitView() {
  const pantalla = crearElemento("section", "entreno-hit-screen");
  const header = crearElemento("div", "entreno-hit-header");
  const grid = crearElemento("div", "entreno-hit-grid");
  const timer = crearElemento("section", "entreno-hit-timer");

  header.appendChild(crearElemento("p", "entreno-hit-kicker", "Cardio"));
  header.appendChild(crearElemento("h2", "", "HIT"));
  header.appendChild(crearElemento("p", "", "Pantalla base para intervalos controlados, caminata, bicicleta y otro cardio."));

  grid.appendChild(crearModo("Intervalos", "Temporizador con actividad, pausa y ciclos configurables."));
  grid.appendChild(crearModo("Caminata", "Registro simple de tiempo, distancia opcional y sensación general."));
  grid.appendChild(crearModo("Bicicleta", "Registro simple de tiempo, distancia opcional y sensación general."));

  timer.appendChild(crearElemento("h3", "", "Temporizador"));
  timer.appendChild(crearElemento("strong", "entreno-hit-time", "00:00"));
  timer.appendChild(crearElemento("p", "", "El temporizador funcional se conectará en el bloque correspondiente."));

  pantalla.appendChild(header);
  pantalla.appendChild(grid);
  pantalla.appendChild(timer);
  return pantalla;
}
