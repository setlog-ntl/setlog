# Phase 1 CHANGELOG

## 변경 내역

### 1-1. Env Var 값 표시 버그 수정
- **수정**: `src/app/project/[id]/env/page.tsx`
  - `encrypted_value.substring(0,50)` → `POST /api/env/decrypt` 호출로 실제 복호화 값 표시
  - 복호화된 값은 `decryptedValues` 상태에 캐시, 숨기기 시 즉시 삭제
- **신규 훅**: `useDecryptEnvVar()` → `src/lib/queries/env-vars.ts`
  - `POST /api/env/decrypt` API를 호출하는 mutation 훅

### 1-2. 인라인 편집 기능
- **수정**: `src/app/project/[id]/env/page.tsx`
  - 각 행에 편집(연필) 아이콘 추가
  - 클릭 시 편집 다이얼로그: key_name, value(복호화 상태), description, is_secret 수정
  - 저장 시 `PATCH /api/env` 호출, 캐시 무효화
- **신규 훅**: `useUpdateEnvVar(projectId)` → `src/lib/queries/env-vars.ts`

### 1-3. 서비스 연관 뱃지 표시
- **수정**: `src/app/project/[id]/env/page.tsx`
  - `useProjectServices` 훅으로 서비스 데이터 로드
  - `service_id` → 서비스명 매핑하여 outline 뱃지 표시

### 1-4. 감사 로그 뷰어 UI
- **신규**: `src/app/project/[id]/audit/page.tsx`
  - 타임라인 형태: 액션 아이콘, 라벨, 리소스 타입, 상대 시간
  - 상세 JSON 토글(펼침/접기)
  - 액션 타입 필터 (전체/환경변수/프로젝트/연결)
- **신규**: `src/lib/queries/audit-logs.ts`
  - `useAuditLogs(projectId, filters?)` 훅
  - `AuditLog` 인터페이스 정의
- **수정**: `src/lib/queries/keys.ts` - `auditLogs` 쿼리키 추가
- **수정**: `src/components/project/project-tabs.tsx` - "감사 로그" 탭 추가 (ScrollText 아이콘)

## 스펙 대비 차이
- 날짜 범위 필터는 구현하지 않음 (현재 최근 100건 표시로 충분)
- 감사 로그는 현재 사용자의 모든 로그를 표시 (프로젝트별 필터는 audit_logs 테이블에 project_id 컬럼이 없어 적용 불가 — resource_id로 간접 매핑)
