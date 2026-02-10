# Phase 1 → Phase 2 인수인계

## Phase 2에서 사용할 항목

### 훅
- `useDecryptEnvVar()` → `src/lib/queries/env-vars.ts`
  - `POST /api/env/decrypt` 호출하여 env var 복호화
  - Phase 2에서 health check 시 서버사이드에서 직접 `decrypt()` 호출하므로 이 훅은 참조 패턴만 제공

### 쿼리키 패턴
- `queryKeys.auditLogs.byProject(projectId)` → `src/lib/queries/keys.ts`
  - Phase 2에서 `healthChecks` 쿼리키 추가 시 동일 패턴 적용
  - 예: `healthChecks: { byProjectService: (psId: string) => ['health-checks', psId] as const }`

### 감사 로그
- `logAudit()` 함수 → `src/lib/audit.ts`
  - 현재 AuditAction 타입: `env_var.*`, `project.*`, `connection.*`
  - Phase 2에서 `'service.health_check'` 액션 추가 필요
- `actionConfig` 객체 (감사 로그 뷰어) → `src/app/project/[id]/audit/page.tsx`
  - Phase 2에서 `'service.health_check'` 설정 이미 추가됨

### 컴포넌트 재활용
- 감사 로그 타임라인 패턴 → Phase 3에서 health check 이력 타임라인에 참조 가능

## Phase 2 시작 전 체크리스트
- [ ] `src/lib/queries/env-vars.ts`의 `useDecryptEnvVar`, `useUpdateEnvVar` 훅 확인
- [ ] `src/lib/queries/keys.ts`의 `auditLogs` 쿼리키 확인
- [ ] `src/lib/audit.ts`의 `logAudit` 함수 및 AuditAction 타입 확인
- [ ] `src/app/project/[id]/audit/page.tsx`의 `actionConfig`에 `service.health_check` 이미 포함 확인

## 파일 경로 요약
```
수정된 파일:
  src/app/project/[id]/env/page.tsx          -- env var 페이지 (복호화, 편집, 서비스 뱃지)
  src/lib/queries/env-vars.ts                -- useDecryptEnvVar, useUpdateEnvVar 추가
  src/lib/queries/keys.ts                    -- auditLogs 쿼리키 추가
  src/components/project/project-tabs.tsx     -- 감사 로그 탭 추가

신규 파일:
  src/app/project/[id]/audit/page.tsx        -- 감사 로그 뷰어
  src/lib/queries/audit-logs.ts              -- useAuditLogs 훅
```
