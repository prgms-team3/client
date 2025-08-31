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

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddReservation?: (newReservation: any) => void;
  onTimeChange?: (time: string) => void;
  room: {
    id: string;
    name: string;
    description: string;
    capacity: number;
    features: string[];
    reservedTime?: string;
  };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 예약 정보 검증
    if (!formData.title.trim()) {
      alert('회의 제목을 입력해주세요.');
      return;
    }

    // 예약 정보 생성 (로컬 시간 기준)
    const reservationData = {
      room: room.name,
      date: selectedDate
        ? `${selectedDate.getFullYear()}-${String(
            selectedDate.getMonth() + 1
          ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(
            2,
            '0'
          )}`
        : '',
      time: formData.selectedTime,
      title: formData.title,
      attendees: formData.attendees,
      notes: formData.notes,
    };

    // onAddReservation 콜백이 있으면 호출
    if (onAddReservation) {
      onAddReservation(reservationData);
    } else {
      console.log('예약 정보:', reservationData);
      alert('예약이 완료되었습니다!');
    }

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

  // 예약된 시간인지 확인하는 함수
  const isTimeReserved = (time: string) => {
    if (!room.reservedTime) return false;

    const [startTime, endTime] = room.reservedTime.split('-');
    return time >= startTime && time < endTime;
  };

  // room이 null인 경우 모달을 렌더링하지 않음
  if (!room) {
    return null;
  }

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
              // 상위 컴포넌트에도 시간 변경 알림
              if (onTimeChange) {
                onTimeChange(time);
              }
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
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit">예약하기</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
