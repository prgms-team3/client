'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/axios';
import { useUserStore } from '@/stores/userStore';

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore(state => state.setUser);
  const setAccessToken = useUserStore(state => state.setAccessToken);

  // 작은 유틸
  type MaybeDeleted = { deleted?: boolean } & { id?: number | string };
  const toList = (input: unknown): MaybeDeleted[] => {
    if (Array.isArray(input)) return input as MaybeDeleted[];
    if (
      input &&
      typeof input === 'object' &&
      Array.isArray((input as { workspaces?: unknown }).workspaces)
    ) {
      return (input as { workspaces: MaybeDeleted[] }).workspaces;
    }
    return [];
  };

  const getMsg = (err: unknown): string => {
    if (typeof err === 'object' && err !== null) {
      const anyErr = err as {
        message?: unknown;
        response?: { data?: { message?: unknown } };
      };
      if (typeof anyErr?.response?.data?.message === 'string')
        return anyErr.response.data.message;
      if (typeof anyErr?.message === 'string') return anyErr.message;
    }
    return '로그인 처리 중 오류가 발생했습니다.';
  };

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
      } catch (error: unknown) {
        console.error('카카오 로그인 처리 중 오류 발생:', error);
        router.replace('/login?error=callback_failed');
      }
    };

    const redirectToBackendForTokenExchange = (code: string) => {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
      if (!apiBase) throw new Error('API Base URL 미설정');

      const url = new URL('/auth/kakao/callback', apiBase);
      url.searchParams.set('code', code);
      // 최종 귀착지는 프론트의 /callback
      url.searchParams.set(
        'redirectUri',
        new URL('/callback', window.location.origin).toString()
      );

      window.location.href = url.toString();
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

      // 상태 업데이트 (토큰/유저)
      setAccessToken(accessToken);
      setUser(response.data);

      // URL 정리 및 홈으로 리다이렉트
      try {
        const wsRes = await api.get('/workspaces/my', {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });

        const arr = toList(wsRes.data);
        const visible = arr.filter(w => !w.deleted);
        const to = visible.length > 0 ? '/dashboard' : '/invite-check';

        window.history.replaceState({}, '', '/');
        router.replace(to);
      } catch (e: unknown) {
        console.warn('워크스페이스 조회 실패:', getMsg(e));
        // 실패 시 온보딩으로
        window.history.replaceState({}, '', '/');
        router.replace('/invite-check');
      }
    };

    handleCallback();
  }, [router, searchParams, setUser, setAccessToken]);

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
