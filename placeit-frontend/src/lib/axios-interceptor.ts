import { api } from './axios';
import { useUserStore } from '@/stores/userStore';

let isRefreshing = false;
let queue: Array<(t: string | null) => void> = [];

const processQueue = (newToken: string | null) => {
  queue.forEach(cb => cb(newToken));
  queue = [];
};

api.interceptors.request.use(config => {
  const token = useUserStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // 갱신 기다리기
        return new Promise(resolve => {
          queue.push(newToken => {
            if (newToken) original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          });
        });
      }
      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh'); // 서버가 쿠키로 판별
        const newToken = data?.accessToken as string | undefined;
        useUserStore.getState().setAccessToken(newToken || null);
        processQueue(newToken || null);
        if (newToken) original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        processQueue(null);
        useUserStore.getState().reset();
        // 로그인 페이지로 이동 등
        if (typeof window !== 'undefined')
          window.location.href = '/login?expired=1';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
