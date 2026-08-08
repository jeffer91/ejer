import { getLocal, putLocal, queueOperation } from './db';
import { newId, nowIso } from '../lib/ids';
import type { BaseRow, TableName } from '../types';

export async function saveRow<T extends BaseRow>(table: TableName, row: T): Promise<void> {
  await putLocal(table, row);
  await queueOperation({ id: newId(), table, recordId: row.id, action: 'upsert', createdAt: nowIso(), attempts: 0 });
  window.dispatchEvent(new CustomEvent('fitness-data-changed', { detail: { table } }));
}

export async function listRows<T>(table: TableName): Promise<T[]> {
  return getLocal<T>(table);
}

export function newBaseRow(userId: string | null): BaseRow {
  const now = nowIso();
  return { id: newId(), user_id: userId, created_at: now, updated_at: now, deleted_at: null };
}
