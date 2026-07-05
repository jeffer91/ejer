# Auditoría de variables, carpetas y límite de líneas

## Resultado general

Estado después de la revisión: **organizado y listo para prueba local**.

Correcciones aplicadas en esta auditoría:

1. Google Sheets ahora recoge las variables locales de todos los módulos principales, no solo unas pocas pantallas.
2. Firebase ahora recoge las mismas variables locales que Google Sheets para que el respaldo sea consistente.
3. Apps Script ahora respeta encabezados y orden de columnas al escribir en Google Sheets.
4. El cliente de Google Sheets ahora detecta respuestas inválidas o errores reales devueltos por Apps Script.
5. El cliente Firebase ahora intenta conexión real con Firestore usando SDK desde CDN.
6. Se creó un script PowerShell para contar líneas y detectar archivos que superen 600 líneas.

## Organización por carpetas

La estructura principal queda organizada así:

```text
src/
  app/
  shared/
    integraciones/
      google-sheets/
      firebase/
      gemini/
  pantallas/
    01-progreso/
    02-entrenamiento/
    03-ayuno/
    04-recomendaciones/
    05-ajustes/
    06-voz/

electron/
docs/
scripts/
```

Cada subpantalla mantiene su propia carpeta con esta idea:

```text
pantalla-index.html
pantalla.css
pantalla-main.js
data/pantalla-demo-data.json
```

## Conexión de variables locales

Las variables principales de `localStorage` quedaron conectadas a Google Sheets y Firebase desde los servicios compartidos.

### Variables conectadas a sincronización

| Variable local | Módulo | Destino Google Sheets | Destino Firebase |
|---|---|---|---|
| `fitness-jeff-ajpe-perfil` | Ajustes / Perfil | Perfil | perfil |
| `fitness-jeff-prpe-registros` | Progreso / Peso | RegistrosDiarios | registrosDiarios |
| `fitness-jeff-prme-registros` | Progreso / Medidas | RegistrosDiarios | registrosDiarios |
| `fitness-jeff-prrd-registros` | Progreso / Registrar datos | RegistrosDiarios | registrosDiarios |
| `fitness-jeff-enho-sesion` | Entrenamiento / Hoy | Entrenamientos | entrenamientos |
| `fitness-jeff-enhi-datos` | Entrenamiento / HIIT | Entrenamientos | entrenamientos |
| `fitness-jeff-enru-plan` | Entrenamiento / Rutinas | Entrenamientos | entrenamientos |
| `fitness-jeff-ayay-datos` | Horarios / Registro de horarios | RegistrosDiarios | registrosDiarios |
| `fitness-jeff-ayag-datos` | Horarios / Agua | Hidratacion | hidratacion |
| `fitness-jeff-reag-recomendaciones` | Recomendaciones / Análisis general | Recomendaciones | recomendaciones |
| `fitness-jeff-reen-recomendaciones` | Recomendaciones / Entrenamiento | Recomendaciones | recomendaciones |
| `fitness-jeff-real-recomendaciones` | Recomendaciones / Alimentación | Recomendaciones | recomendaciones |
| `fitness-jeff-reha-recomendaciones` | Recomendaciones / Hábitos | Recomendaciones | recomendaciones |
| `fitness-jeff-voas-historial` | Voz / Asistente | SyncLog | syncLog |
| `fitness-jeff-vohi-historial` | Voz / Historial | SyncLog | syncLog |
| `fitness-jeff-gemini-ultima-respuesta` | Gemini | Recomendaciones | recomendaciones |

## Límite de 600 líneas

No se detectó, por revisión estática de los archivos creados y actualizados, ningún archivo que esté cerca de 600 líneas.

Aun así, para verificarlo directamente en tu PC se creó este script:

```text
scripts/fit-auditoria-lineas.ps1
```

Comando recomendado desde PowerShell en la raíz del proyecto:

```powershell
.\scripts\fit-auditoria-lineas.ps1
```

El script revisa archivos `.html`, `.css`, `.js`, `.json`, `.cjs`, `.md`, `.gs` y `.ps1`, excluyendo carpetas como `.git`, `node_modules`, `android`, `dist` y `build`.

Si algún archivo supera 600 líneas, el script lo marca como:

```text
SUPERAR_LIMITE
```

y devuelve salida con error para que se pueda dividir por funciones.

## Observaciones técnicas

1. El módulo visible en menú se llama `Horarios`, pero la carpeta técnica sigue siendo `03-ayuno`. Funciona correctamente, aunque se puede renombrar en otra limpieza si se desea coherencia total.
2. Google Sheets y Firebase ya recogen las variables locales principales, pero la prueba real depende de credenciales y permisos.
3. Gemini guarda la última respuesta real en `fitness-jeff-gemini-ultima-respuesta`. Esa variable ya queda conectada a sincronización.
4. Las pantallas de recomendaciones siguen funcionando localmente aunque Gemini no esté configurado.

## Próxima prueba obligatoria

Después de descargar o actualizar el repositorio en tu PC:

```powershell
npm install
npm start
.\scripts\fit-auditoria-lineas.ps1
```

Si el script marca algún archivo sobre 600 líneas, se debe dividir por funciones antes de seguir agregando módulos.
