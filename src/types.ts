export type Screen = 'home' | 'training' | 'progress' | 'ai' | 'more';

export type TableName =
  | 'profiles'
  | 'body_records'
  | 'measurements'
  | 'workout_plans'
  | 'workout_sessions'
  | 'hydration_logs'
  | 'schedule_logs'
  | 'recommendations'
  | 'user_settings';

export interface BaseRow {
  id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface BodyRecord extends BaseRow {
  weight_kg: number;
}

export interface Measurement extends BaseRow {
  waist_cm?: number | null;
  chest_cm?: number | null;
  arm_cm?: number | null;
  hip_cm?: number | null;
}

export interface HydrationLog extends BaseRow {
  amount_ml: number;
  logged_at: string;
}

export interface WorkoutSession extends BaseRow {
  title: string;
  duration_minutes: number;
  completed_at: string;
  exercises: { name: string; detail: string; done: boolean }[];
}

export interface Recommendation extends BaseRow {
  category: string;
  content: string;
}

export interface LocalRecord<T = Record<string, unknown>> {
  key: string;
  table: TableName;
  data: T;
  updatedAt: string;
}

export interface SyncOperation {
  id: string;
  table: TableName;
  recordId: string;
  action: 'upsert' | 'delete';
  createdAt: string;
  attempts: number;
}
