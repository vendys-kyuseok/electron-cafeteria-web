/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback, useRef } from 'react';

export const useElectron = () => {
  const ipc = window.ipcRenderer;

  // ### invoke: 메인 프로세스에 요청 후 응답 대기 (Promise)
  const invoke = useCallback(
    async <T>(channel: string, ...args: any[]): Promise<T> => {
      return await ipc.invoke(channel, ...args);
    },
    [ipc]
  );

  // ### send: 메인 프로세스에 이벤트 실행
  const send = useCallback(
    (channel: string, ...args: any[]) => {
      ipc.send(channel, ...args);
    },
    [ipc]
  );

  // ### Electron으로 부터 응답이 오길 기다림
  const useIpcListener = (channel: string, callback: (event: any, ...args: any[]) => void) => {
    const callbackRef = useRef(callback);

    useEffect(() => {
      callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
      // 리스너 등록
      const listener = (event: any, ...args: any[]) => {
        callbackRef.current(event, ...args);
      };
      ipc.on(channel, listener);

      // 컴포넌트 언마운트 시 리스너 제거
      return () => {
        ipc.off(channel, listener);
      };
    }, [channel, ipc]);
  };

  return { invoke, send, useIpcListener };
};
