'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/management/StatCard';
import { Building2, Cog, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchFilterBar, {
  type FilterItem,
} from '@/components/management/SearchFilterBar';

type RoomFilter = 'all' | 'available' | 'unavailable' | 'maintenance';

const FILTERS: FilterItem<RoomFilter>[] = [
  { key: 'all', label: '전체' },
  { key: 'available', label: '사용가능' },
  { key: 'unavailable', label: '사용불가' },
  { key: 'maintenance', label: '점검중' },
];

export default function MeetingRoomsPage() {
  // TODO: 서버 데이터 연동
  const totalRooms = 8;
  const availableRooms = 7;
  const maintenanceRooms = 1;
  const utilizationRate = 51;

  const [q, setQ] = React.useState('');
  const [k, setK] = React.useState<RoomFilter>('all');

  const handleAddRoom = () => {
    // TODO: 모달 열기 or 페이지 이동
    alert('회의실 추가 모달');
  };

  return (
    <MainLayout activePage="meeting-rooms">
      <div className="p-6 space-y-6">
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
          <Button onClick={handleAddRoom} aria-label="회의실 추가">
            <Plus className="mr-2 h-4 w-4" />
            회의실 추가
          </Button>
        </div>

        {/* 통계 카드 (반응형 1→2→4열) */}
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
            value={`${utilizationRate}%`}
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
      </div>
    </MainLayout>
  );
}
