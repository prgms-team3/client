'use client';

import * as React from 'react';
import {
  Edit2,
  Trash2,
  Clipboard,
  Wifi,
  Monitor,
  Music,
  Volume2,
  Mic,
  Camera,
  Lightbulb,
  Clapperboard,
  Presentation,
  Tv,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Status = 'available' | 'unavailable' | 'maintenance';

export type FacilityKey =
  | 'whiteboard'
  | 'wifi'
  | 'monitor'
  | 'audio'
  | 'speaker'
  | 'mic'
  | 'camera'
  | 'light'
  | 'recorder'
  | 'beam_projector'
  | 'smart_tv'
  | 'video_conf';

export interface MeetingRoomCardProps {
  name: string;
  description: string;
  location: string;
  capacity: number;
  monthlyReservations: number;
  utilizationRate: number;
  status: Status;
  facilities: FacilityKey[];
  imageUrl: string;
  onStatusChange?: (next: Status) => void;
  /** 승인 정책 (항상 칩 노출) */
  approvalPolicy?: 'auto' | 'approval_required';
}

const facilityMap: Record<
  FacilityKey,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  whiteboard: { label: '화이트보드', Icon: Clipboard },
  wifi: { label: 'WiFi', Icon: Wifi },
  monitor: { label: '모니터', Icon: Monitor },
  audio: { label: '오디오', Icon: Music },
  speaker: { label: '스피커', Icon: Volume2 },
  mic: { label: '마이크', Icon: Mic },
  camera: { label: '카메라', Icon: Camera },
  light: { label: '조명', Icon: Lightbulb },
  recorder: { label: '녹화장비', Icon: Clapperboard },
  beam_projector: { label: '빔프로젝터', Icon: Presentation },
  smart_tv: { label: '스마트TV', Icon: Tv },
  video_conf: { label: '화상회의', Icon: Video },
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
  onStatusChange,
  approvalPolicy = 'auto',
}: MeetingRoomCardProps) {
  const actions = React.useMemo(() => {
    if (status === 'available') {
      return [
        {
          label: '사용 중지',
          variant: 'destructive' as const,
          next: 'unavailable' as Status,
        },
        {
          label: '점검 시작',
          variant: 'outline' as const,
          next: 'maintenance' as Status,
        },
      ];
    }
    if (status === 'unavailable') {
      return [
        {
          label: '사용 시작',
          variant: 'default' as const,
          next: 'available' as Status,
        },
        {
          label: '점검 시작',
          variant: 'outline' as const,
          next: 'maintenance' as Status,
        },
      ];
    }
    return [
      {
        label: '사용 시작',
        variant: 'default' as const,
        next: 'available' as Status,
      },
      {
        label: '점검 완료',
        variant: 'outline' as const,
        next: 'available' as Status,
      },
    ];
  }, [status]);

  return (
    <div className="w-full rounded-lg border bg-white p-4 shadow">
      {/* 이미지 */}
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={name}
          className="aspect-[16/9] w-full object-cover"
          loading="lazy"
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
        {/* 회의실 이름 및 설명 */}
        <div className="mt-1 mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{name}</h2>
          <div className="flex gap-2">
            <button
              className="p-1 text-gray-500 hover:text-gray-800"
              aria-label="수정"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              className="p-1 text-red-500 hover:text-red-700"
              aria-label="삭제"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500">{description}</p>

        {/* 회의실 상세정보 */}
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

        {/* 시설 태그 */}
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
          {actions.map(a => (
            <Button
              key={a.label}
              variant={a.variant}
              size="lg"
              onClick={() => onStatusChange?.(a.next)}
              aria-label={a.label}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
