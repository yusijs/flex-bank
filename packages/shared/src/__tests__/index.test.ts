import { describe, it, expect } from 'vitest';
import {
  formatMinutes,
  sessionDurationMinutes,
  CreateWithdrawalSchema,
  CreateSessionSchema,
  WorkSessionSchema,
  type WorkSession,
} from '../index.js';

describe('formatMinutes', () => {
  it('formats zero minutes', () => {
    expect(formatMinutes(0)).toBe('0m');
  });

  it('formats only minutes (< 60)', () => {
    expect(formatMinutes(45)).toBe('45m');
  });

  it('formats only hours (exact hours)', () => {
    expect(formatMinutes(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatMinutes(90)).toBe('1h 30m');
  });

  it('formats negative minutes', () => {
    expect(formatMinutes(-90)).toBe('-1h 30m');
  });

  it('formats negative minutes only', () => {
    expect(formatMinutes(-30)).toBe('-30m');
  });
});

describe('sessionDurationMinutes', () => {
  const base: WorkSession = {
    id: '00000000-0000-0000-0000-000000000001',
    started_at: 1_000_000,
    ended_at: null,
    note: null,
    created_at: 1_000_000,
  };

  it('returns 0 for open session', () => {
    expect(sessionDurationMinutes(base)).toBe(0);
  });

  it('returns correct duration in minutes', () => {
    const session = { ...base, ended_at: base.started_at + 90 * 60_000 };
    expect(sessionDurationMinutes(session)).toBe(90);
  });

  it('rounds to nearest minute', () => {
    const session = { ...base, ended_at: base.started_at + 90 * 60_000 + 29_999 };
    expect(sessionDurationMinutes(session)).toBe(90);
  });
});

describe('CreateWithdrawalSchema', () => {
  it('accepts valid input', () => {
    const result = CreateWithdrawalSchema.safeParse({ minutes: 60, reason: 'day off' });
    expect(result.success).toBe(true);
  });

  it('rejects zero minutes', () => {
    const result = CreateWithdrawalSchema.safeParse({ minutes: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative minutes', () => {
    const result = CreateWithdrawalSchema.safeParse({ minutes: -10 });
    expect(result.success).toBe(false);
  });

  it('accepts without reason', () => {
    const result = CreateWithdrawalSchema.safeParse({ minutes: 30 });
    expect(result.success).toBe(true);
  });
});

describe('CreateSessionSchema', () => {
  it('accepts empty object', () => {
    expect(CreateSessionSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a note', () => {
    expect(CreateSessionSchema.safeParse({ note: 'Late night work' }).success).toBe(true);
  });

  it('rejects a note that is too long', () => {
    expect(CreateSessionSchema.safeParse({ note: 'a'.repeat(501) }).success).toBe(false);
  });
});

describe('WorkSessionSchema', () => {
  it('accepts a valid complete session', () => {
    const result = WorkSessionSchema.safeParse({
      id: '00000000-0000-0000-0000-000000000001',
      started_at: 1_000_000,
      ended_at: 1_005_400_000,
      note: null,
      created_at: 1_000_000,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a session with null ended_at', () => {
    const result = WorkSessionSchema.safeParse({
      id: '00000000-0000-0000-0000-000000000001',
      started_at: 1_000_000,
      ended_at: null,
      note: null,
      created_at: 1_000_000,
    });
    expect(result.success).toBe(true);
  });
});

