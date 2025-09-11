'use client';

import React from 'react';
import { Calendar, Clock, Building, Users } from 'lucide-react';

interface ReservationSummaryProps {
  room: {
    id: string;
    name: string;
    description: string;
    capacity: number;
    features: string[];
  };
  selectedDate?: Date;
  selectedTime?: string;
}

export function ReservationSummary({
  room,
  selectedDate,
  selectedTime,
}: ReservationSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Building className="h-4 w-4 text-gray-600" />
        <span className="font-medium">회의실:</span>
        <span>{room.name}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-gray-600" />
        <span className="font-medium">날짜:</span>
        <span>
          {selectedDate?.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-gray-600" />
        <span className="font-medium">시간:</span>
        <span>{selectedTime}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-gray-600" />
        <span className="font-medium">수용 인원:</span>
        <span>{room.capacity}명</span>
      </div>
    </div>
  );
}
