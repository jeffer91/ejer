import { getAllLocalRecords, getLocalById, getQueue, putLocal, queueOperation, removeQueueItem } from './db';
import { newId, nowIso } from '../lib/ids';
import { supabase } from './supabase';
import type { BaseRow, TableName } from '../types';

const TABLES: TableName[] = [
  'profiles', 'body_records', 'measurements', 'workout_plans', 'workout_sessions',
  'hydration_logs', 'schedule_logs', 'recommendations', 'user_settings',
];

export async function claimGuestRecords(userId: string): Promise<number> {
  const records = await getAllLocalRecords();
  let changed = 0;
  for (const local of records) {
    const data = local.data as unknown as BaseRow;
    if (!data.user_id) {
      const updated = { ...data, user_id: userId, updated_at: nowIso() };
      await putLocal(local.table, updated);
      await queueOperation({ id: newId(), table: local.table, recordId: updated.id, action: 'upsert', createdAt: nowIso(), attempts: 0 });
      changed += 1;
    }
  }
  return changed;
}

export async function syncAll(userId: string): Promise<{ pushed: number; pulled: number }> {
  if (!supabase) return { pushed: 0, pulled: 0 };
  let pushed = 0;
  let pulled = 0;
  const failures: string[] = [];

  // Solo procesa operaciones del usuario activo. Antes de escribir, compara
  // updated_at: el cambio con fecha más reciente prevalece.
  const queue = await getQueue();
  for (const operation of queue) {
    const local = await getLocalById<BaseRow>(operation.table, operation.recordId);
    if (!local) {
      await removeQueueItem(operation.id);
      continue;
    }
    if (local.user_id !== userId) continue;

    const { data: remote, error: readError } = await supabase
      .from(operation.table)
      .select('*')
      .eq('id', local.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (readError) {
      failures.push(`${operation.table}:read`);
      continue;
    }

    const remoteRow = remote as BaseRow | null;
    if (remoteRow && remoteRow.updated_at.localeCompare(local.updated_at) > 0) {
      await putLocal(operation.table, remoteRow);
      await removeQueueItem(operation.id);
      pulled += 1;
      continue;
    }

    const { error: writeError } = await supabase.from(operation.table).upsert(local, { onConflict: 'id' });
    if (writeError) {
      failures.push(`${operation.table}:write`);
      continue;
    }

    await removeQueueItem(operation.id);
    pushed += 1;
  }

  // Mezcla la nube con la copia local sin pisar cambios locales más nuevos.
  // También conserva tombstones para que un registro borrado no reaparezca localmente.
  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*').eq('user_id', userId);
    if (error) {
      failures.push(`${table}:pull`);
      continue;
    }
    if (!data) continue;

    for (const raw of data) {
      const remote = raw as BaseRow;
      const local = await getLocalById<BaseRow>(table, remote.id);
      if (local && local.user_id !== userId) continue;
      if (local && local.updated_at.localeCompare(remote.updated_at) > 0) continue;
      await putLocal(table, remote);
      pulled += 1;
    }
  }

  window.dispatchEvent(new CustomEvent('fitness-data-changed', { detail: { table: 'all' } }));

  let activePending = 0;
  for (const operation of await getQueue()) {
    const record = await getLocalById<BaseRow>(operation.table, operation.recordId);
    if (record?.user_id === userId) activePending += 1;
  }

  if (failures.length || activePending > 0) {
    throw new Error(`Sincronización incompleta: ${activePending} pendiente(s).`);
  }

  return { pushed, pulled };
}
