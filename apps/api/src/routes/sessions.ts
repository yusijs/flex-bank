import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, isNull, isNotNull, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { CreateSessionSchema, StopSessionSchema, ManualSessionSchema } from '@overtime/shared';
import type { Db } from '../db/index.js';
import { workSessions } from '../db/schema.js';

export async function sessionRoutes(fastify: FastifyInstance, { db }: { db: Db }) {
  // GET /sessions - list all completed sessions
  fastify.get('/sessions', async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { from?: string; to?: string };
    const rows = await db
      .select()
      .from(workSessions)
      .where(isNotNull(workSessions.ended_at))
      .orderBy(desc(workSessions.started_at));

    let results = rows;
    if (query.from) {
      const from = Number(query.from);
      results = results.filter((r) => r.started_at >= from);
    }
    if (query.to) {
      const to = Number(query.to);
      results = results.filter((r) => r.started_at <= to);
    }

    return reply.send(results);
  });

  // GET /sessions/active - get currently running session (if any)
  fastify.get('/sessions/active', async (_req: FastifyRequest, reply: FastifyReply) => {
    const rows = await db
      .select()
      .from(workSessions)
      .where(isNull(workSessions.ended_at))
      .orderBy(desc(workSessions.created_at))
      .limit(1);

    return reply.send(rows[0] ?? null);
  });

  // POST /sessions/start - start a new session
  fastify.post('/sessions/start', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = CreateSessionSchema.safeParse(req.body ?? {});
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    // Check for already-running session
    const active = await db
      .select()
      .from(workSessions)
      .where(isNull(workSessions.ended_at))
      .limit(1);

    if (active.length > 0) {
      return reply.status(409).send({ error: 'A session is already running', session: active[0] });
    }

    const now = Date.now();
    const session = {
      id: uuidv4(),
      started_at: now,
      ended_at: null as number | null,
      note: body.data.note ?? null,
      created_at: now,
    };

    await db.insert(workSessions).values(session);
    return reply.status(201).send(session);
  });

  // POST /sessions/manual - add a completed session with explicit timestamps
  fastify.post('/sessions/manual', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = ManualSessionSchema.safeParse(req.body ?? {});
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const session = {
      id: uuidv4(),
      started_at: body.data.started_at,
      ended_at: body.data.ended_at,
      note: body.data.note ?? null,
      created_at: Date.now(),
    };

    await db.insert(workSessions).values(session);
    return reply.status(201).send(session);
  });

  // PATCH /sessions/:id/stop - stop an active session
  fastify.patch('/sessions/:id/stop', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const body = StopSessionSchema.safeParse(req.body ?? {});
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const rows = await db
      .select()
      .from(workSessions)
      .where(eq(workSessions.id, id))
      .limit(1);

    if (rows.length === 0) {
      return reply.status(404).send({ error: 'Session not found' });
    }

    if (rows[0].ended_at !== null) {
      return reply.status(409).send({ error: 'Session already stopped' });
    }

    const now = Date.now();
    const updates: { ended_at: number; note?: string } = { ended_at: now };
    if (body.data.note !== undefined) updates.note = body.data.note;

    await db
      .update(workSessions)
      .set(updates)
      .where(eq(workSessions.id, id));

    const updated = await db
      .select()
      .from(workSessions)
      .where(eq(workSessions.id, id))
      .limit(1);

    return reply.send(updated[0]);
  });

  // DELETE /sessions/:id
  fastify.delete('/sessions/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };

    const rows = await db
      .select()
      .from(workSessions)
      .where(eq(workSessions.id, id))
      .limit(1);

    if (rows.length === 0) {
      return reply.status(404).send({ error: 'Session not found' });
    }

    await db.delete(workSessions).where(eq(workSessions.id, id));
    return reply.status(204).send();
  });
}



