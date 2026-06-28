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
- Restauracion Firebase antes de Inicio cuando Firebase tiene configuracion valida.
- Firebase resuelto desde código mediante `src/core/config/firebase.project.config.js`, sin BAT de configuración.

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

Ese archivo exporta `FIREBASE_PROJECT_CONFIG`. Cuando `apiKey`, `projectId` y `appId` tienen valores reales, FitJeff puede consultar Firebase antes de mostrar la pantalla de primer uso.

La prioridad de lectura es:

1. Variables Vite, si existen.
2. `FIREBASE_PROJECT_CONFIG` escrito en código.
3. Modo local si no hay credenciales completas.

Ya no existe BAT de configuración de Firebase. Si Firebase tiene datos remotos y la configuración está completa, `app-data-hydration.service.js` restaura el respaldo, marca Inicio como completado y abre la app sin mostrar `Configura FitJeff`.

## Actualizar version con doble clic

Para aumentar version, compilar instalador Windows, preparar Android/APK y publicar release, usar:

```text
ACTUALIZAR_VERSION_FITJEFF.bat
```

Ese BAT llama a `scripts/publicar-version-automatica.bat` y ejecuta revision de herramientas, sincronizacion con GitHub, `npm install`, `npm run check:local`, aumento automatico de version, build Windows, preparacion Android/APK, commit, push y GitHub Release.

## Bloques aplicados

### Bloque 28 - Inicio seguro y actualización automática

Corregido:

- `package.json`
- `scripts/start-electron-dev.cjs`
- `electron/electron-path.service.js`
- `electron/electron-window.service.js`
- `scripts/abrir-electron-dev.bat`
- `scripts/actualizar-todo.bat`
- `scripts/publicar-version-automatica.bat`
- `ABRIR_FITJEFF.bat`
- `ACTUALIZAR_VERSION_FITJEFF.bat`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: `npm start` no depende obligatoriamente del puerto 5173. Si el puerto está ocupado, busca otro puerto libre y Electron abre la URL correcta.

### Bloque 29 - Restauración Firebase antes de Inicio

Corregido:

- `src/core/config/firebase.config.js`
- `src/core/firebase/firebase-database.service.js`
- `src/core/bootstrap/app-data-hydration.service.js`

Resultado: antes de mostrar Inicio, FitJeff consulta Firebase si está configurado. Si encuentra perfil, objetivo o registros remotos, guarda el estado local, marca Inicio como completado y abre la app.

### Bloque 30 - Firebase resuelto desde código

Corregido:

- `src/core/config/firebase.project.config.js`
- `src/core/config/firebase.config.js`
- `package.json`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Firebase ya no depende de un BAT de configuración. La app puede usar configuración escrita en código desde `firebase.project.config.js`. También se retiraron los BAT no solicitados de configuración Firebase.

## Comandos

Instalar dependencias:

```bash
npm install
```

Revisar estructura:

```bash
npm run check:structure
```

Revisar estructura, herramientas y build local:

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
