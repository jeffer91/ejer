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

### Preparado, pero pendiente de conexion real

- Cubitt CT4 esta preparado como pantalla/configuracion, pero no lee datos reales del reloj todavia.
- Google Fit esta preparado como pantalla/configuracion, pero no tiene autorizacion ni lectura real todavia.
- Android/APK esta preparado a nivel de scripts: si existe proyecto Android nativo/Capacitor, compila APK; si no existe, genera manifiesto `latest-android.json` sin bloquear Windows.
- GitHub Releases esta preparado para actualizaciones del instalador con `.exe` y `latest.yml`.

## Estado de bloques

Fase visual 2026 cerrada: 12 de 12 bloques.

Bloques funcionales y correctivos aplicados:

- Bloque 13: revision para solucionar errores.
- Bloque 14: revision local completa.
- Bloque 15: Gemini persistencia separada.
- Bloque 16: Medidas con popup visual.
- Bloque 17: Rutinas claro + pasos.
- Bloque 18: Jarvis claro.
- Bloque 19: Control corporal inteligente.
- Bloque 20: Dispositivos / Cubitt CT4 / Google Fit preparado.
- Bloque 21: Analisis y correccion de errores.
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

## Pantalla principal

- Hoy

## Modulos visibles

- Control corporal
- Actividad
- Entrenamiento
- Sistema

## Menu de Control corporal

- Hoy
- Registrar
- Progreso
- Historial

La guia visual de medidas existe como ruta interna y ayuda complementaria. No se muestra en el menu principal para mantener Registro simple.

## Menu de Actividad

- Resumen
- Registrar
- Dispositivos

## Abrir FitJeff

Comando recomendado:

```bash
npm start
```

`npm start` busca un puerto libre desde 5173. Si 5173 esta ocupado, abre Vite en el siguiente puerto disponible y pasa esa URL real a Electron.

Tambien puedes abrir con doble clic en:

```text
ABRIR_FITJEFF.bat
```

## Firebase desde código

La configuración de Firebase se resuelve en este archivo:

```text
src/core/config/firebase.project.config.js
```

Ese archivo exporta `FIREBASE_PROJECT_CONFIG`. Cuando `apiKey`, `projectId` y `appId` tienen valores reales, FitJeff puede consultar Firebase en segundo plano.

La prioridad de lectura es:

1. Variables Vite, si existen.
2. `FIREBASE_PROJECT_CONFIG` escrito en código.
3. Modo local si no hay credenciales completas.

Ya no existe BAT de configuración de Firebase. Si Firebase tiene datos remotos y la configuración está completa, `app-data-hydration.service.js` restaura el respaldo en segundo plano, marca Inicio como completado y abre Hoy sin bloquear el arranque.

## Firebase resumen liviano

Firestore queda organizado así:

```text
fitjeff / jeff
fitjeff / jeff / registros
fitjeff / jeff / sync / status
```

El documento principal `fitjeff/jeff` debe ser liviano. Guarda solo:

- `perfil`;
- `objetivo`;
- `resumenLocal`;
- `controlCorporal.resumen`;
- `sync`.

Los registros pesados se guardan en:

```text
fitjeff / jeff / registros
```

El estado técnico de sincronización se guarda en:

```text
fitjeff / jeff / sync / status
```

`firebase-database.service.js` ahora tiene `guardarResumenUsuario`, `leerResumenUsuario`, `leerCambiosDesde` y `guardarSyncStatus`. La restauración completa solo lee la subcolección de registros cuando el resumen indica que existen registros o cuando detecta una estructura antigua.

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

Cada módulo guarda `dirty`, `versionLocal`, `versionRemota`, `ultimoCambioLocalEn`, `ultimoSyncEn`, `ultimoIntentoSyncEn` y `ultimoError`. Esto prepara la sincronización diaria y la cola diferencial.

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

Si se edita el mismo registro varias veces antes de sincronizar, FitJeff conserva una sola operación pendiente con la versión más reciente. Esto evita que Firebase reciba cambios repetidos e innecesarios.

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

## Auditoría integral

Comando directo:

```bash
npm run audit:app
```

La auditoría revisa:

- scripts obligatorios de `package.json`;
- archivos críticos de app, Electron, Firebase, Windows y Android;
- imports locales rotos;
- configuradores Firebase no solicitados;
- contenedor `#app` en `index.html`;
- aviso si Firebase desde código sigue sin credenciales reales.

`npm run check:local` ahora ejecuta herramientas, estructura, auditoría y build de Vite.

## Actualizar version con doble clic

Para aumentar version, compilar instalador Windows, preparar Android/APK y publicar release, usar:

```text
ACTUALIZAR_VERSION_FITJEFF.bat
```

Ese BAT llama a `scripts/publicar-version-automatica.bat` y ejecuta revision de herramientas, sincronizacion con GitHub, `npm install`, `npm run check:local`, aumento automatico de version, build Windows, preparacion Android/APK, commit, push y GitHub Release.

## Bloques aplicados

### Bloque 28 - Inicio seguro y actualización automática

Resultado: `npm start` no depende obligatoriamente del puerto 5173. Si el puerto está ocupado, busca otro puerto libre y Electron abre la URL correcta.

### Bloque 29 - Restauración Firebase antes de Inicio

Resultado: FitJeff puede leer Firebase si está configurado. Si encuentra perfil, objetivo o registros remotos, guarda el estado local y marca Inicio como completado.

### Bloque 30 - Firebase resuelto desde código

Resultado: Firebase ya no depende de un BAT de configuración. La app puede usar configuración escrita en código desde `firebase.project.config.js`. También se retiraron los BAT no solicitados de configuración Firebase.

### Bloque 31 - Auditoría integral

Resultado: la app tiene una auditoría estática propia. La revisión local valida herramientas, estructura, rutas/imports locales, archivos críticos, scripts obligatorios y build antes de continuar.

### Bloque 32 - Local-first real

Resultado: la app ya no espera Firebase para montar la interfaz. Primero abre con datos locales. Si local está vacío, Firebase se revisa en segundo plano y, si hay respaldo, la app entra a Hoy. Además, el inicio ya no encola ni sube todo el estado local automáticamente; solo procesa cambios pendientes.

### Bloque 33 - Metadata de sincronización

Resultado: FitJeff guarda metadata local de sincronización por módulo. Control corporal se marca como pendiente cuando hay cambios locales. Sync registra intentos, errores y módulos sincronizados. La restauración desde Firebase registra el último pull remoto.

### Bloque 34 - Cola diferencial

Resultado: la cola de sincronización deduplica por `modulo + entidad + entidadId + accion`. Si el mismo registro se guarda o edita varias veces antes de sincronizar, solo queda una operación pendiente con el último payload. También migra y compacta operaciones antiguas de la cola.

### Bloque 35 - Sincronización diaria automática

Resultado: FitJeff tiene un scheduler de sincronización. Al abrir, revisa en segundo plano si hay cambios pendientes y evita llamadas repetidas si ya se revisó el día. Además, Ajustes muestra un bloque de sincronización con estado local y botón `Sincronizar ahora`.

### Bloque 36 - Firebase resumen liviano

Corregido:

- `src/core/firebase/firebase-database.service.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Firebase ya no depende de guardar todo en el documento principal. El documento `fitjeff/jeff` guarda resumen liviano, perfil y objetivo; los registros van en `fitjeff/jeff/registros`; y el estado técnico va en `fitjeff/jeff/sync/status`. También se mantiene compatibilidad con estructuras antiguas.

## Comandos

Instalar dependencias:

```bash
npm install
```

Revisar estructura:

```bash
npm run check:structure
```

Auditar app:

```bash
npm run audit:app
```

Revisar estructura, herramientas, auditoría y build local:

```bash
npm run check:local
```

Abrir en Electron desarrollo:

```bash
npm start
```

Abrir en navegador:

```bash
npm run dev
```

Probar modo escritorio con dist:

```bash
npm run electron:build
```

Crear instalador Windows:

```bash
npm run desktop:win
```

Preparar Android/APK:

```bash
npm run build:android
```

Publicar version automatica:

```bash
npm run publicar:automatico
```

## Reglas de crecimiento

- Mantener cada modulo separado.
- No mezclar Control corporal con Actividad.
- Pantalla Hoy debe seguir siendo la entrada principal.
- Registro debe mantener ayuda ? integrada.
- Progreso debe ser detalle, no dashboard saturado.
- Actividad manual debe conservarse aunque existan conexiones automaticas.
- La API Key de Gemini debe conservarse en almacenamiento separado y poder borrarse de forma explicita.
- Rutinas debe mantenerse en modo claro y por pasos.
- Jarvis debe mantenerse en modo claro compartido para Diario y HIT.
- Control corporal debe cruzar IMC con medidas y contexto muscular antes de sacar conclusiones.
- PWA debe registrarse solo en produccion web para evitar cache viejo durante desarrollo.
- Los datos locales deben pasar por storage seguro cuando sean leidos o escritos desde servicios/repositories.
- La ultima pantalla solo debe restaurarse si es una ruta valida del shell.
- Las medidas corporales deben manejarse como medicion principal semanal, no como registros repetidos sin control.
- Las conexiones externas deben iniciar en modo local y activarse solo por configuración valida.
- Actividad debe manejar un solo registro principal por fecha y actualizar el registro del día si ya existe.
- `npm start` debe abrir siempre con puerto automatico y no depender de 5173 libre.
- La version de Windows y Android debe salir desde el mismo `package.json`.
- Ningún bloque nuevo debe saltarse `npm run audit:app` y `npm run check:local`.
- Firebase nunca debe bloquear el arranque visual de la app.
- Cada módulo debe marcar su metadata cuando tenga cambios locales.
- La cola de sincronización debe guardar una sola operación pendiente por entidad modificada.
- La sincronización automática no debe llamar Firebase si ya se revisó hoy y no hay cambios pendientes.
- El documento principal de Firebase debe mantenerse liviano; los registros deben ir en subcolección.

## Bloques pendientes

1. Bloque 37: Conflictos local/remoto y resolución segura.
2. Bloque 38: Dispositivos reales o puente claro de importación.
3. Bloque 39: Rutinas y selección correcta del día de entrenamiento.
4. Bloque 40: Revisión final para instalador Windows y APK Android.
