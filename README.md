# Fitness Jeff

Fitness Jeff es una app personal, rápida y multiplataforma para registrar progreso, entrenamiento, hidratación y recibir recomendaciones breves.

## v1

La nueva arquitectura usa una sola base de código para:

- Web y PWA en Cloudflare Pages.
- Windows con Tauri 2.
- Android APK/AAB con Tauri 2.

### Stack

React 19 + TypeScript + Vite + IndexedDB + Supabase + Cloudflare + Tauri.

### Uso local

```bash
npm ci
npm run dev
```

La app funciona en **modo invitado** aunque Supabase no esté configurado. Para habilitar cuenta Google, nube e IA, copia `.env.example` a `.env` y completa las variables públicas de Supabase. La API de IA se configura como Function de Cloudflare con secretos del servidor.

### Verificación

```bash
npm run check
```

Ejecuta typecheck, pruebas y build de producción.

### Más información

Consulta `docs/V1-ARQUITECTURA.md`.

> La versión HTML/Electron anterior se mantiene temporalmente en el historial y en los archivos legacy del repositorio mientras se valida la migración v1.
