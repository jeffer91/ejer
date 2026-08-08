export function isTauri(): boolean {
  return typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__);
}

export function apiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
}

export function authRedirectUrl(): string {
  if (isTauri()) return import.meta.env.VITE_NATIVE_AUTH_REDIRECT || 'fitnessjeff://auth/callback';
  return import.meta.env.VITE_WEB_AUTH_REDIRECT || window.location.origin;
}
