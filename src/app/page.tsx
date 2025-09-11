'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Clock, Users, Shield, Zap, Smartphone } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: '직관적인 예약',
      description: '간단한 클릭으로 회의실과 공간을 예약하고 관리하세요.',
    },
    {
      icon: <Clock className="h-8 w-8 text-green-600" />,
      title: '실시간 현황',
      description:
        '실시간으로 공간 사용 현황을 확인하고 효율적으로 관리하세요.',
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: '팀 협업',
      description: '팀원들과 함께 공간을 공유하고 협업을 강화하세요.',
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: '안전한 관리',
      description: '권한 기반 접근 제어로 안전하게 공간을 관리하세요.',
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: '빠른 성능',
      description: '최적화된 성능으로 빠르고 원활한 사용 경험을 제공합니다.',
    },
    {
      icon: <Smartphone className="h-8 w-8 text-indigo-600" />,
      title: '모바일 최적화',
      description: '언제 어디서나 모바일로 편리하게 예약하고 관리하세요.',
    },
  ];

  const stats = [
    { label: '활성 사용자', value: '10,000+' },
    { label: '예약 완료', value: '50,000+' },
    { label: '관리 공간', value: '1,000+' },
    { label: '고객 만족도', value: '98%' },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
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

            <Link href="/login">
              <Button>서비스 시작하기</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              공간 예약의
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                새로운 기준
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              PlaceIt으로 회의실, 공용 공간을 더 스마트하게 관리하세요.
              <br />
              직관적인 인터페이스와 강력한 기능으로 공간 활용도를 극대화하세요.
            </p>
            <div className="flex justify-center">
              <Link href="/login">
                <Button size="lg" className="min-w-[200px]">
                  서비스 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              왜 PlaceIt을 선택해야 할까요?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              현대적인 워크스페이스를 위한 완벽한 공간 관리 솔루션
            </p>
          </div>

          <div className="grid-responsive">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow animate-fade-in"
              >
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 gradient-primary">
        <div className="container">
          <div className="text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              지금 바로 시작해보세요
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              무료로 PlaceIt을 체험하고 공간 관리의 새로운 차원을 경험해보세요.
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                서비스 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-gray-900 text-white">
        <div className="container">
          <div className="text-center">
            <div className="brand-logo mb-6 flex justify-center">
              <Image
                src="/icon.svg"
                alt="PlaceIt Icon"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <Image
                src="/logo.svg"
                alt="PlaceIt"
                width={160}
                height={32}
                className="h-8 ml-3"
              />
            </div>
            <p className="text-gray-400 mb-4 text-lg">
              스마트한 공간 예약 관리 시스템
            </p>
            <p className="text-gray-500 text-sm">
              회의실과 공용 공간을 더 효율적으로 관리하세요
            </p>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PlaceIt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
