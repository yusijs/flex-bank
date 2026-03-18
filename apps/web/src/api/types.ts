import type {
  WorkSession,
  Withdrawal,
  Summary,
  CreateSession,
  StopSession,
  CreateWithdrawal,
  ManualSession,
} from '@overtime/shared';

export interface ExportResult {
  data: Uint8Array;
  contentType: string;
  filename: string;
}

export interface OvertimeClient {
  auth: {
    login: (username: string, password: string) => Promise<{ token: string }>;
  };
  sessions: {
    list: (filter?: { from?: number; to?: number }) => Promise<WorkSession[]>;
    active: () => Promise<WorkSession | null>;
    start: (data?: CreateSession) => Promise<WorkSession>;
    stop: (id: string, data?: StopSession) => Promise<WorkSession>;
    manual: (data: ManualSession) => Promise<WorkSession>;
    remove: (id: string) => Promise<void>;
  };
  withdrawals: {
    list: () => Promise<Withdrawal[]>;
    create: (data: CreateWithdrawal) => Promise<Withdrawal>;
    remove: (id: string) => Promise<void>;
  };
  summary: {
    get: () => Promise<Summary>;
  };
  export: {
    generate: (format: 'xlsx' | 'csv') => Promise<ExportResult>;
  };
}
