'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Edit2,
  Trash2,
  Clipboard,
  Wifi,
  Monitor,
  Volume2,
  Mic,
  AirVent,
  Presentation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Status = 'available' | 'unavailable' | 'maintenance';

export type AmenityKey =
  | 'monitor'
  | 'projector'
  | 'whiteboard'
  | 'aircon'
  | 'microphone'
  | 'speaker'
  | 'wifi';

export interface MeetingRoomCardProps {
  name: string;
  description: string;
  location: string;
  capacity: number;
  monthlyReservations: number;
  utilizationRate: number;
  status: Status; // 실제로는 available/unavailable만 사용
  facilities: AmenityKey[];
  imageUrl: string;
  onToggleActive?: () => void;
  onDelete?: () => void;
  onEdit?: () => void; // ← 추가
  approvalPolicy?: 'auto' | 'approval_required';
}

const facilityMap: Record<
  AmenityKey,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  whiteboard: { label: '화이트보드', Icon: Clipboard },
  wifi: { label: 'Wi-Fi', Icon: Wifi },
  monitor: { label: '모니터', Icon: Monitor },
  speaker: { label: '스피커', Icon: Volume2 },
  microphone: { label: '마이크', Icon: Mic },
  aircon: { label: '에어컨', Icon: AirVent },
  projector: { label: '프로젝터', Icon: Presentation },
};

const statusBadgeClass = (status: Status) =>
  status === 'available'
    ? 'bg-green-100 text-green-700'
    : status === 'maintenance'
    ? 'bg-orange-100 text-orange-800'
    : 'bg-red-100 text-red-700';

const statusBadgeText = (status: Status) =>
  status === 'available'
    ? '사용가능'
    : status === 'maintenance'
    ? '점검중'
    : '사용불가';

const approvalBadgeClass = (p: 'auto' | 'approval_required') =>
  p === 'approval_required'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-blue-100 text-blue-700';

const approvalBadgeText = (p: 'auto' | 'approval_required') =>
  p === 'approval_required' ? '예약 시 승인 필요' : '누구나 예약 가능';

export default function MeetingRoomCard({
  name,
  description,
  location,
  capacity,
  monthlyReservations,
  utilizationRate,
  status,
  facilities,
  imageUrl,
  onToggleActive,
  onDelete,
  onEdit,
  approvalPolicy = 'auto',
}: MeetingRoomCardProps) {
  const isActive = status === 'available';

  return (
    <div className="w-full rounded-lg border bg-white p-4 shadow">
      {/* 이미지 */}
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={name}
          width={400}
          height={225}
          className="aspect-[16/9] w-full object-cover"
          priority={false}
        />
        <span
          className={`absolute right-2 top-2 z-10 rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(
            status
          )}`}
        >
          {statusBadgeText(status)}
        </span>
      </div>

      {/* 본문 */}
      <div className="mt-4">
        {/* 승인 여부 */}
        <span
          className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${approvalBadgeClass(
            approvalPolicy
          )}`}
        >
          {approvalBadgeText(approvalPolicy)}
        </span>

        {/* 제목/액션 */}
        <div className="mt-1 mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{name}</h2>
          <div className="flex gap-2">
            <button
              className="p-1 text-gray-500 hover:text-gray-800"
              aria-label="수정"
              onClick={onEdit}
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              className="p-1 text-red-500 hover:text-red-700"
              aria-label="삭제"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500">{description}</p>

        {/* 상세 */}
        <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm text-gray-700">
          <span>
            위치: <b>{location}</b>
          </span>
          <span>
            수용인원: <b>{capacity}명</b>
          </span>
          <span>
            월 예약: <b>{monthlyReservations}건</b>
          </span>
          <span>
            이용률: <b className="text-green-600">{utilizationRate}%</b>
          </span>
        </div>

        {/* 설비 태그 */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {facilities.map(key => {
            const item = facilityMap[key];
            if (!item) return null;
            const Icon = item.Icon;
            return (
              <span
                key={key}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1"
              >
                <Icon className="h-3 w-3" />
                {item.label}
              </span>
            );
          })}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-4 flex gap-2">
          <Button
            variant={isActive ? 'destructive' : 'default'}
            size="lg"
            onClick={onToggleActive}
            aria-label={isActive ? '사용 중지' : '사용 시작'}
          >
            {isActive ? '사용 중지' : '사용 시작'}
          </Button>
        </div>
      </div>
    </div>
  );
}
