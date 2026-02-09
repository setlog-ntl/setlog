# SetLog Project Instructions

## Project Overview
- **SetLog**: 프로젝트에 연결된 외부 서비스(API, DB, 결제 등)의 연결 정보를 시각화하고, API 키·환경변수·등록 ID를 안전하게 관리하는 설정 관리 플랫폼
- **Stack**: Next.js 16 (App Router) + Supabase + TypeScript + Tailwind CSS + shadcn/ui
- **Deploy**: https://setlog-three.vercel.app

## Key Decisions
- Korean-first UI, global expansion later
- AES-256-GCM encryption for env vars (key validation: 64 hex chars)
- React Flow (@xyflow/react) for service map visualization
- Supabase Auth with Google/GitHub OAuth
- TanStack Query for client-side data fetching
- Zustand for lightweight client state
- Zod v4 for API input validation
- next-themes for dark mode

## Important Patterns
- Server components with `export const dynamic = 'force-dynamic'` for pages using Supabase server client
- Seed data in TypeScript files (`src/data/services.ts`, `src/data/templates.ts`) with fixed UUIDs
- API routes handle encryption/decryption for env vars
- RLS policies: users can only access their own projects/data
- QueryKey factory pattern in `src/lib/queries/keys.ts`
- Standardized API errors via `src/lib/api/errors.ts`
- Rate limiting via in-memory limiter (`src/lib/rate-limit.ts`)
- Audit logging for sensitive operations (`src/lib/audit.ts`)
- React Flow loaded via `next/dynamic` with `ssr: false` for performance
- i18n via Zustand locale-store + t() function (header, dashboard)
- Quota enforcement on project creation (`src/lib/quota.ts`)
- Next.js instrumentation for error tracking (`src/instrumentation.ts`)

## Build Notes
- Next.js 16.1.6 shows "middleware deprecated" warning - will need to migrate to "proxy" convention
- shadcn/ui v4 uses `sonner` instead of deprecated `toast`
- Vitest + Testing Library for unit tests (16 tests passing)
- CI/CD via `.github/workflows/ci.yml` (lint, typecheck, test, build)

## Testing Notes
- Mock chaining with Supabase: use `mockResolvedValue` (not `Once`) for fetch tests due to React re-renders
- Re-establish mock chains in `beforeEach` after `clearAllMocks`

## File Structure
```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Login, signup, reset-password
│   ├── (dashboard)/  # Protected dashboard
│   ├── project/[id]/ # Project pages (overview, services, env, map, settings)
│   ├── services/     # Service catalog
│   ├── pricing/      # Pricing page
│   ├── settings/     # User settings (tokens)
│   └── api/          # API routes (env, projects, teams, tokens, stripe)
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── layout/       # Header, Footer
│   ├── project/      # Project-related components
│   ├── service/      # Service catalog components
│   └── service-map/  # React Flow nodes and map
├── lib/
│   ├── api/          # API error helpers
│   ├── crypto/       # AES-256-GCM encryption
│   ├── i18n/         # Internationalization (ko, en)
│   ├── queries/      # TanStack Query hooks
│   ├── supabase/     # Supabase client/server/middleware
│   └── validations/  # Zod schemas
├── stores/           # Zustand stores (ui-store, project-store, locale-store)
├── types/            # TypeScript interfaces
└── data/             # Seed data (services, templates)

packages/
├── mcp-server/       # MCP server for Claude Code/Cursor
└── cli/              # CLI tool for env management

supabase/migrations/
├── 001_initial_schema.sql  # Full DB schema with RLS
├── 003_audit_log.sql       # Audit logging
├── 004_subscriptions.sql   # Stripe subscriptions
├── 005_teams.sql           # Team collaboration RBAC
└── 006_api_tokens.sql      # API tokens for MCP/CLI
```

## Roadmap Progress (고도화 로드맵)
- [x] 단계 1: 기반 품질 강화 (테스트, Error Boundary, next.config)
- [x] 단계 2: 아키텍처 현대화 (TanStack Query, Zustand, Zod)
- [x] 단계 3: 보안 강화 (Rate Limiting, 감사 로그, 암호화)
- [x] 단계 4: UX 고도화 (카탈로그, 서비스 맵, 다크모드)
- [x] 단계 5: 비즈니스 기능 (Stripe, 팀 RBAC, i18n)
- [x] 단계 6: 관찰 가능성 (구조화 로깅, 성능 최적화)
- [x] 단계 7: 플랫폼 확장 (MCP 서버, CLI, 문서화)
- **전체 19개 스프린트 완료** | 목표 점수: 9.5/10
