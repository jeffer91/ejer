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

  const queue = await getQueue();
  for (const operation of queue) {
    const record = await getLocalById<BaseRow>(operation.table, operation.recordId);
    if (!record) {
      await removeQueueItem(operation.id);
      continue;
    }
    const payload = { ...record, user_id: userId };
    const { error } = await supabase.from(operation.table).upsert(payload, { onConflict: 'id' });
    if (!error) {
      await putLocal(operation.table, payload);
      await removeQueueItem(operation.id);
      pushed += 1;
    }
  }

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*').eq('user_id', userId).is('deleted_at', null);
    if (error || !data) continue;
    for (const row of data) {
      await putLocal(table, row as BaseRow);
      pulled += 1;
    }
  }

  window.dispatchEvent(new CustomEvent('fitness-data-changed', { detail: { table: 'all' } }));
  return { pushed, pulled };
}
