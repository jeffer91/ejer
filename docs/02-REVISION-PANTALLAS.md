# Revisión de pantallas - Fitness Jeff

## Alcance

Revisión estática de navegación, variables, rutas, servicios compartidos e integraciones. Esta revisión no reemplaza la prueba real con `npm start`, Live Server, Firebase, Apps Script y Gemini, pero deja identificados los puntos revisados y las correcciones aplicadas.

## Resultado general

Estado: funcional para prueba local.

Correcciones aplicadas durante la revisión:

1. Google Sheets: el Apps Script ahora respeta el orden de columnas según encabezados de cada hoja.
2. Google Sheets: el cliente ahora detecta respuestas inválidas y errores devueltos por Apps Script.
3. Firebase: el cliente dejó de ser solo preparación local y ahora usa Firebase SDK para intentar conexión real con Firestore.
4. Menú principal: todas las pantallas principales están conectadas desde `src/index.html`.

## Revisión por módulos

| Módulo | Pantalla | Ruta | Estado |
|---|---|---|---|
| Progreso | Peso | `src/pantallas/01-progreso/01-peso/prpe-index.html` | OK |
| Progreso | Medidas | `src/pantallas/01-progreso/02-medidas/prme-index.html` | OK |
| Progreso | Registrar datos | `src/pantallas/01-progreso/03-registrar-datos/prrd-index.html` | OK |
| Entrenamiento | Hoy | `src/pantallas/02-entrenamiento/01-hoy/enho-index.html` | OK |
| Entrenamiento | HIIT | `src/pantallas/02-entrenamiento/02-hiit/enhi-index.html` | OK |
| Entrenamiento | Rutinas | `src/pantallas/02-entrenamiento/03-rutinas/enru-index.html` | OK |
| Horarios | Registro de horarios | `src/pantallas/03-ayuno/01-ayuno/ayay-index.html` | OK funcional, carpeta heredada como `03-ayuno` |
| Horarios | Agua | `src/pantallas/03-ayuno/02-agua/ayag-index.html` | OK funcional, carpeta heredada como `03-ayuno` |
| Recomendaciones | Análisis general | `src/pantallas/04-recomendaciones/01-analisis-general/reag-index.html` | OK local |
| Recomendaciones | Entrenamiento | `src/pantallas/04-recomendaciones/02-entrenamiento/reen-index.html` | OK local |
| Recomendaciones | Alimentación | `src/pantallas/04-recomendaciones/03-alimentacion/real-index.html` | OK local |
| Recomendaciones | Hábitos | `src/pantallas/04-recomendaciones/04-habitos/reha-index.html` | OK local |
| Ajustes | Perfil | `src/pantallas/05-ajustes/01-perfil/ajpe-index.html` | OK |
| Ajustes | Google Sheets | `src/pantallas/05-ajustes/02-google-sheets/ajgs-index.html` | OK, requiere Apps Script desplegado |
| Ajustes | Firebase | `src/pantallas/05-ajustes/03-firebase/ajfb-index.html` | OK, requiere Firebase configurado y reglas correctas |
| Ajustes | Gemini | `src/pantallas/05-ajustes/04-gemini/ajgm-index.html` | OK, requiere API Key y modelo válido |
| Voz | Asistente | `src/pantallas/06-voz/01-asistente/voas-index.html` | OK |
| Voz | Historial | `src/pantallas/06-voz/02-historial/vohi-index.html` | OK |

## Conexiones revisadas

### Menú principal

- Cada botón del menú usa `data-screen`.
- La carga se realiza dentro del iframe principal.
- No deben quedar botones principales con `data-pending="true"`.

### Variables y almacenamiento local

- Las pantallas usan claves separadas de `localStorage` por módulo.
- Las pantallas cargan datos demo si no existe información local.
- Las pantallas guardan y recuperan información sin depender de una base externa para iniciar.

### Google Sheets

- Servicios compartidos:
  - `fit-gs-schema.js`
  - `fit-gs-client.service.js`
  - `fit-gs-sync.service.js`
  - `apps-script/fit-gs-webapp.gs`
- Requiere copiar el Apps Script, desplegarlo como Web App y pegar la URL en Ajustes / Google Sheets.

### Firebase

- Servicios compartidos:
  - `fit-fb-schema.js`
  - `fit-fb-client.service.js`
  - `fit-fb-sync.service.js`
- Requiere internet, configuración válida y reglas Firestore que permitan escritura del usuario.

### Gemini

- Servicios compartidos:
  - `fit-gm-prompts.js`
  - `fit-gm-client.service.js`
  - `fit-gm-recommendations.service.js`
- Requiere API Key y modelo válido.

## Observaciones no bloqueantes

1. El módulo visible se llama `Horarios`, pero la carpeta técnica sigue siendo `03-ayuno`. Funciona, pero se puede renombrar después si se quiere limpieza total.
2. Las pantallas de Recomendaciones generan recomendaciones locales. La respuesta real de Gemini queda guardada en `localStorage`, pero todavía no se muestra automáticamente dentro de las tarjetas de Recomendaciones.
3. Firebase ahora intenta conexión real, pero depende de reglas de Firestore. Si las reglas niegan escritura, la pantalla mostrará error.
4. Para Google Sheets se debe volver a desplegar Apps Script después de copiar la versión corregida.

## Prueba recomendada

1. Abrir `src/index.html` con Live Server.
2. Recorrer cada botón del menú.
3. Guardar un registro de prueba en cada pantalla con formulario.
4. Revisar que no aparezcan errores en consola.
5. Ejecutar `npm install` y `npm start`.
6. Probar Apps Script, Firebase y Gemini con credenciales reales.
