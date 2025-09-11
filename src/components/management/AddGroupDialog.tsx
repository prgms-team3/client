'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // ✅ 네가 사용하는 공통 버튼

export type NewGroup = {
  name: string;
  type: 'exec' | 'department' | 'admin';
  description?: string;
  leader?: string;
  maxMembers?: number;
  createdAt: string; // yyyy-mm-dd
};

type Props = {
  onAdd: (g: NewGroup) => void;
  className?: string;
};

export default function AddGroupDialog({ onAdd, className }: Props) {
  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState<NewGroup>({
    name: '',
    type: 'department',
    description: '',
    leader: '',
    maxMembers: 0,
    createdAt: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
  });

  const handleChange = <K extends keyof NewGroup>(
    key: K,
    value: NewGroup[K]
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('그룹명을 입력하세요.');
      return;
    }
    onAdd({
      ...form,
      maxMembers: form.maxMembers ? Number(form.maxMembers) : 0,
    });
    setOpen(false);
    // 초기화
    setForm({
      name: '',
      type: 'department',
      description: '',
      leader: '',
      maxMembers: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          className={cn('flex items-center gap-2', className)}
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          그룹 추가
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        {/* Content */}
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              그룹 추가
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 그룹명 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                그룹명
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="예: 플랫폼개발팀"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
                required
              />
            </div>

            {/* 그룹 타입 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                그룹 타입
              </label>
              <select
                value={form.type}
                onChange={e =>
                  handleChange('type', e.target.value as NewGroup['type'])
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-400"
              >
                <option value="exec">임원진</option>
                <option value="department">부서</option>
                <option value="admin">관리자</option>
              </select>
            </div>

            {/* 설명 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                설명
              </label>
              <textarea
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={3}
                placeholder="그룹에 대한 간단한 설명을 적어주세요"
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
            </div>

            {/* 리더 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                리더
              </label>
              <input
                type="text"
                value={form.leader}
                onChange={e => handleChange('leader', e.target.value)}
                placeholder="예: 박수연"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
            </div>

            {/* 최대 멤버수 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                최대 멤버수
              </label>
              <input
                type="number"
                min={0}
                value={Number(form.maxMembers ?? 0)}
                onChange={e =>
                  handleChange('maxMembers', Number(e.target.value))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
            </div>

            {/* 생성일 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                생성일
              </label>
              <input
                type="date"
                value={form.createdAt}
                onChange={e => handleChange('createdAt', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">취소</Button>
              </Dialog.Close>
              <Button type="submit">추가</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
