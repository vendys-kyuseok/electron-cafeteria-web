/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import { errorHandler } from '@apis/errorHandler';
import { getAuthToken } from '@utils/storageUtils';

export const getAuthHost = () => import.meta.env.VITE_APP_AUTH_URL;
export const getStoreHost = () => import.meta.env.VITE_APP_STORE_URL;

export const authClient: AxiosInstance = axios.create({
  baseURL: getAuthHost()
  // headers: { 'X-User-Agent': getApiClientXUserAgent(), 'Content-Type': 'application/json' }
});

authClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    // await errorHandler(error);
    // return Promise.reject(error);
    return await errorHandler(error);
  }
);

export const storeClient: AxiosInstance = axios.create({
  baseURL: getStoreHost(),
  headers: { 'Content-Type': 'application/json' }
});

storeClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    // await errorHandler(error);
    // return Promise.reject(error)
    return await errorHandler(error);
  }
);

storeClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && token.access_token) {
      config.headers.Authorization = `Bearer ${token.access_token}`;
      config.headers['app-installation'] = '';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
