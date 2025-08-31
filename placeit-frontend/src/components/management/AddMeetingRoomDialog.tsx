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

type FacilityKey =
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

type Status = 'available' | 'unavailable' | 'maintenance';
type ApprovalPolicy = 'auto' | 'approval_required';

export interface NewRoom {
  name: string;
  description: string;
  location: string;
  capacity: number;
  /** 생성 시 0 고정 */
  monthlyReservations: 0;
  /** 생성 시 0 고정 */
  utilizationRate: 0;
  status: Status;
  facilities: FacilityKey[];
  imageUrl: string;
  approvalPolicy: ApprovalPolicy;
}

interface AddMeetingRoomDialogProps {
  onAdd: (room: NewRoom) => void;
}

const FACILITY_OPTIONS: Array<{ value: FacilityKey; label: string }> = [
  { value: 'whiteboard', label: '화이트보드' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'monitor', label: '모니터' },
  { value: 'audio', label: '오디오' },
  { value: 'speaker', label: '스피커' },
  { value: 'mic', label: '마이크' },
  { value: 'camera', label: '카메라' },
  { value: 'light', label: '조명' },
  { value: 'recorder', label: '녹화장비' },
  { value: 'beam_projector', label: '빔프로젝터' },
  { value: 'smart_tv', label: '스마트TV' },
  { value: 'video_conf', label: '화상회의' },
];

export default function AddMeetingRoomDialog({
  onAdd,
}: AddMeetingRoomDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<NewRoom>({
    name: '',
    description: '',
    location: '',
    capacity: 4,
    monthlyReservations: 0,
    utilizationRate: 0,
    status: 'available',
    facilities: [],
    imageUrl: '',
    approvalPolicy: 'auto', // 기본: 누구나 예약 가능
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const update = <K extends keyof NewRoom>(key: K, value: NewRoom[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleFacility = (value: FacilityKey) => {
    setForm(prev => {
      const has = prev.facilities.includes(value);
      return {
        ...prev,
        facilities: has
          ? prev.facilities.filter(v => v !== value)
          : [...prev.facilities, value],
      };
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '회의실 이름을 입력하세요.';
    if (!form.location.trim()) e.location = '위치를 입력하세요.';
    if (form.capacity <= 0) e.capacity = '수용인원은 1명 이상이어야 합니다.';
    if (!form.imageUrl.trim()) e.imageUrl = '이미지 URL을 입력하세요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: NewRoom = {
      ...form,
      monthlyReservations: 0 as const,
      utilizationRate: 0 as const,
    };

    onAdd(payload);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-label="회의실 추가">
          <PlusIcon />
          회의실 추가
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>회의실 추가</DialogTitle>
          <DialogDescription>
            새 회의실의 기본 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">이름 *</label>
              <input
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="예) 회의실 A"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">위치 *</label>
              <input
                value={form.location}
                onChange={e => update('location', e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="예) 1층 동쪽"
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-600">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                수용인원 *
              </label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={e => update('capacity', Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              {errors.capacity && (
                <p className="mt-1 text-xs text-red-600">{errors.capacity}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">상태</label>
              <select
                value={form.status}
                onChange={e => update('status', e.target.value as Status)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="available">사용가능</option>
                <option value="unavailable">사용불가</option>
                <option value="maintenance">점검중</option>
              </select>
            </div>

            {/* 승인 여부 */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                회의실 승인 여부
              </label>
              <div className="flex flex-wrap items-center gap-4 rounded-md border p-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="approvalPolicy"
                    value="auto"
                    checked={form.approvalPolicy === 'auto'}
                    onChange={() => update('approvalPolicy', 'auto')}
                  />
                  누구나 예약 가능
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="approvalPolicy"
                    value="approval_required"
                    checked={form.approvalPolicy === 'approval_required'}
                    onChange={() =>
                      update('approvalPolicy', 'approval_required')
                    }
                  />
                  예약 시 승인 필요
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                이미지 URL *
              </label>
              <input
                value={form.imageUrl}
                onChange={e => update('imageUrl', e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="https://images.unsplash.com/..."
              />
              {errors.imageUrl && (
                <p className="mt-1 text-xs text-red-600">{errors.imageUrl}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">설명</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                placeholder="간단한 설명을 입력하세요."
              />
            </div>
          </div>

          {/* 설비 */}
          <div>
            <label className="mb-2 block text-sm font-medium">설비</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FACILITY_OPTIONS.map(opt => {
                const checked = form.facilities.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFacility(opt.value)}
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
              <Button type="button" variant="outline">
                취소
              </Button>
            </DialogClose>
            <Button type="submit">추가</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
