'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** 읽기 전용으로 보여줄 이름/이메일 + 수정 대상 기본값(부서/직급) */
  initial: {
    name: string;
    email: string;
    department?: string | null;
    position?: string | null; // 서버 필드명
  };
  /** 서버 PATCH 수행 콜백. 성공 시 resolve, 실패 시 throw */
  onSubmit: (payload: {
    department?: string;
    position?: string;
  }) => Promise<void>;
};

export default function EditUserDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: Props) {
  const [department, setDepartment] = React.useState(initial.department ?? '');
  const [position, setPosition] = React.useState(initial.position ?? '');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 대상이 바뀌면 폼 초기화
    setDepartment(initial.department ?? '');
    setPosition(initial.position ?? '');
    setError(null);
    setSubmitting(false);
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        department: department.trim() || undefined,
        position: position.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '수정 중 오류가 발생했습니다.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none">
          <div className="mb-4 flex items-start justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              내 정보 수정
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
            {/* 이름(읽기 전용) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                value={initial.name}
                readOnly
                className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
              />
            </div>

            {/* 이메일(읽기 전용) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                value={initial.email}
                readOnly
                className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
              />
            </div>

            {/* 부서 / 직급(편집 가능) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  부서
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="예: 플랫폼개발팀"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  직급
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  placeholder="예: 매니저 / 주임 / 리드"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
                />
              </div>
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
                {submitting ? '저장 중...' : '저장'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
