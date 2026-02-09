# SetLog 기획 문서

## 1. 정보 아키텍처 (IA)

```
SetLog
├── 랜딩 페이지 (/)
│   ├── 히어로 섹션
│   ├── 기능 소개
│   ├── 지원 서비스 목록
│   └── CTA → 회원가입
│
├── 인증 (/auth)
│   ├── 로그인 (/login)
│   ├── 회원가입 (/signup)
│   └── 비밀번호 재설정 (/reset-password)
│
├── 대시보드 (/dashboard)
│   ├── 프로젝트 목록 (카드 그리드)
│   ├── 새 프로젝트 생성 (모달)
│   ├── 템플릿에서 시작 (모달)
│   └── 최근 활동 피드
│
├── 프로젝트 상세 (/project/[id])
│   ├── 개요 탭 (/project/[id])
│   │   ├── 프로젝트 정보
│   │   ├── 연결된 서비스 요약
│   │   └── 빠른 액션
│   ├── 서비스 맵 탭 (/project/[id]/service-map)
│   │   ├── 아키텍처 다이어그램 (React Flow)
│   │   ├── 서비스 추가 패널
│   │   └── 내보내기 (PNG/SVG)
│   ├── 서비스 목록 탭 (/project/[id]/services)
│   │   ├── 연결된 서비스 리스트
│   │   ├── 서비스 추가 (카탈로그 연결)
│   │   └── 서비스별 체크리스트
│   ├── 환경변수 탭 (/project/[id]/env)
│   │   ├── 환경별 변수 목록 (dev/staging/prod)
│   │   ├── 변수 추가/수정/삭제
│   │   └── .env 다운로드
│   └── 설정 탭 (/project/[id]/settings)
│       ├── 프로젝트 정보 수정
│       └── 프로젝트 삭제
│
└── 서비스 카탈로그 (/services)
    ├── 카테고리 필터
    ├── 검색
    └── 서비스 상세 (/services/[slug])
        ├── 서비스 정보
        ├── 연결 가이드
        └── 프로젝트에 추가
```

## 2. 사용자 플로우

### 2.1 신규 사용자 온보딩
```
랜딩페이지 방문 → CTA 클릭 → 회원가입 (이메일/OAuth) → 대시보드
→ "새 프로젝트 만들기" 또는 "템플릿에서 시작"
→ 프로젝트 이름/설명 입력 → 프로젝트 대시보드
```

### 2.2 서비스 추가 및 연결
```
프로젝트 상세 → 서비스 목록 탭 → "서비스 추가" 클릭
→ 서비스 카탈로그 브라우징/검색 → 서비스 선택
→ 체크리스트 표시 → 단계별 진행 (체크 표시)
→ 환경변수 자동 감지 → 환경변수 입력 → 연결 완료
```

### 2.3 환경변수 관리
```
프로젝트 상세 → 환경변수 탭 → 환경 선택 (dev/staging/prod)
→ 변수 추가 (키/값/설명/민감도)
→ .env 파일 다운로드 또는 복사
```

### 2.4 서비스 맵 생성
```
프로젝트 상세 → 서비스 맵 탭
→ 연결된 서비스가 자동으로 노드로 표시
→ 드래그&드롭으로 위치 조정 → 연결선 추가
→ PNG/SVG로 내보내기
```

### 2.5 템플릿 사용
```
대시보드 → "템플릿에서 시작" → 템플릿 선택
→ 프로젝트 이름 입력 → 프로젝트 생성
→ 템플릿에 포함된 서비스들이 자동 추가
→ 각 서비스별 체크리스트 시작
```

## 3. 주요 화면 구성

### 3.1 랜딩 페이지
- **히어로**: "바이브 코딩, 설정은 SetLog가" + CTA 버튼
- **기능 카드 3개**: 서비스 맵 / 체크리스트 / 환경변수 관리
- **지원 서비스 로고 배너**: Supabase, Vercel, Stripe, OpenAI 등
- **Footer**: 링크, 소셜

### 3.2 대시보드
- **헤더**: 로고 + 네비게이션 + 사용자 아바타
- **프로젝트 그리드**: 카드 형태 (이름, 서비스 수, 상태, 마지막 수정일)
- **빈 상태**: 프로젝트가 없을 때 가이드 메시지

### 3.3 프로젝트 상세 - 개요
- 프로젝트 이름/설명
- 연결된 서비스 아이콘 목록
- 체크리스트 전체 진행률 (프로그레스바)
- 환경변수 수 / 누락 경고

### 3.4 프로젝트 상세 - 서비스 맵
- React Flow 캔버스 (전체 화면)
- 좌측 패널: 서비스 추가 드래그 소스
- 노드: 서비스 아이콘 + 이름 + 상태 뱃지
- 엣지: 데이터 흐름 방향 표시

### 3.5 프로젝트 상세 - 서비스 목록
- 서비스 카드 리스트 (아이콘, 이름, 상태, 진행률)
- 클릭 시 체크리스트 펼침 (아코디언)
- "서비스 추가" 버튼 → 카탈로그 모달

### 3.6 프로젝트 상세 - 환경변수
- 환경 탭 (Development / Staging / Production)
- 테이블: 키 이름 | 값 (마스킹) | 민감도 | 연결된 서비스 | 액션
- ".env 다운로드" 버튼
- "변수 추가" 버튼

## 4. 데이터 모델 설계

### 4.1 ERD 관계

```
users (1) ──── (N) projects
projects (1) ──── (N) project_services
services (1) ──── (N) project_services
services (1) ──── (N) checklist_items
project_services (1) ──── (N) user_checklist_progress
checklist_items (1) ──── (N) user_checklist_progress
projects (1) ──── (N) environment_variables
services (1) ──── (N) environment_variables (optional)
project_templates (N) ──── (1) users (author)
```

### 4.2 테이블 상세

#### users
- Supabase Auth의 `auth.users` 테이블 활용
- 추가 프로필 정보는 `public.profiles` 테이블로 분리

```sql
profiles (
  id uuid PK REFERENCES auth.users(id),
  email text NOT NULL,
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

#### projects
```sql
projects (
  id uuid PK DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  tech_stack jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

#### services (시드 데이터)
```sql
services (
  id uuid PK DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('auth','database','deploy','email','payment','storage','monitoring','ai','other')),
  description text,
  description_ko text,
  icon_url text,
  website_url text,
  docs_url text,
  pricing_info jsonb DEFAULT '{}',
  required_env_vars jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
)
```

#### project_services
```sql
project_services (
  id uuid PK DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id),
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','connected','error')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, service_id)
)
```

#### checklist_items
```sql
checklist_items (
  id uuid PK DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  title text NOT NULL,
  title_ko text,
  description text,
  description_ko text,
  guide_url text,
  created_at timestamptz DEFAULT now()
)
```

#### user_checklist_progress
```sql
user_checklist_progress (
  id uuid PK DEFAULT gen_random_uuid(),
  project_service_id uuid NOT NULL REFERENCES project_services(id) ON DELETE CASCADE,
  checklist_item_id uuid NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(project_service_id, checklist_item_id)
)
```

#### environment_variables
```sql
environment_variables (
  id uuid PK DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id),
  key_name text NOT NULL,
  encrypted_value text NOT NULL,
  environment text NOT NULL DEFAULT 'development' CHECK (environment IN ('development','staging','production')),
  is_secret boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

#### project_templates
```sql
project_templates (
  id uuid PK DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ko text,
  description text,
  description_ko text,
  services jsonb NOT NULL DEFAULT '[]',
  tech_stack jsonb DEFAULT '{}',
  is_community boolean DEFAULT false,
  author_id uuid REFERENCES auth.users(id),
  downloads_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
)
```

### 4.3 RLS 정책

```
profiles: 사용자는 자신의 프로필만 조회/수정 가능
projects: 사용자는 자신의 프로젝트만 CRUD 가능
project_services: 프로젝트 소유자만 CRUD 가능
user_checklist_progress: 프로젝트 소유자만 CRUD 가능
environment_variables: 프로젝트 소유자만 CRUD 가능
services: 모든 인증된 사용자가 조회 가능 (관리자만 수정)
checklist_items: 모든 인증된 사용자가 조회 가능 (관리자만 수정)
project_templates: 모든 인증된 사용자가 조회 가능
```

## 5. API 설계 개요

### 5.1 인증 API
- `POST /auth/signup` - 이메일 회원가입
- `POST /auth/login` - 이메일 로그인
- `POST /auth/oauth/google` - Google OAuth
- `POST /auth/oauth/github` - GitHub OAuth
- `POST /auth/logout` - 로그아웃
- `POST /auth/reset-password` - 비밀번호 재설정

> Supabase Auth SDK를 직접 사용하므로 별도 API 라우트 최소화

### 5.2 프로젝트 API
- `GET /api/projects` - 내 프로젝트 목록
- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects/[id]` - 프로젝트 상세
- `PATCH /api/projects/[id]` - 프로젝트 수정
- `DELETE /api/projects/[id]` - 프로젝트 삭제
- `POST /api/projects/from-template` - 템플릿에서 프로젝트 생성

### 5.3 서비스 API
- `GET /api/services` - 서비스 카탈로그 목록 (필터/검색)
- `GET /api/services/[slug]` - 서비스 상세
- `POST /api/projects/[id]/services` - 프로젝트에 서비스 추가
- `DELETE /api/projects/[id]/services/[serviceId]` - 프로젝트에서 서비스 제거
- `PATCH /api/projects/[id]/services/[serviceId]` - 서비스 상태 업데이트

### 5.4 체크리스트 API
- `GET /api/projects/[id]/services/[serviceId]/checklist` - 체크리스트 조회
- `PATCH /api/projects/[id]/checklist/[itemId]` - 체크리스트 항목 완료/취소

### 5.5 환경변수 API
- `GET /api/projects/[id]/env` - 환경변수 목록 (환경별 필터)
- `POST /api/projects/[id]/env` - 환경변수 추가
- `PATCH /api/projects/[id]/env/[varId]` - 환경변수 수정
- `DELETE /api/projects/[id]/env/[varId]` - 환경변수 삭제
- `GET /api/projects/[id]/env/download?environment=development` - .env 파일 다운로드

### 5.6 템플릿 API
- `GET /api/templates` - 템플릿 목록
- `GET /api/templates/[id]` - 템플릿 상세

> 대부분의 데이터 조회는 Supabase 클라이언트를 직접 사용하고,
> API Routes는 서버 사이드 로직이 필요한 경우(암호화/복호화, 파일 생성 등)에만 사용
