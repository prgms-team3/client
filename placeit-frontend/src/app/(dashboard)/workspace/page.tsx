'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/management/StatCard';
import SearchFilterBar, {
  type FilterItem,
} from '@/components/management/SearchFilterBar';
import { LayoutGrid, Users, Crown, Mail } from 'lucide-react';
import AddWorkspaceDialog, {
  type NewWorkspace,
} from '@/components/management/AddWorkspaceDialog';
import WorkspaceCard from '@/components/management/WorkspaceCard'; // ✅ 카드 컴포넌트 import

type WSStatus = 'active' | 'inactive';
type WSFilter = 'all' | WSStatus;

const FILTERS: FilterItem<WSFilter>[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '활성' },
  { key: 'inactive', label: '비활성' },
];

type Workspace = {
  id: string;
  name: string;
  description: string; // ✅ 카드용
  imageUrl?: string; // ✅ 카드용
  inviteCode: string;
  owner: string;
  members: number;
  status: WSStatus;
  createdAt: string;
};

export default function WorkspacesPage() {
  const [q, setQ] = React.useState('');
  const [k, setK] = React.useState<WSFilter>('all');

  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([
    {
      id: 'ws_1',
      name: 'Startup Hub',
      description: '혁신적인 스타트업들이 모인 공간',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
      inviteCode: 'CORE-1A2B',
      owner: '홍길동',
      members: 18,
      status: 'active',
      createdAt: '2025-08-01',
    },
    {
      id: 'ws_2',
      name: 'Tech Valley',
      description: '엔지니어링과 연구 중심의 워크스페이스',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
      inviteCode: 'DESN-9XY4',
      owner: '김디자',
      members: 22,
      status: 'active',
      createdAt: '2025-07-21',
    },
    {
      id: 'ws_3',
      name: 'Creative Studio',
      description: '디자인 씽킹과 프로토타이핑을 위한 공간',
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
      inviteCode: 'ARCH-7788',
      owner: '이아카',
      members: 14,
      status: 'inactive',
      createdAt: '2025-06-15',
    },
  ]);

  const pendingInvites = 2;

  const totalWorkspaces = workspaces.length;
  const totalMembers = workspaces.reduce((sum, w) => sum + w.members, 0);
  const activeWorkspaces = workspaces.filter(w => w.status === 'active').length;

  // 검색
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

  const handleCreate = (ws: NewWorkspace) => {
    const id = (crypto as any)?.randomUUID?.() ?? `ws_${Date.now()}`;
    const inviteCode = `WS-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;

    setWorkspaces(prev => [
      {
        id,
        name: ws.name,
        description: ws.description, // ✅ 다이얼로그 입력 반영
        imageUrl:
          'https://images.unsplash.com/photo-1497366216548-37526070297c', // 기본 이미지
        owner: '나', // 로그인 유저명으로 교체
        inviteCode,
        members: 1,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
  };

  const handleEdit = (id: string) => {
    // TODO: 수정 다이얼로그 열기
    alert(`edit ${id}`);
  };

  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠어요?')) return;
    setWorkspaces(prev => prev.filter(w => w.id !== id));
  };

  const handleToggleStatus = (id: string, next: WSStatus) => {
    setWorkspaces(prev =>
      prev.map(w => (w.id === id ? { ...w, status: next } : w))
    );
  };

  return (
    <MainLayout activePage="workspaces">
      <div className="space-y-6 p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              워크스페이스 관리
            </h1>
            <p className="text-gray-600">
              워크스페이스를 생성하고 멤버를 초대하여 관리하세요
            </p>
          </div>
          <AddWorkspaceDialog onCreate={handleCreate} />
        </div>

        {/* 통계 */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            icon={Crown}
            valueClassName="text-purple-600"
          />
          <StatCard
            label="대기 중 초대"
            value={pendingInvites}
            icon={Mail}
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

        {/* 카드 그리드 */}
        <div className="grid grid-flow-row-dense gap-6 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {filtered.map(w => (
            <WorkspaceCard
              key={w.id}
              id={w.id}
              name={w.name}
              description={w.description}
              owner={w.owner}
              inviteCode={w.inviteCode}
              status={w.status}
              imageUrl={w.imageUrl}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
