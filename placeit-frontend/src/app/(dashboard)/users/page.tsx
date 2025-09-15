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
import { useUserStore } from '@/stores/userStore';
import {
  fetchWorkspaceUsers,
  type ApiWorkspaceUser,
  deleteWorkspaceUser,
} from '@/services/workspaceUsers';
import { api } from '@/lib/axios';
import EditUserDialog from '@/components/management/EditUserDialog';

// ===== 타입/필터 =====
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
    title: u.position ?? undefined, // UI 표기는 title로 사용
    role,
    status,
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

  // 내 워크스페이스 역할
  const myWorkspaceRole = React.useMemo(() => {
    if (!myUserId) return null;
    const me = rawMembers.find(m => String(m.user.id) === String(myUserId));
    return me?.role ?? null;
  }, [rawMembers, myUserId]);

  const isAdmin =
    myWorkspaceRole === 'SUPER_ADMIN' || myWorkspaceRole === 'ADMIN';
  const canDelete =
    myWorkspaceRole === 'SUPER_ADMIN' || myWorkspaceRole === 'ADMIN';

  // ===== 통계 =====
  const totalUsers = rows.length;
  const generalUsers = React.useMemo(
    () => rows.filter(u => u.role === 'manager' || u.role === 'member').length,
    [rows]
  );
  const adminCount = React.useMemo(
    () => rows.filter(u => u.role === 'admin').length,
    [rows]
  );
  const thisMonthNew = React.useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return rawMembers.filter((mb: any) => {
      const joined: string | undefined = mb?.joinedAt;
      if (!joined) return false;
      const d = new Date(joined);
      return (
        !Number.isNaN(d.getTime()) &&
        d.getFullYear() === y &&
        d.getMonth() === m
      );
    }).length;
  }, [rawMembers]);

  const deptOptions = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach(u => {
      const d = (u.department ?? '').trim();
      if (d) set.add(d);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [rows]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter(u => {
      const roleOk =
        k === 'all'
          ? true
          : k === 'admin'
          ? u.role === 'admin'
          : u.role === 'member' || u.role === 'manager';
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

  // ===== “사용자 추가” (로컬 prepend, 기존 그대로 유지) =====
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

  // ===== 삭제(기존 유지) =====
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

    const prev = rows;
    setRows(rows => rows.filter(r => r.id !== targetUserId));
    try {
      await deleteWorkspaceUser(currentId, targetUserId);
    } catch (err: any) {
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

  // ===== 내 정보 수정 다이얼로그 상태 =====
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState<UserRowData | null>(null);

  // 행의 연필 버튼 클릭 시
  const handleEditClick = (id: string) => {
    const target = rows.find(r => r.id === id);
    if (!target) return;
    // 요구사항: 내 정보만 수정
    if (String(id) !== String(myUserId)) {
      alert('내 정보만 수정할 수 있습니다.');
      return;
    }
    setEditingRow(target);
    setEditOpen(true);
  };

  // PATCH /workspaces/{id}/me
  const submitEditMe = async (payload: {
    department?: string;
    position?: string;
  }) => {
    if (!currentId || !myUserId)
      throw new Error('워크스페이스/사용자 정보가 없습니다.');

    // ── 1) 업데이트 전 내 기존 부서 기억
    const meBefore = rows.find(r => String(r.id) === String(myUserId));
    const prevDept = (meBefore?.department ?? '').trim();

    // ── 2) 서버 PATCH
    await api.patch(`/workspaces/${currentId}/me`, payload);

    // ── 3) 로컬 상태 갱신 (기존 코드 유지)
    setRows(prev =>
      prev.map(r =>
        String(r.id) === String(myUserId)
          ? {
              ...r,
              department: payload.department ?? r.department,
              title: payload.position ?? r.title, // UI에서 title로 표기
            }
          : r
      )
    );
    setRawMembers(prev =>
      prev.map(m =>
        String(m.user.id) === String(myUserId)
          ? {
              ...m,
              department: payload.department ?? m.department,
              position: payload.position ?? m.position,
            }
          : m
      )
    );

    // ── 4) 부서 변경에 따른 그룹 가입/탈퇴 동기화
    const nextDept = (payload.department ?? prevDept ?? '').trim();

    // 변경 없음이면 종료
    if (!currentId || prevDept.toLowerCase() === nextDept.toLowerCase()) return;

    try {
      // (a) 현재 워크스페이스의 그룹 목록을 불러와 "부서 그룹"만 추려냄
      const { data } = await api.get('/groups'); // 인터셉터로 토큰 부착 가정
      const allGroups: any[] = Array.isArray(data) ? data : [];
      const inWorkspace = allGroups.filter(
        g => String(g?.workspaceId) === String(currentId)
      );

      // 서버 타입이 있다면 'DEPARTMENT'로, 없으면 이름으로도 추정 가능 (기존 그룹페이지 로직과 동일)  :contentReference[oaicite:3]{index=3}
      const isDeptGroup = (g: any) =>
        (g?.type ?? '').toUpperCase() === 'DEPARTMENT' ||
        // 백엔드가 type을 안줄 수도 있는 경우를 대비한 안전장치
        !g?.type;

      const deptGroups = inWorkspace.filter(isDeptGroup);

      const findByName = (name?: string) => {
        const key = (name ?? '').trim().toLowerCase();
        if (!key) return undefined;
        return deptGroups.find(
          (g: any) =>
            String(g?.name ?? '')
              .trim()
              .toLowerCase() === key
        );
      };

      const prevGroup = findByName(prevDept);
      const nextGroup = findByName(nextDept);

      // (b) 이전 부서 그룹에서 탈퇴
      if (prevDept && prevGroup?.id) {
        try {
          await api.delete(`/groups/${prevGroup.id}/leave`);
        } catch (e: any) {
          // 경고만 띄우고 계속 진행
          console.warn('그룹 탈퇴 실패:', e);
        }
      }

      // (c) 새 부서 그룹에 가입
      if (nextDept && nextGroup?.id) {
        try {
          await api.post(`/groups/${nextGroup.id}/join`);
        } catch (e: any) {
          console.warn('그룹 가입 실패:', e);
        }
      }
      // 그룹이 없으면(=nextGroup 미존재) 아무것도 하지 않음. 필요 시 "부서명과 동일한 그룹이 없습니다" 토스트로 안내 가능.
    } catch (e) {
      console.warn('부서-그룹 동기화 실패:', e);
      // PATCH는 이미 성공했고, 그룹 동기화만 실패해도 사용자 정보는 갱신되었으니 치명적 에러로 막지 않음.
    }
  };

  // 내 워크스페이스 역할 계산
  const handleChangeRole = async (targetUserId: string) => {
    if (!currentId) return;

    // 관리자만 가능
    const amIAdmin =
      myWorkspaceRole === 'SUPER_ADMIN' || myWorkspaceRole === 'ADMIN';
    if (!amIAdmin) {
      alert('역할 변경 권한이 없습니다.');
      return;
    }

    // 본인 변경 금지
    if (String(targetUserId) === String(myUserId)) {
      alert('본인 역할은 변경할 수 없습니다.');
      return;
    }

    // 현재 대상의 UI 역할 확인
    const target = rows.find(r => String(r.id) === String(targetUserId));
    if (!target) return;

    // ADMIN/MEMBER 토글 (manager는 일반 사용자로 취급)
    const nextServerRole = target.role === 'admin' ? 'MEMBER' : 'ADMIN';
    const confirmMsg =
      nextServerRole === 'ADMIN'
        ? '이 사용자를 관리자(ADMIN)로 승진시키겠습니까?'
        : '이 사용자를 일반 사용자(MEMBER)로 강등시키겠습니까?';
    if (!confirm(confirmMsg)) return;

    // 낙관적 업데이트 준비
    const prevRows = rows;
    const prevRaw = rawMembers;

    // UI 즉시 반영
    setRows(prev =>
      prev.map(r =>
        String(r.id) === String(targetUserId)
          ? { ...r, role: nextServerRole === 'ADMIN' ? 'admin' : 'member' }
          : r
      )
    );
    setRawMembers(prev =>
      prev.map(m =>
        String(m.user.id) === String(targetUserId)
          ? { ...m, role: nextServerRole } // 'ADMIN' | 'MEMBER'
          : m
      )
    );

    try {
      await api.patch(`/workspaces/${currentId}/users/role`, {
        userId: Number(targetUserId),
        role: nextServerRole, // 'ADMIN' | 'MEMBER'
      });
    } catch (err: any) {
      // 실패 시 롤백
      setRows(prevRows);
      setRawMembers(prevRaw);
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      const msg =
        status === 401
          ? serverMsg || '인증 오류(401). 액세스 토큰을 확인하세요.'
          : status === 403
          ? serverMsg || '역할 변경 권한이 없습니다(403).'
          : serverMsg || err?.message || '역할 변경 중 오류가 발생했습니다.';
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
            onEdit={handleEditClick}
            onChangeRole={handleChangeRole}
            onDelete={handleDelete}
            canDelete={canDelete}
            myUserId={myUserId ? String(myUserId) : undefined}
            isAdmin={isAdmin}
          />
        )}

        {loading && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-500">
            사용자 목록을 불러오는 중…
          </div>
        )}

        {/* 내 정보 수정 다이얼로그 */}
        {editingRow && (
          <EditUserDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            initial={{
              name: editingRow.name,
              email: editingRow.email,
              department: editingRow.department ?? '',
              position: editingRow.title ?? '', // UI에서 title로 들고 있었던 값을 서버 position으로 매핑
            }}
            onSubmit={submitEditMe}
          />
        )}
      </div>
    </MainLayout>
  );
}
