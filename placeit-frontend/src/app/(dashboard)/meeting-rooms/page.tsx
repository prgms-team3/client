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
} from '@/components/management/MeetingRoomCard';
import AddMeetingRoomDialog, {
  type NewRoom,
} from '@/components/management/AddMeetingRoomDialog';

type Status = 'available' | 'unavailable' | 'maintenance';
type RoomFilter = 'all' | Status;
type ApprovalPolicy = 'auto' | 'approval_required';

const FILTERS: FilterItem<RoomFilter>[] = [
  { key: 'all', label: '전체' },
  { key: 'available', label: '사용가능' },
  { key: 'unavailable', label: '사용불가' },
  { key: 'maintenance', label: '점검중' },
];

// MeetingRoomCard props + id + 승인정책
type Room = MeetingRoomCardProps & {
  id: string;
  approvalPolicy: ApprovalPolicy;
};

export default function MeetingRoomsPage() {
  const [q, setQ] = React.useState('');
  const [k, setK] = React.useState<RoomFilter>('all');

  const [rooms, setRooms] = React.useState<Room[]>([
    {
      id: 'r1',
      name: '회의실 A',
      description: '소규모 팀 회의에 적합',
      location: '1층 동쪽',
      capacity: 8,
      monthlyReservations: 0,
      utilizationRate: 0,
      status: 'maintenance',
      facilities: ['whiteboard', 'wifi', 'mic', 'video_conf', 'smart_tv'],
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
      approvalPolicy: 'approval_required',
    },
    {
      id: 'r2',
      name: '회의실 B',
      description: '중규모 팀 브리핑용',
      location: '2층 서쪽',
      capacity: 12,
      monthlyReservations: 0,
      utilizationRate: 0,
      status: 'available',
      facilities: ['monitor', 'wifi', 'speaker', 'whiteboard'],
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
      approvalPolicy: 'auto',
    },
  ]);

  // 통계(전체 기준)
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
  const avgUtilRate =
    Math.round(
      (rooms.reduce((s, r) => s + (r.utilizationRate || 0), 0) /
        Math.max(rooms.length, 1)) *
        10
    ) / 10;

  // 검색 + 필터 결과
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

  const handleStatusChange = (id: string, next: Status) => {
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, status: next } : r)));
  };

  // 새 회의실 추가
  const handleAddRoom = (room: NewRoom) => {
    const id =
      (typeof crypto !== 'undefined' &&
        'randomUUID' in crypto &&
        crypto.randomUUID()) ||
      `r-${Date.now()}`;

    setRooms(prev => [
      {
        id,
        name: room.name,
        description: room.description,
        location: room.location,
        capacity: room.capacity,
        monthlyReservations: 0,
        utilizationRate: 0,
        status: room.status,
        facilities: room.facilities,
        imageUrl: room.imageUrl,
        approvalPolicy: room.approvalPolicy,
      },
      ...prev,
    ]);
  };

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
          <AddMeetingRoomDialog onAdd={handleAddRoom} />
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
            label="점검중"
            value={maintenanceRooms}
            icon={Cog}
            valueClassName="text-orange-600"
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
              onStatusChange={next => handleStatusChange(room.id, next)}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
