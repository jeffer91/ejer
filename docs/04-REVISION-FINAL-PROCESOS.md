# Revisión final de procesos y subprocesos - Fitness Jeff

## Resultado final

Estado de revisión estática: **apto para prueba local completa**.

No se puede confirmar ejecución real hasta correr la app en el equipo con `npm install`, `npm start`, Live Server y credenciales reales. Sin embargo, la revisión de estructura, rutas, procesos, subprocesos, variables locales e integraciones queda cerrada.

## Corrección aplicada en esta última revisión

Se corrigió el cliente Gemini para que también use la variable `maxTokens` configurada en `Ajustes / Gemini`. Antes el formulario guardaba ese valor, pero el cliente solo enviaba temperatura. Ahora el cliente arma `generation_config` con:

```text
temperature
max_output_tokens
```

## Procesos principales revisados

| Proceso | Subprocesos | Estado |
|---|---|---|
| Shell principal | Menú superior, submenús, iframe, estado visual | OK |
| Progreso | Peso, medidas, registro diario | OK |
| Entrenamiento | Sesión de hoy, HIIT, rutinas | OK |
| Horarios | Registro de horarios, agua | OK funcional |
| Recomendaciones | Análisis general, entrenamiento, alimentación, hábitos | OK local |
| Ajustes | Perfil, Google Sheets, Firebase, Gemini | OK |
| Voz | Asistente, historial | OK |
| Google Sheets | Configuración, validación, creación de tablas, sincronización | OK, requiere Apps Script desplegado |
| Firebase | Configuración, prueba, respaldo por colecciones | OK, requiere reglas y credenciales válidas |
| Gemini | Configuración, prueba, generación de recomendaciones | OK, requiere API Key y modelo válido |
| Electron | package.json, main, preload, carga de src/index.html | OK |
| Android | capacitor.config.json, scripts de sincronización Android | OK base |

## Flujo general revisado

```text
src/index.html
  -> src/app/fit-shell-main.js
    -> iframe
      -> src/pantallas/**/**-index.html
        -> CSS propio
        -> JS propio
        -> data/demo JSON cuando corresponde
```

## Flujo de datos local-first

```text
Pantallas
  -> localStorage por módulo
    -> Google Sheets Sync
    -> Firebase Sync
    -> Gemini Recommendations
```

## Variables locales revisadas

Las variables principales quedan conectadas a procesos de sincronización:

```text
fitness-jeff-ajpe-perfil
fitness-jeff-prpe-registros
fitness-jeff-prme-registros
fitness-jeff-prrd-registros
fitness-jeff-enho-sesion
fitness-jeff-enhi-datos
fitness-jeff-enru-plan
fitness-jeff-ayay-datos
fitness-jeff-ayag-datos
fitness-jeff-reag-recomendaciones
fitness-jeff-reen-recomendaciones
fitness-jeff-real-recomendaciones
fitness-jeff-reha-recomendaciones
fitness-jeff-voas-historial
fitness-jeff-vohi-historial
fitness-jeff-gemini-ultima-respuesta
```

## Subprocesos de Google Sheets

```text
Ajustes / Google Sheets
  -> guarda configuración local
  -> valida URL Apps Script
  -> prueba conexión
  -> crea tablas
  -> lee variables locales
  -> envía lotes a Apps Script
  -> Apps Script escribe por encabezados
```

## Subprocesos de Firebase

```text
Ajustes / Firebase
  -> guarda configuración local
  -> carga SDK Firebase desde CDN
  -> prueba Firestore
  -> lee variables locales
  -> agrupa por colección
  -> respalda documentos por lotes
```

## Subprocesos de Gemini

```text
Ajustes / Gemini
  -> guarda API Key, modelo, temperatura y maxTokens
  -> construye prompts seguros
  -> prueba conexión real
  -> reúne datos locales
  -> solicita recomendaciones
  -> guarda última respuesta en localStorage
```

## Límite de 600 líneas

Se agregó y mantiene el script:

```text
scripts/fit-auditoria-lineas.ps1
```

Uso recomendado:

```powershell
.\scripts\fit-auditoria-lineas.ps1
```

Este script es el control formal del proyecto para impedir archivos mayores a 600 líneas. Si aparece `SUPERAR_LIMITE`, el archivo debe dividirse por funciones.

## Riesgos pendientes que solo se confirman ejecutando

1. Google Sheets depende de que Apps Script esté desplegado como Web App con permisos correctos.
2. Firebase depende de internet, credenciales válidas y reglas Firestore que permitan escritura.
3. Gemini depende de API Key válida, modelo correcto y disponibilidad del endpoint.
4. Reconocimiento de voz depende del navegador o entorno donde se ejecute.
5. Android requiere abrir y compilar desde Android Studio después de `npm run cap:open:android`.

## Comandos finales de prueba

```powershell
npm install
npm start
.\scripts\fit-auditoria-lineas.ps1
```

Para Android:

```powershell
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
```

## Conclusión

La revisión final deja el proyecto organizado por procesos y subprocesos. No se detectan errores estructurales evidentes en la revisión estática. La siguiente validación obligatoria es ejecutar la app en el equipo y revisar consola/pantallas con datos reales.
