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

        localStorage.setItem('accessToken', accessToken);

        const me = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setAuth({ user: me.data, accessToken });
        router.replace('/invite-check');
      } catch (e) {
        console.error(e);
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
