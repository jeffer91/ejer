/*
  Nombre completo: rutinas.delete-actions.js
  Ruta o ubicación: src/features/entrenamiento/rutinas/rutinas.delete-actions.js

  Función o funciones:
    - Insertar botón Borrar en las tarjetas de rutinas guardadas.
    - Pedir confirmación antes de borrar definitivamente una rutina.
    - Evitar borrados accidentales, especialmente si la rutina está activa.

  Se conecta con:
    - src/features/entrenamiento/rutinas/rutinas.controller.js
    - src/features/entrenamiento/rutinas/rutinas.service.js
*/

function crearBotonBorrarRutina(rutina, onBorrar) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "entreno-rutinas-button entreno-rutinas-button--danger";
  boton.textContent = "Borrar";
  boton.title = "Borra definitivamente esta rutina. No borra sesiones históricas ya registradas.";

  boton.addEventListener("click", () => {
    const nombre = rutina?.nombre || "esta rutina";
    const confirmar = window.confirm(`¿Borrar definitivamente "${nombre}"?\n\nEsta acción no se puede deshacer. Las sesiones históricas ya registradas se conservarán.`);

    if (!confirmar) return;

    if (rutina?.estado === "activa") {
      const confirmarActiva = window.confirm(`"${nombre}" está marcada como rutina activa.\n\n¿Seguro que quieres borrarla?`);
      if (!confirmarActiva) return;
    }

    onBorrar?.(rutina.id);
  });

  return boton;
}

export function insertarBotonesBorrarRutina(pantalla, { rutinas = [], onBorrar } = {}) {
  if (!pantalla || typeof onBorrar !== "function") return;

  const tarjetas = [...pantalla.querySelectorAll(".entreno-rutinas-card")];

  tarjetas.forEach((tarjeta, indice) => {
    const rutina = rutinas[indice];
    const acciones = tarjeta.querySelector(".entreno-rutinas-card__actions");

    if (!rutina || !acciones || acciones.querySelector("[data-rutina-borrar='true']")) return;

    const boton = crearBotonBorrarRutina(rutina, onBorrar);
    boton.dataset.rutinaBorrar = "true";
    acciones.appendChild(boton);
  });
}
