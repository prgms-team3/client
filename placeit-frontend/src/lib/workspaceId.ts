import { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

/** 동기적으로 현재 워크스페이스 ID를 반환 (없을 수 있음) */
export function getActiveWorkspaceIdSync(): number | null {
  const id = useWorkspaceStore.getState().currentId;
  return id != null ? Number(id) : null;
}

/**
 * 비동기 보장형: 없으면 내부적으로 refreshIfStale()를 1회 시도하고
 * 그래도 없으면 에러를 던짐.
 */
export async function ensureActiveWorkspaceId(): Promise<number> {
  const store = useWorkspaceStore.getState();

  if (store.currentId != null) return Number(store.currentId);

  // 바인딩(ownerKey)이 되어있는 상황이라면 최신 목록을 가져와 currentId 자동 세팅 유도
  // (store 구현상 refreshIfStale() 호출 시 list 채우고 currentId 미설정이면 첫 번째로 세팅됨)
  await store.refreshIfStale?.();

  const after = useWorkspaceStore.getState().currentId;
  if (after == null) {
    throw new Error('NO_ACTIVE_WORKSPACE');
  }
  return Number(after);
}

/**
 * React 컴포넌트에서 쓰기 위한 훅:
 * - 현재 ID를 number | null 로 반환
 * - 옵션에 따라 currentId가 없을 때 refreshIfStale()를 알아서 1회 시도
 */
export function useActiveWorkspaceId(opts: { autofetch?: boolean } = {}) {
  const { autofetch = true } = opts;
  const currentId = useWorkspaceStore(s => s.currentId);
  const refreshIfStale = useWorkspaceStore(s => s.refreshIfStale);

  useEffect(() => {
    if (!autofetch) return;
    if (currentId == null) {
      // ownerKey가 바인딩되어 있다면 내부에서 리스트/아이디를 세팅해줄 것
      refreshIfStale?.().catch(() => {});
    }
  }, [autofetch, currentId, refreshIfStale]);

  return currentId != null ? Number(currentId) : null;
}

/** 방어적 변환기: undefined/null/NaN 모두 걸러냄 */
export function toWsId(input: unknown): number | null {
  const n = Number(input);
  return Number.isFinite(n) ? n : null;
}
