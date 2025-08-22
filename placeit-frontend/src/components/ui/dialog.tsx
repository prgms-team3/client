'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Dialog 컴포넌트
 *
 * 모달 창의 루트 컨테이너입니다.
 *
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger>열기</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>제목</DialogTitle>
 *       <DialogDescription>설명</DialogDescription>
 *     </DialogHeader>
 *     내용
 *     <DialogFooter>
 *       <Button>확인</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 *
 * @param props - Radix UI Dialog.Root 속성들
 */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/**
 * DialogTrigger 컴포넌트
 *
 * 모달을 열기 위한 트리거 요소입니다.
 *
 * @example
 * ```tsx
 * <DialogTrigger asChild>
 *   <Button>모달 열기</Button>
 * </DialogTrigger>
 * ```
 *
 * @param props - Radix UI Dialog.Trigger 속성들
 */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/**
 * DialogPortal 컴포넌트
 *
 * 모달 콘텐츠를 DOM의 다른 위치에 렌더링합니다.
 *
 * @param props - Radix UI Dialog.Portal 속성들
 */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/**
 * DialogClose 컴포넌트
 *
 * 모달을 닫기 위한 버튼입니다.
 *
 * @example
 * ```tsx
 * <DialogClose asChild>
 *   <Button variant="outline">취소</Button>
 * </DialogClose>
 * ```
 *
 * @param props - Radix UI Dialog.Close 속성들
 */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/**
 * DialogOverlay 컴포넌트
 *
 * 모달 뒤의 어두운 배경 오버레이입니다.
 *
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Dialog.Overlay 속성들
 */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className
      )}
      {...props}
    />
  );
}

/**
 * DialogContent 컴포넌트
 *
 * 모달의 주요 콘텐츠를 담는 컨테이너입니다.
 *
 * @example
 * ```tsx
 * <DialogContent>
 *   <DialogHeader>
 *     <DialogTitle>제목</DialogTitle>
 *   </DialogHeader>
 *   내용
 * </DialogContent>
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param children - 모달 내용
 * @param showCloseButton - 닫기 버튼 표시 여부
 *   - true: 닫기 버튼 표시 (기본값)
 *   - false: 닫기 버튼 숨김
 * @param props - Radix UI Dialog.Content 속성들
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg',
          // 애니메이션 없음 - 즉시 중앙에 나타남
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/**
 * DialogHeader 컴포넌트
 *
 * 모달의 헤더 영역을 담당합니다.
 * 제목과 설명을 포함할 수 있습니다.
 *
 * @example
 * ```tsx
 * <DialogHeader>
 *   <DialogTitle>제목</DialogTitle>
 *   <DialogDescription>설명</DialogDescription>
 * </DialogHeader>
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param props - 기타 HTML div 속성들
 */
function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

/**
 * DialogFooter 컴포넌트
 *
 * 모달의 푸터 영역을 담당합니다.
 * 버튼들을 배치할 수 있습니다.
 *
 * @example
 * ```tsx
 * <DialogFooter>
 *   <DialogClose asChild>
 *     <Button variant="outline">취소</Button>
 *   </DialogClose>
 *   <Button>확인</Button>
 * </DialogFooter>
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param props - 기타 HTML div 속성들
 */
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  );
}

/**
 * DialogTitle 컴포넌트
 *
 * 모달의 제목을 표시합니다.
 *
 * @example
 * ```tsx
 * <DialogTitle>회의실 예약</DialogTitle>
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Dialog.Title 속성들
 */
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

/**
 * DialogDescription 컴포넌트
 *
 * 모달의 설명을 표시합니다.
 *
 * @example
 * ```tsx
 * <DialogDescription>
 *   회의실 예약을 위한 정보를 입력해주세요.
 * </DialogDescription>
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param props - Radix UI Dialog.Description 속성들
 */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
