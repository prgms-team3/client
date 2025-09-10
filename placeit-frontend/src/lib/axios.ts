// src/lib/axios.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';
import { useUserStore } from '@/stores/userStore';

type RefreshResponse = { accessToken: string };

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useUserStore.getState().accessToken;
    if (token) {
      // headers를 AxiosHeaders로 보장한 뒤 set 사용
      const headers =
        (config.headers as AxiosHeaders | undefined) ?? new AxiosHeaders();
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

let isRefreshing = false;
type Deferred<T> = { resolve: (v: T) => void; reject: (r?: unknown) => void };
let failedQueue: Array<Deferred<string | null>> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

// 응답 인터셉터
api.interceptors.response.use(
  res => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as RetriableRequestConfig | undefined;
    const status = err.response?.status ?? 0;

    if (!originalRequest) return Promise.reject(err);

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          // 재시도 시에도 AxiosHeaders로 설정
          const headers =
            (originalRequest.headers as AxiosHeaders | undefined) ??
            new AxiosHeaders();
          headers.set('Authorization', `Bearer ${token ?? ''}`);
          originalRequest.headers = headers;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<RefreshResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        useUserStore.getState().setAccessToken(newToken);

        processQueue(null, newToken);

        const headers =
          (originalRequest.headers as AxiosHeaders | undefined) ??
          new AxiosHeaders();
        headers.set('Authorization', `Bearer ${newToken}`);
        originalRequest.headers = headers;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useUserStore.getState().reset();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);
