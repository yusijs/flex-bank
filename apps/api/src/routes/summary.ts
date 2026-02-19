import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { isNotNull } from 'drizzle-orm';
import { sessionDurationMinutes } from '@overtime/shared';
import type { Db } from '../db/index.js';
import { workSessions, withdrawals } from '../db/schema.js';
import type { WorkSession } from '@overtime/shared';

export async function summaryRoutes(fastify: FastifyInstance, { db }: { db: Db }) {
  fastify.get('/summary', async (_req: FastifyRequest, reply: FastifyReply) => {
    const sessions = await db
      .select()
      .from(workSessions)
      .where(isNotNull(workSessions.ended_at));

    const totalMinutes = sessions.reduce(
      (sum, s) => sum + sessionDurationMinutes(s as WorkSession),
      0
    );

    const withdrawalRows = await db.select().from(withdrawals);
    const withdrawnMinutes = withdrawalRows.reduce((sum, w) => sum + w.minutes, 0);

    return reply.send({
      totalMinutes,
      withdrawnMinutes,
      balanceMinutes: totalMinutes - withdrawnMinutes,
    });
  });
}



