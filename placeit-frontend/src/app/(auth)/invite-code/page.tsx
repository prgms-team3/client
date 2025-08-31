'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';

export default function InviteCodePage() {
  const [inviteCode, setInviteCode] = useState('');
  const router = useRouter();
  const { joinWorkspace } = useUserStore();

  const handleContinue = () => {
    if (inviteCode.trim()) {
      // 초대코드로 워크스페이스 참여 및 일반 사용자 역할 설정
      joinWorkspace(inviteCode);
      router.push('/dashboard');
    }
  };

  const isValidCode = inviteCode.trim().length >= 6;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  환영합니다!
                </h1>
                <span className="text-2xl">🎉</span>
              </div>
              <p className="text-lg text-gray-600">
                초대코드를 받으셨나요? 워크스페이스 참여 방법을 선택해주세요
              </p>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {/* Option 1: Has Invitation Code (Selected) */}
              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500 mt-1 flex-shrink-0"></div>
                <div className="flex-1 p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 mb-1">
                        네, 초대코드가 있어요
                      </div>
                      <div className="text-sm text-gray-600">
                        팀원이나 관리자로부터 초대코드를 받았습니다
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invitation Code Input */}
              <div className="ml-7 p-4 bg-white rounded-lg border border-gray-200">
                <Label
                  htmlFor="invite-code"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  초대코드를 입력해주세요
                </Label>
                <Input
                  id="invite-code"
                  type="text"
                  placeholder="예: STARTUP2024"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  초대코드는 영문과 숫자 조합입니다 (6자 이상)
                </p>
              </div>

              {/* Option 2: No Invitation Code */}
              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-1 flex-shrink-0"></div>
                <div className="flex-1 p-4 rounded-lg border-2 border-gray-200 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 bg-purple-600 rounded"></div>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 mb-1">
                        아니요, 없어요
                      </div>
                      <div className="text-sm text-gray-600">
                        새로운 워크스페이스를 만들고 팀원들을 초대하고 싶어요
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="text-center mb-8">
              <Button
                onClick={handleContinue}
                disabled={!isValidCode}
                className={`px-8 py-3 rounded-lg ${
                  isValidCode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>계속하기</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Information Section */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    초대코드란?
                  </h3>
                  <p className="text-gray-600 mb-3">
                    워크스페이스에 참여하기 위한 고유한 코드입니다. 팀 관리자나
                    동료로부터 받을 수 있습니다.
                  </p>
                  <p className="text-sm text-gray-500">
                    유효한 테스트 코드:{' '}
                    <span className="font-mono bg-white px-2 py-1 rounded">
                      STARTUP2024
                    </span>
                    ,{' '}
                    <span className="font-mono bg-white px-2 py-1 rounded">
                      DEV-TEAM-2024
                    </span>
                    ,{' '}
                    <span className="font-mono bg-white px-2 py-1 rounded">
                      CREATIVE2024
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Return to Login */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
