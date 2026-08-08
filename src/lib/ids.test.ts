import { describe, expect, it } from 'vitest';
import { localDateKey, newId } from './ids';

describe('ids', () => {
  it('creates unique ids', () => {
    expect(newId()).not.toBe(newId());
  });

  it('formats local date keys', () => {
    expect(localDateKey(new Date(2026, 7, 8))).toBe('2026-08-08');
  });
});
