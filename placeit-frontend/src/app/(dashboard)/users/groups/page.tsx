'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/management/StatCard';
import { LayoutGrid, Users, Shield, Building2 } from 'lucide-react';
import SearchFilterBar, {
  type FilterItem,
} from '@/components/management/SearchFilterBar';
import AddGroupDialog, {
  type NewGroup,
} from '@/components/management/AddGroupDialog';
import GroupCard, {
  type GroupCardData,
  type GroupType,
} from '@/components/management/GroupCard';
import { api } from '@/lib/axios';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import GroupMemberManagerDialog, {
  type GroupMember,
} from '@/components/management/GroupMemberManagerDialog';

type GroupFilter = 'all' | GroupType;

const GROUP_FILTERS: FilterItem<GroupFilter>[] = [
  { key: 'all', label: '전체' },
  { key: 'admin', label: '관리자' },
  { key: 'department', label: '부서' },
];

// 이름 기반 타입 추론(서버 타입 없을 때)
function inferGroupType(name?: string): GroupType {
  const n = (name ?? '').toLowerCase();
  if (n.includes('관리자') || n.includes('admin')) return 'admin';
  return 'department';
}

// 서버 ENUM → UI 타입
function mapApiTypeToUiType(t?: string): GroupType {
  if (!t) return 'department';
  return t.toUpperCase() === 'ADMIN' ? 'admin' : 'department';
}

// API 응답 → 카드 데이터 (memberCount 사용)
function mapToCardData(g: any): GroupCardData {
  return {
    id: String(g.id),
    name: g.name,
    type: g?.type ? mapApiTypeToUiType(g.type) : inferGroupType(g.name),
    description: g.description ?? undefined,
    leader: g?.leaderName || undefined,
    membersCount: Number(g.memberCount ?? 0),
    maxMembers: Number(g.maxMembers ?? 0),
    createdAt: g.createdAt
      ? new Date(g.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

// GET /groups/{id}/members 응답 → GroupMember[]
function mapMembers(resp: any[]): GroupMember[] {
  if (!Array.isArray(resp)) return [];
  return resp.map(item => {
    const membershipId = item?.id; // relation id
    const userName = item?.user?.name ?? '이름 없음';
    const email = item?.user?.email ?? '';
    const role =
      (item?.role as string | undefined)?.toUpperCase() === 'LEADER'
        ? 'LEADER'
        : 'MEMBER';

    const m: GroupMember = {
      id: membershipId,
      name: userName,
      subtitle: email,
      role,
    };
    return m;
  });
}

export default function GroupManagementPage() {
  const [q, setQ] = React.useState('');
  const [k, setK] = React.useState<GroupFilter>('all');

  const currentWorkspaceId = useWorkspaceStore(s => s.currentId);

  const [groups, setGroups] = React.useState<GroupCardData[]>([]);
  const [canManageIds, setCanManageIds] = React.useState<Set<string>>(
    () => new Set()
  );

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GroupCardData | null>(null);

  const [memberOpen, setMemberOpen] = React.useState(false);
  const [memberTarget, setMemberTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const [memberList, setMemberList] = React.useState<GroupMember[]>([]);

  // 멤버 관리 열기
  const openMemberManage = async (groupId: string) => {
    const target = groups.find(g => g.id === groupId);
    if (!target) return;

    setMemberTarget({ id: target.id, name: target.name });
    try {
      const { data } = await api.get(`/groups/${groupId}/members`);
      setMemberList(mapMembers(data));
      setMemberOpen(true);
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        status === 401
          ? '인증 오류(401): accessToken을 확인해주세요.'
          : e?.response?.data?.message ||
            e?.message ||
            '멤버 목록을 불러오는 중 오류가 발생했습니다.';
      setError(msg);
      console.error(`GET /groups/${groupId}/members failed:`, e);
      alert(msg);
    }
  };

  // 멤버 제거(낙관적 업데이트 + 실패 롤백)
  const handleRemoveMember = async (memberId: GroupMember['id']) => {
    if (!memberTarget?.id) return;

    const snapshot = memberList;
    setMemberList(prev => prev.filter(m => m.id !== memberId));
    try {
      await api.delete(`/groups/${memberTarget.id}/members/${memberId}`);
    } catch (e: any) {
      setMemberList(snapshot); // 롤백
      const status = e?.response?.status;
      const msg =
        status === 401
          ? '인증 오류(401): accessToken을 확인해주세요.'
          : e?.response?.data?.message ||
            e?.message ||
            '멤버 삭제 중 오류가 발생했습니다.';
      setError(msg);
      console.error(
        `DELETE /groups/${memberTarget.id}/members/${memberId} failed:`,
        e
      );
      alert(msg);
    }
  };

  // 그룹 목록 로드: GET /groups/workspace/{workspaceId}
  React.useEffect(() => {
    let aborted = false;
    (async () => {
      if (!currentWorkspaceId) {
        setGroups([]);
        setCanManageIds(new Set());
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const { data } = await api.get(
          `/groups/workspace/${currentWorkspaceId}`
        );
        const raw: any[] = Array.isArray(data) ? data : [];

        const mapped = raw.map(mapToCardData);

        // 권한 맵 구성: isAdmin(true)인 그룹만 관리 가능
        const nextCanManage = new Set<string>();
        for (const r of raw) {
          // 서버 필드명 오타 대비: isAdmin / idAdmin 둘 다 체크
          const admin = r?.isAdmin ?? r?.idAdmin ?? false;
          if (admin === true) nextCanManage.add(String(r.id));
        }

        if (aborted) return;
        setGroups(mapped);
        setCanManageIds(nextCanManage);
      } catch (e: any) {
        if (aborted) return;
        const status = e?.response?.status;
        const msg =
          status === 401
            ? '인증 오류(401): accessToken을 확인해주세요.'
            : e?.response?.data?.message ||
              e?.message ||
              '그룹 목록을 불러오는 중 오류가 발생했습니다.';
        setError(msg);
        console.error(`GET /groups/workspace/${currentWorkspaceId} failed:`, e);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [currentWorkspaceId]);

  // 상단 요약
  const totalGroups = groups.length;
  const totalMembers = groups.reduce((acc, g) => acc + g.membersCount, 0);
  const adminGroups = groups.filter(g => g.type === 'admin').length;
  const deptGroups = groups.filter(g => g.type === 'department').length;

  // 검색 + 필터
  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return groups.filter(g => {
      const kOk = k === 'all' ? true : g.type === k;
      const qOk =
        !query ||
        g.name.toLowerCase().includes(query) ||
        (g.description ?? '').toLowerCase().includes(query) ||
        (g.leader ?? '').toLowerCase().includes(query);
      return kOk && qOk;
    });
  }, [groups, q, k]);

  // POST /groups
  const handleAddGroup = async (ng: NewGroup) => {
    if (!currentWorkspaceId) {
      const msg = '선택된 워크스페이스가 없습니다.';
      setError(msg);
      alert(msg);
      return;
    }

    try {
      const body = {
        name: ng.name,
        description: ng.description || '',
        workspaceId: Number(currentWorkspaceId),
        maxMembers: Number(ng.maxMembers || 0),
        leaderName: ng.leader || '',
        type: ng.type?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'DEPARTMENT',
      };

      const res = await api.post('/groups', body);
      const createdRaw = res?.data?.group ?? res?.data;

      if (String(createdRaw?.workspaceId) === currentWorkspaceId) {
        const created = mapToCardData(createdRaw);
        setGroups(prev => [created, ...prev]);

        // 보통 생성자는 바로 관리 권한이 있으나,
        // 서버에서 isAdmin을 다음 GET 때만 반영하면 아래 라인은 생략 가능.
        // 여기서는 UX 위해 임시로 권한 부여(원치 않으면 제거)
        setCanManageIds(prev => {
          const next = new Set(prev);
          next.add(String(createdRaw.id));
          return next;
        });
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        status === 401
          ? '인증 오류(401): accessToken을 확인해주세요.'
          : e?.response?.data?.message ||
            e?.message ||
            '그룹 생성 중 오류가 발생했습니다.';
      setError(msg);
      console.error('POST /groups failed:', e);
      alert(msg);
    }
  };

  // 편집 다이얼로그 오픈 (권한 있을 때만 핸들러 전달)
  const handleEdit = (id: string) => {
    const target = groups.find(g => g.id === id);
    if (!target) return;
    setEditing(target);
    setEditOpen(true);
  };

  // PATCH /groups/{id}
  const handleUpdateGroup = async (form: {
    name: string;
    description?: string;
    maxMembers?: number;
    type?: GroupType;
    leader?: string;
  }) => {
    if (!editing) return;
    try {
      const body = {
        name: form.name,
        description: form.description ?? '',
        maxMembers: Number(form.maxMembers ?? 0),
        leaderName: form.leader ?? '',
        type: (form.type?.toUpperCase() === 'ADMIN'
          ? 'ADMIN'
          : 'DEPARTMENT') as 'ADMIN' | 'DEPARTMENT',
      };

      const res = await api.patch(`/groups/${editing.id}`, body);
      const updatedRaw = res?.data?.group ?? res?.data;
      const updated = mapToCardData({
        ...updatedRaw,
        leaderName: updatedRaw?.leaderName ?? body.leaderName,
        type: updatedRaw?.type ?? body.type,
      });

      setGroups(prev => prev.map(g => (g.id === updated.id ? updated : g)));
      setEditOpen(false);
      setEditing(null);
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        status === 401
          ? '인증 오류(401): accessToken을 확인해주세요.'
          : status === 403
          ? '수정 권한이 없습니다.'
          : e?.response?.data?.message ||
            e?.message ||
            '그룹 수정 중 오류가 발생했습니다.';
      setError(msg);
      console.error('PATCH /groups/{id} failed:', e);
      alert(msg);
    }
  };

  // DELETE /groups/{id} (404시 /workspaces/{wid}/groups/{id} 재시도)
  const handleDelete = async (id: string) => {
    if (!id) return;
    const ok = window.confirm('해당 그룹을 삭제할까요?');
    if (!ok) return;

    const trimmedId = String(id).trim();
    const apiId = /^\d+$/.test(trimmedId) ? Number(trimmedId) : trimmedId;

    const snapshot = groups;
    setGroups(prev => prev.filter(g => g.id !== id));

    const doDelete = async () => {
      try {
        await api.delete(`/groups/${apiId}`);
        return true;
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 404 && currentWorkspaceId) {
          try {
            await api.delete(
              `/workspaces/${currentWorkspaceId}/groups/${apiId}`
            );
            return true;
          } catch (e2: any) {
            throw e2;
          }
        }
        throw e;
      }
    };

    try {
      const done = await doDelete();
      if (!done) throw new Error('삭제 실패: 원인 불명');

      // 권한 맵에서도 제거
      setCanManageIds(prev => {
        const next = new Set(prev);
        next.delete(String(id));
        return next;
      });
    } catch (e: any) {
      setGroups(snapshot);
      const status = e?.response?.status;
      const serverMsg = e?.response?.data?.message;
      const msg =
        status === 401
          ? '인증 오류(401): accessToken을 확인해주세요.'
          : status === 403
          ? '삭제 권한이 없습니다.'
          : status === 404
          ? '삭제 실패: 그룹을 찾을 수 없습니다.'
          : serverMsg || e?.message || '그룹 삭제 중 오류가 발생했습니다.';
      setError(msg);
      console.error(
        `DELETE group failed (id=${apiId}, workspace=${
          currentWorkspaceId ?? '-'
        })`,
        e
      );
      alert(msg);
    }
  };

  return (
    <MainLayout activePage="group-management">
      <div className="space-y-6 p-6">
        {/* 헤더 + 그룹 추가(모달) */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">그룹 관리</h1>
            <p className="text-gray-600">
              사용자 그룹을 관리하고 권한을 설정하세요
            </p>
          </div>
          <AddGroupDialog mode="create" onAdd={handleAddGroup} />
        </div>

        {/* 상단 요약 카드 */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="전체 그룹"
            value={totalGroups}
            icon={LayoutGrid}
            valueClassName="text-blue-600"
          />
          <StatCard
            label="전체 멤버"
            value={totalMembers}
            icon={Users}
            valueClassName="text-green-600"
          />
          <StatCard
            label="관리자 그룹"
            value={adminGroups}
            icon={Shield}
            valueClassName="text-rose-600"
          />
          <StatCard
            label="부서 그룹"
            value={deptGroups}
            icon={Building2}
            valueClassName="text-blue-600"
          />
        </div>

        {/* 검색 + 필터 */}
        <SearchFilterBar<GroupFilter>
          placeholder="그룹명, 설명, 리더로 검색..."
          query={q}
          onQueryChange={setQ}
          filters={GROUP_FILTERS}
          activeKey={k}
          onChange={setK}
        />

        {error && <div className="text-sm text-rose-600">{error}</div>}

        {/* 카드 리스트 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
                />
              ))
            : filtered.map(g => {
                const canManage = canManageIds.has(g.id); // isAdmin=true인 그룹만 버튼 노출
                return (
                  <GroupCard
                    key={g.id}
                    data={g}
                    canManage={canManage}
                    onEdit={canManage ? () => handleEdit(g.id) : undefined}
                    onDelete={canManage ? () => handleDelete(g.id) : undefined}
                    onManageMembers={() => openMemberManage(g.id)}
                  />
                );
              })}
        </div>
      </div>

      {/* 편집 다이얼로그 */}
      <AddGroupDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={
          editing
            ? {
                name: editing.name,
                description: editing.description,
                type: editing.type,
                leader: editing.leader,
                maxMembers: editing.maxMembers,
                createdAt: editing.createdAt,
              }
            : undefined
        }
        onSubmit={handleUpdateGroup}
      />

      {/* 그룹 멤버 편집 다이얼로그 */}
      <GroupMemberManagerDialog
        open={memberOpen}
        onOpenChange={setMemberOpen}
        groupName={memberTarget?.name ?? ''}
        groupId={memberTarget?.id ?? ''}
        members={memberList}
        onRemove={handleRemoveMember}
        onAdded={m =>
          setMemberList(prev => {
            if (prev.some(x => String(x.id) === String(m.id))) return prev;
            return [...prev, m];
          })
        }
      />
    </MainLayout>
  );
}
