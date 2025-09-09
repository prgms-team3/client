import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department?: string;
  position?: string;
  contact?: string;
  timezone?: string;
  introduction?: string;
  workspaceId?: string;
  isWorkspaceOwner?: boolean;
}

interface UserStore {
  user: User | null;
  accessToken: string | null;
  setUser: (u: User | null) => void;
  setAccessToken: (t: string | null) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    set => ({
      user: null,
      accessToken: null,
      setUser: u => set({ user: u }),
      setAccessToken: t => set({ accessToken: t }),
      reset: () => set({ user: null, accessToken: null }),
    }),
    { name: 'user-storage' }
  )
);
