import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requestRecommendation } from '../services/ai';
import { listRows, newBaseRow, saveRow } from '../services/repository';
import type { BodyRecord, HydrationLog, Recommendation, WorkoutSession } from '../types';

export function AiScreen({ userId, session }: { userId: string | null; session: Session | null }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadLast = useCallback(async () => {
    const items = await listRows<Recommendation>('recommendations');
    const last = [...items].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
    if (last) setText(last.content);
  }, []);
  useEffect(() => { void loadLast(); }, [loadLast]);

  const generate = async () => {
    setError(''); setLoading(true);
    try {
      const [weights, water, workouts] = await Promise.all([
        listRows<BodyRecord>('body_records'), listRows<HydrationLog>('hydration_logs'), listRows<WorkoutSession>('workout_sessions'),
      ]);
      const recommendation = await requestRecommendation({
        latestWeight: [...weights].sort((a,b)=>b.updated_at.localeCompare(a.updated_at))[0]?.weight_kg ?? null,
        recentHydrationLogs: water.slice(-10),
        recentWorkouts: workouts.slice(-5).map((item)=>({ title:item.title, completed_at:item.completed_at, duration_minutes:item.duration_minutes })),
      });
      await saveRow<Recommendation>('recommendations', { ...newBaseRow(userId), category: 'general', content: recommendation });
      setText(recommendation);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo generar la recomendación.'); }
    finally { setLoading(false); }
  };

  return (
    <section className="screen-stack">
      <div className="title-block"><span className="eyebrow">IA</span><h1>Una recomendación útil</h1><p>La IA resume tus datos recientes y propone una acción pequeña y práctica.</p></div>
      <article className="card ai-card">
        {text ? <p className="ai-output">{text}</p> : <div className="empty-state"><strong>Sin recomendación todavía</strong><span>{session ? 'Genera una cuando quieras.' : 'Inicia sesión con Google para habilitar IA.'}</span></div>}
        {error && <p className="error-message">{error}</p>}
        <button className="primary full" onClick={generate} disabled={loading || !session}>{loading ? 'Analizando…' : 'Generar recomendación'}</button>
      </article>
    </section>
  );
}
