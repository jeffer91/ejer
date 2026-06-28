/*
  Nombre completo: app.bootstrap.js
  Ruta o ubicación: src/app/app.bootstrap.js

  Función o funciones:
    - Iniciar FitJeff en modo web, PWA o Electron.
    - Instalar captura global de errores simples.
    - Restaurar datos locales/Firebase antes de decidir si mostrar Inicio.
    - Montar la estructura principal dentro de #app.
    - Lanzar sincronización en segundo plano sin bloquear la interfaz.
    - Registrar el service worker solo en producción web/PWA para evitar caché viejo en desarrollo y Electron.

  Se conecta con:
    - index.html
    - src/app/app-router.js
    - src/app/app.css
    - src/core/bootstrap/app-data-hydration.service.js
    - src/core/sync/sync.service.js
    - src/core/errors/app-error-handler.service.js
    - service-worker.js
*/

import "./app.css";
import { crearAppErrorHandlerService } from "../core/errors/app-error-handler.service.js";
import { prepararDatosAntesDeRouter } from "../core/bootstrap/app-data-hydration.service.js";
import { crearSyncService } from "../core/sync/sync.service.js";
import { crearRouterFitJeff } from "./app-router.js";

const errorHandler = crearAppErrorHandlerService();
errorHandler.instalarCapturaGlobal();

const raiz = document.getElementById("app");

function renderizarErrorInicio(error) {
  const resultado = errorHandler.registrarError(error, {
    modulo: "app",
    accion: "inicio",
    mensajeUsuario: "FitJeff no pudo iniciar correctamente. Recarga la app."
  });

  if (raiz) {
    raiz.textContent = resultado.mensaje;
  }
}

function sincronizarEnSegundoPlano() {
  const syncService = crearSyncService();

  syncService.sincronizarAhora().catch((error) => {
    errorHandler.registrarError(error, {
      modulo: "sync",
      accion: "sincronizar-inicio",
      mensajeUsuario: "Tus datos locales están guardados. La nube se sincronizará después."
    });
  });
}

function debeRegistrarServiceWorker() {
  return Boolean(
    "serviceWorker" in navigator
    && !window.fitJeffDesktop
    && !import.meta.env.DEV
  );
}

function registrarServiceWorkerPwa() {
  if (!debeRegistrarServiceWorker()) {
    return;
  }

  navigator.serviceWorker.register("./service-worker.js").catch((error) => {
    errorHandler.registrarError(error, {
      modulo: "pwa",
      accion: "registrar-service-worker",
      mensajeUsuario: "La app funciona, pero el modo sin conexión aún no se activó."
    });
  });
}

async function iniciarFitJeff() {
  const preparacionDatos = await prepararDatosAntesDeRouter();

  const router = crearRouterFitJeff({
    raiz,
    perfilInicialCompletado: preparacionDatos.perfilInicialCompletado
  });

  router.iniciar();
  sincronizarEnSegundoPlano();
  registrarServiceWorkerPwa();
}

iniciarFitJeff().catch(renderizarErrorInicio);
