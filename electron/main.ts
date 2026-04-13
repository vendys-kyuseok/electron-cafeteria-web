import { app, screen, ipcMain, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import isDev from 'electron-is-dev';
import os from 'os';
import fs from 'fs';
import dayjs from 'dayjs';
import { autoUpdater } from 'electron-updater';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'http://localhost:5000';

process.env.APP_ROOT = path.join(__dirname, '..');

// electron-updater는 신규 버전 설치 파일을 자동으로 다운로드 함
// 하지만 autoInstallOnAppQuit false인 경우 자동 업데이트 되지 않도록 설정 가능
autoUpdater.autoInstallOnAppQuit = false;

// export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
// export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
// export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

// process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let mainWindow: BrowserWindow | null;

console.log(__dirname, '##############');

const getMacAddress = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaces of Object.values(networkInterfaces)) {
    if (!Array.isArray(interfaces)) continue;
    for (const iface of interfaces) {
      // IPv4 주소이고 내부 루프백이 아닌 유효한 인터페이스 찾기
      if (iface && !iface.internal && iface.family === 'IPv4') {
        return iface.mac;
      }
    }
  }
  return null; // 유효한 MAC 주소를 찾지 못한 경우
};

const createWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  mainWindow = new BrowserWindow({
    // icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width,
    height,
    // fullscreen: true,
    webPreferences: {
      nodeIntegration: false, // React에서 require 사용 허용
      contextIsolation: true, // 전역 window 공유 허용
      preload: path.join(__dirname, 'preload.mjs')
    }
  });

  // mainWindow.webContents.on('did-finish-load', () => {
  //   mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
  // });

  const macAddress = getMacAddress();
  console.log(macAddress, '##############################');

  if (isDev) {
    // 개발 모드
    mainWindow.loadURL(BASE_URL);
    mainWindow.webContents.openDevTools(); // DevTools
  } else {
    // 프로덕션 모드
    mainWindow.loadFile(path.join(__dirname, './build/index.html'));
  }

  mainWindow.on('focus', () => mainWindow?.webContents.send('electron-focus', true)); // Focus In
  mainWindow.on('blur', () => mainWindow?.webContents.send('electron-focus', false)); // Focus Out

  // fs.appendFile(inputLogPath, dateTimeLogData, async (err) => {
  //   if (err) {
  //     return log.info(err);
  //   }
  //   log.info('The file was saved!');
  // });

  // if (VITE_DEV_SERVER_URL) {
  //   mainWindow.loadURL(VITE_DEV_SERVER_URL);
  // } else {
  //   // win.loadFile('dist/index.html')
  //   mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'));
  // }
};

app.whenReady().then(() => {
  createWindow();
  console.log('############################## 1');
  autoUpdater.checkForUpdates();
  console.log('############################## 2');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    mainWindow = null;
  }
});

ipcMain.on('electron-close', () => {
  mainWindow?.webContents.close();
});

// 바코드 태깅 내역
ipcMain.on('electron-offline-barcode', (_, barcode) => {
  const inputLogPath = `${app.getPath('downloads')}/logs/${dayjs().format('YYYY-MM')}/inputLogFile.${dayjs().format('YYYY-MM-DD')}.log`;
  const dateTimeLogData = `${dayjs().format('YYYY-MM-DD HH:mm:ss')} : ${barcode}\n`;

  fs.appendFile(inputLogPath, dateTimeLogData, (error) => {
    console.log(error, '########');
  });
});

// app.whenReady().then(createWindow);
// 신규 버전 릴리즈 확인 시 호출 됨
autoUpdater.on('checking-for-update', () => {
  console.log('##### 업데이트 확인 중...');
});

// 업데이트 할 신규 버전이 있을 시 호출 됨
autoUpdater.on('update-available', () => {
  console.log('##### 신규 버전 확인 및 업데이트 가능.');
});
