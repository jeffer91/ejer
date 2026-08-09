import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { listRows, newBaseRow, saveRow } from '../services/repository';
import type { BodyRecord, Measurement } from '../types';

export function ProgressScreen({ userId }: { userId: string | null }) {
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [weights, setWeights] = useState<BodyRecord[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const reload = useCallback(async () => {
    setWeights(await listRows<BodyRecord>('body_records', userId));
    setMeasurements(await listRows<Measurement>('measurements', userId));
  }, [userId]);
  useEffect(() => { void reload(); }, [reload]);

  const latest = useMemo(() => [...weights].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0], [weights]);
  const previous = useMemo(() => [...weights].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[1], [weights]);

  const saveWeight = async (event: FormEvent) => {
    event.preventDefault();
    const value = Number(weight.replace(',', '.'));
    if (!Number.isFinite(value) || value < 25 || value > 300) return;
    await saveRow<BodyRecord>('body_records', { ...newBaseRow(userId), weight_kg: value });
    setWeight('');
    await reload();
  };
  const saveMeasurement = async (event: FormEvent) => {
    event.preventDefault();
    const value = Number(waist.replace(',', '.'));
    if (!Number.isFinite(value) || value < 30 || value > 250) return;
    await saveRow<Measurement>('measurements', { ...newBaseRow(userId), waist_cm: value });
    setWaist('');
    await reload();
  };

  return (
    <section className="screen-stack">
      <div className="title-block"><span className="eyebrow">PROGRESO</span><h1>Registra y observa</h1><p>Sin comparaciones: solo tu propia evolución en el tiempo.</p></div>
      <div className="metric-grid">
        <article className="metric-card"><span>Último peso</span><strong>{latest ? `${latest.weight_kg.toFixed(1)} kg` : '—'}</strong><small>{latest && previous ? `${(latest.weight_kg - previous.weight_kg).toFixed(1)} kg vs. anterior` : 'Primer registro pendiente'}</small></article>
        <article className="metric-card"><span>Registros</span><strong>{weights.length}</strong><small>{measurements.length} mediciones corporales</small></article>
      </div>
      <article className="card two-forms">
        <form onSubmit={saveWeight}><label>Peso actual (kg)<input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Ej. 70.5" /></label><button className="primary full">Guardar peso</button></form>
        <form onSubmit={saveMeasurement}><label>Cintura (cm)<input inputMode="decimal" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="Ej. 80" /></label><button className="secondary full">Guardar medida</button></form>
      </article>
      <article className="card"><h2>Historial reciente</h2><div className="history-list">{[...weights].sort((a,b)=>b.updated_at.localeCompare(a.updated_at)).slice(0,6).map((item)=><div key={item.id}><span>{new Date(item.created_at).toLocaleDateString()}</span><strong>{item.weight_kg.toFixed(1)} kg</strong></div>)}{weights.length===0 && <p className="muted">Todavía no hay registros.</p>}</div></article>
    </section>
  );
}
