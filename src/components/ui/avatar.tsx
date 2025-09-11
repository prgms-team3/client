'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        default: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const avatarFallbackVariants = cva(
  'flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium leading-none',
  {
    variants: {
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
        '2xl': 'text-xl',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

/**
 * Avatar 컴포넌트
 *
 * 사용자 프로필 이미지나 이니셜을 표시하는 아바타 컴포넌트입니다.
 * 이미지가 없을 경우 이니셜이나 기본 아이콘을 표시합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * <Avatar>
 *   <AvatarImage src="/path/to/image.jpg" alt="사용자" />
 *   <AvatarFallback>KG</AvatarFallback>
 * </Avatar>
 *
 * // 크기 조절
 * <Avatar size="lg">
 *   <AvatarImage src="/path/to/image.jpg" alt="사용자" />
 *   <AvatarFallback size="lg">KG</AvatarFallback>
 * </Avatar>
 *
 * // 이니셜만 사용
 * <Avatar>
 *   <AvatarFallback>KG</AvatarFallback>
 * </Avatar>
 * ```
 *
 * @param size - 아바타 크기
 *   - sm: 작은 크기 (32px)
 *   - default: 기본 크기 (40px)
 *   - lg: 큰 크기 (48px)
 *   - xl: 초대형 크기 (64px)
 *   - 2xl: 2배 초대형 크기 (80px)
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Avatar.Root 속성들
 */
function Avatar({
  className,
  size,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size, className }))}
      {...props}
    />
  );
}

/**
 * AvatarImage 컴포넌트
 *
 * 아바타에 표시될 이미지입니다.
 *
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Avatar.Image 속성들
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  );
}

/**
 * AvatarFallback 컴포넌트
 *
 * 이미지가 로드되지 않았을 때 표시될 대체 콘텐츠입니다.
 * 주로 사용자 이니셜이나 기본 아이콘을 표시합니다.
 *
 * @param size - 아바타 크기에 따른 텍스트 크기
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Avatar.Fallback 속성들
 */
function AvatarFallback({
  className,
  size,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> &
  VariantProps<typeof avatarFallbackVariants>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(avatarFallbackVariants({ size, className }))}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  avatarVariants,
  avatarFallbackVariants,
};
export type { VariantProps };
