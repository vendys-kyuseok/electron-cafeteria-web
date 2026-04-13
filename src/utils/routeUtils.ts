import { MENU_LIST } from '@layouts/MainLayout';

export const getAppRoutePath = (path: string) => MENU_LIST.filter((route) => route.path === path);

export const getAppRouteName = (path: string) => getAppRoutePath(path)?.[0]?.label;
