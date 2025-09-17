// stores/workspaceStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchMyWorkspaces } from '@/services/workspaces';

/** 서버 응답의 최소 형태(우리가 쓰는 필드만) */
type RawWorkspace = {
  id: number | string;
  name: string;
  deleted?: boolean;
  activeInvitationCode?: string | null;
  userRole?: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' | string;
};

/** 헤더/대시보드 등에서 쓰는 가벼운 형태 */
export type WorkspaceLite = {
  id: string; // 항상 문자열로 통일
  name: string;
  userRole?: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
  activeInvitationCode?: string | null;
};

interface WorkspaceState {
  /** 사용자/환경에 묶기 위한 키 (예: u:1|https://api...) */
  ownerKey: string | null;

  /** 현재 선택된 워크스페이스 id(문자열) */
  currentId: string | null;

  /** 워크스페이스 목록(정규화된 가벼운 형태) */
  list: WorkspaceLite[];

  /** 마지막으로 목록을 가져온 시각(ms) */
  lastFetched: number | null;

  // actions
  bindToUser: (ownerKey: string | null) => void;

  setCurrent: (id: string | number | null) => void;
  setList: (list: WorkspaceLite[]) => void;

  /** 오래됐으면 갱신 (기본 5분) */
  refreshIfStale: (opts?: {
    staleTime?: number;
    signal?: AbortSignal;
  }) => Promise<void>;

  /** 강제 새로고침 */
  hardRefresh: (signal?: AbortSignal) => Promise<void>;
}

/* -------------------- helpers -------------------- */

function extractWorkspaces(input: unknown): RawWorkspace[] {
  // 응답이 { workspaces: [...] } 또는 그냥 배열 둘 다 대응
  if (Array.isArray(input)) return input as RawWorkspace[];
  if (input && typeof input === 'object') {
    const maybe = input as { workspaces?: unknown };
    if (Array.isArray(maybe.workspaces))
      return maybe.workspaces as RawWorkspace[];
  }
  return [];
}

function normalizeLite(ws: RawWorkspace): WorkspaceLite {
  return {
    id: String(ws.id),
    name: ws.name ?? '',
    userRole: (ws.userRole as any) ?? undefined,
    activeInvitationCode: ws.activeInvitationCode ?? null,
  };
}

/** 서버에서 목록을 불러와 가벼운 형태로 정규화 */
async function loadMyWorkspaces(): Promise<WorkspaceLite[]> {
  const raw = await fetchMyWorkspaces();
  const arr = extractWorkspaces(raw).filter(w => !w.deleted); // 삭제된 항목 제외(있다면)
  return arr.map(normalizeLite);
}

/* -------------------- store -------------------- */

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      ownerKey: null,
      currentId: null,
      list: [],
      lastFetched: null,

      bindToUser: (ownerKey: string | null) => {
        const prev = get().ownerKey;
        if (prev !== ownerKey) {
          // 다른 사용자/환경으로 전환되면 목록과 선택값 초기화
          set({
            ownerKey,
            list: [],
            currentId: null,
            lastFetched: null,
          });
        }
      },

      setCurrent: (id: string | number | null) =>
        set({ currentId: id == null ? null : String(id) }),

      setList: (list: WorkspaceLite[]) => set({ list }),

      refreshIfStale: async opts => {
        const staleTime = opts?.staleTime ?? 5 * 60 * 1000; // 5분
        const last = get().lastFetched ?? 0;
        const now = Date.now();

        if (get().list.length > 0 && now - last < staleTime) return;

        const list = await loadMyWorkspaces();
        set(state => {
          // currentId가 없으면 첫 번째로 기본 선택
          const nextCurrent =
            state.currentId && list.some(w => w.id === state.currentId)
              ? state.currentId
              : list[0]?.id ?? null;
          return { list, currentId: nextCurrent, lastFetched: now };
        });
      },

      hardRefresh: async (_signal?: AbortSignal) => {
        const list = await loadMyWorkspaces();
        set(state => {
          const nextCurrent =
            state.currentId && list.some(w => w.id === state.currentId)
              ? state.currentId
              : list[0]?.id ?? null;
          return { list, currentId: nextCurrent, lastFetched: Date.now() };
        });
      },
    }),
    {
      name: 'workspace-storage',
      // ownerKey가 바뀌어도 다른 유저 데이터가 섞이지 않도록
      partialize: state => ({
        ownerKey: state.ownerKey,
        currentId: state.currentId,
        list: state.list,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
