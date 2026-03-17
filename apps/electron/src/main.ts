import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { createSdk, InvalidCredentialsError } from '@overtime/sdk';

const dataDir = path.join(app.getPath('userData'), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'overtime.db');
const sdk = createSdk(dbPath);

const adminUsername = process.env.OVERTIME_USERNAME ?? 'admin';
const adminPassword = process.env.OVERTIME_PASSWORD ?? 'admin';

// ── IPC Handlers ─────────────────────────────────────────────────────────────

ipcMain.handle('auth:login', async (_event, username: string, password: string) => {
  try {
    await sdk.auth.login(username, password);
    return { token: 'electron-session' };
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      throw new Error('Invalid credentials');
    }
    throw err;
  }
});

ipcMain.handle('sessions:list', async (_event, filter?: { from?: number; to?: number }) => {
  return sdk.sessions.list(filter);
});

ipcMain.handle('sessions:active', async () => {
  return sdk.sessions.active();
});

ipcMain.handle('sessions:start', async (_event, data?: Record<string, unknown>) => {
  return sdk.sessions.start(data ?? {});
});

ipcMain.handle('sessions:stop', async (_event, id: string, data?: Record<string, unknown>) => {
  return sdk.sessions.stop(id, data ?? {});
});

ipcMain.handle('sessions:manual', async (_event, data: Record<string, unknown>) => {
  return sdk.sessions.manual(data as Parameters<typeof sdk.sessions.manual>[0]);
});

ipcMain.handle('sessions:remove', async (_event, id: string) => {
  return sdk.sessions.remove(id);
});

ipcMain.handle('withdrawals:list', async () => {
  return sdk.withdrawals.list();
});

ipcMain.handle('withdrawals:create', async (_event, data: Record<string, unknown>) => {
  return sdk.withdrawals.create(data as Parameters<typeof sdk.withdrawals.create>[0]);
});

ipcMain.handle('withdrawals:remove', async (_event, id: string) => {
  return sdk.withdrawals.remove(id);
});

ipcMain.handle('summary:get', async () => {
  return sdk.summary.get();
});

ipcMain.handle('export:generate', async (_event, format: 'xlsx' | 'csv') => {
  const result = await sdk.export.generate(format);
  // Uint8Array is transferable over IPC via structured clone
  return result;
});

// ── Window ────────────────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In production, load the bundled web app
  const webDistPath = path.join(__dirname, '../../web/dist/index.html');
  if (fs.existsSync(webDistPath)) {
    win.loadFile(webDistPath);
  } else {
    // In development, load from Vite dev server
    win.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(async () => {
  await sdk.seedDefaultUser(adminUsername, adminPassword);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
