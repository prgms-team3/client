'use client';

import React, { useState, useEffect } from 'react';
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
import { createReservation, updateReservation } from '@/services/reservations';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddReservation?: (newReservation: any) => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateReservation?: (updated: any) => void;

  mode?: 'create' | 'edit';

  editingReservation?: {
    id: string | number;
    date: string;
    time: string;
    endTime?: string;
    title: string;
    attendees?: string;
    notes?: string;
  };

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

function toKstIso(date: Date, timeHHmm: string) {
  const [hh, mm] = timeHHmm.split(':').map(n => parseInt(n, 10));
  const local = new Date(date);
  local.setHours(hh, mm, 0, 0);

  const yyyy = local.getFullYear();
  const MM = String(local.getMonth() + 1).padStart(2, '0');
  const dd = String(local.getDate()).padStart(2, '0');
  const HH = String(local.getHours()).padStart(2, '0');
  const m = String(local.getMinutes()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd}T${HH}:${m}:00+09:00`;
}

function durationToMinutes(duration: string) {
  if (duration.includes('시간')) {
    const num = parseInt(duration.replace('시간', '').trim(), 10);
    return isNaN(num) ? 60 : num * 60;
  }
  if (duration.includes('분')) {
    const num = parseInt(duration.replace('분', '').trim(), 10);
    return isNaN(num) ? 30 : num;
  }
  return 30;
}

function addMinutesToIso(iso: string, addMin: number) {
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
  onUpdateReservation,
  onTimeChange,
  mode = 'create',
  editingReservation,
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

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && editingReservation) {
      const calcDuration = () => {
        const s = editingReservation.time;
        const e = editingReservation.endTime;
        if (!s || !e) return '30분';
        const [sh, sm] = s.split(':').map(Number);
        const [eh, em] = e.split(':').map(Number);
        const delta = eh * 60 + em - (sh * 60 + sm);
        return delta % 60 === 0 ? `${delta / 60}시간` : `${delta}분`;
      };

      setFormData({
        title: editingReservation.title ?? '',
        attendees: editingReservation.attendees ?? '',
        notes: editingReservation.notes ?? '',
        selectedTime: editingReservation.time ?? '',
        duration: calcDuration(),
      });

      if (editingReservation.time) onTimeChange?.(editingReservation.time);
    } else {
      // create 모드: selectedTime 반영
      setFormData(prev => ({
        ...prev,
        selectedTime: selectedTime || '',
        duration: '30분',
      }));
    }
  }, [isOpen, mode, editingReservation, selectedTime, onTimeChange]);

  // create 모드에서 외부 selectedTime이 바뀌면 동기화
  useEffect(() => {
    if (mode !== 'edit' && selectedTime) {
      setFormData(prev => ({ ...prev, selectedTime }));
    }
  }, [selectedTime, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!room) return alert('회의실을 선택해주세요.');
    if (!formData.selectedTime) return alert('시간을 선택해주세요.');
    if (!formData.title.trim()) return alert('회의 제목을 입력해주세요.');

    // 기준 날짜: edit 모드면 editingReservation.date 사용
    const baseDate =
      mode === 'edit' && editingReservation
        ? (() => {
            const [y, m, d] = editingReservation.date.split('-').map(Number);
            return new Date(y, (m || 1) - 1, d || 1);
          })()
        : selectedDate;

    if (!baseDate) return alert('날짜를 선택해주세요.');

    try {
      setSubmitting(true);

      const startIso = toKstIso(baseDate, formData.selectedTime);
      const endIso = addMinutesToIso(
        startIso,
        durationToMinutes(formData.duration)
      );

      const payload = {
        startTime: startIso,
        endTime: endIso,
        purpose: formData.title,
        attendees: formData.attendees,
        memo: formData.notes,
      };

      if (mode === 'edit' && editingReservation?.id != null) {
        const updated = await updateReservation(editingReservation.id, payload);
        onUpdateReservation?.(updated);
        alert('예약이 수정되었습니다.');
        handleClose();
      } else {
        const created = await createReservation({
          spaceId: Number(room.id),
          ...payload,
        });
        onAddReservation?.(created);
        alert('예약 요청이 등록되었습니다.');
        handleClose();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (mode === 'edit'
          ? '예약 수정 중 오류가 발생했습니다.'
          : '예약 요청 중 오류가 발생했습니다.');
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      attendees: '',
      notes: '',
      selectedTime: selectedTime || '',
      duration: '30분',
    });
    onClose();
  };

  // 예약된 시간인지 확인
  const isTimeReserved = (time: string) => {
    if (!room?.reservedTime) return false;
    const [startTime, endTime] = room.reservedTime.split('-');
    return time >= startTime && time < endTime;
  };

  if (!room) return null;

  /** 요약에 표시할 날짜/시간(수정 모드면 editing 값 우선) */
  const summaryDate: Date | undefined =
    mode === 'edit' && editingReservation
      ? (() => {
          const [y, m, d] = editingReservation.date.split('-').map(Number);
          return new Date(y, (m || 1) - 1, d || 1);
        })()
      : selectedDate;

  const summaryTime =
    mode === 'edit' && editingReservation
      ? editingReservation.time
      : formData.selectedTime || selectedTime;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            {mode === 'edit' ? '예약 수정' : '회의실 예약'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? '예약 정보를 수정합니다.'
              : '회의실 예약을 위한 정보를 입력해주세요.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-4">
          {/* 예약 정보 요약 */}
          <ReservationSummary
            room={room}
            selectedDate={summaryDate}
            selectedTime={summaryTime}
          />

          {/* 기존 예약 정보 */}
          {mode !== 'edit' && existingReservations.length > 0 && (
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
              onTimeChange?.(time);
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
                설명
              </Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="회의 목적이나 주요 안건을 간단히 입력하세요"
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
              {submitting
                ? mode === 'edit'
                  ? '수정 중…'
                  : '예약 중…'
                : mode === 'edit'
                ? '수정하기'
                : '예약하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
