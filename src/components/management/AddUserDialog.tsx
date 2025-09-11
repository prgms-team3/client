'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X as XIcon, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type NewUser = {
  name: string;
  email: string;
  department?: string;
  title?: string;
  role: 'member' | 'admin';
  status: 'active' | 'suspended';
};

type Props = {
  onAdd: (user: NewUser) => void;
};

export default function AddUserDialog({ onAdd }: Props) {
  const [open, setOpen] = React.useState(false);

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [role, setRole] = React.useState<NewUser['role']>('member');
  const [status, setStatus] = React.useState<NewUser['status']>('active');

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reset = () => {
    setName('');
    setEmail('');
    setDepartment('');
    setTitle('');
    setRole('member');
    setStatus('active');
    setError(null);
  };

  const validate = () => {
    if (!name.trim()) return '이름을 입력하세요.';
    if (!email.trim()) return '이메일을 입력하세요.';
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) return '이메일 형식이 올바르지 않습니다.';
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
      onAdd({
        name: name.trim(),
        email: email.trim(),
        department: department.trim() || undefined,
        title: title.trim() || undefined,
        role,
        status, // 'active' | 'suspended'
      });
      reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          사용자 추가
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-white p-6 shadow-xl focus:outline-none">
          <div className="mb-4 flex items-start justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              사용자 추가
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
            {/* 이름 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                이름 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-0 focus:border-primary-400"
                placeholder="홍길동"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                이메일 <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-0 focus:border-primary-400"
                placeholder="user@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {/* 부서 / 직급 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  부서
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-0 focus:border-primary-400"
                  placeholder="예: 플랫폼개발팀"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  직급
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-0 focus:border-primary-400"
                  placeholder="예: 매니저 / 주임 / 리드"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
            </div>

            {/* 역할 / 상태 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  역할
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                  value={role}
                  onChange={e => setRole(e.target.value as NewUser['role'])}
                >
                  <option value="member">사용자</option>
                  <option value="admin">관리자</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  상태
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
                  value={status}
                  onChange={e => setStatus(e.target.value as NewUser['status'])}
                >
                  <option value="active">활성</option>
                  <option value="suspended">비활성</option>
                </select>
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
                {submitting ? '추가 중...' : '추가하기'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
