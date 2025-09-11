import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUserStore } from '@/stores/userStore';

interface MainLayoutProps {
  children: React.ReactNode;
  activePage?: string;
}

export function MainLayout({
  children,
  activePage = 'dashboard',
}: MainLayoutProps) {
  const { user } = useUserStore();

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <Sidebar activePage={activePage} userName={user?.name ?? '게스트'} />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
