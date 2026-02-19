import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createDb(dbPath?: string) {
  const resolvedPath = dbPath ?? path.join(__dirname, '../../data/overtime.db');
  const sqlite = new Database(resolvedPath);

  // Enable WAL mode for better concurrency
  sqlite.pragma('journal_mode = WAL');

  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS work_sessions (
      id TEXT PRIMARY KEY,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      note TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      minutes INTEGER NOT NULL,
      reason TEXT,
      withdrawn_at INTEGER NOT NULL
    );
  `);

  return drizzle(sqlite, { schema });
}

export type Db = ReturnType<typeof createDb>;

