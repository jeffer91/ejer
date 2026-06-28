# FitJeff

App personal local-first para control corporal, actividad, entrenamiento, progreso visual, historial, backups, PWA y escritorio Electron.

## Estado actual real

FitJeff tiene una base modular funcional y visualmente clara. La app trabaja en modo local-first con Control corporal, Actividad, Entrenamiento y Sistema. Las conexiones externas se activan solo cuando su configuración está lista.

### Terminado y funcional local

- Tema claro global.
- Shell principal por secciones.
- Pantalla Hoy como entrada principal.
- Registro corporal con ayuda visual.
- Progreso con analisis corporal inteligente.
- Historial de control corporal.
- Actividad manual depurada con un solo registro principal por fecha.
- Rutinas, Diario, HIIT, Stats y Ajustes de entrenamiento.
- PWA base real con manifest claro y service worker de cache basico.
- Storage seguro aplicado a repositories principales, Inicio, Ajustes, backup e hidratacion inicial.
- Memoria de ultima pantalla valida dentro del shell.
- Control corporal depurado con guardado inicial unico, medicion principal por semana y comparaciones confiables.
- npm start seguro con puerto automatico si 5173 esta ocupado.
- BAT raiz para abrir FitJeff y BAT raiz para actualizar version automaticamente.
- Firebase resuelto desde código mediante `src/core/config/firebase.project.config.js`, sin BAT de configuración.
- Auditoría integral agregada para validar scripts, archivos críticos, imports locales, Firebase y build antes de seguir programando.
- Local-first real: la app abre con datos locales primero y Firebase se restaura en segundo plano.
- Metadata de sincronización por módulo para saber qué cambió sin consultar Firebase.
- Cola diferencial con deduplicación por entidad para no repetir operaciones pendientes.
- Sincronización diaria automática y sincronización manual desde Ajustes.
- Firebase con resumen liviano en el documento principal y registros pesados en subcolección.
- Conflictos local/remoto guardados localmente para evitar sobrescrituras peligrosas.
- Dispositivos con puente claro de importación CSV/JSON para actividad.

### Preparado, pero pendiente de conexión real

- Cubitt CT4 está preparado como pantalla/configuración, pero todavía no lee datos reales del reloj por API.
- Google Fit está preparado como pantalla/configuración, pero todavía no tiene autorización OAuth ni lectura real.
- Mientras no exista API real, Dispositivos permite importar datos exportados o copiados mediante CSV/JSON.
- Android/APK está preparado a nivel de scripts: si existe proyecto Android nativo/Capacitor, compila APK; si no existe, genera manifiesto `latest-android.json` sin bloquear Windows.
- GitHub Releases está preparado para actualizaciones del instalador con `.exe` y `latest.yml`.

## Estado de bloques

Fase visual 2026 cerrada: 12 de 12 bloques.

Bloques funcionales y correctivos aplicados:

- Bloque 13: revisión para solucionar errores.
- Bloque 14: revisión local completa.
- Bloque 15: Gemini persistencia separada.
- Bloque 16: Medidas con popup visual.
- Bloque 17: Rutinas claro + pasos.
- Bloque 18: Jarvis claro.
- Bloque 19: Control corporal inteligente.
- Bloque 20: Dispositivos / Cubitt CT4 / Google Fit preparado.
- Bloque 21: Análisis y corrección de errores.
- Bloque 22: Base PWA clara y estado real.
- Bloque 23: Almacenamiento local seguro.
- Bloque 24: Memoria de pantalla y shell.
- Bloque 25: Control corporal depurado.
- Bloque 26: Variables y conexión.
- Bloque 27: Actividad depurada.
- Bloque 28: Inicio seguro y actualización automática.
- Bloque 29: Restauración Firebase antes de Inicio.
- Bloque 30: Firebase resuelto desde código.
- Bloque 31: Auditoría integral.
- Bloque 32: Local-first real.
- Bloque 33: Metadata de sincronización.
- Bloque 34: Cola diferencial con deduplicación por entidad.
- Bloque 35: Sincronización diaria automática.
- Bloque 36: Firebase resumen liviano + registros por subcolección.
- Bloque 37: Conflictos local/remoto.
- Bloque 38: Dispositivos reales o puente claro de importación.

## Pantalla principal

- Hoy

## Módulos visibles

- Control corporal
- Actividad
- Entrenamiento
- Sistema

## Menú de Actividad

- Resumen
- Registrar
- Dispositivos

## Abrir FitJeff

Comando recomendado:

```bash
npm start
```

`npm start` busca un puerto libre desde 5173. Si 5173 está ocupado, abre Vite en el siguiente puerto disponible y pasa esa URL real a Electron.

También puedes abrir con doble clic en:

```text
ABRIR_FITJEFF.bat
```

## Firebase desde código

La configuración de Firebase se resuelve en este archivo:

```text
src/core/config/firebase.project.config.js
```

Ese archivo exporta `FIREBASE_PROJECT_CONFIG`. Cuando `apiKey`, `projectId` y `appId` tienen valores reales, FitJeff puede consultar Firebase en segundo plano.

## Firebase resumen liviano

Firestore queda organizado así:

```text
fitjeff / jeff
fitjeff / jeff / registros
fitjeff / jeff / sync / status
```

El documento principal `fitjeff/jeff` debe ser liviano. Guarda solo `perfil`, `objetivo`, `resumenLocal`, `controlCorporal.resumen` y `sync`.

Los registros pesados se guardan en:

```text
fitjeff / jeff / registros
```

El estado técnico de sincronización se guarda en:

```text
fitjeff / jeff / sync / status
```

## Local-first real

FitJeff debe abrir rápido aunque Firebase esté lento o sin conexión.

Flujo actual:

1. Lee datos locales.
2. Monta la interfaz inmediatamente.
3. Si local está vacío, consulta Firebase en segundo plano.
4. Si Firebase tiene perfil, objetivo o registros, guarda local y entra a Hoy.
5. La sincronización de inicio solo procesa cola pendiente; ya no sube todo el estado local automáticamente.

## Metadata de sincronización

La metadata local se guarda en:

```text
fitjeff:sync:metadata
```

y se administra desde:

```text
src/core/sync/sync-metadata.service.js
```

Permite saber, sin consultar Firebase, si hay cambios pendientes en Control corporal, Actividad, Entrenamiento y Sistema.

## Cola diferencial

La cola local se guarda en:

```text
fitjeff:sync:queue
```

y se administra desde:

```text
src/core/sync/sync-queue.service.js
```

Cada operación tiene `operationKey`, `modulo`, `entidad`, `entidadId`, `accion`, `payloadHash` e `intentos`.

## Sincronización diaria automática

La programación local de sincronización se administra desde:

```text
src/core/sync/sync-scheduler.service.js
```

El estado del scheduler se guarda en:

```text
fitjeff:sync:scheduler
```

Reglas actuales:

1. Al abrir la app, la interfaz se monta primero.
2. La sincronización automática corre en segundo plano.
3. Si ya se revisó hoy y no hay cambios, no llama innecesariamente a Firebase.
4. Si hay cola pendiente, procesa solo la cola diferencial.
5. Si hay módulos marcados como pendientes y no hay cola, encola un respaldo diferencial de recuperación.
6. Desde Ajustes existe el botón `Sincronizar ahora` para sincronización manual.

## Conflictos local/remoto

Los conflictos se guardan localmente en:

```text
fitjeff:sync:conflicts
```

y se administran desde:

```text
src/core/sync/sync-conflict.service.js
```

Regla de seguridad:

```text
Si hay cambios locales pendientes y Firebase tiene datos remotos más recientes, FitJeff detiene la sincronización y registra un conflicto.
```

## Dispositivos y puente de importación

El módulo Dispositivos mantiene preparada la configuración de Cubitt CT4 y Google Fit, pero sin prometer lectura automática real todavía.

Mientras no exista API real, el flujo correcto es:

1. Exportar o copiar datos desde la fuente externa.
2. Ir a `Actividad > Dispositivos`.
3. Pegar datos en el bloque `Importar actividad`.
4. Usar formato CSV o JSON con columnas/campos:

```text
fecha,pasos,bicicletaMin,bicicletaKm,fuente,nota
2026-06-28,8200,0,0,cubitt,Importado desde reloj
2026-06-29,6000,25,8.5,google-fit,Actividad mixta
```

El puente se administra desde:

```text
src/features/actividad/dispositivos/dispositivos-import-bridge.service.js
```

La importación conserva metadata en Actividad: `fuente`, `origen`, `importado` e `importadoEn`. También marca el módulo Actividad como pendiente de sincronización.

## Auditoría integral

Comando directo:

```bash
npm run audit:app
```

`npm run check:local` ejecuta herramientas, estructura, auditoría y build de Vite.

## Actualizar versión con doble clic

Para aumentar versión, compilar instalador Windows, preparar Android/APK y publicar release, usar:

```text
ACTUALIZAR_VERSION_FITJEFF.bat
```

## Bloques aplicados

### Bloque 28 - Inicio seguro y actualización automática

Resultado: `npm start` no depende obligatoriamente del puerto 5173.

### Bloque 29 - Restauración Firebase antes de Inicio

Resultado: FitJeff puede leer Firebase si está configurado y restaurar perfil, objetivo o registros remotos.

### Bloque 30 - Firebase resuelto desde código

Resultado: Firebase ya no depende de un BAT de configuración.

### Bloque 31 - Auditoría integral

Resultado: la app tiene una auditoría estática propia.

### Bloque 32 - Local-first real

Resultado: la app ya no espera Firebase para montar la interfaz.

### Bloque 33 - Metadata de sincronización

Resultado: FitJeff guarda metadata local de sincronización por módulo.

### Bloque 34 - Cola diferencial

Resultado: la cola de sincronización deduplica por `modulo + entidad + entidadId + accion`.

### Bloque 35 - Sincronización diaria automática

Resultado: FitJeff tiene un scheduler de sincronización y botón `Sincronizar ahora`.

### Bloque 36 - Firebase resumen liviano

Resultado: Firebase usa documento principal liviano, registros en subcolección y sync/status separado.

### Bloque 37 - Conflictos local/remoto

Resultado: si hay cambios locales pendientes y Firebase tiene datos remotos más recientes, FitJeff registra un conflicto y detiene la sincronización.

### Bloque 38 - Dispositivos y puente claro de importación

Corregido:

- `src/features/actividad/dispositivos/dispositivos-import-bridge.service.js`
- `src/features/actividad/dispositivos/dispositivos.service.js`
- `src/features/actividad/dispositivos/dispositivos.view.js`
- `src/features/actividad/dispositivos/dispositivos.controller.js`
- `src/features/actividad/dispositivos/dispositivos.css`
- `src/features/actividad/dispositivos/dispositivos.constants.js`
- `src/features/actividad/actividad.repository.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Dispositivos ya tiene un puente de importación funcional. Permite pegar CSV/JSON de Cubitt, Google Fit u otra fuente, convierte filas válidas en registros de Actividad, evita duplicados por fecha con la regla existente y conserva metadata de importación.

## Comandos

```bash
npm install
npm run check:local
npm start
```

## Reglas de crecimiento

- Mantener cada módulo separado.
- No mezclar Control corporal con Actividad.
- Pantalla Hoy debe seguir siendo la entrada principal.
- Actividad manual debe conservarse aunque existan conexiones automáticas.
- Firebase nunca debe bloquear el arranque visual de la app.
- La cola de sincronización debe guardar una sola operación pendiente por entidad modificada.
- El documento principal de Firebase debe mantenerse liviano; los registros deben ir en subcolección.
- Nunca se debe sobrescribir local o remoto si hay conflicto pendiente.
- Dispositivos no debe decir que existe lectura real automática si solo existe importación por puente.

## Bloques pendientes

1. Bloque 39: Rutinas y selección correcta del día de entrenamiento.
2. Bloque 40: Revisión final para instalador Windows y APK Android.
