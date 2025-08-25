import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl', '2xl'],
      description: '아바타 크기',
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
 * 기본 아바타
 */
export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback size="default">KG</AvatarFallback>
    </Avatar>
  ),
};

/**
 * 다양한 크기
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Avatar size="sm">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback size="sm">KG</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback size="default">KG</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback size="lg">KG</AvatarFallback>
      </Avatar>
      <Avatar size="xl">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback size="xl">KG</AvatarFallback>
      </Avatar>
      <Avatar size="2xl">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback size="2xl">KG</AvatarFallback>
      </Avatar>
    </div>
  ),
};

/**
 * 이니셜만 사용
 */
export const Initials: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarFallback size="default">KG</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback size="default">LD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback size="default">PD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback size="default">CG</AvatarFallback>
      </Avatar>
    </div>
  ),
};

/**
 * 이미지 로드 실패 시
 */
export const ImageFallback: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarImage src="/broken-image.jpg" alt="Broken" />
        <AvatarFallback size="default">KG</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/another-broken.jpg" alt="Broken" />
        <AvatarFallback size="default">LD</AvatarFallback>
      </Avatar>
    </div>
  ),
};

/**
 * 팀 멤버 아바타
 */
export const TeamMembers: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="홍길동" />
          <AvatarFallback size="default">KG</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">홍길동</p>
          <p className="text-sm text-muted-foreground">admin@company.com</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="이개발자" />
          <AvatarFallback size="default">LD</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">이개발자</p>
          <p className="text-sm text-muted-foreground">dev@company.com</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="박디자이너" />
          <AvatarFallback size="default">PD</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">박디자이너</p>
          <p className="text-sm text-muted-foreground">design@company.com</p>
        </div>
      </div>
    </div>
  ),
};

/**
 * 아바타 그룹
 */
export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar className="border-2 border-background">
        <AvatarImage src="https://github.com/shadcn.png" alt="홍길동" />
        <AvatarFallback size="default">KG</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarImage src="https://github.com/shadcn.png" alt="이개발자" />
        <AvatarFallback size="default">LD</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarImage src="https://github.com/shadcn.png" alt="박디자이너" />
        <AvatarFallback size="default">PD</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarImage src="https://github.com/shadcn.png" alt="최기획자" />
        <AvatarFallback size="default">CG</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-background">
        <AvatarFallback size="default">+3</AvatarFallback>
      </Avatar>
    </div>
  ),
};
