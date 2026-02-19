import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer, formatElapsed } from '../hooks/useTimer';

describe('formatElapsed', () => {
  it('formats zero seconds', () => {
    expect(formatElapsed(0)).toBe('00:00:00');
  });

  it('formats seconds only', () => {
    expect(formatElapsed(45)).toBe('00:00:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatElapsed(90)).toBe('00:01:30');
  });

  it('formats hours, minutes and seconds', () => {
    expect(formatElapsed(3661)).toBe('01:01:01');
  });

  it('formats exactly one hour', () => {
    expect(formatElapsed(3600)).toBe('01:00:00');
  });
});

describe('useTimer', () => {
  it('returns 0 when startedAt is null', () => {
    const { result } = renderHook(() => useTimer(null));
    expect(result.current).toBe(0);
  });

  it('returns elapsed seconds when startedAt is set', () => {
    const startedAt = Date.now() - 5000; // 5 seconds ago
    const { result } = renderHook(() => useTimer(startedAt));
    expect(result.current).toBeGreaterThanOrEqual(4);
    expect(result.current).toBeLessThanOrEqual(7);
  });

  it('resets to 0 when startedAt becomes null', () => {
    let startedAt: number | null = Date.now() - 3000;
    const { result, rerender } = renderHook(() => useTimer(startedAt));
    expect(result.current).toBeGreaterThan(0);

    act(() => {
      startedAt = null;
    });
    rerender();
    expect(result.current).toBe(0);
  });
});

