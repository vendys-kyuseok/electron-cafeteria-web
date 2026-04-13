import { useEffect, useRef } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

type TQueryEffectsOptions<TData, TError> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onFinally?: (data: TData | undefined, error: TError | null) => void;
};

export const useQueryEffects = <TData, TError>(query: UseQueryResult<TData, TError>, options?: TQueryEffectsOptions<TData, TError>) => {
  const { onSuccess, onError, onFinally } = options || {};

  const prevStateRef = useRef({
    isSuccess: false,
    isError: false,
    data: undefined as TData | undefined,
    error: null as TError | null
  });

  useEffect(() => {
    const { isSuccess, isError, data, error } = query;
    const prevState = prevStateRef.current;

    // 성공 상태 확인 및 콜백 실행
    if (isSuccess && !prevState.isSuccess && onSuccess) {
      onSuccess(data as TData);
    }

    // 에러 상태 확인 및 콜백 실행
    if (isError && !prevState.isError && onError) {
      onError(error as TError);
    }

    // query 종료 시 상태 확인 및 콜백 실행
    if ((isSuccess || isError) && (prevState.isSuccess || prevState.isError) && onFinally) {
      onFinally(data, error);
    }

    prevStateRef.current = { isSuccess, isError, data, error };
  }, [onError, onFinally, onSuccess, query]);

  return query;
};
