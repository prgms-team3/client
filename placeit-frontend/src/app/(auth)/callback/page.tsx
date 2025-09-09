'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios';
import { useUserStore } from '@/stores/userStore';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore(state => state.setUser);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');

        if (!accessToken) {
          router.replace('/login?error=missing_token');
          return;
        }

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
      } catch (error) {
        console.error('로그인 처리 중 오류 발생:', error);
        localStorage.removeItem('accessToken');
        router.replace('/login?error=login_failed');
      }
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

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
