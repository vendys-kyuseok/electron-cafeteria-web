import { storeClient } from 'apis/apiClients';

// 구내식당 메뉴 리스트
export const getCafeteriaMenuList = async (storeId: string) => {
  const { data } = await storeClient.get(`/cafeteria/v1/${storeId}/menu`);
  return data;
};

// 구내식당 매출 내역
export const getCafeteriaSalesHistory = async (storeId: string, params: unknown) => {
  const { data } = await storeClient.get(`/cafeteria/v1/${storeId}/sales`, { params });
  return data;
};

// 구내식당 단말기 캡틴코드 통합 결제
export const paymentCafeteriaBarcode = async (storeId: string, barcode: string, params: unknown) => {
  const randomNumber = Math.floor(Math.random() * 1000000000000000);
  const { data } = await storeClient.put(`/cafeteria/v1/${storeId}/captain-code/${barcode}?tr=${randomNumber}`, params);
  return data;
};

// 구내식당 장부모드 파일 업로드
export const uploadCafeteriaLedgerFile = async (storeId: string) => {
  const { data } = await storeClient.post(`/cafeteria/v1/${storeId}/offline`);
  return data;
};

// 구내식당 클라이언트 연결 체크
export const getCafeteriaHealth = async () => {
  const { data } = await storeClient.get(`/check/v1/health`);
  return data;
};

// 월단위 매출 통계 상세
export const getCafeteriaStats = async (storeId: string, params: unknown) => {
  const { data } = await storeClient.get(`/v1/store/stats/${storeId}/detail`, { params });
  return data;
};
