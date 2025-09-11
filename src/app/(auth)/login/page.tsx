'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

const SERVER = process.env.NEXT_PUBLIC_API_BASE_URL!;
// const SERVER = 'https://placeit-server-332546556871.asia-northeast1.run.app';
// const SERVER = 'http://localhost:3000';

export default function LoginPage() {
  const handleKakaoLogin = () => {
    window.location.href = `${SERVER}/auth/kakao`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${SERVER}` + `/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50/30">
      <div className="w-full max-w-md">
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
          <p className="text-lg text-gray-600">
            워크스페이스 회의실 예약 시스템
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full shadow-xl border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                시작하기
              </CardTitle>
              <CardDescription className="text-gray-600">
                소셜 계정으로 간편하게 로그인하세요
              </CardDescription>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-4 mb-6">
              {/* Google Login */}
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-12 border-gray-200 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    G
                  </div>
                  Google로 계속하기
                </div>
              </Button>

              {/* Kakao Login */}
              <Button
                onClick={handleKakaoLogin}
                className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-yellow-400 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">K</span>
                  </div>
                  카카오로 계속하기
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          로그인하시면
          <a href="#" className="text-blue-600 hover:underline">
            서비스 약관
          </a>
          과{' '}
          <a href="#" className="text-blue-600 hover:underline">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </div>
      </div>
    </div>
  );
}
