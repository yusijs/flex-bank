import { eq, isNull, isNotNull, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateSessionSchema,
  StopSessionSchema,
  ManualSessionSchema,
} from '@overtime/shared';
import type { WorkSession, CreateSession, StopSession, ManualSession } from '@overtime/shared';
import type { Db } from './db/index.js';
import { workSessions } from './db/schema.js';

export class SessionConflictError extends Error {
  constructor(public readonly session: WorkSession) {
    super('A session is already running');
  }
}

export class SessionNotFoundError extends Error {
  constructor() {
    super('Session not found');
  }
}

export class SessionAlreadyStoppedError extends Error {
  constructor() {
    super('Session already stopped');
  }
}

export function createSessionsSdk(db: Db) {
  return {
    async list(filter?: { from?: number; to?: number }): Promise<WorkSession[]> {
      const rows = await db
        .select()
        .from(workSessions)
        .where(isNotNull(workSessions.ended_at))
        .orderBy(desc(workSessions.started_at));

      let results = rows;
      if (filter?.from !== undefined) {
        results = results.filter((r) => r.started_at >= filter.from!);
      }
      if (filter?.to !== undefined) {
        results = results.filter((r) => r.started_at <= filter.to!);
      }
      return results as WorkSession[];
    },

    async active(): Promise<WorkSession | null> {
      const rows = await db
        .select()
        .from(workSessions)
        .where(isNull(workSessions.ended_at))
        .orderBy(desc(workSessions.created_at))
        .limit(1);
      return (rows[0] ?? null) as WorkSession | null;
    },

    async start(data: CreateSession = {}): Promise<WorkSession> {
      const body = CreateSessionSchema.parse(data);

      const active = await db
        .select()
        .from(workSessions)
        .where(isNull(workSessions.ended_at))
        .limit(1);

      if (active.length > 0) {
        throw new SessionConflictError(active[0] as WorkSession);
      }

      const now = Date.now();
      const session = {
        id: uuidv4(),
        started_at: now,
        ended_at: null as number | null,
        note: body.note ?? null,
        created_at: now,
      };
      await db.insert(workSessions).values(session);
      return session as WorkSession;
    },

    async stop(id: string, data: StopSession = {}): Promise<WorkSession> {
      const body = StopSessionSchema.parse(data);

      const rows = await db
        .select()
        .from(workSessions)
        .where(eq(workSessions.id, id))
        .limit(1);

      if (rows.length === 0) throw new SessionNotFoundError();
      if (rows[0].ended_at !== null) throw new SessionAlreadyStoppedError();

      const now = Date.now();
      const updates: { ended_at: number; note?: string } = { ended_at: now };
      if (body.note !== undefined) updates.note = body.note;

      await db.update(workSessions).set(updates).where(eq(workSessions.id, id));

      const updated = await db
        .select()
        .from(workSessions)
        .where(eq(workSessions.id, id))
        .limit(1);
      return updated[0] as WorkSession;
    },

    async manual(data: ManualSession): Promise<WorkSession> {
      const body = ManualSessionSchema.parse(data);
      const session = {
        id: uuidv4(),
        started_at: body.started_at,
        ended_at: body.ended_at,
        note: body.note ?? null,
        created_at: Date.now(),
      };
      await db.insert(workSessions).values(session);
      return session as WorkSession;
    },

    async remove(id: string): Promise<void> {
      const rows = await db
        .select()
        .from(workSessions)
        .where(eq(workSessions.id, id))
        .limit(1);

      if (rows.length === 0) throw new SessionNotFoundError();
      await db.delete(workSessions).where(eq(workSessions.id, id));
    },
  };
}
