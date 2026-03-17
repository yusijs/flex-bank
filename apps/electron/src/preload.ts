import { contextBridge, ipcRenderer } from 'electron';
import type { CreateSession, StopSession, ManualSession, CreateWithdrawal } from '@overtime/shared';
import type { ExportResult } from '@overtime/sdk';

export interface ElectronAPI {
  auth: {
    login: (username: string, password: string) => Promise<{ token: string }>;
  };
  sessions: {
    list: (filter?: { from?: number; to?: number }) => Promise<unknown[]>;
    active: () => Promise<unknown>;
    start: (data?: CreateSession) => Promise<unknown>;
    stop: (id: string, data?: StopSession) => Promise<unknown>;
    manual: (data: ManualSession) => Promise<unknown>;
    remove: (id: string) => Promise<void>;
  };
  withdrawals: {
    list: () => Promise<unknown[]>;
    create: (data: CreateWithdrawal) => Promise<unknown>;
    remove: (id: string) => Promise<void>;
  };
  summary: {
    get: () => Promise<unknown>;
  };
  export: {
    generate: (format: 'xlsx' | 'csv') => Promise<ExportResult>;
  };
}

contextBridge.exposeInMainWorld('electronAPI', {
  auth: {
    login: (username: string, password: string) =>
      ipcRenderer.invoke('auth:login', username, password),
  },
  sessions: {
    list: (filter?: { from?: number; to?: number }) =>
      ipcRenderer.invoke('sessions:list', filter),
    active: () =>
      ipcRenderer.invoke('sessions:active'),
    start: (data?: CreateSession) =>
      ipcRenderer.invoke('sessions:start', data),
    stop: (id: string, data?: StopSession) =>
      ipcRenderer.invoke('sessions:stop', id, data),
    manual: (data: ManualSession) =>
      ipcRenderer.invoke('sessions:manual', data),
    remove: (id: string) =>
      ipcRenderer.invoke('sessions:remove', id),
  },
  withdrawals: {
    list: () =>
      ipcRenderer.invoke('withdrawals:list'),
    create: (data: CreateWithdrawal) =>
      ipcRenderer.invoke('withdrawals:create', data),
    remove: (id: string) =>
      ipcRenderer.invoke('withdrawals:remove', id),
  },
  summary: {
    get: () =>
      ipcRenderer.invoke('summary:get'),
  },
  export: {
    generate: (format: 'xlsx' | 'csv') =>
      ipcRenderer.invoke('export:generate', format),
  },
} satisfies ElectronAPI);
