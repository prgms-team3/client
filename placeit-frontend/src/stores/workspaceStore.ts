// src/stores/workspaceStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/axios';

// --- Types -------------------------------------------------------------------
export type Workspace = {
  id: string;
  name: string;
  imageUrl?: string | null;
  isActive?: boolean;
  activeInvitationCode?: string | null;
  userRole?: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' | string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER' | string; // 과거 호환
};

type RefreshOptions = {
  staleTime?: number; // ms
  signal?: AbortSignal;
};

type WorkspaceStore = {
  // 상태
  list: Workspace[];
  ownerKey: string | null;
  currentId: string | null;
  currentIdByOwner: Record<string, string | null>;
  lastFetchedAt: number | null;
  loading: boolean;
  error: string | null;

  // 동작
  bindToUser: (ownerKey: string) => void;
  setCurrent: (id: string) => void;

  refreshIfStale: (opts?: RefreshOptions) => Promise<void>;
  hardRefresh: (signal?: AbortSignal) => Promise<void>;
};

// --- 내부 유틸 ----------------------------------------------------------------
const NAME = 'workspace-storage-v1';

// 서버에서 내 워크스페이스 목록 가져오기
async function fetchMyWorkspaces(signal?: AbortSignal): Promise<Workspace[]> {
  const res = await api.get('/workspaces/my', { signal });
  const arr: Workspace[] = res.data?.workspaces ?? res.data ?? [];
  return arr.map((w: any) => ({ ...w, id: String(w.id) }));
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      // 초기값
      list: [],
      ownerKey: null,
      currentId: null,
      currentIdByOwner: {},
      lastFetchedAt: null,
      loading: false,
      error: null,

      // 오너(유저+BASE) 바인딩: 헤더에서 ownerKey를 계산해 넘겨줌
      bindToUser: (ownerKey: string) => {
        const currMap = get().currentIdByOwner;
        const saved = currMap[ownerKey] ?? null;
        set({ ownerKey, currentId: saved });
      },

      // 선택 변경: 오너키 스코프에 맞춰 저장
      setCurrent: (id: string) => {
        const st = get();
        const key = st.ownerKey ?? 'guest';
        const map = { ...st.currentIdByOwner, [key]: id };
        set({ currentId: id, currentIdByOwner: map });
      },

      // 캐시 유효하면 스킵, 아니면 가져오기
      refreshIfStale: async (opts?: RefreshOptions) => {
        const { staleTime = 1000 * 60 * 5, signal } = opts ?? {};
        const { lastFetchedAt, list } = get();
        const now = Date.now();

        if (lastFetchedAt && now - lastFetchedAt < staleTime && list.length > 0)
          return;

        await get().hardRefresh(signal);
      },

      // 강제 새로고침
      hardRefresh: async (signal?: AbortSignal) => {
        set({ loading: true, error: null });
        try {
          const arr = await fetchMyWorkspaces(signal);
          set({ list: arr, lastFetchedAt: Date.now() });

          const { currentId, ownerKey } = get();
          const exists = currentId && arr.some(w => w.id === currentId);

          if (!exists) {
            const fallback = arr[0]?.id ?? null;
            if (fallback) {
              const key = ownerKey ?? 'guest';
              const map = { ...get().currentIdByOwner, [key]: fallback };
              set({ currentId: fallback, currentIdByOwner: map });
            } else {
              set({ currentId: null });
            }
          }
        } catch (e: any) {
          set({ error: e?.message ?? 'Failed to fetch workspaces' });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: NAME,
      partialize: state => ({
        currentIdByOwner: state.currentIdByOwner,
      }),
      version: 1,
      migrate: (persisted: any, version) => {
        if (version === 0) {
        }
        return persisted;
      },
    }
  )
);
