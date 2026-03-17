import type {
  WorkSession,
  Withdrawal,
  Summary,
  CreateSession,
  StopSession,
  CreateWithdrawal,
  ManualSession,
} from '@overtime/shared';
import type { OvertimeClient, ExportResult } from './types.js';

// Matches the shape exposed by apps/electron/src/preload.ts
interface ElectronAPI {
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

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function createElectronClient(api: ElectronAPI): OvertimeClient {
  return {
    auth: {
      login: (username, password) => api.auth.login(username, password),
    },
    sessions: {
      list: (filter) => api.sessions.list(filter),
      active: () => api.sessions.active(),
      start: (data) => api.sessions.start(data),
      stop: (id, data) => api.sessions.stop(id, data),
      manual: (data) => api.sessions.manual(data),
      remove: (id) => api.sessions.remove(id),
    },
    withdrawals: {
      list: () => api.withdrawals.list(),
      create: (data) => api.withdrawals.create(data),
      remove: (id) => api.withdrawals.remove(id),
    },
    summary: {
      get: () => api.summary.get(),
    },
    export: {
      generate: (format) => api.export.generate(format),
    },
  };
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
}
