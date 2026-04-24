/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useElectron } from './electron';

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

export type AppUpdateDownloadResult = { ok: true; filePath: string } | { ok: false; reason: string };
export type AppUpdateDownloadState =
  | { status: 'idle' }
  | { status: 'downloading'; assetId: number }
  | { status: 'success'; filePath: string }
  | { status: 'error'; message: string };

export const useAppUpdate = () => {
  const { invoke } = useElectron();
  const [downloadState, setDownloadState] = useState<AppUpdateDownloadState>({ status: 'idle' });

  const query = useQuery<AppUpdateRelease[]>({
    queryKey: ['cafeteria-update-releases'],
    queryFn: async () => await invoke('cafeteria-update:get-releases'),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  const downloadAsset = useCallback(async (releaseId: number, assetId: number) => {
    setDownloadState({ status: 'downloading', assetId });

    const result = await invoke<AppUpdateDownloadResult>('cafeteria-update:download-asset', { releaseId, assetId });

    if (result.ok) {
      setDownloadState({ status: 'success', filePath: result.filePath });
    } else {
      setDownloadState({ status: 'error', message: result.reason });
    }
    return result;
  }, []);

  return {
    releases: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    downloadState,
    downloadAsset
  };
};
