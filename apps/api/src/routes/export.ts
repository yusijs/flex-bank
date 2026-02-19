import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { isNotNull, desc } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import { sessionDurationMinutes, formatMinutes } from '@overtime/shared';
import type { Db } from '../db/index.js';
import { workSessions, withdrawals } from '../db/schema.js';
import type { WorkSession } from '@overtime/shared';

export async function exportRoutes(fastify: FastifyInstance, { db }: { db: Db }) {
  fastify.get('/export', async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { format?: string };
    const format = query.format === 'csv' ? 'csv' : 'xlsx';

    const sessions = await db
      .select()
      .from(workSessions)
      .where(isNotNull(workSessions.ended_at))
      .orderBy(desc(workSessions.started_at));

    const withdrawalRows = await db
      .select()
      .from(withdrawals)
      .orderBy(desc(withdrawals.withdrawn_at));

    // Sessions sheet
    const sessionsData = sessions.map((s) => ({
      Date: new Date(s.started_at).toLocaleDateString(),
      'Start Time': new Date(s.started_at).toLocaleTimeString(),
      'End Time': s.ended_at ? new Date(s.ended_at).toLocaleTimeString() : '',
      'Duration (minutes)': sessionDurationMinutes(s as WorkSession),
      Duration: formatMinutes(sessionDurationMinutes(s as WorkSession)),
      Note: s.note ?? '',
    }));

    // Withdrawals sheet
    const withdrawalsData = withdrawalRows.map((w) => ({
      Date: new Date(w.withdrawn_at).toLocaleDateString(),
      'Minutes Withdrawn': w.minutes,
      Duration: formatMinutes(w.minutes),
      Reason: w.reason ?? '',
    }));

    const wb = XLSX.utils.book_new();
    const sessionsWs = XLSX.utils.json_to_sheet(sessionsData);
    const withdrawalsWs = XLSX.utils.json_to_sheet(withdrawalsData);
    XLSX.utils.book_append_sheet(wb, sessionsWs, 'Work Sessions');
    XLSX.utils.book_append_sheet(wb, withdrawalsWs, 'Withdrawals');

    if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(sessionsWs);
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', 'attachment; filename="overtime-sessions.csv"');
      return reply.send(csv);
    } else {
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', 'attachment; filename="overtime-tracker.xlsx"');
      return reply.send(Buffer.from(buffer));
    }
  });
}



