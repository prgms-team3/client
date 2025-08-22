import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Copy, LogOut } from 'lucide-react';

interface HeaderProps {
  // 날짜와 시스템 상태는 제거
}

export function Header({}: HeaderProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText('STARTUP2024');
  };

  const handleLogout = () => {
    console.log('로그아웃');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="brand-logo">
          <img src="/icon.svg" alt="PlaceIt Icon" className="w-8 h-8" />
          <img src="/logo.svg" alt="PlaceIt" className="h-6" />
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">경영진</span>
            <span className="text-gray-400">|</span>
            <span className="text-blue-600">홍길동 (관리자)</span>
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
