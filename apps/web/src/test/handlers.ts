import { http, HttpResponse } from 'msw';
import type { WorkSession, Withdrawal, Summary } from '@overtime/shared';

const now = Date.now();

const mockSession: WorkSession = {
  id: '00000000-0000-0000-0000-000000000001',
  started_at: now - 60 * 60_000,  // exactly 60 minutes ago
  ended_at: now,
  note: null,
  created_at: now - 60 * 60_000,
};

const mockWithdrawal: Withdrawal = {
  id: '00000000-0000-0000-0000-000000000002',
  minutes: 60,
  reason: 'Day off',
  withdrawn_at: Date.now(),
};

const mockSummary: Summary = {
  totalMinutes: 120,
  withdrawnMinutes: 60,
  balanceMinutes: 60,
};

export const handlers = [
  http.get('/api/sessions/active', () => HttpResponse.json(null)),
  http.get('/api/sessions', () => HttpResponse.json([mockSession])),
  http.post('/api/sessions/start', () =>
    HttpResponse.json(
      { ...mockSession, ended_at: null, started_at: Date.now() },
      { status: 201 }
    )
  ),
  http.post('/api/sessions/manual', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json(
      { ...mockSession, started_at: body.started_at, ended_at: body.ended_at, note: body.note ?? null },
      { status: 201 }
    );
  }),
  http.patch('/api/sessions/:id/stop', () => HttpResponse.json(mockSession)),
  http.delete('/api/sessions/:id', () => new HttpResponse(null, { status: 204 })),
  http.get('/api/withdrawals', () => HttpResponse.json([mockWithdrawal])),
  http.post('/api/withdrawals', () => HttpResponse.json(mockWithdrawal, { status: 201 })),
  http.delete('/api/withdrawals/:id', () => new HttpResponse(null, { status: 204 })),
  http.get('/api/summary', () => HttpResponse.json(mockSummary)),
];


