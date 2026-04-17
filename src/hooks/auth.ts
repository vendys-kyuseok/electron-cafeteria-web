/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { enqueueSnackbar } from 'notistack';

import { createAuthToken, getCafeteriaMe } from '@apis/auth';
import { IErrorResponseData } from '@apis/errorHandler';
import { useQuery, useMutation } from '@tanstack/react-query';
import { setLocalStorage, getAuthToken, clearByLogout } from '@utils/storageUtils';

export interface OAuth {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  ver: number;
}

export interface ICafeteria {
  storeId: string;
  storeName: string;
  id: string;
  supplyType: number;
  ticketType: string;
}

export const useAuth = () => {
  const navigate = useNavigate();

  const { mutateAsync: login } = useMutation<OAuth, AxiosError<IErrorResponseData>, Record<string, string> | undefined, unknown>({
    mutationKey: ['createAuthToken'],
    mutationFn: createAuthToken,
    onSuccess: (result, variables) => {
      console.log('### 요청 성공:', result, variables);

      setLocalStorage('userId', variables?.username);
      setLocalStorage('oauth', {
        access_token: result?.access_token,
        refresh_token: result?.refresh_token
      });
      navigate('/', { replace: true });
    },
    onError: (error, variables) => {
      console.log('### 요청 실패:', error, variables);
      enqueueSnackbar(error?.response?.data?.error.message, { variant: 'error' });
    }
  });

  const logout = () => {
    clearByLogout();
    navigate('/', { replace: true });
  };

  return { login, logout };
};

// 구내식당 초기 접속 정보
export const useCafeteriaMe = () => {
  return useQuery<ICafeteria, unknown>({
    queryKey: ['getCafeteriaMe'],
    queryFn: getCafeteriaMe,
    // Query Options
    enabled: !!getAuthToken(),
    select: (value) => {
      setLocalStorage('cafeteria', value);
      return value;
    }
  });
};
