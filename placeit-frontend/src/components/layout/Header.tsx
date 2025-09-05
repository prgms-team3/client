'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Copy, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

export function Header() {
  const router = useRouter();
  const { user, reset } = useUserStore(s => ({ user: s.user, reset: s.reset }));

  // SSR/rehydration 타이밍 불일치 방지
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // 안전 접근 + 표기용 유틸
  const roleKey = (user?.role ?? 'guest').toString().toUpperCase();
  const isAdmin = roleKey === 'ADMIN' || roleKey === 'SUPER_ADMIN';
  const displayRoleKo =
    roleKey === 'GUEST' ? '게스트' : isAdmin ? '관리자' : '사용자';
  const displayName = user?.name ?? '게스트';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('STARTUP2024');
      // 필요하면 여기서 토스트 호출
    } catch {
      // 실패해도 크래시 없이 무시
    }
  };

  const handleLogout = () => {
    alert('로그아웃');
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* 브랜드 로고 */}
        <button
          type="button"
          className="brand-logo flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push('/dashboard')}
        >
          <Image
            src="/icon.svg"
            alt="PlaceIt Icon"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <Image
            src="/logo.svg"
            alt="PlaceIt"
            width={120}
            height={24}
            className="h-6"
          />
        </button>

        {/* 우측 정보 */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            {/* (예시) 조직/직무 라벨이 따로 있다면 값 주입 */}
            <span className="text-gray-700">경영진</span>
            <span className="text-gray-400">|</span>

            {/* 사용자 이름 + 역할 */}
            <span className={isAdmin ? 'text-red-600' : 'text-blue-600'}>
              {displayName} ({displayRoleKo})
            </span>

            <span className="text-gray-400">|</span>

            {/* 초대코드 복사 */}
            <div className="flex items-center">
              <span className="text-blue-600">STARTUP2024</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="p-1 h-6 w-6 text-gray-500 hover:bg-gray-50 ml-1"
                aria-label="초대코드 복사"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* 로그아웃 */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400">|</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">로그아웃</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
