# Phase 4: 쉬운 설정 마법사

## 목적
"쉽게 설정할 수 있고"

## 기능 요구사항

### 4-1. 서비스 연결 마법사
- `src/components/service/setup-wizard.tsx`
- 5단계: 서비스 정보 → 환경 선택 → 인증값 입력 → 연결 검증 → 완료
- `required_env_vars` 템플릿으로 폼 자동 생성
- 저장 후 `useRunHealthCheck()`로 자동 검증

### 4-2. .env 파일 일괄 임포트
- `src/components/service/env-import-dialog.tsx`
- `POST /api/env/bulk` API
- Zod 스키마: `src/lib/validations/env-bulk.ts`
- 텍스트 영역에 .env 내용 붙여넣기 → 파싱 → 미리보기 → 일괄 생성
- 감사 로그: `env_var.bulk_create`

### 4-3. 스마트 서비스 제안
- 개요 페이지에서 env var 키명 ↔ 서비스 카탈로그 매칭
- "OPENAI_API_KEY 키가 있지만 OpenAI 서비스가 연결되지 않았습니다" 형태
