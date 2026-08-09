import { describe, expect, it } from 'vitest';
import { localDateKey, newId } from './ids';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('ids', () => {
  it('creates unique valid UUID v4 ids', () => {
    const first = newId();
    const second = newId();
    expect(first).not.toBe(second);
    expect(first).toMatch(UUID_V4);
    expect(second).toMatch(UUID_V4);
  });

  it('formats local date keys', () => {
    expect(localDateKey(new Date(2026, 7, 8))).toBe('2026-08-08');
  });
});
