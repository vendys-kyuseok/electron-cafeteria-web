import { ipcMain, app, type WebContents } from 'electron';
import log from 'electron-log';
import fs from 'fs';
import os from 'os';
import path from 'node:path';
import dayjs from 'dayjs';
import axios from 'axios';

const baseURL = import.meta.env.VITE_APP_STORE_URL;
console.log('##### baseURL:', baseURL);

export const getMacAddress = () => {
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

// 기기 상태 내역
export const registerElectronLogger = () => {
  log.transports.file.resolvePathFn = () => {
    const logFolder = path.join(app.getPath('downloads'), 'logs', dayjs().format('YYYY-MM'));

    if (!fs.existsSync(logFolder)) {
      fs.mkdirSync(logFolder, { recursive: true });
    }

    return path.join(logFolder, `main.${dayjs().format('YYYY-MM-DD')}.log`);
  };

  log.transports.file.level = 'info';
  log.transports.ipc.level = 'info';
  log.initialize();
};

// 바코드 태깅 내역
export const barcodeLogger = () => {
  ipcMain.on('cafeteria-barcode-send', (event, barcode) => {
    const logFolder = path.join(app.getPath('downloads'), 'logs', dayjs().format('YYYY-MM'));
    const logFilePath = path.join(logFolder, `inputLogFile.${dayjs().format('YYYY-MM-DD')}.log`);
    const logEntry = `${dayjs().format('YYYY-MM-DD HH:mm:ss')} : ${barcode}\n`;

    electronConsoleLog(event.sender, '##### barcode:', barcode);

    // 폴더 생성 로직 포함
    if (!fs.existsSync(logFolder)) {
      fs.mkdirSync(logFolder, { recursive: true });
    }

    fs.appendFile(logFilePath, logEntry, (error) => {
      if (error) console.error('Failed to save barcode log:', error);
    });
  });
};

// 장부모드 파일 저장
export const offlineBarcodeLogger = () => {
  ipcMain.removeHandler('cafeteria-offline-barcode');
  ipcMain.handle('cafeteria-offline-barcode', async (event, cafeteriaInfo) => {
    const menuId = cafeteriaInfo?.params?.store?.menu ?? 'MID_EMPTY';

    electronConsoleLog(event.sender, '##### cafeteria-offline-barcode:', menuId, '|', cafeteriaInfo?.barcode);

    const currentDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const logFolder = path.join(app.getPath('downloads'), 'barcodeFile');
    const logFilePath = path.join(logFolder, dayjs().format('YYYY-MM-DD'));
    const logEntry = `${currentDate}|${cafeteriaInfo?.barcode}|${menuId}\n`;

    try {
      await fs.promises.mkdir(logFolder, { recursive: true });
      await fs.promises.appendFile(logFilePath, logEntry);

      return { isSuccess: true };
    } catch (error) {
      log.error('Failed to save barcode log', error);
      return { isSuccess: false, message: '장부 저장에 실패했습니다.' };
    }
  });
};

// 장부모드 파일 제거
export const offlineFileDelete = (file: string) => {
  const logFolder = path.join(app.getPath('downloads'), 'barcodeFile');
  const filePath = `${logFolder}/${file}`;

  if (!fs.existsSync(filePath)) return;
  // 전송된 파일은 제거
  fs.unlinkSync(filePath);
};

// 장부모드 파일 전송
export const offlineFileSend = () => {
  ipcMain.on('cafeteria-offline-file-send', (_, { storeId }) => {
    const macAddress = getMacAddress();
    const logFolder = path.join(app.getPath('downloads'), 'barcodeFile');

    fs.readdir(logFolder, (_, files) => {
      if (!storeId || !files?.length) return;

      files.forEach((file) => {
        const filePath = `${logFolder}/${file}`;
        fs.readFile(filePath, async (_, content) => {
          console.log('##### cafeteria-offline-file-send:', `${baseURL}/cafeteria/v1/${storeId}/offline`, { file: content });
          // Authorization: `Bearer ${token.access_token}`,
          const headers = { 'app-installation': macAddress, orginalFileName: '' };
          // 파일을 읽어 Buffer 형태로 전송
          await axios.post(`${baseURL}/cafeteria/v1/${storeId}/offline`, { file: content }, { headers }).then((result) => {
            if (result.status !== 201) return; // 파일 전송 선공 시 201로 확인됨
            // 전송된 파일은 제거
            offlineFileDelete(file);
          });
        });
      });
    });
  });
};

const normalizeArgs = (args: unknown[]) => {
  return args.map((arg) => (arg instanceof Error ? { name: arg.name, message: arg.message, stack: arg.stack } : arg));
};
// electron console은 터미널에서 확인 가능
// electronConsoleLog 사용하면 브라우저 console 에서 확인 가능
export const electronConsoleLog = (targetWindow: WebContents | undefined, ...args: unknown[]) => {
  targetWindow?.send('electron-console-log', ...normalizeArgs(args));
};

// ipcMain Event 선언
export const registerIpcEvents = () => {
  registerElectronLogger();
  barcodeLogger();
  offlineBarcodeLogger();
  offlineFileSend();
};
