/*
  Nombre completo: vite.config.js
  Ruta o ubicación: vite.config.js

  Función o funciones:
    - Configurar Vite como servidor de desarrollo y constructor web.
    - Generar la carpeta dist para PWA, Electron y futura APK.
    - Mantener una configuración simple para crecer por módulos.

  Se conecta con:
    - package.json
    - index.html
    - src/app/app.bootstrap.js
*/

import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  publicDir: "public",
  server: {
    port: 5173,
    strictPort: true
  },
  preview: {
    port: 4173,
    strictPort: true
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
