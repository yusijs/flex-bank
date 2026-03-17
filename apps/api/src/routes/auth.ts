import { FastifyPluginAsync } from 'fastify';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Db, verifyPassword } from '../db/index.js';
import { users } from '../db/schema.js';

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const authRoutes: FastifyPluginAsync<{ db: Db }> = async (fastify, { db }) => {
  fastify.post('/auth/login', async (req, reply) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request' });
    }

    const { username, password } = parsed.data;
    const [user] = db.select().from(users).where(eq(users.username, username)).all();

    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = fastify.jwt.sign({ sub: user.id, username: user.username });
    return reply.send({ token });
  });

  fastify.get('/auth/me', async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    return { username: (req.user as { username: string }).username };
  });
};
