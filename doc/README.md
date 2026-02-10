# Linkmap 서비스 비전 실현

## 비전
인증키/설정값을 안전하게 저장하고, 쉽게 확인·변경하며, 연결된 서비스의 동작을 검증하고, 진행상태 로그를 한눈에 관리하는 플랫폼

## Phase 요약

| Phase | 이름 | 목적 | 상태 |
|-------|------|------|------|
| 1 | 기반 UX 개선 + 감사 로그 뷰어 | 쉽게 확인·변경 + 로그 확인 기반 | ✅ 완료 |
| 2 | 서비스 연결 검증 시스템 | 자동 Health Check | ✅ 완료 |
| 3 | 통합 모니터링 대시보드 | 한눈에 관리 | ✅ 완료 |
| 4 | 쉬운 설정 마법사 | 쉬운 설정 | ✅ 완료 |

## 기술 스택
- Next.js 16 (App Router) + Supabase + TypeScript + Tailwind CSS + shadcn/ui
- AES-256-GCM 암호화, React Flow, TanStack Query, Zustand, Zod v4

## 의존성 그래프
```
Phase 1 (기반 UX + 감사 로그)
    ↓
Phase 2 (Health Check 시스템) ← Phase 1의 복호화 패턴, 감사 로그 패턴
    ↓
Phase 3 (모니터링 대시보드) ← Phase 2의 health check 데이터/훅
Phase 4 (설정 마법사)        ← Phase 2 검증 + Phase 3 컴포넌트 재활용
```
