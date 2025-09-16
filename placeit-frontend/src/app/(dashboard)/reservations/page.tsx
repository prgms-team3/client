'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ReservationModal } from '@/components/reservation/ReservationModal';
import { useReservationStore } from '@/stores/reservationStore';
import { formatDateToString } from '@/lib/dateUtils';
import { timeSlots } from '@/data/sampleData';
import { ChevronLeft, ChevronRight, Filter, Check } from 'lucide-react';
import { fetchWorkspaceReservations } from '@/services/reservations';
import { useActiveWorkspaceId } from '@/lib/workspaceId';
import { api } from '@/lib/axios';

export default function ReservationsPage() {
  const {
    selectedDate,
    setSelectedDate,
    currentView,
    setCurrentView,
    reservations,
    addReservation,
    setReservations,
    error,
    loading,
    clearError,
  } = useReservationStore();

  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [modalSelectedTime, setModalSelectedTime] = useState<string>('');
  const currentWsId = useActiveWorkspaceId();
  const [myOnly, setMyOnly] = useState<boolean>(false);

  // 서버에서 가져오는 공간(회의실) 목록
  type SpaceLite = {
    id: number;
    name: string;
    description?: string;
    capacity: number;
    amenities?: string[];
  };
  const [spaces, setSpaces] = useState<SpaceLite[]>([]);

  const toDateStr = (iso: string) => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const toTimeHHmm = (iso: string) => {
    const d = new Date(iso);
    const H = String(d.getHours()).padStart(2, '0');
    const M = String(d.getMinutes()).padStart(2, '0');
    return `${H}:${M}`;
  };

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  // API의 상태 → UI 상태로 매핑
  const mapStatus = (
    s: 'PENDING' | 'APPROVED' | 'REJECTED'
  ): 'pending' | 'confirmed' | 'cancelled' => {
    if (s === 'APPROVED') return 'confirmed';
    if (s === 'REJECTED') return 'cancelled';
    return 'pending';
  };

  // 09:00 ~ 17:30 타임라인에서 상대 위치 계산
  const WEEK_BASE_MIN = 9 * 60; // 오전 9시
  const WEEK_TOTAL_MIN = 17 * 30; // 510분 (09:00~17:30)

  function toBlockStyle(startHHmm: string, endHHmm?: string) {
    const start = Math.max(0, toMinutes(startHHmm) - WEEK_BASE_MIN);
    const end = Math.min(
      WEEK_TOTAL_MIN,
      (endHHmm ? toMinutes(endHHmm) : toMinutes(startHHmm) + 30) - WEEK_BASE_MIN
    );
    const topPct = (start / WEEK_TOTAL_MIN) * 100;
    const heightPct = Math.max(2, ((end - start) / WEEK_TOTAL_MIN) * 100);
    return { top: `${topPct}%`, height: `${heightPct}%` };
  }

  // 초기 날짜 설정
  useEffect(() => {
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  // 예약 불러오기: 워크스페이스 전체 vs 내 예약만
  useEffect(() => {
    (async () => {
      try {
        if (currentWsId == null) return;

        let apiList: any[] = [];

        if (myOnly) {
          // 내 예약만
          const { data } = await api.get('/reservations/my');
          const list = Array.isArray(data) ? data : data?.reservations ?? [];
          // 현재 워크스페이스에 속한 예약만 남김 (space.workspaceId 또는 space.workspace.id 중 있는 값 사용)
          const wsIdNum = Number(currentWsId);
          apiList = list.filter((r: any) => {
            const s = r.space ?? {};
            const wid = Number(
              s.workspaceId ?? s.workspace?.id ?? r.workspaceId ?? NaN
            );
            return Number.isFinite(wid) ? wid === wsIdNum : true; // 공간 정보가 없으면 보수적으로 포함
          });
        } else {
          // 워크스페이스 전체
          apiList = await fetchWorkspaceReservations(currentWsId);
        }

        const normalized = apiList.map(r => ({
          id: String(r.id),
          title: r.purpose,
          room: r.space?.name ?? `공간#${r.spaceId}`,
          roomId: String(r.space?.id ?? r.spaceId),
          date: toDateStr(r.startTime),
          time: toTimeHHmm(r.startTime),
          endTime: toTimeHHmm(r.endTime),
          attendees: r.attendees
            ? r.attendees
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
          status: mapStatus(r.status),
        }));

        setReservations(normalized);
      } catch (e) {
        console.error('예약 불러오기 실패', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWsId, myOnly]);

  // 워크스페이스 변경 시 공간 목록 로드(수용인원 등)
  useEffect(() => {
    (async () => {
      try {
        if (currentWsId == null) return;
        const { data } = await api.get(`/workspaces/${currentWsId}/spaces`);
        const list = (Array.isArray(data) ? data : data?.spaces ?? []).map(
          (s: any) => ({
            id: Number(s.id),
            name: s.name,
            description: s.description ?? '',
            capacity: Number(s.capacity ?? 0),
            amenities: s.amenities ?? [],
          })
        );
        setSpaces(list);
      } catch (e) {
        console.error('공간 목록 조회 실패', e);
      }
    })();
  }, [currentWsId]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || null);
    if (date) {
      setModalSelectedTime('');
      setShowReservationModal(true);
    }
  };

  const handleNewReservation = () => {
    setModalSelectedTime('');
    setShowReservationModal(true);
  };
  const handleCloseModal = () => setShowReservationModal(false);

  // 새로운 예약 추가
  const handleAddReservation = async (created: any) => {
    const dateStr = toDateStr(created.startTime);
    const startHHmm = toTimeHHmm(created.startTime);
    const endHHmm = toTimeHHmm(created.endTime);

    const roomName =
      created?.space?.name ?? `공간#${created.spaceId ?? '알수없음'}`;

    const attendees =
      typeof created.attendees === 'string' && created.attendees.trim()
        ? created.attendees
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

    const status =
      created?.status === 'APPROVED'
        ? ('confirmed' as const)
        : created?.status === 'REJECTED'
        ? ('cancelled' as const)
        : ('pending' as const);

    const success = await addReservation({
      id: String(created.id ?? `${Date.now()}`),
      title: created.purpose,
      room: roomName,
      date: dateStr,
      time: startHHmm,
      endTime: endHHmm,
      attendees,
      status,
    });

    if (success) setShowReservationModal(false);
  };

  // UI용 '고유' 예약 배열
  const uniqueReservations = useMemo(() => {
    const map = new Map<string, (typeof reservations)[number]>();
    for (const r of reservations) {
      const k = `${r.id ?? ''}-${r.date}-${r.time}`;
      if (!map.has(k)) map.set(k, r);
    }
    return Array.from(map.values());
  }, [reservations]);

  // 방 이름 옵션
  const roomOptions = useMemo(() => {
    const idToName = new Map<string, string>();
    for (const r of uniqueReservations) {
      if ((r as any).roomId) idToName.set((r as any).roomId, r.room);
    }
    return Array.from(idToName, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [uniqueReservations]);

  // 예약/옵션이 로드된 뒤, 처음 한 번 기본 회의실 자동 선택
  useEffect(() => {
    if (!selectedRoomId && roomOptions.length > 0) {
      setSelectedRoomId(roomOptions[0].id); // 이름순 첫 번째
    }
  }, [roomOptions, selectedRoomId]);

  // 공간별 필터링
  const filteredReservations = useMemo(() => {
    if (!selectedRoomId) return [];
    return uniqueReservations.filter((r: any) => r.roomId === selectedRoomId);
  }, [uniqueReservations, selectedRoomId]);

  // 선택된 공간 객체(서버의 capacity 반영)
  const selectedRoomObj = useMemo(() => {
    if (!selectedRoomId) return null;

    const fromSpaces = spaces.find(
      s => String(s.id) === String(selectedRoomId)
    );
    if (fromSpaces) {
      return {
        id: fromSpaces.id,
        name: fromSpaces.name,
        description: fromSpaces.description ?? '',
        capacity: fromSpaces.capacity ?? 0,
        features: fromSpaces.amenities ?? [],
      };
    }

    const found = roomOptions.find(r => r.id === selectedRoomId);
    if (found) {
      return {
        id: found.id,
        name: found.name,
        description: '',
        capacity: 0,
        features: [],
      };
    }
    return null;
  }, [selectedRoomId, spaces, roomOptions]);

  // 월 뷰 집계(+N건)
  const monthReservations = useMemo(() => {
    const grouped: Record<string, typeof filteredReservations> = {};
    for (const r of filteredReservations) {
      (grouped[(r as any).date] ??= []).push(r as any);
    }

    const result: any[] = [];
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    for (const date in grouped) {
      const list = grouped[date]
        .slice()
        .sort((a, b) => toMin((a as any).time) - toMin((b as any).time));
      const first = list[0];
      if (!first) continue;

      result.push(first);

      if (list.length > 1) {
        result.push({
          ...first,
          id: `${(first as any).id}-extra`,
          title: `+${list.length - 1}건`,
          time: '',
          room: '',
          status: 'confirmed',
        });
      }
    }

    return result;
  }, [filteredReservations]);

  return (
    <MainLayout activePage="reservations">
      <div className="p-6 space-y-8 mx-auto">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {/* X 아이콘 */}
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
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
              선택한 공간의 예약 현황을 확인하세요
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 공간 선택 */}
            <select
              value={selectedRoomId}
              onChange={e => setSelectedRoomId(e.target.value)}
              className="h-10 pl-3 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white shadow-sm"
            >
              <option value="">공간 선택…</option>
              {roomOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>

            {/* 새 예약 */}
            <Button
              onClick={handleNewReservation}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              새 예약
            </Button>
          </div>
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
                {/* 이전 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    if (selectedDate instanceof Date) {
                      const newDate = new Date(selectedDate);
                      if (currentView === 'day')
                        newDate.setDate(newDate.getDate() - 1);
                      if (currentView === 'week')
                        newDate.setDate(newDate.getDate() - 7);
                      if (currentView === 'month')
                        newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* 표시 */}
                <div className="flex items-center gap-2 px-3 min-w-[160px] justify-center">
                  {selectedDate instanceof Date && (
                    <>
                      {currentView === 'day' && (
                        <span className="text-sm font-medium text-gray-900">
                          {selectedDate.toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long',
                          })}
                        </span>
                      )}
                      {currentView === 'week' &&
                        (() => {
                          const weekStart = new Date(selectedDate);
                          weekStart.setDate(
                            selectedDate.getDate() - selectedDate.getDay()
                          );
                          const weekEnd = new Date(weekStart);
                          weekEnd.setDate(weekStart.getDate() + 6);
                          return (
                            <span className="text-sm font-medium text-gray-900">
                              {weekStart.getMonth() + 1}월 {weekStart.getDate()}
                              일 ~ {weekEnd.getMonth() + 1}월{' '}
                              {weekEnd.getDate()}일
                            </span>
                          );
                        })()}
                      {currentView === 'month' && (
                        <span className="text-sm font-medium text-gray-900">
                          {selectedDate.getFullYear()}년{' '}
                          {selectedDate.getMonth() + 1}월
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* 다음 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    if (selectedDate instanceof Date) {
                      const newDate = new Date(selectedDate);
                      if (currentView === 'day')
                        newDate.setDate(newDate.getDate() + 1);
                      if (currentView === 'week')
                        newDate.setDate(newDate.getDate() + 7);
                      if (currentView === 'month')
                        newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* "내 예약만 보기" 토글 버튼 */}
            <Button
              type="button"
              variant={myOnly ? 'default' : 'outline'}
              size="sm"
              aria-pressed={myOnly}
              onClick={() => setMyOnly(prev => !prev)}
              className={`h-10 px-4 py-2.5 text-sm rounded-lg transition-all ${
                myOnly
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-lg'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              title="내 예약만 보기"
            >
              <Filter className="h-4 w-4 mr-2" />내 예약만 보기
              {myOnly && <Check className="h-4 w-4 ml-2 opacity-90" />}
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
                <div className="border rounded-lg">
                  {/* 전체 행 높이: 30분 x 17칸 = h-12(3rem) * 17 */}
                  <div className="grid grid-cols-[80px_1fr]">
                    {/* 왼쪽: 시간 라벨 */}
                    <div className="relative">
                      {Array.from({ length: 17 }, (_, i) => {
                        const hour = Math.floor(i / 2) + 9;
                        const minute = i % 2 === 0 ? '00' : '30';
                        return (
                          <div
                            key={i}
                            className="h-12 border-b border-gray-200 flex items-center justify-end pr-3 text-sm text-gray-600"
                          >
                            {`${hour.toString().padStart(2, '0')}:${minute}`}
                          </div>
                        );
                      })}
                    </div>

                    {/* 오른쪽: 타임라인(배경 라인 + 예약 블록 + 클릭 레이어) */}
                    <div
                      className="relative"
                      style={{ height: `calc(17 * 3rem)` }}
                    >
                      {/* 배경 그리드 라인 */}
                      <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 17 }, (_, i) => (
                          <div
                            key={i}
                            className="h-12 border-b border-gray-200"
                          />
                        ))}
                      </div>

                      {/* 예약 블록들 (1건=1블록) */}
                      <div className="absolute inset-0 px-2">
                        {(() => {
                          const selectedDateStr =
                            selectedDate instanceof Date
                              ? `${selectedDate.getFullYear()}-${String(
                                  selectedDate.getMonth() + 1
                                ).padStart(2, '0')}-${String(
                                  selectedDate.getDate()
                                ).padStart(2, '0')}`
                              : '';

                          const dayReservations = (
                            filteredReservations as any[]
                          ).filter(r => r.date === selectedDateStr);

                          return dayReservations.map((r, idx) => {
                            const { top, height } = toBlockStyle(
                              (r as any).time,
                              (r as any).endTime
                            );
                            return (
                              <div
                                key={`${(r as any).id}-${idx}`}
                                className="absolute left-2 right-2 rounded-md border-l-4 border-blue-500 bg-blue-50 shadow-sm p-2 text-xs overflow-hidden"
                                style={{ top, height }}
                                title={`${(r as any).time} ~ ${
                                  (r as any).endTime || ''
                                }`}
                              >
                                <div className="font-semibold truncate">
                                  {(r as any).title}
                                </div>
                                <div className="text-[11px] text-gray-600 truncate">
                                  {(r as any).room} · {(r as any).time}
                                  {(r as any).endTime
                                    ? ` - ${(r as any).endTime}`
                                    : ''}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      {/* 클릭 레이어: 30분 단위로 모달 오픈 (과거 시간 잠금 유지) */}
                      <div className="absolute inset-0">
                        {Array.from({ length: 17 }, (_, i) => {
                          const hour = Math.floor(i / 2) + 9;
                          const minute = i % 2 === 0 ? '00' : '30';
                          const timeStr = `${hour
                            .toString()
                            .padStart(2, '0')}:${minute}`;

                          const now = new Date();
                          const isToday =
                            selectedDate?.toDateString() === now.toDateString();
                          const slotMin =
                            hour * 60 + (minute === '00' ? 0 : 30);
                          const nowMin = now.getHours() * 60 + now.getMinutes();
                          const isPastSlot = isToday && slotMin < nowMin;

                          return (
                            <div
                              key={i}
                              className={`h-12 ${
                                isPastSlot
                                  ? 'opacity-50 pointer-events-none'
                                  : 'cursor-pointer hover:bg-gray-50/60'
                              }`}
                              onClick={() => {
                                if (!isPastSlot) {
                                  setModalSelectedTime(timeStr);
                                  setShowReservationModal(true);
                                }
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
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
                    <div className="p-3 border-r border-gray-200 bg-gray-50" />
                    {['일', '월', '화', '수', '목', '금', '토'].map(
                      (day, index) => {
                        const weekStart = new Date(selectedDate || new Date());
                        weekStart.setDate(
                          weekStart.getDate() - weekStart.getDay()
                        );
                        const currentDayDate = new Date(weekStart);
                        currentDayDate.setDate(weekStart.getDate() + index);

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const dayStart = new Date(currentDayDate);
                        dayStart.setHours(0, 0, 0, 0);

                        const isToday = dayStart.getTime() === today.getTime();
                        const isPastDay = dayStart.getTime() < today.getTime();

                        return (
                          <div
                            key={day}
                            className={`p-3 text-center border-r border-gray-200 last:border-r-0 rounded-md
                            ${
                              isToday
                                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                : ''
                            }
                            ${
                              isPastDay
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              if (!isPastDay) {
                                setSelectedDate(currentDayDate);
                                setModalSelectedTime('');
                                setShowReservationModal(true);
                              }
                            }}
                          >
                            <div className="text-sm font-medium">{day}</div>
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
                            className="h-12 border-b border-gray-200 flex items-center justify-center text-xs text-gray-500"
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

                      const dayStart = new Date(currentDayDate);
                      dayStart.setHours(0, 0, 0, 0);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const isPastDay = dayStart.getTime() < today.getTime();
                      const isToday = dayStart.getTime() === today.getTime();

                      const currentDayDateStr = `${currentDayDate.getFullYear()}-${String(
                        currentDayDate.getMonth() + 1
                      ).padStart(2, '0')}-${String(
                        currentDayDate.getDate()
                      ).padStart(2, '0')}`;

                      const dayReservations = (
                        filteredReservations as any[]
                      ).filter(r => r.date === currentDayDateStr);

                      const now = new Date();
                      const nowMin = now.getHours() * 60 + now.getMinutes();

                      return (
                        <div
                          key={dayIndex}
                          className={`relative border-r border-gray-200 last:border-r-0 ${
                            isToday ? 'bg-blue-50/30' : ''
                          } ${
                            isPastDay ? 'opacity-50 pointer-events-none' : ''
                          }`}
                          style={{ height: `calc(17 * 3rem)` }} // h-12(=3rem) * 17칸과 동일한 총 높이
                        >
                          {/* 배경 그리드 (30분 간격 라인) */}
                          <div className="absolute inset-0 pointer-events-none">
                            {Array.from({ length: 17 }, (_, i) => (
                              <div
                                key={i}
                                className="h-12 border-b border-gray-200"
                              />
                            ))}
                          </div>

                          {/* 예약 블록들 */}
                          <div className="absolute inset-0">
                            {dayReservations.map((r, idx) => {
                              const { top, height } = toBlockStyle(
                                (r as any).time,
                                (r as any).endTime
                              );
                              return (
                                <div
                                  key={`${(r as any).id}-${idx}`}
                                  className="absolute left-1 right-1 rounded-md border-l-4 border-blue-500 bg-blue-50 shadow-sm p-2 text-xs overflow-hidden"
                                  style={{ top, height }}
                                  title={`${(r as any).time} ~ ${
                                    (r as any).endTime || ''
                                  }`}
                                >
                                  <div className="font-semibold text-sm truncate">
                                    {(r as any).title}
                                  </div>
                                  <div className="text-[11px] text-gray-600 truncate">
                                    {(r as any).room} · {(r as any).time}
                                    {(r as any).endTime
                                      ? ` - ${(r as any).endTime}`
                                      : ''}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* 빈 영역 클릭으로 모달 열기 (셀 단위 클릭 유지) */}
                          <div className="absolute inset-0">
                            {Array.from({ length: 17 }, (_, timeIndex) => {
                              const hour = Math.floor(timeIndex / 2) + 9;
                              const minute = timeIndex % 2 === 0 ? '00' : '30';
                              const timeStr = `${hour
                                .toString()
                                .padStart(2, '0')}:${minute}`;
                              const slotMin =
                                hour * 60 + (minute === '00' ? 0 : 30);
                              const isPastSlot =
                                isPastDay || (isToday && slotMin < nowMin);

                              return (
                                <div
                                  key={timeIndex}
                                  className={`h-12 p-1 ${
                                    isPastSlot
                                      ? 'pointer-events-none'
                                      : 'cursor-pointer'
                                  }`}
                                  onClick={() => {
                                    if (!isPastSlot) {
                                      setSelectedDate(currentDayDate);
                                      setModalSelectedTime(timeStr);
                                      setShowReservationModal(true);
                                    }
                                  }}
                                />
                              );
                            })}
                          </div>
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
            <div className="bg-white border border-gray-200 rounded-lg max-w-4xl mx-auto p-4">
              <div className="[&_.rdp-month_caption]:!hidden [&_.rdp-caption]:!hidden [&_.rdp-caption_label]:!hidden">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleDateSelect}
                  className="w-full [--cell-size:4rem]"
                  showOutsideDays={false}
                  captionLayout="label"
                  reservations={monthReservations as any}
                  showDetailedReservations={true}
                  disabled={date => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
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
        room={selectedRoomObj}
        selectedDate={selectedDate || undefined}
        selectedTime={modalSelectedTime}
        timeSlots={timeSlots}
        existingReservations={
          selectedDate instanceof Date
            ? (filteredReservations as any[])
                .filter(r => r.date === formatDateToString(selectedDate))
                .map((r, index) => ({
                  ...r,
                  id: (r as any).id || `temp-${Date.now()}-${index}`,
                }))
            : []
        }
      />
    </MainLayout>
  );
}
