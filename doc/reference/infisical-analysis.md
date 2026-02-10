# Infisical 심층 분석

> 분석 기준일: 2026-02-10 | 대상 버전: Infisical Cloud (Latest)

## 1. 서비스 개요

**Infisical**은 MIT 라이선스 기반의 오픈소스 올인원 시크릿 관리 플랫폼이다.
시크릿, 인증서(PKI), 특권 접근 관리(PAM)를 하나의 플랫폼에서 제공한다.

| 항목 | 수치 |
|------|------|
| 일일 시크릿 처리량 | 5억+ 건 |
| 월간 개발자 시크릿 | 15억+ 건 |
| GitHub Stars | 11,111+ |
| 사용 조직 | Fortune 500, 국제 정부기관, 스타트업 |
| 라이선스 | MIT (오픈소스) |
| 셀프호스팅 | Docker / Kubernetes 지원 |

---

## 2. 핵심 기능 6가지

### 2-1. Secret Management (시크릿 관리)
- 환경별(Dev/Staging/Prod) 시크릿 저장·배포·동기화
- 시크릿 버전 관리 + Point-in-time Recovery (Pro)
- 시크릿 레퍼런싱 (다른 시크릿 참조하여 값 조합)
- 시크릿 오버라이드 및 공유
- 자동 로테이션 (Pro)

### 2-2. Secret Scanning (시크릿 스캐닝)
- 코드·CI 파이프라인·인프라에서 하드코딩된 시크릿 탐지
- GitHub, GitLab, Bitbucket 통합

### 2-3. Certificate Management / PKI (인증서 관리)
- X.509 인증서 자동 발급·갱신
- Private CA 계층 관리
- Let's Encrypt, DigiCert, Microsoft AD CS 연동

### 2-4. Dynamic Secrets (동적 시크릿)
- 사용 시점에 생성되는 임시 자격증명 (Enterprise)
- AWS, GCP, Azure 임시 키 발급

### 2-5. KMS / HSM 지원
- KMIP 지원 (Enterprise)
- FIPS 140-3 준수 구성 가능

### 2-6. Privileged Access Management (PAM)
- SSH 접근: 단기 인증서 기반 정책 적용
- Just-in-time 접근 제어
- 특권 접근 전체 감사 추적

---

## 3. 가격 체계

| 항목 | Free | Pro | Enterprise |
|------|------|-----|-----------|
| **가격** | $0/월 | **$18/identity/월** | 커스텀 (데모 필요) |
| ID 수 | 5 | 무제한 | 무제한 |
| 프로젝트 | 3 | 무제한 | 무제한 |
| 환경 | 3 | 12 | 커스텀 |
| 통합 수 | 10 | 50 | 커스텀 |
| RBAC | - | O | O |
| SAML SSO | - | O | O |
| IP 허용목록 | - | O | O |
| 감사 로그 보관 | - | 90일 | 커스텀 |
| 동적 시크릿 | - | - | O |
| SCIM / LDAP | - | - | O |
| AI 보안 어드바이저 | - | - | O |
| 승인 워크플로 | - | - | O |
| 전담 지원 엔지니어 | - | - | O |
| SLA | - | - | 99.99% |

**참고**: 유료 티어에서도 API 요청 스파이크 시 쓰로틀링 적용됨.

---

## 4. UI/UX 특징

| 관점 | 평가 |
|------|------|
| 디자인 철학 | 개발자 우선 인터페이스 |
| 접근 방식 | 웹 대시보드 + CLI + API + SDK |
| 대시보드 기능 | 프로젝트/환경 전환, 시크릿 CRUD, 통합 관리 |
| **시각화** | **서비스 맵/연결 시각화 없음** |
| 용어 수준 | 전문가 수준 (Identity, RBAC, PKI, SCIM 등) |
| 다크 모드 | 지원 |

**핵심 한계**: 시크릿 값의 **관계**나 **연결 상태**를 시각적으로 보여주지 않음.
프로젝트 간 시크릿이 어떤 서비스와 연결되는지 파악하려면 수동 확인 필요.

---

## 5. 온보딩 복잡도

### 리소스 계층 구조 (5단계)
```
Organization (빌링 단위)
└── Projects
    └── Environments (Dev, Staging, Prod - 커스터마이즈 가능)
        └── Folders (선택적 하위 구조)
            └── Secrets
```

### 온보딩 과정
1. Infisical Cloud 가입 또는 Docker로 셀프호스팅
2. CLI 설치: `npm install -g @infisical/cli`
3. 인증: `infisical login`
4. 프로젝트 초기화: `infisical init` (`.infisical.json` 생성)
5. 환경별 시크릿 관리 시작

### 초보자 장벽
| 문제점 | 상세 |
|--------|------|
| CLI 필수 | 개발 환경 시크릿 주입에 CLI가 사실상 필수 |
| Windows 이슈 | PowerShell 권한 조정 필요, VSCode에서만 CLI 동작 |
| Unix/Linux 이슈 | 시스템 키체인(keyctl) 저장 불가, 파일 기반 저장 필요 |
| 개념 복잡도 | Organization → Project → Environment → Folder → Secret 5단계 이해 필요 |
| 추정 온보딩 시간 | **30분~1시간** (클라우드 기준, 셀프호스팅은 수시간) |

---

## 6. 보안 아키텍처

| 항목 | 내용 |
|------|------|
| 암호화 | AES-GCM-256 |
| SOC 2 | O (Enterprise) |
| HIPAA | O (Enterprise) |
| FIPS 140-3 | 구성 가능 (Enterprise) |
| 침투 테스트 | 연 2회 |
| ISO 27001 | **미보유** |
| PCI-DSS | **미보유** |
| GDPR | **명시적 확인 없음** |

---

## 7. 통합 (50+ Integrations)

| 분류 | 서비스 |
|------|--------|
| 클라우드 | AWS, Azure, GCP |
| CI/CD | GitHub Actions, GitLab CI/CD, Jenkins, CircleCI |
| 인프라 | Kubernetes (네이티브 Operator + ESO), Terraform, Ansible, Docker |
| 프레임워크 | Next.js, Express, Django |
| 배포 플랫폼 | Vercel, Netlify, Railway |
| 기타 | Checkly, HashiCorp Vault, Supabase |

---

## 8. Linkmap과의 비교표

| 기능 | Infisical | Linkmap |
|------|-----------|---------|
| **핵심 가치** | 올인원 시크릿 관리 | 서비스 연결 시각화 + 환경변수 관리 |
| **타깃 사용자** | DevOps/보안 엔지니어 | 바이브코딩 초보자 |
| **서비스 맵 시각화** | ❌ 없음 | ✅ React Flow 기반 |
| **서비스 카탈로그** | ❌ 없음 | ✅ 23+ 서비스 템플릿 |
| **설정 마법사** | ❌ 없음 | ✅ 5단계 가이드 |
| **.env 파일 임포트** | CLI 기반 | ✅ UI 드래그&드롭 |
| **헬스 체크** | ❌ 없음 | ✅ 8개 어댑터 + 제네릭 |
| **시크릿 버전 관리** | ✅ (Pro) | ❌ 없음 |
| **시크릿 레퍼런싱** | ✅ (조합 변수) | ❌ 없음 |
| **Point-in-time 복구** | ✅ (Pro) | ❌ 없음 |
| **승인 워크플로** | ✅ (Enterprise) | ❌ 없음 |
| **동적 시크릿** | ✅ (Enterprise) | ❌ 없음 |
| **PKI / 인증서** | ✅ | ❌ 없음 |
| **RBAC** | ✅ (Pro) | ✅ 팀 RBAC |
| **감사 로그** | ✅ (90일 Pro) | ✅ 무제한 |
| **암호화** | AES-GCM-256 | AES-GCM-256 |
| **가격 (유료)** | $18/identity/월 (~₩25,000) | ₩9,900/월 |
| **무료 티어** | 5 ID, 3 프로젝트 | 3 프로젝트, 20 환경변수 |
| **한국어 UI** | ❌ 영어만 | ✅ Korean-first |
| **MCP 서버** | ❌ 없음 | ✅ AI 도구 연동 |
| **초보자 친화도** | ★★☆☆☆ | ★★★★★ |

---

## 9. 벤치마킹 포인트

Infisical에서 Linkmap이 참고할 만한 기능:

### 9-1. Secret Versioning (시크릿 버전 관리)
- **Infisical 방식**: 모든 시크릿 변경을 버전으로 기록, 이전 버전 비교·복원
- **Linkmap 적용**: 초보자용 **"되돌리기"** 기능으로 단순화
  - "이전 값으로 되돌리기" 버튼
  - 최근 5개 변경 이력만 보여주기 (정보 과부하 방지)

### 9-2. Secret Reference (시크릿 레퍼런싱)
- **Infisical 방식**: `${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}` 패턴으로 시크릿 조합
- **Linkmap 적용**: **DATABASE_URL 자동 조합** 기능
  - 서비스 템플릿에서 필요한 환경변수를 연결하면 자동으로 URL 생성
  - 예: Supabase 연결 시 → `postgresql://[user]:[password]@[host]:5432/[db]` 자동 생성

### 9-3. Point-in-time Recovery
- **Infisical 방식**: 특정 시점으로 전체 환경변수 롤백
- **Linkmap 적용**: **"스냅샷"** 기능으로 단순화
  - 배포 전 자동 스냅샷 저장
  - "이전 배포 상태로 복원" 원클릭

### 9-4. Approval Workflow (승인 워크플로)
- **Infisical 방식**: 시크릿 변경 시 팀원 승인 필요 (Enterprise)
- **Linkmap 적용**: 팀 플랜에서 **"변경 확인"** 기능
  - 프로덕션 환경변수 변경 시 알림 발송
  - 슬랙/이메일 알림으로 시작 (승인 프로세스는 추후)

---

## 참고 자료

- [Infisical 공식 사이트](https://infisical.com/)
- [Infisical GitHub](https://github.com/Infisical/infisical)
- [Infisical 가격](https://infisical.com/pricing)
- [Infisical 보안 문서](https://infisical.com/docs/internals/security)
- [Infisical CLI 문서](https://infisical.com/docs/cli/project-config)
- [Infisical vs Doppler 비교](https://infisical.com/infisical-vs-doppler)
