import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { OvertimeSdk } from '@overtime/sdk';
import { WithdrawalNotFoundError } from '@overtime/sdk';

export async function withdrawalRoutes(fastify: FastifyInstance, { sdk }: { sdk: OvertimeSdk }) {
  fastify.get('/withdrawals', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(await sdk.withdrawals.list());
  });

  fastify.post('/withdrawals', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const withdrawal = await sdk.withdrawals.create(
        req.body as Parameters<typeof sdk.withdrawals.create>[0],
      );
      return reply.status(201).send(withdrawal);
    } catch (err) {
      if (err instanceof Error && err.name === 'ZodError') {
        return reply.status(400).send({ error: err.message });
      }
      throw err;
    }
  });

  fastify.delete('/withdrawals/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    try {
      await sdk.withdrawals.remove(id);
      return reply.status(204).send();
    } catch (err) {
      if (err instanceof WithdrawalNotFoundError) {
        return reply.status(404).send({ error: err.message });
      }
      throw err;
    }
  });
}
