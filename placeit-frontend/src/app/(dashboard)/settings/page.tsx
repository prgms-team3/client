'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

export default function SettingsPage() {
  return (
    <MainLayout activePage="settings">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">프로필 설정</h1>
          <p className="text-gray-600">개인 정보와 계정 설정을 관리하세요</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-600">프로필 설정 기능이 준비 중입니다.</p>
        </div>
      </div>
    </MainLayout>
  );
}
