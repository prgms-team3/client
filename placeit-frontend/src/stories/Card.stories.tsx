import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost', 'elevated', 'interactive'],
      description: '카드 스타일',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'default', 'lg'],
      description: '카드 패딩',
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
 * 기본 카드
 */
export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>카드 제목</CardTitle>
        <CardDescription>카드 설명</CardDescription>
      </CardHeader>
      <CardContent>
        <p>카드 내용이 여기에 들어갑니다.</p>
      </CardContent>
      <CardFooter>
        <Button>저장</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * 다양한 variant 스타일
 */
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <Card variant="default">
        <CardHeader>
          <CardTitle>기본 스타일</CardTitle>
          <CardDescription>기본 카드 스타일입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>기본 배경과 테두리를 가진 카드입니다.</p>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>아웃라인 스타일</CardTitle>
          <CardDescription>아웃라인 카드 스타일입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>투명 배경에 두꺼운 테두리를 가진 카드입니다.</p>
        </CardContent>
      </Card>

      <Card variant="ghost">
        <CardHeader>
          <CardTitle>투명 스타일</CardTitle>
          <CardDescription>투명 카드 스타일입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>배경과 그림자가 없는 투명한 카드입니다.</p>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>강화된 그림자</CardTitle>
          <CardDescription>강화된 그림자 스타일입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>더 강한 그림자를 가진 카드입니다.</p>
        </CardContent>
      </Card>

      <Card variant="interactive" className="col-span-full">
        <CardHeader>
          <CardTitle>상호작용 가능한 카드</CardTitle>
          <CardDescription>호버 시 효과가 있는 카드입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>마우스를 올리면 그림자와 크기가 변합니다.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

/**
 * 다양한 패딩 크기
 */
export const PaddingSizes: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      <Card padding="none">
        <CardHeader>
          <CardTitle>패딩 없음</CardTitle>
          <CardDescription>패딩이 없는 카드입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>내용이 테두리에 바로 붙어있습니다.</p>
        </CardContent>
      </Card>

      <Card padding="sm">
        <CardHeader>
          <CardTitle>작은 패딩</CardTitle>
          <CardDescription>작은 패딩을 가진 카드입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>16px 패딩을 가진 카드입니다.</p>
        </CardContent>
      </Card>

      <Card padding="default">
        <CardHeader>
          <CardTitle>기본 패딩</CardTitle>
          <CardDescription>기본 패딩을 가진 카드입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>24px 세로 패딩을 가진 카드입니다.</p>
        </CardContent>
      </Card>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>큰 패딩</CardTitle>
          <CardDescription>큰 패딩을 가진 카드입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>32px 패딩을 가진 카드입니다.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

/**
 * 액션이 있는 카드
 */
export const WithAction: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>프로젝트 제목</CardTitle>
        <CardDescription>프로젝트에 대한 간단한 설명</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            편집
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>프로젝트의 주요 내용이 여기에 표시됩니다.</p>
      </CardContent>
      <CardFooter>
        <Button>저장</Button>
        <Button variant="outline">취소</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * 통계 카드
 */
export const StatCard: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
      <Card variant="outline" padding="sm">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">2</p>
            <p className="text-sm text-muted-foreground">오늘 예약</p>
          </div>
        </CardContent>
      </Card>

      <Card variant="outline" padding="sm">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">3</p>
            <p className="text-sm text-muted-foreground">확정된 예약</p>
          </div>
        </CardContent>
      </Card>

      <Card variant="outline" padding="sm">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">3</p>
            <p className="text-sm text-muted-foreground">사용 가능</p>
          </div>
        </CardContent>
      </Card>

      <Card variant="outline" padding="sm">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">9%</p>
            <p className="text-sm text-muted-foreground">이용률</p>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

/**
 * 이미지가 있는 카드
 */
export const WithImage: Story = {
  render: () => (
    <Card variant="interactive" className="w-80">
      <div className="aspect-video bg-muted rounded-t-xl"></div>
      <CardHeader>
        <CardTitle>회의실1</CardTitle>
        <CardDescription>소규모 팀 회의에 적합</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">수용인원:</span>
          <Badge variant="secondary">8명</Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" size="sm">
            프로젝터
          </Badge>
          <Badge variant="outline" size="sm">
            화이트보드
          </Badge>
          <Badge variant="outline" size="sm">
            WiFi
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">예약하기</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * 간단한 카드
 */
export const Simple: Story = {
  render: () => (
    <Card variant="ghost" padding="sm">
      <CardContent>
        <p>간단한 내용만 포함된 카드입니다.</p>
      </CardContent>
    </Card>
  ),
};

/**
 * 테이블 카드
 */
export const TableCard: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>예약 현황</CardTitle>
        <CardDescription>최근 예약 목록</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">주간 팀 미팅</p>
              <p className="text-sm text-muted-foreground">김태현</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">10:00 - 10:30</p>
              <p className="text-sm text-muted-foreground">회의실1</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">프로젝트 리뷰</p>
              <p className="text-sm text-muted-foreground">이개발자</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">14:00 - 15:00</p>
              <p className="text-sm text-muted-foreground">대회의실</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};
