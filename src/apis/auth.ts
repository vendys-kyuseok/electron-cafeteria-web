/* eslint-disable @typescript-eslint/no-explicit-any */
import { authClient, storeClient } from 'apis/apiClients';
import { getAuthToken as getRefreshAuthToken } from '@utils/storageUtils';

export const createAuthToken = async (params: any) => {
  const { data } = await authClient.post('/oauth2/token', {
    client_id: import.meta.env.VITE_APP_CLIENT_ID,
    client_secret: import.meta.env.VITE_APP_CLIENT_SECRET,
    grant_type: import.meta.env.VITE_APP_GRANT_TYPE,
    username: params?.username,
    password: params?.password
  });
  return data;
};

export const refreshAuthToken = async () => {
  const oauth = getRefreshAuthToken();
  const { data } = await authClient.post('/oauth2/token', {
    client_id: import.meta.env.VITE_APP_CLIENT_ID,
    client_secret: import.meta.env.VITE_APP_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: oauth.refresh_token
  });
  return data;
};

export const getCafeteriaMe = async () => {
  const { data } = await storeClient.get('/cafeteria/v1/me');
  return data;
};
