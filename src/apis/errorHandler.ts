/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from 'axios';
import { storeClient } from '@apis/apiClients';
import { refreshAuthToken } from '@apis/auth';
import { setLocalStorage, clearByLogout } from '@utils/storageUtils';

export interface IErrorResponseData {
  error: { message: string };
  status: number;
}

// -2302 : 인증정보 없음
// -2303 : 인증정보 만료
// -2304 : 토큰정보가 없음
// -2306 : 토큰시간초과
const AUTH_ERROR_CODES = [-2302, -2303, -2304];

let isRefreshing: boolean = false; // 토큰 갱신 중인지 확인하는 플래그
let failedQueue: any[] = []; // 대기 중인 요청들을 담는 배열

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

export const errorHandler = async (error: AxiosError<IErrorResponseData>) => {
  if (error?.response?.data) {
    const errorData = error?.response?.data;
    const originalRequest = error?.config;
    console.log('##### Error Message:', errorData?.error?.message);

    if (errorData.status === -2306) {
      // 토큰 갱신 요청 중복 방지
      if (isRefreshing) {
        // 갱신 중이면 대기열에 넣고, 완료 시 재요청
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest?.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return storeClient(originalRequest);
          }
        });
      }

      // 토큰 갱신 요청 중복 방지
      isRefreshing = true;

      // 토큰 만료 시 토큰 재호출
      const oauth = await refreshAuthToken().catch((refreshError) => {
        processQueue(refreshError, null);
        clearByLogout();
        window.location.href = '/';
      });
      setLocalStorage('oauth', {
        access_token: oauth?.access_token,
        refresh_token: oauth?.refresh_token
      });

      storeClient.defaults.headers.common['Authorization'] = `Bearer ${oauth?.access_token}`;
      processQueue(null, oauth?.access_token); // 대기열 실행

      // 실패했던 원래 요청 재시도
      if (originalRequest) {
        isRefreshing = false;
        originalRequest.headers.Authorization = `Bearer ${oauth?.access_token}`;
        return storeClient(originalRequest);
      }
    } else if (AUTH_ERROR_CODES.indexOf(errorData.status) > -1) {
      clearByLogout();
      alert('재로그인이 필요합니다. 로그인 화면으로 돌아갑니다.');
      window.location.href = '/';
      return Promise.reject(error);
    }
  }
  return Promise.reject(error);
};
