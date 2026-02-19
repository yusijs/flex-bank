import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const workSessions = sqliteTable('work_sessions', {
  id: text('id').primaryKey(),
  started_at: integer('started_at').notNull(),
  ended_at: integer('ended_at'),
  note: text('note'),
  created_at: integer('created_at').notNull(),
});

export const withdrawals = sqliteTable('withdrawals', {
  id: text('id').primaryKey(),
  minutes: integer('minutes').notNull(),
  reason: text('reason'),
  withdrawn_at: integer('withdrawn_at').notNull(),
});

