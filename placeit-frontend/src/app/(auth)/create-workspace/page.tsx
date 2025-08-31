'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateWorkspacePage() {
  const [workspaceName, setWorkspaceName] = useState('placeit');
  const [inviteCode, setInviteCode] = useState('CKUYL6');
  const router = useRouter();

  const generateNewCode = () => {
    // 간단한 랜덤 코드 생성 (실제로는 더 복잡한 로직 필요)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInviteCode(result);
  };

  const handleContinue = () => {
    if (workspaceName.trim() && inviteCode.trim()) {
      // TODO: 워크스페이스 생성 로직
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50/30">
      <div className="w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="brand-logo">
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
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="w-full shadow-xl border-0">
          <CardContent className="p-8">
            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                관리자인가요? 초대코드를 생성하세요
              </h1>
            </div>

            {/* Input Fields */}
            <div className="space-y-6 mb-8">
              {/* Workspace Name */}
              <div>
                <Label
                  htmlFor="workspace-name"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  워크스페이스명
                </Label>
                <Input
                  id="workspace-name"
                  type="text"
                  value={workspaceName}
                  onChange={e => setWorkspaceName(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  워크스페이스의 대표명을 정의할 수 있는 한글을 권장합니다.
                </p>
              </div>

              {/* Simple Invitation Code */}
              <div>
                <Label
                  htmlFor="invite-code"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  심플 초대코드
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="invite-code"
                    type="text"
                    value={inviteCode}
                    readOnly
                    className="flex-1 font-mono"
                  />
                  <Button
                    onClick={generateNewCode}
                    variant="outline"
                    size="sm"
                    className="px-4 border-gray-200 hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    코드 재생성
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  함께할 사용자 추가에 활용할 코드입니다.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center mb-8">
              <Button
                onClick={handleContinue}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <span>다음</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Return Link */}
            <div className="text-center">
              <Link
                href="/invite-check"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                이전 단계로 돌아가기
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
