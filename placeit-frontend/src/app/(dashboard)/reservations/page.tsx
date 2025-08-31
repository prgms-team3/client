'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ReservationModal } from '@/components/reservation/ReservationModal';
import { useReservationStore } from '@/stores/reservationStore';

import { formatDateToString } from '@/lib/dateUtils';
import { timeSlots } from '@/data/sampleData';
import { ChevronLeft, ChevronRight, Users, Filter, Plus } from 'lucide-react';

// 샘플 예약 데이터 (2025년 8월 기준)
const sampleReservations = [
  {
    id: '1',
    title: '주간 팀 미팅',
    room: '회의실1',
    date: '2025-08-06',
    time: '10:00',
    attendees: ['김태현', '이영희', '박철수'],
    status: 'confirmed',
  },
  {
    id: '2',
    title: '프로젝트 회의',
    room: '소회의실',
    date: '2025-08-06',
    time: '14:00',
    attendees: ['김태현', '최민수'],
    status: 'confirmed',
  },
  {
    id: '3',
    title: '월간 전체 회의',
    room: '대회의실',
    date: '2025-08-07',
    time: '09:00',
    attendees: ['전사원'],
    status: 'confirmed',
  },
  {
    id: '4',
    title: '고객 미팅',
    room: '회의실2',
    date: '2025-08-08',
    time: '15:00',
    attendees: ['김태현', '이영희'],
    status: 'pending',
  },
  {
    id: '5',
    title: '제품 기획 회의',
    room: '소회의실',
    date: '2025-08-12',
    time: '11:00',
    attendees: ['박철수', '최민수'],
    status: 'confirmed',
  },
  // 더 많은 예약 데이터 추가
  {
    id: '6',
    title: '디자인 리뷰',
    room: '회의실1',
    date: '2025-08-13',
    time: '13:00',
    attendees: ['이영희', '박철수'],
    status: 'confirmed',
  },
  {
    id: '7',
    title: '개발 스크럼',
    room: '소회의실',
    date: '2025-08-13',
    time: '15:00',
    attendees: ['김태현', '최민수'],
    status: 'confirmed',
  },
  {
    id: '8',
    title: '마케팅 전략',
    room: '대회의실',
    date: '2025-08-14',
    time: '10:00',
    attendees: ['전사원'],
    status: 'confirmed',
  },
  {
    id: '9',
    title: 'QA 테스트',
    room: '회의실2',
    date: '2025-08-14',
    time: '14:00',
    attendees: ['박철수'],
    status: 'pending',
  },
  {
    id: '10',
    title: '프로젝트 마감',
    room: '소회의실',
    date: '2025-08-15',
    time: '16:00',
    attendees: ['김태현', '이영희', '박철수'],
    status: 'confirmed',
  },
  {
    id: '11',
    title: '신규 기능 기획',
    room: '회의실1',
    date: '2025-08-19',
    time: '11:00',
    attendees: ['최민수', '박철수'],
    status: 'confirmed',
  },
  {
    id: '12',
    title: '사용자 피드백',
    room: '회의실2',
    date: '2025-08-19',
    time: '15:00',
    attendees: ['이영희'],
    status: 'pending',
  },
  {
    id: '13',
    title: '기술 검토',
    room: '소회의실',
    date: '2025-08-19',
    time: '17:00',
    attendees: ['김태현', '최민수'],
    status: 'confirmed',
  },
];

// timeSlots는 @/data/sampleData에서 import하여 사용

export default function ReservationsPage() {
  const {
    selectedDate,
    setSelectedDate,
    currentView,
    setCurrentView,
    reservations,
    addReservation,
    error,
    loading,
    clearError,
  } = useReservationStore();

  const [showReservationModal, setShowReservationModal] = useState(false);

  // 컴포넌트 마운트 시 샘플 데이터가 없으면 초기화 (한 번만 실행)
  useEffect(() => {
    const initializeSampleData = async () => {
      if (reservations.length === 0) {
        // 샘플 데이터를 store에 추가
        for (const reservation of sampleReservations) {
          await addReservation({
            title: reservation.title,
            room: reservation.room,
            date: reservation.date,
            time: reservation.time,
            attendees: reservation.attendees,
            status: reservation.status as 'confirmed' | 'pending' | 'cancelled',
          });
        }
      }
    };

    initializeSampleData();
  }, [reservations.length, addReservation]); // 의존성 추가

  // 컴포넌트 마운트 시 현재 날짜로 설정
  useEffect(() => {
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || null);
    if (date) {
      // 날짜를 클릭하면 예약 모달 열기
      setShowReservationModal(true);
    }
  };

  const handleNewReservation = () => {
    setShowReservationModal(true);
  };

  const handleCloseModal = () => {
    setShowReservationModal(false);
  };

  // 새로운 예약 추가 함수
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddReservation = async (newReservation: any) => {
    const success = await addReservation({
      title: newReservation.title,
      room: newReservation.room,
      date: newReservation.date,
      time: newReservation.time,
      attendees: newReservation.attendees
        ? newReservation.attendees.split(',').map((s: string) => s.trim())
        : [],
      status: 'confirmed' as const,
    });

    if (success) {
      setShowReservationModal(false);
    }
  };

  return (
    <MainLayout activePage="reservations">
      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="animate-spin h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">처리 중입니다...</p>
              </div>
            </div>
          </div>
        )}

        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              예약 현황
            </h1>
            <p className="text-gray-600 mt-2">
              공간별 예약 현황을 확인하고 관리하세요
            </p>
          </div>
          <Button
            onClick={handleNewReservation}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            <Plus className="h-4 w-4 mr-2" />새 예약
          </Button>
        </div>

        {/* 뷰 선택 및 네비게이션 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* 커스텀 탭 버튼들 */}
              <div className="flex bg-gray-100 rounded-xl p-1.5 border border-gray-200">
                <button
                  onClick={() => setCurrentView('day')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200 h-10 leading-none ${
                    currentView === 'day'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  일
                </button>
                <button
                  onClick={() => setCurrentView('week')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200 h-10 leading-none ${
                    currentView === 'week'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  주
                </button>
                <button
                  onClick={() => setCurrentView('month')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200 h-10 leading-none ${
                    currentView === 'month'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  월
                </button>
              </div>

              {/* 날짜 네비게이션 */}
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5 h-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    if (selectedDate) {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 px-3 min-w-[120px] justify-center">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedDate instanceof Date
                      ? `${selectedDate.getMonth() + 1}월`
                      : `${new Date().getMonth() + 1}월`}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedDate instanceof Date
                      ? `${selectedDate.getFullYear()}년`
                      : `${new Date().getFullYear()}년`}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    if (selectedDate instanceof Date) {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 필터 버튼 */}
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 py-2.5 text-sm border-gray-200 hover:bg-gray-50 rounded-lg"
            >
              <Filter className="h-4 w-4 mr-2" />내 예약만 보기
            </Button>
          </div>
        </div>

        {/* 캘린더 뷰 */}
        <Tabs value={currentView} className="w-full max-w-none">
          {/* 일 뷰 */}
          <TabsContent value="day" className="space-y-4">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    일별 예약 현황
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100"
                      onClick={() => {
                        if (selectedDate) {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(newDate.getDate() - 1);
                          setSelectedDate(newDate);
                        }
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      {selectedDate instanceof Date
                        ? selectedDate.toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long',
                          })
                        : '날짜를 선택하세요'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100"
                      onClick={() => {
                        if (selectedDate) {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(newDate.getDate() + 1);
                          setSelectedDate(newDate);
                        }
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 시간대별 예약 현황 */}
                <div className="space-y-2">
                  {timeSlots.map(time => {
                    const selectedDateStr =
                      selectedDate instanceof Date
                        ? `${selectedDate.getFullYear()}-${String(
                            selectedDate.getMonth() + 1
                          ).padStart(2, '0')}-${String(
                            selectedDate.getDate()
                          ).padStart(2, '0')}`
                        : '';
                    const reservation = reservations.find(
                      r => r.date === selectedDateStr && r.time.startsWith(time)
                    );

                    // 현재 시간과 비교하여 비활성화 여부 결정
                    const [hour, minute] = time.split(':').map(Number);
                    const timeInMinutes = hour * 60 + minute;
                    const currentTime = new Date();
                    const currentTimeInMinutes =
                      currentTime.getHours() * 60 + currentTime.getMinutes();

                    // 오늘 날짜이고 현재 시간 이전이면 비활성화
                    const isToday =
                      selectedDate?.toDateString() ===
                      currentTime.toDateString();
                    const isPastTime =
                      isToday && timeInMinutes < currentTimeInMinutes;
                    const isCurrentTime =
                      isToday &&
                      Math.abs(timeInMinutes - currentTimeInMinutes) <= 15; // 현재 시간 ±15분

                    return (
                      <div
                        key={time}
                        className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer ${
                          isPastTime
                            ? 'border-gray-200 bg-gray-50 opacity-50'
                            : isCurrentTime
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (!isPastTime) {
                            setShowReservationModal(true);
                          }
                        }}
                      >
                        <div
                          className={`w-20 text-sm font-medium ${
                            isPastTime ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {time}
                          {isCurrentTime && (
                            <span className="ml-2 text-xs text-blue-600 font-bold">
                              현재
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          {reservation ? (
                            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {reservation.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {reservation.room}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Users className="h-3 w-3 text-gray-500" />
                                    <span className="text-xs text-gray-600">
                                      {reservation.attendees.join(', ')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span
                              className={
                                isPastTime ? 'text-gray-300' : 'text-gray-400'
                              }
                            >
                              {isPastTime ? '지난 시간' : '예약 없음'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 주 뷰 */}
          <TabsContent value="week" className="space-y-4">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    주간 예약 현황
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100"
                      onClick={() => {
                        if (selectedDate) {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(newDate.getDate() - 7);
                          setSelectedDate(newDate);
                        }
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      {selectedDate instanceof Date
                        ? `${selectedDate.getFullYear()}년 ${
                            selectedDate.getMonth() + 1
                          }월 ${Math.ceil(selectedDate.getDate() / 7)}주차`
                        : '날짜를 선택하세요'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100"
                      onClick={() => {
                        if (selectedDate) {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(newDate.getDate() + 7);
                          setSelectedDate(newDate);
                        }
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 주간 그리드 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* 요일 헤더 */}
                  <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
                    <div className="p-3 border-r border-gray-200 bg-gray-50"></div>
                    {['일', '월', '화', '수', '목', '금', '토'].map(
                      (day, index) => {
                        const weekStart = new Date(selectedDate || new Date());
                        weekStart.setDate(
                          weekStart.getDate() - weekStart.getDay()
                        );
                        const currentDayDate = new Date(weekStart);
                        currentDayDate.setDate(weekStart.getDate() + index);

                        return (
                          <div
                            key={day}
                            className="p-3 text-center border-r border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setSelectedDate(currentDayDate);
                              setShowReservationModal(true);
                            }}
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {day}
                            </div>
                            <div className="text-xs text-gray-500">
                              {currentDayDate.getDate()}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* 시간별 그리드 */}
                  <div className="grid grid-cols-8">
                    {/* 시간 열 */}
                    <div className="border-r border-gray-200">
                      {Array.from({ length: 17 }, (_, i) => {
                        const hour = Math.floor(i / 2) + 9;
                        const minute = i % 2 === 0 ? '00' : '30';
                        return (
                          <div
                            key={i}
                            className="h-16 border-b border-gray-200 flex items-center justify-center text-xs text-gray-500"
                          >
                            {`${hour.toString().padStart(2, '0')}:${minute}`}
                          </div>
                        );
                      })}
                    </div>

                    {/* 각 요일 열 */}
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const weekStart = new Date(selectedDate || new Date());
                      weekStart.setDate(
                        weekStart.getDate() - weekStart.getDay()
                      );
                      const currentDayDate = new Date(weekStart);
                      currentDayDate.setDate(weekStart.getDate() + dayIndex);

                      const currentDayDateStr = `${currentDayDate.getFullYear()}-${String(
                        currentDayDate.getMonth() + 1
                      ).padStart(2, '0')}-${String(
                        currentDayDate.getDate()
                      ).padStart(2, '0')}`;

                      const dayReservations = reservations.filter(
                        r => r.date === currentDayDateStr
                      );

                      return (
                        <div
                          key={dayIndex}
                          className="border-r border-gray-200 last:border-r-0"
                        >
                          {Array.from({ length: 17 }, (_, timeIndex) => {
                            const hour = Math.floor(timeIndex / 2) + 9;
                            const minute = timeIndex % 2 === 0 ? '00' : '30';
                            const timeStr = `${hour
                              .toString()
                              .padStart(2, '0')}:${minute}`;

                            // 해당 시간에 예약이 있는지 확인
                            const reservation = dayReservations.find(
                              r => r.time === timeStr
                            );

                            return (
                              <div
                                key={timeIndex}
                                className="h-16 border-b border-gray-200 p-1 relative cursor-pointer hover:bg-gray-50"
                                onClick={() => {
                                  setSelectedDate(currentDayDate);
                                  setShowReservationModal(true);
                                }}
                              >
                                {reservation && (
                                  <div
                                    className={`absolute inset-1 rounded p-1 text-xs ${
                                      reservation.title.includes('주간 팀 미팅')
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    <div className="font-medium truncate">
                                      {reservation.title}
                                    </div>
                                    <div className="text-xs opacity-75">
                                      {reservation.time}
                                    </div>
                                    <div className="text-xs opacity-75">
                                      {reservation.room}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 월 뷰 */}
          <TabsContent value="month" className="space-y-4 w-full">
            {/* Calendar */}
            <div className="bg-white border border-gray-200 rounded-lg w-full p-6">
              <div className="[&_.rdp-month_caption]:!hidden [&_.rdp-caption]:!hidden [&_.rdp-caption_label]:!hidden">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleDateSelect}
                  className="w-full [--cell-size:9rem]"
                  showOutsideDays={false}
                  captionLayout="label"
                  fromYear={2024}
                  toYear={2026}
                  reservations={reservations}
                  showDetailedReservations={true}
                  month={selectedDate || undefined}
                  onMonthChange={date => setSelectedDate(date)}
                  disabled={date => {
                    // 주말 비활성화
                    const day = date.getDay();
                    return day === 0 || day === 6;
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 예약 모달 */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={handleCloseModal}
        onAddReservation={handleAddReservation}
        room={{
          id: '1',
          name: '회의실1',
          description: '일반적인 회의에 적합한 회의실',
          capacity: 8,
          features: ['프로젝터', '화이트보드', 'WiFi'],
        }}
        selectedDate={selectedDate || undefined}
        selectedTime="10:00"
        timeSlots={timeSlots}
        existingReservations={
          selectedDate instanceof Date
            ? reservations
                .filter(r => r.date === formatDateToString(selectedDate))
                .map((r, index) => ({
                  ...r,
                  // id가 없거나 중복될 경우를 대비해 index 추가
                  id: r.id || `temp-${Date.now()}-${index}`,
                }))
            : []
        }
      />
    </MainLayout>
  );
}
