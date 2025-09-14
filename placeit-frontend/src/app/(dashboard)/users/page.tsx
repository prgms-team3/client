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
import { useWorkspaceStore } from '@/stores/workspaceStore';
import {
  fetchWorkspaceUsers,
  type ApiWorkspaceUser,
} from '@/services/workspaceUsers';
import { useUserStore } from '@/stores/userStore';
import { deleteWorkspaceUser } from '@/services/workspaceUsers';

// 필터 타입
type UserStatus = 'active' | 'suspended';
type UserRole = 'admin' | 'manager' | 'member';
type RoleFilter = 'all' | Extract<UserRole, 'admin' | 'member'>;
type DeptFilter = 'all' | string;

const ROLE_FILTERS: FilterItem<RoleFilter>[] = [
  { key: 'all', label: '모든 역할' },
  { key: 'admin', label: '관리자' },
  { key: 'member', label: '사용자' },
];

// API → 테이블 행으로 변환
function mapApiToRow(u: ApiWorkspaceUser): UserRowData {
  const role: UserRole =
    u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'
      ? 'admin'
      : u.role === 'MANAGER'
      ? 'manager'
      : 'member';

  const status: UserStatus = u.user.isActive ? 'active' : 'suspended';

  return {
    id: String(u.user.id),
    name: u.user.name,
    email: u.user.email,
    department: u.department ?? undefined,
    title: u.position ?? undefined,
    role, // 'admin' | 'manager' | 'member'
    status, // 'active' | 'suspended'
    reservationsCount: undefined,
    lastLoginAt: u.user.updatedAt || u.updatedAt || undefined,
    avatarUrl: undefined,
  };
}

export default function UserManagementPage() {
  const [q, setQ] = React.useState('');
  const [k, setK] = React.useState<RoleFilter>('all');
  const [dept, setDept] = React.useState<DeptFilter>('all');

  const [rows, setRows] = React.useState<UserRowData[]>([]);
  const [rawMembers, setRawMembers] = React.useState<ApiWorkspaceUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const currentId = useWorkspaceStore(s => s.currentId);
  const myUserId = useUserStore(s => s.user?.id);

  // ===== 서버에서 멤버 목록 가져오기 =====
  React.useEffect(() => {
    if (!currentId) {
      setRows([]);
      setRawMembers([]);
      return;
    }
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchWorkspaceUsers(currentId);
        if (aborted) return;
        setRawMembers(list);
        setRows(list.map(mapApiToRow));
      } catch (err: any) {
        if (aborted) return;
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;
        const msg =
          status === 401
            ? serverMsg || '인증 오류(401). 액세스 토큰을 확인하세요.'
            : status === 403
            ? serverMsg ||
              '접근 권한이 없습니다(403). 워크스페이스 권한을 확인하세요.'
            : serverMsg ||
              err?.message ||
              '사용자 목록 조회 중 오류가 발생했습니다.';
        setError(msg);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [currentId]);

  // 내 워크스페이스 역할을 현재 목록에서 찾기
  const myWorkspaceRole = React.useMemo(() => {
    if (!myUserId) return null;
    const me = rawMembers.find(m => String(m.user.id) === String(myUserId));
    return me?.role ?? null; // 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'MEMBER' | undefined
  }, [rawMembers, myUserId]);

  // 관리자만 삭제 가능 (SUPER_ADMIN/ADMIN)
  const canDelete =
    myWorkspaceRole === 'SUPER_ADMIN' || myWorkspaceRole === 'ADMIN';

  // ===== 통계 =====
  // 전체
  const totalUsers = rows.length;

  // 일반 사용자(관리자 제외 = manager + member)
  const generalUsers = React.useMemo(
    () => rows.filter(u => u.role === 'manager' || u.role === 'member').length,
    [rows]
  );

  // 관리자 수
  const adminCount = React.useMemo(
    () => rows.filter(u => u.role === 'admin').length,
    [rows]
  );

  // 이번 달 신규(joinedAt 기준)
  const thisMonthNew = React.useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-based
    return rawMembers.filter((mb: any) => {
      const joined: string | undefined = mb?.joinedAt; // 서버 응답 필드 사용
      if (!joined) return false;
      const d = new Date(joined);
      return (
        !Number.isNaN(d.getTime()) &&
        d.getFullYear() === y &&
        d.getMonth() === m
      );
    }).length;
  }, [rawMembers]);

  // 현재 목록에서 부서 옵션 추출
  const deptOptions = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach(u => {
      const d = (u.department ?? '').trim();
      if (d) set.add(d);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [rows]);

  // ===== 검색 + 역할 + 부서 필터 =====
  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter(u => {
      const roleOk =
        k === 'all'
          ? true
          : k === 'admin'
          ? u.role === 'admin'
          : u.role === 'member' || u.role === 'manager'; // member 필터에 manager 포함
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
  }, [rows, q, k, dept]);

  // ===== “사용자 추가” (지금은 로컬 prepend) =====
  const handleAddUser = (nu: NewUser) => {
    const id =
      (typeof crypto !== 'undefined' &&
        'randomUUID' in crypto &&
        crypto.randomUUID()) ||
      `u-${Date.now()}`;
    setRows(prev => [
      {
        id,
        name: nu.name,
        email: nu.email,
        department: nu.department,
        title: nu.title,
        role: nu.role as UserRole,
        status: nu.status ?? 'active',
        reservationsCount: undefined,
        lastLoginAt: undefined,
      },
      ...prev,
    ]);
  };

  const handleDelete = async (targetUserId: string) => {
    if (!currentId) return;
    if (String(myUserId) === String(targetUserId)) {
      alert('본인 계정은 삭제할 수 없습니다.');
      return;
    }
    const ok = confirm(
      '정말로 이 사용자를 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다.'
    );
    if (!ok) return;

    // 낙관적 업데이트
    const prev = rows;
    setRows(rows => rows.filter(r => r.id !== targetUserId));

    try {
      await deleteWorkspaceUser(currentId, targetUserId);
      // 성공 시: 끝
    } catch (err: any) {
      // 실패 시 롤백
      setRows(prev);
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      const msg =
        status === 401
          ? serverMsg || '인증 오류(401). 액세스 토큰을 확인하세요.'
          : status === 403
          ? serverMsg || '삭제 권한이 없습니다(403).'
          : serverMsg || err?.message || '삭제 중 오류가 발생했습니다.';
      alert(msg);
    }
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
            label="일반 사용자"
            value={generalUsers}
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

        {/* 검색 + 역할 + 부서 필터 */}
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

        {/* 오류/로딩/테이블 */}
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {error}
          </div>
        ) : (
          <UserTable
            className="mt-4"
            users={filtered}
            onEdit={id => console.log('edit', id)}
            onChangeRole={id => console.log('change role', id)}
            onDelete={handleDelete}
            canDelete={canDelete}
          />
        )}

        {loading && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-500">
            사용자 목록을 불러오는 중…
          </div>
        )}
      </div>
    </MainLayout>
  );
}
