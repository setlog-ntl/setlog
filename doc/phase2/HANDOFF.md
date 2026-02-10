# Phase 2 → Phase 3 인수인계

## Phase 3에서 사용할 항목

### 훅
- `useHealthChecks(projectServiceId)` → `src/lib/queries/health-checks.ts`
  - project_service 별 최근 20건 이력 조회
- `useRunHealthCheck()` → `src/lib/queries/health-checks.ts`
  - mutation: `{ project_service_id, environment? }` → HealthCheck 반환
  - onSuccess에서 healthChecks + services 쿼리 무효화

### 타입
- `HealthCheck` → `src/types/index.ts`
  - id, project_service_id, environment, status, message, response_time_ms, details, checked_at
- `HealthCheckStatus` → `src/types/index.ts`
  - 'healthy' | 'unhealthy' | 'degraded' | 'unknown'

### API
- `POST /api/health-check` → 검증 실행 (5회/분 rate limit)
  - Request: `{ project_service_id: string, environment?: string }`
  - Response: HealthCheck 객체
  - 부수 효과: project_services.status 갱신 (healthy→connected, unhealthy→error)
- `GET /api/health-check?project_service_id=...` → 이력 조회

### DB
- `health_checks` 테이블 → `supabase/migrations/008_health_checks.sql`
  - project_service_id FK, environment, status, message, response_time_ms, details, checked_at

### 쿼리키
- `queryKeys.healthChecks.byProjectService(psId)` → `src/lib/queries/keys.ts`

## Phase 3 시작 전 체크리스트
- [ ] 008 마이그레이션 적용 확인
- [ ] `useHealthChecks`, `useRunHealthCheck` 훅 import 확인
- [ ] `HealthCheck`, `HealthCheckStatus` 타입 확인
- [ ] health check API가 project_services.status를 갱신하는 것 확인

## 컴포넌트 재활용
- Phase 3에서 health check 결과를 표시할 때 `HealthCheckStatus` → 색상 매핑 필요
  - healthy → green, degraded → yellow, unhealthy → red, unknown → gray
