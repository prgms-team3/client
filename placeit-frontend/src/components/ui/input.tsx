import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Input 컴포넌트
 *
 * 사용자 입력을 받는 기본적인 입력 필드 컴포넌트입니다.
 * 다양한 타입의 입력을 지원하며, 접근성과 스타일링이 포함되어 있습니다.
 *
 * @example
 * ```tsx
 * // 기본 텍스트 입력
 * <Input placeholder="이름을 입력하세요" />
 *
 * // 이메일 입력
 * <Input type="email" placeholder="이메일을 입력하세요" />
 *
 * // 비밀번호 입력
 * <Input type="password" placeholder="비밀번호를 입력하세요" />
 *
 * // 파일 업로드
 * <Input type="file" accept="image/*" />
 * ```
 *
 * @param className - 추가 CSS 클래스
 * @param type - 입력 타입
 *   - text: 일반 텍스트
 *   - email: 이메일 주소
 *   - password: 비밀번호
 *   - number: 숫자
 *   - tel: 전화번호
 *   - url: 웹 주소
 *   - search: 검색
 *   - file: 파일 업로드
 *   - date: 날짜
 *   - time: 시간
 *   - datetime-local: 날짜 및 시간
 * @param props - 기타 HTML input 속성들
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
}

export { Input };
