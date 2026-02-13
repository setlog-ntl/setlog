# 원클릭 홈페이지 배포 — 기술 문서

## 개요

사용자가 **GitHub 연결 → 템플릿 선택 → 자동 배포** 3단계만으로 개인 홈페이지를 생성하고 라이브 URL을 받는 기능.

- **라우트**: `/oneclick`
- **API prefix**: `/api/oneclick/*`
- **DB 마이그레이션**: `supabase/migrations/014_homepage_deploys.sql`

---

## 1. 시스템 아키텍처

```
┌───────────── Frontend (React, Client Component) ─────────────┐
│                                                               │
│  OneclickWizardClient                                         │
│  ├─ Step 1: GitHubConnectStep   (GitHub OAuth 확인)           │
│  ├─ Step 2: TemplatePickerStep  (템플릿 + 사이트명 + Vercel)  │
│  └─ Step 3: DeployStep          (진행 상황 + 결과)            │
│                                                               │
└──────┬──────────┬──────────┬──────────┬───────────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
  github-check  templates    fork     deploy     status
  (GET)         (GET)       (POST)   (POST)     (GET, polling)
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
┌───────────────── Linkmap API Layer (Next.js) ────────────────┐
│                                                               │
│  Supabase (DB, Auth, RLS)                                     │
│  GitHub REST API  (Fork)                                      │
│  Vercel REST API  (Project 생성, 배포, 상태 확인)              │
│  AES-256-GCM      (토큰 암호화)                               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 2. API 엔드포인트

### 2.1 `GET /api/oneclick/github-check`

사용자의 GitHub OAuth 연결 상태를 확인한다.

| 항목 | 값 |
|------|-----|
| 파일 | `src/app/api/oneclick/github-check/route.ts` |
| 인증 | 필수 (`supabase.auth.getUser()`) |
| Rate Limit | 30/min |

**처리 흐름:**
1. `services` 테이블에서 `slug='github'`인 서비스 ID 조회
2. `service_accounts`에서 해당 user + service + `connection_type='oauth'` + `status='active'` 검색
3. `oauth_metadata.login`을 `provider_account_id`로 반환

**응답:**
```json
{
  "account": {
    "id": "uuid",
    "provider_account_id": "github-username",
    "status": "active"
  }
}
```
연결되지 않은 경우 `{ "account": null }`.

---

### 2.2 `GET /api/oneclick/templates`

활성화된 홈페이지 템플릿 목록을 반환한다.

| 항목 | 값 |
|------|-----|
| 파일 | `src/app/api/oneclick/templates/route.ts` |
| 인증 | 필수 |
| Rate Limit | 30/min |

**처리 흐름:**
1. `homepage_templates` 테이블에서 `is_active=true` 조회
2. `display_order` 오름차순 정렬

**응답:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "slug": "homepage-minimal",
      "name": "Minimal Portfolio",
      "name_ko": "미니멀 포트폴리오",
      "description": "...",
      "description_ko": "...",
      "framework": "nextjs",
      "required_env_vars": [
        { "key": "NEXT_PUBLIC_SITE_NAME", "description": "사이트 이름", "required": true }
      ],
      "tags": ["portfolio", "minimal"],
      "is_premium": false
    }
  ]
}
```

---

### 2.3 `POST /api/oneclick/fork`

GitHub 템플릿 레포를 Fork하고, Linkmap 프로젝트를 생성하는 핵심 오케스트레이션 엔드포인트.

| 항목 | 값 |
|------|-----|
| 파일 | `src/app/api/oneclick/fork/route.ts` |
| 인증 | 필수 |
| Rate Limit | 5/5min |

**요청 바디:**
```json
{
  "template_id": "uuid",
  "site_name": "my-portfolio",
  "github_service_account_id": "uuid (선택)"
}
```

**처리 흐름 (순서 중요):**

```
1. Quota 확인
   └─ checkHomepageDeployQuota(userId)
   └─ 초과 시 403 반환 + 업그레이드 안내

2. 템플릿 조회
   └─ homepage_templates WHERE id=? AND is_active=true
   └─ 없으면 404

3. GitHub 계정 조회
   └─ services WHERE slug='github' → service_id
   └─ service_accounts WHERE user_id + service_id + oauth + active
   └─ 토큰 복호화: decrypt(encrypted_access_token)
   └─ 없으면 404 "GitHub 계정이 연결되어 있지 않습니다"

4. Linkmap 프로젝트 생성
   └─ projects INSERT { user_id, name: site_name, description }

5. GitHub Fork API 호출
   └─ POST /repos/{template_owner}/{template_repo}/forks
   └─ body: { name: site_name, default_branch_only: true }
   └─ 실패 시: 프로젝트 삭제(롤백) + 에러 반환
   └─ 422 → "이름이 이미 존재합니다" (409)

6. 레포 연결
   └─ project_github_repos INSERT

7. 배포 레코드 생성
   └─ homepage_deploys INSERT { fork_status: 'forked' }

8. 서비스 자동 연결
   └─ project_services INSERT (GitHub + Vercel)

9. 감사 로그
   └─ audit: 'oneclick.fork'
```

**응답 (201):**
```json
{
  "deploy_id": "uuid",
  "project_id": "uuid",
  "forked_repo": "user/my-portfolio",
  "forked_repo_url": "https://github.com/user/my-portfolio"
}
```

**에러 코드:**
| 코드 | 상황 |
|------|------|
| 400 | Zod 유효성 검증 실패 |
| 403 | Quota 초과 |
| 404 | 템플릿/GitHub 계정 없음 |
| 409 | GitHub 레포 이름 충돌 |
| 429 | Rate limit 초과 |
| 502 | GitHub API 오류 |

---

### 2.4 `POST /api/oneclick/deploy`

Fork된 레포를 Vercel에 배포한다.

| 항목 | 값 |
|------|-----|
| 파일 | `src/app/api/oneclick/deploy/route.ts` |
| 인증 | 필수 |
| Rate Limit | 5/5min |

**요청 바디:**
```json
{
  "deploy_id": "uuid",
  "vercel_token": "사용자의 Vercel Personal Access Token",
  "env_vars": { "NEXT_PUBLIC_SITE_NAME": "내 사이트" }
}
```

**처리 흐름:**

```
1. 배포 레코드 확인
   └─ homepage_deploys WHERE id=? AND user_id=?
   └─ fork_status='forked' 확인
   └─ deploy_status='pending' 확인 (중복 배포 방지)

2. Vercel 토큰 검증
   └─ GET /v2/user (verifyVercelToken)
   └─ 유효하지 않으면 401

3. 상태 업데이트
   └─ deploy_status → 'creating'

4. Vercel 토큰 암호화 저장
   └─ encrypt(vercel_token) → service_accounts UPSERT
   └─ connection_type: 'api_key'

5. Vercel 프로젝트 생성
   └─ POST /v13/projects
   └─ body: { name, gitRepository: { type: 'github', repo: 'user/repo' }, framework }
   └─ GitHub 연결 시 Vercel이 자동으로 첫 배포를 트리거함
   └─ 실패 시: deploy_status → 'error' + 에러 메시지 저장

6. 환경변수 설정 (선택, 비차단)
   └─ POST /v10/projects/{id}/env
   └─ target: ['production', 'preview', 'development']
   └─ 실패해도 배포는 계속 진행

7. 첫 배포 확인 (3초 대기 후)
   └─ GET /v6/deployments?projectId={id}&limit=1
   └─ 있으면 deployment_id, deployment_url 저장

8. 배포 레코드 업데이트
   └─ vercel_project_id, vercel_project_url, deployment_id
   └─ deploy_status → 'building' 또는 'creating'

9. 감사 로그
   └─ audit: 'oneclick.deploy'
```

**응답:**
```json
{
  "deployment_url": "https://my-portfolio-abc123.vercel.app",
  "vercel_project_url": "https://vercel.com/username/my-portfolio",
  "vercel_project_id": "prj_xxx",
  "deployment_id": "dpl_xxx"
}
```

---

### 2.5 `GET /api/oneclick/status?deploy_id=X`

배포 상태를 폴링한다. 클라이언트에서 3초 간격으로 호출.

| 항목 | 값 |
|------|-----|
| 파일 | `src/app/api/oneclick/status/route.ts` |
| 인증 | 필수 |
| Rate Limit | 60/min |

**처리 흐름:**

```
1. 배포 레코드 조회
   └─ homepage_deploys WHERE id=? AND user_id=?

2. Vercel 상태 갱신 (deploy_status가 ready/error가 아닌 경우)
   └─ service_accounts에서 Vercel 토큰 복호화
   └─ deployment_id가 있으면: GET /v13/deployments/{id}
   └─ deployment_id가 없으면: GET /v6/deployments?projectId={id}&limit=1
   └─ Vercel 상태 매핑:
      READY → 'ready'
      ERROR → 'error'
      CANCELED → 'canceled'
      BUILDING/INITIALIZING/QUEUED → 'building'
   └─ 상태 변경 시 DB 업데이트
   └─ 'ready' 시: deployed_at 기록 + audit 'oneclick.deploy_success'
   └─ 'error' 시: audit 'oneclick.deploy_error'

3. 단계 진행 상태 계산 (buildSteps)
```

**응답:**
```json
{
  "deploy_id": "uuid",
  "fork_status": "forked",
  "deploy_status": "building",
  "deployment_url": "https://...",
  "deploy_error": null,
  "vercel_project_url": "https://vercel.com/...",
  "forked_repo_url": "https://github.com/...",
  "steps": [
    { "name": "fork",    "status": "completed",   "label": "레포지토리 복사" },
    { "name": "project", "status": "completed",   "label": "Vercel 프로젝트 생성" },
    { "name": "build",   "status": "in_progress", "label": "빌드 중..." },
    { "name": "deploy",  "status": "pending",     "label": "배포 완료" }
  ]
}
```

**폴링 종료 조건 (클라이언트):**
`deploy_status`가 `ready`, `error`, `canceled` 중 하나일 때 polling 중지.

---

## 3. 데이터베이스

### 3.1 homepage_templates

시스템 관리 템플릿 카탈로그.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| slug | TEXT UNIQUE | `homepage-minimal` |
| name / name_ko | TEXT | 영문/한국어 이름 |
| description / description_ko | TEXT | 영문/한국어 설명 |
| preview_image_url | TEXT | 미리보기 이미지 (v2) |
| github_owner | TEXT | `linkmap-templates` |
| github_repo | TEXT | `homepage-minimal` |
| default_branch | TEXT | `main` |
| framework | TEXT | `nextjs` |
| required_env_vars | JSONB | `[{ key, description, required }]` |
| tags | TEXT[] | `['portfolio', 'minimal']` |
| is_premium | BOOLEAN | Pro 전용 여부 |
| is_active | BOOLEAN | 활성 여부 |
| display_order | INT | 정렬 순서 |

**RLS**: 인증된 사용자만 SELECT 가능.

### 3.2 homepage_deploys

사용자 배포 추적.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| user_id | UUID FK → auth.users | |
| project_id | UUID FK → projects | Linkmap 프로젝트 |
| template_id | UUID FK → homepage_templates | |
| forked_repo_full_name | TEXT | `user/my-portfolio` |
| forked_repo_url | TEXT | GitHub URL |
| fork_status | TEXT | `pending → forking → forked → failed` |
| vercel_project_id | TEXT | Vercel 프로젝트 ID |
| vercel_project_url | TEXT | Vercel 대시보드 URL |
| deployment_id | TEXT | Vercel 배포 ID |
| deployment_url | TEXT | 라이브 사이트 URL |
| deploy_status | TEXT | `pending → creating → building → ready / error / canceled` |
| deploy_error_message | TEXT | 에러 상세 |
| site_name | TEXT | 사이트 이름 |
| config_data | JSONB | 추가 설정 |
| deployed_at | TIMESTAMPTZ | 배포 완료 시각 |

**RLS**: 본인 레코드만 ALL 가능.

### 3.3 plan_quotas 확장

| plan | max_homepage_deploys |
|------|---------------------|
| free | 1 |
| pro | 10 |
| team | 50 |

---

## 4. 상태 머신

### Fork 상태
```
pending → forking → forked
                  → failed
```

### Deploy 상태
```
pending → creating → building → ready
                             → error
                             → canceled
```

### 단계 표시 매핑

| fork_status | deploy_status | Step 1 (Fork) | Step 2 (Project) | Step 3 (Build) | Step 4 (Deploy) |
|-------------|--------------|----------------|-------------------|----------------|-----------------|
| pending | pending | pending | pending | pending | pending |
| forking | pending | in_progress | pending | pending | pending |
| forked | pending | completed | pending | pending | pending |
| forked | creating | completed | in_progress | pending | pending |
| forked | building | completed | completed | in_progress | pending |
| forked | ready | completed | completed | completed | completed |
| forked | error | completed | completed | error | error |
| failed | * | error | pending | pending | pending |

---

## 5. 보안

| 영역 | 구현 |
|------|------|
| 인증 | 모든 API에 `supabase.auth.getUser()` 필수 |
| Rate Limit | fork/deploy: 5/5min, status: 60/min, templates: 30/min |
| 토큰 암호화 | Vercel 토큰 → AES-256-GCM 암호화 → `service_accounts.encrypted_api_key` |
| GitHub 토큰 | OAuth 콜백에서 암호화 저장, 사용 시 서버사이드에서만 복호화 |
| RLS | `homepage_deploys` — `user_id = auth.uid()` |
| Audit | `oneclick.fork`, `oneclick.deploy`, `oneclick.deploy_success`, `oneclick.deploy_error` |
| 입력 검증 | Zod: site_name `^[a-z0-9][a-z0-9-]*[a-z0-9]$`, UUID 검증 |
| 템플릿 제한 | `linkmap-templates` org 화이트리스트만 허용 (임의 URL fork 불가) |

---

## 6. 프론트엔드 컴포넌트 구조

```
src/app/oneclick/page.tsx                          (Server Component)
  └─ OneclickPageClient                            (Client, dynamic ssr:false)
       └─ OneclickWizardClient                     (Client, 상태 관리)
            ├─ GitHubConnectStep                   (Step 1)
            │    └─ 연결됨: 아바타 + 이름 표시
            │    └─ 미연결: /api/oauth/github/authorize 로 리다이렉트
            │
            ├─ TemplatePickerStep                  (Step 2)
            │    ├─ TemplateCard grid (선택)
            │    ├─ SiteName input (정규식 검증)
            │    └─ VercelToken input (password)
            │
            └─ DeployStep                          (Step 3)
                 ├─ Progress bar + step icons
                 ├─ 성공: 라이브 URL, GitHub, Vercel, 프로젝트 링크
                 └─ UpsellBanner (Free 플랜 시)
```

---

## 7. TanStack Query 훅

| 훅 | 파일 | 캐시/폴링 |
|----|------|-----------|
| `useHomepageTemplates()` | `src/lib/queries/oneclick.ts` | staleTime: 5분 |
| `useForkTemplate()` | 상동 | mutation |
| `useDeployToVercel()` | 상동 | mutation |
| `useDeployStatus(deployId)` | 상동 | refetchInterval: 3초, 터미널 상태에서 중지 |

Query Key:
```typescript
oneclick: {
  templates: ['oneclick', 'templates'],
  status: (deployId) => ['oneclick', 'status', deployId],
}
```

---

## 8. 전체 실행 시퀀스 다이어그램

```
사용자                  Frontend              Fork API         GitHub API     Deploy API      Vercel API       Status API
  │                       │                     │                  │              │                │                │
  ├─ "GitHub 연결" 클릭 ──►│                     │                  │              │                │                │
  │                       ├─ github-check ──────►│                  │              │                │                │
  │                       │◄─ account info ──────┤                  │              │                │                │
  │                       │                     │                  │              │                │                │
  ├─ 템플릿 선택 ──────────►│                     │                  │              │                │                │
  ├─ 사이트명 입력 ─────────►│                     │                  │              │                │                │
  ├─ Vercel 토큰 입력 ─────►│                     │                  │              │                │                │
  ├─ "배포 시작" 클릭 ──────►│                     │                  │              │                │                │
  │                       │                     │                  │              │                │                │
  │                       ├─ POST /fork ────────►│                  │              │                │                │
  │                       │                     ├─ quota check     │              │                │                │
  │                       │                     ├─ create project  │              │                │                │
  │                       │                     ├─ POST /forks ───►│              │                │                │
  │                       │                     │◄─ fork result ───┤              │                │                │
  │                       │                     ├─ link repo       │              │                │                │
  │                       │                     ├─ create deploy   │              │                │                │
  │                       │◄─ { deploy_id } ────┤                  │              │                │                │
  │                       │                     │                  │              │                │                │
  │                       ├─ POST /deploy ──────┼──────────────────┼─────────────►│                │                │
  │                       │                     │                  │              ├─ verify token ─►│                │
  │                       │                     │                  │              ├─ create proj ──►│                │
  │                       │                     │                  │              │◄─ project ──────┤                │
  │                       │                     │                  │              ├─ set env vars ─►│                │
  │                       │                     │                  │              ├─ list deploys ─►│                │
  │                       │◄─ { deployment } ───┼──────────────────┼──────────────┤                │                │
  │                       │                     │                  │              │                │                │
  │                       ├─ GET /status (3초) ─►│──────────────────┼──────────────┼────────────────┼───────────────►│
  │                       │                     │                  │              │                │  get deployment │
  │                       │◄─ { steps, url } ───┼──────────────────┼──────────────┼────────────────┼◄───────────────┤
  │                       │  (반복, ready까지)   │                  │              │                │                │
  │                       │                     │                  │              │                │                │
  │◄─ "배포 완료!" ────────┤                     │                  │              │                │                │
  │◄─ 라이브 URL ──────────┤                     │                  │              │                │                │
```

---

## 9. 시드 데이터

`src/data/homepage-templates.ts`에 2개 템플릿 정의:

| 템플릿 | slug | 스택 | 필수 env vars |
|--------|------|------|---------------|
| 미니멀 포트폴리오 | `homepage-minimal` | Next.js + Tailwind | NEXT_PUBLIC_SITE_NAME |
| 링크 모음 | `homepage-links` | Next.js + Tailwind | NEXT_PUBLIC_SITE_NAME |

GitHub Organization: `linkmap-templates`

---

## 10. 파일 목록

| 분류 | 파일 경로 |
|------|----------|
| **DB** | `supabase/migrations/014_homepage_deploys.sql` |
| **API** | `src/app/api/oneclick/templates/route.ts` |
| | `src/app/api/oneclick/fork/route.ts` |
| | `src/app/api/oneclick/deploy/route.ts` |
| | `src/app/api/oneclick/status/route.ts` |
| | `src/app/api/oneclick/github-check/route.ts` |
| **Lib** | `src/lib/vercel/api.ts` |
| | `src/lib/validations/oneclick.ts` |
| | `src/lib/queries/oneclick.ts` |
| **Data** | `src/data/homepage-templates.ts` |
| **Page** | `src/app/oneclick/page.tsx` |
| **UI** | `src/components/oneclick/oneclick-page-client.tsx` |
| | `src/components/oneclick/wizard-client.tsx` |
| | `src/components/oneclick/github-connect-step.tsx` |
| | `src/components/oneclick/template-picker-step.tsx` |
| | `src/components/oneclick/deploy-step.tsx` |
| **수정** | `src/lib/quota.ts` (checkHomepageDeployQuota 추가) |
| | `src/lib/audit.ts` (oneclick 액션 4종 추가) |
| | `src/lib/queries/keys.ts` (oneclick 키 추가) |
| | `src/lib/github/api.ts` (forkRepo 추가) |
| | `src/components/layout/header.tsx` (네비 링크 추가) |
| | `src/components/landing/hero-section.tsx` (CTA 버튼 변경) |
| | `src/lib/i18n/locales/ko.json` (nav.oneclick, landing.ctaOneclick) |
| | `src/lib/i18n/locales/en.json` (nav.oneclick, landing.ctaOneclick) |

---

## 11. 알려진 제약 / TODO

1. **GitHub OAuth가 프로젝트 기반**: 기존 OAuth 플로우(`/api/oauth/github/authorize`)는 `project_id`가 필수. 원클릭 위저드에서는 프로젝트 생성 전에 GitHub 연결을 확인하므로, 사용자가 **이미 다른 프로젝트에서 GitHub를 연결**한 상태여야 함. 프로젝트 없이 독립 GitHub OAuth를 지원하려면 authorize 라우트 수정 필요.
2. **Vercel 토큰 직접 입력**: MVP에서는 사용자가 Vercel PAT를 직접 입력. v2에서 Vercel OAuth 통합 예정.
3. **템플릿 레포 필요**: `linkmap-templates` GitHub Organization에 실제 레포(`homepage-minimal`, `homepage-links`)가 존재해야 Fork 동작.
4. **`GITHUB_OAUTH_CLIENT_ID` 환경변수**: `.env.local`에 설정 필요 (GitHub OAuth App 생성 후).
