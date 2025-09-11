'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/management/StatCard';
import { Users, UserCheck, Shield, UserPlus } from 'lucide-react';
import SearchFilterBar, {
  type FilterItem,
} from '@/components/management/SearchFilterBar';
import AddUserDialog, {
  type NewUser,
} from '@/components/management/AddUserDialog';
import UserTable from '@/components/management/UserTable';
import type { UserRowData } from '@/components/management/UserRow';

type UserStatus = 'active' | 'suspended';
type UserRole = 'admin' | 'member';
type RoleFilter = 'all' | UserRole;
type DeptFilter = 'all' | string; // 'all' 또는 특정 부서명

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department?: string; // 부서
  title?: string; // 직급
  createdAt: string; // 가입/생성 시각
  lastLoginAt?: string;
  reservationsCount?: number;
  avatarUrl?: string;
}

const ROLE_FILTERS: FilterItem<RoleFilter>[] = [
  { key: 'all', label: '모든 역할' },
  { key: 'admin', label: '관리자' },
  { key: 'member', label: '사용자' },
];

export default function UserManagementPage() {
  // 검색어 & 역할 필터
  const [q, setQ] = React.useState('');
  const [k, setK] = React.useState<RoleFilter>('all');
  const [dept, setDept] = React.useState<DeptFilter>('all'); // 부서 필터 상태

  // 임시 사용자 데이터 (추후 서버 연동)
  const [users, setUsers] = React.useState<User[]>([
    {
      id: 'u1',
      name: '박수연',
      email: 'suyeon@example.com',
      role: 'admin',
      status: 'active',
      department: '플랫폼개발팀',
      title: '리드',
      createdAt: '2025-08-02T04:12:00Z',
      lastLoginAt: '2025-08-28T06:12:00Z',
      reservationsCount: 24,
      // avatarUrl: 'https://...' // 필요 시
    },
    {
      id: 'u2',
      name: '김철수',
      email: 'chulsoo@example.com',
      role: 'member',
      status: 'active',
      department: '경영지원팀',
      title: '사원',
      createdAt: '2025-08-29T10:05:00Z',
      reservationsCount: 12,
    },
    {
      id: 'u3',
      name: '이영희',
      email: 'younghee@example.com',
      role: 'member',
      status: 'active',
      department: '프론트엔드팀',
      title: '매니저',
      createdAt: '2025-07-21T02:20:00Z',
      lastLoginAt: '2025-08-25T02:20:00Z',
      reservationsCount: 18,
    },
    {
      id: 'u4',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'member',
      status: 'suspended',
      department: '인프라팀',
      title: '주임',
      createdAt: '2025-08-05T09:00:00Z',
      reservationsCount: 5,
    },
  ]);

  // ===== 통계 =====
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  // 이번 달 신규
  const thisMonthNew = React.useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return users.filter(u => {
      const d = new Date(u.createdAt);
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;
  }, [users]);

  // 현재 사용자 목록에서 부서 목록 추출
  const deptOptions = React.useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => {
      const d = (u.department ?? '').trim();
      if (d) set.add(d);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [users]);

  // ===== 검색 + 역할 + 부서 필터 =====
  const filteredUsers = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return users.filter(u => {
      const roleOk = k === 'all' ? true : u.role === k;
      const deptOk =
        dept === 'all'
          ? true
          : (u.department ?? '').toLowerCase() === dept.toLowerCase();
      const searchOk =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.department ?? '').toLowerCase().includes(query) ||
        (u.title ?? '').toLowerCase().includes(query);
      return roleOk && deptOk && searchOk;
    });
  }, [users, q, k, dept]);

  const rows: UserRowData[] = filteredUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    department: u.department,
    title: u.title,
    role: u.role, // 'admin' | 'member'
    status: u.status, // 'active' | 'suspended'
    reservationsCount: u.reservationsCount ?? 0,
    lastLoginAt: u.lastLoginAt, // ISO
    avatarUrl: u.avatarUrl,
  }));

  // ===== 사용자 추가 =====
  const handleAddUser = (nu: NewUser) => {
    const id =
      (typeof crypto !== 'undefined' &&
        'randomUUID' in crypto &&
        crypto.randomUUID()) ||
      `u-${Date.now()}`;

    setUsers(prev => [
      {
        id,
        name: nu.name,
        email: nu.email,
        role: nu.role as UserRole,
        status: nu.status ?? 'active',
        department: nu.department,
        title: nu.title,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return (
    <MainLayout activePage="user-management">
      <div className="space-y-6 p-6">
        {/* 헤더 + 사용자 추가 버튼 */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              사용자 관리
            </h1>
            <p className="text-gray-600">
              조직의 사용자 계정을 조회/관리하세요
            </p>
          </div>
          <AddUserDialog onAdd={handleAddUser} />
        </div>

        {/* 통계 */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="전체 사용자"
            value={totalUsers}
            icon={Users}
            valueClassName="text-blue-600"
          />
          <StatCard
            label="활성 사용자"
            value={activeUsers}
            icon={UserCheck}
            valueClassName="text-green-600"
          />
          <StatCard
            label="관리자"
            value={adminCount}
            icon={Shield}
            valueClassName="text-purple-600"
          />
          <StatCard
            label="이번 달 신규"
            value={thisMonthNew}
            icon={UserPlus}
            valueClassName="text-orange-600"
          />
        </div>

        {/* 검색 + 역할 필터 + 부서 필터 */}
        <SearchFilterBar<RoleFilter>
          placeholder="이름, 이메일, 부서, 직급으로 검색..."
          query={q}
          onQueryChange={setQ}
          filters={ROLE_FILTERS}
          activeKey={k}
          onChange={setK}
        >
          <select
            className="h-10 shrink-0 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-primary-400"
            value={dept}
            onChange={e => setDept(e.target.value as DeptFilter)}
          >
            <option value="all">모든 부서</option>
            {deptOptions.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </SearchFilterBar>

        {/* 사용자 목록 */}
        <UserTable
          className="mt-4"
          users={rows}
          onEdit={id => console.log('edit', id)}
          onChangeRole={id => console.log('change role', id)}
          onDelete={id => console.log('delete', id)}
        />
      </div>
    </MainLayout>
  );
}
