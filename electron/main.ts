/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, BrowserWindow, screen, ipcMain } from 'electron';
import log from 'electron-log';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { registerIpcEvents, electronConsoleLog, getMacAddress } from './handlers/ipcHandlers';
import { registerUpdateHandlers } from './handlers/updateHandlers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let mainWindow: BrowserWindow | null;

const registerWindowEvents = () => {
  if (!mainWindow) return;

  mainWindow.on('focus', () => {
    mainWindow?.webContents.send('electron-focus', true);
    log.info('electron-focus-in');
  });
  mainWindow.on('blur', () => {
    mainWindow?.webContents.send('electron-focus', false);
    log.info('electron-focus-out');
  });

  mainWindow.webContents.once('did-finish-load', () => {
    // 동작 순서상 mainWindow 가 생성되고 useEffect 가 선언되기 때문
    setTimeout(() => {
      electronConsoleLog(mainWindow?.webContents, '##### mac:', getMacAddress());
      mainWindow?.webContents.send('electron-mac-address', getMacAddress());
    }, 1000);
  });
};

const registerAppEvents = () => {
  // 앱은 살아 있는데 창이 없을 때, 다시 창을 열기 위한 이벤트
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 창이 모두 닫혔을 때, 앱을 끝낼지 유지할지 결정
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
      mainWindow = null;
    }
  });
};

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  mainWindow = new BrowserWindow({
    // icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width,
    height,
    fullscreen: !VITE_DEV_SERVER_URL,
    webPreferences: {
      nodeIntegration: false, // React에서 require 사용 허용
      contextIsolation: true, // 전역 window 공유 허용
      preload: path.join(MAIN_DIST, 'preload.mjs')
    }
  });

  mainWindow.webContents.openDevTools();

  if (VITE_DEV_SERVER_URL) {
    // 개발 모드
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools(); // DevTools
  } else {
    // 프로덕션 모드
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: '/' });
  }

  // registerWindowEvents();
};

app.whenReady().then(() => {
  const { checkForAppUpdates } = registerUpdateHandlers();

  createWindow();
  registerIpcEvents();
  registerAppEvents();

  ipcMain.on('electron-close', () => {
    mainWindow?.webContents.close();
  });

  void checkForAppUpdates();
});
