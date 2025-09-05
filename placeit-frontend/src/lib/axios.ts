import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // https://placeit-server-...run.app
  withCredentials: true, // 서버 쿠키 전송(리프레시 토큰)
});

// 요청 인터셉터: accessToken 또는 DEV 토큰을 Authorization 헤더에
api.interceptors.request.use(config => {
  // 우선순위: Zustand 저장 토큰 > NEXT_PUBLIC_DEV_ACCESS_TOKEN
  const storeToken = useUserStore.getState?.().accessToken;
  const devToken = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN;

  const token = storeToken || devToken || '';
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
