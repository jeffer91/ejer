# Fitness Jeff v1

## Arquitectura

Una sola base de código:

- React + TypeScript + Vite para interfaz.
- IndexedDB para datos locales y cola offline.
- Supabase Auth + PostgreSQL + RLS como nube y fuente de verdad.
- Cloudflare Pages para web/PWA y `/api/ai`.
- Tauri 2 para Windows y Android.
- Gemini solo detrás de Cloudflare; la clave nunca entra al cliente.

## Navegación

La interfaz se reduce a cinco áreas: Inicio, Entrenar, Progreso, IA y Más.

## Funcionamiento sin nube

La app funciona en modo invitado y guarda en IndexedDB. Al configurar Supabase e iniciar con Google, los registros locales se reclaman con el UID y se sincronizan.

## Variables necesarias

Frontend (`.env`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL` (para Tauri; en web puede quedar vacío)
- `VITE_WEB_AUTH_REDIRECT`
- `VITE_NATIVE_AUTH_REDIRECT`

Cloudflare secrets/variables:

- `GEMINI_API_KEY` (secret)
- `GEMINI_MODEL` (opcional)
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

## Supabase

Aplicar `supabase/migrations/202608080001_initial.sql`. Luego activar Google como proveedor y agregar como redirect URLs tanto la URL de Cloudflare como `fitnessjeff://auth/callback`.

## Comandos

```bash
npm ci
npm run check
npm run dev
npm run tauri:dev
npm run android:init
npm run android:build
```

## Cloudflare Pages

- Build command: `npm run build`
- Output: `dist`
- Node: 22+
- Functions: carpeta `functions/`

## Seguridad

- No usar `service_role` en frontend.
- RLS está activado en todas las tablas de usuario.
- Gemini exige JWT válido de Supabase en Cloudflare.
- La app conserva funcionamiento local si IA o nube no están disponibles.
