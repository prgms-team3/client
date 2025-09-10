import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createWorkspace as apiCreateWorkspace,
  joinWorkspaceByCode,
  fetchMyWorkspaces,
} from '@/services/workspaces';
import { CreateWorkspace } from '@/types/workspace';

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

  // actions
  setUser: (u: User | null) => void;
  setAccessToken: (t: string | null) => void;
  createWorkspace: (payload: CreateWorkspace) => Promise<void>;
  joinWorkspace: (code: string) => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setUser: u => set({ user: u }),
      setAccessToken: t => set({ accessToken: t }),

      // 초대 코드 없을 시, 워크스페이스 생성
      createWorkspace: async (payload: CreateWorkspace) => {
        // 1) 생성 요청
        const resp = await apiCreateWorkspace(payload); // resp: Workspace

        // 2) 응답에서 id 우선 사용
        let newId: string | undefined =
          resp?.id != null ? String(resp.id) : undefined;

        // 3) 못 찾으면 /workspaces/my로 보강
        if (!newId) {
          const list = await fetchMyWorkspaces();
          const arr = Array.isArray((list as any)?.workspaces)
            ? (list as any).workspaces
            : Array.isArray(list)
            ? (list as any)
            : [];
          const visible = arr.filter((w: any) => !w?.deleted);
          if (visible[0]?.id != null) newId = String(visible[0].id);
        }

        // 4) 상태 갱신(소유자)
        set(state => {
          const base: User = state.user ?? {
            name: '사용자',
            email: '',
            role: 'admin',
          };
          return {
            user: {
              ...base,
              role: 'admin',
              isWorkspaceOwner: true,
              workspaceId: newId,
            },
          };
        });
      },

      // 초대코드 합류
      joinWorkspace: async (code: string) => {
        // 1) 서버에 조인 요청
        const resp = await joinWorkspaceByCode(code.trim());

        // 2) 조인 후 내 워크스페이스 목록 재조회
        const list = await fetchMyWorkspaces();
        const raw = (list as any)?.workspaces ?? list ?? [];
        const visible = Array.isArray(raw)
          ? raw.filter((w: any) => !w?.deleted)
          : [];

        // 3) 가장 최근(또는 첫 번째) 워크스페이스 id 추출
        //    서버가 조인 응답에 workspace.id를 주면 우선 사용
        let newId: string | undefined;
        if (resp?.workspace?.id != null) newId = String(resp.workspace.id);
        else if (resp?.id != null) newId = String(resp.id);
        else if (visible[0]?.id != null) newId = String(visible[0].id);

        // 4) 상태 갱신
        set(state => {
          const base: User = state.user ?? {
            name: '사용자',
            email: '',
            role: 'user',
          };
          return {
            user: {
              ...base,
              role: 'user',
              isWorkspaceOwner: false,
              workspaceId: newId, // 못 찾았어도 undefined면 온보딩 가드가 처리
            },
          };
        });
      },

      reset: () => set({ user: null, accessToken: null }),
    }),
    { name: 'user-storage' }
  )
);
