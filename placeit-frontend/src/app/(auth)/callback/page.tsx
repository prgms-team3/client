'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { api } from '@/lib/axios';

export default function CallbackPage() {
  const router = useRouter();
  const { setAuth } = useUserStore(); // zustand에서 토큰/유저정보 저장용 함수

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // 1. 쿼리스트링에서 accessToken 추출
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');

        if (!accessToken) {
          throw new Error('Access token not found in callback URL');
        }

        // 2. localStorage 등에 저장 (refreshToken은 httpOnly 쿠키로 이미 세팅됨)
        localStorage.setItem('accessToken', accessToken);

        // 3. 유저 정보 가져오기 (ex: /auth/me)
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const user = res.data;

        // zustand store 업데이트
        setAuth({
          user,
          accessToken,
        });

        // 4. 로그인 성공 → 대시보드로 이동
        router.replace('/invite-check');
      } catch (err) {
        console.error('로그인 처리 중 오류 발생:', err);
        router.replace('/login'); // 실패 시 로그인 페이지로 보냄
      }
    };

    handleAuth();
  }, [router, setAuth]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>로그인 처리 중입니다...</p>
    </div>
  );
}
