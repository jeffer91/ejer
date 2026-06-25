/*
  Nombre completo: app.bootstrap.js
  Ruta o ubicación: src/app/app.bootstrap.js

  Función o funciones:
    - Iniciar FitJeff en modo web o PWA.
    - Montar la estructura principal dentro de #app.
    - Registrar el service worker si el navegador lo permite.
    - Delegar la navegación interna a app.router.js.

  Se conecta con:
    - index.html
    - src/app/app.router.js
    - src/app/app.css
    - service-worker.js
*/

import "./app.css";
import { crearRouterFitJeff } from "./app.router.js";

const APP_ELEMENT_ID = "app";
const STORAGE_KEY_ONBOARDING_COMPLETED = "fitjeff:onboarding-completed";

function obtenerElementoRaiz() {
  const elemento = document.getElementById(APP_ELEMENT_ID);

  if (!elemento) {
    throw new Error("No se encontró el contenedor principal de FitJeff.");
  }

  return elemento;
}

function perfilInicialCompletado() {
  return localStorage.getItem(STORAGE_KEY_ONBOARDING_COMPLETED) === "true";
}

async function registrarServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("./service-worker.js");
  } catch (error) {
    console.warn("FitJeff no pudo activar el modo sin conexión todavía.", error);
  }
}

function iniciarFitJeff() {
  const raiz = obtenerElementoRaiz();
  const router = crearRouterFitJeff({
    raiz,
    perfilInicialCompletado: perfilInicialCompletado()
  });

  router.iniciar();
  registrarServiceWorker();
}

iniciarFitJeff();
