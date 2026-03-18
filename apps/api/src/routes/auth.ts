import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { OvertimeSdk } from '@overtime/sdk';
import { InvalidCredentialsError } from '@overtime/sdk';

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const authRoutes: FastifyPluginAsync<{ sdk: OvertimeSdk }> = async (fastify, { sdk }) => {
  fastify.post('/auth/login', async (req, reply) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request' });
    }

    const { username, password } = parsed.data;

    try {
      const user = await sdk.auth.login(username, password);
      const token = fastify.jwt.sign({ sub: user.userId, username: user.username });
      return reply.send({ token });
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      throw err;
    }
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
