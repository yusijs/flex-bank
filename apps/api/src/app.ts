import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fjwt from '@fastify/jwt';
import { createDb, seedDefaultUser } from './db/index.js';
import { sessionRoutes } from './routes/sessions.js';
import { withdrawalRoutes } from './routes/withdrawals.js';
import { summaryRoutes } from './routes/summary.js';
import { exportRoutes } from './routes/export.js';
import { authRoutes } from './routes/auth.js';

export interface BuildAppOptions {
  jwtSecret?: string;
  adminUsername?: string;
  adminPassword?: string;
  skipAuth?: boolean;
}

export function buildApp(dbPath?: string, options: BuildAppOptions = {}) {
  const {
    jwtSecret = process.env.JWT_SECRET ?? 'default-dev-secret-change-in-production',
    adminUsername = process.env.ADMIN_USERNAME ?? 'admin',
    adminPassword = process.env.ADMIN_PASSWORD ?? 'admin',
    skipAuth = false,
  } = options;

  const fastify = Fastify({ logger: true });
  const db = createDb(dbPath);

  // Register JWT plugin
  fastify.register(fjwt, { secret: jwtSecret });

  // CORS for local dev
  fastify.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      reply.status(204).send();
    }
  });

  // Seed default admin user after ready
  fastify.addHook('onReady', async () => {
    await seedDefaultUser(db, adminUsername, adminPassword);
  });

  // Public routes
  fastify.register(authRoutes, { db });
  fastify.get('/health', async () => ({ status: 'ok' }));

  // Protected routes scope
  fastify.register(async (app) => {
    if (!skipAuth) {
      app.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
        try {
          await req.jwtVerify();
        } catch {
          reply.status(401).send({ error: 'Unauthorized' });
        }
      });
    }

    app.register(sessionRoutes, { db });
    app.register(withdrawalRoutes, { db });
    app.register(summaryRoutes, { db });
    app.register(exportRoutes, { db });
  });

  return fastify;
}
