# SetLog PRD (Product Requirements Document)

## 1. 프로젝트 개요

### 1.1 비전
> "바이브 코딩의 시작과 끝을 연결하는 허브"

SetLog는 바이브 코딩 사용자들이 프로젝트를 시작할 때 겪는 **서비스 연결, API 설정, 환경변수 관리, 인증 구성** 등의 반복적이고 복잡한 설정 작업을 체계적으로 관리하고 자동화하는 플랫폼입니다.

### 1.2 배경
- 2026년 기준 **미국 개발자의 92%가 AI 코딩 도구를 매일 사용**하며, 전 세계 코드의 **41%가 AI로 생성**
- Andrej Karpathy가 2025년 2월 명명한 "바이브 코딩"은 자연어로 코드를 생성하는 새로운 패러다임
- **문제**: 바이브 코딩 도구(Cursor, Bolt, Replit, Claude Code 등)는 코드 생성에 뛰어나지만, **프로젝트 초기 설정(서비스 연결, API 키 관리, 환경변수, 인증 등)은 여전히 수동적이고 복잡**
- 기존 도구들(Postman, Backstage, Doppler 등)은 전문 개발자 대상이며, 바이브 코딩 입문자에게는 진입장벽이 높음

### 1.3 목표
1. 바이브 코딩 사용자의 프로젝트 초기 설정 시간을 **70% 단축**
2. 서비스 연결 정보를 **시각적으로 관리**하여 프로젝트 아키텍처 파악 용이
3. API 키/환경변수를 **안전하게 저장하고 공유**
4. 서비스별 **체크리스트와 가이드**로 초보자도 쉽게 연결 가능
5. 팀 협업 시 서비스 연결 정보의 **인수인계 비용 최소화**

---

## 2. 시장 분석 및 경쟁 환경

### 2.1 유사 서비스 분석

| 카테고리 | 서비스 | 핵심 기능 | SetLog과의 차이 |
|---------|--------|----------|----------------|
| API 관리 | **Postman** | API 테스트/문서화/협업 | 개발자 전문 도구, 바이브 코더에게 복잡 |
| API 관리 | **Swagger/OpenAPI** | API 스펙 문서화 | 스펙 작성 자체가 전문 지식 필요 |
| 개발자 포털 | **Backstage** (Spotify) | 내부 개발자 포털, 서비스 카탈로그 | 기업 대상, 설치/운영 복잡, 바이브코딩 미지원 |
| 개발자 포털 | **Port / Cortex** | 서비스 카탈로그, 스코어카드 | 엔터프라이즈 전용, 높은 가격 |
| 시크릿 관리 | **Doppler** | 환경변수/시크릿 중앙 관리 | 설정 전문 도구, 서비스 연결 가이드 없음 |
| 시크릿 관리 | **Infisical** | 오픈소스 시크릿 관리 | 시크릿만 관리, 서비스 연결 전체 관리 안됨 |
| 통합 자동화 | **Zapier / Make** | 서비스 간 워크플로 자동화 | 런타임 자동화, 개발 설정 관리 아님 |
| 인증 | **Clerk / Auth0** | 인증/사용자 관리 | 인증만 제공, 다른 서비스 연결 관리 없음 |
| 스캐폴딩 | **create-t3-app** | 프로젝트 템플릿 생성 | 초기 1회성, 지속적 관리 불가 |

### 2.2 시장 기회 (Gap 분석)

**기존 도구들이 해결하지 못하는 것:**
1. **서비스 연결의 전체 라이프사이클 관리** - 개별 도구는 있지만 통합 관리 플랫폼 부재
2. **바이브 코딩 초보자를 위한 가이드** - "Supabase를 연결하려면 어떤 순서로?" 에 답하는 도구 없음
3. **프로젝트별 서비스 맵** - 내 프로젝트가 어떤 서비스에 의존하는지 시각화하는 도구 없음
4. **환경변수와 서비스 연결의 통합** - 시크릿 관리와 서비스 가이드가 분리
5. **비개발자 친화적 UX** - 기존 도구는 모두 전문 개발자 대상

---

## 3. 타겟 사용자 및 페르소나

### 페르소나 1: 비개발자 바이브 코더 "민지"
- **나이/직업**: 28세, 스타트업 마케터
- **기술 수준**: 비개발자 (HTML/CSS 기초만 아는 수준)
- **사용 도구**: Bolt.new, Lovable, v0
- **Pain Point**: "Bolt으로 UI는 만들었는데 Supabase 연결이 안 돼요. API 키가 뭔지도 모르겠고, .env 파일이 뭔지..."
- **기대 가치**: 서비스별 체크리스트를 따라하면 연결 완료, 환경변수 자동 생성
- **핵심 시나리오**: 랜딩페이지에 Supabase DB + Resend 이메일 연결

### 페르소나 2: 사이드 프로젝트 개발자 "준호"
- **나이/직업**: 32세, 프론트엔드 개발자
- **기술 수준**: 주니어~미드 레벨 (프론트 중심, 백엔드 약함)
- **사용 도구**: Cursor, Claude Code
- **Pain Point**: "사이드 프로젝트마다 매번 같은 설정 반복... Stripe 연동 절차를 또 검색하고 있음"
- **기대 가치**: 프로젝트 템플릿으로 빠른 시작, 이전 프로젝트 설정 복제
- **핵심 시나리오**: SaaS 사이드 프로젝트 - Auth + DB + 결제 + 이메일 한번에 설정

### 페르소나 3: 1인 CTO "서연"
- **나이/직업**: 35세, 초기 스타트업 CTO (혼자 개발)
- **기술 수준**: 시니어 풀스택
- **사용 도구**: Cursor, Claude Code, Replit
- **Pain Point**: "12개 서비스를 쓰는데 API 키가 어디 있는지, 어떤 환경변수를 쓰는지 기억이 안 남. 팀원 합류 시 인수인계가 지옥"
- **기대 가치**: 서비스 맵 시각화, 팀원 온보딩용 문서 자동 생성
- **핵심 시나리오**: 프로젝트 전체 서비스 아키텍처 정리 + 신규 팀원에게 공유

### 페르소나 4: 프리랜서 "동건"
- **나이/직업**: 30세, 프리랜서 풀스택 개발자
- **기술 수준**: 미드~시니어
- **사용 도구**: Cursor, Claude Code
- **Pain Point**: "클라이언트마다 다른 서비스 조합. 프로젝트 전환할 때 환경변수 꼬임. 클라이언트에게 뭘 만들어달라고 해야 하는지 정리가 안 됨"
- **기대 가치**: 클라이언트별 프로젝트 분리, 필요 서비스 목록 자동 생성, 비용 추적
- **핵심 시나리오**: 클라이언트 프로젝트 시작 시 필요한 서비스 계정/키 체크리스트 전달

### 페르소나 5: 학생 "하은"
- **나이/직업**: 22세, 컴퓨터공학과 학생
- **기술 수준**: 초보 개발자 (수업에서 배운 정도)
- **사용 도구**: Replit, Bolt.new
- **Pain Point**: "수업 프로젝트에서 Firebase 연결하라는데 문서가 영어고 너무 복잡해요. API 키를 GitHub에 올렸다가 혼남"
- **기대 가치**: 한국어 가이드, 보안 경고, 단계별 튜토리얼
- **핵심 시나리오**: 팀 프로젝트에서 Firebase + Vercel 배포 설정

### 페르소나 6: 기업 내부 도구 담당자 "영수"
- **나이/직업**: 40세, 중견기업 IT기획팀
- **기술 수준**: PM 수준 (코딩 불가, 바이브 코딩으로 내부 도구 시도)
- **사용 도구**: Bolt.new, Lovable
- **Pain Point**: "사내 DB에 연결해서 간단한 대시보드 만들고 싶은데, 보안팀에서 API 키 관리가 안 된다고 반대"
- **기대 가치**: 보안 감사 로그, 접근 권한 관리, 기업 정책 준수 증명
- **핵심 시나리오**: 사내 REST API + 외부 SaaS를 조합한 내부 대시보드

### 페르소나 7: 디자이너 "소희"
- **나이/직업**: 29세, UI/UX 디자이너
- **기술 수준**: 비개발자 (Figma 전문, 코딩은 모름)
- **사용 도구**: v0, Lovable, Bolt.new
- **Pain Point**: "디자인한 걸 직접 구현해보고 싶은데, 백엔드 연결에서 막힘. 'CORS 에러'가 뭔데..."
- **기대 가치**: 원클릭 백엔드 설정, 에러 해결 가이드
- **핵심 시나리오**: 포트폴리오 웹사이트에 CMS + 폼 서비스 연결

---

## 4. 핵심 기능 정의

### Phase 1 - MVP (3개월)

#### 4.1 프로젝트 대시보드
- 프로젝트 생성 및 관리
- 프로젝트별 사용 서비스 목록 관리
- 프로젝트 상태 한눈에 보기

#### 4.2 서비스 카탈로그
- 주요 서비스 카탈로그 (50+ 서비스)
  - **인증**: Clerk, Supabase Auth, Firebase Auth, Auth0, NextAuth
  - **데이터베이스**: Supabase, Firebase, PlanetScale, Neon, Turso
  - **배포**: Vercel, Netlify, Railway, Fly.io, Cloudflare
  - **도메인/DNS**: Cloudflare DNS, Vercel Domains 등 (도메인 등록·DNS 관리)
  - **이메일**: Resend, SendGrid, Postmark, AWS SES (트랜잭션·마케팅 이메일)
  - **결제**: Stripe, Lemon Squeezy, Paddle
  - **스토리지**: Supabase Storage, Cloudinary, Uploadthing, AWS S3
  - **모니터링**: Sentry, LogRocket, Posthog
  - **AI**: OpenAI, Anthropic, Replicate, Together AI
  - **개발/연동**: GitHub (Actions, OAuth, API 토큰), 기타 외부 API 연동 (지도, 번역 등)
- 카테고리 구성 원칙
  - **도메인**: 배포와 구분하여 DNS·도메인 등록 서비스 별도 카테고리로 관리
  - **마케팅**: 이메일(트랜잭션/마케팅), 분석으로 우선 구성; 광고·SEO 등이 늘면 마케팅 카테고리 확장
  - **API(기타)**: 기타 외부 API는 "개발/연동" 및 other 카테고리·서브카테고리로 분류
  - **IDE**: Cursor, VS Code 등은 "연결 대상 서비스"가 아니라 사용 맥락(페르소나·가이드)에서만 언급
  - **GitHub**: CI/CD·버전관리 계열로 분류 (Actions, OAuth, 저장소 연동 설정)
- 각 서비스별 정보: 설명, 가격, 공식 문서 링크, 대안 서비스

#### 4.3 서비스 연결 체크리스트
- 서비스별 단계별 연결 가이드 (한국어)
- 체크리스트 형태로 진행도 추적
- 필요한 환경변수 목록 자동 제시
- 일반적인 에러와 해결 방법
- 예시:
  ```
  Supabase 연결 체크리스트:
  [ ] 1. Supabase 계정 생성
  [ ] 2. 새 프로젝트 생성
  [ ] 3. Project URL 복사 → NEXT_PUBLIC_SUPABASE_URL
  [ ] 4. Anon Key 복사 → NEXT_PUBLIC_SUPABASE_ANON_KEY
  [ ] 5. Service Role Key 복사 → SUPABASE_SERVICE_ROLE_KEY (주의: 서버에서만 사용)
  [ ] 6. .env.local 파일에 환경변수 추가
  [ ] 7. Supabase 클라이언트 초기화 코드 확인
  [ ] 8. RLS 정책 설정 확인
  ```

#### 4.4 환경변수 관리
- 프로젝트별 환경변수 저장 (암호화)
- 환경별 구분 (development / staging / production)
- `.env` 파일 자동 생성 및 다운로드
- 환경변수 누락 경고
- 민감도 수준 표시 (public / secret)

#### 4.5 회원가입/로그인
- 이메일 + 비밀번호 가입
- Google OAuth 로그인
- GitHub OAuth 로그인 (개발자 타겟)

#### 4.6 서비스 맵 시각화
- 프로젝트의 서비스 연결을 **아키텍처 다이어그램**으로 시각화
- 드래그&드롭으로 서비스 추가/연결
- 서비스 간 데이터 흐름 표시
- PNG/SVG 내보내기 (문서/발표용)

#### 4.7 프로젝트 템플릿
- 일반적인 스택 조합 템플릿 제공
  - "SaaS 스타터": Next.js + Supabase + Stripe + Resend + Vercel
  - "블로그/포트폴리오": Next.js + Sanity + Vercel
  - "AI 앱": Next.js + OpenAI + Supabase + Vercel
  - "모바일 앱 백엔드": Supabase + Firebase Cloud Messaging
  - "랜딩페이지": Next.js + Resend + Vercel
- 커뮤니티 템플릿 공유 (Phase 2)

### Phase 2 - 고도화 (6개월)

#### 4.8 팀 협업
- 팀 워크스페이스
- 역할 기반 접근 제어 (Admin / Editor / Viewer)
- 서비스 연결 정보 공유 (시크릿은 권한별 접근)
- 변경 이력 추적

#### 4.9 비용 추적
- 각 SaaS 서비스의 현재 요금제 기록
- 월별 예상 비용 합산
- 프리티어 한도 경고
- 비용 최적화 제안

### Phase 3 - 확장 (12개월)

#### 4.10 AI 어시스턴트
- 자연어로 서비스 추천
- 에러 메시지 붙여넣기 → 해결 방법 안내
- 서비스 연결 코드 스니펫 자동 생성

#### 4.11 CLI 도구 / IDE 확장
- `setlog pull` - 환경변수를 로컬로 동기화
- `setlog check` - 누락된 환경변수 확인
- Cursor / VS Code 확장 프로그램

#### 4.12 서비스 상태 모니터링
- 연결된 서비스들의 실시간 상태 확인
- 장애 알림 (Slack/이메일)
- API 응답 시간 추적

#### 4.13 마이그레이션 가이드
- 서비스 전환 가이드 (예: Firebase → Supabase)
- 환경변수 매핑 자동화
- 코드 변경점 안내

#### 4.14 MCP 서버 통합
- SetLog MCP 서버 제공
- Claude Code, Cursor 등에서 바이브 코딩 중 직접 SetLog 데이터 참조
- "이 프로젝트의 Supabase URL은?" → 자동 주입

---

## 5. 기술 스택

| 영역 | 기술 | 선정 이유 |
|-----|------|----------|
| **프론트엔드** | Next.js 15 (App Router) | 바이브 코딩 생태계 표준, SSR/SSG 지원 |
| **UI** | Tailwind CSS + shadcn/ui | 빠른 개발, 일관된 디자인 |
| **언어** | TypeScript | 타입 안전성, 바이브 코딩 도구 호환 |
| **백엔드/DB** | Supabase (PostgreSQL) | Auth + DB + Storage 통합, 무료 티어 |
| **인증** | Supabase Auth | DB와 통합, RLS, 50K MAU 무료 |
| **배포** | Vercel | Next.js 최적화, 간편 배포 |
| **상태관리** | Zustand + TanStack Query | 경량, 서버 상태 관리 |
| **암호화** | AES-256-GCM | 환경변수/시크릿 암호화 저장 |
| **시각화** | React Flow | 서비스 맵 다이어그램 |
| **아이콘** | Lucide Icons | shadcn/ui 호환 |

---

## 6. 수익 모델

### 6.1 프리미엄 (Freemium)

| | Free | Pro ($12/월) | Team ($29/월/인) | Enterprise |
|---|------|-------------|-----------------|------------|
| 프로젝트 수 | 3개 | 무제한 | 무제한 | 무제한 |
| 서비스 연결 | 5개/프로젝트 | 무제한 | 무제한 | 무제한 |
| 환경변수 저장 | 20개 | 무제한 | 무제한 | 무제한 |
| 서비스 맵 | - | O | O | O |
| 팀 멤버 | 1명 | 1명 | 최대 20명 | 무제한 |
| 비용 추적 | - | O | O | O |
| AI 어시스턴트 | - | 월 50회 | 월 200회 | 무제한 |
| CLI 도구 | - | O | O | O |
| 감사 로그 | - | - | O | O |
| SSO/SAML | - | - | - | O |
| 온프레미스 | - | - | - | O |

### 6.2 추가 수익원
- **템플릿 마켓플레이스**: 커뮤니티 템플릿 판매 수수료 (20%)
- **서비스 제휴**: 서비스 카탈로그에서 추천 시 제휴 수수료
- **교육 콘텐츠**: 바이브 코딩 + 서비스 연결 온라인 코스

---

## 7. 성공 지표 (KPI)

### 7.1 사용자 지표
- MAU (월간 활성 사용자) - 6개월 내 5,000명
- 회원가입 전환율 > 30%
- 일주일 리텐션 > 40%

### 7.2 제품 지표
- 프로젝트당 평균 서비스 연결 수 > 4개
- 체크리스트 완료율 > 60%
- 환경변수 다운로드 횟수
- 서비스 맵 생성 수

### 7.3 비즈니스 지표
- 무료→유료 전환율 > 5%
- 월간 반복 수익 (MRR)
- 고객 획득 비용 (CAC)
- 고객 생애 가치 (LTV)

---

## 8. 주요 화면 구성

### 8.1 랜딩 페이지
- 히어로 섹션: 핵심 가치 제안
- 기능 소개 (서비스 맵, 체크리스트, 환경변수 관리)
- 지원 서비스 로고 나열
- 사용자 후기
- CTA (회원가입)

### 8.2 회원가입/로그인
- 이메일 가입 폼
- OAuth 버튼 (Google, GitHub)
- 비밀번호 재설정

### 8.3 대시보드
- 내 프로젝트 목록 (카드 형태)
- 최근 활동
- 빠른 시작 (새 프로젝트 생성)

### 8.4 프로젝트 상세
- **개요 탭**: 프로젝트 정보, 연결된 서비스 요약
- **서비스 맵 탭**: 시각적 아키텍처 다이어그램
- **서비스 목록 탭**: 연결된 서비스 + 체크리스트
- **환경변수 탭**: 환경별 변수 관리
- **설정 탭**: 프로젝트 설정, 팀 관리

### 8.5 서비스 카탈로그
- 카테고리별 필터 (인증/DB/배포/이메일/결제 등)
- 검색
- 서비스 상세 (설명, 가격, 가이드 링크)
- "프로젝트에 추가" 버튼

### 8.6 서비스 연결 가이드
- 단계별 체크리스트
- 스크린샷/GIF 포함
- 필요한 환경변수 자동 감지
- 코드 스니펫

---

## 9. 데이터 모델

```sql
-- 사용자
users (
  id uuid PK,
  email text,
  name text,
  avatar_url text,
  created_at timestamptz
)

-- 프로젝트
projects (
  id uuid PK,
  user_id uuid FK → users,
  name text,
  description text,
  tech_stack jsonb,
  created_at timestamptz,
  updated_at timestamptz
)

-- 프로젝트-서비스 연결
project_services (
  id uuid PK,
  project_id uuid FK → projects,
  service_id uuid FK → services,
  status enum (not_started, in_progress, connected, error),
  notes text,
  created_at timestamptz
)

-- 서비스 카탈로그
services (
  id uuid PK,
  name text,
  slug text UNIQUE,
  category enum (auth, database, deploy, email, payment, storage, monitoring, ai, other),
  description text,
  icon_url text,
  website_url text,
  docs_url text,
  pricing_info jsonb,
  required_env_vars jsonb
)

-- 체크리스트 항목
checklist_items (
  id uuid PK,
  service_id uuid FK → services,
  order_index integer,
  title text,
  description text,
  guide_url text
)

-- 사용자 체크리스트 진행도
user_checklist_progress (
  id uuid PK,
  project_service_id uuid FK → project_services,
  checklist_item_id uuid FK → checklist_items,
  completed boolean,
  completed_at timestamptz
)

-- 환경변수
environment_variables (
  id uuid PK,
  project_id uuid FK → projects,
  service_id uuid FK → services (nullable),
  key_name text,
  encrypted_value text,
  environment enum (development, staging, production),
  is_secret boolean,
  description text,
  created_at timestamptz,
  updated_at timestamptz
)

-- 팀 (Phase 2)
teams (
  id uuid PK,
  name text,
  created_at timestamptz
)

-- 팀 멤버 (Phase 2)
team_members (
  team_id uuid FK → teams,
  user_id uuid FK → users,
  role enum (admin, editor, viewer)
)

-- 프로젝트 템플릿
project_templates (
  id uuid PK,
  name text,
  description text,
  services jsonb,
  is_community boolean,
  author_id uuid FK → users,
  downloads_count integer
)
```

---

## 10. 리스크 및 대응 전략

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 서비스 가이드 콘텐츠 제작 비용 | 높음 | AI로 초안 생성 + 커뮤니티 기여 모델 |
| 환경변수 보안 사고 | 치명적 | AES-256 암호화, 감사 로그, SOC2 준비 |
| 서비스 API 변경 | 중간 | 커뮤니티 리포트 + 자동화된 문서 크롤링 |
| 바이브 코딩 트렌드 변화 | 중간 | 범용 개발자 도구로 확장 가능한 설계 |
| 경쟁사 진입 (Vercel, Supabase 등) | 높음 | 빠른 시장 점유 + 커뮤니티 락인 |

---

## 11. 로드맵

```
2026 Q1 (1-3월): MVP 개발 ← 현재 단계
  - 회원가입/로그인 (Supabase Auth + OAuth)
  - 프로젝트 CRUD + 대시보드
  - 서비스 카탈로그 (20개 서비스)
  - 서비스 연결 체크리스트 (한국어)
  - 환경변수 관리 (암호화, .env 다운로드)
  - 서비스 맵 시각화 (React Flow)
  - 프로젝트 템플릿 (5개)
  - 랜딩 페이지 (한국어)
  → 베타 출시 & 사용자 피드백 수집

2026 Q2 (4-6월): Phase 2
  - 팀 협업 (워크스페이스, 역할 관리)
  - 비용 추적
  - 커뮤니티 템플릿 공유
  - 서비스 카탈로그 확장 (50개)
  - 영어 지원 추가
  → 정식 출시 + Pro 요금제

2026 Q3-Q4 (7-12월): Phase 3
  - AI 어시스턴트
  - CLI 도구 (setlog pull/check)
  - IDE 확장 프로그램 (Cursor, VS Code)
  - MCP 서버 통합
  - 서비스 모니터링
  - 마이그레이션 가이드
  - 템플릿 마켓플레이스
  → Team/Enterprise 요금제
```

---

## 12. 검증 방법

### 구현 후 테스트
1. **회원가입/로그인 플로우**: 이메일, Google, GitHub OAuth 모두 정상 동작 확인
2. **프로젝트 CRUD**: 생성, 조회, 수정, 삭제 + 서비스 추가/제거
3. **체크리스트**: 진행도 저장, 새로고침 후 유지 확인
4. **환경변수**: 암호화 저장, 복호화 조회, .env 파일 다운로드
5. **RLS 정책**: 다른 사용자의 프로젝트/환경변수 접근 불가 확인
6. **반응형**: 모바일/태블릿/데스크톱 레이아웃 확인

### 사용자 테스트
- 바이브 코딩 초보자 5명에게 "Supabase 연결" 태스크 수행 요청
- 목표: 10분 내 체크리스트 완료 및 환경변수 설정
