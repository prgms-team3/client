import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type AppUser = { id: number; name: string; email: string; role: Role };

type UserState = {
  user: AppUser | null;
  accessToken: string | null;
  setUser: (u: AppUser | null) => void;
  setToken: (t: string | null) => void;
  setAccessToken: (t: string | null) => void;
  reset: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      user: null,
      accessToken: null,
      setUser: u => set({ user: u }),
      setToken: t => set({ accessToken: t }),
      setAccessToken: t => set({ accessToken: t }),
      reset: () => set({ user: null, accessToken: null }),
    }),
    { name: 'user-storage' }
  )
);
