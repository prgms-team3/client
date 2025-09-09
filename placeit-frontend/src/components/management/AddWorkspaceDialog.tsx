'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X as XIcon, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

import type {
  Workspace,
  CreateWorkspace,
  UpdateWorkspace,
} from '@/types/workspace';
import { createWorkspace, updateWorkspace } from '@/services/workspaces';

type Mode = 'create' | 'edit';

type Props = {
  mode?: Mode;
  initial?: Partial<Workspace>;
  onCreated?: (data: Workspace) => void;
  onUpdated?: (data: Workspace) => void;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
};

export default function AddWorkspaceDialog({
  mode = 'create',
  initial,
  onCreated,
  onUpdated,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [name, setName] = React.useState(initial?.name ?? '');
  const [description, setDescription] = React.useState(
    initial?.description ?? ''
  );
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(
    initial?.imageUrl ?? null
  );

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initial) {
      setName(initial.name ?? '');
      setDescription(initial.description ?? '');
      setImageUrl(initial.imageUrl ?? null);
    }
  }, [initial]);

  const validate = () => {
    if (!name.trim()) return '워크스페이스명을 입력하세요.';
    return null;
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
      if (mode === 'create') {
        const payload: CreateWorkspace = {
          name: name.trim(),
          description: description.trim() || undefined,
          // 이미지 파일을 서버가 받는 방식(FormData)으로 바꿔야 할 수도 있음
        };
        const created = await createWorkspace(payload);
        onCreated?.(created);
      } else if (mode === 'edit' && initial?.id) {
        const payload: UpdateWorkspace = {
          name: name.trim(),
          description: description.trim() || undefined,
        };
        const updated = await updateWorkspace(String(initial.id), payload);
        onUpdated?.(updated);
      }
      setOpen(false);
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || err?.message || '요청 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {mode === 'create' && (
        <Dialog.Trigger asChild>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            워크스페이스 생성
          </Button>
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-start justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? '새 워크스페이스 생성' : '워크스페이스 수정'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
                <XIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 워크스페이스명 */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                워크스페이스명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="예: PlaceIt"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="mb-1 block text-sm font-medium">설명</label>
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                이미지 업로드
              </label>
              {imageUrl ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="미리보기"
                    className="h-20 w-32 rounded-md object-cover border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 border-gray-300"
                    onClick={() => {
                      setImageFile(null);
                      if (imageUrl) URL.revokeObjectURL(imageUrl);
                      setImageUrl(null);
                    }}
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
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageFile(file);
                      const url = URL.createObjectURL(file);
                      if (imageUrl) URL.revokeObjectURL(imageUrl);
                      setImageUrl(url);
                    }}
                    className="hidden"
                  />
                </label>
              )}
              <p className="mt-1 text-xs text-gray-500">
                JPG/PNG, 5MB 이하 권장
              </p>
            </div>

            {/* 오류 메시지 */}
            {error && <p className="text-sm text-rose-600">{error}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border px-4 py-2 text-sm"
                >
                  취소
                </button>
              </Dialog.Close>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? '처리 중...'
                  : mode === 'create'
                  ? '생성'
                  : '수정'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
