import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva(
  'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        outline: 'border-2 border-border bg-transparent',
        ghost: 'border-none bg-transparent shadow-none',
        elevated: 'shadow-lg border-none',
        interactive:
          'cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'py-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

/**
 * Card 컴포넌트
 *
 * 콘텐츠를 담는 컨테이너 컴포넌트입니다.
 * 헤더, 콘텐츠, 푸터 등으로 구성할 수 있습니다.
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>카드 제목</CardTitle>
 *     <CardDescription>카드 설명</CardDescription>
 *   </CardHeader>
 *   <CardContent>카드 내용</CardContent>
 *   <CardFooter>카드 푸터</CardFooter>
 * </Card>
 * ```
 *
 * @param variant - 카드 스타일
 *   - default: 기본 스타일
 *   - outline: 아웃라인 스타일
 *   - ghost: 투명 배경 스타일
 *   - elevated: 그림자 강화 스타일
 *   - interactive: 상호작용 가능한 스타일
 * @param padding - 카드 패딩
 *   - none: 패딩 없음
 *   - sm: 작은 패딩
 *   - default: 기본 패딩
 *   - lg: 큰 패딩
 * @param className - 추가 CSS 클래스
 * @param props - 기타 HTML div 속성들
 */
function Card({
  className,
  variant,
  padding,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  );
}

/**
 * CardHeader 컴포넌트
 *
 * 카드의 헤더 영역을 담당합니다.
 * 제목, 설명, 액션 버튼 등을 포함할 수 있습니다.
 *
 * @example
 * ```tsx
 * <CardHeader>
 *   <CardTitle>제목</CardTitle>
 *   <CardDescription>설명</CardDescription>
 *   <CardAction>
 *     <Button>액션</Button>
 *   </CardAction>
 * </CardHeader>
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param props - 기타 HTML div 속성들
 */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      {...props}
    />
  );
}

/**
 * CardTitle 컴포넌트
 *
 * 카드의 제목을 표시합니다.
 *
 * @example
 * ```tsx
 * <CardTitle>회의실 예약</CardTitle>
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param props - 기타 HTML div 속성들
 */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

/**
 * CardDescription 컴포넌트
 *
 * 카드의 설명을 표시합니다.
 *
 * @example
 * ```tsx
 * <CardDescription>회의실 예약 현황을 확인하세요</CardDescription>
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param props - 기타 HTML div 속성들
 */
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

/**
 * CardAction 컴포넌트
 *
 * 카드 헤더에 액션 버튼을 배치합니다.
 *
 * @example
 * ```tsx
 * <CardAction>
 *   <Button variant="outline">편집</Button>
 * </CardAction>
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param props - 기타 HTML div 속성들
 */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  );
}

/**
 * CardContent 컴포넌트
 *
 * 카드의 주요 콘텐츠를 담습니다.
 *
 * @example
 * ```tsx
 * <CardContent>
 *   <p>카드의 주요 내용이 여기에 들어갑니다.</p>
 * </CardContent>
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param props - 기타 HTML div 속성들
 */
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  );
}

/**
 * CardFooter 컴포넌트
 *
 * 카드의 푸터 영역을 담당합니다.
 * 버튼이나 추가 정보를 배치할 수 있습니다.
 *
 * @example
 * ```tsx
 * <CardFooter>
 *   <Button>저장</Button>
 *   <Button variant="outline">취소</Button>
 * </CardFooter>
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param props - 기타 HTML div 속성들
 */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
};
export type { VariantProps };
