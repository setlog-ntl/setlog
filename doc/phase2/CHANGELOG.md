# Phase 2 CHANGELOG

## 신규 파일

### Health Check 엔진
- `src/lib/health-check/types.ts` - HealthCheckAdapter, HealthCheckResult, HealthCheckStatus
- `src/lib/health-check/index.ts` - runHealthCheck() 함수 (복호화→어댑터→메모리정리)
- `src/lib/health-check/registry.ts` - 어댑터 레지스트리 + generic fallback

### 어댑터 (8개 + generic)
- `adapters/openai.ts` - OpenAI API 키 검증
- `adapters/anthropic.ts` - Anthropic API 키 검증
- `adapters/stripe.ts` - Stripe Secret Key 검증
- `adapters/supabase.ts` - Supabase URL + Anon Key 검증
- `adapters/clerk.ts` - Clerk Secret Key 검증
- `adapters/resend.ts` - Resend API Key 검증
- `adapters/vercel.ts` - Vercel Token 검증
- `adapters/sentry.ts` - Sentry DSN 형식 검증
- `adapters/generic.ts` - env var 존재 여부 폴백 (다른 모든 서비스)

### API
- `src/app/api/health-check/route.ts` - POST(실행) + GET(이력) 엔드포인트

### DB
- `supabase/migrations/008_health_checks.sql` - health_checks 테이블 + RLS

### 훅/타입/검증
- `src/lib/queries/health-checks.ts` - useHealthChecks, useRunHealthCheck
- `src/lib/validations/health-check.ts` - Zod 스키마

## 수정 파일
- `src/types/index.ts` - HealthCheckStatus, HealthCheck 타입 추가
- `src/lib/queries/keys.ts` - healthChecks 쿼리키 추가
- `src/lib/audit.ts` - 'service.health_check', 'env_var.bulk_create' 액션 추가
