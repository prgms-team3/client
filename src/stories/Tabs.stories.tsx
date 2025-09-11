import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: 'text',
      description: '기본 선택될 탭 값',
    },
    value: {
      control: 'text',
      description: '현재 선택된 탭 값 (제어 컴포넌트)',
    },
    onValueChange: {
      action: 'valueChanged',
      description: '탭 값 변경 시 호출되는 콜백',
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
 * 기본 탭
 */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">계정</TabsTrigger>
        <TabsTrigger value="password">비밀번호</TabsTrigger>
        <TabsTrigger value="settings">설정</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>계정</CardTitle>
            <CardDescription>
              계정 정보를 변경하거나 업데이트하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>계정 설정 내용이 여기에 표시됩니다.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>비밀번호</CardTitle>
            <CardDescription>비밀번호를 변경하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>비밀번호 변경 내용이 여기에 표시됩니다.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>설정</CardTitle>
            <CardDescription>계정 설정을 관리하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>설정 내용이 여기에 표시됩니다.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * 다양한 variant 스타일
 */
export const Variants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">기본 스타일</h3>
        <Tabs defaultValue="tab1" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1">탭 1</TabsTrigger>
            <TabsTrigger value="tab2">탭 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">탭 1 내용</TabsContent>
          <TabsContent value="tab2">탭 2 내용</TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">아웃라인 스타일</h3>
        <Tabs defaultValue="tab1" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1" variant="outline">
              탭 1
            </TabsTrigger>
            <TabsTrigger value="tab2" variant="outline">
              탭 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">탭 1 내용</TabsContent>
          <TabsContent value="tab2">탭 2 내용</TabsContent>
        </Tabs>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">알약 모양 스타일</h3>
        <Tabs defaultValue="tab1" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1" variant="pill">
              탭 1
            </TabsTrigger>
            <TabsTrigger value="tab2" variant="pill">
              탭 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">탭 1 내용</TabsContent>
          <TabsContent value="tab2">탭 2 내용</TabsContent>
        </Tabs>
      </div>
    </div>
  ),
};

/**
 * 예약 관리 탭
 */
export const ReservationManagement: Story = {
  render: () => (
    <Tabs defaultValue="today" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="today">오늘</TabsTrigger>
        <TabsTrigger value="week">주간</TabsTrigger>
        <TabsTrigger value="month">월간</TabsTrigger>
      </TabsList>
      <TabsContent value="today">
        <Card>
          <CardHeader>
            <CardTitle>오늘의 예약</CardTitle>
            <CardDescription>2025년 8월 18일 예약 현황</CardDescription>
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
      </TabsContent>
      <TabsContent value="week">
        <Card>
          <CardHeader>
            <CardTitle>주간 예약</CardTitle>
            <CardDescription>이번 주 예약 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <p>주간 예약 내용이 여기에 표시됩니다.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="month">
        <Card>
          <CardHeader>
            <CardTitle>월간 예약</CardTitle>
            <CardDescription>이번 달 예약 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <p>월간 예약 내용이 여기에 표시됩니다.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * 회의실 관리 탭
 */
export const MeetingRoomManagement: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="overview">개요</TabsTrigger>
        <TabsTrigger value="rooms">회의실</TabsTrigger>
        <TabsTrigger value="settings">설정</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>회의실 개요</CardTitle>
            <CardDescription>전체 회의실 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">전체 회의실</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">7</p>
                <p className="text-sm text-muted-foreground">사용 가능</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">1</p>
                <p className="text-sm text-muted-foreground">점검 중</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold text-blue-600">51%</p>
                <p className="text-sm text-muted-foreground">평균 이용률</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="rooms">
        <Card>
          <CardHeader>
            <CardTitle>회의실 목록</CardTitle>
            <CardDescription>등록된 회의실 관리</CardDescription>
          </CardHeader>
          <CardContent>
            <p>회의실 목록이 여기에 표시됩니다.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>회의실 설정</CardTitle>
            <CardDescription>회의실 관련 설정</CardDescription>
          </CardHeader>
          <CardContent>
            <p>회의실 설정이 여기에 표시됩니다.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};
