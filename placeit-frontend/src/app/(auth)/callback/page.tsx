// app/callback/page.tsx (또는 pages/callback.tsx)
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/lib/axios'; // withCredentials/Authorization 붙는 공용 인스턴스

export default function CallbackPage() {
  const router = useRouter();
  const search = useSearchParams();

  React.useEffect(() => {
    (async () => {
      const accessToken = search.get('accessToken');
      if (!accessToken) {
        router.replace('/login?error=missing_token');
        return;
      }

      try {
        // 1) 토큰 저장 (zustand + localStorage)
        const { setToken, setUser } = useUserStore.getState();
        setToken(accessToken);

        // 2) 토큰으로 프로필 조회 (서버에서 role 포함 반환 가정: /auth/me or /users/me)
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // 3) user 세팅을 먼저 끝낸다
        setUser(data.user); // { id, name, role, ... }

        // 4) 그 다음 대시보드로 이동
        router.replace('/dashboard');
      } catch (err) {
        console.error(err);
        router.replace('/login?error=me_fetch_failed');
      }
    })();
  }, [router, search]);

  // 로딩 UI
  return (
    <div className="flex h-[60vh] items-center justify-center text-sm text-neutral-600">
      로그인 처리 중…
    </div>
  );
}
