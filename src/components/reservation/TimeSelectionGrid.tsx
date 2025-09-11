'use client';

import React from 'react';
import { Label } from '@/components/ui/label';

interface TimeSelectionGridProps {
  timeSlots: string[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  isTimeReserved?: (time: string) => boolean;
  disabled?: boolean;
  showLegend?: boolean;
  size?: 'small' | 'large';
  className?: string;
}

export function TimeSelectionGrid({
  timeSlots,
  selectedTime,
  onTimeSelect,
  isTimeReserved = () => false,
  disabled = false,
  showLegend = true,
  size = 'small',
  className = '',
}: TimeSelectionGridProps) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium">회의 시간</Label>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {timeSlots.map(time => {
          const isReserved = isTimeReserved(time);
          const isSelected = selectedTime === time;

          return (
            <button
              key={time}
              type="button"
              onClick={() => {
                if (!disabled && !isReserved) {
                  onTimeSelect(time);
                }
              }}
              disabled={disabled || isReserved}
              className={`transition-colors ${
                size === 'large'
                  ? 'p-4 text-sm font-medium rounded-xl border-2'
                  : 'p-2 text-xs rounded border'
              } ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : isReserved
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>

      {/* 범례 (선택적으로 표시) */}
      {showLegend && (
        <div className="mt-3 text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
            <span>예약 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 border border-blue-600 rounded"></div>
            <span>선택됨</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span>예약됨</span>
          </div>
        </div>
      )}
    </div>
  );
}
