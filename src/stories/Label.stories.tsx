import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    htmlFor: {
      control: 'text',
      description: '연결할 폼 요소의 ID',
    },
    variant: {
      control: 'select',
      options: [
        'default',
        'muted',
        'destructive',
        'success',
        'warning',
        'info',
      ],
      description: '라벨 스타일',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl'],
      description: '라벨 크기',
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: '폰트 굵기',
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
 * 기본 라벨
 */
export const Default: Story = {
  args: {
    children: '기본 라벨',
  },
};

/**
 * 다양한 variant 스타일
 */
export const Variants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label variant="default" htmlFor="default-input">
          기본 스타일
        </Label>
        <Input id="default-input" placeholder="기본 입력 필드" />
      </div>

      <div className="space-y-2">
        <Label variant="muted" htmlFor="muted-input">
          비활성 스타일
        </Label>
        <Input id="muted-input" placeholder="비활성 입력 필드" disabled />
      </div>

      <div className="space-y-2">
        <Label variant="destructive" htmlFor="error-input">
          오류 스타일
        </Label>
        <Input
          id="error-input"
          placeholder="오류 입력 필드"
          aria-invalid="true"
        />
      </div>

      <div className="space-y-2">
        <Label variant="success" htmlFor="success-input">
          성공 스타일
        </Label>
        <Input id="success-input" placeholder="성공 입력 필드" />
      </div>

      <div className="space-y-2">
        <Label variant="warning" htmlFor="warning-input">
          경고 스타일
        </Label>
        <Input id="warning-input" placeholder="경고 입력 필드" />
      </div>

      <div className="space-y-2">
        <Label variant="info" htmlFor="info-input">
          정보 스타일
        </Label>
        <Input id="info-input" placeholder="정보 입력 필드" />
      </div>
    </div>
  ),
};

/**
 * 다양한 크기
 */
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label size="sm" htmlFor="small-input">
          작은 크기
        </Label>
        <Input id="small-input" placeholder="작은 입력 필드" />
      </div>

      <div className="space-y-2">
        <Label size="default" htmlFor="default-size-input">
          기본 크기
        </Label>
        <Input id="default-size-input" placeholder="기본 크기 입력 필드" />
      </div>

      <div className="space-y-2">
        <Label size="lg" htmlFor="large-input">
          큰 크기
        </Label>
        <Input id="large-input" placeholder="큰 크기 입력 필드" />
      </div>

      <div className="space-y-2">
        <Label size="xl" htmlFor="xl-input">
          초대형 크기
        </Label>
        <Input id="xl-input" placeholder="초대형 크기 입력 필드" />
      </div>
    </div>
  ),
};

/**
 * 다양한 폰트 굵기
 */
export const FontWeights: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label weight="normal" htmlFor="normal-weight-input">
          일반 굵기
        </Label>
        <Input id="normal-weight-input" placeholder="일반 굵기 입력 필드" />
      </div>

      <div className="space-y-2">
        <Label weight="medium" htmlFor="medium-weight-input">
          중간 굵기
        </Label>
        <Input id="medium-weight-input" placeholder="중간 굵기 입력 필드" />
      </div>

      <div className="space-y-2">
        <Label weight="semibold" htmlFor="semibold-weight-input">
          반굵게
        </Label>
        <Input id="semibold-weight-input" placeholder="반굵게 입력 필드" />
      </div>

      <div className="space-y-2">
        <Label weight="bold" htmlFor="bold-weight-input">
          굵게
        </Label>
        <Input id="bold-weight-input" placeholder="굵게 입력 필드" />
      </div>
    </div>
  ),
};

/**
 * 입력 필드와 연결된 라벨
 */
export const WithInput: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="username">사용자명</Label>
        <Input id="username" placeholder="사용자명을 입력하세요" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" placeholder="이메일을 입력하세요" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">자기소개</Label>
        <textarea
          id="bio"
          placeholder="자기소개를 입력하세요"
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>
    </div>
  ),
};

/**
 * 체크박스와 연결된 라벨 (HTML input 사용)
 */
export const WithCheckbox: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="terms" className="w-4 h-4" />
        <Label htmlFor="terms">이용약관에 동의합니다</Label>
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" id="marketing" className="w-4 h-4" />
        <Label htmlFor="marketing">마케팅 정보 수신에 동의합니다</Label>
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" id="newsletter" className="w-4 h-4" />
        <Label htmlFor="newsletter">뉴스레터 구독</Label>
      </div>
    </div>
  ),
};

/**
 * 라디오 버튼과 연결된 라벨 (HTML input 사용)
 */
export const WithRadioGroup: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Label>성별</Label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            name="gender"
            value="male"
            id="male"
            className="w-4 h-4"
          />
          <Label htmlFor="male">남성</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            name="gender"
            value="female"
            id="female"
            className="w-4 h-4"
          />
          <Label htmlFor="female">여성</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            name="gender"
            value="other"
            id="other"
            className="w-4 h-4"
          />
          <Label htmlFor="other">기타</Label>
        </div>
      </div>
    </div>
  ),
};

/**
 * 스위치와 연결된 라벨 (HTML input 사용)
 */
export const WithSwitch: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="flex items-center justify-between">
        <Label htmlFor="airplane-mode">비행기 모드</Label>
        <input
          type="checkbox"
          id="airplane-mode"
          className="w-11 h-6 bg-gray-200 rounded-full appearance-none cursor-pointer relative transition-colors checked:bg-blue-600"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="wifi">Wi-Fi</Label>
        <input
          type="checkbox"
          id="wifi"
          defaultChecked
          className="w-11 h-6 bg-gray-200 rounded-full appearance-none cursor-pointer relative transition-colors checked:bg-blue-600"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="bluetooth">블루투스</Label>
        <input
          type="checkbox"
          id="bluetooth"
          className="w-11 h-6 bg-gray-200 rounded-full appearance-none cursor-pointer relative transition-colors checked:bg-blue-600"
        />
      </div>
    </div>
  ),
};

/**
 * 필수 입력 표시가 있는 라벨
 */
export const RequiredLabels: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label variant="destructive" size="lg" htmlFor="required-name">
          이름 <span className="text-red-500">*</span>
        </Label>
        <Input id="required-name" placeholder="이름을 입력하세요" required />
      </div>

      <div className="space-y-2">
        <Label variant="destructive" size="lg" htmlFor="required-email">
          이메일 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="required-email"
          type="email"
          placeholder="이메일을 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <Label variant="muted" htmlFor="optional-phone">
          전화번호 <span className="text-gray-400">(선택사항)</span>
        </Label>
        <Input
          id="optional-phone"
          type="tel"
          placeholder="전화번호를 입력하세요"
        />
      </div>
    </div>
  ),
};

/**
 * 다양한 스타일의 라벨
 */
export const LabelStyles: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="default-style" size="default">
          기본 스타일
        </Label>
        <Input id="default-style" placeholder="기본 스타일" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="large-style" size="lg" weight="semibold">
          큰 스타일
        </Label>
        <Input id="large-style" placeholder="큰 스타일" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="colored-style" variant="info" weight="bold">
          컬러 스타일
        </Label>
        <Input id="colored-style" placeholder="컬러 스타일" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="italic-style" variant="muted" className="italic">
          이탤릭 스타일
        </Label>
        <Input id="italic-style" placeholder="이탤릭 스타일" />
      </div>
    </div>
  ),
};

/**
 * 아이콘이 있는 라벨
 */
export const LabelsWithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="search-input" className="flex items-center gap-2">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          검색
        </Label>
        <Input id="search-input" placeholder="검색어를 입력하세요" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-input" className="flex items-center gap-2">
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
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          이메일
        </Label>
        <Input
          id="email-input"
          type="email"
          placeholder="이메일을 입력하세요"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone-input" className="flex items-center gap-2">
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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          전화번호
        </Label>
        <Input
          id="phone-input"
          type="tel"
          placeholder="전화번호를 입력하세요"
        />
      </div>
    </div>
  ),
};

/**
 * 섹션 헤더로 사용되는 라벨
 */
export const SectionHeaders: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <Label size="xl" weight="bold" className="text-gray-900">
        개인 정보
      </Label>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="first-name">이름</Label>
          <Input id="first-name" placeholder="이름" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">성</Label>
          <Input id="last-name" placeholder="성" />
        </div>
      </div>

      <Label size="xl" weight="bold" className="text-gray-900">
        계정 정보
      </Label>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="username">사용자명</Label>
          <Input id="username" placeholder="사용자명" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" placeholder="이메일" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input id="password" type="password" placeholder="비밀번호" />
        </div>
      </div>

      <Label size="xl" weight="bold" className="text-gray-900">
        설정
      </Label>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">알림 수신</Label>
          <input
            type="checkbox"
            id="notifications"
            defaultChecked
            className="w-4 h-4"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="newsletter">뉴스레터 구독</Label>
          <input type="checkbox" id="newsletter" className="w-4 h-4" />
        </div>
      </div>
    </div>
  ),
};

/**
 * 상태별 라벨
 */
export const StatusLabels: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label variant="success" htmlFor="success-status">
          ✅ 성공적으로 완료되었습니다
        </Label>
        <Input id="success-status" value="작업 완료" readOnly />
      </div>

      <div className="space-y-2">
        <Label variant="warning" htmlFor="warning-status">
          ⚠️ 주의가 필요한 항목입니다
        </Label>
        <Input id="warning-status" value="검토 필요" readOnly />
      </div>

      <div className="space-y-2">
        <Label variant="destructive" htmlFor="error-status">
          ❌ 오류가 발생했습니다
        </Label>
        <Input id="error-status" value="오류 발생" readOnly />
      </div>

      <div className="space-y-2">
        <Label variant="info" htmlFor="info-status">
          ℹ️ 정보를 확인해주세요
        </Label>
        <Input id="info-status" value="정보 확인" readOnly />
      </div>
    </div>
  ),
};

/**
 * 폼 그룹 예시
 */
export const FormGroup: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div className="space-y-4">
        <Label size="xl" weight="bold" className="text-gray-900">
          개인 정보
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="first-name">이름</Label>
            <Input id="first-name" placeholder="이름" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">성</Label>
            <Input id="last-name" placeholder="성" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label size="xl" weight="bold" className="text-gray-900">
          계정 정보
        </Label>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="username">사용자명</Label>
            <Input id="username" placeholder="사용자명" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="이메일" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" placeholder="비밀번호" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label size="xl" weight="bold" className="text-gray-900">
          설정
        </Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">알림 수신</Label>
            <input
              type="checkbox"
              id="notifications"
              defaultChecked
              className="w-4 h-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="newsletter">뉴스레터 구독</Label>
            <input type="checkbox" id="newsletter" className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  ),
};
