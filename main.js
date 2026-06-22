/*
  Nombre completo: main.js
  Ruta o ubicación: main.js

  Función:
    - Crear la ventana principal de FitJeff en Electron.
    - Cargar index.html sin duplicar la lógica web de la app.
    - Preparar canales IPC seguros para entorno y actualización de escritorio.

  Se conecta con:
    - package.json
    - preload.js
    - index.html
    - src/actualizaciones/actualizaciones.service.js
*/

const path = require("path");
const { app, BrowserWindow, ipcMain, shell } = require("electron");

let ventanaPrincipal = null;

function crearVentanaPrincipal() {
  ventanaPrincipal = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 380,
    minHeight: 620,
    title: "FitJeff",
    backgroundColor: "#f5f7fb",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  ventanaPrincipal.loadFile(path.join(__dirname, "index.html"));

  ventanaPrincipal.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (process.env.FITJEFF_DEVTOOLS === "true") {
    ventanaPrincipal.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(() => {
  registrarCanalesIPC();
  crearVentanaPrincipal();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      crearVentanaPrincipal();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function registrarCanalesIPC() {
  ipcMain.handle("fitjeff:obtener-entorno", () => ({
    esElectron: true,
    plataforma: process.platform,
    arquitectura: process.arch,
    versionElectron: process.versions.electron,
    versionNode: process.versions.node,
    versionApp: app.getVersion()
  }));

  ipcMain.handle("fitjeff:solicitar-actualizacion", async () => {
    return {
      ok: false,
      estado: "no-configurado",
      mensaje:
        "La actualización automática real de Electron necesita empaquetado y publicación de releases. Por ahora usa GitHub/descarga o la PWA."
    };
  });
}
