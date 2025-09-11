import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchMyWorkspaces } from '@/services/workspaces';

export type WorkspaceLite = { id: string; name: string };

interface WorkspaceState {
  /** 현재 스토어가 바인딩된 소유자(유저/환경) 키 */
  ownerKey: string | null;

  /** 현재 선택된 워크스페이스 id (이름은 저장하지 않음) */
  currentId: string | null;

  /** 캐시된 워크스페이스 목록 (현재 소유자 전용) */
  list: WorkspaceLite[];

  /** 마지막 페치 시각(ms) */
  lastFetched: number | null;

  /** 유저/환경이 바뀌면 반드시 호출해 바인딩(키가 다르면 캐시 초기화) */
  bindToUser: (ownerKey: string | null) => void;

  setCurrent: (id: string | number | null) => void;
  setList: (list: WorkspaceLite[]) => void;

  /** 필요할 때만 백그라운드 갱신(깜빡임 없음) */
  refreshIfStale: (opts?: {
    staleTime?: number;
    signal?: AbortSignal;
  }) => Promise<void>;

  /** 강제 새로고침 */
  hardRefresh: (signal?: AbortSignal) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      ownerKey: null,
      currentId: null,
      list: [],
      lastFetched: null,

      bindToUser: nextKey => {
        const { ownerKey } = get();
        if (ownerKey === nextKey) return;

        // 소유자 변경 → 다른 계정/환경이므로 캐시와 선택값 초기화
        set({
          ownerKey: nextKey,
          currentId: null,
          list: [],
          lastFetched: null,
        });
      },

      setCurrent: id => set({ currentId: id === null ? null : String(id) }),
      setList: list => set({ list, lastFetched: Date.now() }),

      refreshIfStale: async ({ staleTime = 1000 * 60 * 5, signal } = {}) => {
        const { ownerKey, lastFetched } = get();
        if (!ownerKey) return; // 누구에게 바인딩된 상태가 아니면 패스

        const freshEnough = lastFetched && Date.now() - lastFetched < staleTime;
        if (freshEnough) return;

        const data = await fetchMyWorkspaces(); // axios signal 미사용해도 무방
        const raw: any[] = Array.isArray(data) ? data : data?.workspaces ?? [];
        const visible = raw
          .filter(w => !w?.deleted)
          .map(w => ({ id: String(w.id), name: w.name })) as WorkspaceLite[];

        if (signal?.aborted) return;

        set({ list: visible, lastFetched: Date.now() });

        const { currentId } = get();
        if (visible.length > 0) {
          const exists = visible.some(w => w.id === currentId);
          if (!exists) set({ currentId: visible[0].id });
        } else {
          set({ currentId: null });
        }
      },

      hardRefresh: async signal => {
        const { ownerKey } = get();
        if (!ownerKey) return;

        const data = await fetchMyWorkspaces();
        const raw: any[] = Array.isArray(data) ? data : data?.workspaces ?? [];
        const visible = raw
          .filter(w => !w?.deleted)
          .map(w => ({ id: String(w.id), name: w.name })) as WorkspaceLite[];

        if (signal?.aborted) return;

        set({ list: visible, lastFetched: Date.now() });

        const { currentId } = get();
        if (visible.length > 0) {
          const exists = visible.some(w => w.id === currentId);
          if (!exists) set({ currentId: visible[0].id });
        } else {
          set({ currentId: null });
        }
      },
    }),
    {
      /** 이전 캐시와 구분되도록 키/버전 갱신 */
      name: 'workspace-storage-v2',
      version: 2,
      migrate: (persisted: any, version) => {
        // v1 → v2로 오면 안전하게 초기화
        if (version < 2) {
          return {
            ownerKey: null,
            currentId: null,
            list: [],
            lastFetched: null,
          } as Partial<WorkspaceState>;
        }
        return persisted as WorkspaceState;
      },
      // 필요하면 serialize/deserialize로 더 강한 분리도 가능
    }
  )
);
