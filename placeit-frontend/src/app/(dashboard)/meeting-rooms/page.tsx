'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

export default function MeetingRoomsPage() {
  return (
    <MainLayout activePage="meeting-rooms">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">회의실 관리</h1>
          <p className="text-gray-600">
            회의실 정보를 관리하고 설정을 변경하세요
          </p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-600">회의실 관리 기능이 준비 중입니다.</p>
        </div>
      </div>
    </MainLayout>
  );
}
