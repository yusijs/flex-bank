import type {
  WorkSession,
  Withdrawal,
  Summary,
  CreateSession,
  StopSession,
  CreateWithdrawal,
  ManualSession,
} from '@overtime/shared';
import type { OvertimeClient, ExportResult } from './types.js';

const BASE = '/api';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...init?.headers },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? res.statusText);
  }
  return res.json();
}

export function createHttpClient(): OvertimeClient {
  return {
    auth: {
      login: async (username: string, password: string) => {
        const res = await fetch(`${BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? 'Login failed');
        }
        return res.json() as Promise<{ token: string }>;
      },
    },

    sessions: {
      list: (filter?: { from?: number; to?: number }) => {
        const params = new URLSearchParams();
        if (filter?.from !== undefined) params.set('from', String(filter.from));
        if (filter?.to !== undefined) params.set('to', String(filter.to));
        const qs = params.toString() ? `?${params.toString()}` : '';
        return request<WorkSession[]>(`/sessions${qs}`);
      },
      active: () => request<WorkSession | null>('/sessions/active'),
      start: (data: CreateSession = {}) =>
        request<WorkSession>('/sessions/start', { method: 'POST', body: JSON.stringify(data) }),
      stop: (id: string, data: StopSession = {}) =>
        request<WorkSession>(`/sessions/${id}/stop`, { method: 'PATCH', body: JSON.stringify(data) }),
      manual: (data: ManualSession) =>
        request<WorkSession>('/sessions/manual', { method: 'POST', body: JSON.stringify(data) }),
      remove: (id: string) => request<void>(`/sessions/${id}`, { method: 'DELETE' }),
    },

    withdrawals: {
      list: () => request<Withdrawal[]>('/withdrawals'),
      create: (data: CreateWithdrawal) =>
        request<Withdrawal>('/withdrawals', { method: 'POST', body: JSON.stringify(data) }),
      remove: (id: string) => request<void>(`/withdrawals/${id}`, { method: 'DELETE' }),
    },

    summary: {
      get: () => request<Summary>('/summary'),
    },

    export: {
      generate: async (format: 'xlsx' | 'csv'): Promise<ExportResult> => {
        const res = await fetch(`${BASE}/export?format=${format}`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error('Export failed');
        const contentType = res.headers.get('Content-Type') ?? 'application/octet-stream';
        const disposition = res.headers.get('Content-Disposition') ?? '';
        const filenameMatch = disposition.match(/filename="([^"]+)"/);
        const filename = filenameMatch?.[1] ?? `overtime-export.${format}`;
        const buffer = await res.arrayBuffer();
        return { data: new Uint8Array(buffer), contentType, filename };
      },
    },
  };
}
