'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { api } from '@/lib/axios';
import { useUserStore } from '@/stores/userStore';

async function tryRefreshWithFallback() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const candidates = ['/auth/refresh', '/api/auth/refresh'];
  let lastErr: any;

  for (const path of candidates) {
    const url = `${base}${path}`;
    try {
      console.log('[callback] POST', url);
      const { data } = await axios.post(url, {}, { withCredentials: true });
      return { data, url };
    } catch (e) {
      const err = e as any;
      const status = err?.response?.status;
      const body = err?.response?.data;
      console.error('[callback] refresh failed:', { url, status, body });
      lastErr = e;
    }
  }
  throw lastErr;
}

export default function CallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useUserStore.getState().setAuth;

  useEffect(() => {
    (async () => {
      try {
        // 1) URL에서 access_token 먼저 찾기
        let token =
          params.get('access_token') || params.get('token') || undefined;
        if (
          !token &&
          typeof window !== 'undefined' &&
          window.location.hash.startsWith('#')
        ) {
          const hash = new URLSearchParams(window.location.hash.slice(1));
          token = hash.get('access_token') || hash.get('token') || undefined;
        }

        // 2) 없으면 refresh로 재발급(두 경로 자동 시도)
        if (!token) {
          const { data } = await tryRefreshWithFallback();
          token = data?.access_token || data?.accessToken || data?.token;
        }
        if (!token) throw new Error('No access_token');

        // 3) 토큰 저장
        setAuth({ accessToken: token });

        router.replace('/');
      } catch (e: any) {
        // 에러를 보기 좋게 출력
        const status = e?.response?.status;
        const url = e?.config?.url;
        const body = e?.response?.data;
        console.error('로그인 처리 중 오류:', {
          status,
          url,
          body,
          message: String(e),
        });
        router.replace('/login?error=callback_failed');
      }
    })();
  }, [params, router, setAuth]);

  return <p className="p-8">로그인 처리 중…</p>;
}
