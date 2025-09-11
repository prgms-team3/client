'use client';

import * as React from 'react';
import { Crown, Edit3, Trash2, Users, Building2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type GroupType = 'exec' | 'admin' | 'department';

export type GroupCardData = {
  id: string;
  name: string;
  type: GroupType;
  description?: string;
  leader?: string;
  membersCount: number;
  maxMembers: number;
  createdAt: string; // ISO
};

type Props = {
  data: GroupCardData;
  className?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onManageMembers?: (id: string) => void;
};

const TYPE_META = {
  exec: {
    label: '임원진',
    Icon: Crown,
    iconBg: 'bg-violet-100',
    iconFg: 'text-violet-600',
    badge: 'bg-violet-100 text-violet-700 hover:bg-violet-100',
  },
  department: {
    label: '부서',
    Icon: Building2,
    iconBg: 'bg-blue-100',
    iconFg: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  admin: {
    label: '관리자',
    Icon: Shield,
    iconBg: 'bg-rose-100',
    iconFg: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
  },
} as const;

export default function GroupCard({
  data,
  className,
  onEdit,
  onDelete,
  onManageMembers,
}: Props) {
  const {
    id,
    name,
    type,
    description,
    leader,
    membersCount,
    maxMembers,
    createdAt,
  } = data;
  const meta = TYPE_META[type];

  const percent =
    maxMembers > 0
      ? Math.min(100, Math.round((membersCount / maxMembers) * 100))
      : 0;
  const d = new Date(createdAt);
  const dateStr = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(
    2,
    '0'
  )}-${`${d.getDate()}`.padStart(2, '0')}`;

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      {/* 헤더 */}
      <div className="mb-1.5 flex items-start justify-between">
        <div className="flex items-start gap-2">
          <div
            className={cn(
              'mt-[2px] flex h-7 w-7 items-center justify-center rounded-full',
              meta.iconBg
            )}
          >
            <meta.Icon className={cn('h-4 w-4', meta.iconFg)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-gray-900">
                {name}
              </h3>
              <Badge className={meta.badge}>{meta.label}</Badge>
            </div>
            {description && (
              <p className="mt-1 text-[13px] leading-snug text-gray-600">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onEdit?.(id)}
            title="편집"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-600 hover:text-red-700"
            onClick={() => onDelete?.(id)}
            title="삭제"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
        <span className="text-gray-500">리더:</span>
        <span className="text-gray-800">{leader || '-'}</span>

        <span className="text-gray-500">멤버:</span>
        <span className="text-gray-800">
          {membersCount}/{maxMembers}
        </span>

        <span className="text-gray-500">생성일:</span>
        <span className="text-gray-800">{dateStr}</span>
      </div>

      {/* 진행도 */}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[12px] text-gray-500">
          <span>멤버 현황</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="mt-3">
        <Button
          variant="secondary"
          className="w-full justify-center gap-2"
          onClick={() => onManageMembers?.(id)}
        >
          <Users className="h-4 w-4" />
          멤버 관리
        </Button>
      </div>
    </div>
  );
}
