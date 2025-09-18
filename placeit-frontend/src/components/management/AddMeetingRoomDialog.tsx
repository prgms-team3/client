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
import { PlusIcon, Link2, ImageIcon, Trash2, PlusCircle } from 'lucide-react';

export type AmenityKey =
  | 'monitor'
  | 'projector'
  | 'whiteboard'
  | 'aircon'
  | 'microphone'
  | 'speaker'
  | 'wifi';

export type Status = 'available' | 'unavailable' | 'maintenance';
export type ImageType = 'PHOTO' | 'FLOOR_PLAN';

export interface RoomImage {
  imageUrl: string;
  imageType: ImageType;
}

export interface NewRoom {
  name: string;
  description: string;
  location: string;
  capacity: number;
  requiresApproval: boolean;
  amenities: AmenityKey[];
  images: RoomImage[];
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
  capacity: 4,
  requiresApproval: false,
  amenities: [],
  images: [],
};

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

  React.useEffect(() => {
    if (!open) return;
    setForm(prev => {
      const next: NewRoom = {
        ...EMPTY_FORM,
        ...prev,
        ...initial,
        name: initial?.name ?? prev.name ?? '',
        description: initial?.description ?? prev.description ?? '',
        location: initial?.location ?? prev.location ?? '',
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
          ? (initial!.amenities as AmenityKey[])
          : Array.isArray(prev.amenities)
          ? prev.amenities
          : [],
        images: Array.isArray(initial?.images)
          ? (initial!.images as RoomImage[])
          : Array.isArray(prev.images)
          ? prev.images
          : [],
      };
      return next;
    });
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

  const addImageRow = () => {
    setForm(prev => ({
      ...prev,
      images: [
        ...prev.images,
        { imageUrl: '', imageType: 'PHOTO' as ImageType },
      ],
    }));
  };
  const removeImageRow = (idx: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };
  const updateImageField = (
    idx: number,
    key: keyof RoomImage,
    value: string
  ) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === idx ? { ...img, [key]: value } : img
      ),
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '회의실 이름을 입력하세요.';
    if (!form.location.trim()) e.location = '위치를 입력하세요.';
    if (form.capacity <= 0) e.capacity = '수용인원은 1명 이상이어야 합니다.';
    form.images.forEach((img, i) => {
      if (img.imageUrl && !/^https?:\/\//.test(img.imageUrl.trim())) {
        e[`images.${i}.imageUrl`] = '이미지 URL은 http(s)로 시작해야 합니다.';
      }
    });
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

      {/* 스크롤 가능한 다이얼로그 레이아웃 */}
      <DialogContent
        className="
          w-[calc(100vw-2rem)] max-w-2xl p-0
          md:max-h-[85vh] max-h-[90vh] overflow-hidden
        "
      >
        {/* sticky 헤더 */}
        <DialogHeader
          className="
            sticky top-0 z-10 bg-white/90 backdrop-blur
            mt-8 px-6
          "
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>

        {/* 스크롤 본문 */}
        <div className="overflow-y-auto px-6 md:max-h-[calc(85vh-120px)] max-h-[calc(90vh-120px)]">
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
                  placeholder="예: 컨퍼런스 룸 A"
                  required
                  aria-required="true"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <ReqLabel htmlFor="room-description">설명</ReqLabel>
                <textarea
                  id="room-description"
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="예: 커다란 모니터가 있는 컨퍼런스 룸"
                  rows={2}
                />
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

              {/* 예약 승인 정책 */}
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

            {/* 이미지 */}
            <div className="space-y-3">
              <ReqLabel>이미지</ReqLabel>
              {form.images.length === 0 && (
                <div className="flex items-center gap-2 rounded-md border border-dashed border-gray-300 p-3 text-sm text-gray-600">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                  <span>
                    이미지를 추가하려면 아래 <b>이미지 추가</b> 버튼을
                    눌러주세요.
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {form.images.map((img, idx) => {
                  const isValidUrl =
                    img.imageUrl.trim().length > 0 &&
                    /^https?:\/\//.test(img.imageUrl.trim());
                  const urlError = errors[`images.${idx}.imageUrl`];
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border p-3 shadow-sm sm:p-4"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-8">
                        <div className="sm:col-span-5">
                          <label className="mb-1 block text-xs font-medium text-gray-700">
                            이미지 URL
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              inputMode="url"
                              className="w-full rounded-md border px-3 py-2 pr-10 text-sm"
                              placeholder="예: https://example.com/room.jpg"
                              value={img.imageUrl}
                              onChange={e =>
                                updateImageField(
                                  idx,
                                  'imageUrl',
                                  e.target.value
                                )
                              }
                            />
                            <Link2 className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          </div>
                          {urlError && (
                            <p className="mt-1 text-xs text-red-600">
                              {urlError}
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-medium text-gray-700">
                            유형
                          </label>
                          <select
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={img.imageType}
                            onChange={e =>
                              updateImageField(
                                idx,
                                'imageType',
                                e.target.value as ImageType
                              )
                            }
                          >
                            <option value="PHOTO">사진</option>
                            <option value="FLOOR_PLAN">도면</option>
                          </select>
                        </div>

                        <div className="sm:col-span-1 flex items-end">
                          <button
                            type="button"
                            className="mb-1 inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => removeImageRow(idx)}
                            aria-label="이미지 삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* 미리보기 */}
                      <div className="mt-3 overflow-hidden rounded-lg border">
                        {isValidUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img.imageUrl.trim()}
                            alt="미리보기"
                            className="h-32 w-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-3 text-sm text-gray-600">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                            <span>
                              유효한 이미지 URL을 입력하면 미리보기가 보여요.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addImageRow}
                className="inline-flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                이미지 추가
              </Button>
            </div>
          </form>
        </div>

        {/* sticky 푸터 */}
        <DialogFooter
          className="
            sticky bottom-0 z-10 bg-white/90 backdrop-blur
            border-t px-6 py-3
          "
        >
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              취소
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="__dummy__"
            onClick={(e: any) => {
              const formEl = e.currentTarget
                .closest('[role="dialog"]')
                ?.querySelector('form') as HTMLFormElement | null;
              formEl?.requestSubmit();
            }}
            disabled={loading}
          >
            {loading
              ? mode === 'edit'
                ? '수정 중…'
                : '추가 중…'
              : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
