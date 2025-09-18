'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X as XIcon,
  Search,
  UserMinus,
  UserCircle2,
  Plus,
  UserPlus,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  fetchGroupMembers,
  removeGroupMember,
  type ApiGroupMember,
} from '@/services/groupMembers';
import { api } from '@/lib/axios';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export type GroupMemberRole = 'LEADER' | 'MEMBER';

export type GroupMember = {
  /** membership(관계) id (기존과 호환) */
  id: string | number;
  /** 실제 사용자 id (신규 추가: 이미 멤버 여부 판정용) */
  userId?: string | number;
  name: string;
  subtitle?: string;
  role: GroupMemberRole;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  groupName: string;
  groupId: string | number;
  members?: GroupMember[];
  searchPlaceholder?: string;
  onRemove?: (memberId: GroupMember['id']) => Promise<void> | void;
  /** 새 멤버 추가 성공 시 부모에 알려서 리스트에 반영 */
  onAdded?: (m: GroupMember) => void;
  /** (선택) 이미 그룹에 포함된 userId 집합을 직접 내려줄 수 있음 */
  existingUserIds?: Set<string | number>;
};

/** 워크스페이스 전체 멤버 중에서 '추가'할 대상을 고르는 서브 다이얼로그(POST 연동) */
function AddMembersSubDialog({
  open,
  onOpenChange,
  workspaceId,
  groupId,
  existingUserIds,
  onAddedFromServer,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspaceId?: string | number | null;
  groupId: string | number;
  /** 이미 그룹에 속한 userId 집합(Set) */
  existingUserIds: Set<string | number>;
  /** POST 성공 시 서버 응답으로 변환된 GroupMember를 부모로 전달 */
  onAddedFromServer?: (m: GroupMember) => void;
}) {
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<
    { id: number | string; name: string; email?: string }[]
  >([]);

  // 행별 진행상태(추가 중/완료)
  const [busy, setBusy] = React.useState<Set<number | string>>(new Set());
  const [added, setAdded] = React.useState<Set<number | string>>(new Set());

  React.useEffect(() => {
    if (!open) {
      setQ('');
      setBusy(new Set());
      setAdded(new Set());
      return;
    }
    if (!workspaceId) {
      setRows([]);
      setError('워크스페이스가 선택되지 않았습니다.');
      return;
    }

    let aborted = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // GET /workspaces/{workspaceId}/users
        const { data } = await api.get(`/workspaces/${workspaceId}/users`);
        const mapped = Array.isArray(data)
          ? data.map((w: any) => ({
              id: w?.user?.id ?? w?.userId ?? w?.id,
              name: w?.user?.name ?? '이름 없음',
              email: w?.user?.email ?? '',
            }))
          : [];
        if (!aborted) setRows(mapped);
      } catch (e: any) {
        if (!aborted) {
          const msg =
            e?.response?.data?.message ||
            e?.message ||
            '워크스페이스 멤버를 불러오는 중 오류가 발생했습니다.';
          setError(msg);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [open, workspaceId]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(r =>
      `${r.name} ${r.email ?? ''}`.toLowerCase().includes(query)
    );
  }, [rows, q]);

  const handleAdd = async (u: {
    id: number | string;
    name: string;
    email?: string;
  }) => {
    if (busy.has(u.id) || added.has(u.id)) return;
    setBusy(prev => new Set(prev).add(u.id));
    setError(null);
    try {
      // 실제 POST
      const { data } = await api.post(`/groups/${groupId}/members/${u.id}`);

      // 서버가 돌려준 신규 멤버십 → UI 매핑
      const rel = data?.groupMember ?? data;
      const gm: GroupMember = {
        id: rel?.id ?? `${groupId}-${u.id}`, // membership id
        userId: rel?.user?.id ?? u.id, // 실제 user id
        name: rel?.user?.name ?? u.name ?? '이름 없음',
        subtitle: rel?.user?.email ?? u.email ?? '',
        role:
          String(rel?.role ?? 'MEMBER').toUpperCase() === 'LEADER'
            ? 'LEADER'
            : 'MEMBER',
      };

      setAdded(prev => new Set(prev).add(u.id));
      onAddedFromServer?.(gm);
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        status === 401
          ? '인증 오류(401): accessToken을 확인해주세요.'
          : status === 403
          ? '추가 권한이 없습니다.'
          : status === 409
          ? '이미 그룹에 속한 멤버입니다.'
          : e?.response?.data?.message ||
            e?.message ||
            '멤버 추가 중 오류가 발생했습니다.';
      alert(msg);
    } finally {
      setBusy(prev => {
        const next = new Set(prev);
        next.delete(u.id);
        return next;
      });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[61] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none'
          )}
          aria-describedby={undefined}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              멤버 추가
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="close"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* 검색 */}
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="이름 또는 이메일 검색…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>

          {/* 목록 */}
          <div className="max-h-[420px] overflow-auto rounded-md border border-gray-200">
            {loading ? (
              <div className="py-10 text-center text-sm text-gray-500">
                불러오는 중…
              </div>
            ) : error ? (
              <div className="py-10 px-4 text-center text-sm text-rose-600">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                표시할 멤버가 없습니다.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filtered.map(u => {
                  const isBusy = busy.has(u.id);
                  const isAddedNow = added.has(u.id);
                  const isAlreadyMember = existingUserIds.has(u.id);

                  return (
                    <li
                      key={u.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                          <UserCircle2 className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {u.name}
                          </p>
                          {u.email ? (
                            <p className="truncate text-xs text-gray-500">
                              {u.email}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* 우측 액션 */}
                      <div className="shrink-0">
                        {isAlreadyMember ? (
                          <span className="select-none text-xs text-gray-500">
                            이미 멤버
                          </span>
                        ) : (
                          <Button
                            variant={isAddedNow ? 'secondary' : 'default'}
                            size="sm"
                            className={cn(
                              'gap-1',
                              (isBusy || isAddedNow) && 'opacity-70'
                            )}
                            onClick={() => handleAdd(u)}
                            disabled={isBusy || isAddedNow}
                            title={isAddedNow ? '추가됨' : '추가'}
                          >
                            {isAddedNow ? (
                              <>
                                <Check className="h-4 w-4" />
                                추가됨
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4" />
                                추가
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* 하단: 닫기 */}
          <div className="mt-4 flex items-center justify-end">
            <Dialog.Close asChild>
              <Button variant="outline">닫기</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function GroupMemberManagerDialog({
  open,
  onOpenChange,
  groupName,
  groupId,
  members,
  onRemove,
  searchPlaceholder = '멤버 검색…',
  onAdded,
  existingUserIds,
}: Props) {
  const [fetched, setFetched] = React.useState<GroupMember[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [addOpen, setAddOpen] = React.useState(false);
  const workspaceId = useWorkspaceStore(s => s.currentId);

  // open & members 미지정일 때만 fetch
  React.useEffect(() => {
    if (!open) return;
    if (Array.isArray(members)) return;

    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchGroupMembers(groupId);
        if (aborted) return;

        const mapRole = (r: ApiGroupMember['role']): GroupMemberRole =>
          r === 'LEADER' || r === 'ADMIN' ? 'LEADER' : 'MEMBER';

        const rows: GroupMember[] = list.map(m => ({
          id: m.id ?? m.user?.id, // membership id 우선
          userId: m.user?.id, // 실제 user id
          name: m.user?.name ?? '이름 없음',
          subtitle: m.user?.email ?? '',
          role: mapRole(m.role),
        }));
        setFetched(rows);
      } catch (e: any) {
        if (aborted) return;
        const status = e?.response?.status;
        const msg =
          status === 401
            ? '인증 오류(401). 토큰을 확인하세요.'
            : status === 403
            ? '접근 권한이 없습니다(403).'
            : e?.response?.data?.message ||
              e?.message ||
              '그룹 멤버 조회 중 오류가 발생했습니다.';
        setError(msg);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [open, groupId, members]);

  // 검색상태
  const [q, setQ] = React.useState('');
  React.useEffect(() => {
    if (!open) setQ('');
  }, [open]);

  // 최종 표시 소스
  const source: GroupMember[] = members ?? fetched;

  // 검색 필터
  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return source;
    return source.filter(m => {
      const hay = `${m.name} ${m.subtitle ?? ''}`.toLowerCase();
      return hay.includes(query);
    });
  }, [source, q]);

  // 제거
  const handleRemoveClick = async (memberId: GroupMember['id']) => {
    if (Array.isArray(members)) {
      await onRemove?.(memberId);
      return;
    }
    const snapshot = fetched;
    setFetched(prev => prev.filter(m => m.id !== memberId));
    try {
      await onRemove?.(memberId);
      await removeGroupMember(groupId, memberId);
    } catch (e) {
      setFetched(snapshot);
      const status = (e as any)?.response?.status;
      const msg =
        status === 401
          ? '인증 오류(401).'
          : (e as any)?.response?.data?.message ||
            (e as any)?.message ||
            '멤버 제거 중 오류가 발생했습니다.';
      alert(msg);
    }
  };

  // POST 성공 시 현재 다이얼로그 리스트에도 반영
  const handleAddedFromServer = (m: GroupMember) => {
    onAdded?.(m);
    if (!members) {
      setFetched(prev => {
        // membership id 기준 중복 방지
        if (prev.some(x => String(x.id) === String(m.id))) return prev;
        return [...prev, m];
      });
    }
  };

  // 이미 멤버인 userId 집합
  const computedExistingUserIds = React.useMemo(() => {
    if (existingUserIds) return existingUserIds;
    const set = new Set<string | number>();
    for (const m of source) {
      if (m.userId != null) set.add(m.userId);
    }
    return set;
  }, [existingUserIds, source]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl focus:outline-none'
          )}
          aria-describedby={undefined}
        >
          {/* 헤더 */}
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {groupName} - 멤버 관리
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="close"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* 검색창 */}
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder={searchPlaceholder}
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>

          {/* 로딩/에러/리스트 */}
          <div className="max-h-[360px] overflow-auto rounded-md border border-gray-200">
            {loading ? (
              <div className="py-10 text-center text-sm text-gray-500">
                멤버를 불러오는 중…
              </div>
            ) : error ? (
              <div className="py-10 px-4 text-center text-sm text-rose-600">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                멤버가 없습니다.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filtered.map(m => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                        <UserCircle2 className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {m.name}
                        </p>
                        {m.subtitle ? (
                          <p className="truncate text-xs text-gray-500">
                            {m.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700"
                        title="제거"
                        onClick={() => handleRemoveClick(m.id)}
                      >
                        <UserMinus className="mr-1 h-4 w-4" />
                        제거
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 하단 액션 */}
          <div className="mt-4 flex items-center justify-between">
            <Dialog.Close asChild>
              <Button variant="outline">닫기</Button>
            </Dialog.Close>

            <Button className="gap-2" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              멤버 추가
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* 멤버 추가 */}
      <AddMembersSubDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        workspaceId={workspaceId}
        groupId={groupId}
        existingUserIds={computedExistingUserIds}
        onAddedFromServer={handleAddedFromServer}
      />
    </Dialog.Root>
  );
}
