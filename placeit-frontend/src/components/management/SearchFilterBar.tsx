'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FilterItem<Key extends string = string> = {
  key: Key;
  label: string;
};

type Props<Key extends string = string> = {
  /** 인풋 플레이스홀더 (미지정 시 기본값) */
  placeholder?: string;
  /** 외부 제어 검색어 */
  query: string;
  /** 검색어 변경 콜백 */
  onQueryChange: (q: string) => void;

  /** 외부 필터 목록 */
  filters: FilterItem<Key>[];
  /** 현재 선택된 필터 키 */
  activeKey: Key;
  /** 필터 변경 콜백 */
  onChange: (key: Key) => void;

  /** 래퍼 클래스 */
  className?: string;
};

export default function SearchFilterBar<Key extends string = string>({
  placeholder = '검색어를 입력하세요…',
  query,
  onQueryChange,
  filters,
  activeKey,
  onChange,
  className,
}: Props<Key>) {
  return (
    <div
      role="search"
      className={cn(
        'w-full rounded-lg border border-gray-200 bg-white shadow-sm',
        'flex items-center justify-between gap-3 p-5 pl-3',
        className
      )}
    >
      {/* 좌: 검색 */}
      <div className="flex items-center gap-2 flex-1 min-w-0 rounded-lg border border-gray-200 ml-2 py-2">
        <Search className="h-4 w-4 text-gray-600 ml-3" aria-hidden />
        <input
          aria-label="검색"
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
        />
      </div>

      {/* 우: 필터 버튼들 (세그먼트 스타일) */}
      <div className="inline-flex items-center rounded-lg bg-gray-100 p-1">
        {filters.map(f => {
          const active = f.key === activeKey;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onChange(f.key)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                active
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              aria-pressed={active}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
