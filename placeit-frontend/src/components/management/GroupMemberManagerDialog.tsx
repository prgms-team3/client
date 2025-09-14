'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X as XIcon,
  Search,
  UserPlus,
  UserMinus,
  UserCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  fetchGroupMembers,
  removeGroupMember,
  type ApiGroupMember,
} from '@/services/groupMembers';

export type GroupMemberRole = 'LEADER' | 'MEMBER';

export type GroupMember = {
  id: string | number; // user.id
  name: string; // user.name
  subtitle?: string; // user.email 등
  role: GroupMemberRole; // LEADER/MEMBER (ADMIN은 LEADER로 표기)
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  groupName: string;
  groupId: string | number;
  /** 외부에서 목록을 완전히 제어하려면 members 전달(없으면 내부 fetch) */
  members?: GroupMember[];
  searchPlaceholder?: string;
  /** 제거시 부모도 뭔가 처리할 수 있도록 훅 제공(선택) */
  onRemove?: (memberId: GroupMember['id']) => Promise<void> | void;
  onAddClick?: () => void;
};

export default function GroupMemberManagerDialog({
  open,
  onOpenChange,
  groupName,
  groupId,
  members,
  onRemove,
  onAddClick,
  searchPlaceholder = '멤버 검색…',
}: Props) {
  // ---- 내부 상태: API로 불러온 멤버 (members prop 없을 때만 사용) ----
  const [fetched, setFetched] = React.useState<GroupMember[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // open & members 미지정일 때만 fetch
  React.useEffect(() => {
    if (!open) return;
    if (Array.isArray(members)) return; // 외부에서 주면 패스

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
          id: m.user.id,
          name: m.user.name,
          subtitle: m.user.email,
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

  // ---- 검색어 상태 ----
  const [q, setQ] = React.useState('');
  React.useEffect(() => {
    if (!open) setQ('');
  }, [open]);

  // ---- 최종 표시할 멤버 소스 결정 (외부 props 우선) ----
  const source: GroupMember[] = members ?? fetched;

  // ---- 검색 필터 ----
  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return source;
    return source.filter(m => {
      const hay = `${m.name} ${m.subtitle ?? ''} ${
        m.role === 'LEADER' ? '리더' : '멤버'
      }`.toLowerCase();
      return hay.includes(query);
    });
  }, [source, q]);

  // ---- 제거 핸들러(낙관적 업데이트 + 실패 시 롤백) ----
  const handleRemoveClick = async (memberId: GroupMember['id']) => {
    // 외부 members를 쓰는 경우엔 부모가 완전 제어하므로 내부 상태 변경 대신 콜백만
    if (Array.isArray(members)) {
      await onRemove?.(memberId);
      return;
    }

    // 내부(fetched) 상태를 쓰는 경우엔 여기서 API 호출 + 낙관적 업데이트
    const snapshot = fetched;
    const next = fetched.filter(m => m.id !== memberId);
    setFetched(next);
    try {
      // 부모 훅이 있으면 먼저 실행
      await onRemove?.(memberId);
      // 서비스 API 호출
      await removeGroupMember(groupId, memberId);
    } catch (e) {
      // 실패 시 롤백
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
                    {/* 좌측: 아바타 + 이름/서브타이틀 */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                        <UserCircle2 className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {m.name}
                          </p>
                          {m.role === 'LEADER' ? (
                            <Badge className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.1">
                              리더
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-gray-600 text-xs px-1.5 py-0.1"
                            >
                              멤버
                            </Badge>
                          )}
                        </div>
                        {m.subtitle ? (
                          <p className="truncate text-xs text-gray-500">
                            {m.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* 우측: 제거 버튼 */}
                    <div className="shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700"
                        title="제거"
                        onClick={() => handleRemoveClick(m.id)}
                      >
                        <UserMinus className="mr-1 h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 하단 액션 */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline">닫기</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
