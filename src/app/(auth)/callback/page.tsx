'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import { useUserStore } from '@/stores/userStore';

export default function CallbackPage() {
  const router = useRouter();
  const { setAuth } = useUserStore();

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        if (!accessToken) throw new Error('accessToken 없음');

        // 1) 토큰 저장
        localStorage.setItem('accessToken', accessToken);

        // 2) 내 정보 가져와서 전역 상태 세팅
        const me = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setAuth({ user: me.data, accessToken });

        // 3) 내 워크스페이스 보유 여부 확인
        const wsRes = await api.get('/workspaces/my', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // 서버 응답이 { workspaces: [...] } 이거나 그냥 배열인 경우 모두 처리
        const list = Array.isArray(wsRes.data)
          ? wsRes.data
          : wsRes.data?.workspaces;

        const hasWorkspace = Array.isArray(list) && list.length > 0;

        // 4) 분기 이동
        router.replace(hasWorkspace ? '/dashboard' : '/invite-check');
      } catch (e) {
        console.error('로그인 처리 중 오류:', e);
        router.replace('/login?error=login_failed');
      }
    })();
  }, [router, setAuth]);

  return (
    <div className="flex h-screen items-center justify-center">
      로그인 처리 중…
    </div>
  );
}
