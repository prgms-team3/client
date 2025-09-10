'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, Building, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { CreateWorkspace } from '@/types/workspace';

type Mode = 'has-code' | 'no-code';

export default function InviteFlowPage() {
  const [mode, setMode] = useState<Mode>('has-code');

  // has-code
  const [inviteCode, setInviteCode] = useState('');
  const isValidInvite = inviteCode.trim().length >= 6;

  // no-code
  const [workspaceName, setWorkspaceName] = useState('');

  const router = useRouter();
  const { joinWorkspace, createWorkspace } = useUserStore();

  const handleContinue = async () => {
    if (mode === 'has-code') {
      if (!isValidInvite) return;
      try {
        await joinWorkspace(inviteCode.trim());
        router.replace('/dashboard');
      } catch {
        // 실패 시 조용히 무시 (필요하면 토스트 추가)
      }
    } else {
      if (!workspaceName.trim()) return;
      const payload: CreateWorkspace = { name: workspaceName.trim() };
      try {
        await createWorkspace(payload);
        router.replace('/dashboard');
      } catch {
        // 실패 시 조용히 무시 (필요하면 토스트 추가)
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl">
        {/* Header */}
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

        {/* Main Card */}
        <Card className="w-full shadow-xl border-0">
          <CardContent className="p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  환영합니다!
                </h1>
                <span className="text-2xl">🎉</span>
              </div>
              <p className="text-lg text-gray-600">
                초대코드를 받으셨나요? 참여 방법을 선택해주세요
              </p>
            </div>

            {/* Options */}
            <RadioGroup
              value={mode}
              onValueChange={(v: Mode) => setMode(v)}
              className="space-y-4 mb-6"
            >
              {/* has-code */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem
                  value="has-code"
                  id="has-code"
                  className="mt-1"
                />
                <Label
                  htmlFor="has-code"
                  className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    mode === 'has-code'
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

              {/* no-code */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="no-code" id="no-code" className="mt-1" />
                <Label
                  htmlFor="no-code"
                  className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    mode === 'no-code'
                      ? 'border-purple-500 bg-purple-50'
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

            {/* Dynamic Section */}
            {mode === 'has-code' ? (
              <div className="p-4 bg-white rounded-lg border border-gray-200 mb-8">
                <Label
                  htmlFor="invite-code"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  초대코드를 입력해주세요
                </Label>
                <Input
                  id="invite-code"
                  type="text"
                  placeholder="예: STARTUP2025"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="p-4 bg-white rounded-lg border border-gray-200 mb-8">
                <div className="space-y-4">
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
                      placeholder="예: PlacIt"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="text-center mb-8">
              <Button
                onClick={handleContinue}
                disabled={
                  mode === 'has-code' ? !isValidInvite : !workspaceName.trim()
                }
                className={`px-8 py-3 rounded-lg ${
                  mode === 'has-code'
                    ? isValidInvite
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : workspaceName.trim()
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>
                  {mode === 'has-code' ? '계속하기' : '워크스페이스 만들기'}
                </span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    초대코드란?
                  </h3>
                  <p className="text-gray-600">
                    워크스페이스에 참여하기 위한 고유한 코드입니다. 팀 관리자나
                    동료로부터 받을 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Back link */}
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
