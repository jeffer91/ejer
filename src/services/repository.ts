import { getLocal, putLocal, queueOperation } from './db';
import { newId, nowIso } from '../lib/ids';
import type { BaseRow, TableName } from '../types';

export async function saveRow<T extends BaseRow>(table: TableName, row: T): Promise<void> {
  await putLocal(table, row);
  await queueOperation({ id: newId(), table, recordId: row.id, action: 'upsert', createdAt: nowIso(), attempts: 0 });
  window.dispatchEvent(new CustomEvent('fitness-data-changed', { detail: { table } }));
}

export async function listRows<T extends BaseRow>(table: TableName, userId: string | null): Promise<T[]> {
  const rows = await getLocal<T>(table);
  return rows.filter((row) => row.user_id === userId && !row.deleted_at);
}

export function newBaseRow(userId: string | null): BaseRow {
  const now = nowIso();
  return { id: newId(), user_id: userId, created_at: now, updated_at: now, deleted_at: null };
}
