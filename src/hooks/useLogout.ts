'use client';

import { useState, useCallback } from 'react';
import { signout } from '@/services/auth';
import { performClientLogout } from '@/utils/auth';

type Options = {
  redirectTo?: string; // 기본값 '/login'
  onError?: (err: unknown) => void;
  onFinally?: () => void;
};

/** 버튼/메뉴 등에서 손쉽게 쓰는 로그아웃 훅 */
export function useLogout(options: Options = {}) {
  const { redirectTo = '/login', onError, onFinally } = options;
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      // 1) 서버에 로그아웃 요청 (refresh 쿠키 제거)
      await signout();
    } catch (err) {
      // 서버 장애여도 클라 정리는 진행
      onError?.(err);
    } finally {
      // 2) 클라이언트 정리 & 리다이렉트
      performClientLogout(redirectTo);
      onFinally?.();
      setLoading(false);
    }
  }, [loading, redirectTo, onError, onFinally]);

  return { logout, loading };
}
