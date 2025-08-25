import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: '모달 열림 상태',
    },
    onOpenChange: {
      action: 'open changed',
      description: '열림 상태 변경 핸들러',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 모달
 */
export const Default: Story = {
  render: args => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>모달 열기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>기본 모달</DialogTitle>
          <DialogDescription>
            이것은 기본적인 모달 예시입니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>모달의 주요 내용이 여기에 들어갑니다.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * 회의실 예약 모달
 */
export const MeetingRoomReservation: Story = {
  render: args => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">회의실 예약</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>회의실 예약</DialogTitle>
          <DialogDescription>
            회의실 예약을 위한 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room" className="text-right">
              회의실
            </Label>
            <select
              id="room"
              className="col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">선택하세요</option>
              <option value="room-a">회의실 A</option>
              <option value="room-b">회의실 B</option>
              <option value="room-c">회의실 C</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              날짜
            </Label>
            <Input id="date" type="date" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              시간
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input id="start-time" type="time" className="flex-1" />
              <span className="flex items-center">~</span>
              <Input id="end-time" type="time" className="flex-1" />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="purpose" className="text-right">
              목적
            </Label>
            <Input
              id="purpose"
              placeholder="회의 목적을 입력하세요"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button>예약하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * 확인 모달
 */
export const ConfirmationDialog: Story = {
  render: args => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="destructive">삭제하기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
          <DialogDescription>
            이 작업은 되돌릴 수 없습니다. 선택한 항목이 영구적으로 삭제됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button variant="destructive">삭제</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * 정보 표시 모달
 */
export const InformationDialog: Story = {
  render: args => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">정보 보기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>시스템 정보</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">버전</span>
            <span className="text-sm font-medium">1.2.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">빌드 날짜</span>
            <span className="text-sm font-medium">2024-01-15</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Node.js</span>
            <span className="text-sm font-medium">18.17.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">React</span>
            <span className="text-sm font-medium">18.2.0</span>
          </div>
        </div>
        <DialogFooter>
          <Button>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * 폼 모달
 */
export const FormDialog: Story = {
  render: args => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>새 프로젝트</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 프로젝트 생성</DialogTitle>
          <DialogDescription>
            새로운 프로젝트를 생성하기 위한 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">프로젝트 이름</Label>
            <Input id="project-name" placeholder="프로젝트 이름을 입력하세요" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <textarea
              id="description"
              placeholder="프로젝트에 대한 설명을 입력하세요"
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">시작일</Label>
              <Input id="start-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">종료일</Label>
              <Input id="end-date" type="date" />
            </div>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button>생성하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * 닫기 버튼이 없는 모달
 */
export const NoCloseButton: Story = {
  render: args => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">닫기 버튼 없음</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>중요한 알림</DialogTitle>
          <DialogDescription>이 모달은 닫기 버튼이 없습니다.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>사용자가 특정 작업을 완료해야만 닫을 수 있습니다.</p>
        </div>
        <DialogFooter>
          <Button>작업 완료</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * 큰 모달
 */
export const LargeDialog: Story = {
  render: args => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">큰 모달</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>상세 보고서</DialogTitle>
          <DialogDescription>
            이번 달 회의실 사용 현황에 대한 상세 보고서입니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">총 예약 건수</h4>
              <p className="text-2xl font-bold text-primary">156</p>
              <p className="text-sm text-muted-foreground">지난 달 대비 +12%</p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">평균 사용 시간</h4>
              <p className="text-2xl font-bold text-primary">2.3시간</p>
              <p className="text-sm text-muted-foreground">
                지난 달 대비 +0.2시간
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">사용률</h4>
              <p className="text-2xl font-bold text-primary">78%</p>
              <p className="text-sm text-muted-foreground">지난 달 대비 +5%</p>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h4 className="font-semibold mb-2">월별 추이</h4>
            <div className="h-32 bg-muted rounded flex items-center justify-center">
              <span className="text-muted-foreground">차트 영역</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">닫기</Button>
          </DialogClose>
          <Button>PDF 다운로드</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
