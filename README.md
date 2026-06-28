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
- Rutinas con selección correcta del día que debe cargarse hoy en Diario.
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
- Revisión final de instalador Windows, Android/APK y GitHub Release.

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
- Bloque 39: Rutinas y selección correcta del día de entrenamiento.
- Bloque 40: Revisión final para instalador Windows y APK Android.

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

## Local-first real

FitJeff debe abrir rápido aunque Firebase esté lento o sin conexión.

Flujo actual:

1. Lee datos locales.
2. Monta la interfaz inmediatamente.
3. Si local está vacío, consulta Firebase en segundo plano.
4. Si Firebase tiene perfil, objetivo o registros, guarda local y entra a Hoy.
5. La sincronización de inicio solo procesa cola pendiente; ya no sube todo el estado local automáticamente.

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

## Rutinas y selección correcta del día

La selección del día de entrenamiento se administra desde:

```text
src/features/entrenamiento/rutinas/rutinas-day-selector.service.js
```

Reglas actuales:

1. Diario ya no depende de `new Date().getDay() % totalDias`, que podía cargar un día incorrecto.
2. Si no se eligió un día manual, la selección automática inicia la semana en lunes.
3. En `Entrenamiento > Rutinas` puedes elegir qué día debe cargarse hoy.
4. En `Entrenamiento > Diario` también puedes cambiar el día directamente antes de iniciar o completar la sesión.
5. La selección queda guardada dentro de la rutina activa como `selectorDia`.

## Revisión final de instalador y APK

La revisión final está en:

```text
scripts/revision-release-final.cjs
```

Comandos:

```bash
npm run release:check
npm run release:check:built
```

Reglas actuales:

1. `release:check` valida configuración antes de compilar.
2. `release:check:built` valida los artefactos después de compilar Windows y preparar Android.
3. `build-windows.cjs` elimina instaladores Windows viejos antes de compilar.
4. `build-android.cjs` elimina APK/manifiesto Android viejo antes de preparar la nueva versión.
5. `release-github.cjs` publica solo archivos de la versión actual.
6. Android no bloquea Windows: si no existe proyecto Android nativo, se genera `latest-android.json` con estado `preparado-sin-apk`.

## Auditoría integral

Comando directo:

```bash
npm run audit:app
```

`npm run check:local` ejecuta herramientas, estructura, auditoría, revisión release preflight y build de Vite.

## Actualizar versión con doble clic

Para aumentar versión, compilar instalador Windows, preparar Android/APK, revisar artefactos y publicar release, usar:

```text
ACTUALIZAR_VERSION_FITJEFF.bat
```

## Bloques aplicados

### Bloque 38 - Dispositivos y puente claro de importación

Resultado: Dispositivos tiene un puente de importación funcional para CSV/JSON.

### Bloque 39 - Rutinas y selección correcta del día

Resultado: Diario carga el día correcto de la rutina activa. Puedes elegir manualmente el día desde Rutinas o Diario. Si no hay selección manual, la app usa una selección automática con la semana iniciando en lunes.

### Bloque 40 - Revisión final para instalador Windows y APK Android

Corregido:

- `scripts/revision-release-final.cjs`
- `package.json`
- `scripts/check-tools.cjs`
- `scripts/check-local.cjs`
- `scripts/build-windows.cjs`
- `scripts/build-android.cjs`
- `scripts/release-github.cjs`
- `scripts/publicar-version.bat`
- `scripts/publicar-version-automatica.bat`
- `.gitignore`
- `release/latest.json`
- `release/latest-android.json`
- `release/README.md`
- `README.md`

Resultado: el flujo de publicación queda blindado contra artefactos viejos. Antes de publicar, FitJeff valida que el instalador `.exe`, `latest.yml`, `latest-android.json` y APK si existe correspondan a la versión actual.

## Comandos

```bash
npm install
npm run check:local
npm start
```

Para preparar publicación:

```bash
npm run build:windows
npm run build:android
npm run release:check:built
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
- Diario debe permitir corregir el día de rutina antes de iniciar o completar la sesión.
- Release no debe publicar instaladores o APK de versiones anteriores.

## Bloques pendientes

No quedan bloques pendientes de esta auditoría principal. El siguiente trabajo debe ser prueba real en tu PC: `git pull origin main`, `npm run check:local`, `npm start` y luego, solo si quieres publicar, `ACTUALIZAR_VERSION_FITJEFF.bat`.
