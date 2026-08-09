# Fitness Jeff

Fitness Jeff es una app rápida y multiplataforma con una sola base de código para web/PWA, Windows y Android.

## Arquitectura v1

- React 19 + TypeScript + Vite.
- IndexedDB para funcionamiento local y cola offline.
- Supabase Auth + PostgreSQL + RLS como nube y fuente de verdad.
- Cloudflare Pages + Pages Functions para web/PWA y la API de IA.
- Tauri 2 para Windows y Android.
- Gemini detrás de Cloudflare; la clave privada no forma parte del frontend, EXE ni APK.

La navegación principal es: **Inicio, Entrenar, Progreso, IA y Más**.

## Inicio rápido en VS Code

Requisitos: Node.js 22+, npm y Git. Para Tauri también se requiere Rust; para Android, Android Studio/SDK/NDK.

```bash
npm ci
npm run check
npm run bot:check
npm run dev
```

La app funciona en **modo invitado** sin configurar servicios externos. Los datos se guardan localmente en IndexedDB.

## Configuración manual de Supabase

1. Copia `.env.example` como `.env`.
2. Completa únicamente los valores públicos de Supabase.
3. Ejecuta `supabase/migrations/202608080001_initial.sql` en tu proyecto Supabase.
4. Activa Google como proveedor de autenticación.
5. Configura como redirect URLs la URL web final y `fitnessjeff://auth/callback`.

Nunca coloques `service_role`, claves administrativas ni `GEMINI_API_KEY` en `.env` del frontend.

## Cloudflare Pages — publicación manual

El repositorio queda preparado, pero no realiza un despliegue automático.

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 22+
- Pages Functions: `functions/`

Variables/secretos del entorno de Cloudflare:

- `GEMINI_API_KEY` — secreto.
- `GEMINI_MODEL` — opcional.
- `SUPABASE_URL`.
- `SUPABASE_PUBLISHABLE_KEY`.

Antes de publicar puedes validar localmente la Function con:

```bash
npm run cloudflare:check
```

## Windows

```bash
npm run tauri:build -- --bundles nsis
```

Genera el instalador NSIS de Windows. Los iconos Tauri se generan automáticamente desde `public/icon.svg`.

## Android

La primera vez:

```bash
npm run android:init
```

Para generar un APK:

```bash
npm run android:build -- --apk
```

## Bot temporal de verificación

El bot de `tests/e2e/temporary-user-bot.spec.ts` usa Playwright y actúa como un usuario. Recorre la app en escritorio y móvil, registra datos, verifica persistencia, aislamiento por usuario, entrenamiento, PWA/offline, navegación y ausencia de errores JavaScript.

```bash
npm run bot:check
```

El bot es exclusivamente de pruebas y no se incluye como una función visible de la aplicación.

## Validación

GitHub Actions valida automáticamente:

- TypeScript, pruebas unitarias y build de producción.
- auditoría de dependencias.
- Cloudflare Pages Functions.
- bot E2E en escritorio y móvil.
- proyecto Tauri.
- compilación de instalador Windows NSIS.
- compilación de Android APK.

Consulta `docs/V1-ARQUITECTURA.md` y `docs/V1-VERIFICACION.md` para más detalles.
