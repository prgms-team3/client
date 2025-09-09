import { api } from '@/lib/axios';

// 로그아웃
export async function signout(): Promise<void> {
  await api.post('/auth/signout', null, { withCredentials: true });
}
