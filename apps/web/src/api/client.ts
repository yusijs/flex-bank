import type { WorkSession, Withdrawal, Summary, CreateSession, StopSession, CreateWithdrawal } from '@overtime/shared';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? res.statusText);
  }
  return res.json();
}

// Sessions
export const sessionsApi = {
  list: () => request<WorkSession[]>('/sessions'),
  active: () => request<WorkSession | null>('/sessions/active'),
  start: (data: CreateSession = {}) =>
    request<WorkSession>('/sessions/start', { method: 'POST', body: JSON.stringify(data) }),
  stop: (id: string, data: StopSession = {}) =>
    request<WorkSession>(`/sessions/${id}/stop`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/sessions/${id}`, { method: 'DELETE' }),
};

// Withdrawals
export const withdrawalsApi = {
  list: () => request<Withdrawal[]>('/withdrawals'),
  create: (data: CreateWithdrawal) =>
    request<Withdrawal>('/withdrawals', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/withdrawals/${id}`, { method: 'DELETE' }),
};

// Summary
export const summaryApi = {
  get: () => request<Summary>('/summary'),
};

// Export
export const exportUrl = (format: 'xlsx' | 'csv') => `${BASE}/export?format=${format}`;

