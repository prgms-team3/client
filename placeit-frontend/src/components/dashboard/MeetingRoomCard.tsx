'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Clipboard,
  Wifi,
  Monitor,
  Volume2,
  Mic,
  AirVent,
  Presentation,
  Building,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ImageType = 'PHOTO' | 'FLOOR_PLAN';
type RoomImage = { imageUrl: string; imageType: ImageType };

type RoomStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'maintenance'
  | 'unavailable';

interface MeetingRoomCardProps {
  name: string;
  description?: string;
  capacity: number;
  /** 기존 props 유지 */
  features: string[];
  status: RoomStatus;
  requiresApproval?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  reservedTime?: string;

  /** 새로 추가: 대표 이미지 1장 또는 여러 장 */
  imageUrl?: string;
  images?: RoomImage[];
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c';

const AMENITY_MAP: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  projector: { label: '프로젝터', icon: Presentation },
  microphone: { label: '마이크', icon: Mic },
  aircon: { label: '에어컨', icon: AirVent },
  monitor: { label: '모니터', icon: Monitor },
  wifi: { label: 'Wi-Fi', icon: Wifi },
  whiteboard: { label: '화이트보드', icon: Clipboard },
  speaker: { label: '스피커', icon: Volume2 },
};

const statusColor = (status: RoomStatus) => {
  switch (status) {
    case 'available':
      return 'bg-green-500';
    case 'occupied':
      return 'bg-orange-600';
    case 'reserved':
      return 'bg-amber-500';
    case 'maintenance':
      return 'bg-yellow-500';
    case 'unavailable':
      return 'bg-red-600';
    default:
      return 'bg-gray-500';
  }
};

const statusText = (status: RoomStatus) => {
  switch (status) {
    case 'available':
      return '사용 가능';
    case 'occupied':
      return '사용 중';
    case 'reserved':
      return '예약됨';
    case 'maintenance':
      return '점검 중';
    case 'unavailable':
      return '사용 불가능';
    default:
      return '알 수 없음';
  }
};

const approvalBadge = (requiresApproval?: boolean) =>
  requiresApproval
    ? { cls: 'bg-yellow-400 text-white', text: '예약 시 승인 필요' }
    : { cls: 'bg-blue-400 text-white', text: '누구나 예약 가능' };

function pickPrimaryIndex(images?: RoomImage[]) {
  if (!images || images.length === 0) return -1;
  const idx = images.findIndex(i => i.imageType === 'PHOTO');
  return idx >= 0 ? idx : 0;
}

export function MeetingRoomCard({
  name,
  description = '',
  capacity,
  features,
  status,
  requiresApproval = false,
  isSelected = false,
  onSelect,
  reservedTime,
  imageUrl,
  images,
}: MeetingRoomCardProps) {
  const isClickable = status !== 'unavailable';

  // 캐러셀 상태
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

  const activeType: ImageType =
    images && images.length > 0
      ? images[activeIdx]?.imageType ?? 'PHOTO'
      : 'PHOTO';

  const canCarousel = (images?.length ?? 0) > 1;

  const goPrev = () => {
    if (!canCarousel) return;
    setActiveIdx(i => (i - 1 + (images?.length ?? 1)) % (images?.length ?? 1));
  };
  const goNext = () => {
    if (!canCarousel) return;
    setActiveIdx(i => (i + 1) % (images?.length ?? 1));
  };

  // 키보드 내비게이션
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

  // 드래그/스와이프
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

  const approval = approvalBadge(requiresApproval);

  return (
    <Card
      className={`w-full max-w-[280px] h-full transition-all duration-200 border-2 ${
        isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
      } flex flex-col min-h-[400px] ${
        isSelected
          ? 'border-blue-500 shadow-xl bg-blue-50 ring-4 ring-blue-200'
          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
      }`}
      onClick={isClickable ? onSelect : undefined}
      aria-disabled={!isClickable}
    >
      <CardHeader className="relative pb-3">
        {/* 이미지 / 캐러셀 */}
        <div
          ref={containerRef}
          tabIndex={0}
          className="relative overflow-hidden rounded-lg outline-none mb-4"
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
          <Badge
            className={`absolute top-2 right-2 ${statusColor(
              status
            )} text-white text-xs px-2 py-1`}
          >
            {statusText(status)}
          </Badge>

          {/* 이미지 개수 / 타입 라벨 */}
          {count > 1 && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
              {activeIdx >= 0 ? activeIdx + 1 : 1}/{count}
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
                    onClick={e => {
                      e.stopPropagation();
                      setActiveIdx(idx);
                    }}
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

        {/* 예약 정책 뱃지 (기존 유지) */}
        <div className="mb-2">
          <Badge className={`${approval.cls} text-xs px-2 py-1`}>
            {approval.text}
          </Badge>
        </div>

        <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-1">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-4 flex-1">
        <div className="space-y-3">
          {/* 수용 인원 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="h-4 w-4 text-gray-500" />
            <span>{capacity}명</span>
          </div>

          {/* 제공 기능 */}
          <div>
            <span className="text-sm font-medium text-gray-600">
              제공 기능:
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {features.map((feature, index) => {
                const mapped = AMENITY_MAP[feature];
                if (!mapped) return null;
                const Icon = mapped.icon;
                return (
                  <Badge
                    key={`${feature}-${index}`}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1"
                  >
                    <Icon className="w-3 h-3" />
                    {mapped.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* 예약 시간 표시 (기존 유지) */}
          {reservedTime && (
            <div
              className={`mt-2 p-2 rounded-lg border ${
                status === 'occupied'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-orange-50 border-orange-200'
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  status === 'occupied' ? 'text-red-700' : 'text-orange-700'
                }`}
              >
                {status === 'occupied' ? '사용 중' : '예약됨'}: {reservedTime}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
