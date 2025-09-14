'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X as XIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type GroupType = 'admin' | 'department';

export type NewGroup = {
  name: string;
  description?: string;
  type?: GroupType; // 서버 전송 시 ADMIN/DEPARTMENT로 변환
  leader?: string; // 서버 전송 시 leaderName으로 매핑
  maxMembers?: number;
  createdAt?: string; // UI 전용
};

type CreateProps = {
  mode: 'create';
  onAdd: (data: NewGroup) => void;
};

type EditProps = {
  mode: 'edit';
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: NewGroup;
  onSubmit: (data: {
    name: string;
    description?: string;
    maxMembers?: number;
    type?: GroupType;
    leader?: string;
  }) => void;
};

type Props = CreateProps | EditProps;

export default function AddGroupDialog(props: Props) {
  const isEdit = props.mode === 'edit';

  // open 제어
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const controlledOpen = isEdit ? (props as EditProps).open : uncontrolledOpen;
  const setControlledOpen = (v: boolean) =>
    isEdit ? (props as EditProps).onOpenChange(v) : setUncontrolledOpen(v);

  // initial helper
  const getInit = <T,>(getter: (g: NewGroup) => T, fall: T): T => {
    if (isEdit) {
      const init = (props as EditProps).initial;
      return getter(init ?? ({} as NewGroup)) ?? fall;
    }
    return fall;
  };

  // form state
  const [name, setName] = React.useState<string>(
    getInit(g => g.name ?? '', '')
  );
  const [desc, setDesc] = React.useState<string>(
    getInit(g => g.description ?? '', '')
  );
  const [type, setType] = React.useState<GroupType>(
    getInit(g => (g.type as GroupType) ?? 'department', 'department')
  );
  const [leader, setLeader] = React.useState<string>(
    getInit(g => g.leader ?? '', '')
  );
  const [maxMembers, setMaxMembers] = React.useState<number>(
    Number(getInit(g => g.maxMembers ?? 0, 0))
  );
  const [createdAt, setCreatedAt] = React.useState<string>(() => {
    const fallback = new Date().toISOString().slice(0, 10);
    return getInit(g => g.createdAt ?? fallback, fallback);
  });

  // edit 모드 열릴 때 initial 동기화
  React.useEffect(() => {
    if (!isEdit) return;
    if (!(props as EditProps).open) return;
    const init = (props as EditProps).initial;
    setName(init?.name ?? '');
    setDesc(init?.description ?? '');
    setType((init?.type as GroupType) ?? 'department');
    setLeader(init?.leader ?? '');
    setMaxMembers(Number(init?.maxMembers ?? 0));
    setCreatedAt(
      init?.createdAt
        ? new Date(init.createdAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    );
  }, [isEdit, (props as EditProps).open]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Validation ---
  type Errors = Partial<{
    name: string;
    desc: string;
    type: string;
    leader: string;
    maxMembers: string;
  }>;
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitted, setSubmitted] = React.useState(false);

  const validate = React.useCallback(() => {
    const next: Errors = {};
    if (!name.trim()) next.name = '그룹명을 입력하세요.';
    if (!desc.trim()) next.desc = '설명을 입력하세요.';
    if (!type) next.type = '그룹 타입을 선택하세요.';
    if (!leader.trim()) next.leader = '리더명을 입력하세요.';
    if (!Number.isFinite(maxMembers) || Number(maxMembers) < 1)
      next.maxMembers = '최소 1명 이상이어야 합니다.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [name, desc, type, leader, maxMembers]);

  const isValid = React.useMemo(() => {
    return (
      name.trim() &&
      desc.trim() &&
      !!type &&
      leader.trim() &&
      Number.isFinite(maxMembers) &&
      Number(maxMembers) >= 1
    );
  }, [name, desc, type, leader, maxMembers]);

  React.useEffect(() => {
    if (submitted) validate();
  }, [name, desc, type, leader, maxMembers, submitted, validate]);

  // submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;

    if (isEdit) {
      (props as EditProps).onSubmit({
        name,
        description: desc,
        maxMembers,
        type,
        leader,
      });
      return;
    }

    (props as CreateProps).onAdd({
      name,
      description: desc,
      maxMembers,
      type,
      leader,
      createdAt,
    });
    setControlledOpen(false);
    setSubmitted(false);
    setErrors({});
  };

  // 공통 라벨(필수 별표)
  const Label = ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-sm font-medium text-gray-700"
    >
      {children}
      <span className="ml-1 text-rose-600">*</span>
    </label>
  );

  // 입력 공통 클래스 (에러시 빨간 테두리)
  const inputClass = (hasError?: boolean) =>
    cn(
      'w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500',
      hasError ? 'border-rose-400' : 'border-gray-300'
    );

  return (
    <Dialog.Root open={controlledOpen} onOpenChange={setControlledOpen}>
      {/* create 모드에서만 트리거 노출 */}
      {!isEdit && (
        <Dialog.Trigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            그룹 추가
          </Button>
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none'
          )}
          aria-describedby={undefined}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {isEdit ? '그룹 편집' : '그룹 추가'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="close"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <div>
              <Label>그룹명</Label>
              <input
                className={inputClass(!!errors.name)}
                placeholder="예: 개발팀"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            {/* 설명 */}
            <div>
              <Label>설명</Label>
              <textarea
                className={cn(inputClass(!!errors.desc), 'h-24 resize-none')}
                placeholder="그룹의 목적과 역할을 설명해주세요"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                required
                aria-invalid={!!errors.desc}
              />
              {errors.desc && (
                <p className="mt-1 text-xs text-rose-600">{errors.desc}</p>
              )}
            </div>

            {/* 타입 / 리더 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>그룹 타입</Label>
                <select
                  className={inputClass(!!errors.type)}
                  value={type}
                  onChange={e => setType(e.target.value as GroupType)}
                  required
                  aria-invalid={!!errors.type}
                >
                  <option value="admin">관리자</option>
                  <option value="department">부서</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-xs text-rose-600">{errors.type}</p>
                )}
              </div>
              <div>
                <Label>리더</Label>
                <input
                  className={inputClass(!!errors.leader)}
                  placeholder="예: 홍길동"
                  value={leader}
                  onChange={e => setLeader(e.target.value)}
                  required
                  aria-invalid={!!errors.leader}
                />
                {errors.leader && (
                  <p className="mt-1 text-xs text-rose-600">{errors.leader}</p>
                )}
              </div>
            </div>

            {/* 최대 멤버수 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>최대 멤버수</Label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className={inputClass(!!errors.maxMembers)}
                  value={Number.isNaN(maxMembers) ? 0 : maxMembers}
                  onChange={e => setMaxMembers(Number(e.target.value || 0))}
                  required
                  aria-invalid={!!errors.maxMembers}
                />
                {errors.maxMembers && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.maxMembers}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">취소</Button>
              </Dialog.Close>
              <Button type="submit" disabled={!isValid}>
                {isEdit ? '저장' : '추가'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
