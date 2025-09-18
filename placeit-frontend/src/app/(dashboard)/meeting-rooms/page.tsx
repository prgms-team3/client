'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/management/StatCard';
import { Building2, Cog, Users } from 'lucide-react';
import SearchFilterBar, {
  type FilterItem,
} from '@/components/management/SearchFilterBar';
import MeetingRoomCard, {
  type MeetingRoomCardProps,
  type Status,
  type AmenityKey,
} from '@/components/management/MeetingRoomCard';
import AddMeetingRoomDialog, {
  type NewRoom,
  type RoomImage,
} from '@/components/management/AddMeetingRoomDialog';
import { api } from '@/lib/axios';
import { useWorkspaceStore } from '@/stores/workspaceStore';

type RoomFilter = 'all' | Extract<Status, 'available' | 'unavailable'>;
type ApprovalPolicy = 'auto' | 'approval_required';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c';

type ApiSpaceImage = {
  imageUrl: string;
  imageType: 'PHOTO' | 'FLOOR_PLAN';
};

type ApiSpace = {
  id: number;
  workspaceId: number;
  name: string;
  description: string | null;
  location: string | null;
  capacity: number;
  requiresApproval: boolean;
  isActive: boolean;
  amenities: AmenityKey[];
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  images: ApiSpaceImage[]; // ← 객체 배열로 변경
  monthlyReservationCount?: number;
  currentUtilizationRate?: number;
  size?: number;
};

type Room = MeetingRoomCardProps & {
  id: string;
  approvalPolicy: ApprovalPolicy;
  size?: number;
};

const FILTERS: FilterItem<RoomFilter>[] = [
  { key: 'all', label: '전체' },
  { key: 'available', label: '사용가능' },
  { key: 'unavailable', label: '사용 중지' },
];

// 대표 이미지 선택(1순위: PHOTO, 2순위: 첫 이미지, 3순위: DEFAULT)
function pickPrimaryImage(images?: { imageUrl: string; imageType: string }[]) {
  if (!images || images.length === 0) return DEFAULT_IMAGE;
  const photo = images.find(i => i.imageType === 'PHOTO') ?? images[0];
  return photo?.imageUrl || DEFAULT_IMAGE;
}

function mapApiToRoom(api: ApiSpace): Room {
  return {
    id: String(api.id),
    name: api.name,
    description: api.description || '',
    location: api.location || '',
    capacity: api.capacity,
    monthlyReservations: api.monthlyReservationCount ?? 0,
    utilizationRate: api.currentUtilizationRate ?? 0,
    status: api.isActive ? 'available' : 'unavailable',
    facilities: api.amenities,
    imageUrl: pickPrimaryImage(api.images),
    images: (api.images ?? []).map(i => ({
      imageUrl: i.imageUrl,
      imageType: i.imageType,
    })),
    approvalPolicy: api.requiresApproval ? 'approval_required' : 'auto',
    size: typeof api.size === 'number' ? api.size : undefined,
  };
}

type ApiWorkspaceUser = {
  id: number;
  workspaceId: number;
  userId: number | string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
};

export default function MeetingRoomsPage() {
  const [q, setQ] = React.useState('');
  const [k, setK] = React.useState<RoomFilter>('all');
  const [rooms, setRooms] = React.useState<Room[]>([]);

  // 권한
  const [canManage, setCanManage] = React.useState(false);

  // 수정 다이얼로그
  const [editOpen, setEditOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Room | null>(null);

  // 워크스페이스
  const currentId = useWorkspaceStore(s => s.currentId);
  const refreshIfStale = useWorkspaceStore(s => s.refreshIfStale);

  React.useEffect(() => {
    refreshIfStale({ staleTime: 1000 * 60 * 2 }).catch(() => {});
  }, [refreshIfStale]);

  const workspaceId =
    typeof currentId === 'string' && /^\d+$/.test(currentId)
      ? Number(currentId)
      : null;

  // 내 역할 계산
  React.useEffect(() => {
    const loadRole = async () => {
      if (!workspaceId) return;

      try {
        // 1) localStorage에서 내 userId 읽기
        const raw =
          typeof window !== 'undefined'
            ? localStorage.getItem('user-storage')
            : null;
        if (!raw) {
          setCanManage(false);
          return;
        }
        let myUserId: string | null = null;
        try {
          const parsed = JSON.parse(raw);
          const id = parsed?.state?.user?.id;
          if (id === undefined || id === null) {
            setCanManage(false);
            return;
          }
          myUserId = String(id);
        } catch {
          setCanManage(false);
          return;
        }

        // 2) 워크스페이스 사용자 배열
        const { data } = await api.get<ApiWorkspaceUser[]>(
          `/workspaces/${workspaceId}/users`
        );

        // 3) 내 role 찾기
        const mine = data.find(u => String(u.userId) === myUserId);
        const role = mine?.role ?? 'MEMBER';

        // 4) 권한 여부
        setCanManage(role === 'SUPER_ADMIN' || role === 'ADMIN');
      } catch {
        setCanManage(false);
      }
    };
    loadRole();
  }, [workspaceId]);

  // 회의실 목록
  React.useEffect(() => {
    const fetchRooms = async () => {
      if (!workspaceId) return;
      try {
        const { data } = await api.get<{ spaces: ApiSpace[]; total: number }>(
          `/workspaces/${workspaceId}/spaces`
        );
        const mapped = data.spaces.map(mapApiToRoom);
        setRooms(mapped);
      } catch (err) {
        console.error('회의실 목록 불러오기 실패', err);
      }
    };
    fetchRooms();
  }, [workspaceId]);

  // 통계
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const unavailableRooms = rooms.filter(r => r.status === 'unavailable').length;
  const avgUtilRate =
    Math.round(
      (rooms.reduce((s, r) => s + (r.utilizationRate || 0), 0) /
        Math.max(rooms.length, 1)) *
        10
    ) / 10;

  // 검색/필터
  const filteredRooms = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return rooms.filter(r => {
      const statusOk = k === 'all' ? true : r.status === k;
      const searchOk =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query);
      return statusOk && searchOk;
    });
  }, [rooms, q, k]);

  // 생성
  const handleAddRoom = async (form: NewRoom) => {
    if (!canManage) return;
    try {
      if (workspaceId == null) {
        alert('워크스페이스를 먼저 선택해 주세요.');
        return;
      }

      // images: RoomImage[] 그대로 전송
      const payload = {
        name: form.name,
        description: form.description || '',
        location: form.location || '',
        capacity: form.capacity,
        requiresApproval: form.requiresApproval,
        amenities: form.amenities,
        images: form.images.filter(i => i.imageUrl.trim().length > 0), // 빈 줄 제거
      };

      const { data } = await api.post<ApiSpace>(
        `/workspaces/${workspaceId}/spaces`,
        payload
      );
      const created = mapApiToRoom(data);
      setRooms(prev => [created, ...prev]);
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          '회의실 생성 중 오류가 발생했습니다.'
      );
    }
  };

  // 사용 시작/중지
  const toggleActive = async (roomId: string) => {
    if (!canManage) return;
    if (workspaceId == null) {
      alert('워크스페이스를 먼저 선택해 주세요.');
      return;
    }

    const prevRooms = rooms;
    const target = rooms.find(r => r.id === roomId);
    if (!target) return;

    const nextStatus: Status =
      target.status === 'available' ? 'unavailable' : 'available';
    const endpoint =
      nextStatus === 'available'
        ? `/workspaces/${workspaceId}/spaces/${roomId}/activate`
        : `/workspaces/${workspaceId}/spaces/${roomId}/deactivate`;

    setRooms(rs =>
      rs.map(r => (r.id === roomId ? { ...r, status: nextStatus } : r))
    );

    try {
      await api.patch(endpoint);
    } catch (err: any) {
      setRooms(prevRooms);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          '상태 변경 중 오류가 발생했습니다.'
      );
    }
  };

  // 삭제
  const handleDelete = async (roomId: string) => {
    if (!canManage) return;
    if (workspaceId == null) {
      alert('워크스페이스를 먼저 선택해 주세요.');
      return;
    }
    const ok = window.confirm('이 회의실을 삭제할까요?');
    if (!ok) return;

    const prev = rooms;
    setRooms(prev => prev.filter(r => r.id !== roomId));
    try {
      await api.delete(`/workspaces/${workspaceId}/spaces/${roomId}`);
    } catch (err: any) {
      setRooms(prev);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          '회의실 삭제 중 오류가 발생했습니다.'
      );
    }
  };

  // 수정 열기/저장
  const openEditDialog = (room: Room) => {
    if (!canManage) return;
    setEditTarget(room);
    setEditOpen(true);
  };

  const handleEditRoomSave = async (form: NewRoom) => {
    if (!canManage) return;
    if (workspaceId == null || !editTarget) {
      alert('워크스페이스 혹은 대상 회의실이 없습니다.');
      return;
    }
    try {
      const payload = {
        name: form.name,
        description: form.description || '',
        location: form.location || '',
        capacity: form.capacity,
        requiresApproval: form.requiresApproval,
        amenities: form.amenities,
        images: form.images.filter(i => i.imageUrl.trim().length > 0), // ← 수정 시에도 전송
      };
      const { data } = await api.patch<ApiSpace>(
        `/workspaces/${workspaceId}/spaces/${editTarget.id}`,
        payload
      );
      const updated = mapApiToRoom(data);
      setRooms(prev =>
        prev.map(r => (r.id === editTarget.id ? { ...updated } : r))
      );
      setEditOpen(false);
      setEditTarget(null);
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          '회의실 수정 중 오류가 발생했습니다.'
      );
    }
  };

  // 편집 다이얼로그 초기값
  const editInitial: NewRoom | undefined = editTarget
    ? {
        name: editTarget.name,
        description: editTarget.description,
        location: editTarget.location,
        capacity: editTarget.capacity,
        requiresApproval: editTarget.approvalPolicy === 'approval_required',
        amenities: editTarget.facilities,
        images: editTarget.images ?? [],
      }
    : undefined;

  return (
    <MainLayout activePage="meeting-rooms">
      <div className="space-y-6 p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              회의실 관리
            </h1>
            <p className="text-gray-600">
              회의실 현황을 관리하고 설정을 변경하세요
            </p>
          </div>
          {/* 관리자에게만 생성 버튼 */}
          {canManage && <AddMeetingRoomDialog onAdd={handleAddRoom} />}
        </div>

        {/* 통계 */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="전체 회의실"
            value={totalRooms}
            icon={Building2}
            valueClassName="text-blue-600"
          />
          <StatCard
            label="사용 가능"
            value={availableRooms}
            icon={Building2}
            valueClassName="text-green-600"
          />
          <StatCard
            label="사용 중지"
            value={unavailableRooms}
            icon={Cog}
            valueClassName="text-red-600"
          />
          <StatCard
            label="평균 이용률"
            value={`${avgUtilRate}%`}
            icon={Users}
            valueClassName="text-purple-600"
          />
        </div>

        {/* 검색 + 필터 */}
        <SearchFilterBar<RoomFilter>
          placeholder="회의실명, 위치, 설명으로 검색..."
          query={q}
          onQueryChange={setQ}
          filters={FILTERS}
          activeKey={k}
          onChange={setK}
        />

        {/* 카드 그리드 */}
        <div className="grid grid-flow-row-dense gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {filteredRooms.map(room => (
            <MeetingRoomCard
              key={room.id}
              {...room}
              images={room.images}
              canManage={canManage}
              onToggleActive={() => toggleActive(room.id)}
              onDelete={() => handleDelete(room.id)}
              onEdit={() => openEditDialog(room)}
            />
          ))}
        </div>

        {/* 수정 다이얼로그 */}
        <AddMeetingRoomDialog
          mode="edit"
          open={editOpen}
          onOpenChange={setEditOpen}
          initial={editInitial}
          onSave={handleEditRoomSave}
        />
      </div>
    </MainLayout>
  );
}
