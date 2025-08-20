# PlaceIt - 공간 예약 관리 시스템

> 쉽고 빠른 공간 예약 관리 시스템으로 회의실과 공용 공간을 효율적으로 관리하세요.

## 🚀 기술 스택

- **Frontend**: Next.js 15, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Font**: Pretendard (한글 최적화)

## 🌿 브랜치 전략

### 브랜치 구조

```
main (프로덕션)
├── develop (개발 통합)
    ├── feature/기능명
    ├── fix/버그명
    └── hotfix/긴급수정명
```

### 워크플로우

1. `develop`에서 새 브랜치 생성
2. 기능 개발 후 `develop`에 머지
3. 안정화 후 `main`에 머지

## 📝 커밋 메시지 컨벤션

### 커밋 유형

| 유형               | 의미                                                         |
| ------------------ | ------------------------------------------------------------ |
| `Feat`             | 새로운 기능 추가                                             |
| `Fix`              | 버그 수정                                                    |
| `Docs`             | 문서 수정                                                    |
| `Style`            | 코드 formatting, 세미콜론 누락, 코드 자체의 변경이 없는 경우 |
| `Refactor`         | 코드 리팩토링                                                |
| `Test`             | 테스트 코드, 리팩토링 테스트 코드 추가                       |
| `Chore`            | 패키지 매니저 수정, 그 외 기타 수정 ex) .gitignore           |
| `Design`           | CSS 등 사용자 UI 디자인 변경                                 |
| `Comment`          | 필요한 주석 추가 및 변경                                     |
| `Rename`           | 파일 또는 폴더 명을 수정하거나 옮기는 작업만인 경우          |
| `Remove`           | 파일을 삭제하는 작업만 수행한 경우                           |
| `!BREAKING CHANGE` | 커다란 API 변경의 경우                                       |
| `!HOTFIX`          | 급하게 치명적인 버그를 고쳐야 하는 경우                      |

### 커밋 메시지 예시

```bash
Feat: 실시간 예약 대시보드 구현
Fix: Safari에서 버튼 클릭 안되는 오류 해결
Docs: README 브랜치 전략 가이드 추가
```

## 🛠️ 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/prgms-team3/client.git
cd placeit-frontend
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. Git Flow 워크플로우

#### 1. 기능 개발

```bash
# develop에서 새 기능 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/기능명

# 개발 작업 후 커밋 및 푸시
git add .
git commit -m "feat: 기능 설명"
git push origin feature/기능명
```

#### 2. PR 생성 (GitHub 웹)

- `feature/기능명` → `develop` PR 생성
- 리뷰어 지정 및 리뷰 요청
- PR 설명에 기능 상세 내용 작성

#### 3. 코드 리뷰 & 머지 (GitHub 웹)

- 팀원 코드 리뷰 진행
- 리뷰 의견 반영 및 수정
- 승인 후 `develop`에 머지

#### 4. 정리

```bash
# develop 브랜치 최신화 및 로컬 브랜치 정리
git checkout develop
git pull origin develop
git branch -d feature/기능명
```

#### 5. 배포 (GitHub 웹)

- `develop` → `main` PR 생성
- 최종 승인 및 머지
- 자동 배포 또는 수동 배포 진행

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (dashboard)/       # 대시보드 페이지들
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 랜딩 페이지
├── components/            # 재사용 컴포넌트
│   └── ui/               # shadcn/ui 컴포넌트
└── lib/                  # 유틸리티 함수

public/
├── fonts/                # 폰트 파일
└── icons/                # 아이콘 파일
```
