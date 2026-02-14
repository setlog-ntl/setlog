export interface SkillItem {
  name: string;
  icon?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface ExperienceItem {
  title: string;
  titleEn?: string;
  company: string;
  companyEn?: string;
  period: string;
  periodEn?: string;
  description: string;
  descriptionEn?: string;
}

export interface BlogPost {
  title: string;
  titleEn?: string;
  url: string;
  date: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  descriptionEn?: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
}

const DEMO_SKILLS: SkillItem[] = [
  { name: 'TypeScript', level: 'advanced' },
  { name: 'React', level: 'advanced' },
  { name: 'Next.js', level: 'advanced' },
  { name: 'Node.js', level: 'intermediate' },
  { name: 'Python', level: 'intermediate' },
  { name: 'Docker', level: 'intermediate' },
  { name: 'PostgreSQL', level: 'intermediate' },
  { name: 'AWS', level: 'beginner' },
];

const DEMO_EXPERIENCE: ExperienceItem[] = [
  {
    title: '프론트엔드 개발자',
    titleEn: 'Frontend Developer',
    company: 'ABC 테크',
    companyEn: 'ABC Tech',
    period: '2024 - 현재',
    periodEn: '2024 - Present',
    description: 'React, Next.js 기반 웹 애플리케이션 개발. 디자인 시스템 구축 및 성능 최적화.',
    descriptionEn: 'Web application development with React & Next.js. Built design system and optimized performance.',
  },
  {
    title: '웹 개발 인턴',
    titleEn: 'Web Development Intern',
    company: 'XYZ 스타트업',
    companyEn: 'XYZ Startup',
    period: '2023 - 2024',
    periodEn: '2023 - 2024',
    description: 'Full-stack 웹 개발. REST API 설계 및 프론트엔드 UI 구현.',
    descriptionEn: 'Full-stack web development. Designed REST APIs and implemented frontend UI.',
  },
  {
    title: '컴퓨터공학 전공',
    titleEn: 'Computer Science Major',
    company: '한국대학교',
    companyEn: 'Korea University',
    period: '2019 - 2023',
    periodEn: '2019 - 2023',
    description: '컴퓨터공학 학사. 졸업 프로젝트: AI 기반 코드 리뷰 도구 개발.',
    descriptionEn: 'B.S. in Computer Science. Capstone: AI-powered code review tool.',
  },
];

const DEMO_PROJECTS: ProjectItem[] = [
  {
    name: 'awesome-react-hooks',
    description: '실무에서 자주 사용하는 커스텀 React 훅 모음',
    descriptionEn: 'Collection of custom React hooks for production use',
    url: 'https://github.com',
    language: 'TypeScript',
    stars: 142,
    forks: 23,
  },
  {
    name: 'nextjs-blog-starter',
    description: 'MDX 기반 블로그 스타터 템플릿 (다크모드, SEO)',
    descriptionEn: 'MDX-based blog starter template (dark mode, SEO)',
    url: 'https://github.com',
    language: 'TypeScript',
    stars: 89,
    forks: 15,
  },
  {
    name: 'python-ml-toolkit',
    description: '머신러닝 전처리 유틸리티 라이브러리',
    descriptionEn: 'Machine learning preprocessing utility library',
    url: 'https://github.com',
    language: 'Python',
    stars: 56,
    forks: 8,
  },
  {
    name: 'docker-dev-env',
    description: '개발 환경 Docker Compose 템플릿 모음',
    descriptionEn: 'Collection of Docker Compose templates for dev environments',
    url: 'https://github.com',
    language: 'Dockerfile',
    stars: 34,
    forks: 12,
  },
  {
    name: 'cli-todo-app',
    description: 'Rust로 만든 터미널 할일 관리 앱',
    descriptionEn: 'Terminal todo app built with Rust',
    url: 'https://github.com',
    language: 'Rust',
    stars: 28,
    forks: 5,
  },
  {
    name: 'api-rate-limiter',
    description: 'Express.js 미들웨어 기반 API 속도 제한기',
    descriptionEn: 'Express.js middleware-based API rate limiter',
    url: 'https://github.com',
    language: 'JavaScript',
    stars: 21,
    forks: 3,
  },
];

function parseJSON<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || '김개발',
  nameEn: process.env.NEXT_PUBLIC_SITE_NAME_EN || 'Gaebal Kim',
  githubUsername: process.env.NEXT_PUBLIC_GITHUB_USERNAME || null,
  tagline: process.env.NEXT_PUBLIC_TAGLINE || '풀스택 개발자 | 오픈소스 기여자',
  taglineEn: process.env.NEXT_PUBLIC_TAGLINE_EN || 'Full-Stack Developer | Open Source Contributor',
  about:
    process.env.NEXT_PUBLIC_ABOUT ||
    '안녕하세요! 웹 기술에 열정을 가진 풀스택 개발자입니다. React와 Next.js를 주로 사용하며, 오픈소스 프로젝트에 기여하는 것을 좋아합니다. 사용자 경험을 개선하고 깔끔한 코드를 작성하는 데 집중합니다.',
  aboutEn:
    process.env.NEXT_PUBLIC_ABOUT_EN ||
    "Hi! I'm a full-stack developer passionate about web technologies. I primarily work with React and Next.js, and love contributing to open source projects. I focus on improving user experience and writing clean code.",
  skills: parseJSON<SkillItem[]>(process.env.NEXT_PUBLIC_SKILLS, DEMO_SKILLS),
  experience: parseJSON<ExperienceItem[]>(process.env.NEXT_PUBLIC_EXPERIENCE, DEMO_EXPERIENCE),
  projects: DEMO_PROJECTS,
  blogPosts: parseJSON<BlogPost[] | null>(process.env.NEXT_PUBLIC_BLOG_POSTS, null),
  resumeUrl: process.env.NEXT_PUBLIC_RESUME_URL || null,
  email: process.env.NEXT_PUBLIC_EMAIL || null,
  linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL || null,
  gaId: process.env.NEXT_PUBLIC_GA_ID || null,
};

export type SiteConfig = typeof siteConfig;
