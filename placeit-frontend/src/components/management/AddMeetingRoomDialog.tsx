'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

export type AmenityKey =
  | 'monitor'
  | 'projector'
  | 'whiteboard'
  | 'aircon'
  | 'microphone'
  | 'speaker'
  | 'wifi';

export type Status = 'available' | 'unavailable' | 'maintenance';

export interface NewRoom {
  name: string;
  description: string;
  location: string;
  size: number; // 서버 요청 스키마 포함(POST에만 사용)
  capacity: number;
  requiresApproval: boolean;
  amenities: AmenityKey[];
}

interface AddMeetingRoomDialogProps {
  onAdd?: (room: NewRoom) => void | Promise<void>;
  onSave?: (room: NewRoom) => void | Promise<void>;
  mode?: 'create' | 'edit';
  initial?: Partial<NewRoom>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const AMENITY_OPTIONS: Array<{ value: AmenityKey; label: string }> = [
  { value: 'monitor', label: '모니터' },
  { value: 'projector', label: '프로젝터' },
  { value: 'whiteboard', label: '화이트보드' },
  { value: 'aircon', label: '에어컨' },
  { value: 'microphone', label: '마이크' },
  { value: 'speaker', label: '스피커' },
  { value: 'wifi', label: 'Wi-Fi' },
];

const EMPTY_FORM: NewRoom = {
  name: '',
  description: '',
  location: '',
  size: 0,
  capacity: 4,
  requiresApproval: false,
  amenities: [],
};

/** 라벨 유틸 */
function ReqLabel({
  children,
  htmlFor,
  required = false,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-sm font-medium text-gray-900"
    >
      {children}
      {required && (
        <span
          className="ml-1 align-middle text-red-500"
          aria-hidden="true"
          title="필수"
        >
          *
        </span>
      )}
    </label>
  );
}

export default function AddMeetingRoomDialog({
  onAdd,
  onSave,
  mode = 'create',
  initial,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: AddMeetingRoomDialogProps) {
  const isControlled = typeof controlledOpen === 'boolean';
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (v: boolean) =>
    isControlled ? controlledOnOpenChange?.(v) : setUncontrolledOpen(v);

  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState<NewRoom>({ ...EMPTY_FORM });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // 초기값 반영(열릴 때마다 갱신)
  React.useEffect(() => {
    if (!open) return;
    setForm(prev => ({
      ...EMPTY_FORM,
      ...prev,
      ...initial,
      name: initial?.name ?? prev.name ?? '',
      description: initial?.description ?? prev.description ?? '',
      location: initial?.location ?? prev.location ?? '',
      size:
        typeof initial?.size === 'number'
          ? initial.size
          : typeof prev.size === 'number'
          ? prev.size
          : 0,
      capacity:
        typeof initial?.capacity === 'number'
          ? initial.capacity
          : typeof prev.capacity === 'number'
          ? prev.capacity
          : 4,
      requiresApproval:
        typeof initial?.requiresApproval === 'boolean'
          ? initial.requiresApproval
          : typeof prev.requiresApproval === 'boolean'
          ? prev.requiresApproval
          : false,
      amenities: Array.isArray(initial?.amenities)
        ? initial!.amenities
        : Array.isArray(prev.amenities)
        ? prev.amenities
        : [],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const update = <K extends keyof NewRoom>(key: K, value: NewRoom[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (value: AmenityKey) => {
    setForm(prev => {
      const has = prev.amenities.includes(value);
      return {
        ...prev,
        amenities: has
          ? prev.amenities.filter(v => v !== value)
          : [...prev.amenities, value],
      };
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '회의실 이름을 입력하세요.';
    if (!form.location.trim()) e.location = '위치를 입력하세요.';
    if (form.capacity <= 0) e.capacity = '수용인원은 1명 이상이어야 합니다.';
    if (form.size < 0) e.size = '면적은 0 이상이어야 합니다.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      if (mode === 'edit') {
        await onSave?.(form);
      } else {
        await onAdd?.(form);
      }
      setOpen(false);
      if (mode === 'create') setForm({ ...EMPTY_FORM });
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'edit' ? '회의실 수정' : '회의실 추가';
  const desc =
    mode === 'edit'
      ? '회의실의 정보를 수정하세요.'
      : '새 회의실의 기본 정보를 입력하세요.';
  const submitLabel = mode === 'edit' ? '수정' : '추가';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : mode === 'create' ? (
        <DialogTrigger asChild>
          <Button aria-label="회의실 추가">
            <PlusIcon />
            회의실 추가
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <ReqLabel htmlFor="room-name" required>
                이름
              </ReqLabel>
              <input
                id="room-name"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="예) Conference Room A"
                required
                aria-required="true"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <ReqLabel htmlFor="room-location" required>
                위치
              </ReqLabel>
              <input
                id="room-location"
                value={form.location}
                onChange={e => update('location', e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="예) 2층 동측"
                required
                aria-required="true"
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-600">{errors.location}</p>
              )}
            </div>

            <div>
              <ReqLabel htmlFor="room-capacity" required>
                수용인원
              </ReqLabel>
              <input
                id="room-capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={e => update('capacity', Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
                aria-required="true"
              />
              {errors.capacity && (
                <p className="mt-1 text-xs text-red-600">{errors.capacity}</p>
              )}
            </div>

            <div>
              <ReqLabel htmlFor="room-size">면적(㎡)</ReqLabel>
              <input
                id="room-size"
                type="number"
                min={0}
                step="0.1"
                value={form.size}
                onChange={e => update('size', Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              {errors.size && (
                <p className="mt-1 text-xs text-red-600">{errors.size}</p>
              )}
            </div>

            {/* 승인 여부 */}
            <div className="sm:col-span-2">
              <ReqLabel>예약 승인 정책</ReqLabel>
              <div className="flex flex-wrap items-center gap-4 rounded-md border p-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="requiresApproval"
                    value="false"
                    checked={!form.requiresApproval}
                    onChange={() => update('requiresApproval', false)}
                  />
                  누구나 예약 가능
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="requiresApproval"
                    value="true"
                    checked={form.requiresApproval}
                    onChange={() => update('requiresApproval', true)}
                  />
                  예약 시 승인 필요
                </label>
              </div>
            </div>
          </div>

          {/* 설비 */}
          <div>
            <ReqLabel>설비</ReqLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AMENITY_OPTIONS.map(opt => {
                const checked = form.amenities.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(opt.value)}
                      className="h-4 w-4"
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                취소
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading
                ? mode === 'edit'
                  ? '수정 중…'
                  : '추가 중…'
                : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
