import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { OvertimeSdk } from '@overtime/sdk';
import { SessionConflictError, SessionNotFoundError, SessionAlreadyStoppedError } from '@overtime/sdk';

export async function sessionRoutes(fastify: FastifyInstance, { sdk }: { sdk: OvertimeSdk }) {
  fastify.get('/sessions', async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { from?: string; to?: string };
    const filter = {
      from: query.from !== undefined ? Number(query.from) : undefined,
      to: query.to !== undefined ? Number(query.to) : undefined,
    };
    return reply.send(await sdk.sessions.list(filter));
  });

  fastify.get('/sessions/active', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(await sdk.sessions.active());
  });

  fastify.post('/sessions/start', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const session = await sdk.sessions.start((req.body as Record<string, unknown>) ?? {});
      return reply.status(201).send(session);
    } catch (err) {
      if (err instanceof SessionConflictError) {
        return reply.status(409).send({ error: err.message, session: err.session });
      }
      throw err;
    }
  });

  fastify.post('/sessions/manual', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const session = await sdk.sessions.manual(req.body as Parameters<typeof sdk.sessions.manual>[0]);
      return reply.status(201).send(session);
    } catch (err) {
      if (err instanceof Error && err.name === 'ZodError') {
        return reply.status(400).send({ error: err.message });
      }
      throw err;
    }
  });

  fastify.patch('/sessions/:id/stop', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    try {
      const session = await sdk.sessions.stop(id, (req.body as Record<string, unknown>) ?? {});
      return reply.send(session);
    } catch (err) {
      if (err instanceof SessionNotFoundError) {
        return reply.status(404).send({ error: err.message });
      }
      if (err instanceof SessionAlreadyStoppedError) {
        return reply.status(409).send({ error: err.message });
      }
      throw err;
    }
  });

  fastify.delete('/sessions/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    try {
      await sdk.sessions.remove(id);
      return reply.status(204).send();
    } catch (err) {
      if (err instanceof SessionNotFoundError) {
        return reply.status(404).send({ error: err.message });
      }
      throw err;
    }
  });
}
