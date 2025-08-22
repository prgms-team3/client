'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

export default function UsersPage() {
  return (
    <MainLayout activePage="users">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 관리</h1>
          <p className="text-gray-600">
            시스템 사용자 정보를 관리하고 권한을 설정하세요
          </p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-600">사용자 관리 기능이 준비 중입니다.</p>
        </div>
      </div>
    </MainLayout>
  );
}




