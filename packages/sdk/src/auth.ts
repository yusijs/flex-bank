import { eq } from 'drizzle-orm';
import { verifyPassword } from './db/index.js';
import type { Db } from './db/index.js';
import { users } from './db/schema.js';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials');
  }
}

export function createAuthSdk(db: Db) {
  return {
    async login(username: string, password: string): Promise<{ userId: string; username: string }> {
      const [user] = db.select().from(users).where(eq(users.username, username)).all();

      if (!user) throw new InvalidCredentialsError();

      const valid = await verifyPassword(password, user.password_hash);
      if (!valid) throw new InvalidCredentialsError();

      return { userId: user.id, username: user.username };
    },
  };
}
