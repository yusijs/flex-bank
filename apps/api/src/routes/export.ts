import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { OvertimeSdk } from '@overtime/sdk';

export async function exportRoutes(fastify: FastifyInstance, { sdk }: { sdk: OvertimeSdk }) {
  fastify.get('/export', async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { format?: string };
    const format = query.format === 'csv' ? 'csv' : 'xlsx';

    const result = await sdk.export.generate(format);

    reply.header('Content-Type', result.contentType);
    reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);
    return reply.send(Buffer.from(result.data));
  });
}
