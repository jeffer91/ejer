/*
  Nombre completo: electron-menu.service.js
  Ruta o ubicación: electron/electron-menu.service.js

  Función o funciones:
    - Crear un menú simple para FitJeff en escritorio.
    - Mantener opciones básicas: recargar, pantalla completa, herramientas y salir.
    - Evitar menús técnicos innecesarios para el uso normal.

  Se conecta con:
    - electron/main.js
    - electron/electron-window.service.js
*/

import { Menu, app } from "electron";
import { estaEnDesarrolloElectron } from "./electron-path.service.js";

export function instalarMenuAplicacion() {
  const menu = Menu.buildFromTemplate([
    {
      label: "FitJeff",
      submenu: [
        { label: "Recargar", role: "reload" },
        { label: "Pantalla completa", role: "togglefullscreen" },
        { type: "separator" },
        { label: "Salir", click: () => app.quit() }
      ]
    },
    {
      label: "Vista",
      submenu: [
        { label: "Acercar", role: "zoomin" },
        { label: "Alejar", role: "zoomout" },
        { label: "Tamaño normal", role: "resetzoom" },
        ...(estaEnDesarrolloElectron() ? [{ type: "separator" }, { label: "Herramientas", role: "toggleDevTools" }] : [])
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
}
