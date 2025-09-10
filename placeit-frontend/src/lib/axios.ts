import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // refresh_token 쿠키 사용 위해 필수
});

// 요청 인터셉터: accessToken 자동 부착
api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 401 처리용(1회 재시도) 플래그
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

function flushQueue(error: any, token: string | null) {
  pendingQueue.forEach(({ resolve, reject, config }) => {
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
      resolve(api(config));
    } else {
      reject(error);
    }
  });
  pendingQueue = [];
}

// 응답 인터셉터: 401이면 /auth/refresh 호출해 access_token 재발급
api.interceptors.response.use(
  res => res,
  async (error: AxiosError<any>) => {
    const original = error.config!;
    const status = error.response?.status;

    if (status !== 401 || (original as any)._retry) {
      return Promise.reject(error);
    }
    (original as any)._retry = true;

    if (isRefreshing) {
      // 갱신 중이면 큐에 대기 후 재요청
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject, config: original });
      });
    }

    try {
      isRefreshing = true;
      const { data } = await axios.post(
        `${BASE}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const newToken: string | undefined =
        data?.access_token || data?.accessToken || data?.token;

      if (!newToken) throw new Error('No access_token from refresh');

      localStorage.setItem('accessToken', newToken);
      original.headers = original.headers ?? {};
      (original.headers as any).Authorization = `Bearer ${newToken}`;

      flushQueue(null, newToken);
      return api(original);
    } catch (e) {
      flushQueue(e, null);
      // 실패 시 로컬 토큰 제거
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user-storage');
      } catch {}
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
