/*
  Nombre completo: app.js
  Ruta o ubicación: src/app.js

  Función:
    - Arrancar FitJeff desde el navegador, Live Server, Firebase Hosting, PWA o Electron.
    - Delegar el control real de la app a src/app-controller.js.
    - Mostrar un error visible si algún módulo falla durante la carga.

  Se conecta con:
    - index.html
    - src/app-controller.js
    - styles/base.css
    - styles/layout.css
    - styles/componentes.css
    - styles/responsive.css
*/

import { iniciarFitJeff } from "./app-controller.js";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await iniciarFitJeff();
  } catch (error) {
    console.error("No se pudo iniciar FitJeff.", error);
    mostrarErrorInicial(error);
  }
});

function mostrarErrorInicial(error) {
  const root = document.getElementById("app") || document.body;
  const mensaje = error?.message || "Error desconocido al iniciar la app.";

  root.innerHTML = `
    <main class="fit-main">
      <section class="card">
        <h1>FitJeff no pudo iniciar</h1>
        <div class="alerta danger">
          <p>${escaparHTML(mensaje)}</p>
        </div>
        <p class="muted">Revisa la consola del navegador para ver el detalle técnico.</p>
      </section>
    </main>
  `;
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
