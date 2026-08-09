# Fitness Jeff v1 — Arquitectura

## Objetivo

Mantener una sola aplicación y una sola base de código para web/PWA, Windows y Android, con funcionamiento local rápido y sincronización opcional con la nube.

## Capas

### Frontend

- React + TypeScript + Vite.
- Interfaz responsive.
- Cinco áreas principales: Inicio, Entrenar, Progreso, IA y Más.

### Datos locales

- IndexedDB.
- La interfaz lee primero la copia local.
- Los cambios se guardan localmente aunque no haya conexión.
- La cola de sincronización vive en el dispositivo.
- Los registros locales se filtran por `user_id` para evitar mezclar sesiones.

### Nube

- Supabase Auth para identidad y sesión.
- Supabase PostgreSQL como fuente de verdad cuando el usuario inicia sesión.
- RLS en las tablas de usuario con `auth.uid() = user_id`.
- Política de conflicto simple basada en `updated_at`: prevalece el cambio más reciente.
- Si una sincronización queda incompleta, la app conserva la operación pendiente en vez de informar falsamente que todo está actualizado.

### IA

- El frontend no contiene `GEMINI_API_KEY`.
- `/api/ai` vive en Cloudflare Pages Functions.
- La Function exige un JWT válido de Supabase antes de llamar a Gemini.
- La app sigue funcionando si IA o nube no están disponibles.

### Distribución

- Web/PWA: Cloudflare Pages.
- Windows: Tauri 2 + instalador NSIS.
- Android: Tauri 2 + APK.
- El mismo `dist/` de Vite alimenta web y Tauri.

## Tablas Supabase

La migración `supabase/migrations/202608080001_initial.sql` crea:

- `profiles`
- `body_records`
- `measurements`
- `workout_plans`
- `workout_sessions`
- `hydration_logs`
- `schedule_logs`
- `recommendations`
- `user_settings`

Todas las tablas expuestas al usuario tienen RLS habilitado.

## Variables de frontend

Crear `.env` desde `.env.example`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL`
- `VITE_WEB_AUTH_REDIRECT`
- `VITE_NATIVE_AUTH_REDIRECT`

No usar claves administrativas en el frontend.

## Variables/secretos de Cloudflare

- `GEMINI_API_KEY` — secreto.
- `GEMINI_MODEL` — opcional.
- `SUPABASE_URL`.
- `SUPABASE_PUBLISHABLE_KEY`.

## Flujo invitado

```text
Usuario sin cuenta
      ↓
IndexedDB
      ↓
Uso normal y offline
```

Al iniciar sesión con Google, los registros locales sin propietario se asignan al UID de esa cuenta y entran en la cola de sincronización.

## Flujo registrado

```text
APP
 ↕
IndexedDB + cola local
 ↕
Supabase con RLS
```

## OAuth en Tauri

El callback nativo es:

```text
fitnessjeff://auth/callback
```

Debe agregarse manualmente a las URLs permitidas de Supabase junto con la URL HTTPS definitiva de la versión web.

## PWA

`public/manifest.webmanifest` y `public/sw.js` habilitan instalación web y caché básica. Los datos de la aplicación permanecen en IndexedDB.

## Comandos principales

```bash
npm ci
npm run check
npm run bot:check
npm run dev
npm run cloudflare:check
npm run tauri:dev
npm run tauri:build -- --bundles nsis
npm run android:init
npm run android:build -- --apk
```

## Publicación

La configuración del repositorio está preparada para publicación manual. No se incluyen credenciales reales ni un despliegue automático de Cloudflare.
