import { useState, useEffect, useRef } from 'react';

/** Returns elapsed seconds since `startedAt` (ms timestamp), updating every second. */
export function useTimer(startedAt: number | null): number {
  const [elapsed, setElapsed] = useState(startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (startedAt === null) {
      setElapsed(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAt]);

  return elapsed;
}

/** Format seconds to HH:MM:SS */
export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

