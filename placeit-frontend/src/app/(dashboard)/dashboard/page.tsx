'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { MeetingRoomCard } from '@/components/dashboard/MeetingRoomCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Building,
} from 'lucide-react';

// 샘플 데이터
const sampleRooms = [
  {
    id: '1',
    name: '회의실1',
    description: '소규모 팀 회의에 적합',
    capacity: 8,
    features: ['프로젝터', '화이트보드', 'WiFi'],
    status: 'available' as const,
    imageUrl: '/images/meeting-room-1.svg',
  },
  {
    id: '2',
    name: '소회의실',
    description: '간단한 미팅용',
    capacity: 4,
    features: ['모니터', 'WiFi'],
    status: 'available' as const,
    imageUrl: '/images/meeting-room-2.svg',
  },
  {
    id: '3',
    name: '대회의실',
    description: '대규모 회의 및 발표',
    capacity: 20,
    features: ['프로젝터', '화이트보드', '오디오', 'WiFi'],
    status: 'occupied' as const,
    imageUrl: '/images/meeting-room-3.svg',
    reservedTime: '10:00-10:30',
  },
  {
    id: '4',
    name: '창의실',
    description: '브레인스토밍 및 아이디어 회의',
    capacity: 6,
    features: ['화이트보드', 'WiFi', 'TV'],
    status: 'available' as const,
    imageUrl: '/images/meeting-room-4.svg',
  },
  {
    id: '5',
    name: '미니룸',
    description: '1:1 면담 및 소규모 미팅',
    capacity: 2,
    features: ['WiFi', '모니터'],
    status: 'available' as const,
    imageUrl: '/images/meeting-room-5.svg',
  },
  {
    id: '6',
    name: '세미나실',
    description: '교육 및 세미나 진행',
    capacity: 15,
    features: ['프로젝터', '스크린', '오디오', 'WiFi'],
    status: 'available' as const,
    imageUrl: '/images/meeting-room-6.svg',
  },
];

const timeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(18);
  const [selectedTime, setSelectedTime] = useState('10:00');

  // 페이지 로드 시 초기 버튼 상태 설정
  useEffect(() => {
    const leftArrow = document.getElementById('leftArrow') as HTMLButtonElement;
    if (leftArrow) {
      leftArrow.disabled = true; // 초기에는 왼쪽으로 스크롤할 수 없음
    }
  }, []);

  const handleReserve = (roomId: string) => {
    alert(`회의실 ${roomId} 예약을 진행합니다.`);
  };

  const handleDateSelect = (date: number) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  return (
    <MainLayout activePage="dashboard">
      <div className="p-6 space-y-8 pb-12">
        {/* 대시보드 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              워크스페이스 대시보드
            </h1>
          </div>
          <p className="text-gray-600">
            회의실을 효율적으로 관리하고 예약하세요
          </p>
        </div>

        {/* 정보 바 */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              2025년 8월 18일 월요일 오후 01:36
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              시스템 상태: 정상
            </div>
          </div>
        </div>

        {/* 통계 카드들 - 2개만 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="오늘 예약"
            value="2건"
            description="일/주/월 뷰로 확인"
            icon={Calendar}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="확정된 예약"
            value="3건"
            description="이번 주 전체 확정된 예약"
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
        </div>

        {/* 회의실 예약 섹션 */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              회의실 예약
            </h2>
            <p className="text-gray-600">
              원하는 회의실과 시간을 선택하여 예약하세요
            </p>
          </div>

          {/* 회의실 선택 - 4개 카드 슬라이드 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">회의실 선택</h3>
            </div>
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* 왼쪽 화살표 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const slider = document.getElementById('roomSlider');
                      if (slider) slider.scrollLeft -= 300;
                    }}
                    className="flex-shrink-0 w-10 h-10 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    id="leftArrow"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </Button>

                  {/* 회의실 카드 슬라이더 */}
                  <div
                    className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide scroll-smooth flex-1"
                    id="roomSlider"
                    onScroll={e => {
                      const target = e.target as HTMLElement;
                      const leftArrow = document.getElementById(
                        'leftArrow'
                      ) as HTMLButtonElement;
                      const rightArrow = document.getElementById(
                        'rightArrow'
                      ) as HTMLButtonElement;

                      // 왼쪽 화살표 활성화/비활성화
                      if (leftArrow) {
                        leftArrow.disabled = target.scrollLeft <= 0;
                      }

                      // 오른쪽 화살표 활성화/비활성화
                      if (rightArrow) {
                        const maxScrollLeft =
                          target.scrollWidth - target.clientWidth;
                        rightArrow.disabled =
                          target.scrollLeft >= maxScrollLeft;
                      }
                    }}
                  >
                    {sampleRooms.map(room => (
                      <div key={room.id} className="flex-shrink-0 w-72">
                        <MeetingRoomCard {...room} onReserve={handleReserve} />
                      </div>
                    ))}
                  </div>

                  {/* 오른쪽 화살표 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const slider = document.getElementById('roomSlider');
                      if (slider) slider.scrollLeft += 300;
                    }}
                    className="flex-shrink-0 w-10 h-10 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    id="rightArrow"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 날짜/시간 선택 - 2컬럼 레이아웃 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 날짜 선택 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">날짜 선택</h3>
              </div>
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h4 className="text-lg font-semibold text-gray-900">
                      2025년 8월
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 달력 그리드 */}
                  <div className="grid grid-cols-7 gap-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-gray-500 py-2"
                      >
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                      <button
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={`p-2 text-sm rounded-lg transition-colors ${
                          selectedDate === date
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 text-sm text-gray-600 space-y-2">
                    <p>• 주말은 예약할 수 없습니다</p>
                    <p>• 당일부터 예약 가능합니다 (오늘: 18일)</p>
                    <p>• 날짜를 클릭하면 빠른 예약이 가능합니다</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 시간 선택 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">시간 선택</h3>
              </div>
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-6 gap-2">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`p-3 text-sm rounded-lg border transition-colors ${
                          selectedTime === time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : time === '10:00' || time === '10:30'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : time === '12:00' || time === '12:30'
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                        disabled={time === '12:00' || time === '12:30'}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-200 rounded"></div>
                      <span>예약 가능</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-100 rounded"></div>
                      <span>예약됨</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-100 rounded"></div>
                      <span>사용 불가</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded"></div>
                      <span>선택됨</span>
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-gray-600 space-y-2">
                    <p>• 12:00-13:00는 점심시간으로 예약이 불가합니다</p>
                    <p>• 30분 단위로 예약 가능합니다</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
