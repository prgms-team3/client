'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

export default function WorkspacePage() {
  return (
    <MainLayout activePage="workspace">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            워크스페이스 관리
          </h1>
          <p className="text-gray-600">
            워크스페이스 설정과 초대코드를 관리하세요
          </p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-600">
            워크스페이스 관리 기능이 준비 중입니다.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}




