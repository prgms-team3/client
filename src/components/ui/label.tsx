'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const labelVariants = cva(
  'flex items-center gap-2 leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600',
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      weight: 'medium',
    },
  }
);

/**
 * Label 컴포넌트
 *
 * 폼 요소나 UI 컴포넌트에 대한 설명을 제공하는 라벨 컴포넌트입니다.
 * 접근성을 고려하여 설계되었으며, 다양한 스타일링 옵션을 지원합니다.
 *
 * @example
 * ```tsx
 * // 기본 라벨
 * <Label htmlFor="username">사용자명</Label>
 * <Input id="username" />
 *
 * // 필수 입력 표시
 * <Label htmlFor="email" variant="destructive" size="lg">
 *   이메일 <span className="text-red-500">*</span>
 * </Label>
 * <Input id="email" required />
 *
 * // 아이콘이 있는 라벨
 * <Label htmlFor="search" className="flex items-center gap-2">
 *   <SearchIcon className="w-4 h-4" />
 *   검색
 * </Label>
 *
 * // 섹션 헤더로 사용
 * <Label size="xl" weight="bold" className="text-gray-900">
 *   개인 정보
 * </Label>
 * ```
 *
 * @param variant - 라벨 스타일 (default, muted, destructive, success, warning, info)
 * @param size - 라벨 크기 (sm, default, lg, xl)
 * @param weight - 폰트 굵기 (normal, medium, semibold, bold)
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Label.Root 속성들
 */
function Label({
  className,
  variant,
  size,
  weight,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(labelVariants({ variant, size, weight, className }))}
      {...props}
    />
  );
}

export { Label, labelVariants };
export type { VariantProps };
