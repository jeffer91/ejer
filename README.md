# FitJeff

App personal para registrar entrenamiento, peso, estadísticas y recomendaciones.

## Qué hace

FitJeff permite registrar:

- Día de rutina realizado.
- Series, repeticiones, segundos, minutos o rondas.
- Fallo técnico.
- Energía inicial y final.
- Esfuerzo general.
- Dolor o molestia.
- Observaciones.
- Peso corporal.
- Estadísticas y recomendaciones locales.

La app está pensada para funcionar primero en local. Firebase queda preparado para sincronización, pero se debe activar cuando la autenticación esté lista.

## Estructura principal

```txt
index.html
main.js
preload.js
package.json
service-worker.js
firebase.json
firestore.rules
public/
  manifest.json
  version.json
src/
  app.js
  app-controller.js
  data/
  firebase/
  storage/
  entrenamiento/
  peso/
  estadisticas/
  recomendaciones/
  sincronizacion/
  pwa/
  actualizaciones/
  diagnostico/
  ui/
  vistas/
styles/
  base.css
  layout.css
  componentes.css
  responsive.css
assets/
  icons/icon.svg
functions/
```

## Ejecutar con Live Server

Opción recomendada para probar rápido:

1. Abrir la carpeta del proyecto en VS Code.
2. Abrir `index.html`.
3. Clic derecho.
4. Elegir **Open with Live Server**.

También puedes usar:

```bash
npm install
npm run serve
```

## Ejecutar con Electron

```bash
npm install
npm start
```

Electron carga el mismo `index.html`. La lógica principal está en `src/app-controller.js`.

## PWA / celular

La app incluye:

- `public/manifest.json`
- `service-worker.js` en raíz
- `src/pwa/pwa.service.js`
- `src/actualizaciones/actualizaciones.service.js`
- `public/version.json`

Para instalarla como PWA se debe abrir desde Live Server, Firebase Hosting o HTTPS. No funciona como PWA si se abre directo como archivo local.

## Actualización de app instalada

La app tiene botón **Actualizar app**.

Proceso actual:

1. Revisa `public/version.json`.
2. Actualiza service worker.
3. Limpia caché `fitjeff-*`.
4. Recarga la app.

Para publicar una actualización:

1. Cambiar archivos.
2. Subir a GitHub/Firebase Hosting.
3. Subir `build` en `public/version.json`.
4. Abrir la app instalada.
5. Pulsar **Actualizar app**.

## Firebase

Proyecto configurado:

```txt
projectId: jeff-2f92d
usuario principal: jeff
```

Archivos relacionados:

```txt
src/firebase/firebase.config.js
src/firebase/firebase.app.js
src/firebase/firestore.service.js
firebase.json
firestore.rules
functions/index.js
functions/gemini.service.js
```

## Importante sobre Firebase Auth

`firestore.rules` está seguro y exige usuario autenticado. Por eso, por defecto FitJeff arranca en modo local:

```txt
usarFirebase: false
sincronizarAutomaticamente: false
```

Cuando se agregue autenticación, se podrá activar Firebase desde Ajustes.

## Gemini

La clave de Gemini no debe estar en frontend.

Estructura preparada:

```txt
App FitJeff
Firebase Functions
Gemini API
Firestore recomendaciones
```

Configurar la variable o secreto:

```bash
GEMINI_API_KEY=TU_CLAVE
```

## Archivos críticos para arranque

```txt
index.html
src/app.js
src/app-controller.js
src/data/usuario-base.js
src/data/rutina-base.js
src/storage/local-storage.service.js
styles/base.css
styles/layout.css
styles/componentes.css
styles/responsive.css
```

## Estado actual

La app ya tiene:

- Base visual.
- Rutina de 4 días.
- Registro de entrenamiento.
- Registro de peso.
- Estadísticas simples.
- Recomendaciones locales.
- Exportación JSON/TXT.
- PWA preparada.
- Electron preparado.
- Firebase preparado, pendiente de Auth.
