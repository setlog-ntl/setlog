# GitHub 통합 계획 & 진행 추적

## 개요
GitHub **로그인 → 설정입력 → 자동연결** 3대 핵심 기능을 프로덕션 수준으로 완성.
자동+수동 동기화 모두 지원.

---

## 환경변수 설정

### 필수 환경변수
| 변수명 | 설명 | 필요 위치 |
|--------|------|----------|
| `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth App Client ID | `.env.local`, Vercel |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth App Client Secret | `.env.local`, Vercel |
| `ENCRYPTION_KEY` | AES-256-GCM 암호화 키 (64 hex) | `.env.local`, Vercel |

### GitHub OAuth App 생성 가이드
1. https://github.com/settings/developers → **New OAuth App**
2. **Application name**: `Linkmap`
3. **Homepage URL**: `https://linkmap.vercel.app`
4. **Authorization callback URL**: `https://linkmap.vercel.app/api/oauth/github/callback`
5. **Register application** 클릭
6. Client ID 복사 → `GITHUB_OAUTH_CLIENT_ID`
7. **Generate a new client secret** → `GITHUB_OAUTH_CLIENT_SECRET`
8. `.env.local`과 Vercel 환경변수에 모두 설정
9. Supabase Dashboard → Authentication → Providers → GitHub 활성화 (로그인용 별도)

---

## Phase 진행 체크리스트

### Phase 1: GitHub OAuth 로그인 완성
- [x] OAuth 스코프에 `workflow` 추가 (`authorize/route.ts`)
- [x] `service-connections.ts` 스코프 동기화
- [x] OAuth 콜백 리다이렉트 개선 (레포 선택 옵션)
- [ ] GitHub OAuth App 생성 → Client ID/Secret 획득
- [ ] `.env.local`에 환경변수 설정
- [ ] Supabase Auth GitHub Provider 활성화

### Phase 2: GitHub API 통합
- [x] `tweetnacl` + `tweetnacl-util` 의존성 추가
- [x] `src/lib/github/api.ts` — GitHub API 헬퍼 모듈
- [x] `src/app/api/github/repos/route.ts` — 레포 목록 API
- [x] `src/app/api/github/secrets/route.ts` — 시크릿 관리 API
- [x] `src/app/api/github/repos/link/route.ts` — 레포-프로젝트 연결 API
- [x] `supabase/migrations/013_project_github_repos.sql` — DB 마이그레이션
- [x] `src/lib/queries/github.ts` — TanStack Query 훅
- [x] `src/lib/queries/keys.ts` — `github` 네임스페이스 추가
- [x] `src/lib/validations/github.ts` — Zod 검증 스키마

### Phase 3: 대시보드 UI
- [x] `src/components/github/repo-selector.tsx` — 레포 선택 컴포넌트
- [x] `src/components/github/secrets-sync-panel.tsx` — 시크릿 동기화 패널
- [x] `src/app/project/[id]/env/page.tsx` — GitHub 동기화 버튼 추가
- [x] `src/app/project/[id]/settings/page.tsx` — GitHub 탭 추가

### Phase 4: 자동연결 워크플로우
- [x] `src/components/service-map/service-account-section.tsx` — 원클릭 연결 플로우
- [x] `src/lib/github/auto-map.ts` — 환경변수 자동 매핑
- [x] `src/app/api/env/route.ts` — 자동 동기화 트리거
- [x] `src/components/service-map/service-node.tsx` — 동기화 상태 표시

### Phase 5: 보안 검증
- [x] GitHub 토큰: AES-256-GCM 암호화 저장 (서버사이드 only)
- [x] GitHub Secrets 푸시: NaCl 암호화 (GitHub API 표준)
- [x] RLS: project_github_repos 소유자만 접근
- [x] Rate limiting: /api/github/* 전체 적용
- [x] Audit log: OAuth 연결, 시크릿 푸시, 레포 연결/해제 기록
- [x] CSRF: OAuth state token 10분 만료
- [x] Scope: `repo, read:org, read:user, workflow` 최소 권한

---

## 의존성 추가
- `tweetnacl` — NaCl 암호화 (GitHub Secrets API 요구)
- `tweetnacl-util` — NaCl 유틸리티 (encoding/decoding)

---

## 재사용 기존 코드
| 모듈 | 경로 | 용도 |
|------|------|------|
| AES-256-GCM | `src/lib/crypto/index.ts` | 토큰/시크릿 암호화 |
| Rate limiter | `src/lib/rate-limit.ts` | API 속도 제한 |
| Audit logger | `src/lib/audit.ts` | 감사 로그 |
| API errors | `src/lib/api/errors.ts` | 표준 에러 응답 |
| QueryKey factory | `src/lib/queries/keys.ts` | 캐시 키 관리 |
| Admin client | `src/lib/supabase/admin.ts` | RLS 우회 |

---

## 구현 완료 상태

### 빌드 & 테스트 결과
- TypeScript: `tsc --noEmit` — 통과
- Next.js Build: `next build` — 성공
- Tests: 16/16 통과 (vitest)

### 생성/수정된 파일 목록

**신규 파일 (12개)**:
| 파일 | 역할 |
|------|------|
| `docs/GITHUB_INTEGRATION_PLAN.md` | 진행 추적 문서 |
| `src/lib/github/api.ts` | GitHub REST API 헬퍼 |
| `src/lib/github/nacl-encrypt.ts` | NaCl sealed box 암호화 |
| `src/lib/github/auto-map.ts` | 환경변수 → Secrets 매핑 |
| `src/lib/github/auto-sync.ts` | 자동 동기화 트리거 |
| `src/lib/validations/github.ts` | Zod 검증 스키마 |
| `src/lib/queries/github.ts` | TanStack Query 훅 |
| `src/app/api/github/repos/route.ts` | 레포 목록 API |
| `src/app/api/github/repos/link/route.ts` | 레포 연결/해제 API |
| `src/app/api/github/secrets/route.ts` | 시크릿 CRUD API |
| `src/components/github/repo-selector.tsx` | 레포 선택 다이얼로그 |
| `src/components/github/secrets-sync-panel.tsx` | 동기화 패널 |
| `supabase/migrations/013_project_github_repos.sql` | 프로젝트-레포 연결 테이블 |

**수정된 파일 (9개)**:
| 파일 | 변경 내용 |
|------|----------|
| `src/app/api/oauth/[provider]/authorize/route.ts` | `workflow` 스코프 추가 |
| `src/app/api/oauth/[provider]/callback/route.ts` | 레포 선택 리다이렉트 |
| `src/data/service-connections.ts` | `workflow` 스코프 동기화 |
| `src/lib/queries/keys.ts` | `github` 네임스페이스 추가 |
| `src/lib/audit.ts` | GitHub 관련 감사 액션 추가 |
| `src/app/api/env/route.ts` | 자동 동기화 트리거 |
| `src/app/project/[id]/env/page.tsx` | GitHub 동기화 버튼/패널 |
| `src/app/project/[id]/settings/page.tsx` | GitHub 설정 카드 |
| `src/components/service-map/service-account-section.tsx` | 레포 연결 UI |
| `src/components/service-map/service-node.tsx` | 동기화 상태 아이콘 |

### 남은 수동 작업
- [ ] GitHub OAuth App 생성 (github.com/settings/developers)
- [ ] `.env.local`에 `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET` 설정
- [ ] Vercel 환경변수에 동일 값 설정
- [ ] Supabase에 `013_project_github_repos.sql` 마이그레이션 실행
- [ ] E2E 테스트: OAuth → 레포 연결 → 시크릿 동기화 플로우
