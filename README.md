# Fitness Jeff

App personal de bienestar, entrenamiento, hábitos, recomendaciones con IA, voz e integraciones.

## Estado final de construcción

La app quedó organizada por pantallas independientes y módulos. Cada subpantalla tiene su propia carpeta, HTML, CSS, JS y datos demo cuando corresponde.

## Módulos construidos

```text
Progreso
- Peso
- Medidas
- Registrar datos

Entrenamiento
- Hoy
- HIIT
- Rutinas

Horarios
- Registro de horarios
- Agua

Recomendaciones
- Análisis general
- Entrenamiento
- Alimentación
- Hábitos

Ajustes
- Perfil
- Google Sheets
- Firebase
- Gemini

Voz
- Asistente
- Historial
```

## Integraciones incluidas

```text
Google Sheets
- Cliente compartido
- Servicio de sincronización
- Esquema de tablas
- Apps Script Web App

Firebase
- Esquema de colecciones
- Cliente base
- Servicio de respaldo

Gemini
- Prompts seguros
- Cliente REST
- Servicio de recomendaciones
```

## Ejecutar en Electron

Desde la raíz del proyecto:

```bash
npm install
npm start
```

## Ejecutar con Live Server

Abrir:

```text
src/index.html
```

También se puede probar cada subpantalla directamente desde su carpeta.

## Preparar Android con Capacitor

```bash
npm install
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
```

## Archivos importantes

```text
package.json
capacitor.config.json
electron/fit-electron-main.cjs
electron/fit-electron-preload.cjs
src/index.html
docs/01-PRUEBAS-FINALES.md
```

## Notas de seguridad de la app

Las recomendaciones son prudentes y orientadas a hábitos sostenibles. La app no reemplaza una consulta profesional ni promueve extremos.
