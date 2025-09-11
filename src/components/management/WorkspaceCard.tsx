'use client';

import * as React from 'react';
import { Edit3, Trash2, Copy, UserCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export type WorkspaceStatus = 'active' | 'inactive';

export type WorkspaceCardProps = {
  id: string;
  name: string;
  description?: string;
  owner: string;
  members: number;
  inviteCode: string;
  status: WorkspaceStatus;
  imageUrl?: string;
  canManage?: boolean;

  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCopyInvite?: (inviteCode: string) => void;
  onToggleStatus?: (id: string, next: WorkspaceStatus) => void;
};

export default function WorkspaceCard({
  id,
  name,
  description,
  owner,
  members,
  inviteCode,
  status,
  imageUrl,
  canManage = true,
  onEdit,
  onDelete,
  onCopyInvite,
  onToggleStatus,
}: WorkspaceCardProps) {
  const [copied, setCopied] = React.useState(false);
  const isActive = status === 'active';

  const DEFAULT_IMG = '/images/meeting-room-2.jpg';

  const handleCopy = async () => {
    try {
      if (onCopyInvite) onCopyInvite(inviteCode);
      else await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  const handleToggle = () => {
    const next: WorkspaceStatus = isActive ? 'inactive' : 'active';
    onToggleStatus?.(id, next);
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[16/9]">
        <Image
          src={imageUrl ?? DEFAULT_IMG}
          alt={`${name} cover`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
        />
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow ${
            isActive ? 'bg-emerald-600' : 'bg-gray-400'
          }`}
        >
          {isActive ? '활성' : '비활성'}
        </span>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-lg font-semibold text-gray-900">
            {name}
          </h3>
          {/* canManage일 때만 렌더 */}
          {canManage && (
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-gray-300"
                onClick={() => onEdit?.(id)}
                aria-label="워크스페이스 수정"
                title="워크스페이스 수정"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-gray-300 text-rose-600 hover:text-rose-700"
                onClick={() => onDelete?.(id)}
                aria-label="워크스페이스 삭제"
                title="워크스페이스 삭제"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* 설명 */}
        {description && (
          <p className="mb-2 line-clamp-2 text-sm text-gray-600">
            {description}
          </p>
        )}

        {/* 소유자 */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <UserCircle2 className="h-4 w-4 text-gray-500" />
          <span className="truncate">소유자: {owner}</span>
        </div>

        {/* 멤버수 */}
        <div className="mt-1 mb-3 flex items-center gap-1.5 text-gray-700 text-sm">
          <Users className="h-4 w-4" />
          <span> 멤버 {members.toLocaleString()}명</span>
        </div>

        {/* 초대 코드 */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-2">
          <div className="mb-1 text-xs text-gray-500">초대 코드</div>
          <div className="flex items-center justify-between gap-2">
            <code className="select-all text-sm tracking-wide text-gray-800">
              {inviteCode}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 border-gray-300"
              onClick={handleCopy}
              aria-label="초대 코드 복사"
            >
              <Copy className="h-4 w-4" />
              {copied ? '복사됨' : '복사'}
            </Button>
          </div>
        </div>

        {canManage && (
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleToggle}
              className={
                isActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
            >
              {isActive ? '비활성화' : '활성화'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
