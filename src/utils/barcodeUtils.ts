import { useEffect, useRef } from 'react';

export const useBarcodeScanner = (callback: (args: string) => Promise<void> | void | undefined) => {
  const bufferRef = useRef<string>('');
  const lastKeyAtRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const normalizeScannerKey = (event: KeyboardEvent): string | null => {
    if (event.isComposing) return null;
    if (event.repeat) return null;

    // 조합키는 전부 무시
    if (event.ctrlKey || event.metaKey || event.altKey) return null;

    // 영문/숫자 외 특수문자는 모두 제거
    if (!/^[a-zA-Z0-9]$/.test(event.key)) return null;

    const isCapsLockOn = event.getModifierState?.('CapsLock') ?? false;
    const isAlphabet = /^[a-zA-Z]$/.test(event.key);

    // CapsLock 일때 바코드 반전
    if (isCapsLockOn && isAlphabet) {
      if (event.key === event.key.toUpperCase()) {
        return event.key.toLowerCase();
      } else {
        return event.key.toUpperCase();
      }
    }
    return event.key;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = normalizeScannerKey(event);
      if (!normalizedKey) return;
      // 이전 타이머가 있다면 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      let waitMs = 250;

      // 데이터 축적
      const now = performance.now();
      const gap = lastKeyAtRef.current === null ? 0 : now - lastKeyAtRef.current;
      lastKeyAtRef.current = now;

      bufferRef.current += normalizedKey;

      // 동적 타임아웃: 빠른 입력은 짧게, 느리면 길게
      waitMs = gap > 0 ? Math.min(250, Math.max(100, gap * 3)) : 200;

      // 새로운 타이머 설정
      // 벤디스 바코드 설정상 끝에 Enter가 없어서 Timeout으로 읽음
      timeoutRef.current = setTimeout(async () => {
        const scanned = bufferRef.current;
        if (!scanned) return;

        bufferRef.current = ''; // 먼저 비워서 다음 스캔과 분리
        lastKeyAtRef.current = null;
        await callback(scanned);
      }, waitMs);
    };

    // LNB 등 다른 곳에 포커스 되도 바코드 읽을 수 있게 window로 받음
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [callback]);
};
