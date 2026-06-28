# FitJeff

App personal local-first para control corporal, actividad, entrenamiento, progreso visual, historial, backups, PWA y escritorio Electron.

## Estado actual real

FitJeff tiene una base modular funcional y visualmente clara. La app ya puede trabajar en modo local-first con Control corporal, Actividad, Entrenamiento y Sistema, pero algunas integraciones siguen en estado preparado y no deben considerarse conexiones reales todavía.

### Terminado y funcional local

- Tema claro global.
- Shell principal por secciones.
- Pantalla Hoy como entrada principal.
- Registro corporal con ayuda visual.
- Progreso con analisis corporal inteligente.
- Historial de control corporal.
- Actividad manual depurada con un solo registro principal por fecha.
- Rutinas, Diario, HIIT, Stats y Ajustes de entrenamiento.
- Actualizaciones preparadas para Electron instalado.
- PWA base real con manifest claro y service worker de cache basico.
- Storage seguro aplicado a repositories principales, Inicio, Ajustes, backup e hidratacion inicial.
- Memoria de ultima pantalla valida dentro del shell.
- Control corporal depurado con guardado inicial unico, medicion principal por semana y comparaciones confiables.
- Variables Vite de Firebase centralizadas con modo local activo por defecto.
- npm start seguro con puerto automatico si 5173 esta ocupado.
- BAT raiz para abrir FitJeff y BAT raiz para actualizar version automaticamente.

### Preparado, pero pendiente de conexion real

- Firebase esta preparado como respaldo, pero no se conecta si `VITE_FIREBASE_ENABLED` sigue en `false` o faltan variables.
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

`npm start` ahora busca un puerto libre desde 5173. Si 5173 esta ocupado, abre Vite en el siguiente puerto disponible y pasa esa URL real a Electron.

Tambien puedes abrir con doble clic en:

```text
ABRIR_FITJEFF.bat
```

## Variables de conexión

FitJeff trabaja en modo local por defecto. Para activar Firebase en una PC, copiar `.env.example` como `.env.local`, completar las variables y cambiar:

```bash
VITE_FIREBASE_ENABLED=true
```

Mientras `VITE_FIREBASE_ENABLED=false`, la app no intenta conectarse a Firebase, no lo marca como error y no acumula cola de sincronizacion innecesaria.

## Actualizar version con doble clic

Para aumentar version, compilar instalador Windows, preparar Android/APK y publicar release, usar:

```text
ACTUALIZAR_VERSION_FITJEFF.bat
```

Ese BAT llama a `scripts/publicar-version-automatica.bat` y ejecuta:

- revision de herramientas;
- sincronizacion con GitHub;
- `npm install`;
- `npm run check:local`;
- aumento automatico de version;
- build Windows con instalador y `latest.yml`;
- preparacion Android/APK;
- commit, push y GitHub Release.

## Bloques aplicados

### Bloques 1 a 12 - Fase visual

Resultado general:

- Tema claro global.
- Shell simple.
- Pantalla Hoy.
- Registro con ayuda visual.
- Menu de Control corporal limpio.
- Progreso como vista de detalle.
- Inicio, Historial, Ajustes, Actualizaciones y Actividad manual en modo claro.
- Cierre documentado en `docs/fase-visual-2026-cierre.md`.

### Bloque 13 - Revision para solucionar errores

Resultado: fechas locales corregidas para evitar desfases por UTC.

### Bloque 14 - Revision local completa

Resultado: comando `npm run check:local` para revisar herramientas, estructura modular y build de Vite.

### Bloque 15 - Gemini persistencia separada

Resultado: Gemini guarda API Key en almacenamiento separado y solo se borra desde accion explicita. Pendiente: mejorar texto de seguridad para no llamar blindado a un dato que sigue guardado localmente.

### Bloque 16 - Medidas con popup visual

Resultado: cada boton ? abre un popup visual con muñeco, zona de medicion resaltada y explicacion clara.

### Bloque 17 - Rutinas claro + pasos

Resultado: Rutinas queda en modo claro y se organiza por pasos: IA, Manual y Guardadas.

### Bloque 18 - Jarvis claro

Resultado: Jarvis de Diario y Jarvis HIT quedan en modo claro con panel compartido `jarvis-panel`.

### Bloque 19 - Control corporal inteligente

Archivos clave creados:

- `src/features/control-corporal/analisis-corporal/analisis-corporal.calculations.js`
- `src/features/control-corporal/analisis-corporal/analisis-corporal.presenter.js`
- `src/features/control-corporal/analisis-corporal/avatar-corporal.view.js`
- `src/features/control-corporal/analisis-corporal/avatar-corporal.css`

Resultado: Progreso cruza IMC, cintura/altura, cuello y contexto muscular antes de mostrar conclusiones.

### Bloque 20 - Dispositivos / Cubitt CT4 / Google Fit preparado

Archivos clave creados:

- `src/features/actividad/dispositivos/dispositivos.constants.js`
- `src/features/actividad/dispositivos/dispositivos.repository.js`
- `src/features/actividad/dispositivos/dispositivos.service.js`
- `src/features/actividad/dispositivos/dispositivos.controller.js`
- `src/features/actividad/dispositivos/dispositivos.view.js`
- `src/features/actividad/dispositivos/dispositivos.css`
- `src/features/actividad/dispositivos/adapters/cubitt.adapter.js`
- `src/features/actividad/dispositivos/adapters/google-fit.adapter.js`

Resultado: Actividad tiene pantalla Dispositivos para preparar Cubitt CT4, Google Fit y el puente de importacion.

### Bloque 21 - Analisis y correccion de errores

Corregido:

- `src/features/actividad/actividad.menu.js`
- `src/features/actividad/dispositivos/dispositivos.controller.js`
- `src/features/actividad/dispositivos/dispositivos.service.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Actividad muestra el menu alineado con conexiones, Dispositivos refresca el panel despues de guardar y el service ayuda a preservar configuracion guardada.

### Bloque 22 - Base PWA clara y estado real

Corregido:

- `index.html`
- `manifest.webmanifest`
- `service-worker.js`
- `src/app/app.bootstrap.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: la app declara modo claro tambien en metadatos, el manifest queda alineado al tema claro, el service worker deja de ser un archivo vacio y la PWA base real queda activada solo en produccion web para no mezclar cache viejo en desarrollo o Electron.

### Bloque 23 - Almacenamiento local seguro

Corregido:

- `src/core/storage/safe-local-storage.service.js`
- `src/core/bootstrap/app-data-hydration.service.js`
- `src/core/backup/backup-local.service.js`
- `src/core/backup/backup-restore.service.js`
- `src/features/control-corporal/registro.repository.js`
- `src/features/control-corporal/inicio/inicio.service.js`
- `src/features/actividad/actividad.repository.js`
- `src/features/actividad/dispositivos/dispositivos.repository.js`
- `src/features/entrenamiento/entrenamiento.repository.js`
- `src/features/entrenamiento/ajustes/gemini-settings.repository.js`
- `src/modules/ajustes/ajustes.service.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: los repositories principales, Inicio, Ajustes, backup e hidratacion inicial usan storage seguro. Si un JSON local se dana o localStorage falla, FitJeff debe volver a valores seguros sin romper la pantalla completa.

### Bloque 24 - Memoria de pantalla y shell

Corregido:

- `src/app/app-router.js`
- `src/shell/shell.memory.js`
- `src/shell/shell.view.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: al abrir FitJeff con perfil completado, la app restaura la ultima pantalla valida guardada. Si esa pantalla ya no existe, vuelve a Hoy. La memoria del shell usa storage seguro y el texto visible se corrigio a `Estás en`.

### Bloque 25 - Control corporal depurado

Corregido:

- `src/features/control-corporal/registro.service.js`
- `src/features/control-corporal/inicio/inicio.service.js`
- `src/features/control-corporal/estadisticas/estadisticas.calculations.js`
- `src/features/control-corporal/estadisticas/estadisticas.presenter.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Inicio guarda perfil, objetivo y peso inicial en una sola operacion local; las medidas quedan limitadas a una medicion principal por semana; Progreso ya no compara semana o mes si no existe un registro suficientemente antiguo; y el mensaje inteligente ya no muestra frases como cambios de 0 kg.

### Bloque 26 - Variables y conexión

Corregido:

- `.env.example`
- `src/core/config/firebase.config.js`
- `src/core/sync/sync.service.js`
- `src/core/sync/sync-status.service.js`
- `src/core/bootstrap/app-data-hydration.service.js`
- `src/features/control-corporal/registro.service.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Firebase ahora se configura por variables Vite; si no está habilitado, FitJeff queda en modo local activo sin marcar error de nube. La hidratacion inicial no intenta conexión remota en modo local y Control corporal no llena la cola de sincronizacion si Firebase no está listo.

### Bloque 27 - Actividad depurada

Corregido:

- `src/features/actividad/actividad.constants.js`
- `src/features/actividad/actividad.repository.js`
- `src/features/actividad/actividad.service.js`
- `src/features/actividad/registro/registro.controller.js`
- `src/features/actividad/registro/registro.view.js`
- `scripts/check-structure.cjs`
- `README.md`

Resultado: Actividad ahora mantiene un solo registro principal por fecha. Si el usuario selecciona una fecha con actividad previa, el formulario carga esos datos; si guarda de nuevo, actualiza el registro del día en lugar de duplicarlo. También se agregaron límites básicos y bloqueo de fechas futuras.

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

Resultado: `npm start` ya no depende obligatoriamente del puerto 5173. Si el puerto está ocupado, busca otro puerto libre y Electron abre la URL correcta. Además, existen BAT de doble clic para abrir FitJeff y para actualizar versión, compilar instalador Windows, preparar Android/APK y publicar GitHub Release.

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
- Las conexiones externas deben iniciar en modo local y activarse solo por variables configuradas.
- Actividad debe manejar un solo registro principal por fecha y actualizar el registro del día si ya existe.
- `npm start` debe abrir siempre con puerto automatico y no depender de 5173 libre.
- La version de Windows y Android debe salir desde el mismo `package.json`.

## Siguiente fase recomendada

Correcciones pendientes por prioridad:

1. Aclarar o implementar conexiones reales de Dispositivos.
2. Mejorar Rutinas y seleccion del dia de entrenamiento.
3. Revisar seguridad y texto de Gemini API Key.
4. Crear proyecto Android/Capacitor cuando se vaya a generar APK real.
