import { app, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import axios from 'axios';
import fs, { promises } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

export type AppUpdateAsset = {
  assetId: number;
  assetName: string;
  contentType: string;
  size: number;
};
export type AppUpdateRelease = {
  releaseId: number;
  version: string;
  tagName: string;
  releaseName: string;
  description: string;
  htmlUrl: string;
  publishedAt: string;
  isPrerelease: boolean;
  assets: AppUpdateAsset[];
  installerAssetId: number | null;
};

export type GithubReleaseAsset = {
  id: number;
  name: string;
  browser_download_url: string;
  content_type: string;
  size: number;
};
export type GithubReleaseRaw = {
  id: number;
  tag_name: string;
  name: string | null;
  body: string;
  draft: boolean;
  prerelease: boolean;
  html_url: string;
  published_at: string;
  assets: GithubReleaseAsset[];
};

export type AppUpdateDownloadRequest = { releaseId: number; assetId: number };
export type AppUpdateDownloadResult = { ok: true; filePath: string } | { ok: false; reason: string };

const GITHUB_OWNER = import.meta.env.VITE_APP_GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.VITE_APP_GITHUB_REPO;

let githubReleases: GithubReleaseRaw[] | null = null;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const getInstallerAsset = (assets: GithubReleaseAsset[]) => {
  // Window OS 환경, (64비트, 32비트)
  if (process.platform === 'win32') {
    return assets.find((asset) => asset.name.endsWith('.exe'))?.id ?? null;
  }
  // MAC OS 환경
  if (process.platform === 'darwin') {
    return assets.find((asset) => asset.name.endsWith('.dmg'))?.id ?? assets.find((asset) => asset.name.endsWith('.zip'))?.id ?? null;
  }

  return assets[0].id ?? null;
};

const normalizeVersion = (value: string) => value.replace(/^v/i, '').trim();
const normalizeRelease = (release: GithubReleaseRaw): AppUpdateRelease => {
  return {
    releaseId: release.id,
    releaseName: release.name ?? release.tag_name,
    version: normalizeVersion(release.tag_name),
    tagName: release.tag_name,
    description: release.body,
    htmlUrl: release.html_url,
    publishedAt: release.published_at,
    isPrerelease: release.prerelease,
    assets: release.assets.map((asset) => ({
      assetId: asset.id,
      assetName: asset.name,
      contentType: asset.content_type,
      size: asset.size
    })),
    installerAssetId: getInstallerAsset(release.assets)
  };
};

// OS의 문제되는 특수문자 제거
// 시스템 오류, 파일 인식 불가, 클라우드 동기화 실패 등의 문제가 발생할 수 있다고 함
const sanitizeFileName = (value: string) => {
  return value.replace(/[<>:"/\\|?*]/g, '_').trim();
};

const resolveDownloadPath = async (fileName: string) => {
  const downloadsPath = path.join(app.getPath('downloads'), 'cafeteria-update');
  await promises.mkdir(downloadsPath, { recursive: true });

  const safeFileName = sanitizeFileName(fileName) || 'update-file';
  const parsed = path.parse(safeFileName);

  let candidate = path.join(downloadsPath, safeFileName);
  let index = 1;

  while (fs.existsSync(candidate)) {
    candidate = path.join(downloadsPath, `${parsed.name} (${index})${parsed.ext}`);
    index += 1;
  }

  return candidate;
};

// Git에 카페테리아 Release 파일 불러오기
const fetchGithubReleases = async (): Promise<GithubReleaseRaw[]> => {
  const response = await axios.get<GithubReleaseRaw[]>(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`);
  const result = response.data.filter((release) => !release.draft);

  githubReleases = result;
  return result;
};

const findAssetById = async (releaseId: number, assetId: number) => {
  const release = githubReleases?.find((item) => item.id === releaseId);
  const asset = release?.assets.find((item) => item.id === assetId);

  // 저장된 Releases에 Asset이 있으면 리턴
  if (asset) return asset;

  // 없으면 새로 호출
  const refreshed = await fetchGithubReleases();
  const refreshedRelease = refreshed.find((item) => item.id === releaseId);
  return refreshedRelease?.assets.find((item) => item.id === assetId) ?? null;
};

// Release에 등록된 exe/dmg 파일 설치
const downloadReleaseAssetById = async ({ releaseId, assetId }: AppUpdateDownloadRequest): Promise<AppUpdateDownloadResult> => {
  const targetAsset = await findAssetById(releaseId, assetId);

  if (!targetAsset) return { ok: false, reason: '선택한 Asset를 찾을 수 없습니다.' };

  const targetPath = await resolveDownloadPath(targetAsset.name);

  try {
    const response = await axios.get(targetAsset.browser_download_url, { responseType: 'stream' });

    await pipeline(response.data, fs.createWriteStream(targetPath));

    log.info('App update asset downloaded', { releaseId, assetId, targetPath });
    return { ok: true, filePath: targetPath };
  } catch (error) {
    await promises.rm(targetPath, { force: true });
    log.error('Failed to download app update asset', error);

    return { ok: false, reason: getErrorMessage(error) };
  }
};

// electron-updater는 신규 버전 설치 파일을 자동으로 다운로드 함
// 하지만 autoInstallOnAppQuit false인 경우 자동 업데이트 되지 않도록 설정 가능
const setupAutoUpdater = () => {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.forceDevUpdateConfig = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('##### 업데이트 확인 중...');
    log.info('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('##### 신규 버전 확인:', info.version);
    log.info('Update available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('##### 신규 버전 없음. 현재 최신 버전:', info.version);
    log.info('Update not available', info);
  });

  autoUpdater.on('error', (error) => {
    console.log('##### 업데이트 확인 에러:', error);
    log.error('Auto update error', error);
  });
};

const checkForAppUpdates = async () => {
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.log('##### checkForUpdates 호출 실패:', error);
    log.error('Failed to run checkForUpdates', error);
  }
};

export const registerUpdateHandlers = () => {
  setupAutoUpdater();

  ipcMain.removeHandler('cafeteria-update:get-releases');
  ipcMain.removeHandler('cafeteria-update:download-asset');

  ipcMain.handle('cafeteria-update:get-releases', async () => {
    const releases = await fetchGithubReleases();
    return releases.map(normalizeRelease);
  });

  ipcMain.handle('cafeteria-update:download-asset', async (_, payload: AppUpdateDownloadRequest) => {
    return await downloadReleaseAssetById(payload);
  });

  return { checkForAppUpdates };
};
