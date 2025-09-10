'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore(state => state.setUser);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const code = searchParams.get('code');

        if (accessToken) {
          // 백엔드에서 처리 완료된 토큰을 받은 경우 (직접 토큰 전달 방식)
          // 공통 콜백 페이지로 리다이렉트
          router.replace(`/callback?accessToken=${accessToken}`);
        } else if (code) {
          // 구글에서 인증 코드를 받은 경우 -> 백엔드로 전달하여 토큰 교환
          redirectToBackendForTokenExchange(code);
        } else {
          // 에러 파라미터 확인
          const error = searchParams.get('error');
          if (error) {
            console.error('구글 인증 에러:', error);
            router.replace('/login?error=google_auth_failed');
          } else {
            router.replace('/login?error=invalid_callback');
          }
        }
      } catch (error) {
        console.error('구글 로그인 처리 중 오류 발생:', error);
        router.replace('/login?error=callback_failed');
      }
    };

    const redirectToBackendForTokenExchange = (code: string) => {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
      if (!apiBase) {
        console.error('API Base URL이 설정되지 않았습니다.');
        router.replace('/login?error=config_error');
        return;
      }
      const url = new URL('/auth/google/callback', apiBase);
      url.searchParams.set('code', code);
      url.searchParams.set(
        'redirectUri',
        new URL('/callback', window.location.origin).toString()
      );
      window.location.href = url.toString();
    };

    handleCallback();
  }, [router, searchParams, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">구글 로그인 처리 중입니다...</p>
        <p className="text-sm text-gray-400 mt-2">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
