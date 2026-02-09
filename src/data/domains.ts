import type { ServiceDomain } from '@/types';

export interface DomainSeed {
  id: ServiceDomain;
  name: string;
  name_ko: string;
  description: string;
  description_ko: string;
  icon_name: string;
  order_index: number;
}

export const domains: DomainSeed[] = [
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    name_ko: '인프라',
    description: 'Deployment, CDN, serverless, and hosting services',
    description_ko: '배포, CDN, 서버리스, 호스팅 서비스',
    icon_name: 'Server',
    order_index: 1,
  },
  {
    id: 'backend',
    name: 'Backend',
    name_ko: '백엔드',
    description: 'Database, authentication, storage, and caching services',
    description_ko: '데이터베이스, 인증, 스토리지, 캐싱 서비스',
    icon_name: 'Database',
    order_index: 2,
  },
  {
    id: 'devtools',
    name: 'Dev Tools',
    name_ko: '개발자 도구',
    description: 'CI/CD, testing, and code quality tools',
    description_ko: 'CI/CD, 테스팅, 코드 품질 도구',
    icon_name: 'Wrench',
    order_index: 3,
  },
  {
    id: 'communication',
    name: 'Communication',
    name_ko: '커뮤니케이션',
    description: 'Email, SMS, push notifications, and chat services',
    description_ko: '이메일, SMS, 푸시 알림, 채팅 서비스',
    icon_name: 'MessageSquare',
    order_index: 4,
  },
  {
    id: 'business',
    name: 'Business',
    name_ko: '비즈니스',
    description: 'Payment, CMS, analytics, search, and e-commerce services',
    description_ko: '결제, CMS, 분석, 검색, 이커머스 서비스',
    icon_name: 'Briefcase',
    order_index: 5,
  },
  {
    id: 'ai_ml',
    name: 'AI & ML',
    name_ko: 'AI & ML',
    description: 'LLM, vision, voice, and machine learning services',
    description_ko: 'LLM, 비전, 음성, 머신러닝 서비스',
    icon_name: 'Brain',
    order_index: 6,
  },
  {
    id: 'observability',
    name: 'Observability',
    name_ko: '관찰성',
    description: 'Monitoring, logging, and feature flag services',
    description_ko: '모니터링, 로깅, 피처 플래그 서비스',
    icon_name: 'Eye',
    order_index: 7,
  },
  {
    id: 'integration',
    name: 'Integration',
    name_ko: '통합',
    description: 'Message queues, scheduling, and automation services',
    description_ko: '메시지 큐, 스케줄링, 자동화 서비스',
    icon_name: 'Plug',
    order_index: 8,
  },
];
