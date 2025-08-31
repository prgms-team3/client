'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Users, Building, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InviteCheckPage() {
  const [selectedOption, setSelectedOption] = useState<'has-code' | 'no-code'>(
    'has-code'
  );
  const router = useRouter();

  const handleContinue = () => {
    if (selectedOption === 'has-code') {
      router.push('/invite-code');
    } else {
      router.push('/create-workspace');
    }
  };

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
            <RadioGroup
              value={selectedOption}
              onValueChange={(value: string) =>
                setSelectedOption(value as 'has-code' | 'no-code')
              }
              className="space-y-4 mb-8"
            >
              {/* Option 1: Has Invitation Code */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem
                  value="has-code"
                  id="has-code"
                  className="mt-1"
                />
                <Label
                  htmlFor="has-code"
                  className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOption === 'has-code'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
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
                </Label>
              </div>

              {/* Option 2: No Invitation Code */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="no-code" id="no-code" className="mt-1" />
                <Label
                  htmlFor="no-code"
                  className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedOption === 'no-code'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="h-5 w-5 text-purple-600" />
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
                </Label>
              </div>
            </RadioGroup>

            {/* Continue Button */}
            <div className="text-center mb-8">
              <Button
                onClick={handleContinue}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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
