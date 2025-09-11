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

type GroupFilter = 'all' | GroupType; // 'project' 제거

const GROUP_FILTERS: FilterItem<GroupFilter>[] = [
  { key: 'all', label: '전체' },
  { key: 'exec', label: '임원진' },
  { key: 'admin', label: '관리자' },
  { key: 'department', label: '부서' },
];

export default function GroupManagementPage() {
  const [q, setQ] = React.useState('');
  const [k, setK] = React.useState<GroupFilter>('all');

  const [groups, setGroups] = React.useState<GroupCardData[]>([
    {
      id: 'g1',
      name: '경영진',
      type: 'exec',
      description: '회사의 주요 의사결정을 담당하는 임원진 그룹',
      leader: '이정우',
      membersCount: 3,
      maxMembers: 5,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'g2',
      name: '개발팀',
      type: 'department',
      description: '소프트웨어 개발 및 기술 관련 업무를 담당하는 팀',
      leader: '박정호',
      membersCount: 8,
      maxMembers: 15,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'g3',
      name: '마케팅팀',
      type: 'department',
      description: '마케팅 전략 수립 및 브랜드 관리를 담당하는 팀',
      leader: '김민지',
      membersCount: 6,
      maxMembers: 10,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'g4',
      name: '관리자',
      type: 'admin',
      description: '시스템 관리 권한을 가진 특별 그룹',
      leader: '시스템관리자',
      membersCount: 2,
      maxMembers: 3,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ]);

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

  // AddGroupDialog 연결
  const handleAddGroup = (ng: NewGroup) => {
    const id =
      (typeof crypto !== 'undefined' &&
        'randomUUID' in crypto &&
        crypto.randomUUID()) ||
      `g-${Date.now()}`;

    // AddGroupDialog는 type이 'exec' | 'department' | 'admin' 이라고 가정
    setGroups(prev => [
      {
        id,
        name: ng.name,
        type: ng.type as GroupType,
        description: ng.description,
        leader: ng.leader,
        membersCount: 0,
        maxMembers: Number(ng.maxMembers ?? 0),
        createdAt: new Date(ng.createdAt).toISOString(),
      },
      ...prev,
    ]);
  };

  // 카드 액션 (데모)
  const handleEdit = (id: string) => alert(`편집: ${id}`);
  // const handleDuplicate = (id: string) => {
  //   const g = groups.find(x => x.id === id);
  //   if (!g) return;
  //   setGroups(prev => [
  //     { ...g, id: `copy-${Date.now()}`, name: `${g.name} (복제)` },
  //     ...prev,
  //   ]);
  // };
  const handleDelete = (id: string) =>
    setGroups(prev => prev.filter(g => g.id !== id));
  const handleManageMembers = (id: string) => alert(`멤버 관리 이동: ${id}`);

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
          <AddGroupDialog onAdd={handleAddGroup} />
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

        {/* 카드 리스트 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(g => (
            <GroupCard
              key={g.id}
              data={g}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageMembers={handleManageMembers}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
