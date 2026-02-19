import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../app.js';
import type { FastifyInstance } from 'fastify';
import os from 'os';
import path from 'path';
import fs from 'fs';

function tmpDb() {
  return path.join(os.tmpdir(), `overtime-test-${Date.now()}-${Math.random()}.db`);
}

describe('Sessions API', () => {
  let app: FastifyInstance;
  let dbPath: string;

  beforeEach(async () => {
    dbPath = tmpDb();
    app = buildApp(dbPath);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it('GET /health returns ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });

  it('GET /sessions/active returns null when no session running', async () => {
    const res = await app.inject({ method: 'GET', url: '/sessions/active' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toBeNull();
  });

  it('POST /sessions/start creates a session', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/sessions/start',
      payload: { note: 'Late work' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.id).toBeDefined();
    expect(body.ended_at).toBeNull();
    expect(body.note).toBe('Late work');
  });

  it('GET /sessions/active returns running session after start', async () => {
    await app.inject({ method: 'POST', url: '/sessions/start', payload: {} });
    const res = await app.inject({ method: 'GET', url: '/sessions/active' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).not.toBeNull();
    expect(res.json().ended_at).toBeNull();
  });

  it('POST /sessions/start returns 409 when session already running', async () => {
    await app.inject({ method: 'POST', url: '/sessions/start', payload: {} });
    const res = await app.inject({ method: 'POST', url: '/sessions/start', payload: {} });
    expect(res.statusCode).toBe(409);
  });

  it('PATCH /sessions/:id/stop stops an active session', async () => {
    const start = await app.inject({ method: 'POST', url: '/sessions/start', payload: {} });
    const { id } = start.json();
    const res = await app.inject({ method: 'PATCH', url: `/sessions/${id}/stop`, payload: {} });
    expect(res.statusCode).toBe(200);
    expect(res.json().ended_at).not.toBeNull();
  });

  it('PATCH /sessions/:id/stop returns 404 for unknown id', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/sessions/00000000-0000-0000-0000-000000000000/stop',
      payload: {},
    });
    expect(res.statusCode).toBe(404);
  });

  it('PATCH /sessions/:id/stop returns 409 for already stopped session', async () => {
    const start = await app.inject({ method: 'POST', url: '/sessions/start', payload: {} });
    const { id } = start.json();
    await app.inject({ method: 'PATCH', url: `/sessions/${id}/stop`, payload: {} });
    const res = await app.inject({ method: 'PATCH', url: `/sessions/${id}/stop`, payload: {} });
    expect(res.statusCode).toBe(409);
  });

  it('GET /sessions lists completed sessions', async () => {
    const start = await app.inject({ method: 'POST', url: '/sessions/start', payload: {} });
    const { id } = start.json();
    await app.inject({ method: 'PATCH', url: `/sessions/${id}/stop`, payload: {} });
    const res = await app.inject({ method: 'GET', url: '/sessions' });
    expect(res.statusCode).toBe(200);
    const sessions = res.json();
    expect(sessions.length).toBe(1);
    expect(sessions[0].id).toBe(id);
  });

  it('DELETE /sessions/:id removes a session', async () => {
    const start = await app.inject({ method: 'POST', url: '/sessions/start', payload: {} });
    const { id } = start.json();
    await app.inject({ method: 'PATCH', url: `/sessions/${id}/stop`, payload: {} });
    const del = await app.inject({ method: 'DELETE', url: `/sessions/${id}` });
    expect(del.statusCode).toBe(204);
    const list = await app.inject({ method: 'GET', url: '/sessions' });
    expect(list.json().length).toBe(0);
  });

  it('POST /sessions/start rejects note that is too long', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/sessions/start',
      payload: { note: 'a'.repeat(501) },
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /sessions/manual creates a completed session', async () => {
    const now = Date.now();
    const res = await app.inject({
      method: 'POST',
      url: '/sessions/manual',
      payload: { started_at: now - 3_600_000, ended_at: now, note: 'Manual entry' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.id).toBeDefined();
    expect(body.ended_at).toBe(now);
    expect(body.note).toBe('Manual entry');
  });

  it('POST /sessions/manual appears in sessions list', async () => {
    const now = Date.now();
    await app.inject({
      method: 'POST',
      url: '/sessions/manual',
      payload: { started_at: now - 7_200_000, ended_at: now },
    });
    const list = await app.inject({ method: 'GET', url: '/sessions' });
    expect(list.json().length).toBe(1);
  });

  it('POST /sessions/manual rejects when ended_at <= started_at', async () => {
    const now = Date.now();
    const res = await app.inject({
      method: 'POST',
      url: '/sessions/manual',
      payload: { started_at: now, ended_at: now - 1000 },
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /sessions/manual rejects missing timestamps', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/sessions/manual',
      payload: {},
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /sessions/manual counts toward summary', async () => {
    const now = Date.now();
    await app.inject({
      method: 'POST',
      url: '/sessions/manual',
      payload: { started_at: now - 3_600_000, ended_at: now },
    });
    const summary = await app.inject({ method: 'GET', url: '/summary' });
    expect(summary.json().totalMinutes).toBe(60);
  });
});

describe('Withdrawals API', () => {
  let app: FastifyInstance;
  let dbPath: string;

  beforeEach(async () => {
    dbPath = tmpDb();
    app = buildApp(dbPath);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it('GET /withdrawals returns empty list', async () => {
    const res = await app.inject({ method: 'GET', url: '/withdrawals' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('POST /withdrawals creates a withdrawal', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/withdrawals',
      payload: { minutes: 60, reason: 'Day off' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.id).toBeDefined();
    expect(body.minutes).toBe(60);
    expect(body.reason).toBe('Day off');
  });

  it('POST /withdrawals rejects zero minutes', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/withdrawals',
      payload: { minutes: 0 },
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /withdrawals rejects negative minutes', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/withdrawals',
      payload: { minutes: -10 },
    });
    expect(res.statusCode).toBe(400);
  });

  it('DELETE /withdrawals/:id removes a withdrawal', async () => {
    const create = await app.inject({
      method: 'POST',
      url: '/withdrawals',
      payload: { minutes: 30 },
    });
    const { id } = create.json();
    const del = await app.inject({ method: 'DELETE', url: `/withdrawals/${id}` });
    expect(del.statusCode).toBe(204);
    const list = await app.inject({ method: 'GET', url: '/withdrawals' });
    expect(list.json().length).toBe(0);
  });

  it('DELETE /withdrawals/:id returns 404 for unknown id', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/withdrawals/00000000-0000-0000-0000-000000000000',
    });
    expect(res.statusCode).toBe(404);
  });
});

describe('Summary API', () => {
  let app: FastifyInstance;
  let dbPath: string;

  beforeEach(async () => {
    dbPath = tmpDb();
    app = buildApp(dbPath);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it('GET /summary returns zeros when empty', async () => {
    const res = await app.inject({ method: 'GET', url: '/summary' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ totalMinutes: 0, withdrawnMinutes: 0, balanceMinutes: 0 });
  });

  it('GET /summary reflects sessions and withdrawals', async () => {
    // Start and stop a session
    const start = await app.inject({ method: 'POST', url: '/sessions/start', payload: {} });
    const { id } = start.json();
    // Manually patch ended_at to be 90 mins later via stop, then summary will compute
    await app.inject({ method: 'PATCH', url: `/sessions/${id}/stop`, payload: {} });

    // Add a withdrawal
    await app.inject({
      method: 'POST',
      url: '/withdrawals',
      payload: { minutes: 30 },
    });

    const res = await app.inject({ method: 'GET', url: '/summary' });
    const body = res.json();
    expect(body.totalMinutes).toBeGreaterThanOrEqual(0);
    expect(body.withdrawnMinutes).toBe(30);
    expect(body.balanceMinutes).toBe(body.totalMinutes - 30);
  });
});

describe('Export API', () => {
  let app: FastifyInstance;
  let dbPath: string;

  beforeEach(async () => {
    dbPath = tmpDb();
    app = buildApp(dbPath);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it('GET /export?format=csv returns CSV', async () => {
    const res = await app.inject({ method: 'GET', url: '/export?format=csv' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
  });

  it('GET /export returns xlsx by default', async () => {
    const res = await app.inject({ method: 'GET', url: '/export' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('spreadsheetml');
  });
});

