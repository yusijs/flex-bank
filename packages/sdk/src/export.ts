import { isNotNull, desc } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import { sessionDurationMinutes, formatMinutes } from '@overtime/shared';
import type { WorkSession } from '@overtime/shared';
import type { Db } from './db/index.js';
import { workSessions, withdrawals } from './db/schema.js';

export interface ExportResult {
  data: Uint8Array;
  contentType: string;
  filename: string;
}

export function createExportSdk(db: Db) {
  return {
    async generate(format: 'xlsx' | 'csv'): Promise<ExportResult> {
      const sessions = await db
        .select()
        .from(workSessions)
        .where(isNotNull(workSessions.ended_at))
        .orderBy(desc(workSessions.started_at));

      const withdrawalRows = await db
        .select()
        .from(withdrawals)
        .orderBy(desc(withdrawals.withdrawn_at));

      const sessionsData = sessions.map((s) => ({
        Date: new Date(s.started_at).toLocaleDateString(),
        'Start Time': new Date(s.started_at).toLocaleTimeString(),
        'End Time': s.ended_at ? new Date(s.ended_at).toLocaleTimeString() : '',
        'Duration (minutes)': sessionDurationMinutes(s as WorkSession),
        Duration: formatMinutes(sessionDurationMinutes(s as WorkSession)),
        Note: s.note ?? '',
      }));

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
        const encoder = new TextEncoder();
        return {
          data: encoder.encode(csv),
          contentType: 'text/csv',
          filename: 'overtime-sessions.csv',
        };
      } else {
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
        return {
          data: new Uint8Array(buffer),
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename: 'flex-time-tracker.xlsx',
        };
      }
    },
  };
}
