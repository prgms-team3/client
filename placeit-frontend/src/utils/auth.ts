import { useUserStore } from '@/stores/userStore';

export function performClientLogout(redirectTo: string = '/login') {
  // 1) 사용자 상태 초기화
  try {
    useUserStore.getState().reset?.();
  } catch (e) {}

  // 2) 토큰/스토리지 정리
  try {
    localStorage.removeItem('accessToken'); // access token
    localStorage.removeItem('user-storage'); // zustand
    sessionStorage.clear();
  } catch {}

  // 3) 라우팅
  if (typeof window !== 'undefined') {
    window.location.replace(redirectTo);
  }
}
