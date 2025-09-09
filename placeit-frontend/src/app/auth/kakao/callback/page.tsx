'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios';
import { useUserStore } from '@/stores/userStore';

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore(state => state.setUser);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const code = searchParams.get('code');

        if (accessToken) {
          // 백엔드에서 처리 완료된 토큰을 받은 경우
          await processLogin(accessToken);
        } else if (code) {
          // 카카오에서 인증 코드를 받은 경우 -> 백엔드로 전달하여 토큰 교환
          redirectToBackendForTokenExchange(code);
        } else {
          // 필수 파라미터가 없는 경우
          router.replace('/login?error=invalid_callback');
        }
      } catch (error) {
        console.error('카카오 로그인 처리 중 오류 발생:', error);
        router.replace('/login?error=callback_failed');
      }
    };

    const redirectToBackendForTokenExchange = (code: string) => {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
        /\/$/,
        ''
      );
      if (!apiBaseUrl) {
        throw new Error('API Base URL이 설정되지 않았습니다.');
      }

      const callbackUrl = `${apiBaseUrl}/auth/kakao/callback?code=${encodeURIComponent(
        code
      )}`;
      window.location.href = callbackUrl;
    };

    const processLogin = async (accessToken: string) => {
      // 토큰 저장
      localStorage.setItem('accessToken', accessToken);

      // 사용자 정보 조회
      const response = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });

      if (!response.data) {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }

      // 사용자 상태 업데이트
      setUser({
        ...response.data,
        accessToken,
      });

      // URL 정리 및 홈으로 리다이렉트
      window.history.replaceState({}, '', '/');
      router.replace('/invite-check');
    };

    handleCallback();
  }, [router, searchParams, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중입니다...</p>
        <p className="text-sm text-gray-400 mt-2">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}

export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <KakaoCallbackContent />
    </Suspense>
  );
}
