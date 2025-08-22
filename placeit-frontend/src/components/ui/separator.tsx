'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const separatorVariants = cva('shrink-0 bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
    size: {
      sm: '',
      default: '',
      lg: 'h-0.5',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'default',
  },
});

/**
 * Separator 컴포넌트
 *
 * 콘텐츠를 구분하는 선을 표시하는 컴포넌트입니다.
 * 수평 또는 수직 방향으로 사용할 수 있습니다.
 *
 * @example
 * ```tsx
 * // 기본 수평 구분선
 * <Separator />
 *
 * // 수직 구분선
 * <Separator orientation="vertical" />
 *
 * // 큰 구분선
 * <Separator size="lg" />
 *
 * // 커스텀 스타일
 * <Separator className="my-4 bg-blue-200" />
 * ```
 *
 * @param orientation - 구분선 방향
 *   - horizontal: 수평 구분선 (기본값)
 *   - vertical: 수직 구분선
 * @param size - 구분선 크기
 *   - sm: 작은 크기
 *   - default: 기본 크기
 *   - lg: 큰 크기
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Separator.Root 속성들
 */
function Separator({
  className,
  orientation,
  size,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> &
  VariantProps<typeof separatorVariants>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      orientation={orientation}
      className={cn(separatorVariants({ orientation, size, className }))}
      {...props}
    />
  );
}

export { Separator, separatorVariants };
export type { VariantProps };
