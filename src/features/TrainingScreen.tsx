import { useState } from 'react';
import { nowIso } from '../lib/ids';
import { newBaseRow, saveRow } from '../services/repository';
import type { WorkoutSession } from '../types';

const DEFAULT = [
  { name: 'Sentadilla a silla', detail: '3 × 10, movimiento controlado', done: false },
  { name: 'Remo con mancuerna', detail: '3 × 10 por lado', done: false },
  { name: 'Press de hombro sentado', detail: '3 × 8, carga cómoda', done: false },
  { name: 'Bicicleta suave', detail: '10 minutos', done: false },
];

export function TrainingScreen({ userId }: { userId: string | null }) {
  const [exercises, setExercises] = useState(DEFAULT);
  const [saved, setSaved] = useState(false);

  const toggle = (index: number) => {
    if (saved) return;
    setExercises((items) => items.map((item, i) => i === index ? { ...item, done: !item.done } : item));
  };
  const complete = async () => {
    if (saved) return;
    const base = newBaseRow(userId);
    await saveRow<WorkoutSession>('workout_sessions', { ...base, title: 'Rutina completa', duration_minutes: 35, completed_at: nowIso(), exercises });
    setSaved(true);
  };

  return (
    <section className="screen-stack">
      <div className="title-block"><span className="eyebrow">ENTRENAR</span><h1>Rutina de hoy</h1><p>Una sesión corta y completa. Ajusta la carga para mantener una técnica cómoda.</p></div>
      <article className="card">
        <div className="section-heading"><div><h2>35 minutos</h2><p>4 bloques · descansos breves</p></div><span className="pill">Completa</span></div>
        <div className="exercise-list">
          {exercises.map((exercise, index) => (
            <button key={exercise.name} className={`exercise ${exercise.done ? 'done' : ''}`} onClick={() => toggle(index)} disabled={saved}>
              <span className="check">{exercise.done ? '✓' : index + 1}</span>
              <span><strong>{exercise.name}</strong><small>{exercise.detail}</small></span>
            </button>
          ))}
        </div>
        <button className="primary full" onClick={complete} disabled={saved}>{saved ? 'Guardado ✓' : 'Finalizar entrenamiento'}</button>
      </article>
    </section>
  );
}
