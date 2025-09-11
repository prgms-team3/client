import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createWorkspace as apiCreateWorkspace,
  joinWorkspaceByCode,
  fetchMyWorkspaces,
} from '@/services/workspaces';
import {
  type CreateWorkspace,
  type Workspace,
  type JoinWorkspaceResponse,
} from '@/types/workspace';

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
  setAuth: (payload: {
    user?: User | null;
    accessToken?: string | null;
  }) => void;
  createWorkspace: (payload: CreateWorkspace) => Promise<void>;
  joinWorkspace: (code: string) => Promise<void>;
  reset: () => void;
}

type MaybeDeletedWorkspace = Workspace & { deleted?: boolean };

function stripUndefined<T extends object>(obj: Partial<T>): Partial<T> {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
}

function baseUser(role: User['role']): User {
  return {
    name: '사용자',
    email: '',
    role,
    isWorkspaceOwner: role === 'admin',
  };
}

function normalizeUser(u: User): User {
  return {
    ...u,
    name: u.name ?? '',
    email: u.email ?? '',
    role: u.role ?? 'user',
  };
}

function extractWorkspaces(input: unknown): MaybeDeletedWorkspace[] {
  if (Array.isArray(input)) {
    return input as MaybeDeletedWorkspace[];
  }
  if (input && typeof input === 'object') {
    const maybe = input as { workspaces?: unknown };
    if (Array.isArray(maybe.workspaces)) {
      return maybe.workspaces as MaybeDeletedWorkspace[];
    }
  }
  return [];
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setUser: u =>
        set({
          user: u ? normalizeUser(u) : null,
        }),

      updateUser: patch =>
        set(state => {
          const current = state.user ?? baseUser('user');
          const safePatch = stripUndefined<User>(patch);
          const merged = { ...current, ...safePatch };
          return { user: normalizeUser(merged) };
        }),

      setAccessToken: t => set({ accessToken: t }),

      setAuth: ({ user, accessToken }) =>
        set(state => {
          // 토큰 localStorage 동기화 (axios 인터셉터가 쓰는 경우 대비)
          try {
            if (typeof window !== 'undefined') {
              if (accessToken != null) {
                localStorage.setItem('accessToken', accessToken);
              } else if (accessToken === null) {
                localStorage.removeItem('accessToken');
              }
            }
          } catch {}

          return {
            user:
              user === undefined
                ? state.user
                : user
                ? normalizeUser(user)
                : null,
            accessToken:
              accessToken === undefined ? state.accessToken : accessToken,
          };
        }),

      // 초대 코드 없을 시, 워크스페이스 생성
      createWorkspace: async (payload: CreateWorkspace) => {
        // 1) 생성 요청
        const resp: Workspace = await apiCreateWorkspace(payload);

        // 2) 응답에서 id 우선 사용
        let newId: string | undefined =
          resp?.id != null ? String(resp.id) : undefined;

        // 3) 못 찾으면 /workspaces/my로 보강
        if (!newId) {
          const list = await fetchMyWorkspaces();
          const arr = extractWorkspaces(list);
          const visible = arr.filter(w => !w.deleted);
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
        const resp: JoinWorkspaceResponse = await joinWorkspaceByCode(
          code.trim()
        );

        // 2) 조인 후 내 워크스페이스 목록 재조회
        const list = await fetchMyWorkspaces();
        const arr = extractWorkspaces(list);
        const visible = arr.filter(w => !w.deleted);

        // 3) 합류할 워크스페이스 id 결정
        let newId: string | undefined;
        if (resp && typeof resp === 'object') {
          const hasNested =
            'workspace' in resp &&
            resp.workspace &&
            typeof resp.workspace === 'object';
          const nestedId =
            hasNested && 'id' in (resp.workspace as Record<string, unknown>)
              ? (resp.workspace as { id?: number | string }).id
              : undefined;
          const flatId =
            'id' in resp ? (resp as { id?: number | string }).id : undefined;

          if (nestedId != null) newId = String(nestedId);
          else if (flatId != null) newId = String(flatId);
        }
        if (!newId && visible[0]?.id != null) {
          newId = String(visible[0].id);
        }

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
