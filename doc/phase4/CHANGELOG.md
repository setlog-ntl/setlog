# Phase 4 CHANGELOG

## 신규 파일

### 마법사
- `src/components/service/setup-wizard.tsx` - 5단계 설정 마법사
  - Step 1: 서비스 정보 (이름, 설명, 문서 링크, 필요 env vars)
  - Step 2: 환경 선택 (development/staging/production)
  - Step 3: 인증값 입력 (required_env_vars 기반 자동 폼)
  - Step 4: 연결 검증 (useRunHealthCheck 자동 실행)
  - Step 5: 완료 (성공/실패 결과)

### .env 임포트
- `src/components/service/env-import-dialog.tsx` - .env 파일 일괄 가져오기
  - 텍스트 영역에 붙여넣기
  - 자동 파싱: #주석/빈줄 스킵, = 기준 분리, 따옴표 제거
  - NEXT_PUBLIC_ 접두사 → 공개, 나머지 → 비밀 자동 판별
  - 미리보기 테이블 표시
- `src/app/api/env/bulk/route.ts` - 일괄 생성 API
  - Rate limit: 10회/분
  - 최대 50개 변수 일괄 처리
  - 감사 로그: env_var.bulk_create
- `src/lib/validations/env-bulk.ts` - Zod 스키마

## 수정 파일
- `src/app/project/[id]/services/page.tsx` - "빠른 설정" 버튼 + SetupWizard 연동
- `src/app/project/[id]/env/page.tsx` - ".env 가져오기" 버튼 + EnvImportDialog 연동
- `src/app/project/[id]/page.tsx` - 스마트 서비스 제안 카드 (env key → 카탈로그 매칭)
