# Phase 2: 서비스 연결 검증 시스템

## 목적
연결된 서비스가 제대로 동작하는지 자동 검증

## 아키텍처
```
src/lib/health-check/
  types.ts           -- HealthCheckAdapter, HealthCheckResult 인터페이스
  index.ts           -- runHealthCheck() 엔진 (복호화 → 어댑터 실행 → 메모리 정리)
  registry.ts        -- slug → adapter 매핑, generic fallback
  adapters/
    openai.ts        -- GET /v1/models (Bearer token)
    anthropic.ts     -- GET /v1/models (x-api-key)
    stripe.ts        -- GET /v1/balance (Bearer token)
    supabase.ts      -- GET /rest/v1/ (apikey header)
    clerk.ts         -- GET /v1/users?limit=1 (Bearer token)
    resend.ts        -- GET /api/domains (Bearer token)
    vercel.ts        -- GET /v9/projects (Bearer token)
    sentry.ts        -- DSN 형식 검증 (regex)
    generic.ts       -- env var 존재 여부 폴백
```

## API
- `POST /api/health-check` - 검증 실행 (5회/분 rate limit)
- `GET /api/health-check?project_service_id=...` - 이력 조회 (최근 20건)

## DB
- `health_checks` 테이블 (migration 008)
- RLS: 프로젝트 소유자만 조회, service role만 삽입
