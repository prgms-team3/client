import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
      size: {
        default: 'px-2 py-0.5 text-xs',
        sm: 'px-1.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Badge 컴포넌트
 *
 * 상태, 카테고리, 태그 등을 표시하는 작은 배지 컴포넌트입니다.
 * 다양한 스타일과 색상을 지원하며, 링크로도 사용할 수 있습니다.
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * <Badge variant="default">New</Badge>
 *
 * // 크기 조절
 * <Badge variant="secondary" size="lg">Featured</Badge>
 *
 * // 링크로 사용
 * <Badge variant="secondary" asChild>
 *   <a href="/category/featured">Featured</a>
 * </Badge>
 *
 * // 상태 표시
 * <Badge variant="destructive">Error</Badge>
 * <Badge variant="outline" size="sm">Draft</Badge>
 * ```
 *
 * @param variant - 배지 스타일
 *   - default: 기본 스타일
 *   - secondary: 보조 스타일
 *   - destructive: 오류/경고 스타일
 *   - outline: 아웃라인 스타일
 * @param size - 배지 크기
 *   - default: 기본 크기
 *   - sm: 작은 크기
 *   - lg: 큰 크기
 * @param asChild - Radix UI Slot 패턴 사용 여부
 *   - true: 링크 등으로 렌더링
 *   - false: 기본 span 요소로 렌더링
 * @param className - 추가 CSS 클래스
 * @param props - 기타 HTML span 속성들
 */
function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
