'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Calendar,
  Building,
  Users,
  Settings,
  FileText,
  UserCog,
  Shield,
  Building2,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { usePathname } from 'next/navigation';
import { fetchMyWorkspaces } from '@/services/workspaces';

interface SidebarProps {
  activePage?: string;
  userName?: string;
}

export function Sidebar({
  activePage = 'dashboard',
  userName = '김관리자',
}: SidebarProps) {
  const { user } = useUserStore();
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;

  const [workspaceCount, setWorkspaceCount] = useState<number>(0);

  const pathname = usePathname();
  const normalize = (p: string) => (p.endsWith('/') ? p.slice(0, -1) : p);

  // 워크스페이스 개수 가져오기
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMyWorkspaces();

        // 응답이 배열인 경우 vs { workspaces: [...] }인 경우 모두 처리
        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.workspaces)
          ? res.workspaces
          : [];

        // 삭제/비활성 필터가 필요하면 여기서 걸러줘
        const visible = items.filter((w: any) => !w?.deleted); // 필요 없으면 이 줄 삭제
        setWorkspaceCount(visible.length);
      } catch (e) {
        console.error('워크스페이스 불러오기 실패:', e);
        setWorkspaceCount(0); // 실패 시 0으로
      }
    })();
  }, []);

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
      subItems: [
        {
          id: 'reservation-status',
          label: '예약 현황',
          subtitle: '일/주/월 뷰 예약 확인',
          href: '/reservations',
          icon: Calendar,
        },
        {
          id: 'reservation-requests',
          label: '예약 요청 관리',
          subtitle: '승인/거부 처리',
          href: '/reservations/requests',
          icon: FileText,
        },
      ],
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
      subItems: [
        {
          id: 'user-management',
          label: '사용자 관리',
          subtitle: '개별 사용자 권한 설정',
          href: '/users', // 목록/개별 사용자 권한 페이지
          icon: UserCog, // (원하면 Users로 둬도 OK)
        },
        {
          id: 'group-management',
          label: '그룹 관리',
          subtitle: '그룹별 권한 관리',
          href: '/users/groups', // 그룹 관리 페이지
          icon: Shield, // (원하면 Users로 둬도 OK)
        },
      ],
    },

    {
      id: 'workspace',
      label: '워크스페이스 관리',
      subtitle: '초대코드 관리',
      icon: Building2,
      href: '/workspace',
      badge: workspaceCount > 0 ? String(workspaceCount) : null,
    },
  ];

  const todaySummary = [
    {
      id: 'today-reservations',
      label: '오늘 예약',
      subtitle: `${currentMonth}월 ${currentDay}일 예약 현황`,
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
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                user.role === 'admin'
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600'
              }`}
            >
              <span className="text-white font-bold text-sm">
                {userName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900">
                {userName}
              </div>
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
                const isActive =
                  normalize(pathname) === normalize(item.href) ||
                  pathname.startsWith(`${normalize(item.href)}/`);

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

                    {/* 하위메뉴 */}
                    {item.subItems && isActive && (
                      <ul className="ml-6 mt-2 space-y-1">
                        {item.subItems.map(subItem => {
                          const SubIcon = subItem.icon;
                          const isSubActive =
                            normalize(pathname) === normalize(subItem.href);

                          return (
                            <li key={subItem.id}>
                              <Link
                                href={subItem.href}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                                  isSubActive
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                              >
                                <SubIcon className="w-4 h-4" />
                                <div className="text-left">
                                  <div
                                    className={`font-medium text-sm ${
                                      isSubActive
                                        ? 'text-blue-700'
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    {subItem.label}
                                  </div>
                                  <div
                                    className={`text-xs ${
                                      isSubActive
                                        ? 'text-blue-500'
                                        : 'text-gray-500'
                                    }`}
                                  >
                                    {subItem.subtitle}
                                  </div>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
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
      </div>
    </aside>
  );
}
