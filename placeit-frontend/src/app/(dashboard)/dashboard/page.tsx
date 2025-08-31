'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { MeetingRoomCard } from '@/components/dashboard/MeetingRoomCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ReservationModal } from '@/components/reservation/ReservationModal';
import { timeSlots } from '@/data/sampleData';
import { useReservationStore } from '@/stores/reservationStore';
import { TimeSelectionGrid } from '@/components/reservation/TimeSelectionGrid';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Building,
} from 'lucide-react';

export default function DashboardPage() {
  const { rooms, reservations } = useReservationStore();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [showReservationModal, setShowReservationModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  // 페이지 로드 시 초기 버튼 상태 설정
  useEffect(() => {
    const leftArrow = document.getElementById('leftArrow') as HTMLButtonElement;
    if (leftArrow) {
      leftArrow.disabled = true; // 초기에는 왼쪽으로 스크롤할 수 없음
    }
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleCloseModal = () => {
    setShowReservationModal(false);
    setSelectedRoom(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
  };

  return (
    <MainLayout activePage="dashboard">
      <div className="p-6 pb-12 max-w-7xl mx-auto">
        {/* 대시보드 헤더 */}
        <div className="text-center mb-12">
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
              {new Date().toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              시스템 상태: 정상
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <StatCard
            title="오늘 예약"
            value="2건"
            description="일/주/월 뷰로 확인"
            icon={CalendarDays}
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
        <div className="mt-16 pt-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                회의실 예약
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              원하는 회의실과 시간을 선택하여 예약하세요
            </p>
          </div>

          {/* 회의실 선택 */}
          <div id="meeting-room-section" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                회의실 선택
              </h3>
            </div>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-8">
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

                  {/* 회의실 슬라이더 */}
                  <div
                    id="roomSlider"
                    className="flex gap-6 overflow-x-auto scrollbar-hide flex-1 px-2 scroll-smooth"
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
                    {rooms.map(room => (
                      <div
                        key={room.id}
                        className={`flex-shrink-0 w-72 transition-all duration-200 p-2 ${
                          selectedRoom?.id === room.id ? 'z-10' : 'z-0'
                        }`}
                      >
                        <MeetingRoomCard
                          {...room}
                          isSelected={selectedRoom?.id === room.id}
                          onSelect={() => handleRoomSelect(room)}
                        />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* 날짜 선택 */}
            <div id="date-section">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  날짜 선택
                </h3>
              </div>
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-8">
                  {/* Shadcn UI Calendar */}
                  <div className="rounded-md border w-full max-w-md mx-auto">
                    <div className="[&_.rdp-caption]:hidden [&_.rdp-caption_label]:hidden">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        className="w-full [--cell-size:5rem]"
                        showOutsideDays={false}
                        captionLayout="label"
                        fromYear={2024}
                        toYear={2026}
                        reservations={reservations}
                        showDetailedReservations={false}
                        disabled={date => {
                          // 주말 비활성화
                          const day = date.getDay();
                          return day === 0 || day === 6;
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-gray-600 space-y-2">
                    <p>• 주말은 예약할 수 없습니다</p>
                    <p>
                      • 당일부터 예약 가능합니다 (오늘: {new Date().getDate()}
                      일)
                    </p>
                    <p>• 날짜를 클릭하면 빠른 예약이 가능합니다</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 시간 선택 */}
            <div id="time-section">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  시간 선택
                </h3>
              </div>
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50/30">
                <CardContent className="p-8">
                  <TimeSelectionGrid
                    timeSlots={timeSlots}
                    selectedTime={selectedTime}
                    onTimeSelect={handleTimeSelect}
                    isTimeReserved={time => {
                      // 점심시간 (12:00-13:00)과 하드코딩된 예약 시간 체크
                      const isLunchTime = time === '12:00' || time === '12:30';
                      const isReserved = time === '10:00' || time === '10:30';
                      return isLunchTime || isReserved;
                    }}
                    size="large"
                    showLegend={true}
                  />

                  <div className="mt-6 text-sm text-gray-600 space-y-2">
                    <p>• 12:00-13:00는 점심시간으로 예약이 불가합니다</p>
                    <p>• 30분 단위로 예약 가능합니다</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* 예약 완료 섹션 */}
        <div className="mt-24 space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
                예약 완료
              </h3>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              모든 선택이 완료되면 예약을 진행할 수 있습니다
            </p>
          </div>

          {/* 예약 상태 표시 */}
          <Card className="border-0 shadow-2xl bg-white max-w-7xl mx-auto">
            <CardContent className="p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
                {/* 회의실 선택 */}
                <div
                  onClick={() => {
                    document
                      .getElementById('meeting-room-section')
                      ?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                  }}
                  className="group text-center p-8 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer h-48 flex flex-col justify-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-base text-gray-600 mb-3 font-medium">
                    회의실
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedRoom ? selectedRoom.name : '선택 필요'}
                  </div>
                </div>

                {/* 날짜 선택 */}
                <div
                  onClick={() => {
                    document.getElementById('date-section')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                  className="group text-center p-8 rounded-2xl border-2 border-gray-200 bg-white hover:border-green-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer h-48 flex flex-col justify-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <CalendarDays className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-base text-gray-600 mb-3 font-medium">
                    날짜
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedDate
                      ? selectedDate.toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                        })
                      : '선택 필요'}
                  </div>
                </div>

                {/* 시간 선택 */}
                <div
                  onClick={() => {
                    document.getElementById('time-section')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                  className="group text-center p-8 rounded-2xl border-2 border-gray-200 bg-white hover:border-orange-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer h-48 flex flex-col justify-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-base text-gray-600 mb-3 font-medium">
                    시간
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedTime || '선택 필요'}
                  </div>
                </div>
              </div>

              {/* 예약하기 버튼 */}
              <div className="text-center">
                {selectedRoom && selectedDate && selectedTime ? (
                  <Button
                    onClick={() => setShowReservationModal(true)}
                    className="px-16 py-5 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6" />
                      예약하기
                    </div>
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="px-16 py-5 text-xl font-medium bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 rounded-2xl cursor-not-allowed shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6" />
                      날짜, 시간, 회의실을 모두 선택해주세요
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 예약 모달 */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={handleCloseModal}
        room={selectedRoom}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        timeSlots={timeSlots}
        onTimeChange={setSelectedTime}
      />
    </MainLayout>
  );
}
