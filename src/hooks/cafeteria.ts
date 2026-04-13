/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  getCafeteriaMenuList,
  getCafeteriaSalesHistory,
  paymentCafeteriaBarcode,
  getCafeteriaHealth,
  getCafeteriaStats
} from '@apis/cafeteria';
import { useElectron } from '@hooks/electron';
import { getLocalStorage } from '@utils/storageUtils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';

export type TicketType = 'WON' | 'TICKET';

export interface IMenuItem {
  id: string;
  name: string;
  price: number;
  salesPrice: number;
  // 로컬 표시 정보
  editedMenuName?: string;
  isShowMenuName?: boolean;
  isShowMenuPrice?: boolean;
  ticketType?: TicketType;
}

export interface IMenu {
  menu: IMenuItem[];
}

// API Hooks

export const useGetCafeteriaMenu = () => {
  const cafeteria = getLocalStorage('cafeteria');

  return useQuery<IMenu>({
    queryKey: ['getCafeteriaMenuList'],
    queryFn: () => getCafeteriaMenuList(cafeteria?.storeId),
    enabled: !!cafeteria?.storeId,
    staleTime: 0
  });
};

export const usePaymentCafeteriaBarcode = () => {
  return useMutation({
    mutationKey: ['paymentCafeteriaBarcode'],
    mutationFn: ({ storeId, barcode, params }: { storeId: string; barcode: string; params: unknown }) => {
      return paymentCafeteriaBarcode(storeId, barcode, params);
    }
  });
};

export const useGetCafeteriaHealth = () => {
  return useQuery({
    queryKey: ['getCafeteriaHealth'],
    queryFn: getCafeteriaHealth,
    retry: false,
    refetchOnReconnect: true,
    refetchInterval: (query) => {
      return isAxiosError(query.state.error) || query.state.status === 'error' ? 5000 : false;
    }
  });
};

// 월단위 매출 통계 상세
export type CafeteriaStatsParams = {
  startDate: string;
  endDate: string;
  month: string;
  kind: string; // 'DATE';
  dateKey: string; // 날짜 바뀔 때마다 key 변경
};
export const useGetCafeteriaStats = (storeId: string, params: CafeteriaStatsParams) => {
  return useQuery({
    queryKey: ['getCafeteriaStats', storeId, params.dateKey],
    queryFn: () => getCafeteriaStats(storeId, params),
    enabled: !!storeId && !!params?.startDate && !!params?.endDate,
    staleTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
};

// 구내식당 매출 내역
export type CafeteriaSalesHistoryParams = {
  date: string;
  paging: boolean;
  dateKey: string; // 날짜 바뀔 때마다 key 변경
};
export const useGetCafeteriaSalesHistory = (storeId: string, params: CafeteriaSalesHistoryParams) => {
  return useQuery({
    queryKey: ['getCafeteriaSalesHistory', storeId, params?.dateKey],
    queryFn: () => getCafeteriaSalesHistory(storeId, params),
    enabled: !!storeId && !!params?.date,
    staleTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
};

//
//
//
// 카페테리아 Focus In/Out, OnLine/OffLine 체크
export const useElectronStatusCheck = () => {
  const { useIpcListener } = useElectron(); // Electron Custom Hook
  const [isFocusIn, setIsFocusIn] = useState<boolean>(true);
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(true);

  // 네트워크 상태가 오프라인에서 온라인으로 돌아올 때 자동으로 데이터를 다시 불러옴
  const healthQuery = useGetCafeteriaHealth();
  const isOnLine = isBrowserOnline && healthQuery?.isSuccess;

  // 포커스 관련 이벤트 발생 시 Electron으로 부터 이벤트 응답 받음
  useIpcListener('electron-focus', (_, value) => setIsFocusIn(value));

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isFocusIn, isOnLine };
};
