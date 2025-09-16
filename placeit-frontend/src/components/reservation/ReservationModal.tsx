'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Building, Users } from 'lucide-react';
import { DurationSelector } from './DurationSelector';
import { ReservationSummary } from './ReservationSummary';
import { TimeSelectionGrid } from './TimeSelectionGrid';
import { createReservation } from '@/services/reservations';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddReservation?: (newReservation: any) => void;
  onTimeChange?: (time: string) => void;
  room: {
    id: number | string;
    name: string;
    description: string;
    capacity: number;
    features: string[];
    reservedTime?: string;
  } | null;
  selectedDate?: Date;
  selectedTime?: string;
  timeSlots: string[];
  existingReservations?: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    room: string;
    status: string;
    attendees: string[];
  }>;
}

// '2025-09-16T09:00:00+09:00' 형태로 조합
function toKstIso(date: Date, timeHHmm: string) {
  const [hh, mm] = timeHHmm.split(':').map(n => parseInt(n, 10));
  const local = new Date(date);
  local.setHours(hh, mm, 0, 0);

  // KST 고정 오프셋(+09:00) 문자열로 구성
  const yyyy = local.getFullYear();
  const MM = String(local.getMonth() + 1).padStart(2, '0');
  const dd = String(local.getDate()).padStart(2, '0');
  const HH = String(local.getHours()).padStart(2, '0');
  const m = String(local.getMinutes()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd}T${HH}:${m}:00+09:00`;
}

function durationToMinutes(duration: string) {
  // '30분' | '1시간' | '2시간' | '90분' 등 처리
  if (duration.includes('시간')) {
    const num = parseInt(duration.replace('시간', '').trim(), 10);
    return isNaN(num) ? 60 : num * 60;
  }
  if (duration.includes('분')) {
    const num = parseInt(duration.replace('분', '').trim(), 10);
    return isNaN(num) ? 30 : num;
  }
  // 기본값 30분
  return 30;
}

function addMinutesToIso(iso: string, addMin: number) {
  // iso는 +09:00 오프셋 문자열. Date 파싱 → 분 추가 → 다시 +09:00으로 출력
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + addMin);

  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd}T${HH}:${m}:00+09:00`;
}

export function ReservationModal({
  isOpen,
  onClose,
  onAddReservation,
  onTimeChange,
  room,
  selectedDate,
  selectedTime,
  timeSlots,
  existingReservations = [],
}: ReservationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    attendees: '',
    notes: '',
    selectedTime: selectedTime || '',
    duration: '30분',
  });

  // selectedTime이 변경될 때 formData도 동기화
  React.useEffect(() => {
    if (selectedTime) {
      setFormData(prev => ({ ...prev, selectedTime }));
    }
  }, [selectedTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!room) {
      alert('회의실을 선택해주세요.');
      return;
    }
    if (!selectedDate) {
      alert('날짜를 선택해주세요.');
      return;
    }
    if (!formData.selectedTime) {
      alert('시간을 선택해주세요.');
      return;
    }
    if (!formData.title.trim()) {
      alert('회의 제목을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      const startIso = toKstIso(selectedDate, formData.selectedTime);
      const endIso = addMinutesToIso(
        startIso,
        durationToMinutes(formData.duration)
      );

      const payload = {
        spaceId: Number(room.id),
        startTime: startIso,
        endTime: endIso,
        purpose: formData.title, // 제목 → purpose
        attendees: formData.attendees, // 문자열 그대로
        memo: formData.notes,
      };

      const created = await createReservation(payload);

      // 상위에 알려 로컬 갱신(선택)
      if (onAddReservation) {
        onAddReservation(created);
      }

      alert('예약 요청이 등록되었습니다.');
      handleClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '예약 요청 중 오류가 발생했습니다.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // 폼 초기화
    setFormData({
      title: '',
      attendees: '',
      notes: '',
      selectedTime: selectedTime || '',
      duration: '30분',
    });
    onClose();
  };

  // 예약된 시간인지 확인하는 함수 (room.reservedTime 형식: '09:00-10:00')
  const isTimeReserved = (time: string) => {
    if (!room?.reservedTime) return false;
    const [startTime, endTime] = room.reservedTime.split('-');
    return time >= startTime && time < endTime;
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            회의실 예약
          </DialogTitle>
          <DialogDescription>
            회의실 예약을 위한 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-4">
          {/* 예약 정보 요약 */}
          <ReservationSummary
            room={room}
            selectedDate={selectedDate}
            selectedTime={formData.selectedTime || selectedTime}
          />

          {/* 기존 예약 정보 */}
          {existingReservations.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-700">
                해당 날짜의 기존 예약
              </Label>
              <div className="mt-2 space-y-2">
                {existingReservations.map((reservation, index) => (
                  <div
                    key={reservation.id || `existing-${index}`}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {reservation.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {reservation.room} • {reservation.time}
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
                ))}
              </div>
            </div>
          )}

          {/* 시간 선택 */}
          <TimeSelectionGrid
            timeSlots={timeSlots}
            selectedTime={formData.selectedTime}
            onTimeSelect={time => {
              setFormData(prev => ({ ...prev, selectedTime: time }));
              if (onTimeChange) onTimeChange(time);
            }}
            isTimeReserved={isTimeReserved}
            showLegend={false}
          />

          {/* 예약 폼 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                회의 제목 *
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="회의 제목을 입력하세요"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="attendees" className="text-sm font-medium">
                참석자
              </Label>
              <Input
                id="attendees"
                name="attendees"
                value={formData.attendees}
                onChange={handleInputChange}
                placeholder="참석자 이름을 입력하세요 (쉼표로 구분)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                메모
              </Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="추가 메모를 입력하세요"
                className="mt-1"
              />
            </div>

            {/* 회의 시간 설정 */}
            <DurationSelector
              selectedDuration={formData.duration}
              onDurationChange={duration =>
                setFormData(prev => ({ ...prev, duration }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '예약 중…' : '예약하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
