'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X as XIcon, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type NewWorkspace = {
  name: string;
  description: string;
  owner: string;
  maxMembers: number;
  /** 서버로 업로드할 때 file 혹은 미리보기용 dataUrl 중 하나를 활용하세요 */
  imageFile?: File | null;
  imageUrl?: string | null; // objectURL or dataURL (preview)
};

type Props = {
  onCreate: (data: NewWorkspace) => void;
};

export default function AddWorkspaceDialog({ onCreate }: Props) {
  const [open, setOpen] = React.useState(false);

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [owner, setOwner] = React.useState('');
  const [maxMembers, setMaxMembers] = React.useState<number | ''>('');

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null); // preview

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reset = () => {
    setName('');
    setDescription('');
    setOwner('');
    setMaxMembers('');
    setImageFile(null);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setError(null);
  };

  const validate = () => {
    if (!name.trim()) return '워크스페이스명을 입력하세요.';
    if (!description.trim()) return '설명을 입력하세요.';
    if (!owner.trim()) return '소유자를 입력하세요.';
    const n = Number(maxMembers);
    if (!Number.isFinite(n) || n < 1)
      return '최대 멤버 수는 1 이상의 숫자여야 합니다.';
    // 이미지 필수는 아님. 필수로 하려면 아래 주석 해제
    // if (!imageFile) return '이미지를 선택해주세요.';
    return null;
  };

  const onSelectImage: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 간단한 타입/용량 체크(옵션)
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    // 5MB 제한 예시
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 용량은 5MB 이하만 가능합니다.');
      return;
    }

    setError(null);
    setImageFile(file);
    // object URL로 즉시 미리보기
    const url = URL.createObjectURL(file);
    // 기존 url revoke
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(url);
  };

  const clearImage = () => {
    setImageFile(null);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      onCreate({
        name: name.trim(),
        description: description.trim(),
        owner: owner.trim(),
        maxMembers: Number(maxMembers),
        imageFile,
        imageUrl, // 미리보기 url (서버 업로드 완료 후엔 서버 url로 교체)
      });
      reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={o => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      {/* 트리거: 파란색 버튼 */}
      <Dialog.Trigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          워크스페이스 생성
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none">
          <div className="mb-4 flex items-start justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              새 워크스페이스 생성
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 워크스페이스명 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                워크스페이스명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-0 focus:border-primary-400"
                placeholder="예: Place It"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                설명 <span className="text-rose-500">*</span>
              </label>
              <textarea
                className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-0 focus:border-primary-400"
                placeholder="워크스페이스의 목적과 특징을 설명해주세요"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* 소유자 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                소유자 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-0 focus:border-primary-400"
                placeholder="예: 홍길동"
                value={owner}
                onChange={e => setOwner(e.target.value)}
              />
            </div>

            {/* 최대 멤버 수 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                최대 멤버 수 <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-0 focus:border-primary-400"
                placeholder="예: 50"
                value={maxMembers}
                onChange={e =>
                  setMaxMembers(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                이미지 업로드
              </label>

              {imageUrl ? (
                <div className="flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="미리보기"
                    className="h-20 w-32 rounded-md object-cover border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 border-gray-300"
                    onClick={clearImage}
                  >
                    <Trash2 className="h-4 w-4" />
                    제거
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <ImageIcon className="h-4 w-4" />
                  <span>이미지 선택</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onSelectImage}
                    className="hidden"
                  />
                </label>
              )}

              <p className="mt-1 text-xs text-gray-500">
                JPG/PNG, 5MB 이하 권장
              </p>
            </div>

            {error && (
              <p className="text-sm text-rose-600" role="alert">
                {error}
              </p>
            )}

            <div className="mt-2 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
              </Dialog.Close>
              <Button type="submit" disabled={submitting}>
                {submitting ? '생성 중...' : '생성'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
