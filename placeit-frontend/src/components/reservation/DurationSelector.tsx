'use client';

import React from 'react';
import { Label } from '@/components/ui/label';

interface DurationSelectorProps {
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
}

export function DurationSelector({
  selectedDuration,
  onDurationChange,
}: DurationSelectorProps) {
  const durations = ['30분', '1시간', '1시간 30분', '2시간'];

  return (
    <div>
      <Label className="text-sm font-medium">회의 시간 설정</Label>
      <div className="mt-2 flex gap-2">
        {durations.map(duration => (
          <button
            key={duration}
            type="button"
            onClick={() => onDurationChange(duration)}
            className={`px-4 py-2 text-sm rounded border transition-colors ${
              selectedDuration === duration
                ? 'bg-blue-600 text-white border-blue-600'
                : 'hover:bg-gray-50 border-gray-200'
            }`}
          >
            {duration}
          </button>
        ))}
      </div>
    </div>
  );
}
