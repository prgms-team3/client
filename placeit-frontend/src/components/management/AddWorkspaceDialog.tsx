'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X as XIcon,
  Plus,
  Link2,
  Image as ImageIcon,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import type {
  Workspace,
  CreateWorkspace,
  UpdateWorkspace,
} from '@/types/workspace';
import {
  createWorkspace,
  updateWorkspace,
  joinWorkspaceByCode,
} from '@/services/workspaces';

type Mode = 'create' | 'edit';

type Props = {
  mode?: Mode;
  initial?: Partial<Workspace>;
  onCreated?: (data: Workspace) => void; // join 성공 시에도 재활용
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

  // 이미지 URL
  const [imageUrl, setImageUrl] = React.useState<string>(
    initial?.imageUrl ?? ''
  );
  const [imageUrlTouched, setImageUrlTouched] = React.useState(false);

  // 초대코드
  const [inviteCode, setInviteCode] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);
  const [joining, setJoining] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [joinError, setJoinError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initial) {
      setName(initial.name ?? '');
      setDescription(initial.description ?? '');
      setImageUrl(initial.imageUrl ?? '');
    }
  }, [initial]);

  const validate = () => {
    if (!name.trim()) return '워크스페이스명을 입력하세요.';
    if (imageUrlTouched && imageUrl.trim()) {
      const ok = /^(https?:\/\/).+/i.test(imageUrl.trim());
      if (!ok)
        return '이미지 URL이 올바르지 않습니다. http(s)로 시작하는 주소를 입력하세요.';
    }
    return null;
  };

  const getMsg = (err: unknown): string => {
    if (typeof err === 'object' && err !== null) {
      const anyErr = err as {
        message?: unknown;
        response?: { data?: { message?: unknown } };
      };
      if (typeof anyErr?.response?.data?.message === 'string')
        return anyErr.response.data.message;
      if (typeof anyErr?.message === 'string') return anyErr.message;
    }
    return '요청 실패';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'create') {
        const payload: CreateWorkspace = {
          name: name.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
        };
        const created = await createWorkspace(payload);
        onCreated?.(created);
      } else if (mode === 'edit' && initial?.id) {
        const payload: UpdateWorkspace = {
          name: name.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
        };
        const updated = await updateWorkspace(String(initial.id), payload);
        onUpdated?.(updated);
      }
      setOpen(false);
    } catch (err: unknown) {
      setError(getMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinByInvite = async () => {
    setJoinError(null);
    const code = inviteCode.trim();
    if (!code) {
      setJoinError('초대코드를 입력하세요.');
      return;
    }
    setJoining(true);
    try {
      const joined = await joinWorkspaceByCode(code);
      onCreated?.(joined);
      setOpen(false);
    } catch (err: unknown) {
      setJoinError(getMsg(err));
    } finally {
      setJoining(false);
    }
  };

  const showPreview =
    imageUrlTouched && !!imageUrl.trim() && /^(https?:\/\/).+/i.test(imageUrl);

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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 워크스페이스명 */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                워크스페이스명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="예: Tech Company"
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
                placeholder="Our main office workspace"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* 이미지 URL */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                이미지 URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  inputMode="url"
                  className="w-full rounded-md border px-3 py-2 pr-10 text-sm"
                  placeholder="https://example.com/image.png"
                  value={imageUrl}
                  onChange={e => {
                    setImageUrl(e.target.value);
                    setImageUrlTouched(true);
                  }}
                  onBlur={() => setImageUrlTouched(true)}
                />
                <Link2 className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                http(s)로 시작하는 공개 이미지 주소를 넣어주세요. (선택)
              </p>

              {/* 미리보기 */}
              {showPreview ? (
                <div className="mt-3 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl.trim()}
                    alt="미리보기"
                    className="h-32 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-gray-300 p-3 text-sm text-gray-600">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                  <span>이미지 URL을 입력하면 이곳에 미리보기가 보여요.</span>
                </div>
              )}
            </div>

            {/* 오류 메시지 (생성/수정) */}
            {error && <p className="text-sm text-rose-600">{error}</p>}

            {/* 액션 */}
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

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px w-full bg-gray-200" />
            <span className="shrink-0 text-xs text-gray-500">혹은</span>
            <div className="h-px w-full bg-gray-200" />
          </div>

          {/* 초대코드로 참여하기 */}
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="mb-2 text-sm font-medium text-gray-800">
              초대코드로 워크스페이스 참여하기
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="초대코드를 입력하세요"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="gap-1 border-gray-300"
                onClick={handleJoinByInvite}
                disabled={joining}
                aria-busy={joining}
              >
                {joining ? '참여 중…' : '참여하기'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {joinError && (
              <p className="mt-2 text-sm text-rose-600">{joinError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              초대코드는 워크스페이스 관리자에게 받을 수 있어요.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
