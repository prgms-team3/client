'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const tabsVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        outline:
          'border border-input bg-transparent data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        pill: 'rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Tabs 컴포넌트
 *
 * 탭 인터페이스를 제공하는 컴포넌트입니다.
 * 여러 콘텐츠를 탭으로 구분하여 표시할 수 있습니다.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="account" className="w-[400px]">
 *   <TabsList>
 *     <TabsTrigger value="account">계정</TabsTrigger>
 *     <TabsTrigger value="password">비밀번호</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">
 *     계정 설정 내용
 *   </TabsContent>
 *   <TabsContent value="password">
 *     비밀번호 변경 내용
 *   </TabsContent>
 * </Tabs>
 * ```
 *
 * @param defaultValue - 기본 선택될 탭 값
 * @param value - 현재 선택된 탭 값 (제어 컴포넌트)
 * @param onValueChange - 탭 값 변경 시 호출되는 콜백
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Tabs.Root 속성들
 */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('w-full', className)}
      {...props}
    />
  );
}

/**
 * TabsList 컴포넌트
 *
 * 탭 버튼들을 담는 컨테이너입니다.
 *
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Tabs.List 속성들
 */
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * TabsTrigger 컴포넌트
 *
 * 개별 탭 버튼입니다.
 *
 * @param variant - 탭 스타일
 *   - default: 기본 스타일
 *   - outline: 아웃라인 스타일
 *   - pill: 알약 모양 스타일
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Tabs.Trigger 속성들
 */
function TabsTrigger({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsVariants>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsVariants({ variant, className }))}
      {...props}
    />
  );
}

/**
 * TabsContent 컴포넌트
 *
 * 탭에 해당하는 콘텐츠를 표시합니다.
 *
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Tabs.Content 속성들
 */
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsVariants };
export type { VariantProps };
