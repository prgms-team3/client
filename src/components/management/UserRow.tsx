'use client';

import * as React from 'react';
import { Pencil, UserCog, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type UserRole = 'admin' | 'manager' | 'member';
export type UserStatus = 'active' | 'suspended';

export type UserRowData = {
  id: string;
  name: string;
  email: string;
  department?: string; // 부서
  title?: string; // 직급
  role: UserRole;
  status: UserStatus;
  reservationsCount?: number;
  lastLoginAt?: string; // ISO string
  avatarUrl?: string;
};

type Props = {
  user: UserRowData;
  onEdit?: (id: string) => void;
  onChangeRole?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function UserRow({ user, onEdit, onChangeRole, onDelete }: Props) {
  // 역할 배지 색상
  const roleBadgeClass = {
    admin: 'bg-rose-100 text-rose-700',
    manager: 'bg-blue-100 text-blue-700',
    member: 'bg-green-100 text-green-700',
  }[user.role];

  // 상태 색상 (예: 글자색으로 표시 가능)
  const statusText =
    user.status === 'active' ? 'text-gray-700' : 'text-gray-400 line-through';

  return (
    <tr className="border-b last:border-0">
      {/* 사용자 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : (
              <AvatarFallback size="lg">{user.name.slice(0, 1)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className={cn('font-medium', statusText)}>{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>

      {/* 부서/직급 */}
      <td className="px-4 py-3">
        <div className="font-medium">{user.department ?? '-'}</div>
        <div className="text-sm text-gray-500">{user.title ?? ''}</div>
      </td>

      {/* 역할 */}
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
            roleBadgeClass
          )}
        >
          {user.role === 'admin'
            ? '관리자'
            : user.role === 'manager'
            ? '매니저'
            : '사용자'}
        </span>
      </td>

      {/* 예약 건수 */}
      <td className="px-4 py-3 text-center font-medium">
        {user.reservationsCount ? `${user.reservationsCount}건` : '-'}
      </td>

      {/* 마지막 로그인 */}
      <td className="px-4 py-3 text-sm text-gray-600">
        {user.lastLoginAt
          ? new Date(user.lastLoginAt).toLocaleString('ko-KR', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-'}
      </td>

      {/* 액션 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(user.id)}
            className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onChangeRole?.(user.id)}
            className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <UserCog className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete?.(user.id)}
            className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
