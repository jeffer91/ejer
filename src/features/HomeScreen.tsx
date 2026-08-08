import { useCallback, useEffect, useMemo, useState } from 'react';
import { localDateKey, nowIso } from '../lib/ids';
import { listRows, newBaseRow, saveRow } from '../services/repository';
import type { BodyRecord, HydrationLog, Screen, WorkoutSession } from '../types';

interface Props { userId: string | null; onNavigate: (screen: Screen) => void; }

export function HomeScreen({ userId, onNavigate }: Props) {
  const [weights, setWeights] = useState<BodyRecord[]>([]);
  const [water, setWater] = useState<HydrationLog[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const reload = useCallback(async () => {
    setWeights(await listRows<BodyRecord>('body_records'));
    setWater(await listRows<HydrationLog>('hydration_logs'));
    setSessions(await listRows<WorkoutSession>('workout_sessions'));
  }, []);

  useEffect(() => {
    void reload();
    window.addEventListener('fitness-data-changed', reload);
    return () => window.removeEventListener('fitness-data-changed', reload);
  }, [reload]);

  const today = localDateKey();
  const waterToday = useMemo(() => water.filter((item) => item.logged_at.startsWith(today)).reduce((sum, item) => sum + item.amount_ml, 0), [today, water]);
  const latestWeight = useMemo(() => [...weights].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0], [weights]);
  const workoutToday = useMemo(() => sessions.find((item) => item.completed_at.startsWith(today)), [sessions, today]);

  const addWater = async () => {
    const base = newBaseRow(userId);
    await saveRow<HydrationLog>('hydration_logs', { ...base, amount_ml: 250, logged_at: nowIso() });
    await reload();
  };

  return (
    <section className="screen-stack">
      <div className="hero-card">
        <p className="eyebrow">HOY</p>
        <h1>{workoutToday ? 'Entrenamiento completado' : 'Tu día, sin complicaciones'}</h1>
        <p>{workoutToday ? `${workoutToday.title} · ${workoutToday.duration_minutes} min` : 'Registra lo importante y sigue con tu día.'}</p>
        <button className="primary" onClick={() => onNavigate('training')}>{workoutToday ? 'Ver entrenamiento' : 'Empezar entrenamiento'}</button>
      </div>

      <div className="metric-grid">
        <article className="metric-card"><span>Peso</span><strong>{latestWeight ? `${latestWeight.weight_kg.toFixed(1)} kg` : '—'}</strong><button className="text-button" onClick={() => onNavigate('progress')}>Registrar</button></article>
        <article className="metric-card"><span>Agua</span><strong>{Math.round(waterToday / 250)} vasos</strong><button className="text-button" onClick={addWater}>+ 250 ml</button></article>
      </div>

      <article className="card">
        <div className="section-heading"><div><span className="eyebrow">ACCESOS RÁPIDOS</span><h2>Lo que más usas</h2></div></div>
        <div className="quick-grid">
          <button onClick={() => onNavigate('progress')}>+ Peso</button>
          <button onClick={addWater}>+ Agua</button>
          <button onClick={() => onNavigate('training')}>Entrenar</button>
          <button onClick={() => onNavigate('ai')}>Recomendación</button>
        </div>
      </article>
    </section>
  );
}
