'use client';

import * as React from 'react';
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
  ChevronLeft,
  ChevronRight,
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

export type ImageType = 'PHOTO' | 'FLOOR_PLAN';
export type RoomImage = { imageUrl: string; imageType: ImageType };

export interface MeetingRoomCardProps {
  name: string;
  description: string;
  location: string;
  capacity: number;
  monthlyReservations: number;
  utilizationRate: number;
  status: Status;
  facilities: AmenityKey[];
  /** 단일 대표 이미지 */
  imageUrl?: string;
  /** 여러 장 이미지 */
  images?: RoomImage[];

  onToggleActive?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  approvalPolicy?: 'auto' | 'approval_required';
  canManage?: boolean;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c';

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

function pickPrimaryIndex(images?: RoomImage[]) {
  if (!images || images.length === 0) return -1;
  const idx = images.findIndex(i => i.imageType === 'PHOTO');
  return idx >= 0 ? idx : 0;
}

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
  images,
  onToggleActive,
  onDelete,
  onEdit,
  approvalPolicy = 'auto',
  canManage = false,
}: MeetingRoomCardProps) {
  const isActive = status === 'available';

  const [activeIdx, setActiveIdx] = React.useState<number>(() =>
    pickPrimaryIndex(images)
  );
  const count = images?.length ?? (imageUrl ? 1 : 0);

  React.useEffect(() => {
    setActiveIdx(pickPrimaryIndex(images));
  }, [images]);

  const activeSrc =
    (images && images.length > 0 && images[activeIdx]?.imageUrl) ||
    imageUrl ||
    DEFAULT_IMAGE;

  const activeType =
    images && images.length > 0
      ? images[activeIdx]?.imageType ?? 'PHOTO'
      : ('PHOTO' as ImageType);

  const canCarousel = images && images.length > 1;

  // ----- 캐러셀 이동 -----
  const goPrev = () => {
    if (!canCarousel) return;
    setActiveIdx(i => (i - 1 + (images?.length ?? 1)) % (images?.length ?? 1));
  };

  const goNext = () => {
    if (!canCarousel) return;
    setActiveIdx(i => (i + 1) % (images?.length ?? 1));
  };

  // ----- 키보드 내비 -----
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  // ----- 드래그/스와이프 -----
  const startX = React.useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 30) {
      dx > 0 ? goPrev() : goNext();
    }
    startX.current = null;
  };

  return (
    <div className="w-full rounded-lg border bg-white p-4 shadow">
      {/* 이미지/캐러셀 */}
      <div
        ref={containerRef}
        tabIndex={0}
        className="relative overflow-hidden rounded-lg outline-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        aria-label={`${name} 이미지 갤러리`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeSrc}
          alt={name}
          width={800}
          height={450}
          className="aspect-[16/9] w-full object-cover transition-[transform,opacity]"
        />

        {/* 상태 뱃지 */}
        <span
          className={`absolute right-2 top-2 z-10 rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(
            status
          )}`}
        >
          {statusBadgeText(status)}
        </span>

        {/* 개수/타입 라벨 */}
        {count > 1 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            {activeIdx + 1}/{count}
          </span>
        )}
        {count >= 1 && (
          <span className="absolute left-2 bottom-2 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-gray-800">
            {activeType === 'FLOOR_PLAN' ? '도면' : '사진'}
          </span>
        )}

        {/* 화살표 */}
        {canCarousel && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="group absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white focus:outline-none"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 group-hover:scale-110 transition" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="group absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white focus:outline-none"
              aria-label="다음 이미지"
            >
              <ChevronRight className="h-5 w-5 text-gray-700 group-hover:scale-110 transition" />
            </button>
          </>
        )}

        {/* 인디케이터 */}
        {canCarousel && (
          <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2">
            <div className="flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-1">
              {images!.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  aria-label={`${idx + 1}번 이미지로 이동`}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    idx === activeIdx ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="mt-4">
        {/* 승인 여부 뱃지 */}
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

          {canManage && (
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
          )}
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

        {/* 사용 중지/시작 버튼 */}
        {canManage && (
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
        )}
      </div>
    </div>
  );
}
