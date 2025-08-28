'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/management/StatCard';
import { Building2, Cog, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MeetingRoomsPage() {
  // TODO: 추후 서버 데이터로 교체
  const totalRooms = 8;
  const availableRooms = 7;
  const maintenanceRooms = 1;
  const utilizationRate = 51;

  const handleAddRoom = () => {
    // TODO: 모달 열기 or 페이지 이동 로직
    alert('회의실 추가 모달');
  };

  return (
    <MainLayout activePage="meeting-rooms">
      <div className="p-12">
        {/* 헤더 */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              회의실 관리
            </h1>
            <p className="text-gray-600">
              회의실 현황을 관리하고 설정을 변경하세요
            </p>
          </div>
          <Button onClick={handleAddRoom}>
            <Plus /> 회의실 추가
          </Button>
        </div>

        {/* 4개 통계 카드 */}
        <div className="grid grid-cols-4 gap-4 w-full">
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
            value={utilizationRate}
            icon={Users}
            valueClassName="text-purple-600"
          />
        </div>
      </div>
    </MainLayout>
  );
}
