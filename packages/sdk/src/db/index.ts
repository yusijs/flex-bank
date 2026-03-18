import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
    });
  });
}

function getDefaultDbPath(): string {
  // import.meta.url works in ESM (API server); falls back to cwd in bundled/CJS environments (Electron)
  try {
    return path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../data/overtime.db');
  } catch {
    return path.join(process.cwd(), 'data', 'overtime.db');
  }
}

export function createDb(dbPath?: string) {
  const resolvedPath = dbPath ?? getDefaultDbPath();
  const sqlite = new Database(resolvedPath);

  sqlite.pragma('journal_mode = WAL');

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

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

export async function seedDefaultUser(db: Db, username: string, password: string) {
  const existing = db.select().from(schema.users).all();
  if (existing.length === 0) {
    const hash = await hashPassword(password);
    db.insert(schema.users).values({
      id: uuidv4(),
      username,
      password_hash: hash,
      created_at: Date.now(),
    }).run();
  }
}
