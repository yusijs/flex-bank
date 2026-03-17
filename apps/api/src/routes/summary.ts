import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { OvertimeSdk } from '@overtime/sdk';

export async function summaryRoutes(fastify: FastifyInstance, { sdk }: { sdk: OvertimeSdk }) {
  fastify.get('/summary', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(await sdk.summary.get());
  });
}
