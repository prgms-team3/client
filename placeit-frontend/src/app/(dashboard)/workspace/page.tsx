'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/management/StatCard';
import SearchFilterBar, {
  type FilterItem,
} from '@/components/management/SearchFilterBar';
import { LayoutGrid, Users, CheckCircle, Ban } from 'lucide-react';
import AddWorkspaceDialog from '@/components/management/AddWorkspaceDialog';
import WorkspaceCard from '@/components/management/WorkspaceCard';
import type { Workspace as ApiWorkspace } from '@/types/workspace';
import {
  fetchMyWorkspaces,
  deleteWorkspace,
  activateWorkspace,
  deactivateWorkspace,
} from '@/services/workspaces';
import { useUserStore } from '@/stores/userStore';

type WSStatus = 'active' | 'inactive';
type WSFilter = 'all' | WSStatus;

type WorkspaceUI = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  inviteCode: string;
  owner: string;
  members: number;
  status: WSStatus;
  canManage: boolean;
};

const FILTERS: FilterItem<WSFilter>[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '활성' },
  { key: 'inactive', label: '비활성' },
];

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1497366216548-37526070297c';

export default function WorkspacesPage() {
  const { user } = useUserStore();
  const myId = user?.id;

  const [q, setQ] = React.useState('');
  const [k, setK] = React.useState<WSFilter>('all');

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [workspaces, setWorkspaces] = React.useState<WorkspaceUI[]>([]);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<WorkspaceUI | null>(null);

  const mapToUI = React.useCallback(
    (api: ApiWorkspace, prev?: WorkspaceUI): WorkspaceUI => {
      // 1) 서버가 내려준 사용자 역할 우선
      const topRole = String((api as any).userRole ?? '').toUpperCase();
      let isMember = topRole ? topRole === 'MEMBER' : false;

      // 2) 없으면 workspaceUsers에서 내 userId로 확인
      if (
        !topRole &&
        myId != null &&
        Array.isArray((api as any).workspaceUsers)
      ) {
        const arr = (api as any).workspaceUsers as any[];
        isMember = arr.some(
          wu =>
            Number(wu?.userId) === Number(myId) &&
            String(wu?.role ?? '').toUpperCase() === 'MEMBER'
        );
      }

      const canManage = !isMember;

      return {
        id: String(api.id ?? prev?.id ?? ''),
        name: api.name ?? prev?.name ?? '',
        description: api.description ?? prev?.description ?? '',
        imageUrl: api.imageUrl ?? prev?.imageUrl ?? FALLBACK_IMG,
        inviteCode:
          (api as any).activeInvitationCode ?? prev?.inviteCode ?? '-',
        owner: (api as any).superAdminName ?? prev?.owner ?? '—',
        members:
          typeof (api as any).userCount === 'number'
            ? (api as any).userCount
            : prev?.members ?? 0,
        status: api.isActive ? 'active' : prev?.status ?? 'inactive',
        canManage,
      };
    },
    [myId]
  );

  // 화면 깜빡임 없이 최신 목록을 가져오는 GET
  const softRefetch = React.useCallback(async () => {
    try {
      const res = await fetchMyWorkspaces();
      const list: ApiWorkspace[] = (res as any).workspaces ?? res ?? [];
      setWorkspaces(prev => {
        const prevMap = new Map(prev.map(p => [p.id, p]));
        const next = list.map(api => mapToUI(api, prevMap.get(String(api.id))));
        return next;
      });
    } catch (e) {
      console.warn('[softRefetch] failed', e);
    }
  }, [mapToUI]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchMyWorkspaces();
        const list: ApiWorkspace[] = (res as any).workspaces ?? res ?? [];
        setWorkspaces(list.map(api => mapToUI(api)));
      } catch (err: any) {
        setError(
          err?.response?.data?.message || err?.message || '불러오기 실패'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [mapToUI]);

  // 통계
  const totalWorkspaces = workspaces.length;
  const totalMembers = workspaces.reduce((sum, w) => sum + w.members, 0);
  const activeWorkspaces = workspaces.filter(w => w.status === 'active').length;
  const deactiveWorkspaces = workspaces.length - activeWorkspaces;

  // 검색/필터
  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    const norm = (s: string) => s.toLowerCase();
    return workspaces.filter(w => {
      const statusOk = k === 'all' ? true : w.status === k;
      const searchOk =
        !query ||
        norm(w.name).includes(query) ||
        norm(w.inviteCode).includes(query) ||
        norm(w.owner).includes(query);
      return statusOk && searchOk;
    });
  }, [workspaces, q, k]);

  // 생성
  const handleCreated = (api: ApiWorkspace) => {
    setWorkspaces(prev => {
      const ui = mapToUI(api);
      return prev.some(p => p.id === ui.id) ? prev : [ui, ...prev];
    });
    softRefetch();
  };

  // 수정
  const handleUpdated = (api: ApiWorkspace) => {
    setWorkspaces(prev =>
      prev.map(w => (w.id === String(api.id) ? mapToUI(api, w) : w))
    );
    setEditOpen(false);
    setEditTarget(null);
    softRefetch();
  };

  const handleEdit = (id: string) => {
    const target = workspaces.find(w => w.id === id);
    if (target) {
      setEditTarget(target);
      setEditOpen(true);
    }
  };

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠어요?')) return;
    const snapshot = workspaces;
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    try {
      await deleteWorkspace(id);
      softRefetch();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || '삭제 실패');
      setWorkspaces(snapshot);
    }
  };

  // 활성/비활성
  const handleToggleStatus = async (id: string, next: WSStatus) => {
    const snapshot = workspaces;
    setWorkspaces(prev =>
      prev.map(w => (w.id === id ? { ...w, status: next } : w))
    );
    try {
      if (next === 'active') await activateWorkspace(id);
      else await deactivateWorkspace(id);
      softRefetch();
    } catch {
      setWorkspaces(snapshot);
    }
  };

  return (
    <MainLayout activePage="workspaces">
      <div className="space-y-6 p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">워크스페이스 관리</h1>
            <p className="text-gray-600">
              워크스페이스를 생성하고 멤버를 초대하여 관리하세요
            </p>
          </div>
          <AddWorkspaceDialog mode="create" onCreated={handleCreated} />
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="전체 워크스페이스"
            value={totalWorkspaces}
            icon={LayoutGrid}
            valueClassName="text-blue-600"
          />
          <StatCard
            label="전체 멤버"
            value={totalMembers}
            icon={Users}
            valueClassName="text-emerald-600"
          />
          <StatCard
            label="활성 워크스페이스"
            value={activeWorkspaces}
            icon={CheckCircle}
            valueClassName="text-purple-600"
          />
          <StatCard
            label="비활성 워크스페이스"
            value={deactiveWorkspaces}
            icon={Ban}
            valueClassName="text-orange-600"
          />
        </div>

        {/* 검색 */}
        <SearchFilterBar<WSFilter>
          placeholder="워크스페이스명, 초대코드, 소유자로 검색…"
          query={q}
          onQueryChange={setQ}
          filters={FILTERS}
          activeKey={k}
          onChange={setK}
          className="mt-2"
        />

        {/* 리스트 */}
        {loading ? (
          <div className="py-12 text-center text-gray-500">불러오는 중…</div>
        ) : error ? (
          <div className="py-12 text-center text-rose-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            표시할 워크스페이스가 없습니다.
          </div>
        ) : (
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
            {filtered.map(w => (
              <WorkspaceCard
                key={w.id}
                {...w}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                canManage={w.canManage}
              />
            ))}
          </div>
        )}

        {/* 수정 다이얼로그 */}
        {editTarget && (
          <AddWorkspaceDialog
            mode="edit"
            open={editOpen}
            onOpenChange={setEditOpen}
            initial={editTarget}
            onUpdated={handleUpdated}
          />
        )}
      </div>
    </MainLayout>
  );
}
