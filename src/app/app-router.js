/*
  Nombre completo: app-router.js
  Ruta o ubicación: src/app/app-router.js
  Función: navegación base de FitJeff.
  Se conecta con: src/app/app.bootstrap.js.
*/

export function crearRouterFitJeff(configuracion) {
  let rutaActual = configuracion.perfilInicialCompletado ? "estadisticas" : "inicio";

  function iniciar() {
    configuracion.raiz.textContent = "FitJeff - " + rutaActual;
  }

  function navegar(ruta) {
    rutaActual = ruta || rutaActual;
    iniciar();
  }

  return {
    iniciar,
    navegar,
    obtenerRutaActual: () => rutaActual
  };
}
