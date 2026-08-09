# Fitness Jeff v1 — Verificación final

## Comando local principal

```bash
npm ci
npm run check
```

## Qué valida `npm run check`

- TypeScript sin errores.
- pruebas unitarias.
- build de producción de Vite.

## Verificación automática en GitHub Actions

La CI contiene cuatro trabajos:

### Web

- `npm ci`
- typecheck + pruebas unitarias + build
- `npm audit --audit-level=high`
- compilación de Cloudflare Pages Functions

### Tauri

- generación automática de iconos;
- dependencias Linux necesarias;
- `cargo check` con `Cargo.lock`.

### Windows

- compilación real del instalador NSIS con Tauri.

### Android

- Java 17;
- Android NDK;
- targets Rust Android;
- inicialización del proyecto Android;
- compilación real de APK.

## Qué requiere comprobación manual con credenciales

Estas funciones están preparadas en código, pero necesitan tus servicios reales antes de poder probarse de extremo a extremo:

- Login con Google en tu proyecto Supabase.
- sincronización con tu base Supabase real.
- reglas/RLS ejecutadas sobre tu proyecto real mediante la migración incluida.
- llamada real a Gemini desde Cloudflare usando `GEMINI_API_KEY`.
- redirects OAuth de la URL definitiva de Cloudflare y `fitnessjeff://auth/callback`.

No guardes claves privadas dentro del repositorio.

## Antes de publicar manualmente

1. Ejecuta `npm ci`.
2. Ejecuta `npm run check`.
3. Crea `.env` desde `.env.example`.
4. Configura Supabase y aplica la migración.
5. Configura las variables y secretos de Cloudflare.
6. Prueba Google Auth y `/api/ai` con tus credenciales.
7. Publica manualmente cuando todo esté correcto.
