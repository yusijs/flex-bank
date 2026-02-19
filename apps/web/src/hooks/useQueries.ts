import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi, withdrawalsApi, summaryApi } from '@/api/client';
import type { CreateWithdrawal } from '@overtime/shared';

export const queryKeys = {
  sessions: ['sessions'] as const,
  activeSession: ['sessions', 'active'] as const,
  withdrawals: ['withdrawals'] as const,
  summary: ['summary'] as const,
};

// ── Sessions ─────────────────────────────────────────────────────────────────

export function useSessions() {
  return useQuery({ queryKey: queryKeys.sessions, queryFn: sessionsApi.list });
}

export function useActiveSession() {
  return useQuery({
    queryKey: queryKeys.activeSession,
    queryFn: sessionsApi.active,
    refetchInterval: 5000,
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sessionsApi.start,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.activeSession });
      qc.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

export function useStopSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => sessionsApi.stop(id, { note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sessions });
      qc.invalidateQueries({ queryKey: queryKeys.activeSession });
      qc.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sessions });
      qc.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

// ── Withdrawals ───────────────────────────────────────────────────────────────

export function useWithdrawals() {
  return useQuery({ queryKey: queryKeys.withdrawals, queryFn: withdrawalsApi.list });
}

export function useCreateWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWithdrawal) => withdrawalsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.withdrawals });
      qc.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

export function useDeleteWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawalsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.withdrawals });
      qc.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

// ── Summary ───────────────────────────────────────────────────────────────────

export function useSummary() {
  return useQuery({ queryKey: queryKeys.summary, queryFn: summaryApi.get });
}

