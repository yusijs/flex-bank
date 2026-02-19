import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { createDb } from './db/index.js';
import { sessionRoutes } from './routes/sessions.js';
import { withdrawalRoutes } from './routes/withdrawals.js';
import { summaryRoutes } from './routes/summary.js';
import { exportRoutes } from './routes/export.js';

export function buildApp(dbPath?: string) {
  const fastify = Fastify({ logger: true });
  const db = createDb(dbPath);

  // CORS for local dev
  fastify.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      reply.status(204).send();
    }
  });

  fastify.register(sessionRoutes, { db });
  fastify.register(withdrawalRoutes, { db });
  fastify.register(summaryRoutes, { db });
  fastify.register(exportRoutes, { db });

  fastify.get('/health', async () => ({ status: 'ok' }));

  return fastify;
}



