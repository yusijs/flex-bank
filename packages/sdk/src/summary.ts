import { isNotNull } from 'drizzle-orm';
import { sessionDurationMinutes } from '@overtime/shared';
import type { Summary, WorkSession } from '@overtime/shared';
import type { Db } from './db/index.js';
import { workSessions, withdrawals } from './db/schema.js';

export function createSummarySdk(db: Db) {
  return {
    async get(): Promise<Summary> {
      const sessions = await db
        .select()
        .from(workSessions)
        .where(isNotNull(workSessions.ended_at));

      const totalMinutes = sessions.reduce(
        (sum, s) => sum + sessionDurationMinutes(s as WorkSession),
        0,
      );

      const withdrawalRows = await db.select().from(withdrawals);
      const withdrawnMinutes = withdrawalRows.reduce((sum, w) => sum + w.minutes, 0);

      return {
        totalMinutes,
        withdrawnMinutes,
        balanceMinutes: totalMinutes - withdrawnMinutes,
      };
    },
  };
}
