# Pruebas finales - Fitness Jeff

## 1. Probar en navegador con Live Server

Abrir primero:

```text
src/index.html
```

Verificar que el menú superior abra estas pantallas:

```text
Progreso > Peso
Progreso > Medidas
Progreso > Registrar datos
Entrenamiento > Hoy
Entrenamiento > HIIT
Entrenamiento > Rutinas
Horarios > Registro de horarios
Horarios > Agua
Recomendaciones > Análisis general
Recomendaciones > Entrenamiento
Recomendaciones > Alimentación
Recomendaciones > Hábitos
Ajustes > Perfil
Ajustes > Google Sheets
Ajustes > Firebase
Ajustes > Gemini
Voz > Asistente
Voz > Historial
```

## 2. Probar Electron

Desde la raíz del proyecto:

```bash
npm install
npm start
```

Debe abrirse una ventana de escritorio con la app.

## 3. Probar Android con Capacitor

Desde la raíz del proyecto:

```bash
npm install
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
```

Luego compilar desde Android Studio.

## 4. Probar Google Sheets

1. Copiar el contenido de `src/shared/integraciones/google-sheets/apps-script/fit-gs-webapp.gs`.
2. Pegarlo en Apps Script dentro de una hoja de Google Sheets.
3. Desplegar como Web App.
4. Pegar la URL en `Ajustes > Google Sheets`.
5. Usar los botones: Guardar configuración, Probar conexión real, Crear tablas y Sincronizar ahora.

## 5. Probar Firebase

1. Ingresar datos de Firebase en `Ajustes > Firebase`.
2. Guardar configuración.
3. Presionar Probar respaldo.
4. Presionar Respaldar ahora.

## 6. Probar Gemini

1. Ingresar API Key y modelo en `Ajustes > Gemini`.
2. Guardar configuración.
3. Presionar Probar conexión real.
4. Presionar Generar recomendación real.

## 7. Revisión rápida

- Ningún botón principal debe quedar como pendiente.
- Las pantallas deben abrir dentro del iframe principal.
- Cada subpantalla también debe abrir directamente con Live Server.
- Electron no debe mostrar error de preload faltante.
- `package.json` debe existir en la raíz.
- `capacitor.config.json` debe existir en la raíz.
