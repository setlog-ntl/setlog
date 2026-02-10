# Phase 1: 기반 UX 개선 + 감사 로그 뷰어

## 목적
"쉽게 확인·변경" + "진행상태 로그 확인"의 기반 마련

## 기능 요구사항

### 1-1. Env Var 값 표시 버그 수정
- **문제**: `encrypted_value.substring(0,50)`으로 암호문 hex가 그대로 노출
- **해결**: `POST /api/env/decrypt` 호출하여 복호화 값 표시
- **훅**: `useDecryptEnvVar(projectId)` → `src/lib/queries/env-vars.ts`
- **수정**: `src/app/project/[id]/env/page.tsx`

### 1-2. 인라인 편집 기능
- 각 env var 행에 편집(연필) 아이콘
- 클릭 시 편집 다이얼로그 (key_name, value, description, is_secret)
- `PATCH /api/env` 활용 (이미 부분 업데이트 지원)
- **훅**: `useUpdateEnvVar(projectId)` → `src/lib/queries/env-vars.ts`

### 1-3. 서비스 연관 뱃지 표시
- env var의 `service_id` FK로 서비스명 뱃지 표시
- `useProjectServices` 훅 데이터 재활용

### 1-4. 감사 로그 뷰어 UI
- **페이지**: `src/app/project/[id]/audit/page.tsx`
- **훅**: `src/lib/queries/audit-logs.ts`
- **쿼리키**: `auditLogs` 추가
- **탭**: project-tabs.tsx에 "감사 로그" 탭
- 타임라인 형태, 필터(액션 타입, 날짜 범위)
- DB 변경 없음 (audit_logs 테이블+RLS 이미 존재)

## 수정/생성 파일 목록
- 수정: `env/page.tsx`, `env-vars.ts`, `keys.ts`, `project-tabs.tsx`
- 신규: `audit/page.tsx`, `audit-logs.ts`
