import { createHttpClient } from './http-client.js';
import { createElectronClient } from './electron-client.js';
import type { OvertimeClient } from './types.js';

export type { OvertimeClient, ExportResult } from './types.js';

function createClient(): OvertimeClient {
  if (typeof window !== 'undefined' && window.electronAPI !== undefined) {
    return createElectronClient(window.electronAPI);
  }
  return createHttpClient();
}

export const api: OvertimeClient = createClient();

// Named exports preserved for backward compatibility with useQueries.ts
export const sessionsApi = api.sessions;
export const withdrawalsApi = api.withdrawals;
export const summaryApi = api.summary;
export const authApi = api.auth;
export const exportApi = api.export;

// Keep exportUrl for any existing code that navigates directly (HTTP-only)
export const exportUrl = (format: 'xlsx' | 'csv') => `/api/export?format=${format}`;
