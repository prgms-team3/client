// src/stores/userStore.ts
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
  name: string; // 필수
  email: string; // 필수
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
  updateUser: (patch: Partial<User>) => void;
  setAccessToken: (t: string | null) => void;
  createWorkspace: (payload: CreateWorkspace) => Promise<void>;
  joinWorkspace: (code: string) => Promise<void>;
  reset: () => void;
}

/** undefined 값을 제거해 병합 시 필수 필드가 'string | undefined'로 오염되는 걸 막는다 */
function stripUndefined<T extends object>(obj: Partial<T>): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/** user가 null이더라도 필수 필드가 비지 않도록 기본값을 만든다 */
function baseUser(role: User['role']): User {
  return {
    name: '사용자',
    email: '',
    role,
    isWorkspaceOwner: role === 'admin' ? true : false,
  };
}

/** 들어오는 User를 안전하게 정규화(필수 필드 보장) */
function normalizeUser(u: User): User {
  return {
    ...u,
    name: u.name ?? '',
    email: u.email ?? '',
    role: u.role ?? 'user',
  };
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      /** 전체 교체. null 허용. User일 때는 필수 필드를 보정 */
      setUser: u =>
        set({
          user: u ? normalizeUser(u) : null,
        }),

      /** 부분 업데이트. undefined는 무시하고 안전하게 병합 */
      updateUser: patch =>
        set(state => {
          const current = state.user ?? baseUser('user');
          const safePatch = stripUndefined<User>(patch);
          const merged = { ...current, ...safePatch };
          return { user: normalizeUser(merged) };
        }),

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
          const base = state.user ?? baseUser('admin');
          return {
            user: normalizeUser({
              ...base,
              role: 'admin',
              isWorkspaceOwner: true,
              workspaceId: newId,
            }),
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

        // 3) 합류할 워크스페이스 id 결정
        let newId: string | undefined;
        if (resp?.workspace?.id != null) newId = String(resp.workspace.id);
        else if (resp?.id != null) newId = String(resp.id);
        else if (visible[0]?.id != null) newId = String(visible[0].id);

        // 4) 상태 갱신
        set(state => {
          const base = state.user ?? baseUser('user');
          return {
            user: normalizeUser({
              ...base,
              role: 'user',
              isWorkspaceOwner: false,
              workspaceId: newId, // undefined면 온보딩 가드가 처리
            }),
          };
        });
      },

      reset: () => set({ user: null, accessToken: null }),
    }),
    { name: 'user-storage' }
  )
);
