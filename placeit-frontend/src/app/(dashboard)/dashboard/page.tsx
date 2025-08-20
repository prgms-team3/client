'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, MapPin, Settings } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-6">🚧</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                개발 중입니다
              </h2>
              <p className="text-gray-600 mb-6">
                곧 멋진 대시보드로 찾아뵙겠습니다!
              </p>

              {/* 개발 예정 기능들 */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  실시간 예약 현황
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-green-600" />
                  사용자 통계
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                  공간 관리 도구
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Settings className="h-4 w-4 mr-2 text-orange-600" />
                  관리자 기능
                </div>
              </div>

              <Button variant="outline" className="w-full">
                메인 페이지로 가기기
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
