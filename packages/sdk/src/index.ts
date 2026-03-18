export { createDb, seedDefaultUser, hashPassword, verifyPassword } from './db/index.js';
export type { Db } from './db/index.js';
export * from './db/schema.js';

export { createSessionsSdk, SessionConflictError, SessionNotFoundError, SessionAlreadyStoppedError } from './sessions.js';
export { createWithdrawalsSdk, WithdrawalNotFoundError } from './withdrawals.js';
export { createSummarySdk } from './summary.js';
export { createExportSdk } from './export.js';
export type { ExportResult } from './export.js';
export { createAuthSdk, InvalidCredentialsError } from './auth.js';

import { createDb, seedDefaultUser } from './db/index.js';
import { createSessionsSdk } from './sessions.js';
import { createWithdrawalsSdk } from './withdrawals.js';
import { createSummarySdk } from './summary.js';
import { createExportSdk } from './export.js';
import { createAuthSdk } from './auth.js';

export function createSdk(dbPath?: string) {
  const db = createDb(dbPath);
  return {
    sessions: createSessionsSdk(db),
    withdrawals: createWithdrawalsSdk(db),
    summary: createSummarySdk(db),
    export: createExportSdk(db),
    auth: createAuthSdk(db),
    seedDefaultUser: (username: string, password: string) =>
      seedDefaultUser(db, username, password),
  };
}

export type OvertimeSdk = ReturnType<typeof createSdk>;
