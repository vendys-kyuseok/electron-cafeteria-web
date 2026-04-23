/* eslint-disable @typescript-eslint/no-unused-vars */
import { IMenuItem } from '@hooks/cafeteria';

const AUTH_TOKEN_STORAGE_KEY = 'oauth';
const LATEST_ERRORS_STORAGE_KEY = 'latestErrors';
const MENUS_STORAGE_KEY = 'menus';
const MENU_DISPLAY_STATE_STORAGE_KEY = 'menuDisplayState';
const SELECTED_MENU_STORAGE_KEY = 'selectedMenu';
const CAFETERIA_STORAGE_KEY = 'cafeteria';

export type LatestErrorLog = {
  useDate: string;
  barcode: string;
  errorContent: string;
};

export const getLocalStorage = (key: string) => {
  const item = localStorage.getItem(key) ?? null;
  return typeof item === 'string' ? JSON.parse(item) : item;
};

export const setLocalStorage = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeLocalStorage = (key: string) => {
  localStorage.removeItem(key);
};

export const clearByLogout = () => {
  removeLocalStorage(AUTH_TOKEN_STORAGE_KEY);
  // removeLocalStorage(MEMU_LIST);
  // removeLocalStorage(MY_INFO);
};

// 토큰 정보
export const getAuthToken = () => getLocalStorage(AUTH_TOKEN_STORAGE_KEY);
// 로그인한 카페테리아 계정 정보
export const getCafeteriaStore = () => getLocalStorage(CAFETERIA_STORAGE_KEY);
// 메뉴 정보
export const getMenus = (): IMenuItem[] => getLocalStorage(MENUS_STORAGE_KEY) ?? [];
// 메뉴 표시 정보
export const getMenuDisplayState = (): IMenuItem[] => getLocalStorage(MENU_DISPLAY_STATE_STORAGE_KEY) ?? [];
// 선택한 메뉴 정보
export const getSelectedMenu = (): IMenuItem => {
  const selectedMenu = getLocalStorage(SELECTED_MENU_STORAGE_KEY);
  const menuDisplayState = getMenuDisplayState();
  const target = menuDisplayState.find((menu) => menu.id === selectedMenu?.id);

  return target || selectedMenu;
};
// 결제 관련 최근 에러 로그 조회
export const getLatestErrors = (): LatestErrorLog[] => getLocalStorage(LATEST_ERRORS_STORAGE_KEY);

// 선택한 메뉴 저장
export const setSelectedMenu = (values: IMenuItem) => setLocalStorage(SELECTED_MENU_STORAGE_KEY, values);
// 메뉴 표시 정보 추가
export const setMenuDisplayState = (values: IMenuItem[]) => setLocalStorage(MENU_DISPLAY_STATE_STORAGE_KEY, values);
// 결제 관련 에러 로그 추가
export const setLatestErrors = (values: LatestErrorLog[]) => setLocalStorage(LATEST_ERRORS_STORAGE_KEY, values);
