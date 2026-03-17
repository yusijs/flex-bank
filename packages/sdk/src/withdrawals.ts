import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { CreateWithdrawalSchema } from '@overtime/shared';
import type { Withdrawal, CreateWithdrawal } from '@overtime/shared';
import type { Db } from './db/index.js';
import { withdrawals } from './db/schema.js';

export class WithdrawalNotFoundError extends Error {
  constructor() {
    super('Withdrawal not found');
  }
}

export function createWithdrawalsSdk(db: Db) {
  return {
    async list(): Promise<Withdrawal[]> {
      const rows = await db
        .select()
        .from(withdrawals)
        .orderBy(desc(withdrawals.withdrawn_at));
      return rows as Withdrawal[];
    },

    async create(data: CreateWithdrawal): Promise<Withdrawal> {
      const body = CreateWithdrawalSchema.parse(data);
      const withdrawal = {
        id: uuidv4(),
        minutes: body.minutes,
        reason: body.reason ?? null,
        withdrawn_at: Date.now(),
      };
      await db.insert(withdrawals).values(withdrawal);
      return withdrawal as Withdrawal;
    },

    async remove(id: string): Promise<void> {
      const rows = await db
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.id, id))
        .limit(1);

      if (rows.length === 0) throw new WithdrawalNotFoundError();
      await db.delete(withdrawals).where(eq(withdrawals.id, id));
    },
  };
}
