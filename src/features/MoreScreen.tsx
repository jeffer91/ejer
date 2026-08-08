import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { signInWithGoogle, signOut } from '../services/auth';
import { clearLocalDatabase } from '../services/db';
import { isTauri } from '../services/platform';

interface Props {
  session: Session | null;
  cloudConfigured: boolean;
  online: boolean;
  syncState: 'idle' | 'syncing' | 'ok' | 'error';
  onSync: () => Promise<void> | void;
}

export function MoreScreen({ session, cloudConfigured, online, syncState, onSync }: Props) {
  const [message, setMessage] = useState('');
  const login = async () => { try { setMessage(''); await signInWithGoogle(); } catch (e) { setMessage(e instanceof Error ? e.message : 'No se pudo iniciar sesión.'); } };
  const wipe = async () => { if (!confirm('¿Borrar los datos locales de este dispositivo?')) return; await clearLocalDatabase(); setMessage('Datos locales eliminados.'); window.location.reload(); };

  return (
    <section className="screen-stack">
      <div className="title-block"><span className="eyebrow">MÁS</span><h1>Cuenta y estado</h1><p>La parte técnica queda aquí, fuera del uso diario.</p></div>
      <article className="card profile-card">
        <div className="profile-row"><div className="profile-avatar">{session?.user.user_metadata?.avatar_url ? <img src={session.user.user_metadata.avatar_url as string} alt="" /> : 'FJ'}</div><div><strong>{session?.user.user_metadata?.full_name || 'Modo invitado'}</strong><span>{session?.user.email || 'Tus datos se guardan en este dispositivo'}</span></div></div>
        {session ? <button className="secondary full" onClick={() => void signOut()}>Cerrar sesión</button> : <button className="primary full" onClick={login} disabled={!cloudConfigured}>Continuar con Google</button>}
        {!cloudConfigured && <p className="note">Supabase todavía no está vinculado. La app funciona localmente mientras tanto.</p>}
      </article>
      <article className="card status-list">
        <h2>Estado</h2>
        <div><span>Nube</span><strong>{cloudConfigured ? 'Lista' : 'Sin configurar'}</strong></div>
        <div><span>Internet</span><strong>{online ? 'Conectado' : 'Offline'}</strong></div>
        <div><span>Sincronización</span><strong>{syncState === 'syncing' ? 'Sincronizando…' : syncState === 'error' ? 'Pendiente' : syncState === 'ok' ? 'Actualizada' : 'Local'}</strong></div>
        <div><span>Plataforma</span><strong>{isTauri() ? 'App instalada' : 'Web / PWA'}</strong></div>
        <button className="secondary full" onClick={() => void onSync()} disabled={!session || !online}>Sincronizar ahora</button>
      </article>
      <article className="card danger-zone"><h2>Datos del dispositivo</h2><p>Borra solamente la copia local. Si estás conectado, tus datos de Supabase no se eliminan.</p><button className="danger" onClick={wipe}>Borrar datos locales</button></article>
      {message && <p className="note">{message}</p>}
    </section>
  );
}
