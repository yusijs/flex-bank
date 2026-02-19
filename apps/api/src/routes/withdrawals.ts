import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { CreateWithdrawalSchema } from '@overtime/shared';
import type { Db } from '../db/index.js';
import { withdrawals } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function withdrawalRoutes(fastify: FastifyInstance, { db }: { db: Db }) {
  // GET /withdrawals
  fastify.get('/withdrawals', async (_req: FastifyRequest, reply: FastifyReply) => {
    const rows = await db
      .select()
      .from(withdrawals)
      .orderBy(desc(withdrawals.withdrawn_at));
    return reply.send(rows);
  });

  // POST /withdrawals
  fastify.post('/withdrawals', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = CreateWithdrawalSchema.safeParse(req.body ?? {});
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const withdrawal = {
      id: uuidv4(),
      minutes: body.data.minutes,
      reason: body.data.reason ?? null,
      withdrawn_at: Date.now(),
    };

    await db.insert(withdrawals).values(withdrawal);
    return reply.status(201).send(withdrawal);
  });

  // DELETE /withdrawals/:id
  fastify.delete('/withdrawals/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };

    const rows = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.id, id))
      .limit(1);

    if (rows.length === 0) {
      return reply.status(404).send({ error: 'Withdrawal not found' });
    }

    await db.delete(withdrawals).where(eq(withdrawals.id, id));
    return reply.status(204).send();
  });
}





