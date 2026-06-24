# Configurar Gemini en FitJeff

Esta guía deja claro dónde se coloca la API key de Gemini y cómo probar Jarvis remoto.

## Idea principal

La API key de Gemini **no debe ir en el frontend**. No debe escribirse en `index.html`, `src/firebase/firebase.config.js`, `src/jarvis/jarvis.gemini.service.js` ni en ninguna vista.

FitJeff usa esta ruta segura:

```txt
App web / PWA / Electron
        ↓
Firebase Functions
        ↓
Gemini API
```

## Nombre de la clave

La app espera este secreto en Firebase Functions:

```txt
GEMINI_API_KEY
```

## Comandos

Desde la carpeta principal del proyecto:

```bash
firebase login
firebase functions:secrets:set GEMINI_API_KEY
npm run firebase:functions
```

Cuando Firebase pregunte el valor, pega la API key de Gemini.

## Activar en la app

En FitJeff:

```txt
1. Abrir Ajustes.
2. Activar Usar Firebase.
3. Activar Usar Gemini / Jarvis remoto.
4. Guardar ajustes.
5. Abrir Jarvis.
6. Escribir una pregunta y presionar Preguntar.
```

## Qué pasa si Gemini falla

Jarvis no debe romper la app. Si Firebase Functions o Gemini fallan, FitJeff responde en modo local con una recomendación segura.

## Archivos relacionados

```txt
functions/index.js
functions/gemini.service.js
functions/jarvis.service.js
src/jarvis/jarvis.gemini.service.js
src/jarvis/jarvis.inteligente.service.js
src/vistas/ajustes.view.js
src/vistas/jarvis.view.js
```

## Verificación rápida

```bash
npm run check:release
npm run firebase:functions
```

Después revisa en Firebase Console que existan las funciones:

```txt
generarRecomendacionFitJeff
consultarJarvisFitJeff
pingFitJeff
```
