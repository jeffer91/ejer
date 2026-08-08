import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { HomeScreen } from '../features/HomeScreen';
import { TrainingScreen } from '../features/TrainingScreen';
import { ProgressScreen } from '../features/ProgressScreen';
import { AiScreen } from '../features/AiScreen';
import { MoreScreen } from '../features/MoreScreen';
import { cloudConfigured, getSession, supabase } from '../services/supabase';
import { claimGuestRecords, syncAll } from '../services/sync';
import { setupNativeAuthListener } from '../services/auth';
import type { Screen } from '../types';

const NAV: { id: Screen; label: string; symbol: string }[] = [
  { id: 'home', label: 'Inicio', symbol: '⌂' },
  { id: 'training', label: 'Entrenar', symbol: '▶' },
  { id: 'progress', label: 'Progreso', symbol: '↗' },
  { id: 'ai', label: 'IA', symbol: '✦' },
  { id: 'more', label: 'Más', symbol: '•••' },
];

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [session, setSession] = useState<Session | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'ok' | 'error'>('idle');

  const performSync = useCallback(async (activeSession: Session | null) => {
    if (!activeSession || !navigator.onLine) return;
    try {
      setSyncState('syncing');
      await claimGuestRecords(activeSession.user.id);
      await syncAll(activeSession.user.id);
      setSyncState('ok');
    } catch (error) {
      console.warn('Sincronización pendiente:', error);
      setSyncState('error');
    }
  }, []);

  useEffect(() => {
    void getSession().then((value) => {
      setSession(value);
      void performSync(value);
    });
    const listener = supabase?.auth.onAuthStateChange((_event, value) => {
      setSession(value);
      void performSync(value);
    });
    let removeNative = () => undefined;
    void setupNativeAuthListener((value) => {
      setSession(value);
      void performSync(value);
    }).then((cleanup) => { removeNative = cleanup; });
    return () => {
      listener?.data.subscription.unsubscribe();
      removeNative();
    };
  }, [performSync]);

  useEffect(() => {
    const onOnline = () => { setOnline(true); void performSync(session); };
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, [performSync, session]);

  const content = useMemo(() => {
    const common = { userId: session?.user.id ?? null };
    if (screen === 'training') return <TrainingScreen {...common} />;
    if (screen === 'progress') return <ProgressScreen {...common} />;
    if (screen === 'ai') return <AiScreen {...common} session={session} />;
    if (screen === 'more') return <MoreScreen session={session} cloudConfigured={cloudConfigured} online={online} syncState={syncState} onSync={() => performSync(session)} />;
    return <HomeScreen {...common} onNavigate={setScreen} />;
  }, [online, performSync, screen, session, syncState]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <strong>Fitness Jeff</strong>
          <span>{online ? 'En línea' : 'Sin conexión'}</span>
        </div>
        <button className="avatar-button" onClick={() => setScreen('more')} aria-label="Abrir perfil">
          {session?.user.user_metadata?.avatar_url ? <img src={session.user.user_metadata.avatar_url as string} alt="" /> : 'FJ'}
        </button>
      </header>

      <main className="content">{content}</main>

      <nav className="bottom-nav" aria-label="Navegación principal">
        {NAV.map((item) => (
          <button key={item.id} className={screen === item.id ? 'active' : ''} onClick={() => setScreen(item.id)} aria-current={screen === item.id ? 'page' : undefined}>
            <span aria-hidden="true">{item.symbol}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
