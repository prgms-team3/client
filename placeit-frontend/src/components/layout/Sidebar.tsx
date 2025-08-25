import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Calendar,
  Building,
  Users,
  Tablet,
  Settings,
  User,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  activePage?: string;
}

export function Sidebar({ activePage = 'dashboard' }: SidebarProps) {
  const navigationItems = [
    {
      id: 'dashboard',
      label: '대시보드',
      subtitle: '예약 현황',
      icon: Home,
      href: '/dashboard',
      badge: null,
    },
    {
      id: 'reservations',
      label: '예약 관리',
      subtitle: '5건의 예약',
      icon: Calendar,
      href: '/reservations',
      badge: '5',
    },
    {
      id: 'meeting-rooms',
      label: '회의실 관리',
      subtitle: '8개 회의실',
      icon: Building,
      href: '/meeting-rooms',
      badge: '8',
    },
    {
      id: 'users',
      label: '사용자 관리',
      subtitle: '시스템 사용자',
      icon: Users,
      href: '/users',
      badge: '24',
    },
    {
      id: 'workspace',
      label: '워크스페이스 관리',
      subtitle: '초대코드 관리',
      icon: Tablet,
      href: '/workspace',
      badge: '2',
    },
  ];

  const todaySummary = [
    {
      id: 'today-reservations',
      label: '오늘 예약',
      subtitle: '09:00-10:00에 첫 회의',
      icon: Calendar,
      badge: '2건',
      badgeColor: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'pending',
      label: '대기 중',
      subtitle: '승인이 필요한 예약이 있습니다',
      icon: FileText,
      badge: '2건',
      badgeColor: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <aside className="w-64 bg-white text-gray-900 h-full overflow-y-auto relative border-r border-gray-200 min-w-64">
      <div className="p-6 pt-8 flex flex-col h-full">
        {/* 워크스페이스 섹션 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">
            애플
          </h2>

          {/* 사용자 정보 */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 mb-6 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900">관리자</div>
              <div className="text-xs text-gray-600">admin@company.com</div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="w-full h-px bg-gray-200 mb-6"></div>

          {/* 메인 네비게이션 */}
          <nav>
            <ul className="space-y-1">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? 'text-white' : 'text-gray-600'
                          }`}
                        />
                        <div className="text-left">
                          <div
                            className={`font-semibold ${
                              isActive
                                ? 'text-white text-base'
                                : 'text-sm text-gray-900'
                            }`}
                          >
                            {item.label}
                          </div>
                          <div
                            className={`${
                              isActive
                                ? 'text-blue-100 text-sm'
                                : 'text-xs text-gray-500'
                            }`}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className={`${
                            isActive
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* 오늘 요약 */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-gray-900 mb-4">오늘 요약</h3>
          <ul className="space-y-3">
            {todaySummary.map(item => {
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  <div
                    className={`relative p-4 ${item.bgColor} rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200`}
                  >
                    {' '}
                    <div className="flex items-start flex-col gap-1">
                      <div className="flex gap-2">
                        <Icon
                          className={`w-5 h-5 ${
                            item.id === 'today-reservations'
                              ? 'text-blue-600'
                              : 'text-orange-600'
                          }`}
                        />
                        <div className="font-semibold text-sm text-gray-900">
                          {item.label}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs mt-1 ${
                            item.id === 'today-reservations'
                              ? 'text-blue-600'
                              : 'text-orange-600'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={`absolute top-3 right-3 ${item.badgeColor} shadow-sm`}
                    >
                      {item.badge}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 여백을 채우는 div */}
        <div className="flex-1"></div>

        {/* 설정 - 하단 고정 */}
        <div className="mt-auto">
          <Link
            href="/settings"
            className="flex items-center gap-3 p-4 text-gray-700 hover:bg-gray-50 hover:shadow-sm rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
          >
            <Settings className="w-5 h-5" />
            <div>
              <div className="font-semibold text-sm">설정</div>
              <div className="text-xs text-gray-500">프로필 설정</div>
            </div>
          </Link>
        </div>

        {/* 하단 N 로고 */}
        <div className="absolute bottom-4 left-4">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
            <span className="text-white font-bold text-lg">N</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
