import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: '배지 스타일',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: '배지 크기',
    },
    asChild: {
      control: 'boolean',
      description: 'Radix UI Slot 패턴 사용 여부',
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 배지
 */
export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

/**
 * 다양한 스타일의 배지
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

/**
 * 다양한 크기의 배지
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

/**
 * 아이콘이 있는 배지
 */
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        성공
      </Badge>
      <Badge variant="destructive">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        오류
      </Badge>
      <Badge variant="secondary">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        정보
      </Badge>
    </div>
  ),
};

/**
 * 상태 표시 배지
 */
export const StatusBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Badge variant="default">활성</Badge>
        <Badge variant="secondary">대기</Badge>
        <Badge variant="destructive">비활성</Badge>
        <Badge variant="outline">보류</Badge>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="default" size="sm">
          온라인
        </Badge>
        <Badge variant="secondary" size="sm">
          오프라인
        </Badge>
        <Badge variant="destructive" size="sm">
          오류
        </Badge>
      </div>
    </div>
  ),
};

/**
 * 카테고리 배지
 */
export const CategoryBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">기술</Badge>
        <Badge variant="secondary">디자인</Badge>
        <Badge variant="secondary">마케팅</Badge>
        <Badge variant="secondary">영업</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">React</Badge>
        <Badge variant="outline">TypeScript</Badge>
        <Badge variant="outline">Tailwind CSS</Badge>
        <Badge variant="outline">Next.js</Badge>
      </div>
    </div>
  ),
};

/**
 * 링크로 사용되는 배지
 */
export const LinkBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default" asChild>
        <a href="#" className="hover:opacity-80 transition-opacity">
          링크 배지
        </a>
      </Badge>
      <Badge variant="secondary" asChild>
        <a href="#" className="hover:opacity-80 transition-opacity">
          카테고리
        </a>
      </Badge>
      <Badge variant="outline" asChild>
        <a href="#" className="hover:opacity-80 transition-opacity">
          태그
        </a>
      </Badge>
    </div>
  ),
};

/**
 * 숫자가 있는 배지
 */
export const NumberBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">5</Badge>
      <Badge variant="secondary">12</Badge>
      <Badge variant="destructive">99+</Badge>
      <Badge variant="outline">1</Badge>
    </div>
  ),
};

/**
 * 회의실 개수 표시 배지
 */
export const RoomCount: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default" size="lg">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        회의실 8개
      </Badge>
      <Badge variant="secondary" size="lg">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        예약 가능 5개
      </Badge>
      <Badge variant="outline" size="lg">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        사용 중 3개
      </Badge>
    </div>
  ),
};

/**
 * 사용자 정의 스타일 배지
 */
export const CustomBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
        그라데이션
      </Badge>
      <Badge className="bg-yellow-400 text-yellow-900 border-0">경고</Badge>
      <Badge className="bg-green-400 text-green-900 border-0">완료</Badge>
      <Badge className="bg-pink-400 text-pink-900 border-0">핫</Badge>
    </div>
  ),
};
