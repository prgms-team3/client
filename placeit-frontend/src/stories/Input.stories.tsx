import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'search',
        'file',
        'date',
        'time',
        'datetime-local',
      ],
      description: '입력 필드 타입',
    },
    placeholder: {
      control: 'text',
      description: '플레이스홀더 텍스트',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 여부',
    },
    required: {
      control: 'boolean',
      description: '필수 입력 여부',
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
 * 기본 입력 필드
 */
export const Default: Story = {
  args: {
    placeholder: '텍스트를 입력하세요',
  },
};

/**
 * 다양한 타입의 입력 필드
 */
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="text-input">텍스트</Label>
        <Input id="text-input" placeholder="일반 텍스트 입력" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-input">이메일</Label>
        <Input id="email-input" type="email" placeholder="example@email.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password-input">비밀번호</Label>
        <Input
          id="password-input"
          type="password"
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="number-input">숫자</Label>
        <Input
          id="number-input"
          type="number"
          placeholder="0"
          min="0"
          max="100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tel-input">전화번호</Label>
        <Input id="tel-input" type="tel" placeholder="010-1234-5678" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url-input">URL</Label>
        <Input id="url-input" type="url" placeholder="https://example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="search-input">검색</Label>
        <Input
          id="search-input"
          type="search"
          placeholder="검색어를 입력하세요"
        />
      </div>
    </div>
  ),
};

/**
 * 날짜 및 시간 입력 필드
 */
export const DateTimeInputs: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="date-input">날짜</Label>
        <Input id="date-input" type="date" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time-input">시간</Label>
        <Input id="time-input" type="time" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="datetime-input">날짜 및 시간</Label>
        <Input id="datetime-input" type="datetime-local" />
      </div>
    </div>
  ),
};

/**
 * 파일 업로드 입력
 */
export const FileInput: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="file-input">일반 파일</Label>
        <Input id="file-input" type="file" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-file-input">이미지 파일</Label>
        <Input id="image-file-input" type="file" accept="image/*" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pdf-file-input">PDF 파일</Label>
        <Input id="pdf-file-input" type="file" accept=".pdf" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="multiple-file-input">여러 파일</Label>
        <Input id="multiple-file-input" type="file" multiple />
      </div>
    </div>
  ),
};

/**
 * 입력 필드 상태들
 */
export const InputStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="normal-input">일반 상태</Label>
        <Input id="normal-input" placeholder="일반 입력 필드" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="disabled-input">비활성화</Label>
        <Input
          id="disabled-input"
          placeholder="비활성화된 입력 필드"
          disabled
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="readonly-input">읽기 전용</Label>
        <Input id="readonly-input" value="읽기 전용 텍스트" readOnly />
      </div>

      <div className="space-y-2">
        <Label htmlFor="required-input">필수 입력</Label>
        <Input id="required-input" placeholder="필수 입력 필드" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="invalid-input">유효하지 않음</Label>
        <Input
          id="invalid-input"
          placeholder="유효하지 않은 입력"
          aria-invalid="true"
        />
      </div>
    </div>
  ),
};

/**
 * 다양한 크기의 입력 필드
 */
export const InputSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="small-input">작은 크기</Label>
        <Input
          id="small-input"
          placeholder="작은 입력 필드"
          className="h-7 px-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="default-input">기본 크기</Label>
        <Input id="default-input" placeholder="기본 입력 필드" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="large-input">큰 크기</Label>
        <Input
          id="large-input"
          placeholder="큰 입력 필드"
          className="h-11 px-4 text-lg"
        />
      </div>
    </div>
  ),
};

/**
 * 입력 필드 그룹
 */
export const InputGroup: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <div className="space-y-2">
        <Label>개인 정보</Label>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="이름" />
          <Input placeholder="성" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>주소 정보</Label>
        <Input placeholder="도로명 주소" />
        <Input placeholder="상세 주소" />
        <div className="grid grid-cols-3 gap-3">
          <Input placeholder="우편번호" />
          <Input placeholder="시/도" />
          <Input placeholder="구/군" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>연락처</Label>
        <div className="grid grid-cols-2 gap-3">
          <Input type="tel" placeholder="전화번호" />
          <Input type="email" placeholder="이메일" />
        </div>
      </div>
    </div>
  ),
};

/**
 * 검색 입력 필드
 */
export const SearchInput: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="search-input">검색</Label>
        <Input
          id="search-input"
          type="search"
          placeholder="검색어를 입력하세요..."
          className="pr-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-input">필터</Label>
        <Input
          id="filter-input"
          placeholder="필터 조건을 입력하세요..."
          className="border-dashed"
        />
      </div>
    </div>
  ),
};

/**
 * 폼 예시
 */
export const FormExample: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="username">사용자명</Label>
        <Input id="username" placeholder="사용자명을 입력하세요" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          placeholder="이메일을 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">비밀번호 확인</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">전화번호</Label>
        <Input id="phone" type="tel" placeholder="전화번호를 입력하세요" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate">생년월일</Label>
        <Input id="birthdate" type="date" />
      </div>
    </div>
  ),
};
