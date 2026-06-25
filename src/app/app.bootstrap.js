/*
  Nombre completo: app.bootstrap.js
  Ruta o ubicación: src/app/app.bootstrap.js

  Función o funciones:
    - Iniciar FitJeff en modo web o PWA.
    - Instalar captura global de errores simples.
    - Montar la estructura principal dentro de #app.
    - Registrar el service worker si el navegador lo permite.

  Se conecta con:
    - index.html
    - src/app/app-router.js
    - src/app/app.css
    - src/core/errors/app-error-handler.service.js
    - service-worker.js
*/

import "./app.css";
import { crearAppErrorHandlerService } from "../core/errors/app-error-handler.service.js";
import { crearRouterFitJeff } from "./app-router.js";

const errorHandler = crearAppErrorHandlerService();
errorHandler.instalarCapturaGlobal();

const raiz = document.getElementById("app");
const perfilInicialCompletado = localStorage.getItem("fitjeff:onboarding-completed") === "true";

try {
  const router = crearRouterFitJeff({ raiz, perfilInicialCompletado });
  router.iniciar();
} catch (error) {
  const resultado = errorHandler.registrarError(error, {
    modulo: "app",
    accion: "inicio",
    mensajeUsuario: "FitJeff no pudo iniciar correctamente. Recarga la app."
  });

  if (raiz) {
    raiz.textContent = resultado.mensaje;
  }
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch((error) => {
    errorHandler.registrarError(error, {
      modulo: "pwa",
      accion: "registrar-service-worker",
      mensajeUsuario: "La app funciona, pero el modo sin conexión aún no se activó."
    });
  });
}
