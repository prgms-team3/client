'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { fetchSpaces } from '@/services/spaces';
import type { Space } from '@/services/spaces';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { api } from '@/lib/axios';

export default function DashboardPage() {
  const router = useRouter();
  const { rooms, reservations } = useReservationStore();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [showReservationModal, setShowReservationModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  const [spaces, setSpaces] = useState<Space[]>([]);

  const [todayApproved, setTodayApproved] = useState(0);
  const [weekApproved, setWeekApproved] = useState(0);

  const currentWorkspaceId = useWorkspaceStore(s => s.currentId);
  const workspaceIdNum =
    typeof currentWorkspaceId === 'string'
      ? Number(currentWorkspaceId)
      : currentWorkspaceId ?? 1; // fallback

  // 가용 슬롯 상태
  type AvailableRange = { start: Date; end: Date };
  const [availableRanges, setAvailableRanges] = useState<
    AvailableRange[] | null
  >(null);

  // YYYY-MM-DD (로컬 기준) 포맷터
  const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  // 해당 시간(HH:mm)이 가용 범위에 포함되는지 체크
  const isTimeAvailable = (time: string) => {
    // 회의실을 선택하지 않았거나 날짜/가용정보가 없으면 모두 활성화
    if (!selectedRoom || !selectedDate || !availableRanges) return true;

    const [hh, mm] = time.split(':').map(Number);
    const dt = new Date(selectedDate);
    dt.setHours(hh, mm, 0, 0);

    // start <= dt < end 에 포함되면 "사용 가능"
    return availableRanges.some(r => dt >= r.start && dt < r.end);
  };

  // 사용 가능한 시간 불러오기
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!selectedRoom || !selectedDate) {
        setAvailableRanges(null); // 회의실이 없거나 날짜가 없으면 전체 활성화
        return;
      }
      try {
        const dateStr = toYMD(selectedDate);
        const { data } = await api.get('/reservations/available-times', {
          params: { spaceId: selectedRoom.id, date: dateStr },
        });

        const ranges: AvailableRange[] = (data?.availableSlots ?? []).map(
          (s: { startTime: string; endTime: string }) => ({
            start: new Date(s.startTime),
            end: new Date(s.endTime),
          })
        );
        setAvailableRanges(ranges);
      } catch (e) {
        console.error('가용 시간 로딩 실패', e);
        setAvailableRanges(null); // 실패 시라도 전부 활성화(선택 가능)로 둠
      }
    };

    fetchAvailableTimes();
  }, [selectedRoom, selectedDate]);

  useEffect(() => {
    if (!selectedTime || !selectedRoom || !selectedDate || !availableRanges)
      return;
    if (!isTimeAvailable(selectedTime)) {
      setSelectedTime(''); // 기존 선택 시간이 더이상 불가하면 해제
    }
  }, [availableRanges, selectedRoom, selectedDate]);

  // 현재 시간 업데이트 (클라이언트 전용)
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 페이지 로드 시 초기 버튼 상태 설정
  useEffect(() => {
    const leftArrow = document.getElementById(
      'leftArrow'
    ) as HTMLButtonElement | null;
    if (leftArrow) {
      leftArrow.disabled = true; // 초기에는 왼쪽으로 스크롤할 수 없음
    }
  }, []);

  // 회의실 목록 불러오기
  useEffect(() => {
    const loadSpaces = async () => {
      try {
        if (!workspaceIdNum) return;
        const list = await fetchSpaces(workspaceIdNum);
        setSpaces(list);
      } catch (e) {
        console.error('회의실 목록 로딩 실패', e);
      }
    };
    loadSpaces();
  }, [workspaceIdNum]);

  // 오늘/이번주 확정 예약 계산
  useEffect(() => {
    const fetchAndCount = async () => {
      try {
        if (!workspaceIdNum) return;
        const { data } = await api.get(
          `/workspaces/${workspaceIdNum}/reservations`
        );

        const list = (data?.reservations ?? []) as Array<{
          startTime: string;
          status: string;
        }>;

        // 승인된 예약만
        const approved = list.filter(r => r.status === 'APPROVED');

        // 오늘 범위
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        const inRange = (d: Date, start: Date, end: Date) =>
          d >= start && d <= end;

        const todayCount = approved.filter(r => {
          const st = new Date(r.startTime);
          return inRange(st, todayStart, todayEnd);
        }).length;

        // 이번주 범위 (월~일)
        const getMonday = (d: Date) => {
          const day = d.getDay(); // 0:일 ~ 6:토
          const diff = day === 0 ? -6 : 1 - day; // 월요일로 이동
          const monday = new Date(d);
          monday.setDate(d.getDate() + diff);
          monday.setHours(0, 0, 0, 0);
          return monday;
        };
        const monday = getMonday(now);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const weekCount = approved.filter(r => {
          const st = new Date(r.startTime);
          return inRange(st, monday, sunday);
        }).length;

        setTodayApproved(todayCount);
        setWeekApproved(weekCount);
      } catch (e) {
        console.error('예약 통계 로딩 실패', e);
        setTodayApproved(0);
        setWeekApproved(0);
      }
    };

    fetchAndCount();
  }, [workspaceIdNum]);

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
        <div className="text-center mb-12 mt-8">
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
              {currentTime || '로딩 중...'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 mt-8">
          <StatCard
            title="오늘 예약"
            value={`${todayApproved}건`}
            description="일/주/월 뷰로 확인"
            icon={CalendarDays}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            clickable={true}
            onClick={() => router.push('/reservations')}
          />
          <StatCard
            title="확정된 예약"
            value={`${weekApproved}건`}
            description="이번 주 전체 확정된 예약"
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            clickable={true}
            onClick={() => router.push('/reservations/requests')}
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
                      if (slider) (slider as HTMLElement).scrollLeft -= 300;
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
                      ) as HTMLButtonElement | null;
                      const rightArrow = document.getElementById(
                        'rightArrow'
                      ) as HTMLButtonElement | null;

                      if (leftArrow)
                        leftArrow.disabled = target.scrollLeft <= 0;

                      if (rightArrow) {
                        const maxScrollLeft =
                          target.scrollWidth - target.clientWidth;
                        rightArrow.disabled =
                          target.scrollLeft >= maxScrollLeft;
                      }
                    }}
                  >
                    {spaces.map(space => (
                      <div
                        key={space.id}
                        className={`flex-shrink-0 w-72 transition-all duration-200 p-2 ${
                          selectedRoom?.id === space.id ? 'z-10' : 'z-0'
                        }`}
                      >
                        <MeetingRoomCard
                          name={space.name}
                          description={space.description}
                          capacity={space.capacity}
                          features={space.amenities}
                          status={space.isActive ? 'available' : 'unavailable'}
                          requiresApproval={space.requiresApproval}
                          images={space.images}
                          imageUrl={
                            space.images?.find?.(i => i.imageType === 'PHOTO')
                              ?.imageUrl ??
                            space.images?.[0]?.imageUrl ??
                            undefined
                          }
                          onSelect={() => handleRoomSelect(space)}
                          isSelected={selectedRoom?.id === space.id}
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
                      if (slider) (slider as HTMLElement).scrollLeft += 300;
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
                        reservations={reservations}
                        showDetailedReservations={false}
                        disabled={date => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-gray-600 space-y-2">
                    <p>• 당일부터 예약 가능합니다</p>
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
                      if (!selectedRoom) return false; // 회의실 선택 전: 모두 활성화
                      return !isTimeAvailable(time); // 가용하지 않으면 "예약됨" 처리
                    }}
                    size="large"
                    showLegend={true}
                  />

                  <div className="mt-6 text-sm text-gray-600 space-y-2">
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
