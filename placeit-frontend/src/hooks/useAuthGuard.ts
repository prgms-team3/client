'use client';
import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';

export const useAuthGuard = () => {
  const token = useUserStore(s => s.accessToken);
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token, router]);
};
