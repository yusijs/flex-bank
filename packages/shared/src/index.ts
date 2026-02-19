import { z } from 'zod';

// ── Work Sessions ────────────────────────────────────────────────────────────

export const WorkSessionSchema = z.object({
  id: z.string().uuid(),
  started_at: z.number().int().positive(),
  ended_at: z.number().int().positive().nullable(),
  note: z.string().nullable(),
  created_at: z.number().int().positive(),
});

export type WorkSession = z.infer<typeof WorkSessionSchema>;

export const CreateSessionSchema = z.object({
  note: z.string().max(500).optional(),
});

export type CreateSession = z.infer<typeof CreateSessionSchema>;

export const StopSessionSchema = z.object({
  note: z.string().max(500).optional(),
});

export type StopSession = z.infer<typeof StopSessionSchema>;

// ── Withdrawals ──────────────────────────────────────────────────────────────

export const WithdrawalSchema = z.object({
  id: z.string().uuid(),
  minutes: z.number().int().positive(),
  reason: z.string().nullable(),
  withdrawn_at: z.number().int().positive(),
});

export type Withdrawal = z.infer<typeof WithdrawalSchema>;

export const CreateWithdrawalSchema = z.object({
  minutes: z.number().int().positive({ message: 'Minutes must be a positive integer' }),
  reason: z.string().max(500).optional(),
});

export type CreateWithdrawal = z.infer<typeof CreateWithdrawalSchema>;

// ── Summary ──────────────────────────────────────────────────────────────────

export const SummarySchema = z.object({
  totalMinutes: z.number().int(),
  withdrawnMinutes: z.number().int(),
  balanceMinutes: z.number().int(),
});

export type Summary = z.infer<typeof SummarySchema>;

// ── Utilities ────────────────────────────────────────────────────────────────

/** Format an integer number of minutes as "Xh Ym" */
export function formatMinutes(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? '-' : '';
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

/** Calculate duration in minutes for a completed session */
export function sessionDurationMinutes(session: WorkSession): number {
  if (session.ended_at === null) return 0;
  return Math.round((session.ended_at - session.started_at) / 60_000);
}

