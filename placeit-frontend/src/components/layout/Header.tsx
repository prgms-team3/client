import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Copy, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { useLogout } from '@/hooks/useLogout';

export function Header() {
  const router = useRouter();
  const { user } = useUserStore();
  const { logout, loading } = useLogout({ redirectTo: '/login' });

  const handleCopy = () => {
    navigator.clipboard.writeText('STARTUP2024');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div
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
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">게스트</span>
            <span className="text-gray-400">|</span>
            <span
              className={`${
                user?.role === 'admin' ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              {user?.name} ({user?.role === 'admin' ? '관리자' : '사용자'})
            </span>
            <span className="text-gray-400">|</span>
            <div className="flex items-center">
              <span className="text-blue-600">STARTUP2024</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="p-1 h-6 w-6 text-gray-500 hover:bg-gray-50 ml-1"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400">|</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              disabled={loading}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">
                {loading ? '로그아웃 중…' : '로그아웃'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
