import type { LocalRecord, SyncOperation, TableName } from '../types';

const DB_NAME = 'fitness-jeff-v1';
const DB_VERSION = 1;
const RECORDS = 'records';
const QUEUE = 'syncQueue';

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECORDS)) {
        const store = db.createObjectStore(RECORDS, { keyPath: 'key' });
        store.createIndex('table', 'table', { unique: false });
      }
      if (!db.objectStoreNames.contains(QUEUE)) {
        db.createObjectStore(QUEUE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return databasePromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function putLocal<T>(table: TableName, data: T & { id: string; updated_at: string }): Promise<void> {
  const db = await openDatabase();
  const record: LocalRecord<T> = { key: `${table}:${data.id}`, table, data, updatedAt: data.updated_at };
  const tx = db.transaction(RECORDS, 'readwrite');
  tx.objectStore(RECORDS).put(record);
  await transactionDone(tx);
}

export async function getLocal<T>(table: TableName): Promise<T[]> {
  const db = await openDatabase();
  const tx = db.transaction(RECORDS, 'readonly');
  const store = tx.objectStore(RECORDS).index('table');
  const results = await requestToPromise(store.getAll(IDBKeyRange.only(table)));
  return (results as LocalRecord<T>[]).map((item) => item.data);
}

export async function getLocalById<T>(table: TableName, id: string): Promise<T | null> {
  const db = await openDatabase();
  const tx = db.transaction(RECORDS, 'readonly');
  const item = await requestToPromise(tx.objectStore(RECORDS).get(`${table}:${id}`));
  return item ? (item as LocalRecord<T>).data : null;
}

export async function getAllLocalRecords(): Promise<LocalRecord[]> {
  const db = await openDatabase();
  const tx = db.transaction(RECORDS, 'readonly');
  return (await requestToPromise(tx.objectStore(RECORDS).getAll())) as LocalRecord[];
}

export async function queueOperation(operation: SyncOperation): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(QUEUE, 'readwrite');
  tx.objectStore(QUEUE).put(operation);
  await transactionDone(tx);
}

export async function getQueue(): Promise<SyncOperation[]> {
  const db = await openDatabase();
  const tx = db.transaction(QUEUE, 'readonly');
  return (await requestToPromise(tx.objectStore(QUEUE).getAll())) as SyncOperation[];
}

export async function removeQueueItem(id: string): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(QUEUE, 'readwrite');
  tx.objectStore(QUEUE).delete(id);
  await transactionDone(tx);
}

export async function clearLocalDatabase(): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction([RECORDS, QUEUE], 'readwrite');
  tx.objectStore(RECORDS).clear();
  tx.objectStore(QUEUE).clear();
  await transactionDone(tx);
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
