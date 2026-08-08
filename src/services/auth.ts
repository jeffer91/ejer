import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { authRedirectUrl, isTauri } from './platform';

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) throw new Error('La nube aún no está configurada.');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authRedirectUrl(),
      skipBrowserRedirect: isTauri(),
    },
  });
  if (error) throw error;
  if (isTauri() && data.url) {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(data.url);
  }
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}

export async function consumeNativeDeepLink(url: string): Promise<Session | null> {
  if (!supabase || !url.startsWith('fitnessjeff://auth/callback')) return null;
  const parsed = new URL(url);
  const code = parsed.searchParams.get('code');
  if (!code) return null;
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
  return data.session;
}

export async function setupNativeAuthListener(onSession: (session: Session | null) => void): Promise<() => void> {
  if (!isTauri() || !supabase) return () => undefined;
  const { getCurrent, onOpenUrl } = await import('@tauri-apps/plugin-deep-link');
  const handle = async (urls: string[] | null) => {
    if (!urls?.length) return;
    for (const url of urls) {
      const session = await consumeNativeDeepLink(url);
      if (session) onSession(session);
    }
  };
  await handle(await getCurrent());
  const unlisten = await onOpenUrl((urls) => void handle(urls));
  return unlisten;
}
