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

// 서버에 타입이 없다면 이름으로 대략 추론
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

// API 응답 → 카드 데이터
function mapToCardData(g: any): GroupCardData {
  const members = Array.isArray(g?.members) ? g.members : [];

  // 서버가 주는 leaderName/leader 객체를 최우선으로 사용
  const leaderFromServer =
    g?.leaderName || g?.leader?.name || g?.leader?.user?.name || undefined;

  // 없으면 기존 멤버 기반 추론(ADMIN → 첫 멤버)
  const leaderFromMembers =
    members.find((m: any) => m?.role === 'ADMIN')?.user?.name ??
    members[0]?.user?.name ??
    undefined;

  return {
    id: String(g.id),
    name: g.name,
    // 서버 type 있으면 그대로 매핑, 없으면 기존 추론 사용
    type: g?.type ? mapApiTypeToUiType(g.type) : inferGroupType(g.name),
    description: g.description ?? undefined,
    leader: leaderFromServer ?? leaderFromMembers,
    membersCount: members.length,
    maxMembers: Number(g.maxMembers ?? 0),
    createdAt: g.createdAt
      ? new Date(g.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

export default function GroupManagementPage() {
  const [q, setQ] = React.useState('');
  const [k, setK] = React.useState<GroupFilter>('all');

  const currentId = useWorkspaceStore(s => s.currentId);

  const [groups, setGroups] = React.useState<GroupCardData[]>([]);
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

  const openMemberManage = async (groupId: string) => {
    const target = groups.find(g => g.id === groupId);
    if (!target) return;
    setMemberTarget({ id: target.id, name: target.name });

    // TODO: 실제 API 호출로 교체하세요 (예시 더미)
    // const { data } = await api.get(`/groups/${groupId}/members`);
    // setMemberList(mapMembers(data));
    setMemberList([
      { id: 1, name: '이정우', subtitle: '이사', role: 'LEADER' },
      { id: 2, name: '정민수', subtitle: '부이사', role: 'MEMBER' },
      { id: 3, name: '한지원', subtitle: '상무', role: 'MEMBER' },
    ]);

    setMemberOpen(true);
  };

  // 멤버 제거/추가 콜백 (API 연동 위치)
  const handleRemoveMember = async (memberId: GroupMember['id']) => {
    // await api.delete(`/groups/${memberTarget!.id}/members/${memberId}`);
    setMemberList(prev => prev.filter(m => m.id !== memberId));
  };

  const handleAddClick = () => {
    // 여기에 "멤버 추가" 모달/검색/선택 로직을 붙이거나, 라우팅/시트를 열면 됩니다.
    // 예: setAddSheetOpen(true)
  };

  // 현재 선택 워크스페이스에 맞는 그룹만 가져오기
  React.useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await api.get('/groups'); // accessToken은 인터셉터로 전제
        const raw: any[] = Array.isArray(data) ? data : [];

        // 스토어의 currentId(string)와 응답의 workspaceId(number)를 문자열 비교
        const filtered = currentId
          ? raw.filter(g => String(g?.workspaceId) === currentId)
          : [];

        const mapped = filtered.map(mapToCardData);
        if (aborted) return;
        setGroups(mapped);
      } catch (e: any) {
        if (aborted) return;
        const status = e?.response?.status;
        const msg =
          status === 401
            ? '인증 오류(401): accessToken을 확인해주세요.'
            : e?.response?.data?.message ||
              e?.message ||
              '그룹을 불러오는 중 오류가 발생했습니다.';
        setError(msg);
        console.error('GET /groups failed:', e);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [currentId]);

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
    if (!currentId) {
      const msg = '선택된 워크스페이스가 없습니다.';
      setError(msg);
      alert(msg);
      return;
    }

    try {
      const body = {
        name: ng.name,
        description: ng.description || '',
        workspaceId: Number(currentId),
        maxMembers: Number(ng.maxMembers || 0),
        leaderName: ng.leader || '',
        type: ng.type?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'DEPARTMENT',
      };

      const res = await api.post('/groups', body);
      const createdRaw = res?.data?.group ?? res?.data;

      if (String(createdRaw?.workspaceId) === currentId) {
        const created = mapToCardData(createdRaw);
        setGroups(prev => [created, ...prev]);
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

  // 편집 다이얼로그 오픈
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
          : e?.response?.data?.message ||
            e?.message ||
            '그룹 수정 중 오류가 발생했습니다.';
      setError(msg);
      console.error('PATCH /groups/{id} failed:', e);
      alert(msg);
    }
  };

  // DELETE /groups/{id}
  const handleDelete = async (id: string) => {
    if (!id) return;
    const ok = window.confirm('해당 그룹을 삭제할까요?');
    if (!ok) return;

    const snapshot = groups;
    setGroups(prev => prev.filter(g => g.id !== id));
    try {
      await api.delete(`/groups/${id}`);
    } catch (e: any) {
      setGroups(snapshot);
      const status = e?.response?.status;
      const msg =
        status === 401
          ? '인증 오류(401): accessToken을 확인해주세요.'
          : e?.response?.data?.message ||
            e?.message ||
            '그룹 삭제 중 오류가 발생했습니다.';
      setError(msg);
      console.error('DELETE /groups/{id} failed:', e);
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
          {/* 생성용 다이얼로그 */}
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

        {/* 카드 리스트 (UI 변경 없음) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
                />
              ))
            : filtered.map(g => (
                <GroupCard
                  key={g.id}
                  data={g}
                  onEdit={() => handleEdit(g.id)}
                  onDelete={() => handleDelete(g.id)}
                  onManageMembers={() => openMemberManage(g.id)}
                />
              ))}
        </div>
      </div>

      {/* 편집 다이얼로그: AddGroupDialog 재활용 */}
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
        onRemove={handleRemoveMember}
        onAddClick={handleAddClick}
      />
    </MainLayout>
  );
}
